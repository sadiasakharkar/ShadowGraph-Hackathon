# ShadowGraph-Hackathon

## 1. Project Summary

ShadowGraph-Hackathon is an AI-driven cybersecurity platform that builds a **digital identity twin** from publicly available online signals, maps those signals into a **graph intelligence model**, detects suspicious identity overlap, simulates attack propagation, and recommends defense actions.

This project is designed as a hackathon-ready, full-stack system with:

- cinematic frontend UX
- modular backend APIs
- dedicated AI service
- asynchronous scan orchestration
- graph-native threat analysis

---

## 2. Problem Statement

Modern identity abuse is multi-vector:

- fake lookalike accounts
- username impersonation
- profile image reuse
- writing-style mimicry
- trust-network exploitation

Most systems detect isolated events. ShadowGraph correlates all identity evidence into one graph and converts it into actionable risk and defense recommendations.

---

## 3. Core Systems

ShadowGraph implements five primary modules:

1. Digital Identity Twin Engine
2. Identity Graph Intelligence
3. AI Identity Fingerprinting
4. Threat Simulation Engine
5. Autonomous Identity Defense

---

## 4. Repository Structure

```text
ShadowGraph-Hackathon/
  frontend/
  backend/
  ai-services/
  graph-engine/
  data-pipelines/
  database/
  infrastructure/
  docs/
  tests/
```

### Notable folders

- `frontend/` Next.js app, cinematic UI, graph visualization.
- `backend/` FastAPI API layer and orchestration.
- `ai-services/` model features, training pipelines, inference APIs.
- `data-pipelines/` identity ingestion modules and matching pipeline assets.
- `database/` mongo + neo4j scripts/configs.
- `infrastructure/docker/` Dockerfiles for services.
- `tests/` API, integration, and UI test scaffolding.

---

## 5. Technology Stack

### Frontend

- Next.js 14
- TypeScript
- TailwindCSS
- Framer Motion
- Three.js / React Three Fiber

### Backend

- Python FastAPI
- Motor (MongoDB async)
- Redis
- Neo4j (async driver)

### AI/ML

- PyTorch (feature extraction utilities)
- scikit-learn (classification models)
- RapidFuzz (string similarity features)
- NumPy / PIL

### Infrastructure

- Docker + Docker Compose
- MongoDB
- Neo4j
- Redis

---

## 6. Runtime Architecture

### Services in `docker-compose.yml`

- `frontend` on `localhost:3001`
- `backend` on `localhost:8001`
- `ai-services` internal service
- `mongodb` on `localhost:27017`
- `neo4j` on `localhost:7474` and `localhost:7687`
- `redis` on `localhost:6379`

### Data flow

1. User configures scan input.
2. Backend launches ingestion pipeline.
3. Raw and normalized signals are stored in MongoDB.
4. Graph snapshot is created in Neo4j with version metadata.
5. AI similarity endpoints score identity relationships.
6. Threat simulation computes attack likelihood and blast radius.
7. Defense engine generates alerts and recommendations.
8. Frontend renders graph, risk panel, and alerts lifecycle.

---

## 7. Frontend Experience

### Primary pages

- `/` Cinematic landing page with long-scroll product narrative.
- `/login` Long-scroll login experience for demo flow.
- `/signup` Long-scroll onboarding flow.
- `/setup` Identity scan setup and pipeline overview.
- `/dashboard` Post-login command center with graph, risk, alerts, and extended analysis sections.

### UX characteristics

- dark cyber aesthetic with glow accents
- animated transitions between sections
- graph-centric interaction model
- guided demo mode for deterministic hackathon presentations

---

## 8. Backend API Design

### Main app setup

File: `backend/app/main.py`

Key characteristics:

- structured JSON logging
- CORS middleware
- rate limiting middleware
- security headers
- startup graph schema initialization
- scan worker startup/shutdown
- centralized exception handling

### Health endpoints

- `GET /health`
- `GET /health/backend`
- `GET /health/database`
- `GET /health/ai`

### Authentication

Prefix: `/api/auth`

- `POST /register`
- `POST /login`
- `GET /oauth/{provider}/url`
- `POST /oauth/{provider}/callback`

Note: Current local demo config allows auth bypass with env flags for hackathon speed.

### Identity + scan

Prefix: `/api/identity`

- `POST /signals`
- `POST /scan`
- `GET /risk`

Additional scan orchestration routes:

- `POST /scan/start`
- `GET /scan/status`
- `GET /scan/results`

### Graph

- `GET /api/graph`
- `GET /graph/latest`
- `GET /graph/version/{graph_version_id}`

### Threat + defense

- `GET /risk/analysis`
- `GET /alerts`
- `POST /alerts/{alert_id}/acknowledge`
- `POST /alerts/{alert_id}/resolve`

### AI proxy routes

Prefix: `/api/ai`

- `POST /username-similarity`
- `POST /stylometric-similarity`
- `POST /text-similarity`
- `POST /image-similarity`
- `POST /anomaly-detection`

---

## 9. Data Ingestion and Aggregation

Ingestion adapters collect public identity metadata for:

- GitHub profile signals
- public website profile extraction
- username discovery across target platforms
- profile image metadata and lightweight fingerprinting

### Normalized identity signal schema

Representative fields:

