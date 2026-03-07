from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import auth as auth_api
from app.services import db
from tests.helpers.fake_db import make_fake_db


def test_register_and_login_flow():
    app = FastAPI()
    app.include_router(auth_api.router, prefix="/api/auth")
    db.mongo_db = make_fake_db()
    client = TestClient(app)

    register_payload = {
        "email": "judge@shadowgraph.ai",
        "password": "JudgePass#2026",
        "full_name": "Judge User",
    }
    reg = client.post("/api/auth/register", json=register_payload)
    assert reg.status_code == 200
    assert "access_token" in reg.json()

    login = client.post("/api/auth/login", json={"email": register_payload["email"], "password": register_payload["password"]})
    assert login.status_code == 200
    body = login.json()
    assert body["token_type"] == "bearer"
    assert body["user_id"]
