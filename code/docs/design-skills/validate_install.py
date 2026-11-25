#!/usr/bin/env python3
"""Read-only validation of vendored design skills; does not execute third-party launchers."""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILLS = ROOT / ".agents" / "skills"
REQUIRED = {
    "frontend-design": ["SKILL.md", "LICENSE.txt"],
    "ui-ux-pro-max": [
        "SKILL.md", "LICENSE", "references/quick-reference.md", "references/pro-rules.md",
        "scripts/search.py", "scripts/core.py", "scripts/design_system.py", "data/products.csv",
        "data/styles.csv", "data/ux-guidelines.csv", "data/stacks/react.csv",
    ],
    "impeccable": [
        "SKILL.md", "LICENSE", "NOTICE.md", "reference/critique.md",
        "reference/polish.md", "reference/bolder.md", "reference/distill.md",
        "reference/routing.md", "reference/craft-floor.md", "scripts/impeccable",
        "scripts/engine-checksums.txt",
    ],
    "web-design-guidelines": ["SKILL.md", "LICENSE", "references/command.md"],
}
COPY_COUNTS = {
    "frontend-design": 2,
    "ui-ux-pro-max": 82,
    "impeccable": 71,
    "web-design-guidelines": 3,
}
errors: list[str] = []
manifest: dict[str, object] = {}
for slug, paths in REQUIRED.items():
    root = SKILLS / slug
    if not root.is_dir():
        errors.append(f"{slug}: missing directory")
        continue
    for relative in paths:
        if not (root / relative).is_file():
            errors.append(f"{slug}: missing {relative}")
    entry = root / "SKILL.md"
    if entry.is_file():
        text = entry.read_text(encoding="utf-8")
        header = re.match(r"\A---\r?\n([\s\S]+?)\r?\n---", text)
        if not header or not re.search(r"(?m)^name:\s*['\"]?" + re.escape(slug) + r"['\"]?\s*$", header.group(1)):
            errors.append(f"{slug}: invalid SKILL.md frontmatter/name")
        for item in re.findall(r"\]\(((?:references?|scripts)/[^)#\s]+)(?:#[^)]*)?\)", text):
            if not (root / item).is_file():
                errors.append(f"{slug}: broken linked resource: {item}")
    files = [p for p in root.rglob("*") if p.is_file()]
    links = [p for p in root.rglob("*") if p.is_symlink()]
    if links:
        errors.append(f"{slug}: unexpected symlink(s): {len(links)}")
    if len(files) != COPY_COUNTS[slug]:
        errors.append(f"{slug}: expected {COPY_COUNTS[slug]} files, got {len(files)}")
    if any(p.name in {".env", ".npmrc", ".pypirc", "id_rsa"} for p in files):
        errors.append(f"{slug}: sensitive filename present")
    manifest[slug] = {"files": len(files), "bytes": sum(p.stat().st_size for p in files)}

for path in ("AGENTS.md", "docs/design-skills/README.md", "docs/design-skills/SKILLS_INVENTORY.md", "docs/design-skills/INTEGRATION_GUIDE.md"):
    if not (ROOT / path).is_file():
        errors.append(f"missing documentation: {path}")
agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8") if (ROOT / "AGENTS.md").is_file() else ""
for slug in REQUIRED:
    if f".agents/skills/{slug}/SKILL.md" not in agents:
        errors.append(f"AGENTS.md does not reference {slug}")

vercel_rules = SKILLS / "web-design-guidelines/references/command.md"
if vercel_rules.is_file():
    digest = hashlib.sha256(vercel_rules.read_bytes()).hexdigest()
    expected = "d246b026f4f29b5823a9cc857f9edf3d2507002e055e32040cadeaf3b38e0234"
    if digest != expected:
        errors.append(f"Vercel guidelines SHA256 mismatch: {digest}")
    manifest["web-design-guidelines-snapshot-sha256"] = digest

ui_skill = SKILLS / "ui-ux-pro-max/SKILL.md"
if ui_skill.is_file() and "${CLAUDE_PLUGIN_ROOT}" in ui_skill.read_text(encoding="utf-8"):
    errors.append("UI UX Pro Max still contains Claude-only path references")

scripts = SKILLS / "impeccable/scripts/impeccable"
if scripts.is_file() and not (SKILLS / "impeccable/scripts/engine-checksums.txt").is_file():
    errors.append("Impeccable binary launcher lacks checksum manifest")

report = {"summary": "FAIL" if errors else "PASS", "skills": manifest, "errors": errors, "runtime_executed": False}
print(json.dumps(report, ensure_ascii=False, indent=2))
sys.exit(1 if errors else 0)
