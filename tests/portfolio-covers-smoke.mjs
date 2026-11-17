import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'

// Test-only browser harness. No privileged keys are used by the browser.
const BASE = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const SLUGS = ['cities-comparing','embedded-control-platform','foton-hub','hamlet',
  'pdf-frequency-analyzer','quantum-education-apps','scientific-analysis-toolkit',
  'speaker-portfolio','webseer']
const report = { results: [], admin: {}, error: null }
const server = spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5173','--strictPort'],
  { stdio: 'ignore', env: process.env, detached: true })
let browser

async function ready() {
  for (let i=0;i<60;i++) {
    try { if ((await fetch(BASE)).ok) return } catch {}
    await new Promise(resolve=>setTimeout(resolve, 400))
  }
  throw Error('Vite server did not start')
}
async function imageLoaded(page,selector,part) {
  try {
    await page.waitForFunction(({selector,part})=>{
      const img=document.querySelector(selector)
      return img instanceof HTMLImageElement && img.src.includes(part) &&
        img.complete && img.naturalWidth>0
    },{selector,part},{timeout:30000})
  } catch(e) {
    const state=await page.evaluate(selector=>{
      const element=document.querySelector(selector)
      return { page:location.href,src:element?.getAttribute('src'),
        complete:element?.complete,naturalWidth:element?.naturalWidth,
        text:document.querySelector('h1')?.textContent,
        imageCount:document.querySelectorAll('img').length}
    },selector)
    throw Error('Image readiness failed: '+part+' '+JSON.stringify(state)+' '+String(e))
  }
  const actual=await page.locator(selector).getAttribute('src')
  assert(actual?.includes(part))
  return actual
}
async function testViewport(label,width,height) {
  const context=await browser.newContext({
    viewport:{width,height},acceptDownloads:true,isMobile:label==='mobile',hasTouch:label==='mobile'
  })
  const page=await context.newPage()
  const bad=[]
  page.on('response',r=>{
    if (r.url().includes('portfolio-media/projects/') &&
        /\/(PNG|WebP)\//.test(r.url()) && r.status()>=400) bad.push(r.status())
  })
  await page.goto(BASE+'#/',{waitUntil:'domcontentloaded'})
  console.log('BROWSER',label,'Home loaded; waiting for Foton Hub card')
  const homeCard=page.locator('a.project-card[href$="/projects/foton-hub"]')
  await homeCard.waitFor({state:'attached',timeout:30000})
  await homeCard.scrollIntoViewIfNeeded()
  await imageLoaded(page,'a.project-card[href$="/projects/foton-hub"] img.progressive-image-main','/WebP/')
  console.log('BROWSER',label,'Home WebP confirmed')
  for (const slug of SLUGS) {
    console.log('BROWSER',label,slug,'begin')
    await page.goto(BASE+'#/projects/'+slug,{waitUntil:'domcontentloaded'})
    await page.locator('.case-story-cover').waitFor({state:'visible',timeout:30000})
    await imageLoaded(page,'.case-story-cover img.progressive-image-main','/WebP/')
    await page.locator('.case-story-cover').click()
    const dialog=page.locator('.image-lightbox[role="dialog"]')
    await dialog.waitFor({state:'visible',timeout:10000})
    await imageLoaded(page,'.image-lightbox-viewport img','/PNG/')
    await dialog.getByRole('button',{name:'Download'}).waitFor({state:'visible'})
    if (label==='desktop' && slug==='foton-hub') {
      const [download]=await Promise.all([
        page.waitForEvent('download',{timeout:20000}),
        dialog.getByRole('button',{name:'Download'}).click()
      ])
      assert(download.suggestedFilename().endsWith('.png'))
    }
    if (label==='mobile') {
      const dimensions=await page.evaluate(()=>({
        width:document.documentElement.clientWidth,
        scroll:document.documentElement.scrollWidth
      }))
      assert(dimensions.scroll<=dimensions.width+2,'Mobile overflow: '+slug)
    }
    await dialog.getByRole('button',{name:'Close'}).click()
    console.log('BROWSER',label,slug,'PASS')
    report.results.push({viewport:label,project:slug,webp:true,png:true})
  }
  assert.equal(bad.length,0,'Broken PNG/WebP network responses')
  if(label==='desktop') {
    await page.goto(BASE+'#/admin',{waitUntil:'domcontentloaded'})
    await page.getByText('This area is restricted.').waitFor({timeout:20000})
    assert.equal(await page.locator('input[type="password"]').count(),1)
    report.admin.restrictedLogin='PASS'
  }
  await page.goto(BASE+'#/',{waitUntil:'domcontentloaded'})
  await fs.mkdir('test-results',{recursive:true})
  await page.screenshot({path:'test-results/home-'+label+'.png'})
  await context.close()
}
async function testAdminUploader(){
  const context=await browser.newContext()
  const page=await context.newPage()
  await page.goto(BASE+'tests/admin-uploader.html',{waitUntil:'domcontentloaded'})
  const input=page.locator('input[type=file]')
  await input.waitFor({state:'attached'})
  await input.setInputFiles({
    name:'invalid.jpg',mimeType:'image/jpeg',buffer:Buffer.from([0xff,0xd8,0xff,0xd9])
  })
  await page.getByText(/Para capas de projetos, envie o PNG original/).waitFor()
  await input.setInputFiles({
    name:'cover.png',mimeType:'image/png',
    buffer:Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0])
  })
  await page.getByRole('button',{name:'SALVAR IMAGEM'}).click()
  await page.getByTestId('saved').getByText('cover.png|image/png').waitFor()
  report.admin.uploader='PASS: JPEG rejected and PNG accepted'
  await page.screenshot({path:'test-results/admin-uploader.png'})
  await context.close()
}
try {
  await ready()
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  await testViewport('desktop',1440,900)
  await testViewport('mobile',390,844)
  await testAdminUploader()
  console.log('PASS: 9 cases x 2 viewports, original PNG zoom/download and isolated admin uploader')
} catch(error) {
  report.error=String(error)
  console.error('FAIL browser smoke:',String(error))
  process.exitCode=1
} finally {
  if(browser) await browser.close()
  try { process.kill(-server.pid,'SIGTERM') } catch {}
  await fs.mkdir('test-results',{recursive:true})
  await fs.writeFile('test-results/portfolio-browser-report.json',JSON.stringify(report,null,2))
}
