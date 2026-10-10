#!/usr/bin/env bash
# ==============================================================================
# BlueLoop Verification Script
# Runs backend pytest suite and frontend typecheck/build
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== [1/2] Running Backend Verification ==="
cd "$REPO_ROOT/backend"
if [ -d ".venv" ]; then
  source .venv/bin/activate
fi
pytest
echo "✓ Backend verification passed."

echo ""
echo "=== [2/2] Running Frontend Verification ==="
cd "$REPO_ROOT/frontend"
npm run typecheck
npm run build
echo "✓ Frontend verification passed."

echo ""
echo "=== All BlueLoop foundation checks passed successfully! ==="
