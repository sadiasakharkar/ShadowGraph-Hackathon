#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== ShadowGraph Hackathon Judge Demo =="
echo "1) Starting services..."
docker compose up -d --build frontend backend mongodb neo4j redis ai-services

echo "2) Waiting for backend health..."
for i in {1..30}; do
  if curl -fsS http://127.0.0.1:8001/health/backend >/dev/null; then
    break
  fi
  sleep 2
done

echo "3) Open cinematic deterministic demo mode:"
echo "   http://127.0.0.1:3001/dashboard?demo=1"
echo
echo "4) Optional live API smoke flow:"
echo "   ./scripts/run_api_tests.sh"
echo
echo "5) Optional UI smoke tests:"
echo "   ./scripts/run_ui_smoke.sh"

