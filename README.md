# ShadowGraph-Hackathon - AI Digital Twin & Identity Intelligence Platform

This repository (`ShadowGraph-Hackathon`) is a full-stack hackathon project designed as a modular cybersecurity platform that builds and monitors a digital identity twin.

## Core Systems

- Digital Identity Twin Engine: Creates a graph-backed twin from public identity signals.
- Identity Graph Intelligence: Maps identity nodes/relationships in Neo4j for exploration.
- AI Identity Fingerprinting: Username, stylometric, image embedding, and anomaly analysis.
- Identity Threat Simulation Engine: Produces a weighted risk score and threat category.
- Autonomous Identity Defense System: Generates contextual protection alerts and actions.

## Monorepo Structure

```text
ShadowGraph-Hackathon/
  frontend/
    components/
    pages/
    three-visualization/
    hooks/
    services/
    styles/
  backend/
    app/
      api/
      services/
      models/
      graph/
      security/
  ai-services/
    app/
    image-analysis/
    text-analysis/
    anomaly-detection/
  graph-engine/
    graph_engine/
  data-pipelines/
    scrapers/
    identity-matching/
  database/
    mongo/
    neo4j/
  infrastructure/
    docker/
    config/
```

## Architecture Overview

- Frontend (`Next.js + TypeScript + Tailwind + Framer Motion + React Three Fiber`)
  - Landing page, signup/login, identity setup, cinematic dashboard.
  - 3D rotating graph with suspicious (red glow) and verified (green glow) nodes.
  - Node click/hover metadata inspection.

- Backend (`FastAPI`)
  - Authentication (`/api/auth/register`, `/api/auth/login`)
  - Identity ingestion (`/api/identity/signals`)
  - Identity scanning + twin generation (`/api/identity/scan`)
  - Async scan orchestration (`/scan/start`, `/scan/status`, `/scan/results`)
  - Versioned graph APIs (`/graph/latest`, `/graph/version/{id}`)
  - Threat simulation API (`/risk/analysis`)
  - Risk retrieval (`/api/identity/risk`)
  - Graph retrieval (`/api/graph`)
  - Alerts and defense lifecycle (`/alerts`)
  - AI proxy routes (`/api/ai/*`)

- AI Services (`FastAPI + PyTorch + sklearn`)
  - `/image-embedding`
  - `/username-similarity`
  - `/stylometric-similarity`
  - `/anomaly-detection`
  - `/ai/username-similarity`
  - `/ai/image-similarity`
  - `/ai/text-similarity`

- Data Layer
  - MongoDB: users, scan results, alerts context.
  - Neo4j: identity graph nodes/edges.
  - Redis: risk cache and queue-ready cache layer.

## Risk Scoring Algorithm

Threat Simulation Engine computes:

```text
overall = 0.34*duplication + 0.27*content_misuse + 0.22*deepfake + 0.17*network_anomaly
```

Risk categories:

- `critical` >= 0.75
- `high` >= 0.50
- `medium` >= 0.30
- `low` < 0.30

Signals include username collision, profile image reuse, writing-style overlap, and graph anomalies.

## Ingestion Pipeline

- Adapters:
  - GitHub public profiles
  - Public website profiles
  - Generic username discovery across platforms
  - Profile image metadata
- Raw signals are stored in MongoDB collection: `raw_identity_signals`.
- Normalized signals are stored in MongoDB collection: `normalized_identity_signals`.
- Redis queue key `scan_jobs` powers async scan workers.
- Graph engine consumes normalized signals to build Neo4j graph nodes/edges.

## Graph Intelligence Engine

- Neo4j typed schema:
  - Nodes: `UserIdentity`, `Account`, `Image`, `TextArtifact`, `Repository`
  - Edges: `HAS_ACCOUNT`, `HAS_IMAGE`, `SIMILAR_USERNAME`, `SIMILAR_IMAGE`, `SIMILAR_TEXT`, `CONNECTED_TO`
- Every scan creates a graph snapshot version (`GraphVersion`) and links discovered entities to that version.
- Every node and edge stores:
  - `confidence_score`
  - `source`
  - `timestamp`
- Version metadata is also persisted in MongoDB collection `graph_versions`.
- Graph schema details: `docs/GRAPH_SCHEMA.md`.

## ML Identity Fingerprinting Pipelines

- Username similarity pipeline:
  - dataset: `ai-services/datasets/username_pairs.csv`
  - model: `ai-services/models/username_similarity_model.joblib`
- Image identity pipeline:
  - dataset: `ai-services/datasets/image_pairs.csv`
  - embeddings from ResNet18 feature extractor
  - model: `ai-services/models/image_similarity_model.joblib`
