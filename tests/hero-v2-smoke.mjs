import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const base = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const EXPECTED_DESCRIPTION = 'I design and build intelligent software, combining AI, data, and systems architecture.'
const run = { tests: [], errors: [] }
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
  env: process.env, stdio: 'ignore', detached: true,
})
let browser

async function ready() {
  for (let n = 0; n < 120; n++) {
    try { if ((await fetch(base)).ok) return } catch {}
    await new Promise((resolve) => setTimeout(resolve, 280))
  }
  throw Error('Dev server not ready')
}

async function scenario({ name, width, height, reduced, dark, automatic }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const problems = []
  page.on('pageerror', (err) => problems.push(err.message))
  page.on('console', (message) => { if (message.type() === 'error') problems.push(message.text()) })
  await page.goto(base + '#/', { waitUntil: 'domcontentloaded' })
  await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 16000 })
  await page.locator('.ai-engine[data-state="graph"]').waitFor({ timeout: 12000 })
  const visual = page.locator('[data-testid="interactive-ai-visual"]')
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.hero-identity-subtitle')).opacity) >= .98, null, { timeout: 5500 })

  if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))

  const initial = await page.evaluate(() => {
    const hero = document.querySelector('.hero-v2')
    const copy = document.querySelector('.hero-v2-copy')
    const visual = document.querySelector('.hero-v2-visual')
    const graph = document.querySelector('.ai-engine-scene--graph')
    const stage = document.querySelector('.ai-engine-stage')
    const description = document.querySelector('.hero-description')
    const subtype = document.querySelector('.hero-identity-subtitle')
    const buttons = [...document.querySelectorAll('.hero-v2-bottom .hero-actions a')]
    const gridStyles = getComputedStyle(document.querySelector('.hero-v2-grid'))
    const stageRect = stage.getBoundingClientRect()
    const graphRect = graph.getBoundingClientRect()
    const stageOpacity = Number(getComputedStyle(graph).opacity)
    return {
      heading: document.querySelector('.hero-type-title')?.getAttribute('aria-label'),
      subtitle: subtype?.textContent?.trim(),
      description: description?.textContent?.trim(),
      paragraphCount: copy.querySelectorAll('.hero-description').length,
      heroStatementCount: copy.querySelectorAll('.hero-statement').length,
      h1Count: document.querySelectorAll('h1').length,
      tags: [...document.querySelectorAll('.hero-v2 .hero-specializations span')].map(x => x.textContent),
      buttonLabels: buttons.map(x => x.textContent?.trim()),
      gridColumns: gridStyles.gridTemplateColumns,
      copyRect: { x: copy.getBoundingClientRect().x, y: copy.getBoundingClientRect().y, width: copy.getBoundingClientRect().width },
      visualRect: { x: visual.getBoundingClientRect().x, y: visual.getBoundingClientRect().y, width: visual.getBoundingClientRect().width },
      stageHeight: stageRect.height,
      graphHeight: graphRect.height,
      stageOpacity,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      pageHeight: document.documentElement.scrollHeight,
      heroHeight: hero.getBoundingClientRect().height,
      nodeCount: document.querySelectorAll('.ai-engine-network--desktop .ai-engine-node').length,
      workspaceCode: document.querySelector('.ai-workspace-code')?.textContent,
      reduced: document.querySelector('.ai-engine')?.getAttribute('data-reduced'),
      ready: document.querySelector('.ai-engine')?.getAttribute('data-running'),
    }
  })

  assert.equal(initial.heading, 'AI Engineering & Software Development')
  assert.equal(initial.subtitle, 'Building Intelligent Solutions.')
  assert.equal(initial.description, EXPECTED_DESCRIPTION)
  assert.equal(initial.paragraphCount, 1)
  assert.equal(initial.heroStatementCount, 0, 'Profession tagline is redundant in the new Hero')
  assert.equal(initial.h1Count, 1)
  assert.deepEqual(initial.tags, ['LLMs & AI Agents', 'RAG & Hybrid Retrieval', 'Python & Software Engineering', 'Data & Optimization'])
  assert.equal(initial.buttonLabels.length, 2, 'Must preserve exactly 2 working CTAs')
  assert.equal(initial.nodeCount, 7)
  assert(initial.workspaceCode.includes('classify') && initial.workspaceCode.includes('retrieve') && initial.workspaceCode.includes('reason'))
  assert(initial.stageHeight >= 280, 'Hero visualization must reserve space (CLS)')
  assert(initial.pageWidth <= initial.viewportWidth + 2, 'Unexpected horizontal overflow: '+JSON.stringify(initial))
  if (width >= 901) {
    assert(initial.visualRect.x >= initial.copyRect.x + initial.copyRect.width - 8,
      'Desktop Hero no longer uses two balanced columns: '+JSON.stringify(initial))
  } else {
    assert(initial.visualRect.y > initial.copyRect.y,
      'Mobile/tablet Hero should stack copy, visualization and actions')
  }
  assert.equal(initial.reduced, reduced ? 'true' : 'false')

  const workspace = page.getByRole('button', { name: 'Engineering Workspace', exact: true })
  await workspace.click()
  assert.equal(await visual.getAttribute('data-state'), 'workspace')
  assert.equal(await workspace.getAttribute('aria-pressed'), 'true')
  assert.equal(await visual.getAttribute('data-auto'), 'off', 'Manual click must pause cycle')
  await page.locator('.ai-engine-scene--workspace').waitFor({ state: 'visible' })
  if (!reduced) {
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.ai-engine-scene--workspace')).opacity) >= .98,
      null, { timeout: 2500 })
  }
  const graph = page.getByRole('button', { name: 'AI Systems', exact: true })
  await graph.click()
  assert.equal(await visual.getAttribute('data-state'), 'graph')
  assert.equal(await graph.getAttribute('aria-pressed'), 'true')
  assert.equal(await visual.getAttribute('data-auto'), 'off')

  const reducedMotionCSS = await page.locator('.ai-engine-tracer').first().evaluate(
    (el) => ({ duration: getComputedStyle(el).animationDuration, play: getComputedStyle(el).animationPlayState }),
  )
  if (reduced) {
    assert.equal(reducedMotionCSS.duration, '0s', 'Reduced-motion must disable path animation')
    assert.equal(await visual.getAttribute('data-auto'), 'off')
    assert.equal(await page.locator('.ai-engine-playback').isDisabled(), true)
  } else {
    assert.equal(await page.locator('.ai-engine-playback').isEnabled(), true)
    await page.locator('.ai-engine-playback').click()
    assert.equal(await visual.getAttribute('data-auto'), 'on')
    // Clicking outside the visual removes focus/hover and resumes the timer.
    await page.locator('.hero-v2-copy .hero-type-title').click()
    await page.mouse.move(2, 2)
    await page.waitForFunction(() => document.querySelector('.ai-engine')?.getAttribute('data-running') === 'true',
      null, { timeout: 3300 })
    if (automatic) {
      await page.waitForFunction(() => document.querySelector('.ai-engine')?.getAttribute('data-state') === 'workspace',
        null, { timeout: 9000 })
      await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.ai-engine-scene--workspace')).opacity) > .95,
        null, { timeout: 2200 })
      // Real return from workspace to graph, without running animation JS on each frame.
      await page.waitForFunction(() => document.querySelector('.ai-engine')?.getAttribute('data-state') === 'graph',
        null, { timeout: 9000 })
    }
  }

  // Verify reduced-motion manual switching never triggers CSS animations;
  // verify focusable buttons have accessible names and visible focus styles.
  // Activate keyboard modality first: :focus-visible intentionally does not
  // appear after mouse-only or script-only focus in Chromium.
  await page.keyboard.press('Tab')
  await workspace.focus()
  const focusStyle = await workspace.evaluate((el) => ({
    focused: document.activeElement === el,
    outlineStyle: getComputedStyle(el).outlineStyle,
    outlineWidth: getComputedStyle(el).outlineWidth,
  }))
  assert(focusStyle.focused && focusStyle.outlineStyle !== 'none' && focusStyle.outlineWidth !== '0px',
    'Keyboard focus not visible')
  if (reduced) {
    await workspace.press('Enter')
    assert.equal(await visual.getAttribute('data-state'), 'workspace')
  }
  await graph.click()
  const noOverflows = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    stageRect: document.querySelector('.ai-engine-stage')?.getBoundingClientRect().toJSON(),
    footerRect: document.querySelector('.ai-engine-footer')?.getBoundingClientRect().toJSON(),
  }))
  assert(noOverflows.documentWidth <= noOverflows.viewportWidth + 2,
    name+' overflow after switching: '+JSON.stringify(noOverflows))

  // Check the existing project and contact actions remain unchanged.
  const actions = page.locator('.hero-v2 .hero-actions a')
  assert.deepEqual(await actions.evaluateAll((nodes) => nodes.map((a) => a.getAttribute('href'))), ['#projects', '#contact'])
  await actions.first().click()
  assert(await page.locator('#projects').count(), 'Selected Projects destination missing')
  await page.locator('.hero-v2').scrollIntoViewIfNeeded()

  // Scoped color and theme contract; do not mutate global components.
  const theme = await page.locator('.ai-engine').evaluate(el => ({
    bg: getComputedStyle(el).backgroundColor,
    border: getComputedStyle(el).borderColor,
  }))
  await mkdir('test-results', { recursive: true })
  await page.screenshot({ path: `test-results/hero-v2-${name}.png`, fullPage: false })
  assert.deepEqual(problems, [], 'Browser console / JS errors')
  run.tests.push({ name, result: 'PASS', initial, theme, reducedMotionCSS, noOverflows })
  console.log('PASS', name, JSON.stringify({ width, reduced, dark, stageHeight: initial.stageHeight, autoCycle: automatic, pageWidth: initial.pageWidth }))
  await context.close()
}

