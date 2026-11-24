import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from './isolation/Browser.mjs'

const BASE = 'http://127.0.0.1:5196/LCR-SolutionsArchitecture-IA-Quantum/'
const report = { scenes: [], errors: [] }
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5196', '--strictPort'], {
  env: process.env, detached: true, stdio: 'ignore',
})
let browser

async function ready() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(BASE)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  throw Error('Vite did not start for Hero V13')
}

async function verifyScene(name, width, height, theme, reduced) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme: theme,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(String(error)))
  await page.addInitScript(current => {
    localStorage.setItem('portfolio-theme', current)
    localStorage.setItem('portfolio-locale', 'en-US')
  }, theme)
  await page.goto(BASE + '#/?portal=skip', { waitUntil: 'domcontentloaded' })
  await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 18000 })
  const wave = page.getByTestId('hero-v13-particle-wave')
  const canvas = page.getByTestId('particle-wave-canvas')
  await page.waitForFunction(() => document.querySelector('.hero-v13-particle-wave canvas')?.dataset.ready === 'true',
    null, { timeout: 15000 })
  await page.getByTestId('hero-v6-blue-code').evaluate(img => img.decode())

  assert.equal(await wave.count(), 1, 'Home must contain exactly one particle field')
  assert.equal(await canvas.count(), 1, 'Only one Canvas 2D renderer should be mounted')
  assert.equal(await wave.getAttribute('aria-hidden'), 'true', 'Decorative wave must not add a duplicate screen-reader image')
  assert.equal(await wave.getAttribute('data-component-source'), 'lcr-test-component-lab-v2')
  assert.equal(await canvas.getAttribute('data-effective-particles'), '900', 'Particle count must match exported composition')
  assert.equal(await page.locator('.hero-v5-stage-selector button').count(), 3, 'V12 scene selector must remain intact')
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-phase'), 'neural')
  assert.equal(await page.getByTestId('hero-v5-background').count(), 1, 'Approved original Hero SVG background remains mounted')

  const info = await page.evaluate(() => {
    const stage = document.querySelector('.hero-graph-field')
    const wave = document.querySelector('.hero-v13-particle-wave')
    const canvas = wave.querySelector('canvas')
    const graph = document.querySelector('.hero-v4-art')
    const copy = document.querySelector('.hero-v3-layout')
    const r = element => element.getBoundingClientRect()
    const stageRect = r(stage), waveRect = r(wave)
    const button = document.querySelector('.hero-v3-actions .hero-actions .button')
    const buttonRect = r(button)
    const hit = document.elementFromPoint(buttonRect.x + buttonRect.width / 2,
      buttonRect.y + buttonRect.height / 2)
    const image = document.querySelector('[data-testid="hero-v6-blue-code"]')
    const ctx = canvas.getContext('2d')
    let lit = 0
    if (ctx) {
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] !== 0 && ++lit >= 100) break
      }
    }
    return {
      stageWidth: stageRect.width, stageHeight: stageRect.height,
      waveLeft: (waveRect.left - stageRect.left) / stageRect.width,
      waveTop: (waveRect.top - stageRect.top) / stageRect.height,
      waveWidth: waveRect.width / stageRect.width,
      waveHeight: waveRect.height / stageRect.height,
      waveTransform: getComputedStyle(wave).transform,
      waveOpacity: Number(getComputedStyle(wave).opacity),
      pointerEvents: getComputedStyle(wave).pointerEvents,
      waveZ: Number(getComputedStyle(wave).zIndex),
      graphZ: Number(getComputedStyle(graph).zIndex),
      copyZ: Number(getComputedStyle(copy).zIndex),
      canvasMotion: canvas.dataset.motion,
      canvasWidth: canvas.width, canvasHeight: canvas.height,
      lit, buttonClickable: !!hit && (button === hit || button.contains(hit)),
      backgroundSrc: image.getAttribute('src'),
      backgroundLoaded: image.complete && image.naturalWidth > 0,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      screenshotRequested: performance.getEntriesByType('resource').some(x =>
        /background-original[.]png|lcr-composition-preview/i.test(x.name)),
    }
  })
  const near = (actual, expected, tolerance, message) =>
    assert(Math.abs(actual - expected) <= tolerance, message + ' actual=' + actual + ', expected=' + expected)
  // The original 1600x900 transform is expressed as CSS percentages, so the
  // reference spatial composition survives responsive sizing (including flipX).
  near(info.waveLeft, -25.15489467162331 / 1600, .003, name + ': incorrect wave x')
  near(info.waveTop, -100.24783147459728 / 900, .003, name + ': incorrect wave y')
  near(info.waveWidth, 1773.2342007434943 / 1600, .004, name + ': incorrect wave width')
  near(info.waveHeight, 997.2242874845106 / 900, .004, name + ': incorrect wave height')
  assert(info.waveTransform.startsWith('matrix(-1, 0, 0, 1'),
    name + ': only wave must be mirrored horizontally, never the entire Hero')
  assert(info.canvasWidth > 100 && info.canvasHeight > 100 && info.lit >= 100,
    name + ': real Canvas frame must render alpha-blended particles')
  assert(info.backgroundLoaded && /lcr-hero-blue-code-v(7|8)-/.test(info.backgroundSrc),
    name + ': original V7/V8 optimized SVG background must load')
  assert.equal(info.screenshotRequested, false, 'Do not publish or request the Lab preview screenshot as site background')
  assert.equal(info.buttonClickable, true, name + ': Canvas must not cover live CTAs')
  assert(info.waveZ < info.graphZ && info.graphZ < info.copyZ, name + ': invalid layer order')
  assert(info.overflow <= 2, name + ': page horizontal overflow')
  assert.equal(info.pointerEvents, width <= 900 ? 'none' : 'auto')
  assert(info.waveOpacity > .5 && info.waveOpacity <= 1)

  if (reduced) {
    assert.equal(info.canvasMotion, 'reduced', 'Respect reduced-motion preference')
    assert(await page.locator('.hero-graph-motion-control').isDisabled())
  } else {
    await page.waitForFunction(() =>
      document.querySelector('.hero-v13-particle-wave canvas')?.dataset.motion === 'playing',
      null, { timeout: 8000 })
    const toggle = page.locator('.hero-graph-motion-control')
    await toggle.click()
    await page.waitForFunction(() =>
      document.querySelector('.hero-v13-particle-wave canvas')?.dataset.motion === 'paused',
      null, { timeout: 4000 })
    await toggle.click()
    await page.waitForFunction(() =>
      document.querySelector('.hero-v13-particle-wave canvas')?.dataset.motion === 'playing',
      null, { timeout: 4000 })
  }

  // Wave effects cannot break the approved scene interactions.
  const buttons = page.locator('.hero-v5-stage-selector button')
  await buttons.nth(1).click()
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-phase'), 'code')
  await buttons.nth(2).click()
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-phase'), 'hamnet')
  await buttons.nth(0).click()
  assert.equal(await page.getByTestId('interactive-ai-visual').getAttribute('data-phase'), 'neural')
  await mkdir('test-results', { recursive: true })
  await page.screenshot({ path: 'test-results/hero-v13-' + name + '.png', fullPage: false })
  assert.deepEqual(errors, [], name + ': uncaught browser exception')
  report.scenes.push({ name, width, height, theme, reduced, info })
  console.log('PASS Hero V13:', name, 'Canvas 2D + original SVG + three scene controls')
  await context.close()
}

