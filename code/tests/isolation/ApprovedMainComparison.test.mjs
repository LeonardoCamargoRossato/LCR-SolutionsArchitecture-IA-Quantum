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
const normalized=v=>String(v??'').replace(/\s+/g,' ').trim()
const approvedMainText=(v,route)=>!route||route==='projects/animefinder'
  ? v.replaceAll(fixture.authorizedTextCorrection.from,fixture.authorizedTextCorrection.to) : v

// Compare every pixel without masks. No lossy-format or animation tolerance
// has been approved yet: exact equality is the conservative default, and
// differences remain blocking until a measured per-scenario budget is approved.
async function comparePixels(page,left,right,label){
  const buffers=await Promise.all([left,right].map(name=>readFile(out+'/'+name+'.png')))
  const result=await page.evaluate(async ([a,b])=>{
    const decode=async src=>{const image=new Image();image.src='data:image/png;base64,'+src;await image.decode();return image}
    const [first,second]=await Promise.all([decode(a),decode(b)])
    const width=Math.max(first.naturalWidth,second.naturalWidth),height=Math.max(first.naturalHeight,second.naturalHeight)
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height
    const ctx=canvas.getContext('2d',{willReadFrequently:true})
    const pixels=image=>{ctx.clearRect(0,0,width,height);ctx.drawImage(image,0,0);return ctx.getImageData(0,0,width,height)}
    const x=pixels(first),y=pixels(second),diff=ctx.createImageData(width,height)
    let changedPixels=0,absoluteError=0,maxChannelDelta=0
    for(let i=0;i<x.data.length;i+=4){
      let changed=false
      for(let j=0;j<4;j++){const d=Math.abs(x.data[i+j]-y.data[i+j]);absoluteError+=d;maxChannelDelta=Math.max(maxChannelDelta,d);changed||=d!==0}
      if(changed){changedPixels++;diff.data[i]=255;diff.data[i+1]=0;diff.data[i+2]=0}
      else{const gray=Math.round((x.data[i]+x.data[i+1]+x.data[i+2])/6+100);diff.data[i]=gray;diff.data[i+1]=gray;diff.data[i+2]=gray}
      diff.data[i+3]=255
    }
    ctx.putImageData(diff,0,0)
    return {width,height,first:[first.naturalWidth,first.naturalHeight],second:[second.naturalWidth,second.naturalHeight],
      changedPixels,changedRatio:changedPixels/(width*height),meanChannelDelta:absoluteError/(width*height*4),maxChannelDelta,
      difference:canvas.toDataURL('image/png').split(',')[1]}
  },buffers.map(b=>b.toString('base64')))
  const {difference,...metrics}=result
  const filename=label+'-difference.png'
  await writeFile(out+'/'+filename,Buffer.from(difference,'base64'))
  return {...metrics,artifact:filename,allowedChangedPixels:0,
    match:metrics.changedPixels===0&&JSON.stringify(metrics.first)===JSON.stringify(metrics.second)}
}

