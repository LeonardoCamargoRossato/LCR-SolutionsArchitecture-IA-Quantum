import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const inventory = JSON.parse(await readFile('docs/assets/cities-comparing-series-compare.json', 'utf8'))
assert.equal(inventory.items.length, 7, 'Expected exactly seven user-approved series images')
const seen = new Set()
let pngBytes = 0
let webpBytes = 0

for (const [index, item] of inventory.items.entries()) {
  const logical = String(index + 1).padStart(2, '0')
  assert.equal(item.position, index + 3, 'Slides must be numbered 3 through 9')
  assert.equal(item.id, 'cities-comparing-series-compare-' + logical)
  assert(!seen.has(item.id), 'Duplicate gallery item ID')
  seen.add(item.id)
  assert.equal(item.width, 1920)
  assert.equal(item.height, 1080)

  const png = await readFile(item.png.path)
  const webp = await readFile(item.webp.path)
  assert(png.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')), 'PNG header invalid')
  assert.equal(png.readUInt32BE(16), item.width)
  assert.equal(png.readUInt32BE(20), item.height)
  assert.equal(webp.toString('ascii', 0, 4), 'RIFF')
  assert.equal(webp.toString('ascii', 8, 12), 'WEBP')

  for (const [kind, file] of [['png', png], ['webp', webp]]) {
    assert.equal(file.byteLength, item[kind].bytes, 'Size mismatch for ' + kind)
    assert.equal(createHash('sha256').update(file).digest('hex'), item[kind].sha256, 'SHA mismatch for ' + kind)
    assert(item[kind].path.includes('/' + (kind === 'png' ? 'PNG' : 'WebP') + '/'))
  }

  pngBytes += png.byteLength
  webpBytes += webp.byteLength
  console.log('ASSET PASS', logical, 'PNG', png.byteLength, 'WebP', webp.byteLength)
}

const reduction = (100 * (1 - webpBytes / pngBytes)).toFixed(2)
console.log('PASS: 7 PNG originals + 7 WebPs: ' + pngBytes + ' -> ' + webpBytes + ' bytes, ' + reduction + '% smaller initial transfer.')

const selected = JSON.parse(await readFile('docs/assets/selected-case-galleries-inventory.json', 'utf8'))
assert.equal(selected.files.length,22)
assert.deepEqual(selected.cases.map(c=>[c.slug,c.slides]),[['cities-comparing',9],['foton-hub',1]])
for(const item of selected.files){
  const bytes=await readFile(item.path)
  assert.equal(bytes.length,item.bytes,item.path)
  const blob=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex')
  assert.equal(blob,item.gitBlob,'Git blob mismatch: '+item.path)
}
console.log('PASS: 22 existing selected-case asset blobs, unchanged; 9 Cities slides and 1 verified Foton cover.')

const additional=JSON.parse(await readFile('docs/assets/additional-work-inventory.json','utf8'))
assert.equal(additional.files.length,93)
assert.deepEqual(additional.slides,[1,10,1,1,1,8,1])
for(const item of additional.files){
  const bytes=await readFile(item.path)
  assert.equal(bytes.length,item.bytes,item.path)
  const blob=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex')
  assert.equal(blob,item.gitBlob,'Additional Work Git blob mismatch: '+item.path)
}
console.log('PASS: 93 approved Additional Work asset blobs, 7 projects, 23 slides.')
