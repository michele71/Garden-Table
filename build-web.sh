#!/bin/bash
set -e
REPO_ROOT=$(pwd)
pnpm install --frozen-lockfile
cd artifacts/garden-table
npx expo export --platform web --output-dir "$REPO_ROOT/dist"
