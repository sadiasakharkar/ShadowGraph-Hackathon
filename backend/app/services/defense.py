from datetime import datetime, timezone
from typing import Any


def _severity_from_score(score: float) -> str:
    if score >= 0.75:
        return "critical"
    if score >= 0.5:
        return "high"
    if score >= 0.3:
        return "medium"
    return "low"


def build_defense_playbooks(risk: dict[str, Any], analysis: dict[str, Any]) -> list[dict[str, Any]]:
    now = datetime.now(timezone.utc)
    overall_risk = float((risk or {}).get("overall_risk_score") or analysis.get("overall_risk_score") or 0.0)
    attack_likelihood = float(analysis.get("attack_likelihood") or 0.0)
    scenarios = {str(s.get("type")): s for s in analysis.get("scenarios", [])}
    has_impersonation = bool((scenarios.get("username_impersonation") or {}).get("attack_paths"))
    has_image_reuse = bool((scenarios.get("image_reuse") or {}).get("attack_paths"))
    has_fake_accounts = bool((scenarios.get("fake_account_creation") or {}).get("attack_paths"))

    playbooks: list[dict[str, Any]] = [
        {
            "alert_key": "enable_mfa",
            "title": "Enable Multi-Factor Authentication",
            "severity": _severity_from_score(max(overall_risk, attack_likelihood)),
            "recommendation": "Activate MFA for primary email, source-control accounts, and social identity anchors.",
            "playbook_type": "enable_multi_factor_authentication",
            "risk_factors": ["credential takeover prevention", "account hardening"],
            "state": "open",
            "created_at": now,
            "updated_at": now,
        },
        {
            "alert_key": "secure_exposed_profiles",
            "title": "Secure Exposed Profiles",
            "severity": _severity_from_score(overall_risk),
            "recommendation": "Reduce public metadata exposure, rotate profile images if reused, and pin verified profile links.",
            "playbook_type": "secure_exposed_profiles",
            "risk_factors": analysis.get("risk_factors", []),
            "state": "open",
            "created_at": now,
            "updated_at": now,
        },
    ]

    if has_impersonation or has_fake_accounts:
        playbooks.append(
            {
                "alert_key": "report_impersonation_accounts",
                "title": "Report Impersonation Accounts",
                "severity": _severity_from_score(max(attack_likelihood, overall_risk)),
                "recommendation": "File abuse reports for suspicious lookalike usernames and attach identity ownership evidence.",
                "playbook_type": "report_impersonation_accounts",
                "risk_factors": ["username impersonation", "fake account creation"],
                "state": "open",
                "created_at": now,
                "updated_at": now,
            }
        )

    if has_image_reuse:
        playbooks.append(
            {
                "alert_key": "image_reuse_takedown",
                "title": "Submit Image Reuse Takedown",
                "severity": _severity_from_score(max(attack_likelihood, overall_risk)),
                "recommendation": "Submit takedown requests for unauthorized profile image reuse and rotate avatar on critical profiles.",
                "playbook_type": "image_reuse_takedown",
                "risk_factors": ["image reuse", "identity cloning"],
                "state": "open",
                "created_at": now,
                "updated_at": now,
            }
        )

    return playbooks
