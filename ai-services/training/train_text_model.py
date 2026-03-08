import csv
import json
from pathlib import Path
import sys

import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_recall_fscore_support, accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from app.ml.features import text_pair_features

DATA = ROOT / "datasets" / "text_pairs.csv"
MODELS = ROOT / "models"
REPORTS = ROOT / "reports"


def load_rows() -> tuple[np.ndarray, np.ndarray]:
    x, y = [], []
    with DATA.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            x.append(text_pair_features(row["left"], row["right"]))
            y.append(int(row["label"]))
    return np.vstack(x), np.array(y, dtype=np.int32)


def train() -> dict:
    MODELS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)

    x, y = load_rows()
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.25, random_state=42, stratify=y)

    model = Pipeline(
        [
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=600, random_state=42, class_weight="balanced")),
        ]
    )
    model.fit(x_train, y_train)

    preds = model.predict(x_test)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, preds, average="binary", zero_division=0)
    accuracy = accuracy_score(y_test, preds)

    joblib.dump(model, MODELS / "text_similarity_model.joblib")
    report = {
        "model": "text_similarity_model",
        "dataset": str(DATA.name),
        "samples": int(len(y)),
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
    }
    (REPORTS / "text_similarity_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


if __name__ == "__main__":
    print(json.dumps(train(), indent=2))
