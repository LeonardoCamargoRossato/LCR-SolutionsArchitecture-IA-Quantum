import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { chromium } from './Browser.mjs'
const base='http://127.0.0.1:5189/LCR-SolutionsArchitecture-IA-Quantum/'
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5189','--strictPort'],{stdio:'ignore',detached:true})
let browser
try {
  for(let i=0;i<100;i++){
    try{if((await fetch(base)).ok)break}catch{}
    if(i===99)throw Error('Local dev server unavailable')
    await new Promise(r=>setTimeout(r,250))
  }
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  const page=await browser.newPage({viewport:{width:1280,height:800}})
  await page.goto(base+'#/admin')
  await page.getByText('This area is restricted.').waitFor()
  await page.locator('input[type=email]').fill('qa-viewer@example.invalid')
  await page.locator('input[type=password]').fill('bad-fixture-password')
  const denied=page.waitForResponse(r=>r.url().includes('/auth/v1/token')&&r.status()===400)
  await page.getByRole('button',{name:'Sign In',exact:true}).click()
  await denied
  await page.getByRole('button',{name:'Sign In',exact:true}).waitFor()
  assert.equal(await page.locator('.admin-shell').count(),0)
  await page.locator('input[type=password]').fill('fixture-password-not-secret')
  await page.getByRole('button',{name:'Sign In',exact:true}).click()
  await page.getByText('Access denied.',{exact:true}).waitFor()
  assert.equal(await page.locator('.admin-shell').count(),0)
  await mkdir('test-results/isolation',{recursive:true})
  await page.screenshot({path:'test-results/isolation/non-admin-denied.png'})
  await page.getByRole('button',{name:'Sign Out',exact:true}).click()
  await page.getByText('This area is restricted.').waitFor()
  console.log('PASS simulated invalid login, authenticated non-admin denied, sign-out')
  // Contact uses a mailto URI, not an API or real message delivery.
  await page.goto(base+'#/?portal=skip')
  const form=page.locator('.contact-form')
  await form.scrollIntoViewIfNeeded()
  assert.equal(await form.evaluate(el=>el.checkValidity()),false)
  await form.locator('input[autocomplete=name]').fill('Fixture person')
  await form.locator('input[type=email]').fill('invalid-address')
  await form.locator('textarea').fill('Fixture message & ? #')
  assert.equal(await form.evaluate(el=>el.checkValidity()),false)
  await form.locator('input[type=email]').fill('qa@example.invalid')
  assert.equal(await form.evaluate(el=>el.checkValidity()),true)
  const uri=await page.evaluate(async base=>{
    const {contactMailto}=await import(base+'src/components/ContactForm.tsx')
    return contactMailto({name:'Fixture person',email:'qa@example.invalid',subject:'Fixture & test',message:'Fixture message & ? #'})
  },base)
  const mail=new URL(uri)
  assert.equal(mail.protocol,'mailto:')
  assert.equal(mail.searchParams.get('subject'),'Fixture & test')
  assert.equal(mail.searchParams.get('body'),'Fixture message & ? #\n\nName: Fixture person\nEmail: qa@example.invalid')
  await page.screenshot({path:'test-results/isolation/contact-validation.png'})
  const guards=await page.evaluate(async base=>{
    const {MediaService}=await import(base+'src/application/services/MediaService.ts')
    const {CvService}=await import(base+'src/application/services/CvService.ts')
    const {publicAssetCatalog}=await import(base+'src/assets/public/publicAssetCatalog.ts')
    let denied=0,mutations=0
    const repo={delete:async()=>{mutations++},replace:async()=>{mutations++},saveCvUrl:async()=>{mutations++},removeCvUrl:async()=>{mutations++}}
    const media=new MediaService(repo),cv=new CvService(repo,repo)
    for(const path of Object.keys(publicAssetCatalog)){
      const asset={id:path,path,url:'',name:path,mimeType:'image/png',category:'Projects'}
      try{await media.delete(asset)}catch{denied++}
      try{await media.replace(asset,new File(['fixture'],'fixture.png',{type:'image/png'}),'Projects')}catch{denied++}
    }
    try{await cv.removeCv()}catch{denied++}
    try{await cv.replaceCv(new File(['fixture'],'fixture.pdf',{type:'application/pdf'}))}catch{denied++}
    await media.delete({path:'misc/fixture.png',url:'',id:'fixture',name:'fixture',category:'Other',mimeType:'image/png'})
    return {denied,mutations,keys:Object.keys(publicAssetCatalog).length}
  },base)
  assert.equal(guards.denied,guards.keys*2+2)
  assert.equal(guards.mutations,1,'Only unmanaged synthetic media may be deleted')
  console.log('PASS contact required fields, mailto encoding, no message sent; all migrated legacy media and CV writes protected')

} finally{
  if(browser)await browser.close()
  try{process.kill(-server.pid,'SIGTERM')}catch{}
}
