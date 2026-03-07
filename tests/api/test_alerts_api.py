from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import alerts as alerts_api
from app.security.deps import get_current_user_id
from app.services import db
from tests.helpers.fake_db import make_fake_db


async def _fake_latest_graph(_user_id: str) -> dict:
    return {
        "graph_version_id": "gv-test-1",
        "nodes": [
            {"id": "u1", "node_type": "useridentity", "suspicious": False, "metadata": {"platform": "core"}},
            {"id": "a1", "node_type": "account", "suspicious": True, "metadata": {"platform": "linkedin"}},
            {"id": "i1", "node_type": "image", "suspicious": True, "metadata": {"platform": "linkedin", "image_reuse": True}},
        ],
        "edges": [
            {"source": "a1", "target": "u1", "relation": "SIMILAR_USERNAME", "confidence_score": 0.88},
            {"source": "i1", "target": "a1", "relation": "SIMILAR_IMAGE", "confidence_score": 0.9},
        ],
    }


def test_alert_lifecycle_endpoints(monkeypatch):
    app = FastAPI()
    app.include_router(alerts_api.router)
    app.dependency_overrides[get_current_user_id] = lambda: "user-1"
    db.mongo_db = make_fake_db()
    monkeypatch.setattr(alerts_api, "read_latest_graph", _fake_latest_graph)
    client = TestClient(app)

    get_alerts = client.get("/alerts")
    assert get_alerts.status_code == 200
    alerts = get_alerts.json()["alerts"]
    assert len(alerts) >= 2
    open_alert = next(a for a in alerts if a["state"] == "open")

    ack = client.post(f"/alerts/{open_alert['id']}/acknowledge")
    assert ack.status_code == 200
    assert ack.json()["alert"]["state"] == "acknowledged"

    resolved = client.post(f"/alerts/{open_alert['id']}/resolve")
    assert resolved.status_code == 200
    assert resolved.json()["alert"]["state"] == "resolved"
