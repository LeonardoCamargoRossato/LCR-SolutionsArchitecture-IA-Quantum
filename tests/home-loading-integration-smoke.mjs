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

async function recordCounter(ctx) {
  await ctx.addInitScript(()=>{
    window.__portalCount = []
    const sample=()=>{
      const node=document.querySelector('[data-testid="portal-v2-counter"]')
      if(!node)return
      const value=Number(node.getAttribute('aria-valuenow'))
      if(window.__portalCount.at(-1)?.value!==value)window.__portalCount.push({value,time:performance.now(),
        charge:Number(node.querySelector('[data-testid="portal-v2-charge-fill"]')?.style.getPropertyValue('--charge'))})
    }
    new MutationObserver(sample).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-valuenow']})
    sample()
  })
}
async function assertContinuousCount(page) {
  const counts=await page.evaluate(()=>window.__portalCount)
  assert.deepEqual(counts.map(x=>x.value),Array.from({length:101},(_,i)=>i),'Every integer 0–100 must appear in order')
  assert(counts.every(x=>Math.abs(x.charge-x.value/100)<.001),'Bar follows number')
  const elapsed=counts.at(-1).time-counts[0].time
  assert(elapsed>=1850,'Visible charging must last about 2 seconds: '+elapsed)
  return {elapsed,first:counts[0].time,last:counts.at(-1).time}
}
// Force classic (space-consuming) scrollbars in the browser context where
// supported. Sampling throughout the actual transition detects a transient
// gutter or re-centering, not merely the final stable layout.
async function recordReveal(ctx) {
  await ctx.addInitScript(()=>{
    window.__homeReveal=[]
    const sample=()=>{
      const app=document.querySelector('[data-testid="home-boot-app"]')
      const main=document.querySelector('main.portfolio-home')
      const hero=main?.querySelector('.hero-v3')
      const name=hero?.querySelector('.hero-v3-copy > .eyebrow')
      const title=hero?.querySelector('.hero-type-title')
      const art=hero?.querySelector('.hero-graph-field')
      if(app&&main&&name&&title&&art){
        const rect=name.getBoundingClientRect()
        window.__homeReveal.push({time:performance.now(),phase:app.dataset.homeReveal,
          gutter:innerWidth-document.documentElement.clientWidth,x:rect.x,width:rect.width,
          main:Number(getComputedStyle(main).opacity),art:Number(getComputedStyle(art).opacity),
          name:Number(getComputedStyle(name).opacity),title:Number(getComputedStyle(title.closest('.hero-title-block')).opacity),
          complete:title.dataset.typingComplete==='true',letters:title.querySelector('.hero-type-text').textContent.length,
          inert:app.hasAttribute('inert')})
      }
      if(performance.now()<22000)requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
}
async function assertReveal(page) {
  const frames=await page.evaluate(()=>window.__homeReveal)
  const during=frames.filter(f=>f.phase==='revealing')
  const after=frames.filter(f=>f.phase==='opened')
  assert(during.length>10&&after.length>10,'Sample both opening and post-opening')
  assert(frames.every(f=>Math.abs(f.gutter)<=1),'Document scrollbar must not reserve width at any sampled frame')
  const baseline=frames.find(f=>f.phase==='closed'&&f.width>0)
  assert(baseline,'Capture closed composition geometry')
  assert([...during,...after].every(f=>Math.abs(f.x-baseline.x)<=1&&Math.abs(f.width-baseline.width)<=1),'No horizontal jump during reveal or unlock')
  assert(during.every(f=>f.inert),'Interaction stays locked while door opens')
  assert(after.some(f=>!f.inert),'Interaction is restored')
  assert(during.some(f=>f.main>.05&&f.main<.95&&f.art>.01&&f.art<.99),'Home and right visual fade together during opening')
  assert(during.some(f=>f.name===1&&f.title===1&&f.letters>0&&!f.complete),'Name and typing appear together')
  assert(during.some(f=>f.art>=.99&&!f.complete),'Right visual finishes fading before title')
  const typed=frames.find(f=>f.complete)
  const opened=after[0]
  assert(typed&&typed.time>opened.time+100,'Typing finishes after door opens')
  assert(after.some(f=>f.complete),'Title finishes normally')
  return {maxGutter:Math.max(...frames.map(f=>f.gutter)),maxXShift:Math.max(...frames.map(f=>Math.abs(f.x-baseline.x))),typingAfterOpenMs:typed.time-opened.time}
}
async function initialVisit() {
  const ctx = await context()
  const page = await ctx.newPage()
  const check = await observe(page, 'first-visit')
  await recordCounter(ctx)
  await recordReveal(ctx)
  await page.goto(HOME + '?portal=replay', { waitUntil: 'domcontentloaded' })
  await page.getByTestId('loading-portal-v2').waitFor({ timeout: 18000 })
  await page.getByTestId('portal-v2-counter').waitFor({timeout:15000})
  assert.equal(await page.getByTestId('home-boot-app').getAttribute('aria-hidden'), 'true')
  await page.locator('main.portfolio-home .hero-v3').waitFor({ timeout: 18000 })
  await page.getByTestId('interactive-ai-visual').waitFor()
  assert.equal(await page.locator('main.portfolio-home').getAttribute('data-home-motion'), 'paused')
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-phase'), 'neural')
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-playing'), 'false')
  assert.equal(await page.locator('h1.hero-type-title').getAttribute('data-typing-complete'), 'false')
  assert.equal(await page.locator('.hero-v5-stage-selector button').count(), 3)
  await page.screenshot({ path: 'test-results/home-portal-v2-first-frame.png' })
  // The backing layer must be transparent as the two real leaves depart.
  // Otherwise the doors open to a black rectangle, not the React Home.
  await page.locator('[data-testid="loading-portal-v2"][data-phase="opening"]').waitFor({ timeout: 16000 })
  assert.equal(await page.locator('.home-boot-overlay').evaluate(
    element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)')
  const count=await assertContinuousCount(page)
  await page.waitForTimeout(850)
  const decoration=page.locator('.portal-v2-decoration')
  assert.equal(await decoration.getAttribute('data-inactive'),'true','Invisible illumination must stop')
  assert.equal(await decoration.locator('.pcl-hot').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused, paused')
  const first=await page.locator('.pdo-left').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)
  await page.screenshot({ path: 'test-results/home-portal-v2-door-opening.png' })
  await page.waitForTimeout(650)
  const second=await page.locator('.pdo-left').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)
  assert(first<0 && second<first,'Left leaf moves continuously rather than jumping')
  const right=await page.locator('.pdo-right').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)
  assert(right>0,'Right leaf moves in opposite direction')
  assert.equal(await page.locator('.pdo-left [data-testid="portal-v2-core"]').count(),1)
  await page.screenshot({ path: 'test-results/home-portal-v2-door-midpoint.png' })
  await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({ timeout: 20000 })
  assert.equal(await page.getByTestId('loading-portal-v2').count(), 0)
  await page.locator('h1.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 14000 })
  await page.waitForTimeout(2300)
  assert.equal(await page.locator('main.portfolio-home').getAttribute('data-home-motion'), 'running')
  assert.equal(await page.getByTestId('home-boot-app').getAttribute('aria-hidden'), null)
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-playing'), 'true')
  assert.equal(await page.locator('.hero-graph-field').getAttribute('data-phase'), 'neural')
  await page.waitForFunction(()=>Number(document.querySelector('.hero-v13-particle-wave canvas')?.dataset.renderedFrames)>1)
  assert.equal(await page.getByTestId('home-boot-app').getAttribute('data-boot-outcome'),'mechanical')
  const requested=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/loading-portal/mechanical/')).map(r=>r.name.match(/mechanical\/([^/]+)\//)?.[1]))
  assert.deepEqual([...new Set(requested)],['16x10'],'only matching variant requested on a stable 1440×900 viewport')
  const info = await marks(page)
  const names = info.entries.map(x => x.name)
  for (const name of [
    'portal-mounted', 'home-render-ready', 'home-critical-resources-ready',
    'portal-opening', 'portal-opened', 'home-animation-started', 'portal-mechanical-assets-ready', 'portal-progress-complete', 'home-interactive',
  ]) assert(names.includes(name), 'Missing first-visit mark ' + name)
  assert(info.overflow <= 2, 'Desktop overflow')
  const opening = info.entries.find(x => x.name === 'portal-opening').startTime
  const mounted = info.entries.find(x => x.name === 'home-render-ready').startTime
  const started = info.entries.find(x => x.name === 'home-animation-started').startTime
  assert(opening >= mounted, 'Door opened before actual Home mount')
  const closed=info.entries.find(x=>x.name==='portal-opened').startTime
  assert(started >= opening && started < closed, 'Home animation must begin during the mechanical opening')
  const interactive=info.entries.find(x=>x.name==='home-interactive').startTime
  assert(interactive>=closed,'Interaction remains locked until the portal has opened')
  const reveal=await assertReveal(page)
  report.timings.push({scenario:'synchronized-desktop',...reveal})
  assert(closed-opening>=2900,'Mechanical opening must take about 3 seconds')
  assert(opening-count.last>=140,'100% must remain visible before opening')
  report.timings.push({scenario:'cinematic-desktop',chargeMs:count.elapsed,openingMs:closed-opening,visibleTotalMs:closed-count.first})
  await page.locator('.hero-v3-actions .hero-actions .button').first().click()
  await page.waitForFunction(() => {
    const selected = document.getElementById('projects')
    return selected && selected.getBoundingClientRect().top < window.innerHeight
  }, null, { timeout: 7000 })
  await page.screenshot({ path: 'test-results/home-portal-v2-after-opening.png' })
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
  assert.equal(await page.getByTestId('loading-portal-v2').count(), 0)
  assert.equal(await page.locator('h1.hero-type-title').getAttribute('data-typing-complete'), 'true')
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-phase'), 'neural')
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-playing'), 'false')
  assert.equal(await page.locator('canvas[data-testid="particle-wave-canvas"]').getAttribute('data-motion'), 'reduced')
  assert.equal(await page.locator('.hero-v5-stage-selector button').count(), 3)
  const info = await marks(page)
  assert(info.overflow <= 2, 'Mobile viewport overflow')
  await page.screenshot({ path: 'test-results/home-portal-v2-mobile-reduced.png', fullPage: false })
  report.scenarios.push('mobile 390: reduced-motion fast reveal, 3 scenes, no overflow')
  report.timings.push({ scenario: 'mobile-reduced', ...info.timings, marks: info.entries })
  await ctx.close()
}

async function slowNetwork() {
  const ctx = await context()
  const page = await ctx.newPage()
  let released = false, unblock
  const blocked=new Promise(resolve=>{unblock=resolve})
  const routePattern=/\/assets\/home\/loading-portal\/mechanical\/[^/]+\/door-right\.webp(?:\?.*)?$/
  // Isolate delayed mechanical assets from a cold Vite module graph:
  // initialVisit covers cold navigation; this scenario starts with real
  // mounted Home and no portal assets requested, then explicitly replays.
  await page.goto(HOME+'?portal=skip',{waitUntil:'domcontentloaded'})
  await page.locator('main.portfolio-home').waitFor({state:'attached',timeout:20000})
  await page.getByTestId('interactive-ai-visual').waitFor({state:'attached'})
  await page.route(routePattern, async route => {
    await blocked
    released = true
    try { await route.continue() } catch { /* navigation aborted */ }
  })
  try {
    const request=page.waitForRequest(routePattern,{timeout:12000})
    await page.evaluate(()=>{location.hash='#/?portal=replay'})
    await request
    await page.getByTestId('portal-v2-counter').waitFor({timeout:8000})
    await page.locator('main.portfolio-home').waitFor({state:'attached',timeout:8000})
    const pending=await page.evaluate(()=>({
      phase:document.querySelector('[data-testid="loading-portal-v2"]')?.getAttribute('data-phase'),
      motion:document.querySelector('main.portfolio-home')?.getAttribute('data-home-motion'),
      ready:document.querySelector('[data-testid="loading-portal-v2"]')?.getAttribute('data-real-ready'),
      marks:performance.getEntriesByType('mark').map(e=>e.name),
    }))
    assert.equal(pending.phase,'loading','blocked art keeps door closed: '+JSON.stringify(pending))
    assert.equal(pending.motion,'paused','Home animation must wait for real readiness')
    assert.equal(pending.ready,'false')
    const number=await page.getByTestId('portal-v2-counter').getAttribute('aria-valuenow')
    assert(Number(number)<100,'never show 100 while mechanical resource is pending')
    await page.waitForFunction(()=>document.querySelector('[data-testid="portal-v2-counter"]')?.getAttribute('aria-valuenow')==='99',null,{timeout:8500})
    await page.waitForTimeout(150)
    assert.equal(await page.getByTestId('portal-v2-counter').getAttribute('aria-valuenow'),'99','99 remains held until real readiness')
    assert.equal(await page.getByTestId('loading-portal-v2').getAttribute('data-phase'),'loading')
    unblock()
    await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({ timeout: 22000 })
    assert(released, 'The deferred door image request should actually be resolved')
    assert.equal(await page.getByTestId('home-boot-app').getAttribute('data-boot-outcome'),'mechanical')
    const data = await marks(page)
    const artReady = data.entries.find(e => e.name === 'home-boot:door-art:ok')?.startTime
    const opening = data.entries.find(e => e.name === 'portal-opening')?.startTime
    assert(artReady && opening && opening >= artReady, 'Door started while opening artwork was loading')
    report.scenarios.push('slow resource: door does not open before real artwork decode')
    report.timings.push({ scenario: 'slow-door-art', ...data.timings, marks: data.entries })
  } finally {
    unblock()
    await ctx.close()
  }
}

async function imageFallback() {
  const ctx = await context()
  const page = await ctx.newPage()
  await page.route('**/assets/home/loading-portal/mechanical/*/door-core.webp', route => route.abort('failed'))
  await page.goto(HOME + '?portal=replay', { waitUntil: 'domcontentloaded' })
  await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({ timeout: 20000 })
  assert.equal(await page.locator('main.portfolio-home').count(), 1)
  assert.equal(await page.getByTestId('loading-portal-v2').count(), 0)
  assert.equal(await page.locator('main.portfolio-home').getAttribute('data-home-motion'), 'running')
  assert.equal(await page.getByTestId('home-boot-app').getAttribute('data-boot-outcome'),'fallback')
  const info=await marks(page)
  assert(info.entries.some(e=>e.name==='portal-fallback'))
  assert(!info.entries.some(e=>e.name==='portal-opened'),'fallback is not a mechanical success')
  report.scenarios.push('failed decorative opening asset: safe mounted Home revealed without trapping visitor')
  await ctx.close()
}

async function routeCancellationAndResize(){
  const ctx=await context({viewport:{width:1200,height:900}})
  const page=await ctx.newPage()
  let unblock
  const held=new Promise(resolve=>{unblock=resolve})
  await page.route('**/loading-portal/mechanical/4x3/door-core.webp',async route=>{await held;try{await route.continue()}catch{}})
  await page.goto(HOME+'?portal=replay',{waitUntil:'domcontentloaded'})
  await page.locator('[data-testid="loading-portal-v2"][data-variant="4x3"]').waitFor({timeout:12000})
  await page.setViewportSize({width:390,height:844})
  await page.locator('[data-testid="loading-portal-v2"][data-variant="9x19_5"][data-assets="ready"]').waitFor({timeout:18000})
  await page.locator('[data-testid="loading-portal-v2"][data-phase="opening"]').waitFor({timeout:12000})
  await page.setViewportSize({width:1440,height:900})
  assert.equal(await page.getByTestId('loading-portal-v2').getAttribute('data-variant'),'9x19_5','freeze active variant during mechanical opening')
  unblock()
  await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({timeout:18000})
  await page.evaluate(()=>{location.hash='#/workflow'})
  await page.locator('header.site-header').waitFor()
  assert.equal(await page.getByTestId('home-boot-overlay').count(),0)
  await page.evaluate(()=>{location.hash='#/?portal=skip'})
  await page.locator('main.portfolio-home').waitFor()
  assert.equal(await page.getByTestId('home-boot-overlay').count(),0)
  report.scenarios.push('rotation during loading swaps decoded plane; resize during opening freezes variant; route return respects skip')
  await ctx.close()
}

async function cinematicMobile() {
  const ctx=await context({viewport:{width:390,height:844}})
  await recordCounter(ctx)
  await recordReveal(ctx)
  const page=await ctx.newPage()
  await page.goto(HOME+'?portal=replay',{waitUntil:'domcontentloaded'})
  await page.getByTestId('portal-v2-counter').waitFor({timeout:15000})
  await page.waitForFunction(()=>Number(document.querySelector('[data-testid="portal-v2-counter"]')?.getAttribute('aria-valuenow'))>=45)
  await page.screenshot({path:'test-results/home-portal-v2-mobile-charging.png'})
  await page.locator('[data-testid="loading-portal-v2"][data-phase="opening"]').waitFor({timeout:18000})
  const count=await assertContinuousCount(page)
  await page.waitForTimeout(1400)
  await page.screenshot({path:'test-results/home-portal-v2-mobile-opening.png'})
  await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({timeout:16000})
  const info=await marks(page), get=name=>info.entries.find(e=>e.name===name).startTime
  assert(get('portal-opened')-get('portal-opening')>=2900)
  report.timings.push({scenario:'cinematic-mobile',chargeMs:count.elapsed,openingMs:get('portal-opened')-get('portal-opening')})
  await page.locator('h1.hero-type-title[data-typing-complete="true"]').waitFor({timeout:14000})
  await page.waitForTimeout(1000)
  report.timings.push({scenario:'synchronized-mobile',...await assertReveal(page)})
  await page.evaluate(()=>window.scrollTo({top:600,behavior:'instant'}))
  assert(await page.evaluate(()=>scrollY)>0,'Mobile scroll remains usable after opening')
  await ctx.close()
}

try {
  await mkdir('test-results', { recursive: true })
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await initialVisit()
  await sessionAndRoutes()
  await reducedAndMobile()
  await cinematicMobile()
  await slowNetwork()
  await imageFallback()
  await routeCancellationAndResize()
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