async function staticIntegrity() {
  const files = [
    'src/components/hero/AiSystemsGraph.tsx',
    'src/components/hero/EngineeringWorkspace.tsx',
    'src/components/hero/InteractiveAiVisual.tsx',
  ]
  for (const file of files) {
    const src = await readFile(file, 'utf8')
    for (const forbidden of [/\bfetch\s*\(/, /\baxios\b/, /\brequestAnimationFrame\s*\(/, /\bsetInterval\s*\(/, /\bcreateClient\s*\(/]) {
      assert(!forbidden.test(src), 'Unexpected animation network or JS-frame dependency in '+file+': '+forbidden)
    }
  }
  run.tests.push({ name: 'static-integrity', result: 'PASS' })
}

try {
  await staticIntegrity()
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await scenario({ name: 'desktop-light', width: 1440, height: 900, reduced: false, dark: false, automatic: true })
  await scenario({ name: 'notebook-dark', width: 1024, height: 768, reduced: false, dark: true, automatic: false })
  await scenario({ name: 'tablet-light', width: 768, height: 1024, reduced: false, dark: false, automatic: false })
  await scenario({ name: 'mobile-reduced-motion', width: 390, height: 844, reduced: true, dark: false, automatic: false })
  await scenario({ name: 'mobile-dark', width: 360, height: 800, reduced: true, dark: true, automatic: false })
  console.log('PASS Hero V2 — all viewports, both themes, accessibility, manual/auto cycle and preservation')
} catch (error) {
  run.errors.push(String(error))
  console.error('HERO V2 VALIDATION FAILED:', error)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch {}
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/hero-v2-validation.json', JSON.stringify(run, null, 2))
}
