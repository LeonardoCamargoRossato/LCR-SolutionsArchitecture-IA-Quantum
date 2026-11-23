import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:5191/LCR-SolutionsArchitecture-IA-Quantum/'
const server = spawn('npm', ['run','dev','--','--host','127.0.0.1','--port','5191','--strictPort'], {
  env: process.env, stdio: 'ignore', detached: true,
})
const results = []
const errors = []
let browser
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
async function ready() {
  for (let attempt = 0; attempt < 120; attempt++) {
    try { if ((await fetch(BASE)).ok) return } catch { /* Vite is starting. */ }
    await sleep(250)
  }
  throw Error('Vite server failed to start')
}

async function check(width, height, locale, reduced = true) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    colorScheme: width % 2 ? 'light' : 'dark',
  })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(String(error)))
  await page.addInitScript(({ locale }) => {
    localStorage.setItem('portfolio-locale', locale)
  }, { locale })
  await page.goto(BASE + '#/', { waitUntil: 'domcontentloaded' })
  await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 20000 })
  await page.evaluate(() => document.fonts.ready)
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('.hero-type-title')
    const reserve = h1.querySelector('.hero-type-reserve')
    const rendered = h1.querySelector('.hero-type-text')
    const spanRange = document.createRange()
    spanRange.selectNodeContents(rendered.firstChild)
    const physicalLines = [...spanRange.getClientRects()]
      .filter(rect => rect.width > 1)
      .map(rect => Math.round(rect.top))
    const lines = new Set(physicalLines).size
    const lineHeight = Number.parseFloat(getComputedStyle(h1).lineHeight)
    const reserveLines = Math.round(reserve.getBoundingClientRect().height / lineHeight)
    const chips = document.querySelector('.hero-v3-actions .hero-specializations')
    const visual = document.querySelector('.hero-v3 > .hero-graph-field')
    const buttons = document.querySelector('.hero-v5-stage-selector')
    const chipRect = chips.getBoundingClientRect()
    const visualRect = visual.getBoundingClientRect()
    const tabsRect = buttons.getBoundingClientRect()
    const mobile = window.innerWidth <= 900
    return {
      title: h1.getAttribute('aria-label'),
      fontSize: getComputedStyle(h1).fontSize,
      lines,
      reserveLines,
      gap: Math.round((visualRect.top - chipRect.bottom) * 10) / 10,
      tabsGap: Math.round((tabsRect.top - chipRect.bottom) * 10) / 10,
      visibleWidth: tabsRect.width,
      tabsWithinScreen: tabsRect.left >= -1 && tabsRect.right <= window.innerWidth + 1,
      tags: [...chips.querySelectorAll('span')].map(x => x.textContent.trim()),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      phaseNames: [...buttons.querySelectorAll('button')].map(el => el.textContent.trim()),
      mobile,
      contentLeft: document.querySelector('.hero-v3 .hero-main').getBoundingClientRect().left,
      contentRight: document.querySelector('.hero-v3 .hero-main').getBoundingClientRect().right,
      copyLeft: document.querySelector('.hero-v3-content').getBoundingClientRect().left,
      titleRight: h1.getBoundingClientRect().right,
      paragraphRight: document.querySelector('.hero-description').getBoundingClientRect().right,
      selectorTouchHeight: Math.min(...[...buttons.querySelectorAll('button')].map(el => el.getBoundingClientRect().height)),
    }
  })
  assert.equal(info.title, 'AI Engineering & Software Development')
  assert.deepEqual(info.tags, ['LLMs & AI Agents','RAG & Hybrid Retrieval','Data & Optimization','Quantum Computing'])
  assert.equal(info.tags.includes('Python & Software Engineering'), false, 'Removed skill must not appear')
  assert.equal(info.phaseNames[3], 'Hamlet AI', `${width}px ${locale}: tab must show Hamlet AI`)
  assert.equal(info.phaseNames.length, 4)
  assert(info.overflow <= 2, `${width}px ${locale}: horizontal overflow ${JSON.stringify(info)}`)
  assert(info.tabsWithinScreen, `${width}px ${locale}: tabs clipped ${JSON.stringify(info)}`)
  assert(info.selectorTouchHeight >= 39, 'Stage buttons must remain touch-accessible')
  if (width <= 600) {
    const minGutter = width * .05
    const maxGutter = width * .10
    assert(info.contentLeft >= minGutter-1 && info.contentLeft <= maxGutter+1,
      `${width}px: left gutter must be 5–10%: ${JSON.stringify(info)}`)
    assert(width - info.contentRight >= minGutter-1 && width - info.contentRight <= maxGutter+1,
      `${width}px: right gutter must be 5–10%: ${JSON.stringify(info)}`)
    assert(info.copyLeft >= minGutter-1 && info.titleRight <= width-minGutter+1 &&
      info.paragraphRight <= width-minGutter+1, `${width}px: Hero copy touches the viewport edge: ${JSON.stringify(info)}`)
    assert.equal(info.lines, 2, `${width}px ${locale}: visible typed heading must have exactly 2 lines: ${JSON.stringify(info)}`)
    assert.equal(info.reserveLines, 2, `${width}px ${locale}: reserved title height must have exactly 2 lines: ${JSON.stringify(info)}`)
  }
  if (width <= 900) {
    assert(info.gap >= 44, `${width}px: must have at least one 44px button-height gap before the animation: ${JSON.stringify(info)}`)
    assert(info.tabsGap >= 44, `${width}px: stage tabs should not hug the tags`)
  }
  const fourthStage = page.locator('.hero-v5-stage-selector button').nth(3)
  await fourthStage.click()
  await page.waitForFunction(() => document.querySelector('.hero-graph-field')?.dataset.phase === 'hamnet')
  const name = await page.locator('.hero-v4-hamnet-name').innerText()
  const chatName = await page.locator('.hero-v4-chat-heading strong').innerText()
  const caption = await page.locator('.hero-v4-stage-marker').innerText()
  const greeting = await page.getByTestId('hero-v5-user-message').innerText()
  assert.equal(name, 'Hamlet AI')
  assert.equal(chatName, 'Hamlet AI')
  assert.equal(caption, 'HAMLET AI')
  assert.equal(greeting, 'Hello, Hamlet AI.')
  assert.equal(await fourthStage.getAttribute('aria-pressed'), 'true')
  assert.deepEqual(pageErrors, [], 'Runtime errors detected')
  const nameTag = `hero-v9-${width}-${locale}-${reduced ? 'reduced' : 'animated'}`
  await page.screenshot({ path: `test-results/${nameTag}.png`, fullPage: false })
  results.push({ viewport: width, locale, reduced, ...info, name, chatName, caption })
  console.log('PASS Hero mobile V9', width, locale, 'lines:', info.lines, 'gap:', info.gap, 'label:', name)
  await context.close()
}
try {
  await mkdir('test-results', { recursive: true })
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await check(320, 780, 'pt-BR')
  await check(360, 800, 'en-US')
  await check(390, 844, 'pt-BR')
  await check(390, 844, 'en-US', false)
  await check(430, 932, 'en-US')
  await check(600, 950, 'pt-BR')
  await check(768, 1024, 'en-US')
  await check(1280, 850, 'pt-BR')
  await check(1440, 900, 'en-US')
  console.log('PASS Hero V9: two-line mobile title, button-height spacing, Hamlet AI on desktop/mobile')
} catch (error) {
  errors.push(String(error?.stack || error))
  console.error('FAIL Hero V9', error)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid,'SIGTERM') } catch { server.kill('SIGTERM') }
  await writeFile('test-results/hero-v9-layout-results.json', JSON.stringify({ results, errors }, null, 2))
}
