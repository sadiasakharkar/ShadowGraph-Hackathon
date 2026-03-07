import hashlib
import logging
from typing import Any

import httpx

logger = logging.getLogger("shadowgraph.ingestion.profile_image")


async def fetch_profile_image_metadata(image_url: str | None) -> list[dict[str, Any]]:
    if not image_url:
        return []

    try:
        async with httpx.AsyncClient(timeout=8, follow_redirects=True) as client:
            response = await client.get(image_url)
        if response.status_code >= 400:
            logger.warning("Profile image adapter failed for %s with status=%s", image_url, response.status_code)
            return []

        content_type = response.headers.get("content-type", "")
        content_length = int(response.headers.get("content-length", len(response.content)))
        image_fingerprint = hashlib.sha256(response.content[:4096]).hexdigest()

        return [
            {
                "adapter": "profile_image",
                "platform": "image",
                "username": "",
                "display_name": "",
                "bio_text": "",
                "profile_image_url": str(response.url),
                "source_url": str(response.url),
                "account_creation_metadata": {
                    "content_type": content_type,
                    "content_length": content_length,
                    "fingerprint": image_fingerprint,
                },
                "public_links": [str(response.url)],
                "confidence_score": 0.88,
                "raw_payload": {"headers": dict(response.headers), "fingerprint": image_fingerprint},
            }
        ]
    except Exception as exc:  # noqa: BLE001
        logger.exception("Profile image adapter exception for %s: %s", image_url, exc)
        return []
