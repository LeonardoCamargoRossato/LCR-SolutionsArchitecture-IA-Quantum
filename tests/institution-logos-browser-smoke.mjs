import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from './isolation/Browser.mjs'

const publicUrl = process.env.INSTITUTION_LOGO_TEST_URL?.trim()
const base = publicUrl
  ? (publicUrl.endsWith('/') ? publicUrl : publicUrl + '/')
  : 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const server = publicUrl ? null : spawn('npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'],
  { env: process.env, stdio: 'ignore', detached: true })

// Every active public institution reference; retired projects retain CMS records but do not render publicly.
const cases = [
  ['cities-comparing', ['instituto-pense-mais', 'instituto-fisica-ufrgs', 'ufrgs']],
  ['foton-hub', ['instituto-foton']],
  ['quantum-education-apps', ['instituto-pense-mais', 'instituto-foton']],
  ['embedded-control-platform', ['ita']],
  ['webseer', ['ita', 'instituto-foton']],
]
const report = { source: publicUrl ? 'published' : 'branch', desktop: [], mobile: [] }
let browser

async function waitForHost() {
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(base)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 350))
  }
  throw Error('The app was not reachable')
}
async function viewportTest(mode, dimensions) {
  const context = await browser.newContext({
    viewport: dimensions, isMobile: mode === 'mobile', hasTouch: mode === 'mobile',
  })
  const page = await context.newPage()
  const errors = []
  page.on('response', resp => {
    if (resp.url().includes('/assets/institutions/svg/') && resp.status() >= 400) {
      errors.push({ url: resp.url(), status: resp.status() })
    }
  })
  let total = 0
  let priorTitle = ''
  for (const [slug, expectedNames] of cases) {
    const expected = expectedNames.length
    await page.goto(base + '#/projects/' + slug, { waitUntil: 'domcontentloaded' })
    // React Router updates after navigation: wait for the *new* case, not the
    // previous case's still-mounted DOM. Counts alone can be equal on two cases.
    await page.waitForFunction(previous => {
      const current = document.querySelector('.case-story-hero h1')?.textContent?.trim()
      return Boolean(current && current !== previous)
    }, priorTitle, { timeout: 30000 })
    priorTitle = (await page.locator('.case-story-hero h1').innerText()).trim()
    const logos = page.locator('.case-institution-logos img')
    // Institution data arrives in a separate async Supabase request after the
    // project title. Wait for this case's exact SVG set, not the previous list.
    await page.waitForFunction(n => document.querySelectorAll('.case-institution-logos img').length === n, expected, { timeout: 30000 })
    for (const logo of await logos.all()) await logo.scrollIntoViewIfNeeded()
    await page.waitForFunction(names => {
      const current = [...document.querySelectorAll('.case-institution-logos img')]
      return current.length === names.length && names.every(name =>
        current.some(image => image.getAttribute('src')?.endsWith('/' + name + '.svg')))
    }, expectedNames, { timeout: 30000 })
    await logos.first().waitFor({ state: 'visible', timeout: 30000 })
    assert.equal(await logos.count(), expected, 'Institution count mismatch for ' + slug)
    await page.waitForFunction(() => {
      const images = [...document.querySelectorAll('.case-institution-logos img')]
      return images.length && images.every(img => img.complete && img.naturalWidth > 0)
    }, { timeout: 30000 })
    const details = await logos.evaluateAll(images => images.map(img => ({
      src: img.currentSrc,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      cardWidth: img.parentElement?.getBoundingClientRect().width,
      cardHeight: img.parentElement?.getBoundingClientRect().height,
    })))
    console.log('LOGO DIAGNOSTIC', mode, slug, details.map(item => ({ image: item.src.split('/').at(-1), cardWidth: item.cardWidth })), errors)
    for (const item of details) {
      assert(item.src.endsWith('.svg'), 'A known logo still renders raster: ' + item.src)
      assert(item.cardWidth >= 74, 'Logo card too narrow to be legible')
      assert(item.cardHeight >= 62, 'Logo card too short to be legible')
      assert(item.alt.trim().length > 0, 'Institution logo must retain alt text')
    }
    if (mode === 'mobile') {
      const width = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }))
      assert(width.scroll <= width.viewport + 2, 'Mobile horizontal overflow in ' + slug)
    }
    if (slug === 'cities-comparing') {
      const wide = page.locator('.case-institution-logo--extra-wide')
      assert.equal(await wide.count(), 1, 'Pense+ must get the wider card')
      const rect = await wide.boundingBox()
      assert(rect && rect.width >= 160, 'Pense+ still too small')
      await mkdir('test-results', { recursive: true })
      await page.screenshot({ path: 'test-results/institution-logos-' + mode + '.png' })
    }
    total += expected
    report[mode].push({ slug, logos: details })
    console.log('LOGOS', mode, slug, expected, 'SVG PASS')
  }
  // The retired Scientific Analysis Toolkit must not resurrect as a public case.
  await page.goto(base + '#/projects/scientific-analysis-toolkit', { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Case study not found.' }).waitFor({ timeout: 30000 })
  assert.equal(await page.locator('.case-institution-logos img').count(), 0,
    'Retired case still displays institution logos')
  assert.equal(total, 9)
  assert.equal(errors.length, 0, 'SVG requests failed: ' + JSON.stringify(errors))
  await context.close()
}

async function testFallback() {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const page = await context.newPage()
  await page.route('**/assets/institutions/svg/instituto-pense-mais.svg', route => route.abort())
  await page.goto(base + '#/projects/cities-comparing', { waitUntil: 'domcontentloaded' })
  await page.locator('.case-institution-logo--extra-wide').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => {
    const img = document.querySelector('.case-institution-logo--extra-wide img')
    return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0 &&
      img.currentSrc.toLowerCase().endsWith('.png')
  }, null, { timeout: 30000 })
  console.log('LOGOS legacy PNG fallback PASS')
  await context.close()
}

try {
  await waitForHost()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await viewportTest('desktop', { width: 1440, height: 900 })
  await viewportTest('mobile', { width: 390, height: 844 })
  await testFallback()
  console.log('PASS: 9 active SVG references on 5 projects x desktop/mobile, sizing and PNG fallback')
} catch (error) {
  report.failure = String(error)
  console.error('INSTITUTION LOGO SMOKE FAILED:', error)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  if (server) { try { process.kill(-server.pid, 'SIGTERM') } catch {} }
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/institution-logo-report.json', JSON.stringify(report, null, 2))
}
