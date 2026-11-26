/** Dedicated migration acceptance: public files served locally while the
 * isolated CMS and Auth contracts stay available. Never contact production.
 * Published images are the explicit subject of this test, not general fixtures.
 */
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

export async function verifyLocalPublicDelivery(browser, base) {
  const inventory = JSON.parse(await readFile('docs/assets/supabase-public-assets-inventory.json','utf8'))
  const refs = inventory.content_reference_map
  const publicRows = inventory.assets.filter(a => a.github_path)
  const origin = 'https://' + inventory.summary.source_project_id + '.supabase.co'
  const storage = origin + '/storage/v1/object/public/portfolio-media/'
  const sourceUrl = path => storage + path
  const covers = new Map()
  for (const row of refs) {
    if (!['projects','more_projects'].includes(row.source_table)) continue
    const slug = row.related_project_id === 'city-comparing' ? 'cities-comparing' : row.related_project_id
    if (!covers.has(slug) || row.source_path.includes('/PNG/')) covers.set(slug,row.source_url)
  }
  const gallery = refs.filter(r => r.source_table === 'about_gallery')
  const profile = refs.find(r=>r.source_path.startsWith('profile/')).source_url
  const cv = refs.find(r=>r.source_path.startsWith('cv/')).source_url
  const logos = refs.filter(r=>r.source_table === 'project_institutions')
  const context = await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'})
  const page = await context.newPage()
  const requests=[], errors=[], storageRequests=[], apiRequests=[]
  page.on('request',req=>{
    const url=req.url()
    if(url.includes('/storage/v1/')) storageRequests.push(url)
    if(url.includes('/rest/v1/')||url.includes('/auth/v1/')) apiRequests.push(url)
    if(url.includes('/assets/')) requests.push(url)
  })
  page.on('response',res=>{
    if(res.url().includes('/assets/')&&res.status()>=400)errors.push(res.status()+' '+res.url())
  })
  // Abort Storage only. REST/Auth still use the isolated fixture server.
  await page.route('**/storage/v1/**', route=>route.abort('failed'))
  await page.route('http://127.0.0.1:54321/rest/v1/**', async route=>{
    const url=new URL(route.request().url())
    const table=url.pathname.split('/').pop()
    if(table==='about') {
      await route.fulfill({status:200,contentType:'application/json',json:{
        id:'main',profile_image_url:profile,cv_url:cv,content_en:{name:'Fixture public portfolio'}
      }})
      return
    }
    const response=await route.fetch()
    if(!['projects','more_projects','project_institutions','about_gallery'].includes(table)){
      await route.fulfill({response}); return
    }
    const original=await response.json()
    function adapt(row) {
      if(!row) return row
      if(table==='about_gallery') {
        const number=Number(String(row.id).match(/fixture-photo-(\d+)/)?.[1])
        const ref=gallery.find(r=>r.source_path.endsWith('-palestrando-'+number+'.jpg'))
        assert(ref,'Gallery fixture has no audited match')
        return {...row,image_url:ref.source_url,storage_path:ref.source_path}
      }
      if(table==='project_institutions') {
        const basename=String(row.institution_logo_url).split('/').pop()
        const match=logos.find(r=>r.source_path.endsWith('-'+basename))
        assert(match,'Institution fixture has no audited match')
        return {...row,institution_logo_url:match.source_url}
      }
      const cover=covers.get(row.slug==='city-comparing'?'cities-comparing':row.slug)
      return cover ? {...row,cover_url:cover,image_url:cover} : row
    }
    await route.fulfill({response,json:Array.isArray(original)?original.map(adapt):adapt(original)})
  })
  async function loaded(locator,part) {
    await locator.waitFor({state:'visible',timeout:30000})
    await locator.evaluate((img,p)=>img.setAttribute('data-local-asset-check',p),part)
    await page.waitForFunction(p=>{
      const img=[...document.querySelectorAll('img[data-local-asset-check]')].find(x=>x.getAttribute('data-local-asset-check')===p)
      return img?.complete&&img.naturalWidth>0&&img.currentSrc.includes(p)
    },part,{timeout:30000})
    const url=await locator.evaluate(img=>img.currentSrc)
    await locator.evaluate(img=>img.removeAttribute('data-local-asset-check'))
    assert(url.startsWith(base),'Asset not served by local app: '+url)
    return url
  }
  try {
    await page.goto(base+'#/?portal=skip')
    const cards=page.locator('.about-gallery-card')
    await cards.first().waitFor({state:'attached',timeout:30000})
    assert.equal(await cards.count(),10,'Preserve fixture editorial visibility')
    // Runtime resolver: all audited references and variants, no arbitrary host/bucket.
    const resolution=await page.evaluate(async ({base,refs,rows,storage})=>{
      const { migratedPublicAsset, resolvePublicAsset, resolveAssetFallback }=await import(base+'src/assets/public/resolvePublicAsset.ts')
      const all=rows.map(r=>{
        const url=storage+r.supabase_path.split('/').map(encodeURIComponent).join('/')
        return {key:r.supabase_path,value:migratedPublicAsset(url),fallback:resolveAssetFallback(url,url)}
      })
      return {all,refs:refs.map(r=>migratedPublicAsset(r.source_url)),
        unknown:resolvePublicAsset(storage+'about/gallery/new-upload.jpg'),
        foreign:migratedPublicAsset('https://other-project.supabase.co'+new URL(refs[0].source_url).pathname),
        privatePath:migratedPublicAsset(refs[0].source_url.replace('/public/','/sign/'))}
    },{base,refs,rows:publicRows,storage})
    assert.equal(resolution.all.length,68)
    assert(resolution.refs.every(Boolean))
    assert.equal(resolution.unknown,storage+'about/gallery/new-upload.jpg')
    assert.equal(resolution.foreign,undefined)
    assert.equal(resolution.privatePath,undefined)
    for(const row of resolution.all){
      assert(row.value && !row.fallback,'Missing exact mapping or remote fallback: '+row.key)
      assert(Object.values(row.value).every(v=>v.startsWith(new URL(base).pathname+'assets/')))
    }
    const initialGallery=requests.filter(u=>u.includes('/assets/about/gallery/'))
    assert(initialGallery.every(u=>u.includes('/WebP/')),'Initial gallery original request')
    for(let i=0;i<await cards.count();i++){
      const card=cards.nth(i)
      await card.scrollIntoViewIfNeeded()
      await loaded(card.locator('img.progressive-image-main'),'/assets/about/gallery/WebP/')
    }
    assert(!requests.some(u=>u.includes('/assets/about/gallery/PNG/')),'Hidden gallery PNG requested before zoom')
    await cards.first().click()
    await loaded(page.locator('.image-lightbox-viewport img'),'/assets/about/gallery/PNG/')
    await page.keyboard.press('Escape')
    await page.locator('.image-lightbox-backdrop').waitFor({state:'hidden'})
    const portrait=page.locator('.profile-frame')
    await portrait.scrollIntoViewIfNeeded()
    assert((await loaded(portrait.locator('img'),'/assets/about/profile/')).endsWith('.webp'))
    assert(!requests.some(u=>u.includes('/assets/documents/cv/')),'CV fetched before opening')
    await page.locator('.about-cv-button').click()
    await page.locator('.cv-viewer-document iframe').waitFor({state:'attached'})
    const pdf=await page.locator('.cv-viewer-document iframe').getAttribute('src')
    assert(pdf?.includes('/assets/documents/cv/')&&pdf.endsWith('.pdf'))
    await page.keyboard.press('Escape')
    await page.locator('.cv-viewer-backdrop').waitFor({state:'hidden'})
    for(const [slug] of covers){
      const card=page.locator('a.project-card[href="#/projects/'+slug+'"]')
      await card.scrollIntoViewIfNeeded()
      assert((await loaded(card.locator('img.progressive-image-main'),'/assets/projects/'+slug+'/WebP/')).endsWith('.webp'))
    }
    for(const [slug] of covers){
      await page.goto(base+'#/projects/'+slug)
      const hero=page.locator('.case-story-hero[data-case-slug="'+slug+'"]')
      await hero.waitFor({state:'visible',timeout:30000})
      const cover=hero.locator('.case-story-cover')
      await cover.scrollIntoViewIfNeeded()
      await loaded(cover.locator('img.progressive-image-main'),'/assets/projects/'+slug+'/WebP/')
      await cover.click()
      await loaded(page.locator('.image-lightbox-viewport img'),'/assets/projects/'+slug+'/PNG/')
      await page.keyboard.press('Escape')
      await page.locator('.image-lightbox-backdrop').waitFor({state:'hidden'})
      const marks=hero.locator('.case-institution-logo')
      if(await marks.count()){
        for(let i=0;i<await marks.count();i++){
          const mark=marks.nth(i);await mark.scrollIntoViewIfNeeded()
          assert((await loaded(mark.locator('img'),'/assets/institutions/svg/')).endsWith('.svg'))
        }
      }
    }
    await page.goto(base+'#/admin')
    await page.getByText('This area is restricted.').waitFor()
    await page.locator('input[type=email]').fill('qa-viewer@example.invalid')
    await page.locator('input[type=password]').fill('fixture-password-not-secret')
    await page.getByRole('button',{name:'Sign In',exact:true}).click()
    await page.getByText('Access denied.',{exact:true}).waitFor()
    await page.getByRole('button',{name:'Sign Out',exact:true}).click()
    await page.getByText('This area is restricted.').waitFor()
    assert(apiRequests.some(u=>u.includes('/rest/v1/about_gallery')))
    assert(apiRequests.some(u=>u.includes('/auth/v1/token')))
    assert.equal(storageRequests.length,0,'Migrated public UI attempted Storage: '+storageRequests.join(', '))
    assert.equal(errors.length,0,'Local asset errors: '+errors.join(', '))
    await mkdir('test-results',{recursive:true})
    await writeFile('test-results/local-public-assets.json',JSON.stringify({
      sha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),mappedPaths:68,editorialReferences:refs.length,
      galleryCards:10,projectCovers:covers.size,profileWebP:true,cvLocal:true,storageRequests,errors,apiContract:true,authContract:true
    },null,2))
    console.log('PASS local public assets: 68 exact keys, 31 editorial refs, '+covers.size+' project covers + PNG zoom, gallery, profile, CV, REST/Auth; zero Storage requests')
  } finally {await context.close()}
}
