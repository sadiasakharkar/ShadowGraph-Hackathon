import json
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import APIRouter, Depends

from app.models.schemas import IdentitySignal, ScanRequest
from app.security.deps import get_current_user_id
from app.services import db
from app.services.twin_engine import build_seed_twin
from app.graph.identity_graph import upsert_graph
from app.services.risk import compute_risk
from app.services.ai_client import username_similarity

router = APIRouter()


@router.post("/signals")
async def submit_signal(payload: IdentitySignal, user_id: str = Depends(get_current_user_id)) -> dict:
    await db.mongo_db.identity_signals.insert_one({**payload.model_dump(), "user_id": user_id})
    return {"status": "accepted"}


@router.post("/scan")
async def run_identity_scan(payload: ScanRequest, user_id: str = Depends(get_current_user_id)) -> dict:
    scan_id = str(uuid4())
    graph_version_id = f"gv-{scan_id}"
    nodes, edges = build_seed_twin(payload.root_username)

    # Enrich suspicious account signal with AI username similarity scoring.
    for edge in edges:
        if edge.relation == "username_similarity":
            edge.score = await username_similarity(payload.root_username, f"{payload.root_username}_real")

    graph_meta = await upsert_graph(user_id, nodes, edges, graph_version_id=graph_version_id, scan_id=scan_id, source="manual_scan")
    await db.mongo_db.graph_versions.update_one(
        {"graph_version_id": graph_version_id, "user_id": user_id},
        {
            "$set": {
                "graph_version_id": graph_version_id,
                "scan_id": scan_id,
                "user_id": user_id,
                "identity_id": payload.root_username,
                "node_count": len(nodes),
                "edge_count": len(edges),
                "source": "manual_scan",
                "timestamp": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )

    risk = compute_risk(
        dup_prob=0.78,
        misuse_prob=0.62,
        deepfake=0.49,
        network=0.58,
    )
    await db.mongo_db.scan_results.insert_one(
        {
            "user_id": user_id,
            "risk": risk.model_dump(),
            "root": payload.root_username,
            "scan_id": scan_id,
            "graph_version_id": graph_version_id,
        }
    )

    if db.redis_client:
        await db.redis_client.setex(f"risk:{user_id}", 60, json.dumps(risk.model_dump()))

    return {"status": "completed", "scan_id": scan_id, "graph_version_id": graph_version_id, "graph": graph_meta, "risk": risk.model_dump()}


@router.get("/risk")
async def get_latest_risk(user_id: str = Depends(get_current_user_id)) -> dict:
    cached = await db.redis_client.get(f"risk:{user_id}") if db.redis_client else None
    if cached:
        return {"source": "cache", "risk": json.loads(cached)}

    last = await db.mongo_db.scan_results.find_one({"user_id": user_id}, sort=[("_id", -1)])
    return {"source": "mongo", "risk": (last or {}).get("risk", {})}
