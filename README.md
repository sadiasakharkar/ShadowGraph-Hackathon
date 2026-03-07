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
  - Risk retrieval (`/api/identity/risk`)
  - Graph retrieval (`/api/graph`)
  - Alerts (`/api/alerts`)
  - AI proxy routes (`/api/ai/*`)

- AI Services (`FastAPI + PyTorch + sklearn`)
  - `/image-embedding`
  - `/username-similarity`
  - `/stylometric-similarity`
  - `/anomaly-detection`

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

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000/docs](http://localhost:8000/docs)
- AI Services: [http://localhost:8100/docs](http://localhost:8100/docs)
- Neo4j Browser: [http://localhost:7474](http://localhost:7474)

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
