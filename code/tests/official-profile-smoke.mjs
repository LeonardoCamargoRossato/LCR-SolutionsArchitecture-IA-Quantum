/** Stage 04.1: exercise the real Home and editor, with no external egress.
 * All backend failures are injected only against the loopback fixture.
 */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdir, mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const root = '/LCR-SolutionsArchitecture-IA-Quantum/'
const fixture = 'http://127.0.0.1:54321'
const legacy = fixture + '/storage/v1/object/public/portfolio-media/profile/legacy-profile.jpg'
const wrong = fixture + '/storage/v1/object/public/portfolio-media/profile/wrong-profile.png'
const profilePath = 'assets/about/profile/1792380122932-87ee4d65-cc32-4005-85d5-24fb6ed67957-fotoperfilLCR.webp'
const hash = 'c2b93202bee240a884d49a6aeaa55b2f99768a0202d8d2579cdfa59b0671b9dc'
const out = 'test-results/official-profile'
const sha256 = buffer => createHash('sha256').update(buffer).digest('hex')
const isPhoto = url => /\/profile\/|\/about\/profile\/|fotoperfilLCR|legacy-profile|wrong-profile/i.test(url)
const isBackend = url => url.startsWith(fixture) || /\.supabase\.co\//i.test(url)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const noBackendEnv = { ...process.env, LCR_PROFILE_NO_BACKEND:'1' }

async function startServer(args, base) {
  const child = spawn('node_modules/.bin/vite', args, { env:noBackendEnv, detached:true, stdio:'ignore' })
  try {
    for(let i=0;i<120;i++){
      if(child.exitCode!==null)throw Error('Vite exited '+child.exitCode)
      try{if((await fetch(base)).ok)return child}catch{}
      await delay(250)
    }
    throw Error('Vite did not start')
  } catch(e){stop(child);throw e}
}
function stop(child){if(child)try{process.kill(-child.pid,'SIGTERM')}catch{}}

