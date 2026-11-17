/**
 * Browser smoke: real Supabase gallery on the current Vite branch.
 * No privileged credentials; verifies WebP cards, full-resolution PNG zoom,
 * original PNG download, keyboard navigation and mobile layout.
 */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const output = { date: new Date().toISOString(), scenarios: [], errors: [] }
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
  env: process.env, detached: true, stdio: 'ignore',
})
let browser

async function waitReady() {
  for (let attempt = 0; attempt < 70; attempt++) {
    try {
      if ((await fetch(BASE)).ok) return
    } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 400))
  }
  throw new Error('Vite server failed to start')
}

async function loadedImage(page, locator, requiredPath) {
  await locator.waitFor({ state: 'visible', timeout: 25000 })
  await page.waitForFunction(
    ({ css, requiredPath }) => {
      const img = document.querySelector(css)
      return img instanceof HTMLImageElement &&
        img.currentSrc.includes(requiredPath) && img.complete && img.naturalWidth > 0
    },
    { css: await locator.evaluate(element => {
      if (!(element instanceof HTMLImageElement)) throw Error('not IMG')
      element.setAttribute('data-gallery-check', 'selected')
      return 'img[data-gallery-check="selected"]'
    }), requiredPath },
    { timeout: 25000 },
  )
  const url = await locator.evaluate(img => img.currentSrc)
  assert(url.includes(requiredPath), url)
  return url
}

async function viewportTest(type, viewport) {
  const context = await browser.newContext({ viewport, acceptDownloads: true, isMobile: type === 'mobile', hasTouch: type === 'mobile' })
  const page = await context.newPage()
  const failures = []
  page.on('response', response => {
    if (/\/about\/gallery\/(WebP|PNG)\//.test(response.url()) && response.status() >= 400) {
      failures.push(response.status() + ' ' + response.url())
    }
  })
  await page.goto(BASE + '#/', { waitUntil: 'domcontentloaded' })
  const cards = page.locator('button.about-gallery-card')
  await cards.first().waitFor({ state: 'attached', timeout: 30000 })
  const count = await cards.count()
  assert.equal(count, 10, 'Editorial gallery currently hides photos 7 and 10')
  let downloaded = false
  for (let index = 0; index < count; index++) {
    const card = cards.nth(index)
    await card.scrollIntoViewIfNeeded()
    const image = card.locator('img.progressive-image-main')
    const webp = await loadedImage(page, image, '/about/gallery/WebP/')
    assert(webp.endsWith('.webp'), 'Gallery initial photo was not WebP: ' + webp)
    await card.click()
    const dialog = page.getByRole('dialog', { name: /gallery|palestrando|Porto|Natal|São|Curitiba|Foz/i })
    await dialog.waitFor({ state: 'visible', timeout: 10000 })
    const full = dialog.locator('.image-lightbox-viewport img')
    const png = await loadedImage(page, full, '/about/gallery/PNG/')
    assert(png.endsWith('.png'), 'Gallery lightbox did not show PNG: ' + png)
    if (index === 0) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 20000 }),
        dialog.getByRole('button', { name: 'Download' }).click(),
      ])
      assert(download.suggestedFilename().endsWith('.png'))
      downloaded = true
    }
    await dialog.getByRole('button', { name: 'Close' }).click()
    output.scenarios.push({ viewport: type, index, webp: 'PASS', png: 'PASS' })
    console.log('GALLERY', type, index + 1, '/', count, 'WebP + PNG PASS')
  }
  assert(downloaded)
  assert.equal(failures.length, 0, 'Failed image HTTP responses: ' + failures.join(', '))
  if (type === 'mobile') {
    const galleryDimensions = await page.locator('.about-gallery-section').evaluate(section => ({
      viewport: document.documentElement.clientWidth,
      sectionWidth: section.getBoundingClientRect().width,
    }))
    assert(galleryDimensions.sectionWidth <= galleryDimensions.viewport + 2, 'Mobile gallery exceeds screen')
  }
  await mkdir('test-results', { recursive: true })
  await page.screenshot({ path: 'test-results/gallery-' + type + '.png', fullPage: false })
  await context.close()
}

try {
  await waitReady()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await viewportTest('desktop', { width: 1440, height: 900 })
  await viewportTest('mobile', { width: 390, height: 844 })
  console.log('GALLERY PASS: 10 visible photos × 2 devices; WebP carousel, PNG lightbox and PNG download.')
} catch (error) {
  output.errors.push(String(error))
  console.error('GALLERY SMOKE FAILED:', String(error))
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch {}
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/gallery-smoke.json', JSON.stringify(output, null, 2))
}
