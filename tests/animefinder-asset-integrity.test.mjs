import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const root = 'public/assets/projects/animefinder'
const manifest = JSON.parse(await readFile(join(root, 'assets-index.json'), 'utf8'))
assert.equal(manifest.project, 'AnimeFinder')
assert.equal(manifest.assets.length, 16)
const seen = new Set()
const report = []

for (const asset of manifest.assets) {
  assert.match(asset.asset_id, /^animefinder-\d{2}-[a-z0-9-]+$/)
  assert(!seen.has(asset.asset_id), 'Duplicate asset identifier: ' + asset.asset_id)
  seen.add(asset.asset_id)
  assert.equal(asset.screenshot_authentic, true)
  assert.equal(asset.ai_generated, false)
  assert.deepEqual(asset.dimensions, { width: 1280, height: 1024 })

  const pngPath = 'public' + asset.png
  const webpPath = 'public' + asset.webp
  const png = await readFile(pngPath)
  const webp = await readFile(webpPath)
  const sha = (content) => createHash('sha256').update(content).digest('hex')
  assert.equal(sha(png), asset.png_sha256, 'PNG hash mismatch: ' + asset.asset_id)
  assert.equal(sha(webp), asset.webp_sha256, 'WebP hash mismatch: ' + asset.asset_id)
  assert.equal(png.length, asset.png_bytes)
  assert.equal(webp.length, asset.webp_bytes)
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG header mismatch')
  assert.equal(png.readUInt32BE(16), 1280, 'Original PNG width altered')
  assert.equal(png.readUInt32BE(20), 1024, 'Original PNG height altered')
  assert.equal(webp.subarray(0, 4).toString('ascii'), 'RIFF', 'WebP RIFF header missing')
  assert.equal(webp.subarray(8, 12).toString('ascii'), 'WEBP', 'WebP content is not valid')
  assert((await stat(pngPath)).isFile())
  assert((await stat(webpPath)).isFile())
  report.push({ id: asset.asset_id, pngBytes: png.length, webpBytes: webp.length })
}
assert.equal(seen.size, 16)
const pngTotal=report.reduce((s,r)=>s+r.pngBytes,0)
const webpTotal=report.reduce((s,r)=>s+r.webpBytes,0)
const reduction=(1-webpTotal/pngTotal)*100
assert(reduction>50, 'WebP optimization ratio below expected threshold')
console.log('PASS AnimeFinder: 16 unmodified original PNGs, 16 valid WebPs, 16 unique IDs, manifest SHA-256, 1280x1024; reduction',reduction.toFixed(1)+'%')
