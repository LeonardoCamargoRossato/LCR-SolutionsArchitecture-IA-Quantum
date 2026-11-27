/** Equivalent Home/gallery benchmark on the pinned approved public dataset.
 * The isolated HTTP fixture serves inventoried real bytes. No page.route,
 * which disables cache. Both builds use the same viewport, data, browser,
 * network and interactions; measured cache policy is lab-only. */
import assert from 'node:assert/strict'
import {writeFile,readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {join} from 'node:path'

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

// The four public cases with multi-slide galleries (43 slides in total).
// Single-cover cases and all About photos remain covered by existing
// acceptance suites and the full-page comparator; exercise navigation here.
const carouselCases={'cities-comparing':9,animefinder:16,webseer:10,'ce235-real-time-systems':8}
async function runCase(browser,target,viewport,prefix,slug,count){
  const ctx=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'reduce',locale:'en-US',colorScheme:'dark',timezoneId:'UTC',
    isMobile:viewport.width<500,hasTouch:viewport.width<500,extraHTTPHeaders:{'X-LCR-Fixture-Mode':'approved-main'}})
  try{
    await ctx.addInitScript(()=>{localStorage.setItem('portfolio-locale','en-US');localStorage.setItem('portfolio-theme','dark')})
    const page=await ctx.newPage(),net=await recorder(page)
    const cover=page.locator('.case-story-cover')
    const image=cover.locator('img.progressive-image-main')
    const label=()=>page.locator('.case-hero-caption').innerText()
    const read=async()=>({url:await image.evaluate(img=>img.currentSrc),alt:await image.getAttribute('alt'),caption:await label()})
    await page.goto('http://127.0.0.1:'+target.port+prefix+'#/projects/'+slug)
    await page.waitForFunction(count=>localStorage.getItem('lcr-site-content-v2')&&localStorage.getItem('lcr-projects-v2')&&document.querySelector('.case-hero-carousel-count')?.textContent?.trim()==='1 / '+count,count)
    await page.evaluate(()=>document.fonts.ready.then(()=>true));await settle(page)
    net.phase('scroll-cover')
    await cover.scrollIntoViewIfNeeded();await loaded(page,'.case-story-cover img.progressive-image-main');await settle(page)
    const first=await read()
    net.phase('next-slide')
    await page.getByRole('button',{name:'Next project image',exact:true}).click()
    await cover.scrollIntoViewIfNeeded()
    await page.waitForFunction(({old,count})=>{const img=document.querySelector('.case-story-cover img.progressive-image-main');return document.querySelector('.case-hero-carousel-count')?.textContent?.trim()==='2 / '+count&&img?.currentSrc!==old&&img?.complete&&img.naturalWidth>0},{old:first.url,count})
    await settle(page);const second=await read()
    net.phase('open-zoom')
    await cover.click();await loaded(page,'.image-lightbox-viewport img');await settle(page)
    const full=await page.locator('.image-lightbox-viewport img').evaluate(img=>({url:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight}))
    await page.keyboard.press('Escape');await page.locator('.image-lightbox-backdrop').waitFor({state:'hidden'})
    // Reopen the same original before reload to test its warm-cache behavior.
    if(slug==='webseer'){
      net.phase('warm-zoom')
      await cover.click();await loaded(page,'.image-lightbox-viewport img');await settle(page)
      assert.equal(await page.locator('.image-lightbox-viewport img').evaluate(img=>img.currentSrc),full.url,'Warm zoom opened a different image')
      await page.keyboard.press('Escape');await page.locator('.image-lightbox-backdrop').waitFor({state:'hidden'})
    }
    net.phase('warm-reload')
    await page.reload()
    await page.waitForFunction(count=>document.querySelector('.case-hero-carousel-count')?.textContent?.trim()==='1 / '+count,count)
    await cover.scrollIntoViewIfNeeded();await loaded(page,'.case-story-cover img.progressive-image-main');await settle(page)
    const phases=Object.fromEntries([...new Set(net.entries.map(e=>e.phase))].map(phase=>{
      const rows=net.entries.filter(e=>e.phase===phase)
      return [phase,{encodedBytes:rows.reduce((sum,e)=>sum+(e.encodedBytes??0),0),requests:rows.length,cacheHits:rows.filter(e=>e.cache).length,notModified:rows.filter(e=>e.status===304).length}]
    }))
    return {slug,count,target:target.name,viewport,first,second,full,phases,requests:net.entries}
  }finally{await ctx.close()}
}

