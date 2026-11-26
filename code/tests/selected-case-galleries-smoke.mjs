/** Tests the actual approved versioned assets under isolated browser egress.
 * Never use production credentials or publish synthetic gallery entries. */
import assert from 'node:assert/strict'
import { mkdir,readFile,writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const dir='test-results/selected-case-galleries'
const projectRoot='/LCR-SolutionsArchitecture-IA-Quantum/'
const inventory=JSON.parse(await readFile('docs/assets/selected-case-galleries-inventory.json','utf8'))
const find=part=>{const matches=inventory.files.filter(f=>f.path.includes(part));assert.equal(matches.length,1,part);return matches[0]}
const cover=slug=>{
  const root='assets/projects/'+slug+'/'
  return {webp:find(root+'WebP/'),full:find(root+'PNG/')}
}
const cities=[cover('cities-comparing'),{webp:find('graphical-abstract-card.webp'),full:find('graphical-abstract-full.webp')},
  ...Array.from({length:7},(_,i)=>{const n=String(i+1).padStart(2,'0');return {webp:find('/WebP/Research_Platform_Series_Compare_'+n+'.webp'),full:find('/PNG/Research_Platform_Series_Compare_'+n+'.png')}})]
const cases=[['cities-comparing',cities],['foton-hub',[cover('foton-hub')]]]
const pathOf=file=>projectRoot+file.path.slice('public/'.length)
const sha=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex')
const isGallery=u=>/\/(?:assets\/)?projects\/(?:cities-comparing|foton-hub)\//.test(u)&&/\.(?:png|webp|jpe?g|svg)(?:[?#]|$)/i.test(u)
const isBackend=u=>u.includes('127.0.0.1:54321')||/\.supabase\.co\//i.test(u)
export async function verifySelectedCaseGalleries(browser,base,mode,device,theme,locale){
  await mkdir(dir,{recursive:true})
  const name=[mode,device,theme,locale].join('-')
  const report={mode,device,theme,locale,cases:[]}
  for(const [slug,slides] of cases){
    const ctx=await browser.newContext({viewport:device==='mobile'?{width:390,height:844}:{width:1440,height:900},reducedMotion:'reduce',acceptDownloads:true,isMobile:device==='mobile',hasTouch:device==='mobile'})
    const page=await ctx.newPage(),requests=[],backend=[],remoteImages=[],errors=[],items=[]
    const entry={slug,expectedSlides:slides.length,items,requests,backend,remoteImages,errors}
    report.cases.push(entry)
    await ctx.addInitScript(({theme,locale})=>{localStorage.setItem('portfolio-theme',theme);localStorage.setItem('portfolio-locale',locale)},{theme,locale})
    page.on('request',r=>{
      const u=r.url()
      if(isBackend(u))backend.push({url:u,type:r.resourceType()})
      if(isBackend(u)&&r.resourceType()==='image'&&(/cities-comparing|foton-hub|stale-case-gallery/.test(u)))remoteImages.push(u)
      if(isGallery(u))requests.push(u)
    })
    page.on('response',r=>{if(isGallery(r.url())&&r.status()>=400)errors.push(r.status()+' '+r.url())})
    if(mode==='blocked'){await page.route('**/rest/v1/**',r=>r.abort('failed'));await page.route('**/storage/v1/**',r=>r.abort('failed'))}
    if(mode==='stale-cms'){
      await page.route('**/rest/v1/projects?**',async route=>{
        const res=await route.fetch()
        const data=await res.json()
        const stale='http://127.0.0.1:54321/storage/v1/object/public/portfolio-media/stale-case-gallery.png'
        const mutate=row=>row&&['foton-hub','cities-comparing','city-comparing'].includes(row.slug)?{...row,cover_url:stale,gallery:[{id:'stale',image:{id:'stale',url:stale},caption:'UNAPPROVED',altText:'UNAPPROVED',order:1,visible:true}]}:row
        await route.fulfill({response:res,json:Array.isArray(data)?data.map(mutate):mutate(data)})
      })
    }
    const loaded=async(selector,file)=>{
      await page.waitForFunction(({selector,path})=>{const im=document.querySelector(selector);return im?.complete&&im.naturalWidth>0&&new URL(im.currentSrc).pathname===path},{selector,path:pathOf(file)},{timeout:30000})
      return page.locator(selector).evaluate(im=>({url:im.currentSrc,width:im.naturalWidth,height:im.naturalHeight}))
    }
    try{
      await page.goto(base+'#/projects/'+slug,{waitUntil:'domcontentloaded'})
      await page.locator('.case-story-hero[data-case-slug="'+slug+'"]').waitFor({state:'visible',timeout:30000})
      await page.waitForFunction(({theme,locale})=>document.documentElement.dataset.theme===theme&&document.documentElement.lang===locale,{theme,locale})
      const coverButton=page.locator('.case-story-cover')
      await coverButton.scrollIntoViewIfNeeded()
      const count=page.locator('.case-hero-carousel-count'),dots=page.locator('.case-hero-carousel-dots button'),thumbs=page.locator('.case-hero-thumbnails button')
      assert.equal(await dots.count(),slides.length>1?slides.length:0)
      assert.equal(await thumbs.count(),slides.length>1?slides.length:0)
      if(mode==='stale-cms'){
        await page.waitForFunction(()=>localStorage.getItem('lcr-projects-v2')!==null,null,{timeout:30000})
        assert(!(await page.locator('.case-hero-media').innerText()).includes('UNAPPROVED'))
      }
      for(let i=0;i<slides.length;i++){
        const slide=slides[i]
        if(slides.length>1){
          // Alternate between dots, thumbnails and the next-arrow contract.
          if(i===0)await dots.nth(i).click()
          else if(i===1)await page.getByRole('button',{name:'Next project image',exact:true}).click()
          else if(i%2===0)await thumbs.nth(i).click()
          else await dots.nth(i).click()
          assert.equal((await count.innerText()).trim(),(i+1)+' / '+slides.length)
          assert.equal(await thumbs.nth(i).getAttribute('aria-current'),'true')
        }
        await coverButton.scrollIntoViewIfNeeded()
        const webp=await loaded('.case-story-cover img.progressive-image-main',slide.webp)
        assert(webp.width>0&&webp.height>0)
        if(i===0)assert(!requests.some(u=>u.includes('/PNG/')||u.endsWith('graphical-abstract-full.webp')),'Full asset loaded before zoom')
        const before=await page.locator('.case-hero-caption').innerText()
        await coverButton.click()
        const modal=page.locator('.image-lightbox[role="dialog"]')
        await modal.waitFor({state:'visible',timeout:12000})
        const full=await loaded('.image-lightbox-viewport img',slide.full)
        if(slides.length>1)assert.equal((await modal.locator('.image-lightbox-counter').innerText()).trim(),(i+1)+' / '+slides.length)
        await modal.getByRole('button',{name:locale==='pt-BR'?'Aumentar zoom':'Zoom In',exact:true}).click()
        assert.equal(await modal.locator('.image-lightbox-actions').getByText('125%',{exact:true}).count(),1)
        if(i===0){
          await modal.getByRole('button',{name:locale==='pt-BR'?'Tela cheia':'Fullscreen',exact:true}).click()
          await page.waitForFunction(()=>!!document.fullscreenElement)
          await page.evaluate(()=>document.exitFullscreen())
        }
        const [download]=await Promise.all([page.waitForEvent('download',{timeout:25000}),modal.getByRole('button',{name:locale==='pt-BR'?'Baixar imagem':'Download',exact:true}).click()])
        const bytes=await readFile(await download.path())
        assert.equal(sha(bytes),slide.full.gitBlob,'Download changed original bytes')
        assert(download.suggestedFilename().endsWith(slide.full.path.endsWith('.png')?'.png':'.webp'))
        if(i===0||i===slides.length-1)await page.screenshot({path:dir+'/'+name+'-'+slug+'-'+(i+1)+'-zoom.png'})
        await page.keyboard.press('Escape')
        await modal.waitFor({state:'hidden'})
        items.push({position:i+1,caption:before,webp,full,download:download.suggestedFilename(),gitBlob:sha(bytes)})
      }
      assert.deepEqual(remoteImages,[])
      assert.deepEqual(errors,[])
      if(mode.includes('no-config'))assert.deepEqual(backend,[],'Unexpected request without backend configuration')
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Horizontal overflow')
      await page.screenshot({path:dir+'/'+name+'-'+slug+'.png'})
      console.log('PASS selected case gallery',name,slug,slides.length,'slides, local WebP + full originals, download byte identity, zero remote gallery image requests')
    }finally{await page.unrouteAll({behavior:'wait'});await ctx.close();await writeFile(dir+'/'+name+'.json',JSON.stringify(report,null,2))}
  }
  // Explicit regression of the existing AnimeFinder catalogue, without edits.
  const ctx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'})
  const page=await ctx.newPage()
  if(mode==='blocked'){await page.route('**/rest/v1/**',r=>r.abort('failed'));await page.route('**/storage/v1/**',r=>r.abort('failed'))}
  try{
    await page.goto(base+'#/projects/animefinder')
    await page.waitForFunction(()=>document.querySelector('.case-hero-carousel-count')?.textContent?.trim()==='1 / 16',null,{timeout:30000})
    assert.equal(await page.locator('.case-hero-thumbnails button').count(),16)
    report.animeFinder=16
    console.log('PASS AnimeFinder unchanged: 16 slides',name)
  }finally{await page.unrouteAll({behavior:'wait'});await ctx.close();await writeFile(dir+'/'+name+'.json',JSON.stringify(report,null,2))}
}
