from app.models.schemas import RiskScoreResponse


def compute_risk(dup_prob: float, misuse_prob: float, deepfake: float, network: float) -> RiskScoreResponse:
    # Weighted threat model balancing duplication, misuse, deepfake indicators, and graph anomalies.
    overall = (0.34 * dup_prob) + (0.27 * misuse_prob) + (0.22 * deepfake) + (0.17 * network)

    if overall >= 0.75:
        category = "critical"
    elif overall >= 0.5:
        category = "high"
    elif overall >= 0.3:
        category = "medium"
    else:
        category = "low"

    return RiskScoreResponse(
        identity_duplication_probability=round(dup_prob, 3),
        content_misuse_probability=round(misuse_prob, 3),
        deepfake_risk_indicators=round(deepfake, 3),
        network_anomaly_signals=round(network, 3),
        overall_risk_score=round(overall, 3),
        category=category,
    )
