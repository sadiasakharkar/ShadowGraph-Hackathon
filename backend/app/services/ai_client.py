import os
import httpx

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8100")


async def username_similarity(left: str, right: str) -> float:
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(f"{AI_SERVICE_URL}/username-similarity", json={"left": left, "right": right})
        r.raise_for_status()
        return r.json()["score"]


async def stylometric_similarity(left: str, right: str) -> float:
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(f"{AI_SERVICE_URL}/stylometric-similarity", json={"left": left, "right": right})
        r.raise_for_status()
        return r.json()["score"]


async def anomaly_score(features: list[list[float]]) -> list[float]:
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(f"{AI_SERVICE_URL}/anomaly-detection", json={"features": features})
        r.raise_for_status()
        return r.json()["scores"]
