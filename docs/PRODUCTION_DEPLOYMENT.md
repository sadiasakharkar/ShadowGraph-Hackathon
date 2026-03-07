# Production Deployment Guide

## 1) Environment and Secrets

- Copy `.env.example` to `.env` and replace all defaults.
- Required secret values:
  - `JWT_SECRET`
  - `NEO4J_PASSWORD`
  - `MONGO_URI` (production cluster URI)
  - `REDIS_URL` (managed Redis)
- Optional observability:
  - `SENTRY_DSN`
  - `SENTRY_TRACES_SAMPLE_RATE`

## 2) Reliability Controls Enabled

- Structured JSON logs with request id (`X-Request-ID`).
- Global exception handler returns stable `500` payload and logs stack traces.
- API rate limiting middleware (`RATE_LIMIT_*`).
- JWT hardening:
  - audience and issuer validation
  - issued-at and not-before claims
  - configurable short-lived access tokens

## 3) Container Deployment

```bash
docker compose up -d --build
docker compose ps
```

Health endpoints:

- `GET /health/backend`
- `GET /health/database`
- `GET /health/ai`

## 4) Test Gates Before Release

```bash
./scripts/run_api_tests.sh
./scripts/run_ui_smoke.sh
```

## 5) Recommended Production Add-ons

- Add WAF / API gateway IP filtering.
- Move from local Docker volumes to managed persistent storage.
- Add centralized log sink (ELK/OpenSearch/Datadog).
- Add backup and restore runbook for MongoDB + Neo4j.

