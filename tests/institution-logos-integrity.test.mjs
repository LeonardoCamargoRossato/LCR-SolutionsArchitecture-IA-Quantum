import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const manifest = JSON.parse(await readFile('docs/assets/institution-logos.json', 'utf8'))
assert.equal(manifest.unique_marks, 5)
assert.equal(manifest.legacy_binding_count, 11)
assert.equal(manifest.entries.length, 5)
assert.equal(manifest.entries.reduce((sum, item) => sum + item.references, 0), 11)

const knownIds = new Set()
for (const item of manifest.entries) {
  assert(!knownIds.has(item.slug), 'Duplicated institutional brand')
  knownIds.add(item.slug)
  const svg = await readFile(item.svg_path)
  const xml = svg.toString('utf8')
  assert.equal(svg.length, item.svg_size, 'Unexpected vector size: ' + item.slug)
  assert.equal(createHash('sha256').update(svg).digest('hex'), item.svg_sha256,
    'SVG SHA256 mismatch: ' + item.slug)
  assert(/<svg\b[^>]*viewBox=/.test(xml), 'SVG needs a viewBox')
  assert(/<path\b/.test(xml), 'Real editable vector paths required')
  assert(!/<(?:script|foreignObject|image|rect|iframe|animate|use)\b/i.test(xml),
    'Unexpected embedded raster, background, executable element or remote reference')
  assert(!/href=|xlink:href=|data:image|url\(|<!DOCTYPE|<\?xml-stylesheet/i.test(xml),
    'SVG cannot depend on remote resources or embedded raster')
  assert(!/\bfill=["'](?:white|#fff|#ffffff)["']/i.test(xml.split('<g')[0]),
    'Canvas must not have a white background')
  console.log('SVG PASS', item.slug, svg.length, 'bytes')
}
console.log('PASS: 5 vector-only SVG files, 11 editorial bindings, no embedded PNG or background')
