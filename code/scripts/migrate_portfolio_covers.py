#!/usr/bin/env python3
"""LCR Portfolio: audited, resumable PNG/WebP cover migration.

Dry run is the default. --apply requires a server-side secret injected by the
runner (never put service-role credentials in source, logs or the frontend).
--verify is read-only and confirms both Storage objects and editorial URLs.
No operation deletes source or prior assets.
"""
import argparse
import hashlib
import io
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

PROJECT = "wdjffhfnzydudmhhekmk"
BUCKET = "portfolio-media"
COVERS = [
  ("cities-comparing","1789395964303-3c1f29cc-c8bd-42d7-8a7d-752b81756026-CitiesComparing_CapaCard.png","projects","city-comparing","cover_url"),
  ("embedded-control-platform","1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.png","more_projects","embedded-control-platform","image_url"),
  ("foton-hub","1789395184532-2e274ccc-e2ad-4c41-b7b8-a795f181f84b-FotonHub_CapaCard.png","projects","foton-hub","cover_url"),
  ("hamlet","1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.png","projects","hamlet","cover_url"),
  ("quantum-education-apps","1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.png","more_projects","quantum-education-apps","image_url"),
  ("scientific-analysis-toolkit","1789577893972-0ac3894c-5459-4df2-989a-029bf13891ec-ScientificAnalysisToolitCapaCard.png","more_projects","scientific-analysis-toolkit","image_url"),
  ("speaker-portfolio","1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.png","projects","speaker-portfolio","cover_url"),
  ("webseer","1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.png","more_projects","webseer","image_url"),
]


def sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def request(method: str, url: str, key: str | None = None,
            payload: bytes | None = None, content_type: str | None = None) -> bytes:
    headers = {"User-Agent": "LCR-portfolio-cover-migration/2"}
    if key:
        headers.update({"apikey": key, "Authorization": "Bearer " + key})
    if content_type:
        headers["Content-Type"] = content_type
    if method == "PATCH":
        headers["Prefer"] = "return=representation"
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            return response.read()
    except urllib.error.HTTPError as error:
        # Avoid echoing response bodies, headers or any credential.
        raise RuntimeError(f"{method} returned HTTP {error.code} for Storage/CMS") from error


def public_url(base: str, path: str) -> str:
    encoded = urllib.parse.quote(path, safe="/")
    return f"{base}/storage/v1/object/public/{BUCKET}/{encoded}"


def download(base: str, path: str) -> bytes:
    return request("GET", public_url(base, path))


def verify_png(data: bytes, name: str) -> tuple[int, int]:
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise RuntimeError(f"Not PNG: {name}")
    with Image.open(io.BytesIO(data)) as im:
        if im.format != "PNG":
            raise RuntimeError(f"PNG format validation failed: {name}")
        im.load()
        return im.size


def make_webp(png: bytes, expected_size: tuple[int, int]) -> bytes:
    with Image.open(io.BytesIO(png)) as im:
        if im.mode not in ("RGB", "RGBA"):
            has_alpha = "A" in im.getbands() or "transparency" in im.info
            im = im.convert("RGBA" if has_alpha else "RGB")
        output = io.BytesIO()
        im.save(output, format="WEBP", quality=82, method=6)
        data = output.getvalue()
    with Image.open(io.BytesIO(data)) as check:
        check.load()
        if check.format != "WEBP" or check.size != expected_size:
            raise RuntimeError("WebP format or dimensions mismatch")
    return data


def object_exists(base: str, key: str, path: str) -> bool:
    """List with privileged Storage API instead of probing a nonexistent public URL.

    Supabase may return HTTP 400 (not only 404) for absent public Storage
    objects. Listing the exact parent prefix avoids mistaking that status for
    an upload failure. Refuse to assume absence if listing cannot be verified.
    """
    folder, filename = path.rsplit("/", 1)
    endpoint = f"{base}/storage/v1/object/list/{BUCKET}"
    data = json.dumps({"prefix": folder + "/", "limit": 1000, "offset": 0,
                       "search": filename}).encode("utf-8")
    objects = json.loads(request("POST", endpoint, key, data, "application/json"))
    if not isinstance(objects, list):
        raise RuntimeError("Unexpected Storage list response; aborting")
    if len(objects) >= 1000:
        raise RuntimeError("Storage list may be truncated; aborting")
    return any(obj.get("name") == filename for obj in objects)


def put_verified(base: str, key: str, path: str, data: bytes, mime: str) -> str:
    if object_exists(base, key, path):
        existing = download(base, path)
        if sha256(existing) != sha256(data):
            raise RuntimeError(f"Existing destination differs; refusing overwrite: {path}")
        return "already-matches"
    upload_url = f"{base}/storage/v1/object/{BUCKET}/{urllib.parse.quote(path, safe='/')}"
    request("POST", upload_url, key, data, mime)
    if sha256(download(base, path)) != sha256(data):
        raise RuntimeError(f"Uploaded bytes mismatch: {path}")
    return "uploaded"


def cms_url(base: str, key: str, table: str, record_id: str, field: str) -> str:
    query = urllib.parse.urlencode({"id": f"eq.{record_id}", "select": f"id,{field}"})
    rows = json.loads(request("GET", f"{base}/rest/v1/{table}?{query}", key))
    if len(rows) != 1:
        raise RuntimeError(f"Expected one CMS row, got {len(rows)}: {table}/{record_id}")
    return rows[0][field]


def update_cms(base: str, key: str, table: str, record_id: str,
               field: str, old: str, new: str) -> None:
    query = urllib.parse.urlencode({"id": f"eq.{record_id}", field: f"eq.{old}",
                                    "select": "id"})
    rows = json.loads(request("PATCH", f"{base}/rest/v1/{table}?{query}",
                              key, json.dumps({field: new}).encode(), "application/json"))
    if len(rows) != 1 or cms_url(base, key, table, record_id, field) != new:
        raise RuntimeError(f"CMS conditional update failed: {table}/{record_id}")


