#!/usr/bin/env python3
"""Verify crawler-facing static HTML and the WhatsApp-compatible JPEG; never execute React.
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
ASSET = 'assets/branding/social/lcr-portfolio-og.jpg'
PNG_ASSET = 'assets/branding/social/lcr-portfolio-og.png'
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
  "og:image": "https://leonardocamargorossato.github.io/LCR-SolutionsArchitecture-IA-Quantum/assets/branding/social/lcr-portfolio-og.jpg?v=3",
  "og:image:width": "1200",
  "og:image:height": "630",
  "og:image:type": "image/jpeg",
  "og:image:alt": "Leonardo Rossato portfolio preview",
  "twitter:card": "summary_large_image",
  "twitter:title": "Leonardo Rossato | AI Engineer & Software Developer Portfolio",
  "twitter:description": "Building intelligent solutions through AI engineering, software development, AI agents, LLMs, RAG, hybrid retrieval and systems architecture.",
  "twitter:image": "https://leonardocamargorossato.github.io/LCR-SolutionsArchitecture-IA-Quantum/assets/branding/social/lcr-portfolio-og.jpg?v=3",
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
    assert 0 < html.encode('utf-8').lower().find(b'</head>') < 300_000, 'head outside WhatsApp HTML budget'
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
    assert len(data) <= 1_000_000, 'preserved approved PNG exceeds archive budget'
    assert hashlib.sha256(data).hexdigest() == INVENTORY['sha256'], 'inventory hash mismatch'
    assert len(data) == INVENTORY['bytes'], 'inventory byte count mismatch'

def check_jpeg(data):
    expected = INVENTORY['social_preview']
    assert 0 < len(data) < 300_000, 'social JPEG exceeds 300 KB compatibility budget'
    assert len(data) == expected['bytes'], 'JPEG inventory byte count mismatch'
    assert hashlib.sha256(data).hexdigest() == expected['sha256'], 'JPEG inventory hash mismatch'
    assert data[:2] == b'\xff\xd8' and data[-2:] == b'\xff\xd9', 'invalid JPEG markers'
    pos, dimensions = 2, None
    while pos < len(data):
        assert data[pos] == 0xff, 'invalid JPEG segment'
        while pos < len(data) and data[pos] == 0xff:
            pos += 1
        marker = data[pos]
        pos += 1
        if marker == 0xda:
            break
        assert pos + 2 <= len(data), 'truncated JPEG segment'
        size = struct.unpack_from('>H', data, pos)[0]
        assert size >= 2 and pos + size <= len(data), 'invalid JPEG segment size'
        if marker == 0xc0:
            precision, height, width, components = struct.unpack_from('>BHHB', data, pos + 2)
            assert precision == 8 and components == 3, 'expected baseline RGB-compatible JPEG'
            dimensions = (width, height)
        assert marker != 0xc2, 'progressive JPEG not permitted for this compatibility asset'
        pos += size
    assert dimensions == (1200, 630), f'wrong JPEG dimensions: {dimensions}'
    assert dimensions[0] >= 300 and dimensions[0] <= 4 * dimensions[1], 'WhatsApp dimensions'

def check_webp(data):
    expected = INVENTORY['optimized']
    assert len(data) == expected['bytes'], 'WebP inventory byte count mismatch'
    assert hashlib.sha256(data).hexdigest() == expected['sha256'], 'WebP inventory hash mismatch'
    assert data[:4] == b'RIFF' and data[8:12] == b'WEBP', 'not a WebP'
    assert struct.unpack_from('<I', data, 4)[0] + 8 == len(data), 'invalid RIFF size'
    pos = 12
    dimensions = []
    while pos < len(data):
        assert pos + 8 <= len(data), 'truncated WebP chunk'
        kind = data[pos:pos+4]
        size = struct.unpack_from('<I', data, pos+4)[0]
        end = pos + 8 + size
        assert end <= len(data), 'truncated WebP payload'
        payload = data[pos+8:end]
        if kind == b'VP8X':
            assert len(payload) == 10, 'invalid VP8X header'
            dimensions.append((1 + int.from_bytes(payload[4:7], 'little'), 1 + int.from_bytes(payload[7:10], 'little')))
        elif kind == b'VP8 ':
            assert len(payload) >= 10 and payload[3:6] == b'\x9d\x01\x2a', 'invalid VP8 frame header'
            w, h = struct.unpack_from('<HH', payload, 6)
            dimensions.append((w & 0x3fff, h & 0x3fff))
        elif kind == b'VP8L':
            assert len(payload) >= 5 and payload[0] == 0x2f, 'invalid VP8L header'
            bits = int.from_bytes(payload[1:5], 'little')
            dimensions.append(((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1))
        pos = end + (size & 1)
    assert pos == len(data), 'invalid WebP padding'
    assert dimensions and all(d == (1200, 630) for d in dimensions), dimensions

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
        assert (d/ASSET).is_file(), 'Social JPEG missing'
        check_jpeg((d/ASSET).read_bytes())
        assert (d/PNG_ASSET).is_file(), 'Approved Drawer PNG missing'
        check_png((d/PNG_ASSET).read_bytes())
        if 'optimized' in INVENTORY:
            webp = d / INVENTORY['optimized']['path'].removeprefix('public/')
            assert webp.is_file(), 'Approved Drawer WebP missing: ' + str(webp)
            check_webp(webp.read_bytes())
        assert (d/'og-cover.svg').read_bytes()==(ROOT/'public/og-cover.svg').read_bytes()
        print('PASS: build HTML, HTTPS absolute URLs, JPEG dimensions/hash/under 300 KB, approved PNG and WebP hashes, legacy SVG preserved')
        return
    for ua in ('WhatsApp/2.22.20.72 A','WhatsApp/2.22.19.78 I','WhatsApp/2.2236.3 N','LinkedInBot/1.0','Twitterbot/1.0'):
        html, typ, headers = fetch(BASE, ua)
        assert typ == 'text/html', typ
        check_html(html.decode('utf-8'))
        data, typ, headers = fetch(IMAGE, ua)
        assert typ == 'image/jpeg', typ
        check_jpeg(data)
        print('PASS', ua, '200 HTML + JPEG', len(data), 'bytes; exact SHA-256; 1200x630; under 300 KB')
    # Verify retained derivatives once; no repeated heavy PNG transfer per crawler.
    png, typ, _ = fetch(BASE + PNG_ASSET, 'WhatsApp/2.22.20.72 A')
    assert typ == 'image/png', typ
    check_png(png)
    webp, typ, _ = fetch(BASE + INVENTORY['optimized']['path'].removeprefix('public/'), 'WhatsApp/2.22.20.72 A')
    assert typ == 'image/webp', typ
    check_webp(webp)
    print('PASS preserved approved PNG and WebP; native app preview/cache still requires human verification.')

if __name__=='__main__': main()
