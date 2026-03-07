"""Cross-platform username matcher utilities."""

from rapidfuzz import fuzz


def find_close_usernames(seed_username: str, candidates: list[str], threshold: int = 75) -> list[dict]:
    matches = []
    for c in candidates:
        score = fuzz.ratio(seed_username.lower(), c.lower())
        if score >= threshold:
            matches.append({"username": c, "score": score / 100.0})
    return sorted(matches, key=lambda x: x["score"], reverse=True)
