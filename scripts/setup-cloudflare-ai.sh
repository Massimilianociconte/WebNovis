#!/usr/bin/env bash
# Setup + deploy WebNovis AI API on Cloudflare Workers
# Usage (from project root):
#   bash scripts/setup-cloudflare-ai.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

WRANGLER=(npx wrangler)
CONFIG="workers/webnovis-ai/wrangler.jsonc"
WORKER_NAME="webnovis-ai"

echo "==> 1) Prepare worker data (search index + chat-config)"
node scripts/prepare-ai-worker-data.js

echo "==> 2) Cloudflare auth status"
if ! "${WRANGLER[@]}" whoami >/dev/null 2>&1; then
  echo "Non sei autenticato. Apro il login browser..."
  "${WRANGLER[@]}" login
fi
"${WRANGLER[@]}" whoami

echo "==> 3) Deploy Worker (KV SESSIONS viene creato/aggiornato in binding)"
"${WRANGLER[@]}" deploy -c "$CONFIG"

echo "==> 4) Imposta secrets (da .env se presenti, altrimenti prompt interattivo)"
set_secret_from_env_or_prompt() {
  local name="$1"
  local env_key="${2:-$1}"
  local value=""
  if [[ -f .env ]]; then
    value="$(grep -E "^${env_key}=" .env | head -1 | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//')"
  fi
  if [[ -n "${value}" && "${value}" != *your-api* && "${value}" != *change-this* ]]; then
    printf '%s' "$value" | "${WRANGLER[@]}" secret put "$name" -c "$CONFIG" >/dev/null
    echo "   ✓ $name impostato da .env"
  else
    echo "   → Inserisci $name quando richiesto:"
    "${WRANGLER[@]}" secret put "$name" -c "$CONFIG"
  fi
}

set_secret_from_env_or_prompt GEMINI_API_KEY_CHAT
set_secret_from_env_or_prompt GEMINI_API_KEY_SEARCH
set_secret_from_env_or_prompt BREVO_API_KEY
set_secret_from_env_or_prompt BREVO_SENDER_EMAIL
set_secret_from_env_or_prompt BREVO_SENDER_NAME
set_secret_from_env_or_prompt BREVO_NOTIFICATION_EMAIL

echo "==> 5) Smoke test health"
# Discover workers.dev URL
URL="$("${WRANGLER[@]}" deployments list -c "$CONFIG" 2>/dev/null | head -5 || true)"
HEALTH_URL="https://${WORKER_NAME}.massimilianociconte9.workers.dev/api/health"
# Fallback: try whoami-based subdomain is account-specific; workers.dev uses workers.dev subdomain from account
echo "Provo: $HEALTH_URL"
if curl -fsS -m 20 "$HEALTH_URL"; then
  echo
  echo "OK health"
else
  echo
  echo "Health non raggiungibile su $HEALTH_URL"
  echo "Controlla l'URL esatto in: Cloudflare Dashboard → Workers → $WORKER_NAME"
fi

echo
echo "==> Completato."
echo "Frontend punta a: https://webnovis-ai.nexify-api.workers.dev"
echo "Se l'URL workers.dev del tuo account è diverso, aggiorna:"
echo "  - js/chat.js"
echo "  - js/search.js"
echo "  - config/security-headers.js"
echo "poi: npm run build && npm run sync:headers"
