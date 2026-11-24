import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from './isolation/Browser.mjs'

const BASE = 'http://127.0.0.1:5178/LCR-SolutionsArchitecture-IA-Quantum/'
const LAB = BASE + '#/test-component-lab'
const report = { checks: [], errors: [] }
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5178', '--strictPort'], {
  stdio: 'ignore',
  detached: true,
  env: process.env,
})
let browser
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function ready() {
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(BASE)).ok) return } catch { /* starting */ }
    await delay(250)
  }
  throw new Error('Vite server did not start')
}

async function scenario(name, viewport, options = {}) {
  const context = await browser.newContext({
    viewport,
    colorScheme: options.dark ? 'dark' : 'light',
    reducedMotion: options.reduced ? 'reduce' : 'no-preference',
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const page = await context.newPage()
  const errors = []
  const supabase = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('request', (request) => {
    if (/supabase\.co|supabase\.in/i.test(request.url())) supabase.push(request.url())
  })
  await page.goto(LAB, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-testid="test-component-lab"]').waitFor({ timeout: 14000 })
  const canvas = page.locator('[data-testid="particle-wave-canvas"]')
  await page.waitForFunction(() => document.querySelector('[data-testid="particle-wave-canvas"]')?.dataset.ready === 'true', null, { timeout: 12000 })
  await page.screenshot({ path: `test-results/lab-${name}.png`, fullPage: true })

  const facts = await page.evaluate(() => {
    const canvas = document.querySelector('[data-testid="particle-wave-canvas"]')
    const stage = document.querySelector('[data-testid="lab-preview-stage"]')
    const details = document.querySelector('.lcr-lab-controls-details')
    const data = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data
    let colored = 0
    if (data) for (let i = 3; i < data.length; i += 4 * 33) if (data[i] > 0) colored++
    return {
      title: document.querySelector('h1')?.textContent.trim(),
      noHeader: document.querySelector('.site-header') === null,
      noFooter: document.querySelector('.site-footer') === null,
      noOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
      effectiveParticles: Number(canvas.dataset.effectiveParticles),
      motion: canvas.dataset.motion,
      active: details.open,
      renderedFrames: Number(canvas.dataset.renderedFrames),
      colored,
      stageWidth: stage.getBoundingClientRect().width,
      stageHeight: stage.getBoundingClientRect().height,
    }
  })
  assert.equal(facts.title, 'LCR Test Component Lab')
  assert(facts.noHeader && facts.noFooter, 'Lab must not mount public portfolio shell')
  assert(facts.noOverflow, 'Horizontal overflow detected')
  assert(facts.active && facts.stageWidth >= (viewport.width < 560 ? 210 : 290) && facts.stageHeight >= (viewport.width < 560 ? 115 : 300), 'Preview/controls not visible')
  assert(facts.colored >= 30, 'Particle canvas appears blank')
  assert(facts.effectiveParticles >= 200 && facts.effectiveParticles <= (viewport.width <= 700 ? 1700 : 4200), 'Particle safety cap failed')
  assert.equal(supabase.length, 0, 'Public lab must not make Supabase requests')

  const presetDark = page.getByRole('button', { name: /LCR Dark/ })
  const presetLight = page.getByRole('button', { name: /LCR Light/ })
  const codarox = page.getByRole('button', { name: /Codarox Inspired/ })
  await codarox.click()
  assert.equal(await codarox.getAttribute('aria-pressed'), 'true')
  await presetLight.click()
  assert.equal(await presetLight.getAttribute('aria-pressed'), 'true')
  await presetDark.click()
  assert.equal(await presetDark.getAttribute('aria-pressed'), 'true')
  assert.equal(await page.locator('#lab-amplitude').inputValue(), '1.65')

  await page.locator('#lab-amplitude').focus()
  await page.locator('#lab-amplitude').press('ArrowRight')
  assert.notEqual(await page.locator('#lab-amplitude').inputValue(), '1.65', 'Amplitude must be interactive')
  await page.locator('#lab-mouse').uncheck()
  assert.equal(await page.locator('#lab-mouse').isChecked(), false)
  await page.locator('#lab-particle-color').fill('#ff731f')
  assert.equal(await page.locator('#lab-particle-color').inputValue(), '#ff731f')
  await page.getByTestId('wave-reset').click()
  assert.equal(await page.locator('#lab-amplitude').inputValue(), '1.65', 'Reset must restore the selected preset')
  assert.equal(await page.locator('#lab-particle-color').inputValue(), '#45bfff')
  assert.equal(await page.locator('#lab-mouse').isChecked(), true)

  for (const button of ['Claro', 'Escuro', 'Transparência']) {
    const toggle = page.getByRole('button', { name: button, exact: true })
    await toggle.click()
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true', `Surface ${button} not selected`)
  }
  assert((await page.locator('[data-testid="lab-preview-stage"]').getAttribute('class')).includes('transparent'))
  await page.getByRole('button', { name: 'Escuro', exact: true }).click()

  await page.getByTestId('wave-copy').click()
  await page.getByText('Configuração copiada.').waitFor()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  const parsed = JSON.parse(copied)
  assert.equal(parsed.componentId, 'particle-wave')
  assert.equal(parsed.settings.particleCount, 2700)
  assert.equal(parsed.settings.color, '#45bfff')

  if (!options.reduced) {
    await page.waitForFunction(() => Number(document.querySelector('[data-testid="particle-wave-canvas"]')?.dataset.renderedFrames) >= 18, null, { timeout: 12000 })
    await page.getByTestId('wave-play-pause').click()
    await delay(150)
    const pausedFrames = Number(await canvas.getAttribute('data-rendered-frames'))
    await delay(340)
    assert.equal(Number(await canvas.getAttribute('data-rendered-frames')), pausedFrames, 'Pause must stop rendering')
    assert.equal(await canvas.getAttribute('data-motion'), 'paused')
    await page.getByTestId('wave-play-pause').click()
    assert.equal(await canvas.getAttribute('data-motion'), 'playing')
  } else {
    assert.equal(await canvas.getAttribute('data-motion'), 'reduced', 'Reduced-motion preference must disable animation')
  }

  const details = page.locator('.lcr-lab-controls-details')
  await details.locator('summary').click()
  assert.equal(await details.evaluate((element) => element.open), false, 'Controls should collapse')
  await details.locator('summary').click()
  assert.equal(await details.evaluate((element) => element.open), true, 'Controls should reopen')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('[data-testid="test-component-lab"]').waitFor()
  assert.equal(new URL(page.url()).hash, '#/test-component-lab', 'HashRouter hard reload must preserve route')
  assert.equal(supabase.length, 0, 'Lab must remain independent of Supabase after reload')
  assert.equal(errors.length, 0, 'Browser errors: ' + errors.join(', '))
  report.checks.push({ name, result: 'PASS', viewport, options, facts })
  await context.close()
  console.log('PASS', name, facts)
}

try {
  await mkdir('test-results', { recursive: true })
  await ready()
  browser = await chromium.launch({ headless: true })
  await scenario('desktop-dark', { width: 1440, height: 900 }, { dark: true })
  await scenario('tablet-light', { width: 820, height: 1024 })
  await scenario('mobile-reduced', { width: 390, height: 844 }, { reduced: true })
  const site = await browser.newPage({ viewport: { width: 1280, height: 850 } })
  await site.goto(BASE + '#/', { waitUntil: 'domcontentloaded' })
  await site.locator('.hero-v3').waitFor({ timeout: 14000 })
  assert.equal(await site.locator('header.site-header').count(), 1, 'Main portfolio Header must be preserved')
  assert.equal(await site.locator('[data-testid="test-component-lab"]').count(), 0, 'Lab must not load in Home')
  await site.screenshot({ path: 'test-results/lab-home-regression.png', fullPage: false })
  report.checks.push({ name: 'existing-home', result: 'PASS' })
  await site.close()
  console.log('PASS LCR Test Component Lab, responsive, controls, clipboard, pause, route and Home')
} catch (error) {
  report.errors.push(String(error?.stack || error))
  console.error('FAIL LCR Test Component Lab:', error)
  process.exitCode = 1
} finally {
  await writeFile('test-results/lab-ci-results.json', JSON.stringify(report, null, 2))
  await browser?.close().catch(() => {})
  try { process.kill(-server.pid, 'SIGTERM') } catch { server.kill('SIGTERM') }
}
