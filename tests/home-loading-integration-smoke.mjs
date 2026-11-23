import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:5197/LCR-SolutionsArchitecture-IA-Quantum/'
const HOME = BASE + '#/'
const report = { scenarios: [], errors: [], timings: [] }
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5197', '--strictPort'], {
  env: process.env, stdio: 'ignore', detached: true,
})
let browser
async function ready() {
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(BASE)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw Error('Vite unavailable')
}
async function context(options = {}) {
  return browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
    ...options,
  })
}
async function observe(page, scenario) {
  const errors = []
  const assetFailures = []
  page.on('pageerror', error => errors.push(String(error)))
  page.on('response', response => {
    if (response.status() >= 400 && /assets\/home\/loading-portal/.test(response.url())) {
      assetFailures.push(response.url() + ': ' + response.status())
    }
  })
  return async () => {
    assert.equal(errors.length, 0, scenario + ' page errors: ' + errors)
    assert.equal(assetFailures.length, 0, scenario + ' portal assets 4xx: ' + assetFailures)
  }
}
async function marks(page) {
  return page.evaluate(() => {
    const entries = performance.getEntriesByType('mark')
      .filter(x => /^portal-|^home-/.test(x.name))
      .map(x => ({ name: x.name, startTime: x.startTime }))
    const navigation = performance.getEntriesByType('navigation')[0]
    const resources = performance.getEntriesByType('resource')
    const lcp = performance.getEntriesByType('largest-contentful-paint').at(-1)
    return {
      entries,
      timings: {
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
        lcp: lcp?.startTime ?? null,
        transferSize: resources.reduce((s, r) => s + (r.transferSize || 0), 0),
        domContentLoaded: navigation?.domContentLoadedEventEnd ?? null,
      },
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
}

async function initialVisit() {
  const ctx = await context()
  const page = await ctx.newPage()
  const check = await observe(page, 'first-visit')
  await page.goto(HOME + '?portal=replay', { waitUntil: 'domcontentloaded' })
  await page.getByTestId('loading-portal').waitFor({ timeout: 18000 })
  assert.equal(await page.getByTestId('home-boot-app').getAttribute('aria-hidden'), 'true')
  await page.locator('main.portfolio-home .hero-v3').waitFor({ timeout: 18000 })
  await page.getByTestId('interactive-ai-visual').waitFor()
  assert.equal(await page.locator('main.portfolio-home').getAttribute('data-home-motion'), 'paused')
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-phase'), 'neural')
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-playing'), 'false')
  assert.equal(await page.locator('h1.hero-type-title').getAttribute('data-typing-complete'), 'false')
  assert.equal(await page.locator('.hero-v5-stage-selector button').count(), 3)
  await page.screenshot({ path: 'test-results/home-portal-v1-first-frame.png' })
  // The backing layer must be transparent as the two real leaves depart.
  // Otherwise the doors open to a black rectangle, not the React Home.
  await page.locator('[data-testid="loading-portal"][data-phase="opening"]').waitFor({ timeout: 16000 })
  assert.equal(await page.locator('.home-boot-overlay').evaluate(
    element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)')
  await page.screenshot({ path: 'test-results/home-portal-v1-door-opening.png' })
  await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({ timeout: 20000 })
  assert.equal(await page.getByTestId('loading-portal').count(), 0)
  await page.locator('h1.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 14000 })
  assert.equal(await page.locator('main.portfolio-home').getAttribute('data-home-motion'), 'running')
  assert.equal(await page.getByTestId('home-boot-app').getAttribute('aria-hidden'), null)
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-playing'), 'true')
  assert.equal(await page.locator('.hero-graph-field').getAttribute('data-phase'), 'neural')
  const info = await marks(page)
  const names = info.entries.map(x => x.name)
  for (const name of [
    'portal-mounted', 'home-render-ready', 'home-critical-resources-ready',
    'portal-opening', 'portal-opened', 'home-animation-started',
  ]) assert(names.includes(name), 'Missing first-visit mark ' + name)
  assert(info.overflow <= 2, 'Desktop overflow')
  const opening = info.entries.find(x => x.name === 'portal-opening').startTime
  const mounted = info.entries.find(x => x.name === 'home-render-ready').startTime
  const started = info.entries.find(x => x.name === 'home-animation-started').startTime
  assert(opening >= mounted, 'Door opened before actual Home mount')
  assert(started >= opening, 'Home animation started before door opening')
  await page.locator('.hero-v3-actions .hero-actions .button').first().click()
  await page.waitForFunction(() => {
    const selected = document.getElementById('projects')
    return selected && selected.getBoundingClientRect().top < window.innerHeight
  }, null, { timeout: 7000 })
  await page.screenshot({ path: 'test-results/home-portal-v1-after-opening.png' })
  report.scenarios.push('first visit: actual Home mounted behind portal; start on neural; title and CTA after opening')
  report.timings.push({ scenario: 'first-visit', ...info.timings, marks: info.entries })
  await check()
  await ctx.close()
}

async function sessionAndRoutes() {
  const ctx = await context()
  const page = await ctx.newPage()
  await page.goto(HOME, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('home-boot-overlay').waitFor({ timeout: 8000 })
  await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({ timeout: 20000 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('main.portfolio-home').waitFor({ timeout: 12000 })
  assert.equal(await page.getByTestId('home-boot-overlay').count(), 0, 'No portal repeat during session')
  assert.equal(await page.getByTestId('home-boot-app').getAttribute('data-boot-state'), 'bypassed')
  await page.goto(HOME + 'about', { waitUntil: 'domcontentloaded' })
  await page.locator('header.site-header').waitFor({ timeout: 16000 })
  assert.equal(await page.getByTestId('home-boot-overlay').count(), 0)
  await page.goto(HOME + 'workflow', { waitUntil: 'domcontentloaded' })
  await page.locator('header.site-header').waitFor({ timeout: 16000 })
  assert.equal(await page.getByTestId('home-boot-overlay').count(), 0)
  await page.goto(HOME + 'admin', { waitUntil: 'domcontentloaded' })
  await page.locator('header.site-header').waitFor({ timeout: 16000 })
  assert.equal(await page.getByTestId('home-boot-overlay').count(), 0)
  await page.goto(HOME + 'test-component-lab', { waitUntil: 'domcontentloaded' })
  await page.getByTestId('test-component-lab').waitFor({ timeout: 18000 })
  assert.equal(await page.getByTestId('home-boot-overlay').count(), 0)
  await page.goto(HOME + '?portal=skip', { waitUntil: 'domcontentloaded' })
  await page.locator('main.portfolio-home').waitFor({ timeout: 16000 })
  assert.equal(await page.getByTestId('home-boot-overlay').count(), 0)
  report.scenarios.push('one portal per session, explicit skip, no portal on other routes or Component Lab')
  await ctx.close()
}

async function reducedAndMobile() {
  const ctx = await context({
    viewport: { width: 390, height: 844 }, reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()
  await page.goto(HOME + '?portal=replay', { waitUntil: 'domcontentloaded' })
  await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({ timeout: 20000 })
  assert.equal(await page.getByTestId('loading-portal').count(), 0)
  assert.equal(await page.locator('h1.hero-type-title').getAttribute('data-typing-complete'), 'true')
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-phase'), 'neural')
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-playing'), 'false')
  assert.equal(await page.locator('canvas[data-testid="particle-wave-canvas"]').getAttribute('data-motion'), 'reduced')
  assert.equal(await page.locator('.hero-v5-stage-selector button').count(), 3)
  const info = await marks(page)
  assert(info.overflow <= 2, 'Mobile viewport overflow')
  await page.screenshot({ path: 'test-results/home-portal-v1-mobile-reduced.png', fullPage: false })
  report.scenarios.push('mobile 390: reduced-motion fast reveal, 3 scenes, no overflow')
  report.timings.push({ scenario: 'mobile-reduced', ...info.timings, marks: info.entries })
  await ctx.close()
}

async function slowNetwork() {
  const ctx = await context()
  const page = await ctx.newPage()
  let released = false
  await page.route('**/assets/home/loading-portal/door-open-base.webp', async route => {
    await new Promise(resolve => setTimeout(resolve, 1700))
    released = true
    try { await route.continue() } catch { /* navigation aborted */ }
  })
  await page.goto(HOME + '?portal=replay', { waitUntil: 'domcontentloaded' })
  await page.getByTestId('loading-portal').waitFor({ timeout: 12000 })
  await page.locator('main.portfolio-home').waitFor({ timeout: 16000 })
  assert.equal(await page.locator('main.portfolio-home').getAttribute('data-home-motion'), 'paused')
  await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({ timeout: 22000 })
  assert(released, 'The deferred door image request should actually be resolved')
  const data = await marks(page)
  const artReady = data.entries.find(e => e.name === 'home-boot:door-art:ok')?.startTime
  const opening = data.entries.find(e => e.name === 'portal-opening')?.startTime
  assert(artReady && opening && opening >= artReady, 'Door started while opening artwork was loading')
  report.scenarios.push('slow resource: door does not open before real artwork decode')
  report.timings.push({ scenario: 'slow-door-art', ...data.timings, marks: data.entries })
  await ctx.close()
}

async function imageFallback() {
  const ctx = await context()
  const page = await ctx.newPage()
  await page.route('**/assets/home/loading-portal/lock-core.webp', route => route.abort('failed'))
  await page.goto(HOME + '?portal=replay', { waitUntil: 'domcontentloaded' })
  await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({ timeout: 20000 })
  assert.equal(await page.locator('main.portfolio-home').count(), 1)
  assert.equal(await page.getByTestId('loading-portal').count(), 0)
  assert.equal(await page.locator('main.portfolio-home').getAttribute('data-home-motion'), 'running')
  report.scenarios.push('failed decorative opening asset: safe mounted Home revealed without trapping visitor')
  await ctx.close()
}

try {
  await mkdir('test-results', { recursive: true })
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await initialVisit()
  await sessionAndRoutes()
  await reducedAndMobile()
  await slowNetwork()
  await imageFallback()
  console.log('PASS Loading Portal Home Boot: ' + report.scenarios.join('; '))
} catch (e) {
  report.errors.push(String(e?.stack || e))
  console.error('FAIL Loading Portal Home Boot', e)
  process.exitCode = 1
} finally {
  await browser?.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch { server.kill('SIGTERM') }
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/home-loading-boot-report.json', JSON.stringify(report, null, 2))
}
