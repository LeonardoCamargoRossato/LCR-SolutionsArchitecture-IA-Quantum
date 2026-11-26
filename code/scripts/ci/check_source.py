"""Check new tracked source and public artifact; never print matched secret values."""
import argparse
import base64
import json
import hashlib
import pathlib
import re
import subprocess

APP_ROOT = pathlib.Path(__file__).resolve().parents[2]
REPO_ROOT = pathlib.Path(__file__).resolve().parents[3]

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


def verify_public_assets(root):
    """Verify canonical public inventory in source or the copied build output."""
    inventory = json.loads((APP_ROOT / "docs/assets/supabase-public-assets-inventory.json").read_text(encoding="utf-8"))
    summary = inventory["summary"]
    assets = inventory["assets"]
    assert summary["source_public"] is True
    assert len(assets) == summary["bucket_object_count"]
    excluded = {"not_currently_referenced", "excluded_hidden_or_retired"}
    aliases = {"duplicate_supabase_content", "duplicate_supabase_legacy"}
    copied = {}
    for asset in assets:
        status = asset["status"]
        if status in excluded:
            assert not asset["github_path"], "Excluded asset has public destination"
            continue
        assert status in aliases | {"copied"}, "Unknown asset status"
        path = asset["github_path"]
        assert path and path.startswith("code/public/assets/"), "Unexpected asset destination"
        parts = pathlib.PurePosixPath(path).parts
        assert ".." not in parts and "\\" not in path
        if status == "copied":
            assert path not in copied, "Duplicate canonical destination"
            copied[path] = (asset["size_bytes"], asset["sha256"])
    assert len(copied) == summary["github_new_file_count"]
    assert sum(size for size, _ in copied.values()) == summary["github_new_bytes"]
    assert sum(a["status"] in excluded for a in assets) == summary["excluded_or_unreferenced_count"]
    for asset in assets:
        if asset["status"] in aliases:
            assert copied[asset["github_path"]] == (asset["size_bytes"], asset["sha256"]), "Alias mismatch"
    refs = inventory["content_reference_map"]
    assert len(refs) == summary["content_reference_count"]
    assert all(ref["github_path"] in copied for ref in refs), "Unmapped public reference"
    for path, (size, expected) in copied.items():
        file = root / path.removeprefix("code/public/")
        assert file.resolve().is_relative_to(root.resolve()) and not file.is_symlink(), "Unsafe asset path"
        assert file.is_file() and file.stat().st_size == size, f"Missing or wrong-size asset: {path}"
        with file.open("rb") as stream:
            digest = hashlib.file_digest(stream, "sha256").hexdigest()
        assert digest == expected, f"Asset hash mismatch: {path}"
    print(f"PASS {len(copied)} canonical public assets; {len(refs)} references; SHA-256 integrity")


def verify_delivery_catalog(root):
    inventory = json.loads((APP_ROOT / "docs/assets/supabase-public-assets-inventory.json").read_text(encoding="utf-8"))
    catalog_file = APP_ROOT / "src/assets/public/publicAssetCatalog.ts"
    catalog = json.loads(catalog_file.read_text(encoding="utf-8").split(" = ", 1)[1])
    expected = {a["supabase_path"]: a["github_path"].removeprefix("code/public/") for a in inventory["assets"] if a["github_path"]}
    assert set(catalog) == set(expected), "Delivery catalog is not the exact audited inventory"
    for source, item in catalog.items():
        assert item["original"] == expected[source], "Original path changed"
        for path in item.values():
            file = root / path
            assert file.is_file() and file.resolve().is_relative_to(root.resolve()) and not file.is_symlink(), f"Missing delivery target: {path}"
        assert item["display"].endswith((".webp", ".svg", ".pdf")), f"Unoptimized delivery: {source}"
        if source.startswith("about/gallery/") or source.startswith("projects/") and "/institutions/" not in source:
            assert item["full"].endswith(".png"), f"Missing PNG zoom: {source}"
    assert all(r["source_path"] in catalog for r in inventory["content_reference_map"])
    derivative = root / next(v["display"] for k,v in catalog.items() if k.startswith("profile/"))
    assert hashlib.sha256(derivative.read_bytes()).hexdigest() == "c2b93202bee240a884d49a6aeaa55b2f99768a0202d8d2579cdfa59b0671b9dc"
    local = json.loads((APP_ROOT / "docs/assets/WEBP_FIRST_DELIVERY.json").read_text(encoding="utf-8"))
    for item in local["assets"]:
        for key, meta in (("source_path","source"), ("webp_path","webp")):
            p = root / item[key].removeprefix("public/")
            assert p.is_file(), f"Missing local display/zoom pair: {p}"
            assert hashlib.sha256(p.read_bytes()).hexdigest() == item[meta]["sha256"], f"Changed approved derivative: {p}"
    gallery_text = (APP_ROOT / "src/data/aboutGallery.ts").read_text(encoding="utf-8")
    gallery = json.loads(gallery_text.split("ReadonlyArray<Entry> = ",1)[1].split("\n\nexport type LocalAboutGalleryItem",1)[0])
    assert [r["photoNumber"] for r in gallery if r["visible"]] == [9,11,8,12,1,2,3,4,5,6]
    assert [r["photoNumber"] for r in gallery if not r["visible"]] == [7,10]
    refs = {r["record_id"]: r for r in inventory["content_reference_map"] if r["source_table"] == "about_gallery"}
    assert set(r["id"] for r in gallery) == set(refs) and len(gallery) == len(refs) == 12
    for row in gallery:
        old = catalog[refs[row["id"]]["source_path"]]
        assert row["media"] == {"card":old["display"],"full":old["full"],"original":old["original"]}
    print("PASS About catalogue: 12 preserved identities, 10 public, 2 hidden, exact variants and order")
    print(f"PASS delivery catalog: {len(catalog)} exact keys, {len(inventory['content_reference_map'])} editorial references, WebP/SVG/PDF display and PNG gallery zoom")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--artifact")
    args = parser.parse_args()
    if args.artifact:
        root = pathlib.Path(args.artifact)
        if not root.is_absolute():
            root = APP_ROOT / root
        assert (root / "index.html").is_file(), "Artifact missing"
        check([p for p in root.rglob("*") if p.is_file() or p.is_symlink()])
        verify_public_assets(root)
        verify_delivery_catalog(root)
        print("PASS artifact: private-file and high-confidence secret rules")
    else:
        subprocess.run(["git", "diff", "--check", BASE, "HEAD"], check=True, cwd=REPO_ROOT)
        changed = subprocess.check_output(["git", "diff", "--name-only", "--diff-filter=ACMR", "-z", BASE, "HEAD"], cwd=REPO_ROOT)
        files = [REPO_ROOT / pathlib.Path(p.decode()) for p in changed.split(b"\0") if p]
        check(files)
        for path in (REPO_ROOT / "AGENTS.md", APP_ROOT / "docs/ci/QUALITY_TRANSITION.md"):
            assert path.is_file(), f"Required documentation missing: {path.relative_to(REPO_ROOT)}"
        verify_public_assets(APP_ROOT / "public")
        verify_delivery_catalog(APP_ROOT / "public")
        print("PASS changed-source whitespace, high-confidence secrets, documentation")


if __name__ == "__main__":
    main()
