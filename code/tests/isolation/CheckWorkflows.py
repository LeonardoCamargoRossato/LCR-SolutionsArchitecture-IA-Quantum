"""Fail on production credentials or direct browser test entrypoints in common CI."""
from pathlib import Path
import re, subprocess

APP_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = Path(__file__).resolve().parents[3]
workflow_root = REPO_ROOT / ".github/workflows"
files = sorted(workflow_root.glob("*.yml"))
assert len(files) == 32, "Workflow inventory changed; review the existing quality map"
for path in files:
    source = path.read_text()
    if path.name != "deploy.yml":
        assert not re.search(r"secrets\.(?:VITE_SUPABASE|SUPABASE)", source), str(path)
        assert "workflow_run:" not in source, str(path)
        assert not re.search(r"(?m)^\s*(?:- )?run:\s*(?:cd (?:\./)?code\s*&&\s*)?node (?:code/)?tests/[^\n]*smoke", source), str(path)
        assert not re.search(r"(?m)^\s*(?:- )?run:\s*(?:cd (?:\./)?code\s*&&\s*)?npm(?: --prefix (?:\./)?code)? run build\s*$", source), str(path)
    assert not re.search(r"(?m)^\s*(?:- )?run:\s*(?:cd (?:\./)?code\s*&&\s*)?python(?:3)? (?:code/)?scripts/migrate_", source), str(path)
out = APP_ROOT / "test-results/isolation"
out.mkdir(parents=True, exist_ok=True)
paths = subprocess.run(
    ["git", "grep", "-l", "-E", r"https?://|fetch\(|WebSocket|createClient", "--", "code/src", "code/tests", "code/scripts"],
    cwd=REPO_ROOT, capture_output=True, text=True, check=True
).stdout
(out / "inventory.txt").write_text("\n".join(str(path) for path in files) + "\n\nSource files referencing network or URLs:\n" + paths)
print(f"PASS workflow policy and inventory: {len(files)} workflows")
