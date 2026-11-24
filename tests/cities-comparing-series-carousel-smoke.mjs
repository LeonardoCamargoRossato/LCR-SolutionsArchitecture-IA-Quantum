import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from './isolation/Browser.mjs'

const PUBLIC_URL = process.env.CITIES_SMOKE_URL?.trim()
const BASE = PUBLIC_URL ? (PUBLIC_URL.endsWith('/') ? PUBLIC_URL : PUBLIC_URL + '/') : 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const server = PUBLIC_URL ? null : spawn('npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'],
  { env: process.env, stdio: 'ignore', detached: true })
const report = { origin: PUBLIC_URL ? 'GitHub Pages' : 'branch', desktop: [], mobile: [], failures: [] }
let browser

async function waitForServer() {
  for (let attempt = 0; attempt < 75; attempt++) {
    try { if ((await fetch(BASE)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 350))
  }
  throw Error('Website did not start or return HTTP 200')
}

async function waitForImage(page, selector, mustContain) {
  if(selector.startsWith('.case-story-cover')) await page.locator('.case-story-cover').scrollIntoViewIfNeeded()
  await page.waitForFunction(({ selector, mustContain }) => {
    const image = document.querySelector(selector)
    return image instanceof HTMLImageElement &&
      image.complete && image.naturalWidth > 0 && image.currentSrc.includes(mustContain)
  }, { selector, mustContain }, { timeout: 30000 })
  return page.locator(selector).evaluate(image => ({
    src: image.currentSrc, width: image.naturalWidth, height: image.naturalHeight,
  }))
}

async function verifyViewport(label, viewport) {
  const ctx = await browser.newContext({
    viewport, acceptDownloads: true,
    isMobile: label === 'mobile', hasTouch: label === 'mobile',
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('response', resp => {
    if (/\/series-compare\/(WebP|PNG)\//.test(resp.url()) && resp.status() >= 400) {
      errors.push({ code: resp.status(), url: resp.url() })
    }
  })
  await page.goto(BASE + '#/projects/cities-comparing', { waitUntil: 'domcontentloaded' })
  const counter = page.locator('.case-hero-carousel-count')
  await counter.waitFor({ state: 'visible', timeout: 30000 })
  assert.equal((await counter.innerText()).trim(), '1 / 9', 'Cover + abstract + seven new images')

  const dots = page.locator('.case-hero-carousel-dots button')
  const thumbnails = page.locator('.case-hero-thumbnails button')
  assert.equal(await dots.count(), 9)
  assert.equal(await thumbnails.count(), 9)
  const items = []

  for (let index = 0; index < 9; index++) {
    await dots.nth(index).click()
    assert.equal((await counter.innerText()).trim(), (index + 1) + ' / 9')
    const number = String(index - 1).padStart(2, '0')
    const expectedWebP = index < 2 ? '.webp' :
      '/series-compare/WebP/Research_Platform_Series_Compare_' + number + '.webp'
    const image = await waitForImage(page, '.case-story-cover img.progressive-image-main', expectedWebP)
    if (index >= 2) {
      assert.equal(image.width, 1920, 'Full image dimensions preserved')
      assert.equal(image.height, 1080)
    }
    await page.locator('.case-story-cover').click()
    const lightbox = page.locator('.image-lightbox[role="dialog"]')
    await lightbox.waitFor({ state: 'visible', timeout: 12000 })
    const expectedFull = index < 2 ? '' :
      '/series-compare/PNG/Research_Platform_Series_Compare_' + number + '.png'
    const full = await waitForImage(page, '.image-lightbox-viewport img', expectedFull)
    if (index >= 2) {
      assert.equal(full.width, 1920)
      assert.equal(full.height, 1080)
    }
    if (index === 2) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 25000 }),
        lightbox.getByRole('button', { name: 'Download' }).click(),
      ])
      assert(download.suggestedFilename().endsWith('.png'), 'Download must retain PNG extension')
    }
    await lightbox.getByRole('button', { name: 'Close' }).click()
    items.push({ slide: index + 1, webp: image.src, zoom: full.src, loaded: true })
    console.log('SERIES', label, index + 1, '/ 9 PASS')
  }

  assert.equal(errors.length, 0, 'Unexpected HTTP errors for series images: ' + JSON.stringify(errors))
  if (label === 'mobile') {
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }))
    assert(dimensions.scroll <= dimensions.viewport + 2, 'Mobile case has horizontal overflow')
  }
  report[label] = items
  await mkdir('test-results', { recursive: true })
  await page.screenshot({ path: 'test-results/cities-comparing-series-' + label + '.png' })
  await ctx.close()
}

try {
  await waitForServer()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await verifyViewport('desktop', { width: 1440, height: 900 })
  await verifyViewport('mobile', { width: 390, height: 844 })
  console.log('PASS: 9 slides (2 originals + 7 new), two viewports, WebP initial, PNG zoom/download.')
} catch (error) {
  report.failures.push(String(error))
  console.error('SERIES SMOKE FAILED:', error)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  if (server) { try { process.kill(-server.pid, 'SIGTERM') } catch {} }
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/cities-comparing-series-report.json', JSON.stringify(report, null, 2))
}
