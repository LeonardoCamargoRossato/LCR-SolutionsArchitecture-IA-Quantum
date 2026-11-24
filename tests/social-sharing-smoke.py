#!/usr/bin/env python3
"""Verify crawler-facing static HTML and actual PNG; never execute React.
Local: python3 tests/social-sharing-smoke.py --dist dist
Live: python3 tests/social-sharing-smoke.py --live
"""
import argparse
import hashlib
import io
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import struct
import zlib

BASE = 'https://leonardocamargorossato.github.io/LCR-SolutionsArchitecture-IA-Quantum/'
ASSET = 'assets/branding/social/lcr-portfolio-og.png'
TITLE = "Leonardo Rossato | AI Engineer & Software Developer Portfolio"
DESCRIPTION = "Building intelligent solutions through AI engineering, software development, AI agents, LLMs, RAG, hybrid retrieval and systems architecture."
ROOT = Path(__file__).resolve().parents[1]
INVENTORY = json.loads((ROOT / 'docs/branding/SOCIAL_ASSET_INVENTORY.json').read_text())
IMAGE = BASE + ASSET + '?v=' + str(INVENTORY['cache_version'])
EXPECTED = {
  "og:title": "Leonardo Rossato | AI Engineer & Software Developer Portfolio",
  "og:description": "Building intelligent solutions through AI engineering, software development, AI agents, LLMs, RAG, hybrid retrieval and systems architecture.",
  "og:type": "website",
  "og:site_name": "LCR Portfolio",
  "og:url": "https://leonardocamargorossato.github.io/LCR-SolutionsArchitecture-IA-Quantum/",
  "og:image": "https://leonardocamargorossato.github.io/LCR-SolutionsArchitecture-IA-Quantum/assets/branding/social/lcr-portfolio-og.png?v=1",
  "og:image:width": "1200",
  "og:image:height": "630",
  "og:image:type": "image/png",
  "og:image:alt": "Leonardo Rossato portfolio preview",
  "twitter:card": "summary_large_image",
  "twitter:title": "Leonardo Rossato | AI Engineer & Software Developer Portfolio",
  "twitter:description": "Building intelligent solutions through AI engineering, software development, AI agents, LLMs, RAG, hybrid retrieval and systems architecture.",
  "twitter:image": "https://leonardocamargorossato.github.io/LCR-SolutionsArchitecture-IA-Quantum/assets/branding/social/lcr-portfolio-og.png?v=1",
  "twitter:image:alt": "Leonardo Rossato portfolio preview"
}
EXPECTED['og:image'] = EXPECTED['twitter:image'] = IMAGE
# The approved replacement can update the inventory and alt text in one PR.
EXPECTED['og:image:alt'] = EXPECTED['twitter:image:alt'] = INVENTORY.get('alt', 'Leonardo Rossato portfolio preview')

class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_head = False
        self.meta = {}
        self.canon = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'head': self.in_head = True
        if not self.in_head: return
        if tag == 'meta':
            key = a.get('property') or a.get('name')
            if key in EXPECTED:
                assert key not in self.meta, f'duplicate {key}'
                assert ('property' if key.startswith('og:') else 'name') in a, key
                self.meta[key] = a.get('content')
        if tag == 'link' and a.get('rel') == 'canonical': self.canon.append(a.get('href'))
    def handle_endtag(self, tag):
        if tag == 'head': self.in_head = False

def check_html(html):
    head = Head()
    head.feed(html)
    assert head.meta == EXPECTED, {k: (head.meta.get(k),v) for k,v in EXPECTED.items() if head.meta.get(k)!=v}
    assert head.canon == [BASE], head.canon
    for key in ('og:url','og:image','twitter:image'):
        u = urlsplit(head.meta[key])
        assert u.scheme == 'https' and u.netloc == urlsplit(BASE).netloc and u.path.startswith(urlsplit(BASE).path) and not u.fragment, key

def check_png(data):
    assert data[:8] == b'\x89PNG\r\n\x1a\n', 'not a PNG'
    pos = 8
    kinds = []
    while pos < len(data):
        assert len(data)-pos >= 12, 'truncated chunk'
        size, kind = struct.unpack_from('>I4s',data,pos)
        end = pos+12+size
        assert end <= len(data), 'truncated PNG'
        payload = data[pos+8:pos+8+size]
        crc = struct.unpack_from('>I',data,pos+8+size)[0]
        assert zlib.crc32(kind+payload) & 0xffffffff == crc, 'PNG CRC mismatch'
        if kind == b'IHDR':
            assert struct.unpack_from('>II',payload) == (1200,630), 'wrong dimensions'
        kinds.append(kind)
        pos = end
    assert kinds[0]==b'IHDR' and kinds[-1]==b'IEND' and b'IDAT' in kinds
    assert len(data) <= 1_000_000, 'preview exceeds 1 MB project budget'
    assert hashlib.sha256(data).hexdigest() == INVENTORY['sha256'], 'inventory hash mismatch'
    assert len(data) == INVENTORY['bytes'], 'inventory byte count mismatch'

def fetch(url, ua):
    with urlopen(Request(url, headers={'User-Agent':ua,'Accept':'*/*'}),timeout=30) as response:
        assert response.status == 200, response.status
        assert response.geturl().startswith(BASE), response.geturl()
        return response.read(),response.headers.get_content_type(),dict(response.headers)

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--dist',default='dist')
    p.add_argument('--live',action='store_true')
    a=p.parse_args()
    if not a.live:
        d=ROOT / a.dist
        check_html((d/'index.html').read_text())
        check_png((d/ASSET).read_bytes())
        assert (d/'og-cover.svg').read_bytes()==(ROOT/'public/og-cover.svg').read_bytes()
        print('PASS: build HTML, HTTPS absolute URLs, PNG dimensions/CRC/hash, legacy SVG preserved')
        return
    for ua in ('WhatsApp/2.24.17.79','LinkedInBot/1.0','Twitterbot/1.0'):
        html, typ, headers=fetch(BASE,ua)
        assert typ=='text/html',typ
        check_html(html.decode('utf-8'))
        data,typ,headers=fetch(IMAGE,ua)
        assert typ=='image/png',typ
        check_png(data)
        print('PASS',ua,'200 HTML + PNG',len(data),'bytes; Cache-Control:',headers.get('Cache-Control',headers.get('cache-control','not supplied')))
    print('Crawler HTTP simulation only; actual platform previews/caches require native app or Post Inspector.')

if __name__=='__main__': main()
