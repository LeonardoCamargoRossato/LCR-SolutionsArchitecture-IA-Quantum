import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:5192/LCR-SolutionsArchitecture-IA-Quantum/'
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5192', '--strictPort'], {
  stdio: 'ignore', detached: true, env: process.env,
})
const report = { tests: [], errors: [] }
let browser
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function ready() {
  for (let attempt = 0; attempt < 120; attempt++) {
    try { if ((await fetch(BASE)).ok) return } catch { /* Vite starting */ }
    await sleep(250)
  }
  throw Error('Vite server did not start')
}
const rect = locator => locator.evaluate(node => {
  const r = node.getBoundingClientRect()
  return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height, width: r.width }
})

async function check(width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    locale: 'pt-BR', // The device locale must not determine the site default.
    colorScheme: 'light', // OS light mode must not determine the site default.
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto(BASE + '#/?portal=skip', { waitUntil: 'domcontentloaded' })
  await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 20000 })
  await page.evaluate(() => document.fonts.ready)

  assert.equal(await page.locator('html').getAttribute('lang'), 'en-US', 'Fresh visit must default to English regardless of device')
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark', 'Fresh visit must default to dark regardless of OS')
  assert.equal(await page.locator('.hero-actions').innerText().then(v => v.includes('View Selected Work')), true)
  const trigger = page.locator('.language-picker-trigger')
  assert(await trigger.isVisible(), 'Language selection must be visible without mobile hamburger')
  assert.equal(await trigger.locator('[data-flag]').getAttribute('data-flag'), 'US')
  assert((await trigger.innerText()).includes('EN USA'), 'Header must show US flag / EN USA')
  if (width <= 980) {
    assert.equal(await page.locator('.nav').evaluate(el => getComputedStyle(el).display), 'none', 'Mobile navigation must remain collapsed')
    assert(await page.getByRole('button', { name: 'Toggle navigation' }).isVisible())
  }

  await trigger.click()
  assert.equal(await trigger.getAttribute('aria-expanded'), 'true')
  assert.deepEqual(await page.locator('.language-picker-options button').allTextContents().then(a=>a.map(x=>x.trim())), ['EN USA', 'PT BR'])
  assert.equal(await page.locator('.language-picker-options [data-flag="US"]').count(), 1)
  assert.equal(await page.locator('.language-picker-options [data-flag="BR"]').count(), 1)
  await page.getByRole('button',{name:'PT BR',exact:true}).click()
  assert.equal(await page.locator('html').getAttribute('lang'), 'pt-BR')
  assert.equal(await trigger.locator('[data-flag]').getAttribute('data-flag'), 'BR')
  assert.equal(await page.locator('.hero-v5-stage-selector button').first().innerText(), 'Rede IA')
  assert.equal(await page.locator('.hero-type-title').getAttribute('aria-label'), 'Engenheiro de IA e Desenvolvimento de Software')
  assert((await page.locator('.hero-description').innerText()).includes('RAG híbrido'))
  assert.equal(await page.locator('.hero-identity-subtitle').innerText(), 'Construindo Soluções Inteligentes.')
  await trigger.click()
  await page.getByRole('button',{name:'EN USA',exact:true}).click()
  assert.equal(await page.locator('html').getAttribute('lang'), 'en-US')
  assert.equal(await page.locator('.hero-v5-stage-selector button').first().innerText(), 'AI Graph')
  await trigger.click()
  await page.keyboard.press('Escape')
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Escape must dismiss language dropdown')
  await trigger.click()
  await page.locator('.hero-description').click({force:true})
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Outside click must dismiss language dropdown')

  const theme = page.locator('.theme-toggle')
  await theme.click()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', 'Manual light theme must work')
  await page.reload()
  await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 20000 })
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', 'Manual light preference must persist')
  assert.equal(await page.locator('html').getAttribute('lang'), 'en-US', 'English preference must persist')
  await theme.click()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')

  const facts = await page.evaluate(() => {
    const tags=[...document.querySelectorAll('.hero-v3-actions .hero-specializations > span')]
    const pillRect=tags.map(x=>x.getBoundingClientRect())
    const group=document.querySelector('.hero-v3-actions .hero-specializations').getBoundingClientRect()
    const copy=document.querySelector('.hero-v3-content').getBoundingClientRect()
    const description=document.querySelector('.hero-description')
    const buttons=[...document.querySelectorAll('.hero-v3-actions .hero-actions .button')]
    const selector=document.querySelector('.hero-v5-stage-selector').getBoundingClientRect()
    return {
      tags: tags.map(x=>x.getAttribute('aria-label')),
      rows: pillRect.map(r=>Math.round(r.top)),
      tagRight: Math.max(...pillRect.map(r=>r.right)),
      tagContainerRight:group.right,
      copyRight:copy.right,
      stageTabsRight:selector.right,
      stageTabsHeight:selector.height,
      stageTabsTop:selector.top,
      descriptionSize:parseFloat(getComputedStyle(description).fontSize),
      buttonSizes:buttons.map(x=>({
        font:parseFloat(getComputedStyle(x).fontSize),
        height:x.getBoundingClientRect().height,
      })),
      viewportWidth:innerWidth,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    }
  })
  assert.deepEqual(facts.tags, ['LLMs & AI Agents','RAG & Hybrid Retrieval','Data & Optimization','Quantum Computing'])
  assert(facts.overflow <= 2, `${width}px: horizontal overflow: ${JSON.stringify(facts)}`)
  if(width >= 901){
    assert(facts.rows.every(row=>row===facts.rows[0]), `${width}px: Desktop tags must share one line: ${JSON.stringify(facts)}`)
    assert(facts.tagRight <= facts.copyRight+2, `${width}px: Desktop tag row exceeds text column: ${JSON.stringify(facts)}`)
  }else{
    const stage=page.locator('.hero-graph-field')
    const stageRect=await rect(stage)
    const selectorRect=await rect(page.locator('.hero-v5-stage-selector'))
    assert(selectorRect.right<=width+1&&selectorRect.right>=width-29,`${width}px: stage tabs should sit at right edge`)
    assert(selectorRect.top-stageRect.top<=7,`${width}px: stage tabs should be raised`)
    assert(selectorRect.height<=48,`${width}px: stage tabs should be compact`)
    await page.locator('.hero-v5-stage-selector button').nth(1).click()
    const codeRect=await rect(page.locator('.hero-v4-code-scene'))
    assert(codeRect.top >= selectorRect.bottom+6,`${width}px: Code scene overlaps the stage tabs`)
    await page.locator('.hero-v5-stage-selector button').nth(2).click()
    const hamletRect=await rect(page.locator('.hero-v4-hamnet-scene'))
    assert(hamletRect.top >= selectorRect.bottom+6,`${width}px: Hamlet AI scene overlaps the stage tabs`)
    assert.equal(await page.locator('.hero-v5-stage-selector button').last().innerText(),'Hamlet AI')
    if(width<=600) {
      assert(facts.descriptionSize<=14.1, `${width}px: Hero paragraph must use compact mobile font`)
      assert(facts.buttonSizes.every(x=>x.font<=12.1&&x.height>=39&&x.height<=50),`${width}px: Hero buttons must be shorter yet touchable`)
    }
  }

  await page.screenshot({path:`test-results/hero-v10-${width}.png`,fullPage:false})
  assert.deepEqual(errors, [], 'Browser runtime error(s)')
  report.tests.push({width, ...facts})
  console.log('PASS Hero V10',width, 'theme: dark','locale: EN USA', 'tagRows:',new Set(facts.rows).size,'tabsHeight:',facts.stageTabsHeight)
  await context.close()
}
try {
  await mkdir('test-results',{recursive:true})
  await ready()
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  for(const [width,height] of [[320,780],[360,800],[390,844],[430,932],[600,950],[768,1024],[900,1000],[901,900],[1024,768],[1440,900]]) {
    await check(width,height)
  }
  console.log('PASS Hero V10 — 10 viewports, flags, defaults, user overrides, single-row desktop and clear mobile stages')
}catch(error) {
  report.errors.push(String(error?.stack||error))
  console.error('FAIL Hero V10',error)
  process.exitCode=1
}finally {
  if(browser) await browser.close()
  try {process.kill(-server.pid,'SIGTERM')}catch{server.kill('SIGTERM')}
  await writeFile('test-results/hero-v10-results.json',JSON.stringify(report,null,2))
}
