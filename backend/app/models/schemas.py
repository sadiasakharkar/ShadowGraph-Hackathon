from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str


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


class GraphNode(BaseModel):
    id: str
    label: str
    node_type: str
    suspicious: bool = False
    verified: bool = False
    metadata: dict = {}


class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str
    score: float = 0.0


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
