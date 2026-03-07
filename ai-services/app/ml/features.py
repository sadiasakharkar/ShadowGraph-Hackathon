import re
import string
from pathlib import Path

import numpy as np
from PIL import Image
from rapidfuzz import fuzz
import torch
import torchvision.transforms as T
from torchvision.models import resnet18, ResNet18_Weights


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


def text_pair_features(left: str, right: str) -> np.ndarray:
    lf = np.array(_token_stats(left), dtype=np.float32)
    rf = np.array(_token_stats(right), dtype=np.float32)
    diff = np.abs(lf - rf)
    cos = float(np.dot(lf, rf) / ((np.linalg.norm(lf) * np.linalg.norm(rf)) + 1e-8))
    return np.concatenate([lf, rf, diff, np.array([cos], dtype=np.float32)], axis=0)


class VisionEmbedder:
    def __init__(self) -> None:
        self.device = torch.device("cpu")
        try:
            weights = ResNet18_Weights.IMAGENET1K_V1
            model = resnet18(weights=weights)
            self.transform = weights.transforms()
        except Exception:
            # Fallback when pretrained weights cannot be downloaded.
            model = resnet18(weights=None)
            self.transform = T.Compose(
                [
                    T.Resize((224, 224)),
                    T.ToTensor(),
                    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
                ]
            )

        model.fc = torch.nn.Identity()
        model.eval()
        self.model = model.to(self.device)

    def embed_path(self, image_path: str) -> np.ndarray:
        img = Image.open(Path(image_path)).convert("RGB")
        tensor = self.transform(img).unsqueeze(0).to(self.device)
        with torch.no_grad():
            emb = self.model(tensor).squeeze(0).cpu().numpy().astype(np.float32)
        norm = np.linalg.norm(emb) + 1e-8
        return emb / norm


def image_pair_features(embedder: VisionEmbedder, image_a: str, image_b: str) -> np.ndarray:
    ea = embedder.embed_path(image_a)
    eb = embedder.embed_path(image_b)
    cos = float(np.dot(ea, eb) / ((np.linalg.norm(ea) * np.linalg.norm(eb)) + 1e-8))
    l2 = float(np.linalg.norm(ea - eb))
    return np.array([cos, l2], dtype=np.float32)
