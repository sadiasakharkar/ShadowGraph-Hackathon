from fastapi import APIRouter, Depends

from app.security.deps import get_current_user_id
from app.services import db
from app.services.defense import generate_defense_recommendations

router = APIRouter()


@router.get("")
async def get_alerts(user_id: str = Depends(get_current_user_id)) -> dict:
    latest = await db.mongo_db.scan_results.find_one({"user_id": user_id}, sort=[("_id", -1)])
    category = (latest or {}).get("risk", {}).get("category", "medium")
    alerts = generate_defense_recommendations(category)
    return {"alerts": [a.model_dump() for a in alerts]}
