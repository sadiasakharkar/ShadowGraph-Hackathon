import os
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET = os.getenv("JWT_SECRET", "replace_me_super_secret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_AUDIENCE = os.getenv("JWT_AUDIENCE", "shadowgraph-users")
JWT_ISSUER = os.getenv("JWT_ISSUER", "shadowgraph-backend")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(subject: str, minutes: int | None = None) -> str:
    ttl_minutes = minutes if minutes is not None else int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "240"))
    expire = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "exp": expire,
        "iat": now,
        "nbf": now,
        "aud": JWT_AUDIENCE,
        "iss": JWT_ISSUER,
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        SECRET,
        algorithms=[ALGORITHM],
        audience=JWT_AUDIENCE,
        issuer=JWT_ISSUER,
        options={"require_sub": True, "require_exp": True, "require_iat": True},
    )
