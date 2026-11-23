import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const DESCRIPTION = 'I design and build intelligent software, combining AI, data, and systems architecture.'
const TAGS = ['LLMs & AI Agents', 'RAG & Hybrid Retrieval', 'Python & Software Engineering', 'Data & Optimization', 'Quantum Computing']
const results = { tests: [], errors: [] }
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
  env: process.env, detached: true, stdio: 'ignore',
})
let browser

async function serverReady() {
  for (let i = 0; i < 110; i++) {
    try { if ((await fetch(BASE)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  throw Error('Vite server not ready')
}

async function checkScene({ label, width, height, reduced = false, dark = false, cycle = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(BASE + '#/', { waitUntil: 'domcontentloaded' })
  await page.locator('.hero-v3 .hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 18000 })
  const graph = page.locator('.hero-graph-field')
  await graph.waitFor({ state: 'attached', timeout: 10000 })
  if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
  await page.locator('.hero-v3').scrollIntoViewIfNeeded()
  await page.waitForTimeout(350)

  const metrics = await page.evaluate(() => {
    const hero = document.querySelector('.hero-v3')
    const graph = document.querySelector('.hero-graph-field')
    const art = document.querySelector('.hero-graph-visual')
    const content = document.querySelector('.hero-v3-content')
    const actions = document.querySelector('.hero-v3-actions')
    const css = getComputedStyle(hero)
    return {
      heading: document.querySelector('.hero-v3 .hero-type-title')?.getAttribute('aria-label'),
      subtitle: document.querySelector('.hero-v3 .hero-identity-subtitle')?.textContent?.trim(),
      description: document.querySelector('.hero-v3 .hero-description')?.textContent?.trim(),
      h1Count: document.querySelectorAll('h1').length,
      descriptionCount: hero.querySelectorAll('.hero-description').length,
      tags: [...hero.querySelectorAll('.hero-specializations span')].map(el => el.textContent?.trim()),
      legacyDashboardCount: hero.querySelectorAll('.ai-engine, .ai-workspace, .ai-engine-tabs').length,
      svgDesktop: document.querySelectorAll('.hero-living-svg--desktop .hero-network-vertex').length,
      svgMobile: document.querySelectorAll('.hero-living-svg--mobile .hero-network-vertex').length,
      streamsDesktop: document.querySelectorAll('.hero-living-svg--desktop .hero-network-ray').length,
      streamsMobile: document.querySelectorAll('.hero-living-svg--mobile .hero-network-ray').length,
      desktopVisible: getComputedStyle(document.querySelector('.hero-living-svg--desktop')).display !== 'none',
      mobileVisible: getComputedStyle(document.querySelector('.hero-living-svg--mobile')).display !== 'none',
      artIsRelative: getComputedStyle(graph).position === 'relative',
      actionsBottom: actions.getBoundingClientRect().bottom,
      graphTop: graph.getBoundingClientRect().top,
      graphWidth: graph.getBoundingClientRect().width,
      heroWidth: hero.getBoundingClientRect().width,
      contentWidth: content.getBoundingClientRect().width,
      background: css.backgroundColor,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      stageHeight: graph.getBoundingClientRect().height,
      reduced: graph.getAttribute('data-reduced'),
      svgAnimated: getComputedStyle(document.querySelector('.hero-network-traveler')).animationDuration,
      resolutionAvailable: !!document.querySelector('.hero-graph-resolution'),
      visualMask: getComputedStyle(art).maskImage,
    }
  })

  assert.equal(metrics.heading, 'AI Engineering & Software Development')
  assert.equal(metrics.subtitle, 'Building Intelligent Solutions.')
  assert.equal(metrics.description, DESCRIPTION)
  assert.equal(metrics.descriptionCount, 1)
  assert.equal(metrics.h1Count, 1)
  assert.deepEqual(metrics.tags, TAGS)
  assert.equal(metrics.legacyDashboardCount, 0, label + ': former boxed UI still present')
  assert(metrics.svgDesktop >= 60 && metrics.streamsDesktop >= 15, label + ': desktop graph is too sparse')
  assert(metrics.svgMobile >= 15 && metrics.streamsMobile >= 7, label + ': mobile graph missing dedicated art')
  assert.equal(metrics.resolutionAvailable, true)
  assert(metrics.pageWidth <= metrics.viewportWidth + 2, label + ': horizontal overflow ' + JSON.stringify(metrics))
  assert.equal(metrics.reduced, reduced ? 'true' : 'false')
  assert(metrics.stageHeight >= 280, label + ': graph must reserve layout height')

  const actionLinks = await page.locator('.hero-v3 .hero-actions a').evaluateAll(els => els.map(el => el.getAttribute('href')))
  assert.deepEqual(actionLinks, ['#projects', '#contact'])
  if (width >= 901) {
    assert.equal(metrics.artIsRelative, false, label + ': desktop artwork should merge into Hero background')
    assert(metrics.graphWidth >= metrics.heroWidth - 2, label + ': graph fails to span Hero')
    assert(metrics.contentWidth < metrics.heroWidth * 0.59, label + ': text column too wide')
    assert.equal(metrics.desktopVisible, true)
    assert.equal(metrics.mobileVisible, false)
  } else {
    assert.equal(metrics.artIsRelative, true, label + ': mobile graphic should follow content')
    assert(metrics.graphTop >= metrics.actionsBottom - 4, label + ': buttons and tags must precede mobile graph')
    assert.equal(metrics.mobileVisible, true)
    assert.equal(metrics.desktopVisible, false)
  }

  const pause = page.locator('.hero-graph-motion-control')
  assert.equal(await pause.count(), 1)
  const size = await pause.boundingBox()
  assert(size && size.width >= 44 && size.height >= 44, label + ': pause touch target less than 44px')

  if (reduced) {
    assert.equal(await graph.getAttribute('data-playing'), 'false')
    assert.equal(await pause.isDisabled(), true)
    assert.equal(metrics.svgAnimated, '0s')
    assert.equal(await page.locator('.hero-graph-resolution').isVisible(), false)
  } else {
    // Offscreen observer may suspend until the graph itself enters view.
    await graph.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => document.querySelector('.hero-graph-field')?.getAttribute('data-playing') === 'true',
      null, { timeout: 3800 })
    assert.equal(await pause.isEnabled(), true)
    await pause.click()
    assert.equal(await graph.getAttribute('data-playing'), 'false')
    const pausedState = await page.locator('.hero-network-traveler').first().evaluate(el => getComputedStyle(el).animationPlayState)
    assert.equal(pausedState, 'paused')
    await pause.click()
    assert.equal(await graph.getAttribute('data-playing'), 'true')

    if (width >= 901) {
      // Parallax responds to pointer movement WITHOUT a continuous JS loop.
      const rect = await graph.boundingBox()
      await page.mouse.move(rect.x + rect.width * .84, rect.y + rect.height * .5)
      await page.waitForFunction(() => Math.abs(parseFloat(document.querySelector('.hero-graph-field').style.getPropertyValue('--hero-shift-front-x'))) > 0.1,
        null, { timeout: 2600 })
    }

    if (cycle) {
      // The convergence truly resolves into the technical trace, then fades.
      await page.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector('.hero-graph-resolution')).opacity) > .68,
        null, { timeout: 18500 })
      const resolveState = await page.locator('.hero-graph-resolution').evaluate(el => ({
        opacity: parseFloat(getComputedStyle(el).opacity),
        caption: el.textContent?.includes('DATA → INTELLIGENCE'),
      }))
      assert(resolveState.caption && resolveState.opacity > .68, 'Convergence never revealed its engineering outcome')
    }
  }

  const oldColor = metrics.background
  await page.evaluate((nextTheme) => document.documentElement.setAttribute('data-theme', nextTheme), dark ? 'light' : 'dark')
  const secondColor = await page.locator('.hero-v3').evaluate(el => getComputedStyle(el).backgroundColor)
  assert.notEqual(secondColor, oldColor, label + ': dark/light Hero not changing colors')

  await page.locator('.hero-v3').scrollIntoViewIfNeeded()
  await mkdir('test-results', { recursive: true })
  await page.screenshot({ path: 'test-results/hero-v3-' + label + '.png', fullPage: false })
  assert.deepEqual(errors, [], label + ': page errors')
  results.tests.push({ label, result: 'PASS', metrics, sourceRequests: 'No new image or script dependencies' })
  console.log('PASS', label, JSON.stringify({
    viewport: width,
    desktopNodes: metrics.svgDesktop,
    mobileNodes: metrics.svgMobile,
    reduced,
    dark,
    responsive: true,
  }))
  await context.close()
}

async function staticAudit() {
  const filenames = ['src/components/hero/AiSystemsGraph.tsx', 'src/components/hero/EngineeringWorkspace.tsx', 'src/components/hero/InteractiveAiVisual.tsx']
  for (const path of filenames) {
    const contents = await readFile(path, 'utf8')
    for (const forbidden of [/\bfetch\s*\(/, /\bsetInterval\s*\(/, /\bcreateClient\s*\(/, /\bWebGL\b/, /\bcanvas\.getContext\s*\(/]) {
      assert(!forbidden.test(contents), 'Unexpected external / per-frame engine dependency in ' + path)
    }
  }
  const controller = await readFile('src/components/hero/InteractiveAiVisual.tsx', 'utf8')
  assert(controller.includes('IntersectionObserver') && controller.includes('prefers-reduced-motion') && controller.includes('cancelAnimationFrame'),
    'Missing performance or reduced-motion lifecycle controls')
  results.tests.push({ label: 'source-performance-and-security', result: 'PASS' })
}

try {
  await staticAudit()
  await serverReady()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await checkScene({ label: 'desktop-light', width: 1440, height: 900, cycle: true })
  await checkScene({ label: 'notebook-dark', width: 1024, height: 768, dark: true })
  await checkScene({ label: 'tablet-light', width: 768, height: 1024 })
  await checkScene({ label: 'mobile-reduced', width: 390, height: 844, reduced: true })
  await checkScene({ label: 'mobile-dark', width: 360, height: 800, dark: true, reduced: true })
  console.log('PASS Hero V3 — 5 viewports, theme switch, light SVG, touch, motion and convergent sequence')
} catch (error) {
  results.errors.push(String(error))
  console.error('HERO V3 FAILED:', error)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch {}
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/hero-v3-validation.json', JSON.stringify(results, null, 2))
}
