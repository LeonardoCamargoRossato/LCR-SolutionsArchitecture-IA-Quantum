import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const DIALOGUE = 'Hamlet AI'
const TAGS = ['LLMs & AI Agents', 'RAG & Hybrid Retrieval', 'Data & Optimization', 'Quantum Computing']
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
  await page.screenshot({ path: 'test-results/hero-v5-' + name + '.png', fullPage: false })
}
async function scenario({ name, width, height, reduced = false, dark = false, allScenes = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    colorScheme: dark ? 'dark' : 'light',
  })
  const page = await context.newPage()
  // The product defaults to dark; explicitly choose the theme for each
  // existing contrast and regression scenario.
  await page.addInitScript(({ dark }) => {
    if (!localStorage.getItem('portfolio-theme')) {
      localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light')
    }
  }, { dark })
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
    const tags = [...document.querySelectorAll('.hero-v3-actions .hero-specializations > span')]
    return {
      title: hero.querySelector('h1')?.getAttribute('aria-label'),
      subtitle: hero.querySelector('.hero-identity-subtitle')?.textContent.trim(),
      description: hero.querySelector('.hero-description')?.textContent.trim(),
      h1count: document.querySelectorAll('h1').length,
      tags: tags.map(x => x.getAttribute('aria-label')),
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
  assert.equal(facts.description, 'I design and build intelligent software, combining AI, data, hybrid RAG, and systems architecture.')
  assert.equal(facts.h1count, 1)
  assert.deepEqual(facts.tags, TAGS)
  assert.deepEqual(facts.actionHrefs, ['#projects', '#contact'])
  assert(facts.desktopEdges >= 90 && facts.mobileEdges >= 55, 'Four neural layers must be densely connected')
  assert(facts.scatterPoints >= 40, 'Scatter scene should span the Hero')
  // V7: the fast static transparent derivative persists BEHIND all four scenes.
  const bg = page.locator('[data-testid="hero-v5-background"]')
  assert.equal(await bg.count(), 1, 'Only one persistent Hero background is allowed')
  const imgStatus = await page.getByTestId('hero-v6-blue-code').evaluate(img => ({
    source: img.getAttribute('src'),
    loaded: img.complete && img.naturalWidth === 1440 && img.naturalHeight === 800,
    fallback: img.dataset.fallback || null,
    opacity: getComputedStyle(img.parentElement).opacity,
    filter: getComputedStyle(img.parentElement).filter,
    objectFit: getComputedStyle(img).objectFit,
  }))
  assert(imgStatus.loaded, 'Theme-specific static SVG background was not loaded')
  assert(imgStatus.source.includes(dark ? 'lcr-hero-blue-code-v7-lite.svg' : 'lcr-hero-blue-code-v8-light-navy.svg'), 'Incorrect theme-specific background SVG')
  assert.equal(imgStatus.fallback, null, 'Unexpected fallback to old background SVG')
  assert.equal(imgStatus.filter, 'none', 'A costly background filter remains enabled')
  assert(Number(imgStatus.opacity) >= .35, 'Animated SVG must remain visible on all themes and viewports')
  assert.equal(imgStatus.objectFit, 'cover', 'SVG must fill Hero without distortion')
  assert.equal(await page.locator('.hero-v5-packet').count(), 0, 'Old sparse binary-packet overlay should be removed')
  const sceneCount = await page.locator('.hero-v4-art .hero-v4-scatter').count()
  assert(sceneCount >= 2, 'Expected distinct mobile/desktop data scenes')
  assert(facts.srWidth <= 1 && facts.srHeight <= 1, 'Screen-reader-only description is visibly leaking at top of Hero')
  assert(facts.pageWidth <= facts.viewportWidth + 2, name + ': page overflow ' + JSON.stringify(facts))
  assert(facts.stageHeight >= 280)
  assert.equal(facts.reduced, reduced ? 'true' : 'false')
  if (width >= 901) {
    assert.equal(facts.desktopVisible, true)
    assert.equal(facts.mobileVisible, false)
    assert.equal(facts.visualPosition, 'absolute')
    assert(facts.visWidth >= facts.heroWidth - 2, 'Desktop art must blend into Hero background')
    assert(facts.tagRows.every(row => row === facts.tagRows[0]), 'All four desktop tags must share ONE line')
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
      // The robot is a genuine accessible replay action, not a fake chatbot.
      const replay = page.getByTestId('hero-v5-hamnet-replay')
      assert(await replay.isVisible())
      const beforeReplay = Number(await page.locator('.hero-v5-hamnet').getAttribute('data-demo-sequence'))
      await replay.click()
      const afterReplay = Number(await page.locator('.hero-v5-hamnet').getAttribute('data-demo-sequence'))
      assert.equal(afterReplay, beforeReplay + 1, 'Robot click must restart message demonstration')
      assert((await page.getByTestId('hero-v5-user-message').innerText()).includes('Hello, Hamlet AI.'))
      assert((await page.getByTestId('hero-v5-assistant-answer').innerText()).includes('Hello!'))
      assert((await page.locator('.hero-v5-chat-footer').innerText()).includes('no live AI connection'))
      await page.waitForTimeout(200)
      await waitPhase(page, 'scatter', 9000)
      assert.equal(await visual.getAttribute('data-phase'), 'scatter', 'The animation must loop back to dispersed data')
    }
  }

  // V5.1: users can navigate the complete data → neural → code → Hamnet story.
  // A manual selection pauses auto-advance until explicitly resumed; reduced
  // motion users retain full access to each static scene.
  const stages = page.getByTestId('hero-v5-stage-selector').locator('button')
  assert.equal(await stages.count(), 4, 'Four accessible manual stage controls required')
  assert.equal(await stages.nth(3).innerText(), 'Hamlet AI', 'Fourth stage must use the approved name in PT/EN')
  await stages.nth(2).click()
  assert.equal(await visual.getAttribute('data-phase'), 'code')
  assert.equal(await visual.getAttribute('data-playing'), 'false', 'Manual selection must pause scene rotation')
  assert.equal(await stages.nth(2).getAttribute('aria-pressed'), 'true')
  await stages.nth(3).click()
  assert.equal(await visual.getAttribute('data-phase'), 'hamnet')
  assert.equal(await page.locator('.hero-v4-chat-heading strong').innerText(), 'Hamlet AI')
  assert.equal(await page.locator('.hero-v4-hamnet-name').innerText(), 'Hamlet AI')
  assert.equal(await page.locator('.hero-v4-stage-marker').innerText(), 'HAMLET AI')
  assert.equal(await stages.nth(3).getAttribute('aria-pressed'), 'true')
  const manualAnswerOpacity = await page.getByTestId('hero-v5-assistant-answer').evaluate(el => Number(getComputedStyle(el).opacity))
  assert(manualAnswerOpacity > .95, 'Manually selected Hamnet must show its conversation without auto-play')
  await stages.nth(1).focus()
  await stages.nth(1).press('Enter')
  assert.equal(await visual.getAttribute('data-phase'), 'neural', 'Keyboard activation should select the neural scene')
  assert.equal(await stages.nth(1).getAttribute('aria-pressed'), 'true')
  if (!reduced) {
    await toggle.click()
    assert.equal(await visual.getAttribute('data-playing'), 'true', 'Play must resume rotation after manual selection')
  }

  await screenshot(page, name + '-original-theme')
  // Switch through the app's persisted preference, not by racing the React
  // ThemeProvider effect with a direct DOM attribute mutation.
  const alternateTheme = dark ? 'light' : 'dark'
  await page.evaluate(mode => localStorage.setItem('portfolio-theme', mode), alternateTheme)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForFunction(mode => document.documentElement.dataset.theme === mode,
    alternateTheme, { timeout: 8000 })
  await page.getByTestId('hero-v6-blue-code').evaluate(img => img.decode())
  const alternateSource = await page.getByTestId('hero-v6-blue-code').getAttribute('src')
  assert(alternateSource.includes(alternateTheme === 'dark'
    ? 'lcr-hero-blue-code-v7-lite.svg' : 'lcr-hero-blue-code-v8-light-navy.svg'),
    'Theme toggle should select the correct static SVG without filtering')
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
  const original = await readFile('public/assets/home/hero/ai-hamnet-robot.svg', 'utf8')
  assert(original.includes('<svg'), 'Original robot must be preserved for migration safety')
  const files = [
    'public/assets/home/hero/ai-hamnet-enterprise-v2.svg',
    'public/assets/home/hero/lcr-data-network-background.svg',
  ]
  for (const file of files) {
    const content = await readFile(file, 'utf8')
    assert(content.includes('<svg') && content.length < 7000, 'Small audited SVG asset: ' + file)
    assert(!/<script\b|<foreignObject\b|onload=|href="https?:/i.test(content), 'Unsafe or remote SVG content in ' + file)
  }
  const approved = await readFile('public/assets/home/hero/lcr-hero-blue-code-v1.svg', 'utf8')
  const source = await readFile('src/components/hero/HeroBackgroundGraph.tsx', 'utf8')
  assert(source.includes('lcr-hero-blue-code-v7-lite.svg'), 'Hero must reference the lightweight SVG derivative')
  assert(approved.startsWith('<svg') && approved.includes('viewBox="0 0 1440 800"'), 'Approved SVG is malformed')
  assert(approved.split('<text ').length > 3000, 'Dense 3D data field was accidentally simplified')
  assert(approved.includes('@media (prefers-reduced-motion:reduce)'), 'Reduced-motion fallback missing from SVG')
  assert(approved.length < 370000, 'Uncompressed SVG larger than expected')
  assert(!['<script', '<foreignObject', 'onload=', '<image', 'xlink:href="http', 'href="http'].some(token => approved.includes(token)), 'Active or remote content inside the SVG')
  const optimized = await readFile('public/assets/home/hero/lcr-hero-blue-code-v7-lite.svg', 'utf8')
  const lightOptimized = await readFile('public/assets/home/hero/lcr-hero-blue-code-v8-light-navy.svg', 'utf8')
  assert(source.includes('lcr-hero-blue-code-v8-light-navy.svg'), 'Theme-aware component must reference the light navy SVG')
  assert(lightOptimized.length < 220000 && lightOptimized.includes('viewBox="0 0 1440 800"'), 'Optimized light SVG budget/viewBox regression')
  assert(lightOptimized.split('<text ').length === optimized.split('<text ').length, 'Light SVG must preserve the exact V7 vector density')
  assert(!lightOptimized.includes('<animateMotion') && !lightOptimized.includes('animation:'), 'Light SVG must stay static')
  assert(!['<script', '<foreignObject', 'onload=', '<image', 'xlink:href="http', 'href="http'].some(token => lightOptimized.includes(token)), 'Unsafe content in light SVG')
  assert(optimized.startsWith('<svg') && optimized.includes('viewBox="0 0 1440 800"'), 'Optimized SVG malformed')
  assert(optimized.length < 220000, 'Lightweight SVG source budget exceeded')
  assert(optimized.split('<text ').length > 1500, 'Data field lost too much visual detail')
  assert(optimized.split('<text ').length < 2000, 'Excessive glyph density returned')
  assert(!optimized.includes('<animateMotion') && !optimized.includes('animation:') && !optimized.includes('rain-column'), 'Per-glyph animations must never return')
  assert(!controller.includes('onBackdropPointerMove'), 'mousemove parallax should not repaint the vector')
  assert(!['<script', '<foreignObject', 'onload=', '<image', 'xlink:href="http', 'href="http'].some(token => optimized.includes(token)), 'Unsafe optimized SVG content')
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
  console.log('PASS Hero V8 — original V7 dark SVG, dark navy light SVG, four tags, 4 scenes, mobile')
} catch (error) {
  report.errors.push(String(error))
  console.error('HERO V5 FAILED:', error)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch {}
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/hero-v5-validation.json', JSON.stringify(report, null, 2))
}
