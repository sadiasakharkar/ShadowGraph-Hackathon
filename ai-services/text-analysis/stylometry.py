"""Stylometry utilities for text fingerprinting."""

import numpy as np


def stylometric_vector(text: str) -> np.ndarray:
    words = text.split()
    avg_word_len = np.mean([len(w) for w in words]) if words else 0.0
    punctuation_ratio = sum(1 for c in text if c in ".,;:!?") / (len(text) + 1e-8)
    uppercase_ratio = sum(1 for c in text if c.isupper()) / (len(text) + 1e-8)
    return np.array([avg_word_len, punctuation_ratio, uppercase_ratio], dtype=np.float32)
