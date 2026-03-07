# ShadowGraph-Hackathon Architecture

ShadowGraph-Hackathon is a modular full-stack system for AI-driven digital identity intelligence.

## Modules

- `frontend`: Next.js TypeScript cinematic UI and 3D dashboard.
- `backend`: FastAPI orchestration APIs for auth, scans, graph, risk, and alerts.
- `ai-services`: PyTorch-based identity analysis services.
- `graph-engine`: Neo4j graph intelligence construction and mapping logic.
- `data-pipelines`: public identity discovery and matching pipelines.
- `database`: seed data and scripts for MongoDB and Neo4j.
- `infrastructure`: Dockerfiles and runtime configuration.

## Runtime Data Flow

1. User authenticates from frontend.
2. User submits identity signals and triggers scan.
3. Backend enriches with AI-service similarity scores.
4. Graph engine maps entities/relations and persists to Neo4j.
5. Threat simulation computes risk score and category.
6. Autonomous defense returns prioritized alert recommendations.
7. Frontend dashboard visualizes graph and defense insights.
