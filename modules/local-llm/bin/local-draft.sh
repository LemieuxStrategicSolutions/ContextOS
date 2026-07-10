#!/usr/bin/env bash
# local-draft.sh — minimal wrapper for the local drafting worker.
#
#   local-draft.sh "PROMPT"            # prompt as arg
#   echo "context" | local-draft.sh "PROMPT"   # optional stdin context appended
#
# Talks to a local Ollama server; no data leaves the machine. Remember the policy
# (README.md): raw output is never final — your main AI persona curates it.
set -euo pipefail

OLLAMA_URL="${LOCAL_DRAFT_URL:-http://127.0.0.1:11434}"
MODEL="${LOCAL_DRAFT_MODEL:-llama3.1:8b}"

[[ $# -ge 1 ]] || { echo "usage: local-draft.sh \"PROMPT\" (optional context on stdin)" >&2; exit 2; }
prompt="$1"

# Reachability check — fail fast and honestly if the server isn't up (never pretend).
if ! curl -sf --max-time 3 "$OLLAMA_URL/api/version" >/dev/null; then
  echo "local-draft: no local model server at $OLLAMA_URL — is 'ollama serve' running?" >&2
  exit 1
fi

# Append stdin (if any) as context.
if [ ! -t 0 ]; then
  ctx="$(cat)"
  [[ -n "$ctx" ]] && prompt="$prompt

--- context ---
$ctx"
fi

# JSON-encode the prompt safely via python (no jq dependency), then stream the response.
payload="$(PROMPT_TEXT="$prompt" MODEL_NAME="$MODEL" python3 -c '
import json, os
print(json.dumps({
    "model": os.environ["MODEL_NAME"],
    "prompt": os.environ["PROMPT_TEXT"],
    "stream": False,
}))')"

curl -sf --max-time 300 "$OLLAMA_URL/api/generate" -d "$payload" \
  | python3 -c 'import json,sys; print(json.load(sys.stdin).get("response","").strip())'
