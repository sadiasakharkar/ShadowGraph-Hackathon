from fastapi import APIRouter, Depends, HTTPException

from app.graph.identity_graph import read_latest_graph, read_graph_version
from app.security.deps import get_current_user_id

router = APIRouter()


@router.get("/graph/latest")
async def graph_latest(user_id: str = Depends(get_current_user_id)) -> dict:
    return await read_latest_graph(user_id)


@router.get("/graph/version/{graph_version_id}")
async def graph_version(graph_version_id: str, user_id: str = Depends(get_current_user_id)) -> dict:
    payload = await read_graph_version(user_id, graph_version_id)
    if not payload.get("nodes"):
        raise HTTPException(status_code=404, detail="Graph version not found")
    return payload
