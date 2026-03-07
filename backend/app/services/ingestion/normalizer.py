from datetime import datetime, timezone
from typing import Any


def normalize_signal(raw_signal: dict[str, Any], identity_id: str) -> dict[str, Any]:
    return {
        "identity_id": identity_id,
        "platform": raw_signal.get("platform", "unknown"),
        "username": raw_signal.get("username", ""),
        "display_name": raw_signal.get("display_name", ""),
        "profile_image_url": raw_signal.get("profile_image_url", ""),
        "bio_text": raw_signal.get("bio_text", ""),
        "source_url": raw_signal.get("source_url", ""),
        "timestamp": datetime.now(timezone.utc),
        "confidence_score": float(raw_signal.get("confidence_score", 0.5)),
        "public_links": raw_signal.get("public_links", []),
        "account_creation_metadata": raw_signal.get("account_creation_metadata", {}),
    }


def normalize_signals(raw_signals: list[dict[str, Any]], identity_id: str) -> list[dict[str, Any]]:
    return [normalize_signal(item, identity_id) for item in raw_signals]
