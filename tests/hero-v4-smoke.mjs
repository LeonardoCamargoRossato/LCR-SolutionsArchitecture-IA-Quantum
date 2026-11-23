import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const DIALOGUE = 'AI Hamnet'
const TAGS = ['LLMs & AI Agents', 'RAG & Hybrid Retrieval', 'Python & Software Engineering', 'Data & Optimization']
const report = { checks: [], errors: [] }
const server = spawn('npm', ['run','dev','--','--host','127.0.0.1','--port','5173','--strictPort'], {
  env: process.env, detached: true, stdio: 'ignore',
})
let browser

async function ready() {
  for (let i = 0; i < 115; i++) {
    try { if ((await fetch(BASE)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 280))
  }
  throw Error('Vite dev server not ready')
}
async function waitPhase(page, phase, timeout = 11000) {
  await page.waitForFunction(next => document.querySelector('.hero-graph-field')?.getAttribute('data-phase') === next, phase, { timeout })
}
async function screenshot(page, name) {
  await mkdir('test-results', { recursive: true })
  await page.screenshot({ path: 'test-results/hero-v4-' + name + '.png', fullPage: false })
}
async function scenario({ name, width, height, reduced = false, dark = false, allScenes = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    colorScheme: dark ? 'dark' : 'light',
  })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', e => pageErrors.push(String(e)))
  await page.goto(BASE + '#/', { waitUntil: 'domcontentloaded' })
  await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 16000 })
  const hero = page.locator('.hero-v3')
  const visual = page.locator('.hero-graph-field')
  await visual.waitFor({ state: 'attached' })
  await page.waitForFunction(theme => document.documentElement.dataset.theme === theme,
    dark ? 'dark' : 'light', { timeout: 4500 })
  await hero.scrollIntoViewIfNeeded()
  const facts = await page.evaluate(() => {
    const hero = document.querySelector('.hero-v3')
    const vis = document.querySelector('.hero-graph-field')
    const actions = document.querySelector('.hero-v3-actions')
    const sc = document.querySelector('.hero-v4-desktop')
    const sm = document.querySelector('.hero-v4-mobile')
    const hidden = document.querySelector('.hero-v4-visually-hidden')
    const tags = [...document.querySelectorAll('.hero-v3-actions .hero-specializations span')]
    return {
      title: hero.querySelector('h1')?.getAttribute('aria-label'),
      subtitle: hero.querySelector('.hero-identity-subtitle')?.textContent.trim(),
      description: hero.querySelector('.hero-description')?.textContent.trim(),
      h1count: document.querySelectorAll('h1').length,
      tags: tags.map(x => x.textContent.trim()),
      tagRows: tags.map(x => Math.round(x.getBoundingClientRect().top)),
      actionHrefs: [...hero.querySelectorAll('.hero-actions a')].map(x => x.getAttribute('href')),
      visualPosition: getComputedStyle(vis).position,
      visualTop: vis.getBoundingClientRect().top,
      actionsBottom: actions.getBoundingClientRect().bottom,
      visWidth: vis.getBoundingClientRect().width,
      heroWidth: hero.getBoundingClientRect().width,
      desktopVisible: getComputedStyle(sc).display !== 'none',
      mobileVisible: getComputedStyle(sm).display !== 'none',
      desktopEdges: document.querySelectorAll('.hero-v4-desktop .hero-v4-neural-edges line').length,
      mobileEdges: document.querySelectorAll('.hero-v4-mobile .hero-v4-neural-edges line').length,
      scatterPoints: document.querySelectorAll('.hero-v4-desktop .hero-v4-data-point').length,
      srHeight: hidden.getBoundingClientRect().height,
      srWidth: hidden.getBoundingClientRect().width,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      phase: vis.dataset.phase,
      reduced: vis.dataset.reduced,
      background: getComputedStyle(hero).backgroundColor,
      stageHeight: vis.getBoundingClientRect().height,
    }
  })
  assert.equal(facts.title, 'AI Engineering & Software Development')
  assert.equal(facts.subtitle, 'Building Intelligent Solutions.')
  assert.equal(facts.description, 'I design and build intelligent software, combining AI, data, and systems architecture.')
  assert.equal(facts.h1count, 1)
  assert.deepEqual(facts.tags, TAGS)
  assert.deepEqual(facts.actionHrefs, ['#projects', '#contact'])
  assert(facts.desktopEdges >= 90 && facts.mobileEdges >= 55, 'Four neural layers must be densely connected')
  assert(facts.scatterPoints >= 40, 'Scatter scene should span the Hero')
  assert(facts.srWidth <= 1 && facts.srHeight <= 1, 'Screen-reader-only description is visibly leaking at top of Hero')
  assert(facts.pageWidth <= facts.viewportWidth + 2, name + ': page overflow ' + JSON.stringify(facts))
  assert(facts.stageHeight >= 280)
  assert.equal(facts.reduced, reduced ? 'true' : 'false')
  if (width >= 901) {
    assert.equal(facts.desktopVisible, true)
    assert.equal(facts.mobileVisible, false)
    assert.equal(facts.visualPosition, 'absolute')
    assert(facts.visWidth >= facts.heroWidth - 2, 'Desktop art must blend into Hero background')
    assert(facts.tagRows[0] === facts.tagRows[1] && facts.tagRows[1] === facts.tagRows[2], 'First 3 tags must share first line')
    assert(facts.tagRows[3] > facts.tagRows[2], 'Fourth tag must occupy an uncluttered second line')
  } else {
    assert.equal(facts.mobileVisible, true)
    assert.equal(facts.desktopVisible, false)
    assert.equal(facts.visualPosition, 'relative')
    assert(facts.visualTop >= facts.actionsBottom - 4, 'Buttons and tags must precede mobile art')
  }

  const toggle = page.locator('.hero-graph-motion-control')
  const rect = await toggle.boundingBox()
  assert(rect && rect.width >= 44 && rect.height >= 44, 'Pause button requires 44px touch target')

  if (reduced) {
    assert.equal(facts.phase, 'neural')
    assert.equal(await visual.getAttribute('data-playing'), 'false')
    assert(await toggle.isDisabled())
    const motion = await page.locator('.hero-v4-depth-front').first().evaluate(x => getComputedStyle(x).animationDuration)
    assert.equal(motion, '0s')
    assert.equal(await page.locator('.hero-v4-neural-depth').first().evaluate(x => Number(getComputedStyle(x).opacity)), 1)
  } else {
    await visual.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => document.querySelector('.hero-graph-field')?.dataset.playing === 'true', null, { timeout: 4000 })
    await waitPhase(page, 'neural', 7500)

    if (width >= 901) {
      const drag = page.locator('[data-testid="hero-v4-drag-target"]')
      const target = await drag.boundingBox()
      assert(target)
      const center = { x: target.x + target.width * .5, y: target.y + target.height * .5 }
      await page.mouse.move(center.x, center.y)
      await page.mouse.down()
      await page.mouse.move(center.x + 145, center.y - 42, { steps: 5 })
      assert.equal(await visual.getAttribute('data-dragging'), 'true', 'Pointer capture did not begin')
      await page.waitForFunction(() => Math.abs(parseFloat(document.querySelector('.hero-graph-field').style.getPropertyValue('--neural-tilt-y'))) > 6,
        null, { timeout: 3000 })
      await page.mouse.up()
      assert.equal(await visual.getAttribute('data-dragging'), 'false')
      await drag.focus()
      const yaw = await visual.evaluate(x => x.style.getPropertyValue('--neural-tilt-y'))
      await drag.press('ArrowLeft')
      await page.waitForFunction(old => document.querySelector('.hero-graph-field').style.getPropertyValue('--neural-tilt-y') !== old,
        yaw, { timeout: 2800 })
    }

    await toggle.click()
    assert.equal(await visual.getAttribute('data-playing'), 'false')
    const pausedAnimation = await page.locator('.hero-v4-data-point').first().evaluate(x => getComputedStyle(x).animationPlayState)
    assert.equal(pausedAnimation, 'paused')
    await toggle.click()
    assert.equal(await visual.getAttribute('data-playing'), 'true')
    if (allScenes) {
      await screenshot(page, name + '-neural')
      await waitPhase(page, 'code', 14000)
      await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.hero-v4-code-scene')).opacity) > .95, null, { timeout: 3000 })
      assert((await page.locator('.hero-v4-code-scene').innerText()).includes('intelligence.pipeline.ts'))
      assert((await page.locator('.hero-v4-code-scene').innerText()).includes('neuralNetwork'))
      await screenshot(page, name + '-code')
      await waitPhase(page, 'hamnet', 8500)
      await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.hero-v4-hamnet-scene')).opacity) > .95, null, { timeout: 3200 })
      await page.waitForTimeout(1150)
      assert((await page.locator('.hero-v4-hamnet-scene').innerText()).includes(DIALOGUE))
      assert((await page.locator('.hero-v4-hamnet-scene').innerText()).includes('Hello!'))
      const image = await page.locator('.hero-v4-bot-art').evaluate(el => ({
        loaded: el.complete && el.naturalWidth > 0,
        width: el.naturalWidth,
      }))
      assert(image.loaded, 'Original SVG asset must load')
      await screenshot(page, name + '-hamnet')
      await waitPhase(page, 'scatter', 9000)
      assert.equal(await visual.getAttribute('data-phase'), 'scatter', 'The animation must loop back to dispersed data')
    }
  }

  await screenshot(page, name + '-original-theme')
  // Switch through the app's persisted preference, not by racing the React
  // ThemeProvider effect with a direct DOM attribute mutation.
  const alternateTheme = dark ? 'light' : 'dark'
  await page.evaluate(mode => localStorage.setItem('portfolio-theme', mode), alternateTheme)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForFunction(mode => document.documentElement.dataset.theme === mode,
    alternateTheme, { timeout: 8000 })
  const newBackground = await page.locator('.hero-v3').evaluate(el => getComputedStyle(el).backgroundColor)
  assert.notEqual(newBackground, facts.background, 'Theme preference did not change Hero background')

  await screenshot(page, name + '-final')
  assert.deepEqual(pageErrors, [], name + ': runtime errors')
  report.checks.push({ name, result: 'PASS', viewport: width, reduced, dark, facts })
  console.log('PASS', name, 'stages / accessibility / mobile / theme / responsive')
  await context.close()
}

