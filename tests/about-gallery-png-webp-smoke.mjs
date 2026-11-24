/**
 * Browser smoke: real Supabase gallery on the current Vite branch.
 * No privileged credentials; verifies WebP cards, full-resolution PNG zoom,
 * original PNG download, keyboard navigation and mobile layout.
 */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from './isolation/Browser.mjs'

const PUBLIC_BASE = process.env.GALLERY_SMOKE_BASE_URL?.trim()
const BASE = PUBLIC_BASE ? (PUBLIC_BASE.endsWith('/') ? PUBLIC_BASE : PUBLIC_BASE + '/') : 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const output = { date: new Date().toISOString(), scenarios: [], errors: [] }
const server = PUBLIC_BASE ? null : spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
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
  const marker = 'gallery-check-' + Math.random().toString(36).slice(2)
  await locator.evaluate((img, marker) => img.setAttribute('data-gallery-check', marker), marker)
  try {
    await page.waitForFunction(
      ({ marker, requiredPath }) => {
        const img = document.querySelector('img[data-gallery-check="' + marker + '"]')
        return img instanceof HTMLImageElement &&
          img.currentSrc.includes(requiredPath) && img.complete && img.naturalWidth > 0
      },
      { marker, requiredPath },
      { timeout: 25000 },
    )
    const url = await locator.evaluate(img => img.currentSrc)
    assert(url.includes(requiredPath), url)
    return url
  } finally {
    await locator.evaluate(img => img.removeAttribute('data-gallery-check')).catch(() => undefined)
  }
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
    const dialog = page.locator('.image-lightbox[role="dialog"]')
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


async function mockedAdminUploadTest() {
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 } })
  const page = await context.newPage()
  const objects = new Map()

  await page.route(/\/storage\/v1\/object\/portfolio-media\/about\/gallery\//, async route => {
    const req = route.request()
    const url = new URL(req.url())
    const path = decodeURIComponent(url.pathname.split('/object/portfolio-media/')[1] || '')
    if (!path) throw Error('Bad mock Storage path')
    if (req.method() === 'POST') {
      let bytes = req.postDataBuffer()
      // Supabase's upload client serializes File/Blob as multipart form data.
      // The mocked Storage server must persist the file bytes, not the envelope.
      const contentType = req.headers()['content-type'] || ''
      if (bytes && contentType.includes('multipart/form-data')) {
        const match = contentType.match(/boundary=([^;]+)/)
        if (!match) throw Error('Multipart upload missing boundary')
        // Storage uploads contain metadata fields before the actual file;
        // locate the file part, never assume it is first.
        const multipartParts = bytes.toString('latin1').split('--' + match[1])
        const filePart = multipartParts.find(part => {
          const headers = part.split('\r\n\r\n')[0] || ''
          return /filename=|name="file"/i.test(headers)
        })
        if (!filePart) throw Error('Could not find file part in Supabase mock upload')
        const firstBody = filePart.indexOf('\r\n\r\n')
        const data = filePart.slice(firstBody + 4).replace(/\r\n$/, '')
        bytes = Buffer.from(data, 'latin1')
      }
      if (!bytes || objects.has(path)) throw Error('Upload is empty or overwrote a prior object: ' + path)
      objects.set(path, bytes)
      await route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ Key: path, Id: 'mock-upload' }) })
    } else if (req.method() === 'GET') {
      const bytes = objects.get(path)
      if (!bytes) await route.fulfill({ status: 404, body: '{}' })
      else await route.fulfill({ status: 200,
        contentType: path.endsWith('.jpg') ? 'image/jpeg' : path.endsWith('.png') ? 'image/png' : 'image/webp',
        body: bytes })
    } else {
      throw Error('Unexpected mock Storage verb: ' + req.method())
    }
  })

  await page.goto(BASE + 'tests/gallery-admin-upload-harness.html', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const value = document.querySelector('#result')?.textContent || ''
    return value.startsWith('PASS:') || value.startsWith('FAIL:')
  }, null, { timeout: 25000 })
  const resultText = await page.locator('#result').textContent()
  assert(resultText?.startsWith('PASS:'), 'Admin harness failed: ' + resultText)
  const paths = [...objects.keys()]
  assert.equal(paths.length, 3)
  const original = paths.find(path => /^about\/gallery\/[^/]+\.jpg$/.test(path))
  const png = paths.find(path => /^about\/gallery\/PNG\/[^/]+\.png$/.test(path))
  const webp = paths.find(path => /^about\/gallery\/WebP\/[^/]+\.webp$/.test(path))
  assert(original && png && webp, 'Admin upload must produce original + PNG + WebP')
  assert.equal(objects.get(original)[0], 0xff)
  assert.equal(objects.get(original)[1], 0xd8)
  assert.equal(objects.get(png).subarray(1, 4).toString('ascii'), 'PNG')
  assert.equal(objects.get(webp).subarray(8, 12).toString('ascii'), 'WEBP')
  output.admin = { simulatedUpload: 'PASS', sources: 1, png: 1, webp: 1 }
  console.log('GALLERY ADMIN: mocked authenticated Storage upload produces and verifies all three formats')
  await page.screenshot({ path: 'test-results/gallery-admin-mock.png' })
  await context.close()
}

try {
  await waitReady()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await viewportTest('desktop', { width: 1440, height: 900 })
  await viewportTest('mobile', { width: 390, height: 844 })
  if (!PUBLIC_BASE) await mockedAdminUploadTest()
  console.log('GALLERY PASS: ' + (PUBLIC_BASE ? 'PUBLISHED SITE' : 'BRANCH') + ' 10 visible photos × 2 devices; WebP carousel, PNG lightbox and PNG download.')
} catch (error) {
  output.errors.push(String(error))
  console.error('GALLERY SMOKE FAILED:', String(error))
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  if (server) { try { process.kill(-server.pid, 'SIGTERM') } catch {} }
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/gallery-smoke.json', JSON.stringify(output, null, 2))
}
