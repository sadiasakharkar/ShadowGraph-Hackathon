import logging
from typing import Any
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger("shadowgraph.ingestion.website")


async def fetch_website_profile(website_url: str | None) -> list[dict[str, Any]]:
    if not website_url:
        return []

    try:
        async with httpx.AsyncClient(timeout=12, follow_redirects=True) as client:
            response = await client.get(website_url)
        if response.status_code >= 400:
            logger.warning("Website adapter failed for %s with status=%s", website_url, response.status_code)
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        title = (soup.title.string or "").strip() if soup.title and soup.title.string else ""
        meta_desc = ""
        desc_tag = soup.find("meta", attrs={"name": "description"})
        if desc_tag and desc_tag.get("content"):
            meta_desc = desc_tag["content"].strip()

        display_name = ""
        h1 = soup.find("h1")
        if h1:
            display_name = h1.get_text(strip=True)

        links = []
        for a in soup.find_all("a", href=True)[:12]:
            links.append(urljoin(str(response.url), a["href"]))

        parsed = urlparse(str(response.url))
        guess_username = parsed.path.strip("/").split("/")[0] if parsed.path.strip("/") else parsed.netloc.split(".")[0]

        return [
            {
                "adapter": "website_profile",
                "platform": "website",
                "username": guess_username,
                "display_name": display_name or title,
                "bio_text": meta_desc,
                "profile_image_url": "",
                "source_url": str(response.url),
                "account_creation_metadata": {"http_status": response.status_code, "title": title},
                "public_links": links,
                "confidence_score": 0.72,
                "raw_payload": {"title": title, "meta_description": meta_desc, "url": str(response.url), "links": links},
            }
        ]
    except Exception as exc:  # noqa: BLE001
        logger.exception("Website adapter exception for %s: %s", website_url, exc)
        return []
