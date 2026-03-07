import json
from datetime import datetime, timezone

from app.models.schemas import GraphNode, GraphEdge
from app.services import db

NODE_LABELS = {
    "identity": "UserIdentity",
    "account": "Account",
    "image": "Image",
    "post": "TextArtifact",
    "text_artifact": "TextArtifact",
    "research_artifact": "TextArtifact",
    "repository": "Repository",
}

EDGE_TYPES = {
    "HAS_ACCOUNT",
    "HAS_IMAGE",
    "SIMILAR_USERNAME",
    "SIMILAR_IMAGE",
    "SIMILAR_TEXT",
    "CONNECTED_TO",
}


def _node_label(node_type: str) -> str:
    return NODE_LABELS.get(node_type, "Account")


def _edge_type(edge: GraphEdge, source_type: str, target_type: str) -> str:
    relation = edge.relation.lower()
    if relation in {"username_similarity", "similar_username"}:
        return "SIMILAR_USERNAME"
    if relation in {"has_image"}:
        return "HAS_IMAGE"
    if relation in {"image_similarity", "similar_image"}:
        return "SIMILAR_IMAGE"
    if relation in {"text_similarity", "similar_text", "references"}:
        return "SIMILAR_TEXT"
    if relation in {"owns", "has_account", "network_relationship"}:
        return "HAS_ACCOUNT"
    if target_type == "image":
        return "HAS_IMAGE"
    return "CONNECTED_TO"


async def ensure_graph_schema() -> None:
    if db.neo4j_driver is None:
        return

    statements = [
        "CREATE CONSTRAINT graph_version_unique IF NOT EXISTS FOR (g:GraphVersion) REQUIRE (g.id, g.user_id) IS UNIQUE",
        "CREATE CONSTRAINT user_identity_unique IF NOT EXISTS FOR (n:UserIdentity) REQUIRE (n.entity_id, n.user_id, n.graph_version_id) IS UNIQUE",
        "CREATE CONSTRAINT account_unique IF NOT EXISTS FOR (n:Account) REQUIRE (n.entity_id, n.user_id, n.graph_version_id) IS UNIQUE",
        "CREATE CONSTRAINT image_unique IF NOT EXISTS FOR (n:Image) REQUIRE (n.entity_id, n.user_id, n.graph_version_id) IS UNIQUE",
        "CREATE CONSTRAINT text_unique IF NOT EXISTS FOR (n:TextArtifact) REQUIRE (n.entity_id, n.user_id, n.graph_version_id) IS UNIQUE",
        "CREATE CONSTRAINT repo_unique IF NOT EXISTS FOR (n:Repository) REQUIRE (n.entity_id, n.user_id, n.graph_version_id) IS UNIQUE",
    ]
    async with db.neo4j_driver.session() as session:
        for stmt in statements:
            await session.run(stmt)


async def upsert_graph(user_id: str, nodes: list[GraphNode], edges: list[GraphEdge], graph_version_id: str, scan_id: str, source: str = "scan_pipeline") -> dict:
    if db.neo4j_driver is None:
        return {"graph_version_id": graph_version_id, "nodes": 0, "edges": 0}

    created_ts = datetime.now(timezone.utc).isoformat()
    node_types = {n.id: n.node_type for n in nodes}

    async with db.neo4j_driver.session() as session:
        await session.run(
            """
            MERGE (g:GraphVersion {id: $graph_version_id, user_id: $user_id})
            SET g.scan_id = $scan_id,
                g.source = $source,
                g.timestamp = $timestamp
            """,
            graph_version_id=graph_version_id,
            user_id=user_id,
            scan_id=scan_id,
            source=source,
            timestamp=created_ts,
        )

        for n in nodes:
            label = _node_label(n.node_type)
            await session.run(
                f"""
                MERGE (x:{label} {{entity_id: $entity_id, user_id: $user_id, graph_version_id: $graph_version_id}})
                SET x.label = $label,
                    x.node_type = $node_type,
                    x.suspicious = $suspicious,
                    x.verified = $verified,
                    x.confidence_score = $confidence_score,
                    x.source = $source,
                    x.timestamp = $timestamp,
                    x.metadata_json = $metadata_json
                WITH x
                MATCH (g:GraphVersion {{id: $graph_version_id, user_id: $user_id}})
                MERGE (g)-[:CONTAINS]->(x)
                """,
                entity_id=n.id,
                user_id=user_id,
                graph_version_id=graph_version_id,
                label=n.label,
                node_type=n.node_type,
                suspicious=n.suspicious,
                verified=n.verified,
                confidence_score=float(n.confidence_score),
                source=n.source,
                timestamp=(n.timestamp.isoformat() if hasattr(n.timestamp, "isoformat") else created_ts),
                metadata_json=json.dumps(n.metadata or {}),
            )

        for e in edges:
            src_type = node_types.get(e.source, "account")
            tgt_type = node_types.get(e.target, "account")
            rel_type = _edge_type(e, src_type, tgt_type)
            if rel_type not in EDGE_TYPES:
                rel_type = "CONNECTED_TO"

            await session.run(
                f"""
                MATCH (a {{entity_id: $src_id, user_id: $user_id, graph_version_id: $graph_version_id}})
                MATCH (b {{entity_id: $dst_id, user_id: $user_id, graph_version_id: $graph_version_id}})
                MERGE (a)-[r:{rel_type} {{graph_version_id: $graph_version_id, relation_key: $relation_key}}]->(b)
                SET r.raw_relation = $raw_relation,
                    r.raw_score = $raw_score,
                    r.confidence_score = $confidence_score,
                    r.source = $source_ref,
                    r.timestamp = $timestamp
                """,
                src_id=e.source,
                dst_id=e.target,
                user_id=user_id,
                graph_version_id=graph_version_id,
                relation_key=f"{e.source}|{e.target}|{e.relation}",
                raw_relation=e.relation,
                raw_score=float(e.score),
                confidence_score=float(e.confidence_score),
                source_ref=e.source_ref,
                timestamp=(e.timestamp.isoformat() if hasattr(e.timestamp, "isoformat") else created_ts),
            )

    return {"graph_version_id": graph_version_id, "nodes": len(nodes), "edges": len(edges), "timestamp": created_ts}


