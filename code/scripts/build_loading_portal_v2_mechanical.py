"""Adapted from the ChatDrawer's build_layers.py. Never redraw the approved master.
Run with Pillow 12.3.0 and NumPy 2.3.5. Every output must match the handoff SHA-256.
No file is copied into public until the entire set has passed validation.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
import hashlib, json, tempfile, shutil, sys

APP_ROOT = Path(__file__).resolve().parents[1]
ASSETS = APP_ROOT / 'public/assets/home/loading-portal'
GEOMETRY = json.loads((APP_ROOT/'src/components/loading-portal/v2/portal-door-geometry.json').read_text())

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def require(ok, message):
    if not ok:
        raise RuntimeError(message)

def verify(folder):
    for name, v in GEOMETRY['variants'].items():
        ref = ASSETS/v['reference'] if name != '4x3' else folder/v['reference']
        require(sha(ref) == v['referenceSha256'], str(ref))
        bg = Image.open(ref).convert('RGB')
        require(bg.size == (v['width'], v['height']), 'Bad reference size: '+name)
        composition = Image.new('RGBA', bg.size)
        for layer in ('right','left','core'):
            rec = v[layer]
            path = folder/rec['path']
            require(sha(path) == rec['sha256'], 'SHA mismatch: '+str(path))
            im = Image.open(path).convert('RGBA')
            require(im.size == bg.size and list(im.getbbox()) == rec['contentBbox'], 'Bad geometry: '+str(path))
            composition.alpha_composite(im)
        require(np.array_equal(np.asarray(bg), np.asarray(composition.convert('RGB'))) and composition.getchannel('A').getextrema()==(255,255), 'Closed mismatch: '+name)
        print('PASS', name, 'exact hashes and zero closed pixel mismatch', flush=True)

def build():
    master_path = ASSETS/'portal-000.webp'
    require(sha(master_path)==GEOMETRY['masterSha256'], 'Master SHA mismatch')
    master = Image.open(master_path).convert('RGB')
    require(master.size == (1672,941), 'Master size mismatch')
    master_a = np.asarray(master)
    with tempfile.TemporaryDirectory(prefix='lcr-portal-v2-') as tmp:
        out=Path(tmp)
        master.crop((208,0,1463,941)).resize((1200,900),Image.Resampling.LANCZOS).save(out/'loading-portal-base-4x3.webp','WEBP',quality=89,method=6)
        for asp,v in GEOMETRY['variants'].items():
            ref = out/v['reference'] if asp=='4x3' else ASSETS/v['reference']
            require(sha(ref)==v['referenceSha256'], 'Reference mismatch: '+asp)
            im=Image.open(ref).convert('RGB')
            w,h=im.size; a=np.array(im); t=v['transform']
            sx,sy,tx,ty=[t[k] for k in ('scale_x','scale_y','translate_x','translate_y')]
            split=round(836*sx+tx)
            require(split==v['splitX'], 'Split mismatch: '+asp)
            mask=Image.new('L',(w,h))
            ImageDraw.Draw(mask).polygon([(round(x*sx+tx),round(y*sy+ty)) for x,y in GEOMETRY['masterCorePolygon']],fill=255)
            m=np.array(mask)>0
            yy,xx=np.indices((h,w)); right=xx>=split; hidden=m&right
            rebuilt=a.copy()
            for y in np.where(hidden.any(axis=1))[0]:
                cols=np.flatnonzero(hidden[y]); edge=cols[-1]+1
                sy0=int(np.clip(round((y-ty)/sy),0,940))
                source_edge=int(np.clip(round((edge-tx)/sx),0,1671))
                start=max(1080,source_edge+5); end=min(1410,start+48)
                sample=master_a[sy0,start:end].astype(float)
                if len(sample)==0: sample=master_a[sy0,1090:1140].astype(float)
                col=np.median(sample,axis=0)
                q=(cols-split)/max(1,edge-split); tex=sample[(cols-split)%len(sample)]-col
                rebuilt[y,cols]=np.clip(col[None,:]*(.83+.17*q[:,None])+tex*.18,0,255).astype('uint8')
            patch=Image.fromarray(rebuilt); d=ImageDraw.Draw(patch)
            for y0,x0,x1 in [(424,836,1068),(457,836,1068),(465,836,1068)]:
                y1=round(y0*sy+ty)
                d.line([(round(x0*sx+tx),y1),(round(x1*sx+tx),y1)],fill=(27,58,77),width=max(1,round(sy)))
            pp=np.array(patch); seamw=max(2,round(8*sx))
            pp[:,split:split+seamw]=np.minimum(pp[:,split:split+seamw],np.array([8,15,23],dtype=np.uint8))
            rebuilt[hidden]=pp[hidden]
            for name,rgb,alpha in [('left',a,~right),('right',rebuilt,right),('core',a,m)]:
                rgba=np.dstack((rgb,np.where(alpha,255,0).astype('uint8'))); rgba[~alpha,:3]=0
                dest=out/v[name]['path']; dest.parent.mkdir(parents=True,exist_ok=True)
                Image.fromarray(rgba,'RGBA').save(dest,'WEBP',lossless=True,method=6,exact=True)
        verify(out)
        for file in out.rglob('*.webp'):
            dest=ASSETS/file.relative_to(out); dest.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(file,dest)

if __name__ == '__main__':
    if '--check' in sys.argv:
        verify(ASSETS)
    else:
        build()
