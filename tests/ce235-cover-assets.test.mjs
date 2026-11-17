import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const inv=JSON.parse(await readFile('docs/assets/ce235-course-cover.json','utf8'))
assert.equal(inv.project_slug,'ce235-real-time-systems')
assert.equal(inv.files.length,6)
assert(inv.files.every(f=>f.path.startsWith('public/projects/ce235/cover/')))
for (const f of inv.files) {
  const buf=await readFile(f.path)
  const hash=createHash('sha256').update(buf).digest('hex')
  assert.equal(hash,f.sha256,'SHA mismatch: '+f.path)
  assert.equal(buf.length,f.bytes,'Size mismatch: '+f.path)
  if(f.relative_path.endsWith('.png')) {
    assert(buf.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')), 'Invalid PNG: '+f.path)
    assert.equal(buf.readUInt32BE(16),f.width)
    assert.equal(buf.readUInt32BE(20),f.height)
  } else {
    assert.equal(buf.toString('ascii',0,4),'RIFF')
    assert.equal(buf.toString('ascii',8,12),'WEBP')
  }
  console.log('ASSET PASS',f.relative_path,buf.length)
}
const original=inv.files.find(f=>f.relative_path.endsWith('original.png'))
assert.equal(original.sha256,inv.source_sha256,'Original screenshot must be byte-identical to upload')
const card=inv.files.find(f=>f.relative_path.endsWith('card.webp'))
assert(card.bytes < original.bytes / 5, 'Card should be significantly optimized')
console.log('PASS: six CE-235 assets valid; source PNG unchanged; optimized WebP cover')
