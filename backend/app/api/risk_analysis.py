from fastapi import APIRouter, Depends

from app.graph.identity_graph import read_latest_graph
from app.security.deps import get_current_user_id
from app.services.threat_simulation import simulate_identity_attacks

router = APIRouter()


@router.get("/risk/analysis")
async def risk_analysis(user_id: str = Depends(get_current_user_id)) -> dict:
    latest = await read_latest_graph(user_id)
    nodes = latest.get("nodes", [])
    edges = latest.get("edges", [])
    simulation = simulate_identity_attacks(nodes, edges)
    return {
        "graph_version_id": latest.get("graph_version_id"),
        "version": latest.get("version"),
        "analysis": simulation,
    }