def write_json(path: str, value: object) -> None:
    Path(path).write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n",
                          encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--apply", action="store_true")
    mode.add_argument("--verify", action="store_true")
    parser.add_argument("--report", default="portfolio-cover-migration-report.json")
    parser.add_argument("--backup", default="portfolio-cover-editorial-backup.json")
    args = parser.parse_args()

    base = os.getenv("SUPABASE_URL", f"https://{PROJECT}.supabase.co").rstrip("/")
    if urllib.parse.urlparse(base).hostname != PROJECT + ".supabase.co":
        parser.error("Wrong Supabase project URL; refusing to proceed")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if (args.apply or args.verify) and not key:
        parser.error("An authenticated service-role key is required for --apply/--verify")

    report: dict = {
        "project": PROJECT, "bucket": BUCKET,
        "mode": "apply" if args.apply else "verify" if args.verify else "dry-run",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "status": "preflight", "assets": [],
        "originals_deleted": 0,
    }
    pending: list = []
    backup: list = []

    try:
        # Entire batch preflight comes BEFORE the first Storage write.
        for slug, filename, table, record_id, field in COVERS:
            source = f"projects/{slug}/{filename}"
            png_path = f"projects/{slug}/PNG/{filename}"
            webp_path = f"projects/{slug}/WebP/{filename[:-4]}.webp"
            png = download(base, source)
            dimensions = verify_png(png, source)
            webp = make_webp(png, dimensions)
            record = {
                "project": slug, "table": table, "id": record_id, "column": field,
                "legacy_path": source, "png_path": png_path, "webp_path": webp_path,
                "original_bytes": len(png), "png_bytes": len(png),
                "webp_bytes": len(webp),
                "reduction_percent": round(100 * (1 - len(webp) / len(png)), 2),
                "sha256_original": sha256(png), "sha256_png": sha256(png),
                "dimensions": list(dimensions), "state": "preflight-only",
            }
            report["assets"].append(record)
            old_url, new_url = public_url(base, source), public_url(base, png_path)
            if key and (args.apply or args.verify):
                existing_url = cms_url(base, key, table, record_id, field)
                if existing_url not in (old_url, new_url):
                    raise RuntimeError(f"Unexpected editorial URL for {table}/{record_id}")
                if args.verify and existing_url != new_url:
                    raise RuntimeError(f"Editorial row not migrated: {table}/{record_id}")
                backup.append({"table": table, "id": record_id,
                               "field": field, "prior_url": existing_url,
                               "target_url": new_url})
            pending.append((record, png, webp, old_url, new_url))

        if len(pending) != len(COVERS):
            raise RuntimeError("Unexpected inventory cardinality")

        if args.apply:
            # Durable backup must exist before any write.
            write_json(args.backup, {"project": PROJECT, "records": backup})
            report["status"] = "copying"
            for record, png, webp, old_url, new_url in pending:
                record["png_upload"] = put_verified(
                    base, key, record["png_path"], png, "image/png")
                record["webp_upload"] = put_verified(
                    base, key, record["webp_path"], webp, "image/webp")
                record["state"] = "storage-verified"

        if args.apply or args.verify:
            # Independently re-download all 18 objects and check integrity.
            for record, png, webp, old_url, new_url in pending:
                actual_png = download(base, record["png_path"])
                actual_webp = download(base, record["webp_path"])
                if sha256(actual_png) != record["sha256_original"]:
                    raise RuntimeError(f"PNG checksum mismatch: {record['project']}")
                if sha256(actual_webp) != sha256(webp):
                    raise RuntimeError(f"WebP checksum mismatch: {record['project']}")
                if verify_png(actual_png, record["png_path"]) != tuple(record["dimensions"]):
                    raise RuntimeError(f"PNG dimensions mismatch: {record['project']}")
                with Image.open(io.BytesIO(actual_webp)) as image:
                    image.load()
                    if image.format != "WEBP" or image.size != tuple(record["dimensions"]):
                        raise RuntimeError(f"WebP invalid: {record['project']}")
                record["state"] = "storage-verified"

        if args.apply:
            # All 18 objects are verified before the FIRST editorial change.
            report["status"] = "updating-editorial"
            for record, png, webp, old_url, new_url in pending:
                current = cms_url(base, key, record["table"], record["id"], record["column"])
                if current == old_url:
                    update_cms(base, key, record["table"], record["id"],
                               record["column"], old_url, new_url)
                elif current != new_url:
                    raise RuntimeError(f"Editorial URL changed concurrently: {record['project']}")
                record["state"] = "cms-verified"

        if args.verify:
            for record, png, webp, old_url, new_url in pending:
                if cms_url(base, key, record["table"], record["id"],
                           record["column"]) != new_url:
                    raise RuntimeError(f"CMS verification failed: {record['project']}")
                record["state"] = "cms-verified"

        report["status"] = "success"
        print(f"Migration {report['mode']}: {len(pending)} covers processed; "
              "legacy assets preserved.")
    except Exception as error:
        report["status"] = "failed"
        report["error"] = str(error)
        raise
    finally:
        write_json(args.report, report)


if __name__ == "__main__":
    if os.getenv("LCR_APPROVED_MIGRATION") != "1" or os.getenv("LCR_TEST_MODE") == "1":
        raise SystemExit("Real migration suspended: separate authorized environment and budget required.")
    try:
        main()
    except Exception as error:
        print(f"MIGRATION ABORTED: {error}", file=sys.stderr)
        sys.exit(1)
