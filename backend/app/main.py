from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, identity, graph, alerts, ai
from app.services.db import connect_all, close_all

app = FastAPI(title="ShadowGraph Backend", version="1.0.0")

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
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai-proxy"])


@app.on_event("startup")
async def startup() -> None:
    await connect_all()


@app.on_event("shutdown")
async def shutdown() -> None:
    await close_all()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "backend"}
