import os
import secrets
import time
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException

from app.models.schemas import RegisterRequest, LoginRequest, AuthResponse, OAuthStartResponse, OAuthCallbackRequest
from app.security.auth import hash_password, verify_password, create_access_token
from app.services import db

router = APIRouter()

_oauth_state_fallback: dict[str, dict] = {}


def _oauth_config(provider: str) -> dict:
    provider = provider.lower()
    if provider == "google":
        return {
            "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", ""),
            "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
            "token_url": "https://oauth2.googleapis.com/token",
            "scope": "openid email profile",
        }
    if provider == "github":
        return {
            "client_id": os.getenv("GITHUB_CLIENT_ID", ""),
            "client_secret": os.getenv("GITHUB_CLIENT_SECRET", ""),
            "authorize_url": "https://github.com/login/oauth/authorize",
            "token_url": "https://github.com/login/oauth/access_token",
            "scope": "read:user user:email",
        }
    raise HTTPException(status_code=400, detail="Unsupported OAuth provider")


async def _store_state(state: str, payload: dict) -> None:
    if db.redis_client:
        await db.redis_client.setex(f"oauth_state:{state}", 600, __import__("json").dumps(payload))
        return
    _oauth_state_fallback[state] = {**payload, "expires_at": time.time() + 600}


async def _read_state(state: str) -> dict | None:
    if db.redis_client:
        raw = await db.redis_client.get(f"oauth_state:{state}")
        if not raw:
            return None
        return __import__("json").loads(raw)
    payload = _oauth_state_fallback.get(state)
    if not payload:
        return None
    if payload["expires_at"] < time.time():
        _oauth_state_fallback.pop(state, None)
        return None
    return payload


async def _delete_state(state: str) -> None:
    if db.redis_client:
        await db.redis_client.delete(f"oauth_state:{state}")
        return
    _oauth_state_fallback.pop(state, None)


@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest) -> AuthResponse:
    existing = await db.mongo_db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")
    doc = {
        "email": payload.email,
        "full_name": payload.full_name,
        "password_hash": hash_password(payload.password),
    }
    result = await db.mongo_db.users.insert_one(doc)
    token = create_access_token(str(result.inserted_id))
    return AuthResponse(access_token=token, user_id=str(result.inserted_id))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest) -> AuthResponse:
    user = await db.mongo_db.users.find_one({"email": payload.email})
    if not user or not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = str(user["_id"])
    token = create_access_token(user_id)
    return AuthResponse(access_token=token, user_id=user_id)


@router.get("/oauth/{provider}/url", response_model=OAuthStartResponse)
async def oauth_authorization_url(provider: str, redirect_uri: str) -> OAuthStartResponse:
    config = _oauth_config(provider)
    if not config["client_id"] or not config["client_secret"]:
        raise HTTPException(status_code=400, detail=f"{provider.title()} OAuth is not configured")

    state = secrets.token_urlsafe(24)
    await _store_state(state, {"provider": provider, "redirect_uri": redirect_uri})
    params = {
        "client_id": config["client_id"],
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": config["scope"],
        "state": state,
    }
    if provider == "google":
        params["access_type"] = "offline"
        params["prompt"] = "consent"
    return OAuthStartResponse(authorization_url=f"{config['authorize_url']}?{urlencode(params)}", state=state)


async def _exchange_code(provider: str, code: str, redirect_uri: str) -> str:
    config = _oauth_config(provider)
    async with httpx.AsyncClient(timeout=12.0) as client:
        if provider == "google":
            token = await client.post(
                config["token_url"],
                data={
                    "client_id": config["client_id"],
                    "client_secret": config["client_secret"],
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": redirect_uri,
                },
            )
            token.raise_for_status()
            return token.json().get("access_token", "")

        token = await client.post(
            config["token_url"],
            data={
                "client_id": config["client_id"],
                "client_secret": config["client_secret"],
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        token.raise_for_status()
        return token.json().get("access_token", "")


async def _resolve_profile(provider: str, access_token: str) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=12.0) as client:
        if provider == "google":
            profile = await client.get("https://www.googleapis.com/oauth2/v3/userinfo", headers=headers)
            profile.raise_for_status()
            p = profile.json()
            return {
                "provider_id": str(p.get("sub") or ""),
                "email": p.get("email"),
                "full_name": p.get("name") or p.get("given_name") or "Google User",
            }

        headers["User-Agent"] = "ShadowGraph-Hackathon"
        profile = await client.get("https://api.github.com/user", headers=headers)
        profile.raise_for_status()
        p = profile.json()
        email = p.get("email")
        if not email:
            emails = await client.get("https://api.github.com/user/emails", headers=headers)
            if emails.status_code == 200:
                email_list = emails.json() or []
                primary = next((e for e in email_list if e.get("primary")), None) or (email_list[0] if email_list else None)
                email = (primary or {}).get("email")
        return {
            "provider_id": str(p.get("id") or ""),
            "email": email or f"github_{p.get('id')}@users.noreply.github.com",
            "full_name": p.get("name") or p.get("login") or "GitHub User",
        }


@router.post("/oauth/{provider}/callback", response_model=AuthResponse)
async def oauth_callback(provider: str, payload: OAuthCallbackRequest) -> AuthResponse:
    state_payload = await _read_state(payload.state)
    if not state_payload or state_payload.get("provider") != provider or state_payload.get("redirect_uri") != payload.redirect_uri:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")

    await _delete_state(payload.state)
    access_token = await _exchange_code(provider, payload.code, payload.redirect_uri)
    if not access_token:
        raise HTTPException(status_code=400, detail="OAuth token exchange failed")

    profile = await _resolve_profile(provider, access_token)
    oauth_field = f"oauth_{provider}_id"
    user = await db.mongo_db.users.find_one({oauth_field: profile["provider_id"]})
    if not user:
        user = await db.mongo_db.users.find_one({"email": profile["email"]})

    if user:
        await db.mongo_db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {oauth_field: profile["provider_id"], "full_name": user.get("full_name") or profile["full_name"]}},
        )
        user_id = str(user["_id"])
    else:
        insert = await db.mongo_db.users.insert_one(
            {
                "email": profile["email"],
                "full_name": profile["full_name"],
                oauth_field: profile["provider_id"],
                "password_hash": None,
            }
        )
        user_id = str(insert.inserted_id)

    token = create_access_token(user_id)
    return AuthResponse(access_token=token, user_id=user_id)
