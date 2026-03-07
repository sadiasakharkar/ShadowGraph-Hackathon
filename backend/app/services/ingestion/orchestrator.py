import asyncio
import logging
from typing import Any

from app.services.ingestion.adapters.github_profile import fetch_github_profile
from app.services.ingestion.adapters.website_profile import fetch_website_profile
from app.services.ingestion.adapters.username_discovery import discover_usernames
from app.services.ingestion.adapters.profile_image import fetch_profile_image_metadata

logger = logging.getLogger("shadowgraph.ingestion.orchestrator")


async def run_ingestion_adapters(identity_input: dict[str, Any]) -> list[dict[str, Any]]:
    username = identity_input.get("username")
    website_url = identity_input.get("website_url")
    profile_image_url = identity_input.get("profile_image_url")
    platforms = identity_input.get("platforms") or ["github", "x", "linkedin", "instagram", "medium"]

    adapter_tasks = [
        fetch_github_profile(username),
        fetch_website_profile(website_url),
        discover_usernames(username, platforms),
        fetch_profile_image_metadata(profile_image_url),
    ]

    collected: list[dict[str, Any]] = []
    results = await asyncio.gather(*adapter_tasks, return_exceptions=True)

    for result in results:
        if isinstance(result, Exception):
            logger.exception("Adapter execution failed: %s", result)
            continue
        collected.extend(result)

    # Optional chaining: if GitHub returned avatar and no explicit image was provided, inspect avatar metadata.
    if not profile_image_url:
        github_avatar = next((item.get("profile_image_url") for item in collected if item.get("platform") == "github" and item.get("profile_image_url")), None)
        if github_avatar:
            try:
                collected.extend(await fetch_profile_image_metadata(github_avatar))
            except Exception as exc:  # noqa: BLE001
                logger.warning("GitHub avatar ingestion failed: %s", exc)

    return collected
