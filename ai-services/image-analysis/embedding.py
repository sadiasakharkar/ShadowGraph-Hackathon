"""Image analysis helpers used by the AI service."""

import hashlib
import numpy as np


def deterministic_embedding(image_url: str, dim: int = 512) -> list[float]:
    digest = hashlib.sha256(image_url.encode()).digest()
    values = np.frombuffer(digest * ((dim // len(digest)) + 1), dtype=np.uint8)[:dim]
    emb = values.astype(np.float32) / 255.0
    norm = np.linalg.norm(emb) + 1e-8
    return (emb / norm).tolist()
