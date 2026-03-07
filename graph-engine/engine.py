"""Graph Intelligence Engine for ShadowGraph.

This module can be imported by backend services to construct
identity graph nodes and edges in a deterministic way.
"""

from dataclasses import dataclass


@dataclass
class Node:
    id: str
    label: str
    node_type: str
    suspicious: bool = False
    verified: bool = False


@dataclass
class Edge:
    source: str
    target: str
    relation: str
    score: float


def build_identity_graph(signals: list[dict]) -> tuple[list[Node], list[Edge]]:
    """Build a simple identity graph from normalized identity signals."""
    nodes: list[Node] = []
    edges: list[Edge] = []

    root_id = "identity:root"
    nodes.append(Node(id=root_id, label="Primary Identity", node_type="identity", verified=True))

    for i, signal in enumerate(signals):
        account_id = f"account:{i}"
        nodes.append(
            Node(
                id=account_id,
                label=signal.get("username", f"account_{i}"),
                node_type="account",
                suspicious=signal.get("suspicious", False),
                verified=not signal.get("suspicious", False),
            )
        )
        edges.append(Edge(source=root_id, target=account_id, relation="network_relationship", score=1.0))

        if signal.get("username_similarity") is not None:
            edges.append(
                Edge(
                    source=root_id,
                    target=account_id,
                    relation="username_similarity",
                    score=float(signal["username_similarity"]),
                )
            )

    return nodes, edges
