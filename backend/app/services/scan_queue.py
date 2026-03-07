import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.graph.identity_graph import upsert_graph
from app.services import db
from app.services.ingestion.normalizer import normalize_signals
from app.services.ingestion.orchestrator import run_ingestion_adapters
from app.services.risk import compute_risk
from app.services.twin_engine import build_twin_from_normalized_signals

logger = logging.getLogger("shadowgraph.scan.queue")
SCAN_QUEUE_KEY = "scan_jobs"
_worker_task: asyncio.Task | None = None


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _json_safe(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_json_safe(v) for v in value]
    return value


async def enqueue_scan_job(user_id: str, identity_input: dict[str, Any]) -> str:
    scan_id = str(uuid4())
    job_doc = {
        "scan_id": scan_id,
        "user_id": user_id,
        "identity_input": identity_input,
        "status": "queued",
        "error": None,
        "created_at": utc_now(),
        "updated_at": utc_now(),
    }
    await db.mongo_db.scan_jobs.update_one({"scan_id": scan_id, "user_id": user_id}, {"$set": job_doc}, upsert=True)

    payload = json.dumps({"scan_id": scan_id, "user_id": user_id, "identity_input": identity_input})
    if db.redis_client:
        await db.redis_client.lpush(SCAN_QUEUE_KEY, payload)
        await db.redis_client.set(f"scan_status:{scan_id}", json.dumps({"scan_id": scan_id, "status": "queued"}), ex=3600)
    else:
        # Fallback for environments where Redis is temporarily unavailable.
        asyncio.create_task(process_scan_job(json.loads(payload)))

    return scan_id


async def start_scan_worker() -> None:
    global _worker_task
    if _worker_task and not _worker_task.done():
        return
    _worker_task = asyncio.create_task(_scan_worker_loop())
    logger.info("Scan worker started")


async def stop_scan_worker() -> None:
    global _worker_task
    if _worker_task:
        _worker_task.cancel()
        try:
            await _worker_task
        except asyncio.CancelledError:
            pass
        logger.info("Scan worker stopped")


async def _update_scan_status(scan_id: str, user_id: str, status: str, extra: dict[str, Any] | None = None) -> None:
    payload = {"status": status, "updated_at": utc_now(), **(extra or {})}
    await db.mongo_db.scan_jobs.update_one({"scan_id": scan_id, "user_id": user_id}, {"$set": payload})
    if db.redis_client:
        cache_payload = _json_safe({"scan_id": scan_id, "status": status, **(extra or {})})
        await db.redis_client.set(f"scan_status:{scan_id}", json.dumps(cache_payload), ex=3600)


async def _scan_worker_loop() -> None:
    while True:
        try:
            if not db.redis_client:
                await asyncio.sleep(1)
                continue

            message = await db.redis_client.brpop(SCAN_QUEUE_KEY, timeout=2)
            if not message:
                continue
            _, payload = message
            job = json.loads(payload)
            await process_scan_job(job)
        except asyncio.CancelledError:
            break
        except Exception as exc:  # noqa: BLE001
            logger.exception("Scan worker loop error: %s", exc)
            await asyncio.sleep(1)


async def process_scan_job(job: dict[str, Any]) -> None:
    scan_id = job["scan_id"]
    user_id = job["user_id"]
    identity_input = job["identity_input"]

    try:
        await _update_scan_status(scan_id, user_id, "running", {"started_at": utc_now()})
        logger.info("Scan %s started for user=%s", scan_id, user_id)

        raw_signals = await run_ingestion_adapters(identity_input)
        for item in raw_signals:
            item.update({"scan_id": scan_id, "user_id": user_id, "captured_at": utc_now()})

        if raw_signals:
            await db.mongo_db.raw_identity_signals.insert_many(raw_signals)

        identity_id = identity_input.get("identity_id") or identity_input.get("username") or user_id
        normalized = normalize_signals(raw_signals, identity_id)
        for item in normalized:
            item.update({"scan_id": scan_id, "user_id": user_id})

        if normalized:
            await db.mongo_db.normalized_identity_signals.insert_many(normalized)

        graph_version_id = f"gv-{scan_id}"
        nodes, edges = build_twin_from_normalized_signals(identity_id, normalized)
        graph_meta = await upsert_graph(
            user_id,
            nodes,
            edges,
            graph_version_id=graph_version_id,
            scan_id=scan_id,
            source="scan_pipeline",
        )
        await db.mongo_db.graph_versions.update_one(
            {"graph_version_id": graph_version_id, "user_id": user_id},
            {
                "$set": {
                    "graph_version_id": graph_version_id,
                    "scan_id": scan_id,
                    "user_id": user_id,
                    "identity_id": identity_id,
                    "node_count": len(nodes),
                    "edge_count": len(edges),
                    "source": "scan_pipeline",
                    "timestamp": utc_now(),
                }
            },
            upsert=True,
        )

        suspicious_count = sum(1 for x in normalized if x.get("confidence_score", 0) < 0.65)
        total = max(len(normalized), 1)
        dup_prob = min(0.95, 0.25 + (suspicious_count / total))
        misuse_prob = min(0.9, 0.2 + (sum(1 for x in normalized if x.get("platform") == "image") / total))
        deepfake = min(0.85, 0.18 + (sum(1 for x in normalized if x.get("profile_image_url")) / total) * 0.4)
        network = min(0.9, 0.2 + (len({x.get("platform") for x in normalized}) / 10))
        risk = compute_risk(dup_prob=dup_prob, misuse_prob=misuse_prob, deepfake=deepfake, network=network)

        result_doc = {
            "scan_id": scan_id,
            "user_id": user_id,
            "identity_id": identity_id,
            "graph_version_id": graph_version_id,
            "raw_count": len(raw_signals),
            "normalized_count": len(normalized),
            "graph": {"nodes": len(nodes), "edges": len(edges), "version": graph_meta},
            "risk": risk.model_dump(),
            "completed_at": utc_now(),
        }

        await db.mongo_db.scan_pipeline_results.update_one(
            {"scan_id": scan_id, "user_id": user_id},
            {"$set": result_doc},
            upsert=True,
        )
        await db.mongo_db.scan_results.insert_one({"user_id": user_id, "risk": risk.model_dump(), "root": identity_id, "scan_id": scan_id})

        await _update_scan_status(scan_id, user_id, "completed", {"completed_at": utc_now(), "result": result_doc})
        logger.info("Scan %s completed: raw=%d normalized=%d", scan_id, len(raw_signals), len(normalized))
    except Exception as exc:  # noqa: BLE001
        logger.exception("Scan %s failed: %s", scan_id, exc)
        await _update_scan_status(scan_id, user_id, "failed", {"error": str(exc), "failed_at": utc_now()})
