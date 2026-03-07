from fastapi import APIRouter, Depends

from app.security.deps import get_current_user_id
from app.graph.identity_graph import read_latest_graph

router = APIRouter()


@router.get("")
async def get_graph(user_id: str = Depends(get_current_user_id)) -> dict:
    payload = await read_latest_graph(user_id)
    return {"graph_version_id": payload.get("graph_version_id"), "nodes": payload.get("nodes", []), "edges": payload.get("edges", [])}
