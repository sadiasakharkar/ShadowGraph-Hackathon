import asyncio
import logging
from typing import Any

import httpx

logger = logging.getLogger("shadowgraph.ingestion.username_discovery")

PLATFORM_PATTERNS = {
    "x": "https://x.com/{username}",
    "linkedin": "https://www.linkedin.com/in/{username}",
    "instagram": "https://www.instagram.com/{username}",
    "medium": "https://medium.com/@{username}",
    "github": "https://github.com/{username}",
}


async def _probe_profile(client: httpx.AsyncClient, platform: str, username: str) -> dict[str, Any] | None:
    url = PLATFORM_PATTERNS[platform].format(username=username)
    try:
        response = await client.get(url, timeout=8, follow_redirects=True)
        if response.status_code >= 400:
            return None
        return {
            "adapter": "username_discovery",
            "platform": platform,
            "username": username,
            "display_name": "",
            "bio_text": "",
            "profile_image_url": "",
            "source_url": str(response.url),
            "account_creation_metadata": {"http_status": response.status_code},
            "public_links": [str(response.url)],
            "confidence_score": 0.60 if response.status_code == 200 else 0.45,
            "raw_payload": {"resolved_url": str(response.url), "status_code": response.status_code},
        }
    except Exception:  # noqa: BLE001
        logger.debug("Username probe failed for platform=%s username=%s", platform, username)
        return None


async def discover_usernames(username: str | None, platforms: list[str] | None = None) -> list[dict[str, Any]]:
    if not username:
        return []

    selected = [p for p in (platforms or list(PLATFORM_PATTERNS.keys())) if p in PLATFORM_PATTERNS]
    if not selected:
        return []

    try:
        async with httpx.AsyncClient() as client:
            tasks = [_probe_profile(client, platform, username) for platform in selected]
            results = await asyncio.gather(*tasks)
        return [r for r in results if r]
    except Exception as exc:  # noqa: BLE001
        logger.exception("Username discovery exception for %s: %s", username, exc)
        return []
