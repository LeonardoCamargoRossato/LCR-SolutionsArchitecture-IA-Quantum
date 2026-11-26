/** Pinned main comparison, separate from the immutable historical benchmark.
 * Exact public CMS rows obtained by an authorized read-only export. All media
 * served by loopback from inventoried originals. No external requests. */
import assert from 'node:assert/strict'
import {spawn,execFileSync} from 'node:child_process'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {chromium} from './Browser.mjs'
const prefix='/LCR-SolutionsArchitecture-IA-Quantum/'
const fixture=JSON.parse(await readFile('tests/isolation/ApprovedMainFixture.json','utf8'))
const inventory=JSON.parse(await readFile('docs/assets/supabase-public-assets-inventory.json','utf8'))
const out='test-results/isolation/approved-main'
const main=process.env.LCR_BEFORE
assert.equal(execFileSync('git',['-C',main,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),fixture.mainSha)
const assets=new Map(inventory.assets.filter(x=>x.github_path).map(x=>[x.supabase_path,x.github_path.replace(/^code\//,'')]))
const targets=[{name:'main',cwd:main,port:5191,offline:false},{name:'candidate',cwd:process.cwd(),port:5192,offline:false},{name:'offline',cwd:process.cwd(),port:5192,offline:true}]
const servers=targets.slice(0,2).map(t=>spawn('npm',['run','preview','--','--host','127.0.0.1','--port',String(t.port),'--strictPort'],{cwd:t.cwd,stdio:'ignore',detached:true}))
const report={mainSha:fixture.mainSha,candidateSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),comparisons:[],differences:[],network:[],authorized:[fixture.authorizedTextCorrection]}
const routes=['','projects/foton-hub','projects/cities-comparing','projects/animefinder','projects/hamlet','projects/webseer','projects/metcompb-landing-page','projects/speaker-portfolio','projects/quantum-education-apps','projects/ce235-real-time-systems','projects/embedded-control-platform','workflow','about','admin','test-component-lab']
const normalized=v=>String(v??'').replaceAll(fixture.authorizedTextCorrection.from,fixture.authorizedTextCorrection.to).replace(/\s+/g,' ').trim()
async function installFixture(page,offline){
  await page.route('http://127.0.0.1:54321/rest/v1/**',async route=>{
    if(offline)return route.abort('failed')
    const req=route.request(),url=new URL(req.url()),table=url.pathname.split('/').pop()
    if(req.method()!=='GET')return route.fulfill({status:403,contentType:'application/json',json:{message:'Read-only audit fixture'}})
    let rows=fixture.tables[table]??[]
    for(const [k,v] of url.searchParams)if(v.startsWith('eq.'))rows=rows.filter(x=>String(x[k])===v.slice(3))
    const order=url.searchParams.get('order');if(order)rows=[...rows].sort((a,b)=>Number(a[order.split('.')[0]]??0)-Number(b[order.split('.')[0]]??0))
    const single=req.headers()['accept']?.includes('vnd.pgrst.object+json')
    await route.fulfill({status:200,headers:{'access-control-allow-origin':'*','content-range':rows.length?'0-'+(rows.length-1)+'/'+rows.length:'*/0'},contentType:'application/json',json:single?rows[0]??null:rows})
  })
  await page.route('http://127.0.0.1:54321/storage/v1/**',async route=>{
    if(offline)return route.abort('failed')
    const key=decodeURIComponent(new URL(route.request().url()).pathname.split('/portfolio-media/')[1]??'')
    const path=assets.get(key)
    if(!path)return route.fulfill({status:404,body:'Uninventoried reference'})
    const data=await readFile(path),ext=path.split('.').at(-1)
    await route.fulfill({status:200,contentType:ext==='pdf'?'application/pdf':ext==='svg'?'image/svg+xml':'image/'+(ext==='jpg'||ext==='jpeg'?'jpeg':ext),body:data})
  })
}
async function collect(browser,t,route,viewport,locale,theme){
 const ctx=await browser.newContext({viewport,reducedMotion:'reduce',isMobile:viewport.width<500,hasTouch:viewport.width<500})
 const page=await ctx.newPage(),network=[],errors=[]
 page.on('request',r=>{if(r.url().includes('/rest/v1/')||r.url().includes('/storage/v1/'))network.push(r.url())})
 page.on('response',r=>{if(r.status()>=400&&r.request().resourceType()==='image')errors.push(r.url())})
 await ctx.addInitScript(({locale,theme})=>{localStorage.setItem('portfolio-locale',locale);localStorage.setItem('portfolio-theme',theme)},{locale,theme})
 await installFixture(page,t.offline)
 const url='http://127.0.0.1:'+t.port+prefix+'#/'+route+(route?'':'?portal=skip')
 try{
   await page.goto(url)
   if(route.startsWith('projects/')){
     await page.locator('.case-story-hero').waitFor({timeout:30000})
     // Wait for the main CMS refresh and its separate institution request;
     // offline candidate still writes its local content and projects cache.
     await page.waitForFunction(()=>localStorage.getItem('lcr-site-content-v2')&&localStorage.getItem('lcr-projects-v2'))
     if(route.endsWith('animefinder'))await page.waitForFunction(()=>document.querySelector('.case-hero-carousel-count')?.textContent?.trim()==='1 / 16')
   }else if(!route||route==='about'){
     await page.locator('.selected-grid').waitFor({timeout:30000})
     await page.waitForFunction(()=>localStorage.getItem('lcr-site-content-v2')&&localStorage.getItem('lcr-projects-v2')&&document.querySelectorAll('.about-gallery-card').length===10)
   }else {
     await page.locator('main:not(.loading-page)').waitFor({timeout:30000})
     if(route==='admin')await page.getByText('This area is restricted.').waitFor({timeout:30000})
   }
   // DOM settles after asynchronous locale/fixture data. No external calls.
   await page.waitForTimeout(300)
   const state=await page.evaluate(()=>{
     const clean=v=>v?.replace(/\s+/g,' ').trim()??''
     const parts=[...document.querySelectorAll('header,main,footer')].map(el=>({tag:el.tagName,text:clean(el.innerText)}))
     const links=[...document.querySelectorAll('header a,main a,footer a')].map(el=>({text:clean(el.innerText),href:el.getAttribute('href')}))
     const cards=[...document.querySelectorAll('.selected-grid .project-card,.more-projects-grid .project-card')].map(el=>({title:clean(el.querySelector('h3')?.innerText),href:el.getAttribute('href')}))
     const imageCount=document.querySelectorAll('.case-hero-carousel-dots button').length|| (document.querySelector('.case-story-cover')?1:0)
     return {parts,links,cards,imageCount,galleryCount:document.querySelectorAll('.about-gallery-card').length,lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,width:document.documentElement.scrollWidth,viewport:innerWidth,title:document.title}
   })
   assert(state.width<=state.viewport+2,'Horizontal overflow '+route)
   if(route.startsWith('projects/')){await page.locator('.case-story-cover').scrollIntoViewIfNeeded();await page.waitForFunction(()=>{const im=document.querySelector('.case-story-cover img');return im?.complete&&im.naturalWidth>0})}
   if(!route){
     // Verify gallery and card images are actually admitted as sections become visible.
     for(const card of await page.locator('.selected-grid .project-card,.more-projects-grid .project-card,.about-gallery-card').all()){
       await card.scrollIntoViewIfNeeded()
       const im=card.locator('img.progressive-image-main')
       await im.waitFor({state:'visible'})
       await page.waitForFunction(el=>el.complete&&el.naturalWidth>0,await im.elementHandle())
     }
     await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}))
   }
   const name=[t.name,route.replaceAll('/','-')||'home',viewport.width,locale,theme].join('-')
   await page.screenshot({path:out+'/'+name+'.png',animations:'disabled',fullPage:!route})
   report.network.push({name,network,errors})
   if(t.name!=='main'&&route.startsWith('projects/'))assert(!network.some(u=>/\/rest\/v1\/(projects|more_projects|project_institutions)|\/storage\/v1\//.test(u)),'Public case accessed legacy project backend')
   return state
 }finally{await page.unrouteAll({behavior:'wait'});await ctx.close()}
}
let browser
try{
 await mkdir(out,{recursive:true})
 for(const t of targets.slice(0,2))for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:'+t.port+prefix)).ok)break}catch{}if(i===99)throw Error('Preview unavailable '+t.name);await new Promise(r=>setTimeout(r,250))}
 browser=await chromium.launch({headless:true,args:['--no-sandbox']})
 for(const [viewport,locale,theme] of [[{width:1440,height:900},'en-US','dark'],[{width:390,height:844},'pt-BR','light']]){
   for(const route of routes){
     const rows=[]
     for(const t of targets){
       try{rows.push(await collect(browser,t,route,viewport,locale,theme))}
       catch(e){report.differences.push({route,locale,theme,target:t.name,error:String(e)});rows.push(null)}
     }
     if(rows.some(x=>!x))continue
     const [a,b,c]=rows
     const fields=['parts','links','cards','imageCount','galleryCount','lang','theme','title']
     const diffs=[]
     for(const field of fields){
       // Only the explicitly approved AnimeFinder phrase is normalized.
       const value=x=>normalized(JSON.stringify(x[field]))
       if(value(a)!==value(b))diffs.push({field,comparison:'main-candidate',main:a[field],candidate:b[field]})
       if(value(b)!==value(c))diffs.push({field,comparison:'candidate-offline',candidate:b[field],offline:c[field]})
     }
     report.comparisons.push({route,locale,theme,match:diffs.length===0})
     if(diffs.length)report.differences.push({route,locale,theme,diffs})
   }
 }
}finally{
 if(browser)await browser.close()
 for(const s of servers)try{process.kill(-s.pid,'SIGTERM')}catch{}
 await writeFile(out+'/comparison.json',JSON.stringify(report,null,2))
}
assert.deepEqual(report.differences,[],'Unresolved main/candidate or offline editorial divergence; see artifact')
console.log('PASS approved-main comparison',report.comparisons.length,'route/device/locale/theme comparisons')
