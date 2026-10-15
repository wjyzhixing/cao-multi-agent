#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

for profile in \
  my_supervisor \
  frontend_agy \
  backend_codex \
  reviewer_codex
do
  echo "Installing $profile..."
  cao install "$ROOT/profiles/$profile.md"
done

echo
echo "Installed profiles:"
cao profile list

echo
echo "Done."
