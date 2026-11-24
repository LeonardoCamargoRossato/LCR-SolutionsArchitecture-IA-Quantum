#!/usr/bin/env python3
"""Create the small JPEG social preview from the exact approved PNG; no artwork changes."""
import argparse
import hashlib
import io
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'public/assets/branding/social'
BUDGET = 300_000

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=DIR / 'lcr-portfolio-og.jpg')
    args = parser.parse_args()
    source = (DIR / 'lcr-portfolio-og.png').read_bytes()
    inventory = json.loads((ROOT / 'docs/branding/SOCIAL_ASSET_INVENTORY.json').read_text())
    assert hashlib.sha256(source).hexdigest() == inventory['sha256'], 'approved PNG changed'
    with Image.open(io.BytesIO(source)) as original:
        assert original.size == (1200, 630)
        image = original.convert('RGB')
        for quality in range(94, 69, -2):
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=quality, subsampling=0, optimize=True, progressive=False)
            data = output.getvalue()
            if len(data) < BUDGET:
                break
        else:
            raise RuntimeError('JPEG cannot meet budget without further quality approval')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(data)
    print(json.dumps({'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'quality': quality, 'width': 1200, 'height': 630}))

if __name__ == '__main__':
    main()
