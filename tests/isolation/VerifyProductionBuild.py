"""Verify production configuration without printing credentials or endpoint."""
import os
from pathlib import Path
url = os.environ.get("VITE_SUPABASE_URL", "").strip().rstrip("/")
key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "").strip()
assert url.startswith("https://") and url.endswith(".supabase.co"), "Missing production HTTPS endpoint"
assert key and key != "lcr-fixture-public-key-not-a-secret", "Missing production public key"
files = list(Path("dist/assets").glob("*.js"))
assert files, "Missing JS output"
bundle = b"\n".join(p.read_bytes() for p in files)
assert url.encode() in bundle, "Production endpoint missing from bundle"
assert b"lcr-fixture-public-key-not-a-secret" not in bundle, "Fixture key leaked into production bundle"
print("PASS production endpoint present; fixture key absent; no backend contacted")
