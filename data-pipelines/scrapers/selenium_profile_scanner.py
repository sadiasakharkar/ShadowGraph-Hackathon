"""Optional Selenium scanner for dynamic pages."""


def scan_dynamic_profile(url: str) -> dict:
    # Placeholder to keep the pipeline modular without forcing Selenium runtime in the core stack.
    return {"url": url, "status": "not_executed", "reason": "Enable Selenium runtime to scan dynamic profiles."}
