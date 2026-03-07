from fastapi import APIRouter

from app.services.ai_client import username_similarity, stylometric_similarity, anomaly_score

router = APIRouter()


@router.post("/username-similarity")
async def username_similarity_proxy(payload: dict) -> dict:
    score = await username_similarity(payload["left"], payload["right"])
    return {"score": score}


@router.post("/stylometric-similarity")
async def stylometric_similarity_proxy(payload: dict) -> dict:
    score = await stylometric_similarity(payload["left"], payload["right"])
    return {"score": score}


@router.post("/anomaly-detection")
async def anomaly_proxy(payload: dict) -> dict:
    scores = await anomaly_score(payload["features"])
    return {"scores": scores}
