"""Check new tracked source and public artifact; never print matched secret values."""
import argparse
import base64
import json
import pathlib
import re
import subprocess

BASE = "cf273ae6026c48e264c3ef80863abf458dc61fc4"
PATTERNS = {
    "private-key": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "github-token": re.compile(rb"(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})"),
    "aws-key": re.compile(rb"(?:AKIA|ASIA)[A-Z0-9]{16}"),
    "service-role": re.compile(rb"sb_secret_[A-Za-z0-9_-]{20,}"),
}
JWT = re.compile(rb"eyJ[A-Za-z0-9_-]+\\.(eyJ[A-Za-z0-9_-]+)\\.[A-Za-z0-9_-]+")
PRIVATE_NAMES = {".env", ".env.local", ".env.production", ".env.development", ".git", ".npmrc"}


def check(files):
    issues = []
    for file in files:
        if any(part in PRIVATE_NAMES for part in file.parts) or file.suffix in {".pem", ".key", ".p12"}:
            issues.append((str(file), "private-file"))
        if file.is_symlink():
            issues.append((str(file), "symlink"))
            continue
        if not file.is_file():
            continue
        data = file.read_bytes()
        if b"\x00" in data[:4096]:
            continue
        for name, pattern in PATTERNS.items():
            if pattern.search(data):
                issues.append((str(file), name))
        for payload in JWT.findall(data):
            try:
                claims = json.loads(base64.urlsafe_b64decode(payload + b'=' * ((-len(payload)) % 4)))
            except (ValueError, UnicodeError):
                continue
            if isinstance(claims, dict) and claims.get('role') == 'service_role':
                issues.append((str(file), 'service-role-jwt'))
                break
    for path, kind in issues:
        print(f"FAIL {kind}: {path}")
    assert not issues, "Potential secret or private file; inspect without exposing value"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--artifact")
    args = parser.parse_args()
    if args.artifact:
        root = pathlib.Path(args.artifact)
        assert (root / "index.html").is_file(), "Artifact missing"
        check([p for p in root.rglob("*") if p.is_file() or p.is_symlink()])
        print("PASS artifact: private-file and high-confidence secret rules")
    else:
        subprocess.run(["git", "diff", "--check", BASE, "HEAD"], check=True)
        changed = subprocess.check_output(["git", "diff", "--name-only", "--diff-filter=ACMR", "-z", BASE, "HEAD"])
        files = [pathlib.Path(p.decode()) for p in changed.split(b"\0") if p]
        check(files)
        for name in ("AGENTS.md", "docs/ci/QUALITY_TRANSITION.md"):
            assert pathlib.Path(name).is_file(), f"Required documentation missing: {name}"
        print("PASS changed-source whitespace, high-confidence secrets, documentation")


if __name__ == "__main__":
    main()
