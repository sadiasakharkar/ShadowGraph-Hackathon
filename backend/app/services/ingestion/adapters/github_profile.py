import logging
from typing import Any

import httpx

logger = logging.getLogger("shadowgraph.ingestion.github")


async def fetch_github_profile(username: str | None) -> list[dict[str, Any]]:
    if not username:
        return []

    url = f"https://api.github.com/users/{username}"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, headers={"Accept": "application/vnd.github+json"})
        if response.status_code != 200:
            logger.warning("GitHub adapter failed for %s with status=%s", username, response.status_code)
            return []
        data = response.json()
        return [
            {
                "adapter": "github_profile",
                "platform": "github",
                "username": data.get("login") or username,
                "display_name": data.get("name") or "",
                "bio_text": data.get("bio") or "",
                "profile_image_url": data.get("avatar_url") or "",
                "source_url": data.get("html_url") or f"https://github.com/{username}",
                "account_creation_metadata": {
                    "created_at": data.get("created_at"),
                    "public_repos": data.get("public_repos"),
                    "followers": data.get("followers"),
                    "following": data.get("following"),
                },
                "public_links": [data.get("blog")] if data.get("blog") else [],
                "confidence_score": 0.95,
                "raw_payload": data,
            }
        ]
    except Exception as exc:  # noqa: BLE001
        logger.exception("GitHub adapter exception for %s: %s", username, exc)
        return []
