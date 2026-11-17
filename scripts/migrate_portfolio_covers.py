#!/usr/bin/env python3
"""LCR Portfolio — migrate 9 project covers safely. Dry-run by default.

Requires Pillow (pinned in requirements-migration.txt). --apply also requires
SUPABASE_SERVICE_ROLE_KEY in the process environment, never in source control.
Never deletes originals. Back up affected CMS rows before applying.
"""
import argparse, hashlib, io, json, os, sys, urllib.parse, urllib.request, urllib.error
from pathlib import Path
from PIL import Image

PROJECT = "wdjffhfnzydudmhhekmk"
BUCKET = "portfolio-media"
COVERS = [
  ("cities-comparing","1789395964303-3c1f29cc-c8bd-42d7-8a7d-752b81756026-CitiesComparing_CapaCard.png","projects","city-comparing","cover_url"),
  ("embedded-control-platform","1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.png","more_projects","embedded-control-platform","image_url"),
  ("foton-hub","1789395184532-2e274ccc-e2ad-4c41-b7b8-a795f181f84b-FotonHub_CapaCard.png","projects","foton-hub","cover_url"),
  ("hamlet","1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.png","projects","hamlet","cover_url"),
  ("pdf-frequency-analyzer","1789577994613-5507d9da-b3c8-42c1-9f27-ecdb8989dbef-FrequencyAnalyser_CapaCard.png","more_projects","pdf-frequency-analyzer","image_url"),
  ("quantum-education-apps","1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.png","more_projects","quantum-education-apps","image_url"),
  ("scientific-analysis-toolkit","1789577893972-0ac3894c-5459-4df2-989a-029bf13891ec-ScientificAnalysisToolitCapaCard.png","more_projects","scientific-analysis-toolkit","image_url"),
  ("speaker-portfolio","1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.png","projects","speaker-portfolio","cover_url"),
  ("webseer","1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.png","more_projects","webseer","image_url"),
]

def checksum(data): return hashlib.sha256(data).hexdigest()
def request(method,url,key=None,data=None,mime=None):
  headers={"User-Agent":"LCR-portfolio-assets-migration"}
  if key: headers.update({"apikey":key,"Authorization":"Bearer "+key})
  if mime: headers["Content-Type"]=mime
  if method=="PATCH": headers["Prefer"]="return=representation"
  req=urllib.request.Request(url,data=data,headers=headers,method=method)
  try:
    with urllib.request.urlopen(req,timeout=45) as r: return r.read()
  except urllib.error.HTTPError as e:
    raise RuntimeError(f"{method} failed HTTP {e.code}: {e.read().decode(errors='replace')[:300]}") from e
def public_url(base,path): return f"{base}/storage/v1/object/public/{BUCKET}/{urllib.parse.quote(path,safe='/')}"
def get(base,path): return request("GET",public_url(base,path))
def put(base,key,path,data,mime):
  try: old=get(base,path)
  except RuntimeError as exc:
    if "HTTP 404" not in str(exc): raise
    old=None
  if old is not None:
    if checksum(old)!=checksum(data): raise RuntimeError("Destination differs, refusing overwrite: "+path)
    return "already verified"
  request("POST",f"{base}/storage/v1/object/{BUCKET}/{urllib.parse.quote(path,safe='/')}",key,data,mime)
  if checksum(get(base,path))!=checksum(data): raise RuntimeError("Upload hash mismatch: "+path)
  return "uploaded and verified"
def cms(base,key,table,id,field):
  q=urllib.parse.urlencode({"id":f"eq.{id}","select":f"id,{field}"})
  rows=json.loads(request("GET",f"{base}/rest/v1/{table}?{q}",key))
  if len(rows)!=1: raise RuntimeError(f"Expected one {table}/{id}, found {len(rows)}")
  return rows[0][field]
def update(base,key,table,id,field,old,new):
  q=urllib.parse.urlencode({"id":f"eq.{id}",field:f"eq.{old}","select":"id"})
  rows=json.loads(request("PATCH",f"{base}/rest/v1/{table}?{q}",key,json.dumps({field:new}).encode(),"application/json"))
  if len(rows)!=1 or cms(base,key,table,id,field)!=new: raise RuntimeError("CMS verification failed: "+id)
def main():
  p=argparse.ArgumentParser(description=__doc__);p.add_argument("--apply",action="store_true");p.add_argument("--report",default="portfolio-cover-migration-report.json")
  args=p.parse_args()
  base=os.getenv("SUPABASE_URL",f"https://{PROJECT}.supabase.co").rstrip("/")
  if urllib.parse.urlparse(base).hostname!=PROJECT+".supabase.co": p.error("Wrong Supabase project")
  key=os.getenv("SUPABASE_SERVICE_ROLE_KEY") if args.apply else None
  if args.apply and not key: p.error("SUPABASE_SERVICE_ROLE_KEY is required for --apply")
  log=[];pending=[]
  for slug,filename,table,id,field in COVERS:
    origin=f"projects/{slug}/{filename}"
    png=f"projects/{slug}/PNG/{filename}"
    webp=f"projects/{slug}/WebP/{filename[:-4]}.webp"
    before=get(base,origin)
    if before[:8]!=b"\x89PNG\r\n\x1a\n": raise RuntimeError("Source isn't PNG: "+origin)
    with Image.open(io.BytesIO(before)) as image:
      image.load();size=image.size;output=io.BytesIO()
      image.save(output,format="WEBP",quality=82,method=6)
    optimized=output.getvalue()
    with Image.open(io.BytesIO(optimized)) as check:
      if check.format!="WEBP" or check.size!=size: raise RuntimeError("Bad WebP: "+slug)
    record={"project":slug,"source":origin,"png":png,"webp":webp,"original_bytes":len(before),"webp_bytes":len(optimized),"sha256":checksum(before),"dimensions":size,"state":"dry-run"}
    log.append(record)
    print(f"{slug}: {len(before)} PNG bytes -> {len(optimized)} WebP bytes")
    if args.apply:
      old=public_url(base,origin);new=public_url(base,png)
      if cms(base,key,table,id,field) not in (old,new): raise RuntimeError("Unexpected CMS URL: "+slug)
      record["png_verification"]=put(base,key,png,before,"image/png")
      record["webp_verification"]=put(base,key,webp,optimized,"image/webp")
      record["state"]="files-verified"
      pending.append((record,table,id,field,old,new))
  if args.apply:
    # No CMS links change until every image is copied and checked.
    for record,table,id,field,old,new in pending:
      if cms(base,key,table,id,field)==old: update(base,key,table,id,field,old,new)
      record["state"]="cms-verified"
      print("CMS updated: "+record["project"])
  Path(args.report).write_text(json.dumps({"applied":args.apply,"assets":log},indent=2)+"\n")
  print("Report saved. No legacy assets deleted.")
if __name__=="__main__":
  try: main()
  except Exception as error:
    print("MIGRATION ABORTED:",error,file=sys.stderr);sys.exit(1)
