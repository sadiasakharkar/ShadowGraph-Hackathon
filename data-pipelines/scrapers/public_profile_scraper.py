"""Public profile scraper for identity signal ingestion.
Only intended for publicly accessible pages and hackathon demo usage.
"""

from bs4 import BeautifulSoup
import requests


def scrape_public_profile(url: str) -> dict:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    title = soup.title.string.strip() if soup.title and soup.title.string else "Unknown"
    description = ""
    meta = soup.find("meta", attrs={"name": "description"})
    if meta and meta.get("content"):
        description = meta["content"]
    return {"url": url, "title": title, "description": description}
