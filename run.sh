#!/usr/bin/env bash
set -euo pipefail

SESSION_NAME="${1:-feature}"
TASK_FILE="${2:-task.md}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

if [[ ! -f "$TASK_FILE" ]]; then
  if [[ -f "$ROOT/$TASK_FILE" ]]; then
    TASK_FILE="$ROOT/$TASK_FILE"
  else
    echo "Task file not found: $TASK_FILE"
    exit 1
  fi
fi

export CAO_ENABLE_WORKING_DIRECTORY=true

cao launch \
  --agents my_supervisor \
  --session-name "$SESSION_NAME" \
  --working-directory "$PWD" \
  --auto-approve

cao session send "cao-$SESSION_NAME" "$(cat "$TASK_FILE")"

echo
echo "Started: cao-$SESSION_NAME"
echo "Status : cao session status cao-$SESSION_NAME --workers"
echo "Attach : tmux attach -t cao-$SESSION_NAME"
echo "Stop   : cao shutdown --session cao-$SESSION_NAME"
