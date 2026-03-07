import logging
import os
import time

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import auth, identity, graph, alerts, ai, scan, graph_public, risk_analysis
from app.graph.identity_graph import ensure_graph_schema
from app.services import db
from app.services.db import connect_all, close_all
from app.services.scan_queue import start_scan_worker, stop_scan_worker

app = FastAPI(title="ShadowGraph Backend", version="1.0.0")
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper(), logging.INFO),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("shadowgraph.backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in __import__("os").getenv("CORS_ORIGINS", "http://localhost:3000").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(identity.router, prefix="/api/identity", tags=["identity"])
app.include_router(graph.router, prefix="/api/graph", tags=["graph"])
app.include_router(alerts.router, tags=["alerts"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai-proxy"])
app.include_router(scan.router, tags=["scan"])
app.include_router(graph_public.router, tags=["graph-versioned"])
app.include_router(risk_analysis.router, tags=["threat-simulation"])


@app.on_event("startup")
async def startup() -> None:
    logger.info("Starting backend services")
    await connect_all()
    await ensure_graph_schema()
    await start_scan_worker()


@app.on_event("shutdown")
async def shutdown() -> None:
    logger.info("Shutting down backend services")
    await stop_scan_worker()
    await close_all()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "backend"}


@app.middleware("http")
async def request_logging_middleware(request, call_next):
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000
    logger.info("%s %s -> %s in %.2fms", request.method, request.url.path, response.status_code, elapsed_ms)
    return response


@app.get("/health/backend")
async def health_backend() -> dict:
    return {"status": "ok", "service": "backend"}


@app.get("/health/database")
async def health_database():
    health = {"mongo": False, "neo4j": False, "redis": False}

    try:
        if db.mongo_db is not None:
            mongo_ping = await db.mongo_db.command("ping")
            health["mongo"] = bool(mongo_ping.get("ok", 0) == 1)
    except Exception:  # noqa: BLE001
        logger.exception("MongoDB health check failed")

    try:
        if db.neo4j_driver is not None:
            async with db.neo4j_driver.session() as session:
                result = await session.run("RETURN 1 as ok")
                record = await result.single()
                health["neo4j"] = bool(record and record.get("ok") == 1)
    except Exception:  # noqa: BLE001
        logger.exception("Neo4j health check failed")

    try:
        if db.redis_client is not None:
            health["redis"] = bool(await db.redis_client.ping())
    except Exception:  # noqa: BLE001
        logger.exception("Redis health check failed")

    overall_ok = all(health.values())
    payload = {"status": "ok" if overall_ok else "degraded", "service": "database", "checks": health}
    return payload if overall_ok else JSONResponse(status_code=503, content=payload)


@app.get("/health/ai")
async def health_ai():
    ai_url = os.getenv("AI_SERVICE_URL", "http://ai-services:8100")
    endpoints = [f"{ai_url}/health/ai", f"{ai_url}/health"]
    for target in endpoints:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(target)
                if response.status_code == 200:
                    return {"status": "ok", "service": "ai", "endpoint": target}
        except Exception:  # noqa: BLE001
            logger.warning("AI health probe failed for %s", target)

    return JSONResponse(status_code=503, content={"status": "down", "service": "ai"})
