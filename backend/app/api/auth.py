from fastapi import APIRouter, HTTPException

from app.models.schemas import RegisterRequest, LoginRequest, AuthResponse
from app.security.auth import hash_password, verify_password, create_access_token
from app.services import db

router = APIRouter()


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
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = str(user["_id"])
    token = create_access_token(user_id)
    return AuthResponse(access_token=token, user_id=user_id)