async function sourceAudit() {
  const sourceFiles = ['AiSystemsGraph.tsx','EngineeringWorkspace.tsx','InteractiveAiVisual.tsx']
  for (const file of sourceFiles) {
    const src = await readFile('src/components/hero/' + file, 'utf8')
    for (const forbidden of [/\bfetch\s*\(/, /\bsetInterval\s*\(/, /\bcreateClient\s*\(/, /\bWebGL\b/, /\.getContext\s*\(/]) {
      assert(!forbidden.test(src), 'Unexpected data or heavy animation dependency in ' + file)
    }
  }
  const controller = await readFile('src/components/hero/InteractiveAiVisual.tsx','utf8')
  assert(controller.includes('IntersectionObserver') && controller.includes('cancelAnimationFrame'), 'Visibility/RAF cleanup missing')
  const file = await readFile('public/assets/home/hero/ai-hamnet-robot.svg', 'utf8')
  assert(file.includes('<svg') && file.length < 3500)
  report.checks.push({ name: 'static-security-and-performance', result: 'PASS' })
}

try {
  await sourceAudit()
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await scenario({ name: 'desktop-1440-light', width: 1440, height: 900, allScenes: true })
  await scenario({ name: 'notebook-1024-dark', width: 1024, height: 768, dark: true })
  await scenario({ name: 'tablet-768-light', width: 768, height: 1024 })
  await scenario({ name: 'mobile-390-reduced', width: 390, height: 844, reduced: true })
  await scenario({ name: 'mobile-360-dark', width: 360, height: 800, dark: true, reduced: true })
  console.log('PASS Hero V4 complete (responsive, 2.5D, code, AI Hamnet, contrast, reduced motion, no overflow)')
} catch (error) {
  report.errors.push(String(error))
  console.error('HERO V4 FAILED:', error)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch {}
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/hero-v4-validation.json', JSON.stringify(report, null, 2))
}
