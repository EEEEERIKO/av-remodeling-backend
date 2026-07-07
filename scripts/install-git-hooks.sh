#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_DIR="$ROOT_DIR/.githooks"
GIT_HOOKS_DIR="$ROOT_DIR/.git/hooks"

if [ ! -d "$GIT_HOOKS_DIR" ]; then
  echo ".git/hooks not found. Are you inside a git repository?" >&2
  exit 1
fi

echo "Installing git hooks from $HOOKS_DIR to $GIT_HOOKS_DIR"
for hook in "$HOOKS_DIR"/*; do
  name=$(basename "$hook")
  cp "$hook" "$GIT_HOOKS_DIR/$name"
  chmod +x "$GIT_HOOKS_DIR/$name"
  echo "Installed $name"
done

echo "Git hooks installed."
