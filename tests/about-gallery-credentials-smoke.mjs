import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
  env: process.env, stdio: 'ignore', detached: true,
})
const report = { checkedAt: new Date().toISOString(), scenarios: [], errors: [] }
let browser

async function ready() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(base)).ok) return } catch {}
    await new Promise((resolve) => setTimeout(resolve, 350))
  }
  throw new Error('Vite did not start')
}

async function check(page, label) {
  await page.goto(base + '#/', { waitUntil: 'domcontentloaded' })
  const gallery = page.locator('.about-gallery-section')
  await gallery.waitFor({ state: 'visible', timeout: 30000 })
  const cards = gallery.locator('.about-gallery-card')
  await page.waitForFunction(() => document.querySelectorAll('.about-gallery-card').length === 10, null, { timeout: 20000 })
  assert.equal(await cards.count(), 10)
  assert((await gallery.locator('.about-gallery-heading .eyebrow').textContent())?.includes('06.1 / Gallery'), 'Gallery section must follow 06 / About')
  assert((await gallery.textContent())?.includes('LACQ (Liga Acadêmica de Computação Quântica)'), 'Corrected LACQ event title is missing')
  assert(!(await gallery.textContent())?.includes('LACEQUI'), 'Retired LACEQUI spelling still visible')

  const highlights = page.locator('.about-highlights')
  await highlights.waitFor({ state: 'visible', timeout: 10000 })
  const copy = await highlights.innerText()
  assert(copy.includes('2025–2026'), 'Missing Foton presidency dates')
  assert(copy.includes('2024–2025'), 'Missing national league movement dates')
  assert(copy.includes('50'), 'Missing science communication count')
  for (const short of ['UFSM', 'UFRGS', 'ITA']) assert(copy.includes(short), 'Missing university '+short)

  const links = [
    ['UFSM', 'https://www.ufsm.br/'],
    ['UFRGS', 'https://www.ufrgs.br/'],
    ['ITA', 'https://www.ita.br/'],
  ]
  for (const [short, url] of links) {
    const footerLink = highlights.locator('.about-universities-footer a', { hasText: short })
    assert.equal(await footerLink.count(), 1)
    assert.equal(await footerLink.getAttribute('href'), url)
    assert.equal(await footerLink.getAttribute('target'), '_blank')
    assert.equal(await footerLink.getAttribute('rel'), 'noopener noreferrer')
    const educationLink = highlights.locator('.about-highlight-education a').filter({ hasText: short })
    assert.equal(await educationLink.count(), 1)
    assert.equal(await educationLink.getAttribute('href'), url)
    assert.equal(await educationLink.getAttribute('target'), '_blank')
  }

  const toggle = gallery.locator('button[aria-controls="about-gallery-all-images"]')
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
  assert((await gallery.locator('.about-gallery-counter').innerText()).match(/\d+\s*\/\s*10/))
  await toggle.click()
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true')
  const thumbnails = gallery.locator('#about-gallery-all-images .about-gallery-grid-item')
  assert.equal(await thumbnails.count(), 10)

  const sizing = await thumbnails.first().evaluate(el => {
    const rect = el.getBoundingClientRect()
    return { width: rect.width, height: rect.height, ratio: rect.width / rect.height }
  })
  assert(Math.abs(sizing.ratio - 16 / 9) < .05, 'Thumbnail must keep 16:9 landscape framing')

  await thumbnails.nth(1).click()
  const dialog = page.locator('.image-lightbox[role="dialog"]')
  await dialog.waitFor({ state: 'visible', timeout: 10000 })
  assert((await dialog.locator('.image-lightbox-counter').innerText()).includes('2 / 10'))
  await dialog.getByRole('button', { name: 'Close' }).click()
  await toggle.click()
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
  assert.equal(await gallery.locator('#about-gallery-all-images').count(), 0)

  // Existing project cases must stay usable before assets are actually
  // uploaded. When the manifest arrives, verify the full WebP/PNG mapping.
  await page.goto(base + '#/projects/animefinder', { waitUntil: 'domcontentloaded' })
  await page.locator('.case-story-hero h1').waitFor({ state: 'visible', timeout: 15000 })
  const manifestResponse = await page.request.get(base + 'assets/projects/animefinder/assets-index.json')
  const assetManifest = manifestResponse.ok() && (manifestResponse.headers()['content-type'] ?? '').includes('application/json')
    ? await manifestResponse.json().catch(() => null)
    : null
  if (Array.isArray(assetManifest?.assets) && assetManifest.assets.length === 16) {
    await page.waitForFunction(() => document.querySelectorAll('.case-hero-thumbnails button').length === 16, null, { timeout: 15000 })
    const picture = page.locator('.case-story-cover .progressive-image-main')
    const coverSource = await picture.getAttribute('src')
    assert(coverSource.includes('/WebP/animefinder-01-landing-page.webp'))
    await page.locator('.case-story-cover').click()
    const full = page.locator('.image-lightbox-viewport img')
    assert((await full.getAttribute('src')).includes('/PNG/animefinder-01-landing-page.png'))
    await page.getByRole('button', { name: 'Close' }).click()
    report.scenarios.push({ label: label+'-animefinder', assets: '16 WebP/PNG available' })
  } else {
    const picture = page.locator('.case-story-cover .progressive-image-main')
    await picture.waitFor({ state: 'visible', timeout: 10000 })
    await page.waitForFunction(() => {
      const image = document.querySelector('.case-story-cover .progressive-image-main')
      return image instanceof HTMLImageElement &&
        image.currentSrc.includes('animefinder-brand.svg') && image.complete && image.naturalWidth > 0
    }, null, { timeout: 12000 })
    assert((await picture.getAttribute('src')).includes('animefinder-brand.svg'), 'Missing assets should retain original branded cover')
    assert.equal(await page.locator('.case-hero-thumbnails').count(), 0)
    report.scenarios.push({ label: label+'-animefinder', assets: 'safe fallback until originals uploaded' })
  }

  const overflows = await page.evaluate(() => ({
    htmlWidth: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }))
  assert(overflows.htmlWidth <= overflows.viewport + 2, 'Overflow in AnimeFinder case '+JSON.stringify(overflows))
  await mkdir('test-results', { recursive: true })
  await page.screenshot({ path: `test-results/about-gallery-animefinder-${label}.png`, fullPage: false })
  report.scenarios.push({ label, gallery: 10, expandable: true, aspect: sizing.ratio, links: 3, errors: 0 })
  console.log('PASS',label,'06.1 LACQ gallery, 16:9 overview toggle, university links, leadership, AnimeFinder')
}

try {
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  for (const [label, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({ viewport, reducedMotion: label==='mobile' ? 'reduce' : 'no-preference' })
    const page = await context.newPage()
    await check(page, label)
    await context.close()
  }
} catch (error) {
  report.errors.push(String(error))
  console.error('ABOUT/ANIMEFINDER SMOKE FAILED',error)
  process.exitCode = 1
} finally {
  await browser?.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch {}
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/about-gallery-credentials-smoke.json', JSON.stringify(report,null,2))
}