- Stylometric text pipeline:
  - dataset: `ai-services/datasets/text_pairs.csv`
  - features: sentence length, vocabulary distribution, punctuation patterns
  - model: `ai-services/models/text_similarity_model.joblib`
- Evaluation reports:
  - `ai-services/reports/evaluation_report.md`
  - `ai-services/reports/evaluation_summary.json`
- Full pipeline guide: `docs/ML_PIPELINES.md`.

## Threat Simulation Engine

- Simulates attack paths from the latest identity graph:
  - fake account creation
  - image reuse
  - username impersonation
- Computes:
  - attack likelihood
  - blast radius
  - target platform impact
- Returns explainable outputs:
  - risk score
  - risk factors
  - affected nodes
  - recommended actions
- API:
  - `GET /risk/analysis`

## Autonomous Defense Workflow

- Converts threat simulation and risk insights into actionable playbooks:
  - report impersonation accounts
  - enable multi-factor authentication
  - secure exposed profiles
- Alert lifecycle states:
  - `open`
  - `acknowledged`
  - `resolved`
- APIs:
  - `GET /alerts`
  - `POST /alerts/{id}/acknowledge`
  - `POST /alerts/{id}/resolve`

## Environment Variables

Copy `.env.example` and adjust as needed:

- `NEXT_PUBLIC_API_BASE_URL`
- `MONGO_URI`, `MONGO_DB`
- `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`
- `REDIS_URL`
- `JWT_SECRET`, `JWT_ALGORITHM`
- `AI_SERVICE_URL`
- `CORS_ORIGINS`

## Run With Docker

From the repository root (`ShadowGraph-Hackathon/`) directory:

```bash
docker compose up --build
```

Services:

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend: [http://localhost:8001/docs](http://localhost:8001/docs)
- AI Services: internal container service (reachable by backend at `http://ai-services:8100`)
- Neo4j Browser: [http://localhost:7474](http://localhost:7474)

Health endpoints:

- Backend service: `GET /health/backend`
- Database connectivity (MongoDB + Neo4j + Redis): `GET /health/database`
- AI connectivity from backend: `GET /health/ai`

## Local Development (Without Docker)

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

AI services:

```bash
cd ai-services
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8100
```

## Test Identity Scanning Flow

1. Open frontend and create an account.
2. Complete setup with a username (e.g., `demoanalyst`).
3. Scan builds a digital twin and writes nodes/edges to Neo4j.
4. Dashboard loads graph, risk score, and defense alerts.
5. Click/hover nodes to inspect metadata.

## API Smoke Test (End-to-End)

The sequence below validates signup, login, signal ingestion, scan trigger, graph retrieval, risk retrieval, and alerts:

```bash
# 1) register
curl -s -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo_user@shadowgraph.ai","password":"ShadowGraph123","full_name":"Demo User"}'

# 2) login (copy access_token)
curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo_user@shadowgraph.ai","password":"ShadowGraph123"}'

# 3) submit signal
curl -s -X POST http://localhost:8001/api/identity/signals \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"platform":"github","username":"demoanalyst","profile_url":"https://github.com/demoanalyst","bio_text":"security engineer","image_url":"https://example.com/avatar.png"}'

# 4) run scan
curl -s -X POST http://localhost:8001/api/identity/scan \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"root_username":"demoanalyst","seed_platforms":["github","x","linkedin"]}'

# 5) read graph/risk/alerts
curl -s http://localhost:8001/api/graph -H "Authorization: Bearer <TOKEN>"
curl -s http://localhost:8001/api/identity/risk -H "Authorization: Bearer <TOKEN>"
curl -s http://localhost:8001/alerts -H "Authorization: Bearer <TOKEN>"
```

## Ingestion Scan Queue API

```bash
# Start asynchronous ingestion scan
curl -s -X POST http://localhost:8001/scan/start \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"identity_id":"demo-id-1","username":"torvalds","website_url":"https://github.com/torvalds","profile_image_url":"https://avatars.githubusercontent.com/u/1024025?v=4","platforms":["github","x","linkedin","instagram"]}'

# Poll status
curl -s "http://localhost:8001/scan/status?scan_id=<SCAN_ID>" -H "Authorization: Bearer <TOKEN>"

# Fetch aggregated result payload
curl -s "http://localhost:8001/scan/results?scan_id=<SCAN_ID>" -H "Authorization: Bearer <TOKEN>"
```

## Seed Data

- `database/mongo/seed.json` includes a demo account document.
- `database/neo4j/seed.cypher` includes a sample suspicious identity relationship.

## Security and Scraping Notes

- Scrapers are modular and restricted to public pages only.
- Selenium scanner is optional and disabled by default.
- This MVP is designed for hackathon and demo usage; production hardening should add:
  - robust password policy and refresh token flow,
  - platform-specific legal compliance checks,
  - signed scraping task queues and audit logging.
