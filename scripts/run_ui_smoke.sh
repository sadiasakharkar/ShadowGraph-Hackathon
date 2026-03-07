#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
npx playwright test --config=playwright.config.ts

