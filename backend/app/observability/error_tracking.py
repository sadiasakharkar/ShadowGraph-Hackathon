import os


def init_error_tracking() -> None:
    dsn = os.getenv("SENTRY_DSN", "").strip()
    if not dsn:
        return
    try:
        import sentry_sdk

        sentry_sdk.init(
            dsn=dsn,
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.05")),
            environment=os.getenv("APP_ENV", "development"),
            release=os.getenv("APP_RELEASE", "shadowgraph-local"),
        )
    except Exception:
        # Do not block app startup if Sentry initialization fails.
        return

