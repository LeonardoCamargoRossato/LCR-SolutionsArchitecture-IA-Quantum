/** Equivalent Home/gallery benchmark on the pinned approved public dataset.
 * The isolated HTTP fixture serves inventoried real bytes. No page.route,
 * which disables cache. Both builds use the same viewport, data, browser,
 * network and interactions; measured cache policy is lab-only. */
import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'

const gallery=url=>url.includes('/about/gallery/')
const original=url=>gallery(url)&&/\/PNG\//i.test(url)
const photoId=url=>url.match(/palestrando-(\d+)\.(?:png|webp|jpg)(?:[?#]|$)/i)?.[1]
const imageExtensions=/\.(?:png|jpe?g|webp|avif|svg)(?:[?#]|$)/i

async function recorder(page){
  const cdp=await page.context().newCDPSession(page)
  await cdp.send('Network.enable')
  const entries=[],pending=new Map()
  let phase='initial'
  cdp.on('Network.requestWillBeSent',e=>{
    if(e.type!=='Image'&&!imageExtensions.test(e.request.url))return
    const row={url:e.request.url,phase,initiator:e.initiator.type,started:e.timestamp,status:null,encodedBytes:null,cache:false}
    entries.push(row);pending.set(e.requestId,row)
  })
  cdp.on('Network.requestServedFromCache',e=>{const row=pending.get(e.requestId);if(row)row.cache=true})
  cdp.on('Network.responseReceived',e=>{
    const row=pending.get(e.requestId);if(!row)return
    row.status=e.response.status;row.mime=e.response.mimeType
    row.cache||=Boolean(e.response.fromDiskCache||e.response.fromServiceWorker||e.response.fromPrefetchCache)
    row.cacheHeaders=Object.fromEntries(Object.entries(e.response.headers).filter(([k])=>/^(cache-control|etag|last-modified|age|content-length)$/i.test(k)))
  })
  cdp.on('Network.loadingFinished',e=>{const row=pending.get(e.requestId);if(row){row.encodedBytes=e.encodedDataLength;row.durationMs=(e.timestamp-row.started)*1000}})
  cdp.on('Network.loadingFailed',e=>{const row=pending.get(e.requestId);if(row)row.error=e.errorText})
  return {entries,phase:p=>{phase=p}}
}

async function loaded(page,selector){
  await page.waitForFunction(sel=>{const img=document.querySelector(sel);return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0&&img.naturalHeight>0},selector,{timeout:15000})
}
async function settle(page){await page.waitForTimeout(400)}
async function run(browser,target,viewport,prefix){
  const ctx=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'reduce',locale:'en-US',colorScheme:'dark',timezoneId:'UTC',
    isMobile:viewport.width<500,hasTouch:viewport.width<500,extraHTTPHeaders:{'X-LCR-Fixture-Mode':'approved-main'}})
  try{
    const page=await ctx.newPage(),net=await recorder(page)
    await ctx.addInitScript(()=>{localStorage.setItem('portfolio-locale','en-US');localStorage.setItem('portfolio-theme','dark')})
    const url='http://127.0.0.1:'+target.port+prefix+'#/?portal=skip'
    const cards=page.locator('.about-gallery-card')
    await page.goto(url)
    await page.waitForFunction(()=>localStorage.getItem('lcr-site-content-v2')&&localStorage.getItem('lcr-projects-v2')&&document.querySelectorAll('.about-gallery-card').length===10)
    await loaded(page,'[data-testid="hero-v6-blue-code"]')
    await page.evaluate(()=>document.fonts.ready.then(()=>true));await settle(page)
    net.phase('scroll-first')
    await cards.first().scrollIntoViewIfNeeded()
    await loaded(page,'.about-gallery-card:first-child img.progressive-image-main');await settle(page)
    const firstPreview=await cards.first().locator('img.progressive-image-main').evaluate(img=>img.currentSrc)
    net.phase('open-zoom')
    await cards.first().click()
    await loaded(page,'.image-lightbox-viewport img');await settle(page)
    const first=await page.locator('.image-lightbox-viewport img').evaluate(img=>img.currentSrc)
    net.phase('next-slide')
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(old=>{const img=document.querySelector('.image-lightbox-viewport img');return img?.currentSrc!==old&&img?.complete&&img?.naturalWidth>0},first)
    const second=await page.locator('.image-lightbox-viewport img').evaluate(img=>img.currentSrc)
    await settle(page)
    net.phase('close-and-warm-return')
    await page.keyboard.press('Escape')
    await page.locator('.image-lightbox-backdrop').waitFor({state:'hidden'})
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}))
    await cards.first().scrollIntoViewIfNeeded()
    await loaded(page,'.about-gallery-card:first-child img.progressive-image-main');await settle(page)
    net.phase('warm-reload')
    await page.reload()
    await cards.first().waitFor({state:'attached'})
    await cards.first().scrollIntoViewIfNeeded()
    await loaded(page,'.about-gallery-card:first-child img.progressive-image-main');await settle(page)
    const phases=Object.fromEntries([...new Set(net.entries.map(e=>e.phase))].map(phase=>{
      const rows=net.entries.filter(e=>e.phase===phase)
      return [phase,{encodedBytes:rows.reduce((sum,e)=>sum+(e.encodedBytes??0),0),requests:rows.length,cacheHits:rows.filter(e=>e.cache).length,
        notModified:rows.filter(e=>e.status===304).length,missingMeasurements:rows.filter(e=>e.encodedBytes===null).length}]
    }))
    return {target:target.name,viewport,firstPreview,first,second,logicalPhotos:[photoId(firstPreview),photoId(first),photoId(second)],phases,requests:net.entries}
  }finally{await ctx.close()}
}

