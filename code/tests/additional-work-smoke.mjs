/** Stage 04.4: real public catalogue, all approved slides, isolated network.
 * Uses existing browser fixture and no-backend dev/build servers; no credentials. */
import assert from 'node:assert/strict'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const dir='test-results/additional-work'
const prefix='/LCR-SolutionsArchitecture-IA-Quantum/'
const inventory=JSON.parse(await readFile('docs/assets/additional-work-inventory.json','utf8'))
const hashes=new Map(inventory.files.map(f=>[prefix+f.path.slice('public/'.length),f.gitBlob]))
const blob=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex')
const backend=u=>u.includes('127.0.0.1:54321')||/\.supabase\.co\//i.test(u)
export async function prepareAdditionalWork(browser,base){
 const ctx=await browser.newContext(),page=await ctx.newPage()
 try{
   await page.goto(base)
   const expected=await page.evaluate(async base=>{
     const {getAdditionalWork,getAdditionalInstitutions}=await import(base+'src/data/additionalWork.ts')
     const {localizedProject,localizedProjectStatus}=await import(base+'src/i18n/content.ts')
     const {buildProjectCarouselImages}=await import(base+'src/estruturas-padroes/carrossel-projetos/carousel-images.ts')
     return getAdditionalWork().map(p=>({slug:p.slug,id:p.id,locales:Object.fromEntries(['en-US','pt-BR'].map(l=>{
       const c=localizedProject(p,l)
       return [l,{title:c.title,subtitle:c.subtitle,description:c.description,category:c.category,status:localizedProjectStatus(c.status,l),technologies:c.technologies.slice(0,4),links:c.links,reportPdfUrl:c.reportPdfUrl,sections:c.sections,slides:buildProjectCarouselImages(c)}]
     })),logos:getAdditionalInstitutions(p.id)}))
   },base)
   assert.deepEqual(expected.map(p=>p.slug),inventory.order)
   assert.deepEqual(expected.map(p=>p.locales['en-US'].slides.length),inventory.slides)
   // Historical recovery contract is independent of the runtime catalogue.
   // Preserve approved cover identity and caption in both languages; do not
   // fill unknown historical galleries with unrelated external-project images.
   const recovery=JSON.parse(await readFile('docs/assets/additional-case-gallery-recovery.json','utf8'))
   assert.equal(recovery.records.length,5)
   for(const record of recovery.records){
     const project=expected.find(p=>p.slug===record.slug)
     assert(project,'Missing recovered case '+record.slug)
     for(const copy of Object.values(project.locales)){
       assert.equal(copy.slides.length,record.finalSlides,record.slug)
       assert.equal(copy.slides[0].src,prefix+record.display.path.slice('public/'.length))
       assert.equal(copy.slides[0].fullSrc,prefix+record.full.path.slice('public/'.length))
       assert.equal(copy.slides[0].caption,copy.title)
       assert.equal(hashes.get(copy.slides[0].src),record.display.gitBlob)
       assert.equal(hashes.get(copy.slides[0].fullSrc),record.full.gitBlob)
     }
   }
   for(const record of recovery.unchangedMultiImageCases){
     const project=expected.find(p=>p.slug===record.slug)
     for(const copy of Object.values(project.locales))assert.equal(copy.slides.length,record.slides)
   }
   console.log('PASS historical Additional Work cover identities and bilingual captions; WebSeer 10 and CE235 8 preserved')

   for(const p of expected)for(const l of Object.values(p.locales))for(const slide of l.slides){
     for(const url of [slide.src,slide.fullSrc,slide.thumbnailSrc,slide.previewSrc].filter(Boolean)){
       assert(url.startsWith(prefix),'Remote or invalid slide path: '+url)
       assert(hashes.has(url),'Uninventoried gallery asset '+url)
     }
     assert(slide.src.endsWith('.webp'),'Unoptimized display '+slide.src)
   }
   for(const p of expected)for(const logo of p.logos)assert(hashes.has(logo.institutionLogoUrl),'Uninventoried logo')
   return expected
 }finally{await ctx.close()}
}
export async function verifyAdditionalWork(browser,base,expected,mode,device,theme,locale){
 await mkdir(dir,{recursive:true})
 const name=[mode,device,theme,locale].join('-')
 const ctx=await browser.newContext({viewport:device==='mobile'?{width:390,height:844}:{width:1440,height:900},reducedMotion:'reduce',acceptDownloads:true,isMobile:device==='mobile',hasTouch:device==='mobile'})
 const page=await ctx.newPage(),requests=[],remote=[],errors=[],backendRequests=[],report={name,cards:[],cases:[],requests,remote,errors,backendRequests}
 page.on('request',r=>{
   const u=r.url()
   if(backend(u)){
     backendRequests.push({url:u,type:r.resourceType()})
     if(r.resourceType()==='image'&&(/hamlet|webseer|speaker-portfolio|embedded-control|quantum-education|ce235|metcompb|stale-additional/i.test(u)))remote.push(u)
     if(u.includes('/rest/v1/project_institutions')&&expected.some(p=>decodeURIComponent(u).includes('project_id=eq.'+p.id)))remote.push(u)
   }
   if(hashes.has(new URL(u).pathname))requests.push(u)
 })
 page.on('response',r=>{if(hashes.has(new URL(r.url()).pathname)&&r.status()>=400)errors.push(r.status()+' '+r.url())})
 await ctx.addInitScript(({theme,locale,expected})=>{
   localStorage.setItem('portfolio-theme',theme);localStorage.setItem('portfolio-locale',locale)
   localStorage.setItem('lcr-projects-v2',JSON.stringify({savedAt:Date.now(),value:expected.map(p=>({id:p.id,slug:p.slug,title:'STALE ADDITIONAL',visible:false,coverImage:{url:'http://127.0.0.1:54321/storage/v1/object/public/portfolio-media/stale-additional.png'}}))}))
 },{theme,locale,expected:expected.map(p=>({id:p.id,slug:p.slug}))})
 if(mode==='blocked'){await page.route('**/rest/v1/**',r=>r.abort('failed'));await page.route('**/storage/v1/**',r=>r.abort('failed'))}
 if(mode==='stale-cms'){
   for(const table of ['projects','more_projects'])await page.route('**/rest/v1/'+table+'?**',async route=>{
     const res=await route.fetch(),rows=await res.json()
     const mutate=row=>row&&expected.some(p=>p.slug===row.slug)?{...row,title_en:'STALE ADDITIONAL',title_pt:'STALE ADDITIONAL',visible:false,cover_url:'http://127.0.0.1:54321/storage/v1/object/public/portfolio-media/stale-additional.png',image_url:'http://127.0.0.1:54321/storage/v1/object/public/portfolio-media/stale-additional.png'}:row
     await route.fulfill({response:res,json:Array.isArray(rows)?rows.map(mutate):mutate(rows)})
   })
 }
 async function loaded(selector,path){
   await page.waitForFunction(({selector,path})=>{const el=document.querySelector(selector);return el?.complete&&el.naturalWidth>0&&new URL(el.currentSrc).pathname===path},{selector,path},{timeout:30000})
   return page.locator(selector).evaluate(el=>({url:el.currentSrc,width:el.naturalWidth,height:el.naturalHeight}))
 }
 try{
   await page.goto(base+'#/?portal=skip')
   const cards=page.locator('.more-projects-grid .project-card')
   await cards.first().waitFor({state:'attached',timeout:30000})
   assert.equal(await cards.count(),7)
   await page.waitForFunction(({theme,locale})=>document.documentElement.dataset.theme===theme&&document.documentElement.lang===locale,{theme,locale})
   assert.deepEqual(await cards.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),inventory.order.map(s=>'#/projects/'+s))
   const offscreen=await cards.evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top>=innerHeight))
   for(let i=0;i<7;i++)if(offscreen[i])assert(!requests.some(u=>new URL(u).pathname===expected[i].locales[locale].slides[0].src),'Offscreen additional cover requested')
   for(let i=0;i<expected.length;i++){
     const p=expected[i],copy=p.locales[locale],card=cards.nth(i)
     assert.equal(await card.locator('h3').innerText(),copy.title)
     assert.equal(await card.locator('.project-category').innerText(),copy.category)
     assert.equal(await card.locator('.project-status').innerText(),copy.status)
     if(copy.subtitle)assert.equal(await card.locator('.project-subtitle').innerText(),copy.subtitle)
     assert.equal(await card.locator('.project-description').innerText(),copy.description.replace(/<[^>]*>/g,' ').trim())
     assert.deepEqual(await card.locator('.tech-list span').allTextContents(),copy.technologies)
     await card.scrollIntoViewIfNeeded()
     const img=await loaded('.more-projects-grid .project-card:nth-child('+(i+1)+') img.progressive-image-main',copy.slides[0].src)
     report.cards.push({slug:p.slug,image:img.url})
   }
   assert(!requests.some(u=>/\.png(?:$|\?)/i.test(u)),'Original loaded on cards')
   await page.locator('.more-projects-grid').screenshot({path:dir+'/'+name+'-home.png'})
   for(const p of expected){
     const copy=p.locales[locale],slides=copy.slides,initial=requests.length
     await page.locator('.more-projects-grid .project-card[href="#/projects/'+p.slug+'"]').click()
     const hero=page.locator('.case-story-hero[data-case-slug="'+p.slug+'"]')
     await hero.waitFor({state:'visible',timeout:30000})
     assert.equal(await hero.locator('h1').innerText(),copy.title)
     assert.equal(await page.locator('.not-found').count(),0)
     if(copy.description)assert((await hero.locator('.case-story-description').innerText()).length>0)
     const cover=hero.locator('.case-story-cover'),dots=hero.locator('.case-hero-carousel-dots button'),thumbs=hero.locator('.case-hero-thumbnails button'),count=hero.locator('.case-hero-carousel-count')
     assert.equal(await dots.count(),slides.length>1?slides.length:0)
     assert.equal(await thumbs.count(),slides.length>1?slides.length:0)
     const logos=hero.locator('.case-institution-logo img')
     await page.waitForFunction(n=>document.querySelectorAll('.case-institution-logo img').length===n,p.logos.length)
     for(let j=0;j<p.logos.length;j++){
       await logos.nth(j).scrollIntoViewIfNeeded()
       await page.waitForFunction(({j,path})=>{const el=document.querySelectorAll('.case-institution-logo img')[j];return el?.complete&&el.naturalWidth>0&&new URL(el.currentSrc).pathname===path},{j,path:p.logos[j].institutionLogoUrl})
       if(p.logos[j].institutionUrl)assert.equal(await logos.nth(j).locator('..').getAttribute('href'),p.logos[j].institutionUrl)
     }
     for(const url of [copy.links.liveUrl,copy.links.githubUrl,copy.links.researchUrl].filter(Boolean))assert(await page.locator('a[href="'+url+'"]').count()>0,'Approved link missing: '+url)
     if(copy.reportPdfUrl){const pdf=await ctx.request.get(base+copy.reportPdfUrl.slice(prefix.length));assert(pdf.ok());assert.equal(blob(await pdf.body()),hashes.get(copy.reportPdfUrl))}
     const items=[]
     for(let j=0;j<slides.length;j++){
       const slide=slides[j]
       if(slides.length>1){
         if(j===1)await hero.getByRole('button',{name:'Next project image',exact:true}).click()
         else if(j%2===0)await thumbs.nth(j).click()
         else await dots.nth(j).click()
         assert.equal((await count.innerText()).trim(),(j+1)+' / '+slides.length)
         assert.equal(await thumbs.nth(j).getAttribute('aria-current'),'true')
       }
       await cover.scrollIntoViewIfNeeded()
       const display=await loaded('.case-story-cover img.progressive-image-main',slide.src)
       if(j===0)assert(!requests.slice(initial).some(u=>/\.png(?:$|\?)/i.test(u)),'PNG before viewer')
       await cover.click()
       const modal=page.locator('.image-lightbox[role="dialog"]');await modal.waitFor({state:'visible',timeout:12000})
       const full=await loaded('.image-lightbox-viewport img',slide.fullSrc)
       if(slides.length>1)assert.equal((await modal.locator('.image-lightbox-counter').innerText()).trim(),(j+1)+' / '+slides.length)
       await modal.getByRole('button',{name:locale==='pt-BR'?'Aumentar zoom':'Zoom In',exact:true}).click()
       assert.equal(await modal.locator('.image-lightbox-actions').getByText('125%',{exact:true}).count(),1)
       if(j===0){
         await modal.getByRole('button',{name:locale==='pt-BR'?'Tela cheia':'Fullscreen',exact:true}).click()
         await page.waitForFunction(()=>!!document.fullscreenElement);await page.evaluate(()=>document.exitFullscreen())
       }
       const [download]=await Promise.all([page.waitForEvent('download',{timeout:25000}),modal.getByRole('button',{name:locale==='pt-BR'?'Baixar imagem':'Download',exact:true}).click()])
       const bytes=await readFile(await download.path());assert.equal(blob(bytes),hashes.get(slide.fullSrc),'Original bytes changed')
       assert(download.suggestedFilename().endsWith(slide.fullSrc.endsWith('.png')?'.png':'.webp'))
       if(j===0||j===slides.length-1)await page.screenshot({path:dir+'/'+name+'-'+p.slug+'-'+(j+1)+'-zoom.png'})
       await page.keyboard.press('Escape');await modal.waitFor({state:'hidden'})
       items.push({position:j+1,display,full,download:download.suggestedFilename(),gitBlob:blob(bytes)})
     }
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Horizontal overflow')
     await hero.screenshot({path:dir+'/'+name+'-'+p.slug+'.png'})
     report.cases.push({slug:p.slug,slides:items,logos:p.logos.length,links:copy.links})
     console.log('PASS Additional Work',name,p.slug,items.length,'slides; downloads byte-identical; local institutions')
     await page.goto(base+'#/?portal=skip');await cards.first().waitFor({state:'attached'})
   }
   assert.deepEqual(remote,[])
   assert.deepEqual(errors,[])
   if(mode.includes('no-config'))assert.deepEqual(backendRequests,[])
   console.log('PASS Additional Work',name,'7 cards, 23 slides, no remote project image or institution requests')
 }finally{await page.unrouteAll({behavior:'wait'});await ctx.close();await writeFile(dir+'/'+name+'.json',JSON.stringify(report,null,2))}
}
