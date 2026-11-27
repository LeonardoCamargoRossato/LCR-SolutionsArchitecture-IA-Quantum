#!/usr/bin/env python3
"""Non-destructive import and SHA-256 audit of approved Loading Portal V1 WebPs.

Usage:
    python3 scripts/import_loading_portal_assets.py --zip "/path/to/LCR_Loading_Portal_V1_Arquivos(1).zip" --audit
    python3 scripts/import_loading_portal_assets.py --zip "/path/to/LCR_Loading_Portal_V1_Arquivos(1).zip" --apply
    python3 scripts/import_loading_portal_assets.py --check

--apply copies only the 10 approved WebP runtime files, refusing to replace
different existing bytes. It never extracts the user screenshot, storyboard or
high-resolution PNGs. --check is a CI gate against missing or modified files.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from zipfile import ZipFile, BadZipFile

APP_ROOT = Path(__file__).resolve().parent.parent
MANIFEST = APP_ROOT / "docs/test-component-lab/loading-portal-v1/ASSET_INVENTORY.json"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--zip", type=Path, help="Original approved 19 MB ZIP (never overwritten)")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--audit", action="store_true", help="Validate source ZIP without copying")
    mode.add_argument("--apply", action="store_true", help="Copy exact WebP assets, without replacing mismatches")
    mode.add_argument("--check", action="store_true", help="Check all WebPs already in the repo (default)")
    args = parser.parse_args()
    if (args.apply or args.audit) and not args.zip:
        parser.error("--apply and --audit require --zip")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    expected = manifest["assets"]
    names = [entry["filename"] for entry in expected]
    assert len(names) == 10 and len(names) == len(set(names)), "Expected exactly 10 unique runtime assets"
    prefix = manifest["archive_prefix"]
    target_root = APP_ROOT / manifest["repo_directory"]

    archive: ZipFile | None = None
    if args.zip:
        if not args.zip.is_file():
            print(f"Source ZIP not found: {args.zip}", file=sys.stderr)
            return 2
        zip_checksum = digest(args.zip.read_bytes())
        if zip_checksum != manifest["zip_sha256"]:
            print(f"ZIP checksum mismatch: {zip_checksum}", file=sys.stderr)
            return 2
        try:
            archive = ZipFile(args.zip)
            errors = archive.testzip()
            if errors:
                raise BadZipFile(f"Corrupted member: {errors}")
        except BadZipFile as exc:
            print(f"Corrupt ZIP: {exc}", file=sys.stderr)
            return 2
    errors = []
    for entry in expected:
        filename = entry["filename"]
        if filename not in names or "/" in filename or "\\" in filename or not filename.endswith(".webp"):
            errors.append(f"Invalid runtime filename: {filename}")
            continue
        target = target_root / filename
        source_data = archive.read(prefix + filename) if archive else None
        if source_data is not None and (len(source_data) != entry["bytes"] or digest(source_data) != entry["sha256"]):
            errors.append(f"Source mismatch: {filename}")
            continue
        if args.audit:
            print(f"AUDIT OK {filename}")
            continue
        if target.is_file():
            current = target.read_bytes()
            if len(current) != entry["bytes"] or digest(current) != entry["sha256"]:
                errors.append(f"Different existing asset; refusing overwrite: {target}")
                continue
            print(f"OK {filename}")
        elif args.apply and source_data is not None:
            target_root.mkdir(parents=True, exist_ok=True)
            target.write_bytes(source_data)
            print(f"COPIED {filename}")
        else:
            errors.append(f"Missing runtime asset: {target}")
    if archive:
        archive.close()
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1
    print(f"PASS: {len(expected)} original-approved WebPs, sha256 verified; no originals removed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
