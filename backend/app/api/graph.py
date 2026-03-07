from fastapi import APIRouter, Depends

from app.security.deps import get_current_user_id
from app.graph.identity_graph import read_graph

router = APIRouter()


@router.get("")
async def get_graph(user_id: str = Depends(get_current_user_id)) -> dict:
    nodes, edges = await read_graph(user_id)
    return {"nodes": nodes, "edges": edges}