- `identity_id`
- `platform`
- `username`
- `display_name`
- `profile_image_url`
- `bio_text`
- `source_url`
- `timestamp`
- `confidence_score`

### Storage model

- raw adapter payloads -> MongoDB raw collections
- normalized signals -> MongoDB normalized collections
- graph-ready entities -> Neo4j graph builder pipeline

---

## 10. Graph Intelligence Engine

### Node labels

- `UserIdentity`
- `Account`
- `Image`
- `TextArtifact`
- `Repository`

### Edge types

- `HAS_ACCOUNT`
- `HAS_IMAGE`
- `SIMILAR_USERNAME`
- `SIMILAR_IMAGE`
- `SIMILAR_TEXT`
- `CONNECTED_TO`

### Versioning model

Every scan produces a new graph snapshot:

- version metadata persisted
- entities connected to graph version context
- confidence, source, and timestamp attached to nodes/edges

---

## 11. AI/ML Pipelines

## 11.1 Username Similarity

- Features: fuzzy string ratios + lexical overlap + length-based signals
- Model: `username_similarity_model.joblib`

## 11.2 Stylometric Text Similarity

- Features include:
  - sentence and token statistics
  - punctuation and uppercase patterns
  - fuzzy text overlap
  - token/character n-gram overlap features
- Model: `text_similarity_model.joblib`

## 11.3 Image Similarity

- Deterministic visual embedding features from RGB distribution + gradients
- Pair features include:
  - embeddings for A and B
  - absolute difference
  - element-wise interaction
  - cosine and distance metrics
- Model: `image_similarity_model.joblib`

### Training artifacts

- datasets: `ai-services/datasets/*.csv`
- models: `ai-services/models/*.joblib`
- reports: `ai-services/reports/*`
- scripts: `ai-services/training/*`

---

## 12. Current Training Metrics (4,000 samples per task)

Source: `ai-services/reports/evaluation_summary.json`

- Username
  - Accuracy: 0.976
  - Precision: 0.9612
  - Recall: 0.992
  - F1: 0.9764

- Text
  - Accuracy: 0.851
  - Precision: 0.814
  - Recall: 0.910
  - F1: 0.8593

- Image
  - Accuracy: 0.998
  - Precision: 1.000
  - Recall: 0.996
  - F1: 0.9980

---

## 13. Threat Simulation Engine

Threat analysis combines graph topology and similarity evidence to estimate:

- attack likelihood
- blast radius
- affected assets
- recommended mitigation

Scenarios include:

- username impersonation
- image reuse identity cloning
- suspicious graph cluster propagation

Output is explainable and includes risk factors and affected nodes.

---

## 14. Autonomous Defense Workflow

Alert lifecycle:

- `open`
- `acknowledged`
- `resolved`

Defense recommendations may include:

- report impersonation profiles
- enable MFA
- rotate account credentials
- reduce exposed metadata
- strengthen profile verification links

---

## 15. Security, Reliability, and Observability

Implemented controls:

- request rate limiting
- structured request logs
- request ID propagation
- security response headers
- centralized exception handling
- DB and AI health checks
- optional Sentry integration for error tracking

---

## 16. Environment Configuration

Use `.env.example` as template:

```bash
cp .env.example .env
```

Important env variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `MONGO_URI`, `MONGO_DB`
- `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`
- `REDIS_URL`
- `AI_SERVICE_URL`
- `JWT_SECRET`, `JWT_ALGORITHM`
- `DISABLE_AUTH`, `DEMO_USER_ID`
- `NEXT_PUBLIC_ENABLE_SOCIAL_AUTH`
- OAuth client IDs/secrets if social login is enabled

---

## 17. Run Instructions

## 17.1 Docker (recommended)

```bash
docker compose up --build
```

URLs:

- Frontend: `http://localhost:3001`
- Backend docs: `http://localhost:8001/docs`
- Neo4j Browser: `http://localhost:7474`

## 17.2 Local development

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

AI service:

```bash
cd ai-services
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8100
```

---

## 18. Demo and Presentation Flow

Recommended hackathon flow:

1. Start on landing page and explain problem + product vision.
2. Show setup page and scan pipeline configuration.
3. Open dashboard in guided demo mode.
4. Highlight graph + suspicious node metadata.
5. Show risk score and threat simulation paths.
6. Demonstrate alert acknowledge/resolve lifecycle.
7. Close with autonomous defense recommendations and real-world impact.

---

## 19. What Makes ShadowGraph Different

- end-to-end identity intelligence (not isolated detection)
- explainable graph + AI scoring
- deterministic demo mode for reliable judging
- cinematic command-center UX
- practical defense output, not just alerts

---

## 20. Future Innovation Roadmap

- multimodal deepfake detection (audio/video)
- enterprise SOC workflow mode with RBAC
- automated takedown evidence packs
- trust-score API for external platforms
- privacy-preserving federated learning
- decentralized identity verification integrations

---

## 21. Quick Commands

Regenerate ML datasets and retrain:

```bash
python3 ai-services/training/build_datasets.py
python3 ai-services/training/train_all.py
```

Compile-check Python modules:

```bash
python3 -m compileall ai-services/app ai-services/training backend/app
```

---

## 22. Notes for Judges

This repository demonstrates a complete hackathon MVP with integrated frontend, backend, graph intelligence, and AI pipelines. It is built for live demo impact while remaining modular enough for production hardening.
