import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const publicBase=process.env.CE235_SMOKE_BASE_URL?.trim()
const base=publicBase?(publicBase.endsWith('/')?publicBase:publicBase+'/'):'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const server=publicBase?null:spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5173','--strictPort'],{env:process.env,stdio:'ignore',detached:true})
let browser
const report={scope:publicBase?'public Pages':'PR branch',desktop:[],mobile:[],failures:[]}
const projectSlug='ce235-real-time-systems'
const folder='/projects/ce235/cover/'

async function waitForServer(){
  for(let i=0;i<90;i++){
    try{if((await fetch(base)).ok)return}catch{}
    await new Promise(r=>setTimeout(r,350))
  }
  throw Error('App did not start')
}
async function imageReady(page,selector,expectedSuffix){
  await page.waitForFunction(({selector,expectedSuffix})=>{
    const el=document.querySelector(selector)
    return el instanceof HTMLImageElement && el.complete && el.naturalWidth>0 &&
       el.currentSrc.includes(expectedSuffix)
  },{selector,expectedSuffix},{timeout:30000})
  return page.locator(selector).evaluate(el=>({src:el.currentSrc,w:el.naturalWidth,h:el.naturalHeight}))
}
async function verify(name,viewport){
  const ctx=await browser.newContext({viewport,isMobile:name==='mobile',hasTouch:name==='mobile',acceptDownloads:true})
  const page=await ctx.newPage()
  const errors=[]
  page.on('response',r=>{if(r.url().includes(folder)&&r.status()>=400)errors.push({code:r.status(),url:r.url()})})
  await page.goto(base+'#/',{waitUntil:'domcontentloaded'})
  const card=page.locator('a.project-card-compact[href*="'+projectSlug+'"]')
  await card.waitFor({state:'attached',timeout:30000})
  await card.scrollIntoViewIfNeeded()
  const cardImage=await imageReady(page,'a.project-card-compact[href*="'+projectSlug+'"] img.progressive-image-main',folder+'WebP/ce235-course-site-card.webp')
  assert.equal(cardImage.w,960)
  assert.equal(cardImage.h,405)
  console.log('CE235 CARD',name,'PASS')

  await page.goto(base+'#/projects/'+projectSlug,{waitUntil:'domcontentloaded'})
  const counter=page.locator('.case-hero-carousel-count')
  await counter.waitFor({state:'visible',timeout:30000})
  assert.equal((await counter.innerText()).trim(),'1 / 8','Expected screenshot + legacy artwork + six technical captures')
  const current=await imageReady(page,'.case-story-cover img.progressive-image-main',folder+'WebP/ce235-course-site-card.webp')
  assert.equal(current.w,960)
  assert.equal(current.h,405)
  assert.equal(await page.locator('.case-hero-thumbnails button').count(),8)
  await page.locator('.case-story-cover').click()
  const lightbox=page.locator('.image-lightbox[role="dialog"]')
  await lightbox.waitFor({state:'visible',timeout:15000})
  const zoom=await imageReady(page,'.image-lightbox-viewport img',folder+'PNG/ce235-course-site-original.png')
  assert.equal(zoom.w,1920)
  assert.equal(zoom.h,1080)
  const [download]=await Promise.all([
    page.waitForEvent('download',{timeout:30000}),
    lightbox.getByRole('button',{name:'Download'}).click(),
  ])
  assert(download.suggestedFilename().endsWith('.png'),'Zoom download must be original PNG')
  await lightbox.getByRole('button',{name:'Close'}).click()
  await page.locator('.case-hero-carousel-dots button').nth(1).click()
  const second=await imageReady(page,'.case-story-cover img.progressive-image-main','ce235-telemetry.webp')
  assert(second.src.includes('ce235-telemetry.webp'),'Old illustration must remain slide 2')
  await page.locator('.case-hero-carousel-dots button').nth(2).click()
  await imageReady(page,'.case-story-cover img.progressive-image-main','/ce235-gallery/us123-interface-card.webp')
  const scroll=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}))
  assert(scroll.width<=scroll.viewport+2,'Horizontal overflow on '+name)
  assert.equal(errors.length,0,'404/HTTP errors in CE235 assets: '+JSON.stringify(errors))
  await mkdir('test-results',{recursive:true})
  await page.screenshot({path:'test-results/ce235-screenshot-cover-'+name+'.png'})
  report[name].push({card:cardImage,firstSlide:current,zoom,slide2:second.src,counter:'1 / 8',errorCount:errors.length})
  await ctx.close()
  console.log('CE235 CASE',name,'PASS: WebP card, first screenshot, old illustration second, PNG zoom and download')
}

try{
  await waitForServer()
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  await verify('desktop',{width:1440,height:900})
  await verify('mobile',{width:390,height:844})
  console.log('CE235 SMOKE PASS: Additional Projects, 8 slides, WebP first paint, PNG zoom on desktop/mobile.')
}catch(error){
  report.failures.push(String(error))
  console.error('CE235 SMOKE FAILED:',error)
  process.exitCode=1
}finally{
  if(browser)await browser.close()
  if(server){try{process.kill(-server.pid,'SIGTERM')}catch{}}
  await mkdir('test-results',{recursive:true})
  await writeFile('test-results/ce235-cover-smoke.json',JSON.stringify(report,null,2))
}
