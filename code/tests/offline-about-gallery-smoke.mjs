import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
const expected=[9,11,8,12,1,2,3,4,5,6]
const out='test-results/offline-about-gallery'
export async function verifyOfflineAboutGallery(browser,base,scenario,blockBackend){
  await mkdir(out,{recursive:true})
  const evidence=[]
  for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
    for(const [theme,locale] of [['dark','en-US'],['light','pt-BR'],['light','en-US'],['dark','pt-BR']]){
      const context=await browser.newContext({viewport,reducedMotion:'reduce',acceptDownloads:true,isMobile:device==='mobile',hasTouch:device==='mobile'})
      const page=await context.newPage()
      const requests=[],remote=[],errors=[],backend=[]
      page.on('request',r=>{
        const u=r.url()
        if(u.includes('/rest/v1/')||u.includes('/storage/v1/'))backend.push(u)
        if(u.includes('/rest/v1/about_gallery')||u.includes('/storage/v1/')&&u.includes('/about/gallery/'))remote.push(u)
        if(u.includes('/assets/about/gallery/'))requests.push(u)
      })
      page.on('response',r=>{if(r.url().includes('/assets/about/gallery/')&&r.status()>=400)errors.push(r.status()+' '+r.url())})
      await context.addInitScript(({theme,locale})=>{localStorage.setItem('portfolio-theme',theme);localStorage.setItem('portfolio-locale',locale)},{theme,locale})
      if(blockBackend){await page.route('**/rest/v1/**',r=>r.abort('failed'));await page.route('**/storage/v1/**',r=>r.abort('failed'))}
      const file=scenario+'-'+device+'-'+theme+'-'+locale
      async function load(locator,variant,number){
        await locator.waitFor({state:'visible',timeout:30000})
        await locator.evaluate(el=>el.setAttribute('data-gallery-probe','yes'))
        await page.waitForFunction(({variant,number})=>[...document.querySelectorAll('img[data-gallery-probe="yes"]')].some(img=>img.complete&&img.naturalWidth>0&&img.currentSrc.includes('/'+variant+'/')&&img.currentSrc.includes('-palestrando-'+number+'.')),{variant,number},{timeout:30000})
        const src=await locator.evaluate(el=>{el.removeAttribute('data-gallery-probe');return el.currentSrc})
        assert(src.startsWith(base+'assets/about/gallery/'+variant+'/'))
        return src
      }
      try{
        await page.goto(base+'#/?portal=skip')
        const cards=page.locator('button.about-gallery-card')
        await cards.first().waitFor({state:'attached',timeout:30000})
        assert.deepEqual(await cards.evaluateAll(els=>els.map(el=>Number(el.dataset.photoNumber))),expected)
        assert.equal(await page.locator('.about-gallery-grid-item').count(),0)
        assert.equal(requests.length,0,'Initial offscreen gallery fetch')
        for(let i=0;i<expected.length;i++){
          const card=cards.nth(i);await card.scrollIntoViewIfNeeded()
          await load(card.locator('img.progressive-image-main'),'WebP',expected[i])
        }
        assert(requests.every(u=>u.includes('/WebP/')),'Premature original request')
        const expand=page.getByRole('button',{name:locale==='pt-BR'?'Mostrar todas as imagens':'Show all gallery images',exact:true})
        await expand.click()
        const grid=page.locator('.about-gallery-grid-item')
        assert.deepEqual(await grid.evaluateAll(els=>els.map(el=>Number(el.dataset.photoNumber))),expected)
        for(let i=0;i<expected.length;i++){await grid.nth(i).scrollIntoViewIfNeeded();await load(grid.nth(i).locator('img.progressive-image-main'),'WebP',expected[i])}
        await page.screenshot({path:out+'/'+file+'-grid.png'})
        await grid.first().click()
        const viewer=page.locator('.image-lightbox-viewport img')
        await load(viewer,'PNG',9)
        assert.equal(new Set(requests.filter(u=>u.includes('/PNG/'))).size,1)
        await page.getByRole('button',{name:locale==='pt-BR'?'Aumentar zoom':'Zoom In',exact:true}).click()
        assert.equal(await page.locator('.image-lightbox-actions').getByText('125%',{exact:true}).count(),1)
        await page.screenshot({path:out+'/'+file+'-zoom.png'})
        await page.getByRole('button',{name:locale==='pt-BR'?'Tela cheia':'Fullscreen',exact:true}).click()
        await page.waitForFunction(()=>!!document.fullscreenElement)
        await page.evaluate(()=>document.exitFullscreen())
        await page.keyboard.press('ArrowRight')
        await load(viewer,'PNG',11)
        const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:locale==='pt-BR'?'Baixar imagem':'Download',exact:true}).click()])
        assert(download.suggestedFilename().endsWith('.png'))
        await page.keyboard.press('Escape')
        await page.locator('.image-lightbox-backdrop').waitFor({state:'hidden'})
        assert.deepEqual(remote,[])
        if(!blockBackend)assert.deepEqual(backend,[],'No client config: no backend requests')
        assert.deepEqual(errors,[])
        assert(requests.every(u=>!/-palestrando-(7|10)\./.test(u)),'Hidden photo requested')
        assert(requests.every(u=>!u.includes('/originals/')),'Unexpected original JPG')
        evidence.push({device,theme,locale,order:expected,requests,remote,errors,backendCount:backend.length,download:download.suggestedFilename()})
        console.log('PASS offline About gallery',file,'10 ordered photos, WebP/PNG, grid, zoom, fullscreen, download, zero remote gallery requests')
      }finally{await page.unrouteAll({behavior:'wait'});await context.close();await writeFile(out+'/'+scenario+'.json',JSON.stringify(evidence,null,2))}
    }
  }
}
