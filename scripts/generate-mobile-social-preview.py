#!/usr/bin/env python3
"""Derive mobile previews from the approved PNG without changing the artwork."""
import argparse
import hashlib
import io
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'public/assets/branding/social'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', type=Path, default=DIR)
    args = parser.parse_args()
    source = (DIR / 'lcr-portfolio-og.png').read_bytes()
    inventory = json.loads((ROOT / 'docs/branding/SOCIAL_ASSET_INVENTORY.json').read_text())
    assert hashlib.sha256(source).hexdigest() == inventory['sha256']
    with Image.open(io.BytesIO(source)) as original:
        assert original.size == (1200, 630)
        mobile = original.convert('RGB').resize((600, 315), Image.Resampling.LANCZOS)
        for fmt, suffix, budget, qualities in (
            ('JPEG', 'jpg', 50_000, range(80, 39, -5)),
            ('WEBP', 'webp', 20_000, range(65, 24, -5)),
        ):
            for quality in qualities:
                buf = io.BytesIO()
                options = dict(optimize=True, progressive=False, subsampling=2) if fmt == 'JPEG' else dict(method=6)
                mobile.save(buf, format=fmt, quality=quality, **options)
                data = buf.getvalue()
                if len(data) < budget:
                    break
            else:
                raise RuntimeError(f'{fmt} exceeds mobile budget')
            name = f'lcr-portfolio-og-wa.{suffix}'
            args.output_dir.mkdir(parents=True, exist_ok=True)
            (args.output_dir / name).write_bytes(data)
            print(json.dumps(dict(name=name, bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), quality=quality, width=600, height=315, budget=budget)))

if __name__ == '__main__':
    main()