export async function approvedMainPerformance(browser,targets,prefix,out,mainSha,candidateSha){
  const report={mainSha,candidateSha,dataset:'ApprovedMainFixture.json + supabase-public-assets-inventory.json',network:'same isolated loopback, no artificial throttling',
    cache:'actual local browser cache; fixture max-age=600 is lab-only, not GitHub Pages policy',
    budget:'Equivalent media must not regress against pinned main. WebSeer original zoom is measured separately from its historical smaller derivative, with pinned byte identity and no early/repeated transfer; its additional cost remains subject to independent approval. Host headers and independent budget approval remain separate.',scenarios:[],caseScenarios:[],qualityTransitions:[],failures:[]}
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
        // The pinned main is the non-regression budget, not an arbitrary MB cap.
        // Identical logical images + same interactions establish the comparison.
        for(const phase of ['initial','scroll-first','open-zoom','next-slide']){
          assert(main.phases[phase]&&candidate.phases[phase],'Missing cold benchmark phase '+phase)
          assert.equal(main.phases[phase].missingMeasurements,0,'Missing baseline byte measurement')
          assert.equal(candidate.phases[phase].missingMeasurements,0,'Missing candidate byte measurement')
          assert(candidate.phases[phase].encodedBytes<=main.phases[phase].encodedBytes,'Cold image transfer regressed: '+phase)
        }
        const prior=new Set(candidate.requests.filter(e=>!['close-and-warm-return','warm-reload'].includes(e.phase)&&e.status===200).map(e=>e.url))
        for(const e of candidate.requests.filter(e=>['close-and-warm-return','warm-reload'].includes(e.phase)&&prior.has(e.url))){
          assert(e.cache||e.status===304,'Previously loaded image body transferred again: '+e.url)
        }
      }catch(e){report.failures.push({viewport,error:String(e)})}
      for(const [slug,count] of Object.entries(carouselCases)){
        const cases=[]
        for(const target of targets){
          try{const row=await runCase(browser,target,viewport,prefix,slug,count);cases.push(row);report.caseScenarios.push(row)}
          catch(e){report.failures.push({target:target.name,slug,viewport,error:String(e)})}
        }
        if(cases.length!==2)continue
        try{
          const [reference,delivery]=cases
          for(const row of cases){
            assert(!row.requests.some(e=>e.error||e.status>=400),'Image request error in '+row.target)
            assert(row.requests.every(e=>e.encodedBytes!==null),'Missing request byte measurements')
          }
          for(const key of ['first','second']){
            assert.equal(delivery[key].caption,reference[key].caption,'Different slide caption')
            assert.equal(delivery[key].alt,reference[key].alt,'Different slide identity')
            assert(/\.(webp|svg|avif)$/i.test(delivery[key].url),'Non-optimized first-view project image')
          }
          assert.equal(delivery.full.width*reference.full.height,reference.full.width*delivery.full.height,'Viewer aspect ratio changed')
          if(delivery.full.url!==delivery.second.url)
            assert(!delivery.requests.some(e=>e.url===delivery.full.url&&!['open-zoom','warm-zoom','warm-reload'].includes(e.phase)),'Viewer original preloaded')
          const warm=e=>['warm-reload','warm-zoom'].includes(e.phase)
          const cold=row=>row.requests.filter(e=>!warm(e)).reduce((s,e)=>s+e.encodedBytes,0)
          if(slug==='webseer'){
            // Artifact 15163895074: same slide, but historical 1600x900 WebP
            // versus approved 1920x1080 PNG. Both files exist at both SHAs.
            const dir='projects/webseer-gallery/'
            const files=[]
            for(const [name,size] of [['capa1-full.webp',39968],['capa1.png',284588]]){
              const old=await readFile(join(process.env.LCR_BEFORE,'public',dir,name))
              const current=await readFile(join('public',dir,name))
              assert.equal(old.length,size,'Unexpected historical WebSeer source size')
              assert.deepEqual(current,old,'WebSeer original/derivative changed')
              files.push({name,bytes:current.length,sha256:createHash('sha256').update(current).digest('hex')})
            }
            assert(reference.full.url.endsWith('/'+dir+'capa1-full.webp'),'Unexpected historical zoom URL')
            assert(delivery.full.url.endsWith('/'+dir+'capa1.png'),'Unexpected original zoom URL')
            assert.deepEqual([reference.full.width,reference.full.height],[1600,900])
            assert.deepEqual([delivery.full.width,delivery.full.height],[1920,1080])
            for(const [row,mime,file] of [[reference,'image/webp',files[0]],[delivery,'image/png',files[1]]]){
              const zoom=row.requests.filter(e=>e.phase==='open-zoom')
              assert.equal(zoom.length,1,'Unexpected additional cold zoom requests')
              assert.equal(zoom[0].url,row.full.url)
              assert.equal(zoom[0].mime,mime)
              assert.equal(zoom[0].status,200)
              const length=Object.entries(zoom[0].cacheHeaders??{}).find(([k])=>k.toLowerCase()==='content-length')?.[1]
              assert.equal(Number(length),file.bytes,'Unexpected original/derivative response length')
              assert(zoom[0].encodedBytes>=file.bytes,'Incomplete zoom transfer')
            }
            assert(!delivery.requests.some(e=>e.url===delivery.full.url&&!warm(e)&&e.phase!=='open-zoom'),'Original downloaded before zoom')
            const beforeZoom=row=>row.requests.filter(e=>!warm(e)&&e.phase!=='open-zoom').reduce((sum,e)=>sum+e.encodedBytes,0)
            assert(beforeZoom(delivery)<=beforeZoom(reference),'Equivalent WebSeer preview transfer increased')
            report.qualityTransitions.push({slug,viewport,files,reference:reference.full,delivery:delivery.full,
              previewBytes:{main:beforeZoom(reference),candidate:beforeZoom(delivery)},
              zoomBytes:{main:reference.phases['open-zoom'].encodedBytes,candidate:delivery.phases['open-zoom'].encodedBytes},
              totalColdBytes:{main:cold(reference),candidate:cold(delivery)},status:'original-delivery-cost-awaits-independent-approval'})
          }else assert(cold(delivery)<=cold(reference),'Equivalent project carousel cold transfer increased')
          const prior=new Set(delivery.requests.filter(e=>!warm(e)&&e.status===200).map(e=>e.url))
          assert(delivery.requests.filter(e=>warm(e)&&prior.has(e.url)).every(e=>e.cache||e.status===304),'Repeated project image body in warm cache')
        }catch(e){report.failures.push({slug,viewport,error:String(e)})}
      }
    }
  }finally{
    await writeFile(out+'/approved-main-performance.json',JSON.stringify(report,null,2))
    console.log('APPROVED MAIN PERFORMANCE',JSON.stringify(report.scenarios.map(({target,viewport,logicalPhotos,phases})=>({target,viewport,logicalPhotos,phases}))))
    console.log('APPROVED CASE PERFORMANCE',JSON.stringify(report.caseScenarios.map(({target,slug,count,viewport,phases})=>({target,slug,count,viewport,phases}))))
    console.log('APPROVED PERFORMANCE FAILURES',JSON.stringify(report.failures))
  }
  assert.deepEqual(report.failures,[],'Equivalent real-media benchmark failed; see artifact')
}
