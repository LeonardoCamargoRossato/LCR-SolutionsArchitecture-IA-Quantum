"""Audit lockfile against the npm registry; no production secrets or services."""
import json
from pathlib import Path
import subprocess

out = Path("test-results/quality/dependencies.json")
out.parent.mkdir(parents=True, exist_ok=True)
r = subprocess.run(["npm", "audit", "--json", "--audit-level=high", "--ignore-scripts",
                    "--registry=https://registry.npmjs.org"], capture_output=True, text=True, timeout=120)
try:
    data = json.loads(r.stdout)
except ValueError:
    data = {"error": "invalid audit response"}
if "error" in data or "metadata" not in data:
    out.write_text(json.dumps({"status":"unavailable","exit":r.returncode}, indent=2))
    raise SystemExit("Registry advisory audit unavailable; no silent bypass")
counts = data["metadata"]["vulnerabilities"]
findings = [{"package":name,"severity":v["severity"],"advisories":[a.get("source") for a in v.get("via",[]) if isinstance(a,dict)]}
            for name,v in data.get("vulnerabilities",{}).items()]
out.write_text(json.dumps({"counts":counts,"findings":findings,"exceptions":[],"exit":r.returncode},indent=2))
print("Dependency audit severity counts:",json.dumps(counts))
assert r.returncode == 0 and not counts.get("high") and not counts.get("critical"), "High/critical dependency issue or audit error; remediation or explicit reviewed exception required"