async def _read_graph_by_version(user_id: str, graph_version_id: str) -> tuple[list[dict], list[dict]]:
    if db.neo4j_driver is None:
        return [], []

    async with db.neo4j_driver.session() as session:
        nodes_result = await session.run(
            """
            MATCH (n {user_id: $uid, graph_version_id: $graph_version_id})
            WHERE any(lbl IN labels(n) WHERE lbl IN ['UserIdentity', 'Account', 'Image', 'TextArtifact', 'Repository'])
            RETURN n.entity_id as id,
                   n.label as label,
                   n.node_type as node_type,
                   n.suspicious as suspicious,
                   n.verified as verified,
                   n.metadata_json as metadata_json,
                   n.confidence_score as confidence_score,
                   n.source as source,
                   n.timestamp as timestamp
            """,
            uid=user_id,
            graph_version_id=graph_version_id,
        )

        edges_result = await session.run(
            """
            MATCH (a {user_id: $uid, graph_version_id: $graph_version_id})-[r]->(b {user_id: $uid, graph_version_id: $graph_version_id})
            WHERE type(r) IN ['HAS_ACCOUNT', 'HAS_IMAGE', 'SIMILAR_USERNAME', 'SIMILAR_IMAGE', 'SIMILAR_TEXT', 'CONNECTED_TO']
            RETURN a.entity_id as source,
                   b.entity_id as target,
                   type(r) as relation,
                   r.raw_score as score,
                   r.confidence_score as confidence_score,
                   r.source as source_ref,
                   r.timestamp as timestamp
            """,
            uid=user_id,
            graph_version_id=graph_version_id,
        )

        nodes: list[dict] = []
        async for record in nodes_result:
            row = record.data()
            row["metadata"] = json.loads(row.get("metadata_json") or "{}")
            row.pop("metadata_json", None)
            nodes.append(row)

        edges = [record.data() async for record in edges_result]
        return nodes, edges


async def read_latest_graph(user_id: str) -> dict:
    if db.neo4j_driver is None:
        return {"graph_version_id": None, "nodes": [], "edges": [], "version": None}

    async with db.neo4j_driver.session() as session:
        version_result = await session.run(
            """
            MATCH (g:GraphVersion {user_id: $uid})
            RETURN g.id as id, g.scan_id as scan_id, g.source as source, g.timestamp as timestamp
            ORDER BY g.timestamp DESC
            LIMIT 1
            """,
            uid=user_id,
        )
        version = await version_result.single()

    if not version:
        return {"graph_version_id": None, "nodes": [], "edges": [], "version": None}

    version_data = version.data()
    nodes, edges = await _read_graph_by_version(user_id, version_data["id"])
    return {"graph_version_id": version_data["id"], "nodes": nodes, "edges": edges, "version": version_data}


async def read_graph_version(user_id: str, graph_version_id: str) -> dict:
    nodes, edges = await _read_graph_by_version(user_id, graph_version_id)
    return {"graph_version_id": graph_version_id, "nodes": nodes, "edges": edges}
