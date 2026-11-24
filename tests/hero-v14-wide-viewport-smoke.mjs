import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from './isolation/Browser.mjs'

const BASE = 'http://127.0.0.1:5199/LCR-SolutionsArchitecture-IA-Quantum/'
const results = { scenarios: [], errors: [] }
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5199', '--strictPort'], {
  env: process.env, detached: true, stdio: 'ignore',
})
let browser

async function ready() {
  for (let attempt = 0; attempt < 120; attempt++) {
    try { if ((await fetch(BASE)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw Error('Vite server failed to start')
}

function near(actual, expected, slack, message) {
  assert(Math.abs(actual - expected) <= slack, message + ': ' + actual + ', expected ' + expected)
}

async function layoutCheck(width, height, locale, theme) {
  const context = await browser.newContext({
    viewport: { width, height }, reducedMotion: 'reduce', colorScheme: theme,
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  await page.addInitScript(({ locale, theme }) => {
    localStorage.setItem('portfolio-locale', locale)
    localStorage.setItem('portfolio-theme', theme)
  }, { locale, theme })
  await page.goto(BASE + '#/?portal=skip', { waitUntil: 'domcontentloaded' })
  await page.locator('h1.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 20000 })
  await page.evaluate(() => document.fonts.ready)

  const layout = await page.evaluate(() => {
    const rect = el => {
      const r = el.getBoundingClientRect()
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }
    }
    const header = document.querySelector('header.site-header')
    const headerShell = document.querySelector('header.site-header .site-container.header-inner')
    const hero = document.querySelector('main.portfolio-home > section.hero-v3')
    const heroShell = hero.querySelector('.site-container.hero-v3-layout')
    const copy = hero.querySelector('.hero-v3-content')
    const background = hero.querySelector('.hero-v6-backdrop-svg')
    const selected = document.querySelector('main.portfolio-home > section.selected-section')
    const selector = hero.querySelector('.hero-v5-stage-selector')
    const actions = hero.querySelector('.hero-actions')
    return {
      viewport: { width: innerWidth, height: innerHeight },
      header: rect(header),
      headerShell: rect(headerShell),
      hero: rect(hero),
      heroShell: rect(heroShell),
      copy: rect(copy),
      background: rect(background),
      imageFit: getComputedStyle(background).objectFit,
      imagePosition: getComputedStyle(background).objectPosition,
      minHeight: getComputedStyle(hero).minHeight,
      heroDisplay: getComputedStyle(hero).display,
      selected: rect(selected),
      selector: rect(selector),
      actions: rect(actions),
      title: hero.querySelector('h1.hero-type-title').textContent?.trim(),
      phase: hero.querySelector('[data-testid="interactive-ai-visual"]').dataset.phase,
      sceneButtons: hero.querySelectorAll('.hero-v5-stage-selector button').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  const wide = width >= 1500 && width / height >= 1.7
  const label = width + 'x' + height + ' ' + locale + ' ' + theme
  if (width > 900) {
    near(layout.headerShell.left, layout.heroShell.left, 2,
      label + ' navbar and Hero left edges must match')
  } else {
    // Mobile V12 intentionally uses an extra Hero gutter; preserve it.
    assert(layout.heroShell.left >= layout.headerShell.left + 10 &&
           layout.heroShell.left <= layout.headerShell.left + 24,
      label + ' approved mobile Hero gutter changed unexpectedly')
  }
  assert(layout.overflow <= 2, label + ' horizontal overflow: ' + layout.overflow)
  assert.equal(layout.sceneButtons, 3, label + ' scene controls changed')
  assert.equal(layout.phase, 'neural', label + ' AI Graph must still be the first scene')
  assert(layout.actions.bottom < layout.hero.bottom + 2, label + ' CTA clipped by Hero')
  assert(layout.selector.bottom < layout.hero.bottom + 2, label + ' scene selector clipped')
  assert(layout.copy.width >= 200, label + ' readable copy width')

  if (wide) {
    const previousShellWidth = Math.min(1180, width - 40)
    const expectedWidth = Math.min(2000, .85 * width - 95, width - 64)
    near(layout.heroShell.width, expectedWidth, 2, label + ' fluid shell geometry')
    assert(layout.heroShell.width > previousShellWidth + 9,
      label + ' must expand beyond the old 1180px desktop shell')
    assert(layout.heroShell.left < (width - previousShellWidth) / 2 - 4,
      label + ' left whitespace did not shrink')
    assert(layout.copy.width >= Math.min(layout.heroShell.width * .55, 850) - 2,
      label + ' left content did not grow with the wide shell')
    assert(layout.hero.bottom >= height - 3,
      label + ' second blue section appears at bottom of the first viewport: ' + JSON.stringify(layout))
    assert(layout.selected.top >= height - 3,
      label + ' blue next section is visible without scrolling')
    assert(layout.hero.bottom <= height + 90,
      label + ' Hero uses excessive height beyond the first screen')
    near(layout.header.bottom, layout.hero.top, 2, label + ' Hero begins immediately below header')
    assert(layout.background.height >= layout.hero.height - 2,
      label + ' optimized background does not fill the vertical Hero')
    assert.equal(layout.imageFit, 'cover', label + ' background must scale by height using cover')
    assert(layout.imagePosition.startsWith('100%') || layout.imagePosition.includes('right'),
      label + ' keep approved right-side details in frame: ' + layout.imagePosition)
  } else {
    assert(layout.heroShell.width <= 1180 + 2,
      label + ' notebook or mobile composition was unintentionally enlarged')
    assert(layout.heroDisplay !== 'flex', label + ' ordinary viewport must keep V13 Hero layout')
  }
  await mkdir('test-results', { recursive: true })
  await page.screenshot({
    path: 'test-results/hero-v14-' + width + '-' + height + '-' + locale + '-' + theme + '.png',
    fullPage: false,
  })
  assert.deepEqual(errors, [], label + ' page errors')
  results.scenarios.push({ label, wide, layout })
  console.log('PASS Hero V14', label, wide ? 'wide: full viewport + fluid shell' : 'existing size unchanged')
  await context.close()
}

async function portalCoverage() {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 925 }, colorScheme: 'dark',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(String(error)))
  await page.goto(BASE + '#/?portal=replay', { waitUntil: 'domcontentloaded' })
  const portal = page.getByTestId('loading-portal-v2')
  await portal.waitFor({ state: 'visible', timeout: 14000 })
  await page.locator('.portal-v2-plane').waitFor({state:'visible',timeout:12000})
  const geometry = await page.evaluate(() => {
    const door = document.querySelector('[data-testid="loading-portal-v2"]')
    const r = door.getBoundingClientRect()
    const picture = door.querySelector('.portal-v2-background')
    const plane = door.querySelector('.portal-v2-plane').getBoundingClientRect()
    return {
      x: r.x, y: r.y, width: r.width, height: r.height,
      viewportWidth: innerWidth, viewportHeight: innerHeight,
      fit: picture ? getComputedStyle(picture).objectFit : null,
      planeWidth:plane.width,planeHeight:plane.height,variant:door.dataset.variant,
    }
  })
  near(geometry.x, 0, 1, 'portal left')
  near(geometry.y, 0, 1, 'portal top')
  near(geometry.width, geometry.viewportWidth, 1, 'portal width')
  near(geometry.height, geometry.viewportHeight, 1, 'portal height')
  assert.equal(geometry.fit, 'fill', 'shared uniform cover plane owns sizing; image fills that plane')
  assert(geometry.planeWidth>=geometry.viewportWidth-1&&geometry.planeHeight>=geometry.viewportHeight-1,'all layers cover viewport')
  assert.equal(geometry.variant,'21x9','closest aspect ratio for 1920×925')
  await portal.locator('.portal-v2-counter').waitFor({ state: 'visible', timeout: 10000 })
  await page.screenshot({ path: 'test-results/hero-v14-portal-wide.png', fullPage: false })
  await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({ timeout: 20000 })
  assert.deepEqual(errors, [], 'Portal replay browser errors')
  results.scenarios.push({ label: 'portal 1920x925 covers viewport and reveals real Home', geometry })
  console.log('PASS Loading Portal original art still fills landscape viewport and opens')
  await context.close()
}

try {
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  for (const [width, height, locale, theme] of [
    [1366, 768, 'pt-BR', 'dark'],  // approved notebook untouched
    [1440, 900, 'en-US', 'light'], // standard desktop untouched
    [390, 844, 'pt-BR', 'dark'],   // approved phone untouched
    [1536, 864, 'en-US', 'dark'],
    [1640, 850, 'pt-BR', 'light'],
    [1920, 925, 'pt-BR', 'dark'],  // user screenshot aspect ratio
    [1920, 1080, 'en-US', 'light'],
    [2560, 1080, 'pt-BR', 'dark'],
  ]) await layoutCheck(width, height, locale, theme)
  await portalCoverage()
  console.log('PASS V14: wide landscape layout and cover, original notebook/mobile, Portal replay')
} catch (error) {
  results.errors.push(String(error?.stack || error))
  console.error('FAIL Hero V14', error)
  process.exitCode = 1
} finally {
  await browser?.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch { server.kill('SIGTERM') }
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/hero-v14-wide-report.json', JSON.stringify(results, null, 2))
}
