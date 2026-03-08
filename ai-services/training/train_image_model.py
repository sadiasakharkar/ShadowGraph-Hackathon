import csv
import json
from pathlib import Path
import sys

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, f1_score
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from app.ml.features import VisionEmbedder

DATA = ROOT / "datasets" / "image_pairs.csv"
MODELS = ROOT / "models"
REPORTS = ROOT / "reports"


def load_rows() -> tuple[np.ndarray, np.ndarray]:
    x, y = [], []
    embedder = VisionEmbedder()
    embedding_cache: dict[str, np.ndarray] = {}

    def embed(path: str) -> np.ndarray:
        if path not in embedding_cache:
            embedding_cache[path] = embedder.embed_path(path)
        return embedding_cache[path]

    with DATA.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Use cached embeddings through wrapper to avoid repeated image loads per pair.
            ea = embed(row["image_a"])
            eb = embed(row["image_b"])
            cos = float(np.dot(ea, eb) / ((np.linalg.norm(ea) * np.linalg.norm(eb)) + 1e-8))
            l2 = float(np.linalg.norm(ea - eb))
            l1 = float(np.abs(ea - eb).mean())
            max_diff = float(np.max(np.abs(ea - eb)))
            std_diff = float(np.std(ea - eb))
            x.append(
                np.concatenate(
                    [ea, eb, np.abs(ea - eb), ea * eb, np.array([cos, l2, l1, max_diff, std_diff], dtype=np.float32)],
                    axis=0,
                ).astype(np.float32)
            )
            y.append(int(row["label"]))
    return np.vstack(x), np.array(y, dtype=np.int32)


def train() -> dict:
    MODELS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)

    x, y = load_rows()
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.25, random_state=42, stratify=y)

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(x_train, y_train)

    probas = model.predict_proba(x_test)[:, 1]
    thresholds = np.linspace(0.35, 0.75, 41)
    best_threshold = 0.5
    best_f1 = -1.0
    best_preds = None
    for t in thresholds:
        p = (probas >= t).astype(np.int32)
        score = f1_score(y_test, p, zero_division=0)
        if score > best_f1:
            best_f1 = float(score)
            best_threshold = float(t)
            best_preds = p

    preds = best_preds if best_preds is not None else (probas >= 0.5).astype(np.int32)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, preds, average="binary", zero_division=0)
    accuracy = accuracy_score(y_test, preds)

    joblib.dump({"model": model, "threshold": best_threshold}, MODELS / "image_similarity_model.joblib")
    report = {
        "model": "image_similarity_model",
        "dataset": str(DATA.name),
        "samples": int(len(y)),
        "decision_threshold": round(float(best_threshold), 4),
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
    }
    (REPORTS / "image_similarity_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


if __name__ == "__main__":
    print(json.dumps(train(), indent=2))
