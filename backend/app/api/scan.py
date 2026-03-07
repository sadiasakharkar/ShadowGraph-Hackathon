import json
from fastapi import APIRouter, Depends, HTTPException, Query

from app.models.schemas import ScanStartRequest
from app.security.deps import get_current_user_id
from app.services import db
from app.services.scan_queue import enqueue_scan_job

router = APIRouter()


@router.post("/scan/start")
async def start_scan(payload: ScanStartRequest, user_id: str = Depends(get_current_user_id)) -> dict:
    scan_id = await enqueue_scan_job(user_id, payload.model_dump())
    return {"scan_id": scan_id, "status": "queued"}


@router.get("/scan/status")
async def scan_status(scan_id: str = Query(...), user_id: str = Depends(get_current_user_id)) -> dict:
    cached = await db.redis_client.get(f"scan_status:{scan_id}") if db.redis_client else None
    if cached:
        data = json.loads(cached)
        if data.get("scan_id") == scan_id:
            return data

    status_doc = await db.mongo_db.scan_jobs.find_one({"scan_id": scan_id, "user_id": user_id}, {"_id": 0})
    if not status_doc:
        raise HTTPException(status_code=404, detail="Scan not found")
    return status_doc


@router.get("/scan/results")
async def scan_results(scan_id: str = Query(...), user_id: str = Depends(get_current_user_id)) -> dict:
    result = await db.mongo_db.scan_pipeline_results.find_one({"scan_id": scan_id, "user_id": user_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Results not ready")
    return result
