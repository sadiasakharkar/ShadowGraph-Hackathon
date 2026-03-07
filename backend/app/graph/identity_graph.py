import json

from app.models.schemas import GraphNode, GraphEdge
from app.services import db


async def upsert_graph(user_id: str, nodes: list[GraphNode], edges: list[GraphEdge]) -> None:
    if db.neo4j_driver is None:
        return
    async with db.neo4j_driver.session() as session:
        for n in nodes:
            await session.run(
                """
                MERGE (x:Entity {id: $id, user_id: $user_id})
                SET x.label = $label, x.node_type = $node_type, x.suspicious = $suspicious,
                    x.verified = $verified, x.metadata_json = $metadata_json
                """,
                id=n.id,
                user_id=user_id,
                label=n.label,
                node_type=n.node_type,
                suspicious=n.suspicious,
                verified=n.verified,
                metadata_json=json.dumps(n.metadata or {}),
            )
        for e in edges:
            await session.run(
                """
                MATCH (a:Entity {id: $source, user_id: $user_id})
                MATCH (b:Entity {id: $target, user_id: $user_id})
                MERGE (a)-[r:RELATED {relation: $relation}]->(b)
                SET r.score = $score
                """,
                source=e.source,
                target=e.target,
                relation=e.relation,
                score=e.score,
                user_id=user_id,
            )


async def read_graph(user_id: str) -> tuple[list[dict], list[dict]]:
    if db.neo4j_driver is None:
        return [], []
    async with db.neo4j_driver.session() as session:
        nodes_result = await session.run(
            "MATCH (n:Entity {user_id: $uid}) RETURN n.id as id, n.label as label, n.node_type as node_type, n.suspicious as suspicious, n.verified as verified, n.metadata_json as metadata_json",
            uid=user_id,
        )
        edges_result = await session.run(
            "MATCH (a:Entity {user_id: $uid})-[r:RELATED]->(b:Entity {user_id: $uid}) RETURN a.id as source, b.id as target, r.relation as relation, r.score as score",
            uid=user_id,
        )
        nodes = []
        async for record in nodes_result:
            row = record.data()
            row["metadata"] = json.loads(row.get("metadata_json") or "{}")
            row.pop("metadata_json", None)
            nodes.append(row)
        edges = [record.data() async for record in edges_result]
        return nodes, edges
