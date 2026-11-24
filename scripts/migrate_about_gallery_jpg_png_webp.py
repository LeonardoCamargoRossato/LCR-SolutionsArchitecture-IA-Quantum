#!/usr/bin/env python3
"""Audit-friendly conversion of 12 original JPG photographs to PNG and WebP.

Supabase bucket:
  about/gallery/<original>.jpg                (preserved)
  about/gallery/PNG/<original>.png             (lossless RGB pixels)
  about/gallery/WebP/<original>.webp           (optimized)
No database updates, deletions, frontend changes, overwrites or logo changes.
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

from PIL import Image, ImageOps, UnidentifiedImageError

PROJECT_ID = "wdjffhfnzydudmhhekmk"
BUCKET = "portfolio-media"
FOLDER = "about/gallery"
EXPECTED = 12
BASE = f"https://{PROJECT_ID}.supabase.co"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def send(method: str, url: str, key: str | None = None,
         data: bytes | None = None, content_type: str | None = None) -> bytes:
    headers = {"User-Agent": "LCR-gallery-PNG-WebP/1"}
    if key:
        headers.update({"apikey": key, "Authorization": f"Bearer {key}"})
    if content_type:
        headers["Content-Type"] = content_type
    try:
        with urllib.request.urlopen(
            urllib.request.Request(url, data=data, headers=headers, method=method),
            timeout=140,
        ) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        # Never reveal a secret via response headers, URL query, or response body.
        raise RuntimeError(f"{method} failed (HTTP {exc.code})") from exc


def url(path: str) -> str:
    return (f"{BASE}/storage/v1/object/public/{BUCKET}/"
            + urllib.parse.quote(path, safe="/"))


def download(path: str) -> bytes:
    return send("GET", url(path))


def list_exact(key: str, path: str) -> bool:
    folder, filename = path.rsplit("/", 1)
    payload = json.dumps({
        "prefix": folder + "/", "search": filename, "limit": 1000, "offset": 0,
    }).encode("utf-8")
    result = json.loads(send("POST", f"{BASE}/storage/v1/object/list/{BUCKET}",
                             key, payload, "application/json"))
    if not isinstance(result, list) or len(result) >= 1000:
        raise RuntimeError("Storage listing unexpectedly truncated or invalid")
    return any(obj.get("name") == filename for obj in result)


def publish(key: str, path: str, data: bytes, content_type: str) -> str:
    if list_exact(key, path):
        if digest(download(path)) != digest(data):
            raise RuntimeError(f"Existing object differs; no overwrite permitted: {path}")
        return "already-identical"
    send("POST", (f"{BASE}/storage/v1/object/{BUCKET}/"
                  + urllib.parse.quote(path, safe="/")),
         key, data, content_type)
    if digest(download(path)) != digest(data):
        raise RuntimeError(f"Upload/read-back mismatch: {path}")
    return "uploaded"


def rows(key: str) -> list[dict]:
    query = urllib.parse.urlencode({
        "select": "id,storage_path,image_url,sort_order",
        "order": "sort_order.asc",
    })
    result = json.loads(send("GET", f"{BASE}/rest/v1/about_gallery?{query}", key))
    if not isinstance(result, list) or len(result) != EXPECTED:
        raise RuntimeError(f"Expected exactly {EXPECTED} editorial source photos, got {len(result)}")
    seen = set()
    for item in result:
        source = item.get("storage_path")
        if (not isinstance(source, str)
            or not source.startswith(FOLDER + "/")
            or "/" in source[len(FOLDER) + 1:]
            or not source.lower().endswith((".jpg", ".jpeg"))
            or source in seen
            or source not in item.get("image_url", "")):
            raise RuntimeError(f"Unsafe or unexpected original path: {source}")
        seen.add(source)
    return result


def decode_jpg(original: bytes, source: str) -> tuple[Image.Image, bytes | None]:
    try:
        with Image.open(io.BytesIO(original)) as src:
            if src.format != "JPEG":
                raise RuntimeError(f"Not JPEG: {source}")
            icc = src.info.get("icc_profile")
            # Browser JPEG display normally honors EXIF orientation; apply it
            # when converting so that no unexpected crop/rotation is introduced.
            decoded = ImageOps.exif_transpose(src).convert("RGB")
            decoded.load()
        return decoded, icc
    except UnidentifiedImageError as error:
        raise RuntimeError(f"Original JPG is invalid: {source}") from error


def encode_png(decoded: Image.Image, icc: bytes | None) -> bytes:
    output = io.BytesIO()
    kwargs = {"format": "PNG", "compress_level": 6}
    if icc:
        kwargs["icc_profile"] = icc
    decoded.save(output, **kwargs)
    result = output.getvalue()
    with Image.open(io.BytesIO(result)) as image:
        image.load()
        if (image.format != "PNG"
            or image.mode != "RGB"
            or image.size != decoded.size
            or digest(image.tobytes()) != digest(decoded.tobytes())):
            raise RuntimeError("PNG pixels do not match decoded JPG pixels")
    return result


def encode_webp(png: bytes) -> bytes:
    with Image.open(io.BytesIO(png)) as original:
        original.load()
        output = io.BytesIO()
        opts = {"format": "WEBP", "quality": 82, "method": 6}
        if original.info.get("icc_profile"):
            opts["icc_profile"] = original.info["icc_profile"]
        original.save(output, **opts)
        data = output.getvalue()
        expected = original.size
    with Image.open(io.BytesIO(data)) as converted:
        converted.load()
        if converted.format != "WEBP" or converted.size != expected:
            raise RuntimeError("WebP format or dimensions mismatch")
    return data


def audit(key: str, mode: str, report_path: str) -> None:
    report = {
        "project": PROJECT_ID, "bucket": BUCKET,
        "mode": mode, "status": "preflight",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "source_folder": FOLDER, "no_originals_removed": True,
        "cms_records_changed": 0, "photos": [],
    }
    originals = []
    try:
        # PRE-FLIGHT: read and validate all 12 originals, then CREATE PNGs.
        # No Storage writes occur until all source JPEGs pass validation.
        for item in rows(key):
            original_path = item["storage_path"]
            filename = original_path.rsplit("/", 1)[1]
            stem = filename.rsplit(".", 1)[0]
            png_path = f"{FOLDER}/PNG/{stem}.png"
            webp_path = f"{FOLDER}/WebP/{stem}.webp"
            jpg = download(original_path)
            decoded, icc = decode_jpg(jpg, original_path)
            png = encode_png(decoded, icc)
            entry = {
                "id": item["id"], "source_jpg": original_path,
                "png": png_path, "webp": webp_path,
                "dimensions": list(decoded.size),
                "sha256_jpg": digest(jpg), "sha256_png": digest(png),
                "bytes_jpg": len(jpg), "bytes_png": len(png),
                "jpg_preserved": True, "state": "PNG-generated",
            }
            report["photos"].append(entry)
            originals.append((entry, jpg, png))
            print(f"PNG ready {len(originals):02d}/{EXPECTED}: {stem}", flush=True)

        if mode == "apply":
            report["status"] = "uploading-PNG"
            for entry, _, png in originals:
                entry["png_upload"] = publish(key, entry["png"], png, "image/png")
                entry["state"] = "PNG-published"
            print("12/12 PNGs are now published. Starting WebP phase.", flush=True)

        # Strict second phase: WebP is generated only after all 12 PNGs exist.
        report["status"] = "generating-WebP"
        for entry, jpg, png in originals:
            actual_png = download(entry["png"]) if mode in ("apply", "verify") else png
            if digest(actual_png) != entry["sha256_png"]:
                raise RuntimeError(f"PNG read-back checksum differs: {entry['png']}")
            webp = encode_webp(actual_png)
            entry["bytes_webp"] = len(webp)
            entry["sha256_webp"] = digest(webp)
            entry["change_vs_jpg_percent"] = round(
                100 * (1 - len(webp) / len(jpg)), 2)
            if mode == "apply":
                entry["webp_upload"] = publish(key, entry["webp"], webp, "image/webp")
            if mode in ("verify", "apply"):
                downloaded = download(entry["webp"])
                if digest(downloaded) != entry["sha256_webp"]:
                    raise RuntimeError(f"WebP read-back checksum differs: {entry['webp']}")
                with Image.open(io.BytesIO(downloaded)) as image:
                    image.load()
                    if image.format != "WEBP" or list(image.size) != entry["dimensions"]:
                        raise RuntimeError(f"Invalid WebP output: {entry['webp']}")
                if digest(download(entry["source_jpg"])) != entry["sha256_jpg"]:
                    raise RuntimeError(f"Original JPG changed: {entry['source_jpg']}")
            entry["state"] = "verified" if mode in ("apply", "verify") else "dry-run"
            print(f"WebP {mode} {len([e for e in report['photos'] if e.get('bytes_webp') is not None]):02d}/{EXPECTED}: "
                  f"{entry['webp']}", flush=True)

        report["status"] = "success"
        report["totals"] = {
            "jpg_original_count": EXPECTED,
            "png_count": EXPECTED,
            "webp_count": EXPECTED,
            "jpg_bytes": sum(e["bytes_jpg"] for e in report["photos"]),
            "png_bytes": sum(e["bytes_png"] for e in report["photos"]),
            "webp_bytes": sum(e["bytes_webp"] for e in report["photos"]),
        }
        print(f"SUCCESS: {EXPECTED} JPG originals preserved; "
              f"{EXPECTED} PNG and {EXPECTED} WebP processed; no CMS edits.", flush=True)
    except Exception as exc:
        report["status"] = "failed"
        report["error"] = str(exc)
        raise
    finally:
        with open(report_path, "w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    if os.getenv("LCR_APPROVED_MIGRATION") != "1" or os.getenv("LCR_TEST_MODE") == "1":
        raise SystemExit("Real migration suspended: separate authorized environment and budget required.")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=["apply", "verify", "dry-run"])
    parser.add_argument("--report", default="about-gallery-png-webp-report.json")
    args = parser.parse_args()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not key:
        parser.error("SUPABASE_SERVICE_ROLE_KEY must be configured as a protected runner secret")
    try:
        audit(key, args.mode, args.report)
    except Exception as exc:
        print(f"ABORTED: {exc}", file=sys.stderr)
        sys.exit(1)
