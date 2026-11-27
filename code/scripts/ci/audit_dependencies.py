"""Audit lockfile against the npm registry; no production secrets or services."""
import json
from pathlib import Path
import os
import subprocess
import shutil
import tempfile

REPO_ROOT = Path(__file__).resolve().parents[3]
APP_ROOT = Path(__file__).resolve().parents[2]
os.chdir(APP_ROOT)
out = APP_ROOT / "test-results/quality/dependencies.json"
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
if r.returncode != 0 or counts.get("high") or counts.get("critical"):
    # Generate a candidate lockfile in a disposable directory. Never change the
    # tested checkout, run dependency scripts, use --force, or accept a failing audit.
    diagnostics = out.parent / "dependency-remediation"
    diagnostics.mkdir(exist_ok=True)
    details = []
    for name, item in data.get("vulnerabilities", {}).items():
        details.append({"package": name, "range": item.get("range"), "fixAvailable": item.get("fixAvailable"),
                        "via": [{"source": a.get("source"), "range": a.get("range"), "title": a.get("title")}
                                for a in item.get("via", []) if isinstance(a, dict)]})
    (diagnostics / "advisories.json").write_text(json.dumps(details, indent=2))
    print("Dependency remediation diagnostics:", json.dumps(details), flush=True)
    with tempfile.TemporaryDirectory(prefix="lcr-audit-") as tmp:
        for name in ("package.json", "package-lock.json"):
            shutil.copyfile(name, Path(tmp) / name)
        cmd = ["npm", "audit", "fix", "--package-lock-only", "--ignore-scripts",
               "--registry=https://registry.npmjs.org", "--audit-level=high", "--json"]
        fix = subprocess.run(cmd, cwd=tmp, capture_output=True, text=True, timeout=120)
        for name in ("package.json", "package-lock.json"):
            shutil.copyfile(Path(tmp) / name, diagnostics / name)
        verify = subprocess.run(["npm","audit","--json","--audit-level=high","--ignore-scripts",
                                 "--registry=https://registry.npmjs.org"],cwd=tmp,capture_output=True,text=True,timeout=120)
        try:
            result = json.loads(verify.stdout)
            remaining = result.get("metadata", {}).get("vulnerabilities")
        except ValueError:
            remaining = None
        (diagnostics / "candidate-result.json").write_text(json.dumps({"fix_exit":fix.returncode,"audit_exit":verify.returncode,"remaining":remaining},indent=2))
        print("Candidate audit:",json.dumps({"exit":verify.returncode,"remaining":remaining}),flush=True)
    raise SystemExit("High/critical dependency issue; candidate remediation requires review and a fresh CI run")