export async function verifyOfficialProfile(browser, fixtureBase) {
  await mkdir(out,{recursive:true})
  const result={scenarios:[],admin:null}
  let cache
  async function scenario(name, base, options={}) {
    const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'})
    const page=await context.newPage()
    const photoRequests=[],backendPhotoRequests=[],backendRequests=[],aboutSelections=[],photoResponses=[]
    page.on('request',req=>{
      const url=req.url()
      if(isBackend(url))backendRequests.push(url)
      if(isPhoto(url)){
        photoRequests.push(url)
        if(isBackend(url))backendPhotoRequests.push(url)
      }
      if(url.includes('/rest/v1/about?'))aboutSelections.push(new URL(url).searchParams.get('select'))
    })
    page.on('response',res=>{if(isPhoto(res.url()))photoResponses.push({url:res.url(),status:res.status(),mime:res.headers()['content-type']})})
    if(options.cache) await context.addInitScript(({cache,legacy})=>{
      cache.about.profileImage={id:'old',url:legacy,path:'legacy-profile.jpg',name:'Old',mimeType:'image/jpeg',category:'About'}
      if(cache.about.translations?.['pt-BR'])cache.about.translations['pt-BR'].profileImage=cache.about.profileImage
      localStorage.setItem('lcr-site-content-v2',JSON.stringify({savedAt:Date.now(),value:cache}))
    },{cache,legacy})
    if(options.databaseDown)await page.route('**/rest/v1/**',route=>route.abort('failed'))
    else if('cms' in options)await page.route('**/rest/v1/about?**',async route=>{
      const res=await route.fetch()
      const row=await res.json()
      const mutate=value=>value?{...value,profile_image_url:options.cms,content_en:{...value.content_en,profileImage:{url:wrong}},content_pt:{...value.content_pt,profileImage:{url:wrong}}}:value
      await route.fulfill({response:res,json:Array.isArray(row)?row.map(mutate):mutate(row)})
    })
    if(options.storageDown)await page.route('**/storage/v1/**',route=>route.abort('failed'))
    try{
      await page.goto(base+'#/?portal=skip',{waitUntil:'domcontentloaded'})
      const img=page.getByTestId('official-profile-photo')
      await img.waitFor({state:'attached',timeout:30000})
      const hiddenBefore=await img.evaluate(el=>el.getBoundingClientRect().top>=innerHeight)
      assert(hiddenBefore,'Expected portrait below first viewport')
      assert.equal(photoRequests.length,0,'Portrait fetched before entering viewport')
      assert.equal(await img.getAttribute('src'),null,'Offscreen portrait has src')
      await img.scrollIntoViewIfNeeded()
      await page.waitForFunction(expected=>{
        const el=document.querySelector('[data-testid="official-profile-photo"]')
        return el?.complete&&el.naturalWidth>0&&el.currentSrc===expected
      },base+profilePath,{timeout:30000})
      if(!options.noBackend) {
        await page.waitForFunction(()=>localStorage.getItem('lcr-site-content-v2')!==null,null,{timeout:30000})
      }
      assert.equal(await page.locator('.profile-placeholder').count(),0)
      assert.equal(await img.evaluate(el=>el.currentSrc),base+profilePath)
      assert.deepEqual(backendPhotoRequests,[],'Backend portrait request')
      assert(photoRequests.every(url=>url===base+profilePath),'Unexpected portrait source')
      assert(aboutSelections.every(sel=>sel && sel!=='*' && !sel.includes('profile_image_url')),'About read includes legacy profile column')
      if(options.noBackend)assert.deepEqual(backendRequests,[],'Backend requested without client config')
      assert(photoResponses.some(r=>r.status===200&&r.mime?.includes('image/webp')),'Missing successful WebP response')
      const bytes=await (await context.request.get(base+profilePath)).body()
      assert.equal(sha256(bytes),hash)
      await img.screenshot({path:out+'/'+name+'.png'})
      if(!cache)cache=await page.evaluate(async base=>(await import(base+'src/data/defaultContent.ts')).defaultContent,base)
      result.scenarios.push({name,source:base+profilePath,sha256:hash,demand:true,photoRequests,backendPhotoRequests,backendRequests:backendRequests.length,aboutSelections,photoResponses,screenshot:name+'.png'})
      console.log('PASS official profile '+name+': WebP local; zero backend photo requests; viewport admission')
    }finally{await context.close()}
  }
  let dev,preview,temp
  try{
    await scenario('cms-different-cache-empty',fixtureBase,{cms:wrong})
    await scenario('cms-null-cache-empty',fixtureBase,{cms:null})
    await scenario('database-unavailable',fixtureBase,{databaseDown:true})
    await scenario('storage-unavailable',fixtureBase,{storageDown:true})
    await scenario('database-storage-unavailable',fixtureBase,{databaseDown:true,storageDown:true})
    await scenario('stale-cache-cms-different',fixtureBase,{cache:true,cms:wrong})
    await scenario('stale-cache-database-storage-unavailable',fixtureBase,{cache:true,databaseDown:true,storageDown:true})
    const devBase='http://127.0.0.1:5186'+root
    dev=await startServer(['--host','127.0.0.1','--port','5186','--strictPort'],devBase)
    await scenario('localhost-no-backend-config',devBase,{noBackend:true})
    stop(dev);dev=undefined
    temp=await mkdtemp(join(tmpdir(),'lcr-profile-build-'))
    const build=spawn('node_modules/.bin/vite',['build','--outDir',temp,'--emptyOutDir'],{env:noBackendEnv,stdio:'inherit'})
    const [code]=await once(build,'exit');assert.equal(code,0,'Offline production build failed')
    assert.equal(sha256(await readFile(join(temp,profilePath))),hash)
    const previewBase='http://127.0.0.1:5187'+root
    preview=await startServer(['preview','--host','127.0.0.1','--port','5187','--strictPort','--outDir',temp],previewBase)
    await scenario('github-pages-build-no-backend',previewBase,{noBackend:true,cache:true})
    const context=await browser.newContext({viewport:{width:1200,height:900}})
    const page=await context.newPage()
    const photoRequests=[],writes=[]
    let legacyRow={profile_image_url:legacy}
    page.on('request',req=>{if(isPhoto(req.url()))photoRequests.push(req.url())})
    await page.route('**/rest/v1/about?**',async route=>{
      if(['POST','PATCH'].includes(route.request().method())){
        const body=route.request().postDataJSON()
        const row=Array.isArray(body)?body[0]:body
        writes.push(row)
        legacyRow={...legacyRow,...row}
        await route.fulfill({status:201,headers:{'access-control-allow-origin':'*'},body:''})
      }else await route.continue()
    })
    try{
      await page.goto(fixtureBase+'tests/profile-admin-harness.html')
      const panel=page.getByTestId('versioned-profile')
      await panel.waitFor()
      const img=panel.getByTestId('official-profile-admin')
      await img.scrollIntoViewIfNeeded()
      await page.waitForFunction(expected=>{
        const img=document.querySelector('[data-testid="official-profile-admin"]')
        return img?.complete&&img.naturalWidth>0&&img.currentSrc===expected
      },fixtureBase+profilePath)
      assert.equal(await panel.locator('input[type=file],button').count(),0)
      await panel.getByText(/versioned on GitHub/).waitFor()
      assert(await page.locator('input[type=file]').count()>0,'Gallery upload controls were removed')
      await page.getByLabel('Name',{exact:true}).fill('Fixture updated name')
      await page.getByRole('button',{name:'Save About',exact:true}).click()
      await page.getByText('About updated successfully.').waitFor()
      assert.equal(writes.length,1)
      assert(!Object.hasOwn(writes[0],'profile_image_url'))
      assert(!Object.hasOwn(writes[0].content_en,'profileImage'))
      assert(!Object.hasOwn(writes[0].content_pt,'profileImage'))
      assert.equal(legacyRow.profile_image_url,legacy)
      assert.equal(writes[0].content_en.name,'Fixture updated name')
      assert(photoRequests.every(url=>url===fixtureBase+profilePath))
      await panel.screenshot({path:out+'/admin.png'})
      result.admin={readOnly:true,otherFieldsSaved:true,galleryControlsPreserved:true,legacyColumnOmitted:true,legacyValuePreserved:true,photoRequests,screenshot:'admin.png'}
      console.log('PASS profile admin read-only; About save excludes legacy column; gallery upload retained')
    }finally{await context.close()}
  }finally{
    stop(dev);stop(preview)
    if(temp)await rm(temp,{recursive:true,force:true})
    await writeFile(out+'/evidence.json',JSON.stringify(result,null,2))
  }
}
