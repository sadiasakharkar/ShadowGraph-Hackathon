import csv
import json
from pathlib import Path
import sys

import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_recall_fscore_support
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from app.ml.features import username_features

DATA = ROOT / "datasets" / "username_pairs.csv"
MODELS = ROOT / "models"
REPORTS = ROOT / "reports"


def load_rows() -> tuple[np.ndarray, np.ndarray]:
    x, y = [], []
    with DATA.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            x.append(username_features(row["left"], row["right"]))
            y.append(int(row["label"]))
    return np.vstack(x), np.array(y, dtype=np.int32)


def train() -> dict:
    MODELS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)

    x, y = load_rows()
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.25, random_state=42, stratify=y)

    model = LogisticRegression(max_iter=300, random_state=42)
    model.fit(x_train, y_train)

    preds = model.predict(x_test)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, preds, average="binary", zero_division=0)

    joblib.dump(model, MODELS / "username_similarity_model.joblib")
    report = {
        "model": "username_similarity_model",
        "dataset": str(DATA.name),
        "samples": int(len(y)),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
    }
    (REPORTS / "username_similarity_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


if __name__ == "__main__":
    print(json.dumps(train(), indent=2))
