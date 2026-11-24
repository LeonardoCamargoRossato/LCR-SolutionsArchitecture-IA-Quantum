// Isolated, repeatable request timeline. No routing for normal scenarios (HTTP cache remains enabled).
import assert from 'node:assert/strict'
import { spawn,execFileSync } from 'node:child_process'
import { mkdir,writeFile } from 'node:fs/promises'
import { chromium } from './isolation/Browser.mjs'
const BASE='http://127.0.0.1:5188/LCR-SolutionsArchitecture-IA-Quantum/'
const sourceDir=process.argv.includes('--baseline') ? (process.env.LCR_BEFORE || process.cwd()) : process.cwd()
const baseline=process.argv.includes('--baseline')
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5188','--strictPort'],{cwd:sourceDir,stdio:'ignore',detached:true})
const report={sha:execFileSync('git',['rev-parse','HEAD'],{cwd:sourceDir,encoding:'utf8'}).trim(),baseline,scenarios:[]}
let browser
const dir='test-results/image-demand'
await mkdir(dir,{recursive:true})
const wait=ms=>new Promise(r=>setTimeout(r,ms))
async function instrument(page){
  const cdp=await page.context().newCDPSession(page)
  await cdp.send('Network.enable')
  let phase='initial';const entries=[],pending=new Map()
  cdp.on('Network.requestWillBeSent',e=>{
    if(e.type!=='Image'&&!/\.(?:png|jpe?g|webp|avif|svg)(?:[?#]|$)/i.test(e.request.url))return
    const row={phase,url:e.request.url,initiator:e.initiator.type,requestTime:e.timestamp,status:null,encodedBytes:null,cache:false}
    entries.push(row);pending.set(e.requestId,row)
  })
  cdp.on('Network.requestServedFromCache',e=>{const r=pending.get(e.requestId);if(r)r.cache=true})
  cdp.on('Network.responseReceived',e=>{const r=pending.get(e.requestId);if(r){r.status=e.response.status;r.cache||=Boolean(e.response.fromDiskCache||e.response.fromServiceWorker);r.mime=e.response.mimeType}})
  cdp.on('Network.loadingFinished',e=>{const r=pending.get(e.requestId);if(r)r.encodedBytes=e.encodedDataLength})
  cdp.on('Network.loadingFailed',e=>{const r=pending.get(e.requestId);if(r)r.error=e.errorText})
  return {entries,setPhase:p=>{phase=p},cdp}
}
const gallery=e=>e.url.includes('/about/gallery/')
const zoom=e=>gallery(e)&&e.url.includes('/PNG/')
async function geometry(page){
  return page.locator('.about-gallery-card').evaluateAll(nodes=>nodes.map(el=>{
    const r=el.querySelector('.progressive-image')?.getBoundingClientRect()??el.getBoundingClientRect(),clip=el.parentElement.getBoundingClientRect()
    return {visible:Math.min(r.right,clip.right,innerWidth)>Math.max(r.left,clip.left,0)&&Math.min(r.bottom,clip.bottom,innerHeight)>Math.max(r.top,clip.top,0),top:r.top,left:r.left}
  }))
}
async function loaded(page,selector){await page.waitForFunction(sel=>{const img=document.querySelector(sel);return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0},selector,{timeout:15000})}
async function run(viewport){
  const ctx=await browser.newContext({viewport,reducedMotion:'reduce',acceptDownloads:true})
  const page=await ctx.newPage(),net=await instrument(page)
  const result={viewport,requests:net.entries,geometry:[]};report.scenarios.push(result)
  await page.goto(BASE+'#/?portal=skip')
  const cards=page.locator('.about-gallery-card')
  await cards.first().waitFor({state:'attached',timeout:30000})
  await loaded(page,'[data-testid="hero-v6-blue-code"]')
  await wait(900)
  const initial=await geometry(page);result.geometry.push({phase:'initial',items:initial})
  await page.screenshot({path:dir+'/'+(baseline?'baseline':'candidate')+'-home-'+viewport.width+'.png'})
  const first=net.entries.filter(gallery)
  result.initialGalleryRequests=first.length
  result.initialGalleryBytes=first.reduce((s,r)=>s+(r.encodedBytes??0),0)
  if(!baseline){
    assert.equal(first.length,initial.filter(x=>x.visible).length,'Only geometrically visible gallery photos may be requested on initial Home')
    assert.equal(net.entries.filter(zoom).length,0)
    assert(!net.entries.some(e=>e.url.includes('ai-hamnet-enterprise-v2.svg')),'Hidden Hamlet scene fetched')
    assert(!net.entries.some(e=>e.url.includes('/assets/branding/social/')),'Social artwork preloaded by Home')
  }
  net.setPhase('scroll-first')
  await cards.first().scrollIntoViewIfNeeded()
  await loaded(page,'.about-gallery-card:first-child img.progressive-image-main')
  await wait(400)
  result.geometry.push({phase:'scroll-first',items:await geometry(page)})
  const firstUrl=await cards.first().locator('img.progressive-image-main').evaluate(img=>img.currentSrc)
  await page.screenshot({path:dir+'/'+(baseline?'baseline':'candidate')+'-gallery-'+viewport.width+'.png'})
  if(!baseline){
    const visible=await geometry(page)
    const expected=new Set(visible.flatMap((x,i)=>x.visible?[i]:[]))
    const actual=net.entries.filter(e=>e.phase==='scroll-first'&&gallery(e))
    for(const e of actual){const m=e.url.match(/fixture-photo-(\d+)/);if(m){const id=Number(m[1]);const index=[1,2,3,4,5,6,8,9,11,12].indexOf(id);assert(expected.has(index),'Clipped photo requested: '+e.url)}}
    assert.equal(net.entries.filter(zoom).length,0)
  }
  if(!baseline){
    const thumbnails=await page.locator('.about-gallery-grid-item').count()
    assert.equal(thumbnails,0,'Collapsed grid is not mounted')
  }
  net.setPhase('open')
  await cards.first().click()
  await loaded(page,'.image-lightbox-viewport img')
  const full=await page.locator('.image-lightbox-viewport img').evaluate(img=>img.currentSrc)
  assert(full.includes('/PNG/'))
  if(!baseline){const original=net.entries.filter(zoom);assert.equal(new Set(original.map(e=>e.url)).size,1);assert(original.every(e=>e.url===full&&e.phase==='open'))}
  net.setPhase('next')
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(old=>{const img=document.querySelector('.image-lightbox-viewport img');return img?.currentSrc!==old&&img?.complete&&img?.naturalWidth>0},full)
  if(!baseline)assert.equal(new Set(net.entries.filter(zoom).map(e=>e.url)).size,2)
  await page.keyboard.press('Escape')
  await page.locator('.image-lightbox-backdrop').waitFor({state:'hidden'})
  net.setPhase('warm-return')
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}))
  await cards.first().scrollIntoViewIfNeeded()
  await loaded(page,'.about-gallery-card:first-child img.progressive-image-main')
  await wait(300)
  if(!baseline)assert.equal(net.entries.filter(e=>e.phase==='warm-return'&&e.url===firstUrl).length,0,'Scrolling re-requested an already mounted image')
  if(!baseline){
    net.setPhase('theme-language')
    const oldSrc=await cards.first().locator('img.progressive-image-main').getAttribute('src')
    await page.locator('.theme-toggle').click()
    await page.getByRole('button',{name:/^Language:/}).click()
    await page.locator('.language-picker-option').filter({hasText:'PT BR'}).click()
    await page.waitForFunction(()=>document.documentElement.lang==='pt-BR')
    await cards.first().scrollIntoViewIfNeeded()
    await wait(150)
    assert.equal(await cards.first().locator('img.progressive-image-main').getAttribute('src'),oldSrc)
    assert.equal(net.entries.filter(e=>e.phase==='theme-language'&&e.url===firstUrl).length,0)
  }
  net.setPhase('refresh-warm')
  await page.reload()
  await cards.first().waitFor({state:'attached'})
  await cards.first().scrollIntoViewIfNeeded()
  await loaded(page,'.about-gallery-card:first-child img.progressive-image-main')
  await wait(300)
  result.imageEncodedBytes=net.entries.reduce((s,r)=>s+(r.encodedBytes??0),0)
  result.imageRequests=net.entries.length
  console.log('IMAGE DEMAND',JSON.stringify({baseline,viewport,initialGalleryRequests:result.initialGalleryRequests,initialGalleryBytes:result.initialGalleryBytes,imageRequests:result.imageRequests,imageEncodedBytes:result.imageEncodedBytes}))
  await ctx.close()
}
async function extraScenarios(){
  for(const noObserver of [false,true]){
    const ctx=await browser.newContext({viewport:{width:320,height:740},reducedMotion:'reduce'})
    if(noObserver)await ctx.addInitScript(()=>{Object.defineProperty(window,'IntersectionObserver',{value:undefined,configurable:true})})
    const page=await ctx.newPage(),net=await instrument(page)
    await page.goto(BASE+'#/?portal=skip')
    const cards=page.locator('.about-gallery-card')
    await cards.first().waitFor({state:'attached'})
    await wait(350)
    assert.equal(net.entries.filter(gallery).length,0,'No initial gallery photos, including observer fallback')
    net.setPhase('scroll')
    await cards.first().scrollIntoViewIfNeeded()
    await loaded(page,'.about-gallery-card:first-child img.progressive-image-main')
    assert.equal(net.entries.filter(zoom).length,0)
    report.scenarios.push({scenario:noObserver?'without-observer':'320px',requests:net.entries})
    console.log('DEMAND PASS',noObserver?'without-observer':'320px')
    await ctx.close()
  }
  for(const viewport of [{width:768,height:1024},{width:1920,height:1080}]){
    const ctx=await browser.newContext({viewport,reducedMotion:'reduce'})
    const page=await ctx.newPage(),net=await instrument(page)
    await page.goto(BASE+'#/?portal=skip')
    await page.locator('.about-gallery-card').first().waitFor({state:'attached'})
    await loaded(page,'[data-testid="hero-v6-blue-code"]')
    await wait(350)
    assert.equal(net.entries.filter(gallery).length,(await geometry(page)).filter(x=>x.visible).length)
    assert.equal(net.entries.filter(zoom).length,0)
    report.scenarios.push({scenario:'initial-'+viewport.width,requests:net.entries})
    await ctx.close()
  }
  for(const offline of [false,true]){
    const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
    const page=await ctx.newPage(),net=await instrument(page)
    await page.goto(BASE+'#/?portal=skip')
    const cards=page.locator('.about-gallery-card')
    await cards.first().waitFor({state:'attached'})
    await loaded(page,'[data-testid="hero-v6-blue-code"]')
    assert.equal(net.entries.filter(gallery).length,0)
    net.setPhase(offline?'offline':'slow')
    if(offline)await ctx.setOffline(true)
    else await net.cdp.send('Network.emulateNetworkConditions',{offline:false,latency:300,downloadThroughput:100000,uploadThroughput:100000})
    await cards.first().scrollIntoViewIfNeeded()
    if(offline)await cards.first().locator('.image-fallback').waitFor({timeout:15000})
    else await loaded(page,'.about-gallery-card:first-child img.progressive-image-main')
    await wait(500)
    assert.equal(net.entries.filter(e=>e.url.includes('fixture-photo-01')).length,1)
    assert.equal(net.entries.filter(zoom).length,0)
    if(offline)await ctx.setOffline(false)
    else await net.cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1})
    await cards.last().scrollIntoViewIfNeeded()
    await cards.last().locator('img.progressive-image-main').waitFor({state:'visible'})
    await page.waitForFunction(()=>{const img=document.querySelector('.about-gallery-card:last-child img.progressive-image-main');return img?.complete&&img?.naturalWidth>0})
    report.scenarios.push({scenario:offline?'offline-recovery':'slow-network',requests:net.entries})
    console.log('DEMAND PASS',offline?'offline-recovery':'slow-network')
    await ctx.close()
  }
  const errorCtx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
  const page=await errorCtx.newPage(),net=await instrument(page)
  // Explicit failure injection is separate from the cache measurements.
  await page.route('**/about/gallery/WebP/fixture-photo-01.webp',r=>r.abort('failed'))
  await page.goto(BASE+'#/?portal=skip')
  const card=page.locator('.about-gallery-card').first()
  await card.waitFor({state:'attached'});await card.scrollIntoViewIfNeeded()
  await card.locator('.image-fallback').waitFor({timeout:15000})
  await wait(400)
  const failed=net.entries.filter(e=>e.url.includes('fixture-photo-01'))
  assert.equal(failed.length,1,'No automatic retry or original transfer')
  assert(failed[0].url.includes('/WebP/'))
  await card.click();await loaded(page,'.image-lightbox-viewport img')
  assert((await page.locator('.image-lightbox-viewport img').getAttribute('src')).includes('/PNG/'))
  report.scenarios.push({scenario:'webp-failure',requests:net.entries})
  await errorCtx.close()
  const portalCtx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'})
  const portal=await portalCtx.newPage(),portalNet=await instrument(portal)
  await portal.goto(BASE+'#/?portal=replay')
  await portal.locator('[data-testid="home-boot-app"][data-home-reveal="closed"]').waitFor({state:'attached'})
  await portal.locator('.about-gallery-card').first().waitFor({state:'attached'})
  assert.equal(portalNet.entries.filter(gallery).length,0)
  assert(!portalNet.entries.some(e=>e.url.includes('lcr-hero-blue-code-v7-lite.svg')),'Hidden Hero image requested before reveal')
  portalNet.setPhase('portal-reveal')
  await portal.locator('[data-testid="home-boot-overlay"]').waitFor({state:'hidden',timeout:45000})
  await loaded(portal,'[data-testid="hero-v6-blue-code"]')
  assert.equal(portalNet.entries.filter(gallery).length,0)
  const marks=await portal.evaluate(()=>performance.getEntriesByType('mark').filter(e=>/portal-|home-/.test(e.name)).map(e=>({name:e.name,startTime:e.startTime})))
  assert(marks.some(m=>m.name==='portal-opened'))
  report.scenarios.push({scenario:'portal',requests:portalNet.entries,marks})
  await portalCtx.close()
  const caseCtx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
  const casePage=await caseCtx.newPage(),caseNet=await instrument(casePage)
  await casePage.goto(BASE+'#/projects/animefinder')
  const cover=casePage.locator('.case-story-cover')
  await cover.waitFor({state:'visible'})
  await casePage.locator('.case-hero-thumbnails button').last().waitFor({state:'attached'})
  await wait(300)
  assert(!caseNet.entries.some(e=>/\/animefinder\/PNG\//.test(e.url)))
  assert(!caseNet.entries.some(e=>e.url.includes('animefinder-16-knowledge-editor.webp')),'Last clipped thumbnail fetched')
  await cover.scrollIntoViewIfNeeded();await loaded(casePage,'.case-story-cover img.progressive-image-main')
  await cover.click();await loaded(casePage,'.image-lightbox-viewport img')
  assert.equal(new Set(caseNet.entries.filter(e=>/\/animefinder\/PNG\//.test(e.url)).map(e=>e.url)).size,1)
  await casePage.keyboard.press('Escape')
  await casePage.locator('.image-lightbox-backdrop').waitFor({state:'hidden'})
  await casePage.locator('.case-hero-carousel-dots button').last().click()
  await cover.scrollIntoViewIfNeeded()
  await casePage.waitForFunction(()=>{const img=document.querySelector('.case-story-cover img.progressive-image-main');return img?.complete&&img?.naturalWidth>0&&img.currentSrc.includes('animefinder-16-knowledge-editor.webp')})
  report.scenarios.push({scenario:'case-clipped-thumbnails',requests:caseNet.entries})
  await caseCtx.close()
}
try{
  for(let i=0;i<100;i++){try{if((await fetch(BASE)).ok)break}catch{}if(i===99)throw Error('Vite unavailable');await wait(250)}
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  for(const viewport of [{width:1440,height:900},{width:390,height:844}])await run(viewport)
  if(!baseline)await extraScenarios()
  if(baseline)assert(report.scenarios.some(s=>s.initialGalleryRequests>0),'Expected baseline eager gallery requests not reproduced')
}finally{
  await writeFile(dir+'/'+(baseline?'baseline':'candidate')+'.json',JSON.stringify(report,null,2))
  if(browser)await browser.close()
  try{process.kill(-server.pid,'SIGTERM')}catch{}
}
