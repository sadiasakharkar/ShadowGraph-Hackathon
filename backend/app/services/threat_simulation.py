from collections import defaultdict
from typing import Any


def _platform_of(node: dict[str, Any]) -> str:
    metadata = node.get("metadata") or {}
    return (metadata.get("platform") or metadata.get("origin_platform") or node.get("source") or "unknown").lower()


def simulate_identity_attacks(nodes: list[dict], edges: list[dict]) -> dict:
    node_map = {n["id"]: n for n in nodes}
    suspicious_nodes = [n for n in nodes if n.get("suspicious")]

    username_edges = [e for e in edges if str(e.get("relation", "")).upper() == "SIMILAR_USERNAME"]
    image_edges = [e for e in edges if str(e.get("relation", "")).upper() == "SIMILAR_IMAGE"]
    connected_edges = [e for e in edges if str(e.get("relation", "")).upper() in {"CONNECTED_TO", "HAS_ACCOUNT", "HAS_IMAGE"}]

    fake_account_nodes = [n for n in suspicious_nodes if n.get("node_type") == "account"]
    image_reuse_nodes = [
        n
        for n in nodes
        if n.get("node_type") == "image" and ((n.get("metadata") or {}).get("image_reuse") or n.get("suspicious"))
    ]
    impersonation_edges = [e for e in username_edges if float(e.get("confidence_score") or e.get("score") or 0.0) >= 0.6]

    attack_paths = []

    # 1) Fake account creation path simulation.
    for n in fake_account_nodes:
        for e in connected_edges:
            if e.get("source") == n["id"] or e.get("target") == n["id"]:
                attack_paths.append({"scenario": "fake_account_creation", **e})

    # 2) Image reuse path simulation.
    for n in image_reuse_nodes:
        for e in image_edges + connected_edges:
            if e.get("source") == n["id"] or e.get("target") == n["id"]:
                attack_paths.append({"scenario": "image_reuse", **e})

    # 3) Username impersonation path simulation.
    for e in impersonation_edges:
        attack_paths.append({"scenario": "username_impersonation", **e})

    # Propagation estimate: affected nodes touched by any simulated attack edge.
    affected_nodes = set()
    for p in attack_paths:
        affected_nodes.add(p.get("source"))
        affected_nodes.add(p.get("target"))
    affected_nodes.discard(None)

    blast_radius = round(len(affected_nodes) / max(len(nodes), 1), 4)

    # Target platform impact mapping.
    platform_hits: dict[str, int] = defaultdict(int)
    for nid in affected_nodes:
        platform_hits[_platform_of(node_map.get(nid, {}))] += 1
    total_hits = max(sum(platform_hits.values()), 1)
    target_platform_impact = {k: round(v / total_hits, 4) for k, v in platform_hits.items()}

    fake_likelihood = min(1.0, (len(fake_account_nodes) / max(len(nodes), 1)) * 2.2)
    image_likelihood = min(1.0, (len(image_reuse_nodes) / max(len(nodes), 1)) * 2.0)
    impersonation_likelihood = min(1.0, (len(impersonation_edges) / max(len(edges), 1)) * 3.0)

    attack_likelihood = round((0.38 * fake_likelihood) + (0.31 * image_likelihood) + (0.31 * impersonation_likelihood), 4)
    overall_risk_score = round((0.65 * attack_likelihood) + (0.35 * blast_radius), 4)

    scenarios = [
        {
            "type": "fake_account_creation",
            "risk_score": round(fake_likelihood, 4),
            "risk_factors": [
                "suspicious account nodes detected",
                "new account connected to trusted identity graph",
            ],
            "affected_nodes": [n["id"] for n in fake_account_nodes],
            "recommended_actions": [
                "report suspicious accounts to platform trust team",
                "claim close username variants",
                "enable mandatory MFA on primary identity accounts",
            ],
        },
        {
            "type": "image_reuse",
            "risk_score": round(image_likelihood, 4),
            "risk_factors": [
                "profile image reused across multiple accounts",
                "image-linked nodes flagged suspicious",
            ],
            "affected_nodes": [n["id"] for n in image_reuse_nodes],
            "recommended_actions": [
                "rotate profile photos on critical accounts",
                "file takedown requests for reused images",
            ],
        },
        {
            "type": "username_impersonation",
            "risk_score": round(impersonation_likelihood, 4),
            "risk_factors": [
                "high-confidence username similarity edges",
                "potential impersonation naming pattern",
            ],
            "affected_nodes": sorted(list({e.get("source") for e in impersonation_edges} | {e.get("target") for e in impersonation_edges})),
            "recommended_actions": [
                "publish verified profile links",
                "monitor platform search results for near-match usernames",
            ],
        },
    ]

    # attach scenario-specific path lists
    for s in scenarios:
        s["attack_paths"] = [
            {
                "source": p.get("source"),
                "target": p.get("target"),
                "relation": p.get("relation"),
                "confidence_score": p.get("confidence_score", p.get("score", 0)),
            }
            for p in attack_paths
            if p.get("scenario") == s["type"]
        ]

    risk_factors = [
        "fake account creation vectors",
        "image reuse relationships",
        "username impersonation edges",
    ]

    recommended_actions = sorted({a for s in scenarios for a in s["recommended_actions"]})

    return {
        "overall_risk_score": overall_risk_score,
        "attack_likelihood": attack_likelihood,
        "blast_radius": blast_radius,
        "target_platform_impact": target_platform_impact,
        "risk_factors": risk_factors,
        "affected_nodes": sorted(list(affected_nodes)),
        "recommended_actions": recommended_actions,
        "scenarios": scenarios,
        "attack_paths": [
            {
                "source": p.get("source"),
                "target": p.get("target"),
                "relation": p.get("relation"),
                "confidence_score": p.get("confidence_score", p.get("score", 0)),
            }
            for p in attack_paths
        ],
    }
