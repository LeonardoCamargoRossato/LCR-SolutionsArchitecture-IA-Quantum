import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {env:process.env,stdio:'ignore',detached:true})
let browser
const report = {passes:[], failures:[]}

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt++) {
    try { if ((await fetch(base)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 400))
  }
  throw Error('Vite did not start')
}

async function check(name, width, height, expectedWidth, expectedHeight) {
  const ctx = await browser.newContext({viewport:{width,height},isMobile:name==='mobile',hasTouch:name==='mobile'})
  const page = await ctx.newPage()
  await page.goto(base + '#/projects/cities-comparing', {waitUntil:'domcontentloaded'})
  await page.locator('.case-story-hero--cities .case-hero-thumbnails button').first().waitFor({state:'visible',timeout:30000})
  await page.getByText('1 / 9', {exact:true}).waitFor({timeout:30000})
  const data = await page.evaluate(() => {
    const hero = document.querySelector('.case-story-hero--cities')
    const left = hero?.querySelector('.case-story-hero-copy')
    const right = hero?.querySelector('.case-hero-media')
    const thumb = hero?.querySelector('.case-hero-thumbnails button')
    const rail = hero?.querySelector('.case-hero-thumbnails')
    if (!(left && right && thumb && rail)) throw Error('Expected Cities Comparing DOM missing')
    const leftRect=left.getBoundingClientRect(), rightRect=right.getBoundingClientRect(), thumbRect=thumb.getBoundingClientRect()
    const railStyle=getComputedStyle(rail)
    return {
      leftBottom:leftRect.bottom,
      rightBottom:rightRect.bottom,
      thumbWidth:thumbRect.width,
      thumbHeight:thumbRect.height,
      scrollbar:railStyle.scrollbarColor,
      overflowX:railStyle.overflowX,
      railScrollWidth:rail.scrollWidth,
      railClientWidth:rail.clientWidth,
      viewport:document.documentElement.clientWidth,
      docWidth:document.documentElement.scrollWidth,
      buttons:rail.querySelectorAll('button').length,
    }
  })
  assert.equal(data.buttons, 9, 'Existing nine-slide gallery must be preserved')
  assert(Math.abs(data.thumbWidth-expectedWidth)<=2, 'Thumbnail width mismatch: '+JSON.stringify(data))
  assert(Math.abs(data.thumbHeight-expectedHeight)<=2, 'Thumbnail height mismatch: '+JSON.stringify(data))
  assert(data.scrollbar.includes('107, 114, 128'), 'Shared neutral scrollbar style missing: '+data.scrollbar)
  assert.equal(data.overflowX,'auto')
  assert(data.railScrollWidth > data.railClientWidth, 'Carousel scrollbar not necessary')
  assert(data.docWidth<=data.viewport+2, 'Page overflows horizontally: '+JSON.stringify(data))
  if(name==='desktop') {
    assert(Math.abs(data.leftBottom-data.rightBottom)<4,'Bottom edge not aligned: '+JSON.stringify(data))
  }
  await page.locator('.case-hero-carousel-controls > button').last().click()
  await page.getByText('2 / 9', {exact:true}).waitFor()
  await mkdir('test-results', {recursive:true})
  await page.screenshot({path:'test-results/cities-carousel-alignment-'+name+'.png',fullPage:false})
  report.passes.push({device:name, ...data})
  console.log('PASS',name,JSON.stringify(data))
  await ctx.close()
}

try {
  await waitForServer()
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  await check('desktop',1440,900,96,62)
  await check('mobile',390,844,80,52)
  console.log('PASS: Cities Comparing neutral scrollbar, shared thumbnails and desktop alignment; mobile layout safe')
} catch(error) {
  report.failures.push(String(error))
  console.error('LAYOUT SMOKE FAILED:',error)
  process.exitCode=1
} finally {
  if(browser) await browser.close()
  try { process.kill(-server.pid,'SIGTERM') } catch {}
  await mkdir('test-results',{recursive:true})
  await writeFile('test-results/cities-carousel-alignment.json',JSON.stringify(report,null,2))
}
