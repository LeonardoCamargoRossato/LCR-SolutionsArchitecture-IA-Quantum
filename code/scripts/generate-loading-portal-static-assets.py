#!/usr/bin/env python3
"""Generate static geometry-aligned WebP variants from the approved portal-000.webp.

Requires Pillow >= 10. Source and existing V1 assets remain untouched.
"""
from __future__ import annotations
from hashlib import sha256
import argparse
import json
from pathlib import Path
import shutil
from PIL import Image, ImageFilter, ImageEnhance

APP_ROOT=Path(__file__).resolve().parents[1]
SOURCE_SIZE=(1672,941)
CORE=(835.5,440.0)
SPLIT_X=835.5
VARIANTS=[
    ("16x9",(1672,941),"original"),
    ("16x10",(1600,1000),"crop"),
    ("21x9",(2520,1080),"extend"),
    ("3x4",(900,1200),"crop"),
    ("9x16",(1080,1920),"crop"),
    ("9x19_5",(1080,2340),"crop"),
]

def digest(path:Path)->str:
    return sha256(path.read_bytes()).hexdigest()

def crop_to_ratio(src:Image.Image,size:tuple[int,int]):
    sw,sh=src.size
    dw,dh=size
    aspect=dw/dh
    if aspect<sw/sh:
        cw=sh*aspect
        x0,y0,x1,y1=[round(v) for v in ((sw-cw)/2,0,(sw+cw)/2,sh)]
    else:
        ch=sw/aspect
        y=max(0,min(sh-ch,CORE[1]-ch/2))
        x0,y0,x1,y1=[round(v) for v in (0,y,sw,y+ch)]
    frame=src.crop((x0,y0,x1,y1)).resize(size,Image.Resampling.LANCZOS)
    sx=dw/(x1-x0)
    sy=dh/(y1-y0)
    return frame,{
        "source_crop_box_px":[x0,y0,x1,y1],
        "transform":{"scale_x":sx,"scale_y":sy,"translate_x":-x0*sx,"translate_y":-y0*sy},
        "core_output_px":[round((CORE[0]-x0)*sx,2),round((CORE[1]-y0)*sy,2)],
        "split_axis_x_output_px":round((SPLIT_X-x0)*sx,2),
    }

def extend_ultrawide(src:Image.Image,size:tuple[int,int]):
    sw,sh=src.size
    dw,dh=size
    scale=dh/sh
    cw=round(sw*scale)
    left=(dw-cw)//2
    sharp=src.resize((cw,dh),Image.Resampling.LANCZOS)
    ambient=src.resize((dw,dh),Image.Resampling.LANCZOS)
    ambient=ImageEnhance.Brightness(ambient.filter(ImageFilter.GaussianBlur(40))).enhance(.38)
    ambient.paste(sharp,(left,0))
    return ambient,{
        "source_crop_box_px":[0,0,sw,sh],
        "transform":{"scale_x":scale,"scale_y":scale,"translate_x":left,"translate_y":0},
        "core_output_px":[round(CORE[0]*scale+left,2),round(CORE[1]*scale,2)],
        "split_axis_x_output_px":round(SPLIT_X*scale+left,2),
        "ambient_extension":{"left_px":left,"right_px":dw-left-cw},
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--source",default=str(APP_ROOT/"public/assets/home/loading-portal/portal-000.webp"))
    p.add_argument("--output",default=str(APP_ROOT/"public/assets/home/loading-portal"))
    a=p.parse_args()
    source_path=Path(a.source)
    out=Path(a.output)
    out.mkdir(parents=True,exist_ok=True)
    src=Image.open(source_path).convert("RGB")
    if src.size!=SOURCE_SIZE:
        raise ValueError(f"Unexpected master geometry {src.size}, expected {SOURCE_SIZE}")
    records=[]
    for aspect,size,mode in VARIANTS:
        path=out/f"loading-portal-base-{aspect}.webp"
        if mode=="original":
            shutil.copy2(source_path,path)
            geo={"source_crop_box_px":[0,0,*src.size],
                 "transform":{"scale_x":1.0,"scale_y":1.0,"translate_x":0.0,"translate_y":0.0},
                 "core_output_px":list(CORE),"split_axis_x_output_px":SPLIT_X}
        else:
            frame,geo=extend_ultrawide(src,size) if mode=="extend" else crop_to_ratio(src,size)
            frame.save(path,"WEBP",quality=89,method=6)
        records.append({"aspect":aspect,"name":path.name,"size_px":list(size),"mode":mode,
                        "bytes":path.stat().st_size,"sha256":digest(path),**geo})
    manifest={
        "asset_id":"lcr-portfolio-loading-portal-static-v2",
        "master_path":"public/assets/home/loading-portal/portal-000.webp",
        "master_sha256":digest(source_path),
        "master_dimensions_px":list(src.size),
        "reference_master_png":"LCR_Loading_Portal_V1_Arquivos.zip :: assets/originais/portal-000.png",
        "geometry_px":{"split_axis_x":SPLIT_X,"core_center":list(CORE)},
        "strategy":"One unmodified source. 16:9 exact bytes; 16:10 cropped; 21:9 extended horizontally; portrait cropped without deformation.",
        "variants":records,
        "note":"Static WebP assets only. Future animated SVG overlays must use each variant's recorded geometry transform.",
    }
    (out/"loading-portal-variants.metadata.json").write_text(
        json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    for item in records:
        print(item["name"],item["size_px"],item["bytes"],item["mode"])

if __name__=="__main__":
    main()
