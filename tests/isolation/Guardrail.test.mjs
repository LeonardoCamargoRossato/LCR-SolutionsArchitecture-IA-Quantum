import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from './Browser.mjs'
import { assertIsolated,FIXTURE_URL } from './Environment.mjs'
assertIsolated()
const denied='https://lcr-egress-probe.invalid/'
await assert.rejects(fetch(denied),/LCR egress blocked/)
await assert.rejects(fetch(FIXTURE_URL+'/probe/redirect'),/LCR egress blocked/)
const response=await fetch(FIXTURE_URL+'/rest/v1/about_gallery?visible=eq.true')
assert.equal(response.status,200)
assert.equal((await response.json()).length,10)
assert.equal((await (await fetch(FIXTURE_URL+'/rest/v1/about')).json()).length,0)
assert.equal((await fetch(FIXTURE_URL+'/probe/error')).status,503)
assert.equal((await fetch(FIXTURE_URL+'/rest/v1/projects',{method:'DELETE'})).status,403)
for(const [path,mime] of [['PNG/fixture-photo-01.png','image/png'],['WebP/fixture-photo-01.webp','image/webp']]){
  const image=await fetch(FIXTURE_URL+'/storage/v1/object/public/portfolio-media/about/gallery/'+path)
  assert.equal(image.headers.get('content-type'),mime)
  assert((await image.arrayBuffer()).byteLength>100)
}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
try{
  const page=await browser.newPage()
  await assert.rejects(page.goto(denied,{timeout:10000}))
  await assert.rejects(page.goto(FIXTURE_URL+'/probe/redirect',{timeout:10000}))
}finally{await browser.close()}
const rows=(await readFile(process.env.LCR_NETWORK_LOG,'utf8')).trim().split('\n').map(JSON.parse)
assert(rows.some(r=>r.transport==='node-fetch'&&r.expected))
assert(rows.some(r=>r.transport==='node-fetch-redirect'&&r.expected))
assert(rows.some(r=>r.transport==='browser-request'&&r.expected))
assert(rows.every(r=>r.event!=='blocked'||r.expected))
console.log('PASS: loopback-only, simulated external and redirect blocked, fixture media/empty/error/read-only contracts')