export async function approvedMainPerformance(browser,targets,prefix,out,mainSha,candidateSha){
  const report={mainSha,candidateSha,dataset:'ApprovedMainFixture.json + supabase-public-assets-inventory.json',network:'same isolated loopback, no artificial throttling',
    cache:'actual local browser cache; fixture max-age=600 is lab-only, not GitHub Pages policy',
    budget:'No approved numeric transfer limit; report bytes for review, retain demand invariants',scenarios:[],failures:[]}
  try{
    for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
      const rows=[]
      for(const target of targets){
        try{const result=await run(browser,target,viewport,prefix);rows.push(result);report.scenarios.push(result)}
        catch(e){report.failures.push({target:target.name,viewport,error:String(e)})}
      }
      if(rows.length!==2)continue
      try{
        const [main,candidate]=rows
        assert.deepEqual(main.logicalPhotos,['9','9','11'],'Main fixture does not match approved gallery sequence')
        assert.deepEqual(candidate.logicalPhotos,main.logicalPhotos,'Compared different photos')
        for(const row of rows)assert(!row.requests.some(e=>e.error||e.status>=400),'Broken image in '+row.target)
        assert(candidate.firstPreview.endsWith('.webp'),'Initial photo is not WebP')
        assert.equal(candidate.requests.filter(e=>gallery(e.url)&&e.phase==='initial').length,0,'Offscreen gallery fetched on Home')
        assert(!candidate.requests.some(e=>original(e.url)&&!['open-zoom','next-slide'].includes(e.phase)),'Original downloaded outside viewer interaction')
        assert.equal(new Set(candidate.requests.filter(e=>original(e.url)).map(e=>photoId(e.url))).size,2,'Unexpected original download count')
      }catch(e){report.failures.push({viewport,error:String(e)})}
    }
  }finally{
    await writeFile(out+'/approved-main-performance.json',JSON.stringify(report,null,2))
    console.log('APPROVED MAIN PERFORMANCE',JSON.stringify(report.scenarios.map(({target,viewport,logicalPhotos,phases})=>({target,viewport,logicalPhotos,phases}))))
  }
  assert.deepEqual(report.failures,[],'Equivalent real-media benchmark failed; see artifact')
}
