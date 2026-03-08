import re
import string
from pathlib import Path

import numpy as np
from PIL import Image
from rapidfuzz import fuzz


def username_features(left: str, right: str) -> np.ndarray:
    l = left.lower().strip()
    r = right.lower().strip()
    return np.array(
        [
            fuzz.ratio(l, r) / 100.0,
            fuzz.partial_ratio(l, r) / 100.0,
            fuzz.token_sort_ratio(l, r) / 100.0,
            abs(len(l) - len(r)) / max(len(l), len(r), 1),
            sum(1 for c in set(l) if c in set(r)) / max(len(set(l + r)), 1),
        ],
        dtype=np.float32,
    )


def _token_stats(text: str) -> tuple[float, float, float, float, float]:
    tokens = re.findall(r"[A-Za-z']+", text.lower())
    token_count = len(tokens)
    unique_ratio = len(set(tokens)) / max(token_count, 1)
    avg_word_len = float(np.mean([len(t) for t in tokens])) if tokens else 0.0
    sentence_count = max(len(re.findall(r"[.!?]", text)), 1)
    avg_sentence_len = token_count / sentence_count
    punct_ratio = sum(1 for c in text if c in string.punctuation) / max(len(text), 1)
    uppercase_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    return avg_sentence_len, unique_ratio, avg_word_len, punct_ratio, uppercase_ratio


def _char_ngram_jaccard(left: str, right: str, n: int = 3) -> float:
    if len(left) < n or len(right) < n:
        return 0.0
    lset = {left[i : i + n] for i in range(len(left) - n + 1)}
    rset = {right[i : i + n] for i in range(len(right) - n + 1)}
    inter = len(lset & rset)
    union = len(lset | rset)
    return inter / max(union, 1)


def text_pair_features(left: str, right: str) -> np.ndarray:
    lf = np.array(_token_stats(left), dtype=np.float32)
    rf = np.array(_token_stats(right), dtype=np.float32)
    diff = np.abs(lf - rf)
    cos = float(np.dot(lf, rf) / ((np.linalg.norm(lf) * np.linalg.norm(rf)) + 1e-8))
    left_norm = left.lower().strip()
    right_norm = right.lower().strip()
    left_tokens = set(re.findall(r"[A-Za-z']+", left_norm))
    right_tokens = set(re.findall(r"[A-Za-z']+", right_norm))
    token_jaccard = len(left_tokens & right_tokens) / max(len(left_tokens | right_tokens), 1)
    length_ratio = min(len(left_norm), len(right_norm)) / max(len(left_norm), len(right_norm), 1)
    fuzz_ratio = fuzz.ratio(left_norm, right_norm) / 100.0
    partial_ratio = fuzz.partial_ratio(left_norm, right_norm) / 100.0
    trigram_jaccard = _char_ngram_jaccard(left_norm, right_norm, n=3)
    return np.concatenate(
        [
            lf,
            rf,
            diff,
            np.array([cos, token_jaccard, length_ratio, fuzz_ratio, partial_ratio, trigram_jaccard], dtype=np.float32),
        ],
        axis=0,
    )


class VisionEmbedder:
    def __init__(self) -> None:
        # Lightweight deterministic image embedding to avoid runtime GPU/OpenMP issues in constrained environments.
        self.resize = (96, 96)

    def embed_path(self, image_path: str) -> np.ndarray:
        img = Image.open(Path(image_path)).convert("RGB").resize(self.resize)
        arr = np.asarray(img, dtype=np.float32) / 255.0

        # Channel stats.
        means = arr.mean(axis=(0, 1))
        stds = arr.std(axis=(0, 1))

        # Color distribution histograms.
        hists = []
        for c in range(3):
            hist, _ = np.histogram(arr[:, :, c], bins=16, range=(0.0, 1.0), density=True)
            hists.append(hist.astype(np.float32))

        # Texture-like gradient magnitude summary.
        gx = np.diff(arr, axis=1, append=arr[:, -1:, :])
        gy = np.diff(arr, axis=0, append=arr[-1:, :, :])
        grad = np.sqrt((gx**2 + gy**2).sum(axis=2))
        grad_stats = np.array([grad.mean(), grad.std(), np.percentile(grad, 90)], dtype=np.float32)

        emb = np.concatenate([means, stds] + hists + [grad_stats], axis=0).astype(np.float32)
        norm = np.linalg.norm(emb) + 1e-8
        return emb / norm


def image_pair_features(embedder: VisionEmbedder, image_a: str, image_b: str) -> np.ndarray:
    ea = embedder.embed_path(image_a)
    eb = embedder.embed_path(image_b)
    cos = float(np.dot(ea, eb) / ((np.linalg.norm(ea) * np.linalg.norm(eb)) + 1e-8))
    l2 = float(np.linalg.norm(ea - eb))
    return np.array([cos, l2], dtype=np.float32)


def image_pair_vector(embedder: VisionEmbedder, image_a: str, image_b: str) -> np.ndarray:
    ea = embedder.embed_path(image_a)
    eb = embedder.embed_path(image_b)
    cos = float(np.dot(ea, eb) / ((np.linalg.norm(ea) * np.linalg.norm(eb)) + 1e-8))
    l2 = float(np.linalg.norm(ea - eb))
    l1 = float(np.abs(ea - eb).mean())
    max_diff = float(np.max(np.abs(ea - eb)))
    std_diff = float(np.std(ea - eb))
    return np.concatenate(
        [
            ea,
            eb,
            np.abs(ea - eb),
            ea * eb,
            np.array([cos, l2, l1, max_diff, std_diff], dtype=np.float32),
        ],
        axis=0,
    ).astype(np.float32)
