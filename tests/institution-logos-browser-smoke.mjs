import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const publicUrl = process.env.INSTITUTION_LOGO_TEST_URL?.trim()
const base = publicUrl
  ? (publicUrl.endsWith('/') ? publicUrl : publicUrl + '/')
  : 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const server = publicUrl ? null : spawn('npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'],
  { env: process.env, stdio: 'ignore', detached: true })

// Every public institution reference in the Supabase project_institutions table.
const cases = [
  ['cities-comparing', 3],
  ['foton-hub', 1],
  ['quantum-education-apps', 2],
  ['scientific-analysis-toolkit', 2],
  ['embedded-control-platform', 1],
  ['webseer', 2],
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
  for (const [slug, expected] of cases) {
    await page.goto(base + '#/projects/' + slug, { waitUntil: 'domcontentloaded' })
    const logos = page.locator('.case-institution-logos img')
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
  assert.equal(total, 11)
  assert.equal(errors.length, 0, 'SVG requests failed: ' + JSON.stringify(errors))
  await context.close()
}

async function testFallback() {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const page = await context.newPage()
  await page.route('**/assets/institutions/svg/instituto-pense-mais.svg', route => route.abort())
  await page.goto(base + '#/projects/cities-comparing', { waitUntil: 'domcontentloaded' })
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
  console.log('PASS: 11 SVG references on 6 projects x desktop/mobile, sizing and PNG fallback')
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
