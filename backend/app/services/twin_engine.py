from app.models.schemas import GraphNode, GraphEdge

try:
    from graph_engine import build_identity_graph
except Exception:  # noqa: BLE001
    build_identity_graph = None


def build_seed_twin(root_username: str) -> tuple[list[GraphNode], list[GraphEdge]]:
    # Use top-level graph-engine package when available to keep module boundaries explicit.
    if build_identity_graph:
        graph_nodes, graph_edges = build_identity_graph(
            [
                {"username": root_username, "username_similarity": 1.0},
                {"username": f"{root_username}_official", "username_similarity": 0.92},
                {"username": f"{root_username}_real", "username_similarity": 0.86, "suspicious": True},
            ]
        )
        nodes = [
            GraphNode(
                id=n.id.replace("identity:root", "u:root"),
                label=n.label,
                node_type=n.node_type,
                suspicious=n.suspicious,
                verified=n.verified,
                metadata={"source": "graph-engine"},
            )
            for n in graph_nodes
        ]
        edges = [GraphEdge(source=e.source.replace("identity:root", "u:root"), target=e.target, relation=e.relation, score=e.score) for e in graph_edges]
        nodes.extend(
            [
                GraphNode(id="i:avatar", label="Primary Avatar", node_type="image", verified=True, metadata={"hash": "img-h1"}),
                GraphNode(id="p:post1", label="Security Post", node_type="post", metadata={"sentiment": "neutral"}),
                GraphNode(id="r:paper1", label="AI Identity Research", node_type="research_artifact", metadata={"source": "arxiv"}),
            ]
        )
        edges.extend(
            [
                GraphEdge(source="account:0", target="i:avatar", relation="image_similarity", score=0.97),
                GraphEdge(source="account:2", target="i:avatar", relation="image_similarity", score=0.91),
                GraphEdge(source="account:1", target="p:post1", relation="published", score=1.0),
                GraphEdge(source="p:post1", target="r:paper1", relation="text_similarity", score=0.66),
            ]
        )
        return nodes, edges

    nodes = [
        GraphNode(id="u:root", label=root_username, node_type="identity", verified=True, metadata={"platform": "self"}),
        GraphNode(id="a:github", label=f"{root_username}", node_type="account", verified=True, metadata={"platform": "github"}),
        GraphNode(id="a:x", label=f"{root_username}_official", node_type="account", verified=True, metadata={"platform": "x"}),
        GraphNode(id="a:mirror", label=f"{root_username}_real", node_type="account", suspicious=True, metadata={"platform": "instagram"}),
        GraphNode(id="i:avatar", label="Primary Avatar", node_type="image", verified=True, metadata={"hash": "img-h1"}),
        GraphNode(id="p:post1", label="Security Post", node_type="post", metadata={"sentiment": "neutral"}),
        GraphNode(id="r:paper1", label="AI Identity Research", node_type="research_paper", metadata={"source": "arxiv"}),
    ]
    edges = [
        GraphEdge(source="u:root", target="a:github", relation="owns", score=1.0),
        GraphEdge(source="u:root", target="a:x", relation="owns", score=1.0),
        GraphEdge(source="u:root", target="a:mirror", relation="username_similarity", score=0.86),
        GraphEdge(source="a:github", target="i:avatar", relation="image_similarity", score=0.97),
        GraphEdge(source="a:mirror", target="i:avatar", relation="image_similarity", score=0.91),
        GraphEdge(source="a:x", target="p:post1", relation="published", score=1.0),
        GraphEdge(source="p:post1", target="r:paper1", relation="references", score=0.66),
    ]
    return nodes, edges
