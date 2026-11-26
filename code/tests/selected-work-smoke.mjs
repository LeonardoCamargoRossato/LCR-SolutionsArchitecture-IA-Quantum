/** Browser acceptance of the three selected cards independent of backend/cache.
 * Run only through the existing network namespace and loopback fixture. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdir, mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { verifySelectedCaseGalleries } from './selected-case-galleries-smoke.mjs'
import { prepareAdditionalWork, verifyAdditionalWork } from './additional-work-smoke.mjs'

const prefix='/LCR-SolutionsArchitecture-IA-Quantum/'
const dir='test-results/selected-work'
const slugs=['foton-hub','cities-comparing','animefinder']
const names=['Foton Hub','Cities Comparing','AnimeFinder']
const ports={dev:5186,preview:5187}
const offlineEnv={...process.env,LCR_PROFILE_NO_BACKEND:'1'}
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const isBackend=u=>u.includes('127.0.0.1:54321')||/\.supabase\.co\//i.test(u)
const isSelectedAsset=u=>/\/assets\/projects\/(?:foton-hub|cities-comparing|animefinder)\//.test(u)
const stop=child=>{if(child)try{process.kill(-child.pid,'SIGTERM')}catch{}}
async function start(args,base){
  const child=spawn('node_modules/.bin/vite',args,{env:offlineEnv,stdio:'ignore',detached:true})
  try{for(let i=0;i<120;i++){if(child.exitCode!==null)throw Error('Vite exited');try{if((await fetch(base)).ok)return child}catch{}await wait(250)}throw Error('Vite unavailable')}catch(e){stop(child);throw e}
}
export async function verifySelectedWork(browser,fixtureBase){
  await mkdir(dir,{recursive:true})
  const report={scenarios:[],admin:null,assets:[]}
  let dev,preview,temp
  const catalogContext=await browser.newContext()
  const catalogPage=await catalogContext.newPage()
  await catalogPage.goto(fixtureBase)
  const expected=await catalogPage.evaluate(async base=>{
    const {getSelectedWork}=await import(base+'src/data/selectedWork.ts')
    const {localizedProject,localizedProjectStatus}=await import(base+'src/i18n/content.ts')
    return getSelectedWork().map(p=>({
      slug:p.slug,id:p.id,cover:p.coverImage,
      locales:Object.fromEntries(['en-US','pt-BR'].map(locale=>{
        const c=localizedProject(p,locale)
        return [locale,{title:c.title,subtitle:c.subtitle,category:c.category,description:c.description,status:localizedProjectStatus(c.status,locale),technologies:c.technologies.slice(0,5),featured:c.featured}]
      }))
    }))
  },fixtureBase)
  await catalogContext.close()
  assert.deepEqual(expected.map(p=>p.slug),slugs)
  for(const p of expected){
    for(const rel of [p.cover.cardUrl,p.cover.fullUrl]){
      const path='public/'+rel.slice(prefix.length)
      const bytes=await readFile(path)
      assert(bytes.length>0)
      report.assets.push({path,sha256:createHash('sha256').update(bytes).digest('hex')})
    }
  }
  async function run(base,mode,device,theme,locale,oldCache=false){
    const viewport=device==='mobile'?{width:390,height:844}:{width:1440,height:900}
    const ctx=await browser.newContext({viewport,reducedMotion:'reduce',isMobile:device==='mobile',hasTouch:device==='mobile'})
    const page=await ctx.newPage()
    const requests=[],errors=[],backend=[],remoteImages=[]
    page.on('request',r=>{
      const u=r.url()
      if(isBackend(u))backend.push({url:u,type:r.resourceType()})
      if(isBackend(u)&&r.resourceType()==='image'&&/foton-hub|cities-comparing|animefinder|stale-selected/.test(u))remoteImages.push(u)
      if(isSelectedAsset(u))requests.push({url:u,type:r.resourceType()})
    })
    page.on('response',r=>{if(isSelectedAsset(r.url())&&r.status()>=400)errors.push(r.status()+' '+r.url())})
    await ctx.addInitScript(({theme,locale,oldCache,slugs})=>{
      localStorage.setItem('portfolio-theme',theme);localStorage.setItem('portfolio-locale',locale)
      if(oldCache)localStorage.setItem('lcr-projects-v2',JSON.stringify({savedAt:Date.now(),value:slugs.map(slug=>({id:slug,slug,title:'STALE SELECTED',visible:false,coverImage:{url:'http://127.0.0.1:54321/storage/v1/object/public/portfolio-media/stale-selected.png'}}))}))
    },{theme,locale,oldCache,slugs})
    if(mode==='blocked'){
      await page.route('**/rest/v1/**',r=>r.abort('failed'));await page.route('**/storage/v1/**',r=>r.abort('failed'))
    }else if(mode==='empty-cms'){
      await page.route('**/rest/v1/projects?**',r=>r.fulfill({status:200,contentType:'application/json',json:[]}))
      await page.route('**/rest/v1/more_projects?**',r=>r.fulfill({status:200,contentType:'application/json',json:[]}))
    }
    const file=[mode,device,theme,locale,oldCache?'old-cache':'cold'].join('-')
    try{
      await page.goto(base+'#/?portal=skip')
      const cards=page.locator('.selected-grid .project-card')
      await cards.first().waitFor({state:'attached',timeout:30000})
      assert.equal(await cards.count(),3)
      assert.deepEqual(await cards.locator('h3').allTextContents(),names)
      await page.waitForFunction(({theme,locale})=>document.documentElement.dataset.theme===theme&&document.documentElement.lang===locale,{theme,locale})
      const offscreen=await cards.evaluateAll(els=>els.map(e=>e.getBoundingClientRect().top>=innerHeight))
      for(let i=0;i<3;i++)if(offscreen[i])assert(!requests.some(r=>r.url.endsWith(expected[i].cover.cardUrl)),'Offscreen cover requested')
      for(let i=0;i<3;i++){
        const c=cards.nth(i),p=expected[i],copy=p.locales[locale]
        assert.equal(await c.getAttribute('href'),'#/projects/'+p.slug)
        assert.equal(await c.locator('.project-category').innerText(),copy.category)
        assert.equal(await c.locator('.project-status').innerText(),copy.status)
        assert.equal(await c.locator('.project-subtitle').innerText(),copy.subtitle)
        assert.equal(await c.locator('.project-description').innerText(),copy.description)
        assert.deepEqual(await c.locator('.tech-list span').allTextContents(),copy.technologies)
        assert.equal(await c.evaluate(e=>e.classList.contains('project-card-featured-accent')),Boolean(copy.featured))
        await c.scrollIntoViewIfNeeded()
        await page.waitForFunction(({i,path})=>{const im=document.querySelectorAll('.selected-grid .project-card')[i]?.querySelector('img.progressive-image-main');return im?.complete&&im.naturalWidth>0&&new URL(im.currentSrc).pathname===path},{i,path:p.cover.cardUrl},{timeout:30000})
      }
      assert.equal(await page.locator('.selected-grid .image-fallback').count(),0)
      assert(requests.every(r=>!r.url.includes('/PNG/')),'PNG fetched before viewer')
      assert.deepEqual(remoteImages,[])
      if(mode==='dev-no-config'||mode==='pages-no-config')assert.deepEqual(backend,[])
      assert.deepEqual(errors,[])
      await page.locator('.selected-grid').screenshot({path:dir+'/'+file+'.png'})
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Page overflow')
      for(let i=0;i<3;i++){
        await page.locator('.selected-grid .project-card').nth(i).click()
        await page.locator('.case-story-hero').waitFor({state:'visible',timeout:30000})
        assert(page.url().endsWith('#/projects/'+slugs[i]))
        assert.equal(await page.locator('.not-found').count(),0)
        await page.goto(base+'#/?portal=skip')
        await page.locator('.selected-grid .project-card').first().waitFor({state:'attached'})
      }
      if(mode==='dev-no-config'||mode==='pages-no-config')assert.deepEqual(backend,[],'No backend request even during case navigation')
      report.scenarios.push({file,order:slugs,requests,backendRequests:backend.length,remoteImages,errors,navigation:3,screenshot:file+'.png'})
      console.log('PASS Selected Work',file,'3 approved cards, localized content, local WebP, routes, no remote cover')
    }finally{await page.unrouteAll({behavior:'wait'});await ctx.close();await writeFile(dir+'/evidence.json',JSON.stringify(report,null,2))}
  }
  const additionalExpected=await prepareAdditionalWork(browser,fixtureBase)
  try{
    await run(fixtureBase,'empty-cms','desktop','dark','en-US')
    await run(fixtureBase,'blocked','mobile','light','pt-BR',true)
    await run(fixtureBase,'blocked','desktop','dark','en-US')
    await verifySelectedCaseGalleries(browser,fixtureBase,'blocked','desktop','dark','en-US')
    await verifySelectedCaseGalleries(browser,fixtureBase,'blocked','mobile','light','pt-BR')
    await verifySelectedCaseGalleries(browser,fixtureBase,'stale-cms','desktop','dark','en-US')
    await verifyAdditionalWork(browser,fixtureBase,additionalExpected,'blocked','desktop','dark','en-US')
    await verifyAdditionalWork(browser,fixtureBase,additionalExpected,'blocked','mobile','light','pt-BR')
    await verifyAdditionalWork(browser,fixtureBase,additionalExpected,'stale-cms','desktop','light','pt-BR')
    const db='http://127.0.0.1:'+ports.dev+prefix
    dev=await start(['--host','127.0.0.1','--port',String(ports.dev),'--strictPort'],db)
    await run(db,'dev-no-config','desktop','light','pt-BR',true)
    await run(db,'dev-no-config','mobile','dark','en-US')
    await verifySelectedCaseGalleries(browser,db,'dev-no-config','desktop','light','pt-BR')
    await verifySelectedCaseGalleries(browser,db,'dev-no-config','mobile','dark','en-US')
    await verifyAdditionalWork(browser,db,additionalExpected,'dev-no-config','desktop','light','pt-BR')
    await verifyAdditionalWork(browser,db,additionalExpected,'dev-no-config','mobile','dark','en-US')
    stop(dev);dev=undefined
    temp=await mkdtemp(join(tmpdir(),'lcr-selected-build-'))
    const build=spawn('node_modules/.bin/vite',['build','--outDir',temp,'--emptyOutDir'],{env:offlineEnv,stdio:'inherit'})
    const [exit]=await once(build,'exit');assert.equal(exit,0)
    for(const a of report.assets){const bytes=await readFile(join(temp,a.path.slice('public/'.length)));assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256)}
    const pb='http://127.0.0.1:'+ports.preview+prefix
    preview=await start(['preview','--host','127.0.0.1','--port',String(ports.preview),'--strictPort','--outDir',temp],pb)
    await run(pb,'pages-no-config','desktop','dark','pt-BR')
    await run(pb,'pages-no-config','mobile','light','en-US',true)
    await verifySelectedCaseGalleries(browser,pb,'pages-no-config','desktop','dark','pt-BR')
    await verifySelectedCaseGalleries(browser,pb,'pages-no-config','mobile','light','en-US')
    await verifyAdditionalWork(browser,pb,additionalExpected,'pages-no-config','desktop','dark','pt-BR')
    await verifyAdditionalWork(browser,pb,additionalExpected,'pages-no-config','mobile','light','en-US')
    const ctx=await browser.newContext({viewport:{width:1440,height:900}})
    const page=await ctx.newPage()
    await page.goto(fixtureBase+'tests/selected-work-admin-harness.html')
    const cards=page.locator('.project-admin-card')
    await cards.first().waitFor()
    assert.equal(await cards.count(),11)
    for(let i=0;i<3;i++){
      const card=cards.filter({has:page.getByRole('heading',{name:names[i],exact:true})})
      assert.equal(await card.locator('input,select,button').count(),0)
      assert.equal(await card.getByText(/versioned on GitHub/).count(),1)
    }
    for(const item of additionalExpected){
      const card=cards.filter({has:page.getByRole('heading',{name:item.locales['en-US'].title,exact:true})})
      assert.equal(await card.count(),1)
      assert.equal(await card.locator('input,select,button').count(),0)
      assert.equal(await card.getByText(/versioned on GitHub/).count(),1)
    }
    const other=cards.filter({has:page.getByRole('heading',{name:'Fixture unmanaged',exact:true})})
    assert.equal(await other.getByRole('button',{name:'Edit',exact:true}).count(),1)
    const guard=await page.evaluate(async base=>{
      const {ProjectService}=await import(base+'src/application/services/ProjectService.ts')
      const {getSelectedWork}=await import(base+'src/data/selectedWork.ts')
      const {getAdditionalWork}=await import(base+'src/data/additionalWork.ts')
      let writes=0,blocked=0
      const repo={update:async()=>{writes++},create:async()=>{writes++},delete:async()=>{writes++}}
      const svc=new ProjectService(repo)
      for(const p of [...getSelectedWork(),...getAdditionalWork()])for(const op of [()=>svc.update(p),()=>svc.create(p),()=>svc.delete(p.id)])try{await op()}catch{blocked++}
      await svc.delete('unmanaged-fixture')
      return {blocked,writes}
    },fixtureBase)
    assert.deepEqual(guard,{blocked:30,writes:1})
    await page.screenshot({path:dir+'/admin.png'})
    report.admin={...guard,selectedReadOnly:3,additionalReadOnly:7,otherEditable:true}
    await ctx.close()
    console.log('PASS Selected Work admin read-only and service write guard')
  }finally{stop(dev);stop(preview);if(temp)await rm(temp,{recursive:true,force:true});await writeFile(dir+'/evidence.json',JSON.stringify(report,null,2))}
}
