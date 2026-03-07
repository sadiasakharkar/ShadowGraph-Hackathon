from app.services.defense import build_defense_playbooks
from app.services.threat_simulation import simulate_identity_attacks


def test_threat_to_defense_recommendations_pipeline():
    nodes = [
        {"id": "u-core", "node_type": "useridentity", "suspicious": False, "metadata": {"platform": "core"}},
        {"id": "acc-real", "node_type": "account", "suspicious": False, "metadata": {"platform": "linkedin"}},
        {"id": "acc-fake", "node_type": "account", "suspicious": True, "metadata": {"platform": "linkedin"}},
        {"id": "img-fake", "node_type": "image", "suspicious": True, "metadata": {"platform": "linkedin", "image_reuse": True}},
    ]
    edges = [
        {"source": "u-core", "target": "acc-real", "relation": "HAS_ACCOUNT", "confidence_score": 0.95},
        {"source": "acc-fake", "target": "u-core", "relation": "SIMILAR_USERNAME", "confidence_score": 0.89},
        {"source": "img-fake", "target": "acc-fake", "relation": "SIMILAR_IMAGE", "confidence_score": 0.91},
    ]
    analysis = simulate_identity_attacks(nodes, edges)
    playbooks = build_defense_playbooks({"overall_risk_score": 0.67, "category": "high"}, analysis)
    keys = {p["alert_key"] for p in playbooks}

    assert "enable_mfa" in keys
    assert "secure_exposed_profiles" in keys
    assert "report_impersonation_accounts" in keys
    assert any(p["state"] == "open" for p in playbooks)

