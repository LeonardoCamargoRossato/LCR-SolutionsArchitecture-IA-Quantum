#!/usr/bin/env python3
"""Validate the six static portal variants against the source and metadata."""
from hashlib import sha256
import json
from pathlib import Path
from PIL import Image

APP_ROOT=Path(__file__).resolve().parents[1]
DIR=APP_ROOT/"public/assets/home/loading-portal"
source=DIR/"portal-000.webp"
metadata=json.loads((DIR/"loading-portal-variants.metadata.json").read_text(encoding="utf-8"))
assert source.exists()
assert sha256(source.read_bytes()).hexdigest()==metadata["master_sha256"]
assert len(metadata["variants"])==6
for item in metadata["variants"]:
    path=DIR/item["name"]
    assert path.exists(), f"Missing asset: {path}"
    assert Image.open(path).size==tuple(item["size_px"])
    assert sha256(path.read_bytes()).hexdigest()==item["sha256"]
    assert path.stat().st_size==item["bytes"]
    w,h=item["size_px"]
    cx,cy=item["core_output_px"]
    assert 0<cx<w and 0<cy<h, f"Core outside image: {path}"
    transform=item["transform"]
    sx,sy=transform["scale_x"],transform["scale_y"]
    # Crop-source scaling may differ below one source pixel due to rounding.
    assert abs(sx-sy)<0.003, f"Image deformation: {path}"
    print("VALID",path.name,w,h,"core:",cx,cy)
assert (DIR/"loading-portal-base-16x9.webp").read_bytes()==source.read_bytes()
print("PASS: all 6 static variants validated, existing master preserved")
