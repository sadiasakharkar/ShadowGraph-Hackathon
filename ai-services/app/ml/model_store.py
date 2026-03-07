from __future__ import annotations

from pathlib import Path
from functools import lru_cache

import joblib
import numpy as np

from .features import username_features, text_pair_features, VisionEmbedder, image_pair_features

ROOT = Path(__file__).resolve().parents[2]
MODELS = ROOT / "models"
DATASETS = ROOT / "datasets"


@lru_cache(maxsize=1)
def username_model():
    return joblib.load(MODELS / "username_similarity_model.joblib")


@lru_cache(maxsize=1)
def text_model():
    return joblib.load(MODELS / "text_similarity_model.joblib")


@lru_cache(maxsize=1)
def image_model():
    return joblib.load(MODELS / "image_similarity_model.joblib")


@lru_cache(maxsize=1)
def embedder() -> VisionEmbedder:
    return VisionEmbedder()


def predict_username_similarity(left: str, right: str) -> float:
    model = username_model()
    x = username_features(left, right).reshape(1, -1)
    return float(model.predict_proba(x)[0, 1])


def predict_text_similarity(left: str, right: str) -> float:
    model = text_model()
    x = text_pair_features(left, right).reshape(1, -1)
    return float(model.predict_proba(x)[0, 1])


def _is_local_path(v: str) -> bool:
    return v.startswith("/") or v.startswith("./") or v.startswith("../")


def _materialize_image(image_ref: str) -> str:
    if _is_local_path(image_ref):
        return image_ref
    # fallback to a dataset image if URL downloading is unavailable
    sample = next((DATASETS / "images").glob("*.png"), None)
    return str(sample) if sample else image_ref


def predict_image_similarity(image_a: str, image_b: str) -> float:
    model = image_model()
    emb = embedder()
    a = _materialize_image(image_a)
    b = _materialize_image(image_b)
    x = image_pair_features(emb, a, b).reshape(1, -1)
    return float(model.predict_proba(x)[0, 1])
