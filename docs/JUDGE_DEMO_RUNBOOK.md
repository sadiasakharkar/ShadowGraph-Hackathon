# Hackathon Judge Demo Runbook

## Fast Start

```bash
./scripts/hackathon_judge_demo.sh
```

Open:

- `http://127.0.0.1:3001/dashboard?demo=1`

This launches deterministic guided demo mode for repeatable presentations.

## Demo Storyline (Suggested)

1. Show guided scan progress animation.
2. Explain suspicious red nodes and attack path edges.
3. Open risk and threat simulation panels.
4. Open alerts and trigger `Acknowledge` / `Resolve`.
5. Mention offline fallback behavior:
   - If backend is unreachable, dashboard auto-switches to seeded demo mode.

## Backup Plan

If internet or backend services fail:

- Keep using `?demo=1` deterministic mode.
- All graph/risk/alerts interactions still render from local seeded data.

