"""Anomaly detection helpers for suspicious identity clusters."""

from sklearn.ensemble import IsolationForest


def anomaly_scores(features: list[list[float]]) -> list[float]:
    if len(features) < 2:
        return [0.0 for _ in features]
    model = IsolationForest(contamination=0.2, random_state=42)
    model.fit(features)
    raw = [-s for s in model.score_samples(features)]
    low, high = min(raw), max(raw)
    return [0.0 if high == low else (x - low) / (high - low) for x in raw]
