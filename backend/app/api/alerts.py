from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.graph.identity_graph import read_latest_graph
from app.security.deps import get_current_user_id
from app.services import db
from app.services.defense import build_defense_playbooks
from app.services.threat_simulation import simulate_identity_attacks

router = APIRouter()


def _serialize_alert(doc: dict[str, Any]) -> dict[str, Any]:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    return out


async def _sync_generated_alerts(user_id: str) -> None:
    latest_scan = await db.mongo_db.scan_results.find_one({"user_id": user_id}, sort=[("_id", -1)])
    latest_graph = await read_latest_graph(user_id)
    analysis = simulate_identity_attacks(latest_graph.get("nodes", []), latest_graph.get("edges", []))
    playbooks = build_defense_playbooks((latest_scan or {}).get("risk", {}), analysis)

    for playbook in playbooks:
        existing = await db.mongo_db.defense_alerts.find_one(
            {
                "user_id": user_id,
                "alert_key": playbook["alert_key"],
                "state": {"$in": ["open", "acknowledged"]},
            }
        )
        if existing:
            await db.mongo_db.defense_alerts.update_one(
                {"_id": existing["_id"]},
                {"$set": {"severity": playbook["severity"], "recommendation": playbook["recommendation"], "updated_at": datetime.now(timezone.utc)}},
            )
            continue

        await db.mongo_db.defense_alerts.insert_one(
            {
                **playbook,
                "user_id": user_id,
                "graph_version_id": latest_graph.get("graph_version_id"),
                "risk_score": analysis.get("overall_risk_score", 0.0),
                "affected_nodes": analysis.get("affected_nodes", []),
                "source": "autonomous_defense_engine",
            }
        )


@router.get("/alerts")
@router.get("/api/alerts")
async def get_alerts(user_id: str = Depends(get_current_user_id)) -> dict:
    await _sync_generated_alerts(user_id)
    cursor = db.mongo_db.defense_alerts.find({"user_id": user_id}).sort([("updated_at", -1), ("created_at", -1)])
    alerts = [_serialize_alert(doc) async for doc in cursor]
    return {"alerts": alerts}


async def _update_alert_state(alert_id: str, user_id: str, target_state: str) -> dict:
    if not ObjectId.is_valid(alert_id):
        raise HTTPException(status_code=404, detail="Alert not found")

    existing = await db.mongo_db.defense_alerts.find_one({"_id": ObjectId(alert_id), "user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Alert not found")

    if target_state == "acknowledged" and existing.get("state") == "resolved":
        raise HTTPException(status_code=400, detail="Resolved alerts cannot be acknowledged")
    if target_state == "resolved" and existing.get("state") == "resolved":
        return {"alert": _serialize_alert(existing)}

    update_payload: dict[str, Any] = {"state": target_state, "updated_at": datetime.now(timezone.utc)}
    if target_state == "acknowledged":
        update_payload["acknowledged_at"] = datetime.now(timezone.utc)
    if target_state == "resolved":
        update_payload["resolved_at"] = datetime.now(timezone.utc)

    await db.mongo_db.defense_alerts.update_one({"_id": existing["_id"]}, {"$set": update_payload})
    updated = await db.mongo_db.defense_alerts.find_one({"_id": existing["_id"]})
    return {"alert": _serialize_alert(updated)}


@router.post("/alerts/{alert_id}/acknowledge")
@router.post("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, user_id: str = Depends(get_current_user_id)) -> dict:
    return await _update_alert_state(alert_id, user_id, "acknowledged")


@router.post("/alerts/{alert_id}/resolve")
@router.post("/api/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str, user_id: str = Depends(get_current_user_id)) -> dict:
    return await _update_alert_state(alert_id, user_id, "resolved")
