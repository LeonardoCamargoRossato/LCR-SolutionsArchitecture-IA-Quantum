"""Fail on production credentials or direct browser test entrypoints in common CI."""
from pathlib import Path
import re, subprocess
root=Path(".github/workflows")
files=sorted(root.glob("*.yml"))
assert files
for p in files:
    s=p.read_text()
    if p.name != "deploy.yml":
        assert not re.search(r"secrets\.(?:VITE_SUPABASE|SUPABASE)",s), str(p)
        assert "workflow_run:" not in s, str(p)
        assert not re.search(r"(?m)^\s*(?:- )?run:\s*node tests/[^\n]*smoke",s), str(p)
        assert not re.search(r"(?m)^\s*(?:- )?run:\s*npm run build\s*$",s), str(p)
    assert not re.search(r"(?m)^\s*(?:- )?run:\s*python(?:3)? scripts/migrate_",s), str(p)
out=Path("test-results/isolation");out.mkdir(parents=True,exist_ok=True)
paths=subprocess.run(["git","grep","-l","-E",r"https?://|fetch\(|WebSocket|createClient","--","src","tests","scripts"],capture_output=True,text=True,check=True).stdout
(out/"inventory.txt").write_text("\n".join(str(p) for p in files)+"\n\nSource files referencing network or URLs:\n"+paths)
print(f"PASS workflow policy and inventory: {len(files)} workflows")