async function staticAudit() {
  const configuration = await readFile('src/config/heroParticleWave.ts', 'utf8')
  for (const expected of ['900', '1.65', '2.35', '0.72', '0.6', '1.8', '#45bfff', 'flipX: true']) {
    assert(configuration.includes(expected), 'Missing exported Lab setting: ' + expected)
  }
  const hero = await readFile('src/components/hero/HeroParticleWave.tsx', 'utf8')
  assert(hero.includes('test-component-lab/particle-wave/ParticleWave'),
    'The exported Lab renderer must be reused, not forked')
  assert(!hero.includes('background-original.png'), 'Screenshots must not be embedded')
  const renderer = await readFile('src/components/test-component-lab/particle-wave/ParticleWave.tsx', 'utf8')
  for (const expected of ['requestAnimationFrame', 'cancelAnimationFrame', 'IntersectionObserver',
      'ResizeObserver', 'visibilitychange', 'getContext']) {
    assert(renderer.includes(expected), 'Renderer lost safety/performance feature: ' + expected)
  }
}

try {
  await staticAudit()
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await verifyScene('desktop-dark-1440', 1440, 900, 'dark', false)
  await verifyScene('desktop-light-1024', 1024, 768, 'light', true)
  await verifyScene('mobile-dark-390', 390, 844, 'dark', false)
  await verifyScene('mobile-light-320', 320, 780, 'light', true)
  console.log('PASS LCR V13: original Lab particle-wave composition integrated and responsive')
} catch (error) {
  report.errors.push(String(error?.stack || error))
  console.error('FAIL Hero V13:', error)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch { server.kill('SIGTERM') }
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/hero-v13-results.json', JSON.stringify(report, null, 2))
}