// Admit only actually visible image elements; do not assign src or preload
// clipped thumbnails. Test every visible image's natural dimensions.
async function scanVisibleImages(page){
  const images=[]
  const visible=()=>{
    const found=[]
    for(const img of document.images){
      let r=img.getBoundingClientRect(),left=Math.max(0,r.left),top=Math.max(0,r.top),
        right=Math.min(innerWidth,r.right),bottom=Math.min(innerHeight,r.bottom)
      for(let el=img;el&&right>left&&bottom>top;el=el.parentElement){
        const s=getComputedStyle(el)
        if(s.display==='none'||s.visibility==='hidden'||s.visibility==='collapse'||el.hidden||el.inert||(el!==img&&Number(s.opacity)===0)){right=left;break}
        if(el!==img&&el!==document.body&&el!==document.documentElement){
          const b=el.getBoundingClientRect()
          if(/hidden|clip|auto|scroll/.test(s.overflowX)){left=Math.max(left,b.left+el.clientLeft);right=Math.min(right,b.left+el.clientLeft+el.clientWidth)}
          if(/hidden|clip|auto|scroll/.test(s.overflowY)){top=Math.max(top,b.top+el.clientTop);bottom=Math.min(bottom,b.top+el.clientTop+el.clientHeight)}
        }
      }
      if(right>left&&bottom>top)found.push({url:img.currentSrc||img.getAttribute('src')||'',alt:img.alt,
        loaded:img.complete&&img.naturalWidth>0&&img.naturalHeight>0,width:img.naturalWidth,height:img.naturalHeight})
    }
    return found
  }
  // Use one full-viewport stride, no blind image prefetch.
  const extent=await page.evaluate(()=>({height:document.documentElement.scrollHeight,viewport:innerHeight}))
  for(let y=0;y<extent.height;y+=extent.viewport){
    await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),y)
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
    // Wait for image admission, then re-sample with the same clipping rules.
    let current=await page.evaluate(visible)
    for(let tries=0;current.some(x=>!x.loaded)&&tries<40;tries++){
      await page.waitForTimeout(100);current=await page.evaluate(visible)
    }
    images.push({scrollY:y,images:current})
  }
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}))
  return images
}
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
 const ctx=await browser.newContext({viewport,reducedMotion:'reduce',deviceScaleFactor:1,locale,timezoneId:'UTC',colorScheme:theme,isMobile:viewport.width<500,hasTouch:viewport.width<500})
 const page=await ctx.newPage(),network=[],errors=[]
 page.on('request',r=>{if(r.url().includes('/rest/v1/')||r.url().includes('/storage/v1/'))network.push(r.url())})
 page.on('response',r=>{if(r.status()>=400&&r.request().resourceType()==='image')errors.push({url:r.url(),status:r.status()})})
 page.on('requestfailed',r=>{if(r.resourceType()==='image')errors.push({url:r.url(),error:r.failure()?.errorText})})
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
   await page.evaluate(()=>document.fonts.ready.then(()=>true))
   const state=await page.evaluate(()=>{
     const clean=v=>v?.replace(/\s+/g,' ').trim()??''
     const parts=[...document.querySelectorAll('header,main,footer')].map(el=>({tag:el.tagName,text:clean(el.innerText)}))
     const links=[...document.querySelectorAll('header a,main a,footer a')].map(el=>({text:clean(el.innerText),href:el.getAttribute('href')}))
     const cards=[...document.querySelectorAll('.selected-grid .project-card,.more-projects-grid .project-card')].map(el=>({title:clean(el.querySelector('h3')?.innerText),href:el.getAttribute('href')}))
     const imageCount=document.querySelectorAll('.case-hero-carousel-dots button').length|| (document.querySelector('.case-story-cover')?1:0)
     const sections=[...document.querySelectorAll('main h1,main h2,main h3,main h4')].map(el=>({tag:el.tagName,text:clean(el.innerText)}))
     const controls=[...document.querySelectorAll('header button,main button,footer button')].filter(el=>el.getClientRects().length).map(el=>({text:clean(el.innerText),label:el.getAttribute('aria-label'),role:el.getAttribute('role'),disabled:el.disabled}))
     return {parts,links,cards,sections,controls,imageCount,galleryCount:document.querySelectorAll('.about-gallery-card').length,lang:document.documentElement.lang,theme:document.documentElement.dataset.theme,width:document.documentElement.scrollWidth,viewport:innerWidth,title:document.title}
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
   const imageSamples=await scanVisibleImages(page)
   await page.screenshot({path:out+'/'+name+'.png',animations:'disabled',caret:'hide',fullPage:true})
   report.network.push({name,network,errors,imageSamples})
   assert.deepEqual(errors,[],'Image HTTP/request errors: '+name)
   assert(imageSamples.every(sample=>sample.images.every(img=>img.loaded)),'Visible image missing natural dimensions: '+name)
   if(t.name!=='main'&&route.startsWith('projects/'))assert(!network.some(u=>/\/rest\/v1\/(projects|more_projects|project_institutions)|\/storage\/v1\//.test(u)),'Public case accessed legacy project backend')
   return {...state,screenshot:name}
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
     const fields=['parts','links','cards','sections','controls','imageCount','galleryCount','lang','theme','title']
     const diffs=[]
     for(const field of fields){
       // Only the explicitly approved AnimeFinder phrase is normalized.
       const value=x=>normalized(JSON.stringify(x[field]))
       if(approvedMainText(value(a),route)!==value(b))diffs.push({field,comparison:'main-candidate',main:a[field],candidate:b[field]})
       if(value(b)!==value(c))diffs.push({field,comparison:'candidate-offline',candidate:b[field],offline:c[field]})
     }
     const visualPage=await browser.newPage()
     try{
       for(const [left,right,comparison] of [[a,b,'main-candidate'],[b,c,'candidate-offline']]){
         const visual=await comparePixels(visualPage,left.screenshot,right.screenshot,[route.replaceAll('/','-')||'home',viewport.width,locale,theme,comparison].join('-'))
         report.visual??=[]
         report.visual.push({route,viewport,locale,theme,comparison,...visual})
         if(!visual.match)diffs.push({field:'pixels',comparison,...visual})
       }
     }finally{await visualPage.context().close()}
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
