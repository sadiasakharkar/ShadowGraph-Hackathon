from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12)
    full_name: str

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        has_upper = any(ch.isupper() for ch in value)
        has_lower = any(ch.islower() for ch in value)
        has_digit = any(ch.isdigit() for ch in value)
        has_symbol = any(not ch.isalnum() for ch in value)
        if not (has_upper and has_lower and has_digit and has_symbol):
            raise ValueError("Password must include upper/lowercase letters, digits, and symbols")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str


class IdentitySignal(BaseModel):
    platform: str
    username: str
    profile_url: str
    bio_text: str = ""
    image_url: str = ""


class ScanRequest(BaseModel):
    root_username: str
    seed_platforms: list[str] = ["github", "x", "linkedin", "medium"]


class ScanStartRequest(BaseModel):
    identity_id: str
    username: str | None = None
    website_url: str | None = None
    profile_image_url: str | None = None
    platforms: list[str] = ["github", "x", "linkedin", "instagram", "medium"]


class GraphNode(BaseModel):
    id: str
    label: str
    node_type: str
    suspicious: bool = False
    verified: bool = False
    metadata: dict = {}
    confidence_score: float = 0.5
    source: str = "scan_pipeline"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str
    score: float = 0.0
    confidence_score: float = 0.5
    source_ref: str = "scan_pipeline"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class RiskScoreResponse(BaseModel):
    identity_duplication_probability: float
    content_misuse_probability: float
    deepfake_risk_indicators: float
    network_anomaly_signals: float
    overall_risk_score: float
    category: str


class AlertItem(BaseModel):
    title: str
    severity: str
    recommendation: str
    created_at: datetime
