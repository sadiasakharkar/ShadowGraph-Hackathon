from datetime import datetime, timezone

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


def build_twin_from_normalized_signals(identity_id: str, normalized_signals: list[dict]) -> tuple[list[GraphNode], list[GraphEdge]]:
    now = datetime.now(timezone.utc)
    if build_identity_graph:
        graph_input = []
        for sig in normalized_signals:
            if sig.get("username"):
                graph_input.append(
                    {
                        "username": sig.get("username"),
                        "username_similarity": float(sig.get("confidence_score", 0.5)),
                        "suspicious": float(sig.get("confidence_score", 0.5)) < 0.65,
                    }
                )

        graph_nodes, graph_edges = build_identity_graph(graph_input)
        nodes = [
            GraphNode(
                id=(n.id.replace("identity:root", f"u:{identity_id}") if "identity:root" in n.id else n.id),
                label=n.label,
                node_type=n.node_type,
                suspicious=n.suspicious,
                verified=n.verified,
                metadata={"source": "graph-engine"},
                confidence_score=0.75 if not n.suspicious else 0.45,
                source="normalized_signals",
                timestamp=now,
            )
            for n in graph_nodes
        ]
        edges = [
            GraphEdge(
                source=(e.source.replace("identity:root", f"u:{identity_id}") if "identity:root" in e.source else e.source),
                target=e.target,
                relation=e.relation,
                score=e.score,
                confidence_score=float(e.score),
                source_ref="graph-engine",
                timestamp=now,
            )
            for e in graph_edges
        ]

        # Anomaly rule: repeated profile image URLs across multiple accounts indicate suspicious reuse.
        image_to_accounts: dict[str, list[str]] = {}
        image_node_by_url: dict[str, str] = {}
        for idx, sig in enumerate(normalized_signals):
            if sig.get("profile_image_url"):
                image_to_accounts.setdefault(sig.get("profile_image_url"), []).append(f"account:{idx}")

        for idx, sig in enumerate(normalized_signals):
            if sig.get("profile_image_url"):
                image_url = sig.get("profile_image_url")
                img_id = f"img:{idx}"
                img_reuse = len(image_to_accounts.get(image_url, [])) > 1
                suspicious = float(sig.get("confidence_score", 0.5)) < 0.6 or img_reuse
                nodes.append(
                    GraphNode(
                        id=img_id,
                        label=f"Profile Image {idx + 1}",
                        node_type="image",
                        suspicious=suspicious,
                        verified=float(sig.get("confidence_score", 0.5)) >= 0.8 and not img_reuse,
                        metadata={"url": image_url, "image_reuse": img_reuse},
                        confidence_score=float(sig.get("confidence_score", 0.5)),
                        source=sig.get("platform", "unknown"),
                        timestamp=now,
                    )
                )
                edges.append(
                    GraphEdge(
                        source=(f"u:{identity_id}" if any(n.id == f"u:{identity_id}" for n in nodes) else "account:0"),
                        target=img_id,
                        relation="has_image",
                        score=float(sig.get("confidence_score", 0.6)),
                        confidence_score=float(sig.get("confidence_score", 0.6)),
                        source_ref=sig.get("platform", "unknown"),
                        timestamp=now,
                    )
                )
                # Image anomaly relationship across duplicate profile images.
                previous_img = image_node_by_url.get(image_url)
                if previous_img:
                    edges.append(
                        GraphEdge(
                            source=previous_img,
                            target=img_id,
                            relation="image_similarity",
                            score=0.93,
                            confidence_score=0.93,
                            source_ref="anomaly_rule:image_reuse",
                            timestamp=now,
                        )
                    )
                image_node_by_url[image_url] = img_id

            if sig.get("bio_text"):
                txt_id = f"txt:{idx}"
                text_conf = float(sig.get("confidence_score", 0.5))
                nodes.append(
                    GraphNode(
                        id=txt_id,
                        label=f"Text Artifact {idx + 1}",
                        node_type="text_artifact",
                        suspicious=text_conf < 0.55,
                        verified=text_conf > 0.8,
                        metadata={"excerpt": str(sig.get("bio_text"))[:160]},
                        confidence_score=text_conf,
                        source=sig.get("platform", "unknown"),
                        timestamp=now,
                    )
                )
                edges.append(
                    GraphEdge(
                        source=(f"u:{identity_id}" if any(n.id == f"u:{identity_id}" for n in nodes) else "account:0"),
                        target=txt_id,
                        relation="text_similarity",
                        score=text_conf,
                        confidence_score=text_conf,
                        source_ref=sig.get("platform", "unknown"),
                        timestamp=now,
                    )
                )

            # Repository node creation rule for GitHub-discovered accounts.
            if sig.get("platform") == "github" and sig.get("username"):
                repo_id = f"repo:{sig.get('username')}"
                nodes.append(
                    GraphNode(
                        id=repo_id,
                        label=f"{sig.get('username')}/public",
                        node_type="repository",
                        suspicious=False,
                        verified=float(sig.get("confidence_score", 0.5)) > 0.8,
                        metadata={"origin_platform": "github"},
                        confidence_score=float(sig.get("confidence_score", 0.5)),
                        source="github_profile",
                        timestamp=now,
                    )
                )
                edges.append(
                    GraphEdge(
                        source=(f"u:{identity_id}" if any(n.id == f"u:{identity_id}" for n in nodes) else "account:0"),
                        target=repo_id,
                        relation="connected_to",
                        score=0.7,
                        confidence_score=0.7,
                        source_ref="github_profile",
                        timestamp=now,
                    )
                )
        return nodes, edges

    return build_seed_twin(identity_id)
