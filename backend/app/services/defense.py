from app.models.schemas import AlertItem
from datetime import datetime, timezone


def generate_defense_recommendations(risk_category: str) -> list[AlertItem]:
    base = [
        AlertItem(
            title="Enable multi-factor authentication",
            severity="medium",
            recommendation="Activate MFA on all high-value accounts and primary email.",
            created_at=datetime.now(timezone.utc),
        ),
        AlertItem(
            title="Claim username variants",
            severity="medium",
            recommendation="Reserve close username permutations to reduce impersonation surface.",
            created_at=datetime.now(timezone.utc),
        ),
    ]
    if risk_category in {"high", "critical"}:
        base.append(
            AlertItem(
                title="Report suspicious mirror account",
                severity="high",
                recommendation="Submit platform abuse report with profile image and name collision evidence.",
                created_at=datetime.now(timezone.utc),
            )
        )
    if risk_category == "critical":
        base.append(
            AlertItem(
                title="Lockdown public profile metadata",
                severity="critical",
                recommendation="Temporarily reduce profile visibility and rotate exposed contact channels.",
                created_at=datetime.now(timezone.utc),
            )
        )
    return base
