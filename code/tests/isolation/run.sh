#!/usr/bin/env bash
# No fallback to the host network. Linux only, install dependencies before running.
set -euo pipefail
cd "$(dirname "$0")/../.."
if [[ $# -eq 0 ]]; then echo 'Usage: npm run test:isolated -- node tests/<script>.mjs' >&2; exit 2; fi
if [[ "$(uname -s)" != Linux ]]; then echo 'Linux network namespace is required' >&2; exit 2; fi
for name in VITE_SUPABASE_URL VITE_SUPABASE_PUBLISHABLE_KEY SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY SUPABASE_ANON_KEY GALLERY_SMOKE_BASE_URL PORTFOLIO_TEST_BASE_URL CE235_SMOKE_BASE_URL INSTITUTION_LOGO_TEST_URL CITIES_SMOKE_URL; do
  if [[ -n "${!name:-}" ]]; then echo "Refusing test environment variable: $name" >&2; exit 2; fi
done
command -v unshare >/dev/null
command -v setpriv >/dev/null
command -v ip >/dev/null
command -v sudo >/dev/null
mkdir -p test-results/isolation
scenario="$(printf '%s' "$*" | sha256sum | cut -c1-12)"
log="$PWD/test-results/isolation/$scenario.jsonl"
: > "$log"
guard_uri="$(python3 -c 'from pathlib import Path; print(Path("tests/isolation/NodeGuard.mjs").resolve().as_uri())')"
self_test=0
if [[ "$*" == "node tests/isolation/Guardrail.test.mjs" ]]; then self_test=1; fi
# Set up the namespace as root; run the actual code as the caller with no capabilities.
sudo unshare --net -- bash -c '
  set -euo pipefail
  ip link set lo up
  test "$(ip -o link show | wc -l)" -eq 1
  test -z "$(ip route show default)"
  uid="$1"; gid="$2"; shift 2
  exec setpriv --reuid="$uid" --regid="$gid" --init-groups --no-new-privs --bounding-set=-all --inh-caps=-all --ambient-caps=-all env -i LCR_NETNS_ID="$(readlink /proc/self/ns/net)" "$@" 
' bash "$(id -u)" "$(id -g)" HOME="$HOME" PATH="$PATH" LANG=C.UTF-8 CI="${CI:-}" GITHUB_SHA="${GITHUB_SHA:-$(git rev-parse HEAD)}" LCR_TEST_MODE=1 LCR_ISOLATED_NETNS=1 VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_PUBLISHABLE_KEY=lcr-fixture-public-key-not-a-secret VITE_SUPABASE_MEDIA_BUCKET=portfolio-media LCR_NETWORK_LOG="$log" LCR_SCENARIO="$scenario" LCR_GUARD_SELF_TEST="$self_test" LCR_V1_BASELINE="${LCR_V1_BASELINE:-}" LCR_BEFORE="${LCR_BEFORE:-}" LCR_AFTER="${LCR_AFTER:-}" NODE_OPTIONS="--import=$guard_uri" bash tests/isolation/Inside.sh "$@"
