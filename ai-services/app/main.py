import hashlib
import logging
import os
import time

import numpy as np
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from rapidfuzz import fuzz
from sklearn.ensemble import IsolationForest

from app.ml.model_store import (
    predict_username_similarity,
    predict_text_similarity,
    predict_image_similarity,
)

app = FastAPI(title="ShadowGraph AI Services", version="1.0.0")
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper(), logging.INFO),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("shadowgraph.ai")


class PairInput(BaseModel):
    left: str
    right: str


class ImageInput(BaseModel):
    image_url: str


class ImagePairInput(BaseModel):
    image_a: str
    image_b: str


class FeaturesInput(BaseModel):
    features: list[list[float]]


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "ai-services"}


@app.get("/health/ai")
async def health_ai() -> dict:
    return {"status": "ok", "service": "ai"}


@app.middleware("http")
async def request_logging_middleware(request, call_next):
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000
    logger.info("%s %s -> %s in %.2fms", request.method, request.url.path, response.status_code, elapsed_ms)
    return response


@app.post("/image-embedding")
async def image_embedding(payload: ImageInput) -> dict:
    # Deterministic pseudo-embedding for demo while keeping a torch inference path.
    digest = hashlib.sha256(payload.image_url.encode()).digest()
    raw = np.frombuffer(digest * 8, dtype=np.uint8)[:512].astype(np.float32)
    tensor = torch.tensor(raw) / 255.0
    embedding = torch.nn.functional.normalize(tensor, dim=0).tolist()
    return {"embedding": embedding}


@app.post("/username-similarity")
async def username_similarity(payload: PairInput) -> dict:
    try:
        score = predict_username_similarity(payload.left, payload.right)
    except Exception:
        # Fallback heuristic if model artifacts are missing.
        fuzzy = fuzz.ratio(payload.left, payload.right) / 100.0
        a = np.array([ord(c) for c in payload.left.lower()], dtype=np.float32)
        b = np.array([ord(c) for c in payload.right.lower()], dtype=np.float32)
        dim = max(len(a), len(b), 1)
        a = np.pad(a, (0, dim - len(a)))
        b = np.pad(b, (0, dim - len(b)))
        emb = float(np.dot(a, b) / ((np.linalg.norm(a) * np.linalg.norm(b)) + 1e-8))
        score = float(np.clip(0.6 * fuzzy + 0.4 * emb, 0.0, 1.0))
    return {"score": round(score, 4)}


@app.post("/stylometric-similarity")
async def stylometric_similarity(payload: PairInput) -> dict:
    try:
        similarity = predict_text_similarity(payload.left, payload.right)
        return {"score": round(float(np.clip(similarity, 0.0, 1.0)), 4)}
    except Exception:
        def features(txt: str) -> np.ndarray:
            words = txt.split()
            avg_word_len = np.mean([len(w) for w in words]) if words else 0
            punctuation_ratio = sum(1 for c in txt if c in ".,;:!?") / (len(txt) + 1e-8)
            uppercase_ratio = sum(1 for c in txt if c.isupper()) / (len(txt) + 1e-8)
            return np.array([avg_word_len, punctuation_ratio, uppercase_ratio], dtype=np.float32)

        l_vec = features(payload.left)
        r_vec = features(payload.right)
        similarity = float(np.dot(l_vec, r_vec) / ((np.linalg.norm(l_vec) * np.linalg.norm(r_vec)) + 1e-8))
        return {"score": round(float(np.clip(similarity, 0.0, 1.0)), 4)}


@app.post("/image-similarity")
async def image_similarity(payload: ImagePairInput) -> dict:
    try:
        score = predict_image_similarity(payload.image_a, payload.image_b)
    except Exception:
        score = 0.5
    return {"score": round(float(np.clip(score, 0.0, 1.0)), 4)}


@app.post("/anomaly-detection")
async def anomaly_detection(payload: FeaturesInput) -> dict:
    x = np.array(payload.features, dtype=np.float32)
    if len(x) < 2:
        return {"scores": [0.0 for _ in payload.features]}
    model = IsolationForest(contamination=0.25, random_state=42)
    model.fit(x)
    scores = -model.score_samples(x)
    scores = (scores - scores.min()) / (scores.max() - scores.min() + 1e-8)
    return {"scores": [round(float(s), 4) for s in scores.tolist()]}


@app.post("/ai/username-similarity")
async def username_similarity_v2(payload: PairInput) -> dict:
    return await username_similarity(payload)


@app.post("/ai/text-similarity")
async def text_similarity_v2(payload: PairInput) -> dict:
    return await stylometric_similarity(payload)


@app.post("/ai/image-similarity")
async def image_similarity_v2(payload: ImagePairInput) -> dict:
    return await image_similarity(payload)
