import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

// Check every project linked by the public portfolio instead of a single slug.
// The carousel is shared by CaseHero; projects without gallery images are tracked
// separately and must continue to render without a thumbnail rail.
const base = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
  env: process.env, stdio: 'ignore', detached: true,
})
const report = { checkedAt: new Date().toISOString(), projects: [], failures: [] }
let browser

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt++) {
    try { if ((await fetch(base)).ok) return } catch {}
    await new Promise((resolve) => setTimeout(resolve, 400))
  }
  throw new Error('Vite did not start')
}

async function listProjectSlugs(page) {
  await page.goto(base + '#/', { waitUntil: 'domcontentloaded' })
  await page.locator('.portfolio-home .project-card').first().waitFor({ state: 'attached', timeout: 30000 })
  // Initial content can be replaced by the public repository response.
  await page.waitForTimeout(1300)
  return page.locator('a[href*="#/projects/"]').evaluateAll((anchors) =>
    [...new Set(anchors
      .map((anchor) => anchor.getAttribute('href') || '')
      .filter((href) => href.includes('#/projects/'))
      .map((href) => href.split('#/projects/')[1].split(/[?#]/)[0])
      .filter(Boolean))]
  )
}

// Wait for the rail's smooth motion to settle; assert alignment in visual pixels.
async function assertThumbnailCentered(page, slug, device, action) {
  await page.waitForFunction(() => {
    const rail = document.querySelector('.case-hero-thumbnails')
    const active = rail?.querySelector('button.is-active')
    if (!rail || !active) return false
    const railRect = rail.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    const thumbCenter = activeRect.left + activeRect.width / 2
    const viewportCenter = railRect.left + rail.clientWidth / 2
    return Math.abs(thumbCenter - viewportCenter) < 4
  }, null, { timeout: 8000 })
  const details = await page.locator('.case-hero-thumbnails').evaluate((rail) => ({
    selected: [...rail.querySelectorAll('button')].findIndex((button) => button.classList.contains('is-active')),
    scrollLeft: rail.scrollLeft,
    scrollMax: rail.scrollWidth - rail.clientWidth,
  }))
  console.log('CENTER', device, slug, action, JSON.stringify(details))
}

async function checkDevice(device, viewport, slugs, storageState) {
  const context = await browser.newContext({ viewport, isMobile: device === 'mobile', hasTouch: device === 'mobile', storageState })
  let railCount = 0
  for (const slug of slugs) {
    // Isolate route effects and media preloading from previous project cases.
    const page = await context.newPage()
    const pageErrors = []
    page.on('pageerror', (error) => pageErrors.push(String(error)))
    await page.goto(base + '#/projects/' + encodeURIComponent(slug), { waitUntil: 'domcontentloaded' })
    try {
      await page.locator('.case-story-hero-grid, .not-found').first().waitFor({ state: 'visible', timeout: 8000 })
    } catch {
      const state = await page.evaluate(() => ({
        title: document.title,
        text: document.body?.innerText.slice(0, 240) ?? '',
      }))
      report.projects.push({ slug, device, status: 'case-page-not-rendered', hasCarousel: false, state, pageErrors })
      console.warn('SKIP', device, slug, '(case page not rendered)', JSON.stringify({state,pageErrors}))
      await page.close()
      continue
    }
    if (await page.locator('.not-found').count()) {
      report.projects.push({ slug, device, status: 'case-page-unavailable', hasCarousel: false })
      console.log('SKIP', device, slug, '(public card has no case page)')
      await page.close()
      continue
    }
    const data = await page.evaluate(() => {
      const hero = document.querySelector('.case-story-hero')
      const copy = hero?.querySelector('.case-story-hero-copy')
      const media = hero?.querySelector('.case-hero-media')
      const rail = hero?.querySelector('.case-hero-thumbnails')
      if (!hero || !copy || !media) throw Error('Project hero missing')
      const thumb = rail?.querySelector('button')
      const cover = hero.querySelector('.case-story-cover .progressive-image')
      const actions = copy.querySelector('.case-actions')
      const style = rail ? getComputedStyle(rail) : null
      const thumbRect = thumb?.getBoundingClientRect()
      const coverRect = cover?.getBoundingClientRect()
      return {
        hasCarousel: Boolean(rail),
        imageCount: rail?.querySelectorAll('button').length ?? 0,
        thumbWidth: thumbRect?.width,
        thumbHeight: thumbRect?.height,
        coverRatio: coverRect ? coverRect.width / coverRect.height : 0,
        topCopy: copy.getBoundingClientRect().top,
        topMedia: media.getBoundingClientRect().top,
        railBottom: rail?.getBoundingClientRect().bottom ?? null,
        actionsBottom: actions?.getBoundingClientRect().bottom ?? null,
        scrollbarColor: style?.scrollbarColor ?? '',
        overflowX: style?.overflowX ?? '',
        scrollWidth: rail?.scrollWidth ?? 0,
        clientWidth: rail?.clientWidth ?? 0,
        leftBottom: copy.getBoundingClientRect().bottom,
        rightBottom: media.getBoundingClientRect().bottom,
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }
    })

    assert(data.pageWidth <= data.viewportWidth + 2,
      slug + ' has horizontal page overflow on ' + device + ': ' + JSON.stringify(data))
    if (data.hasCarousel) {
      railCount++
      assert(data.imageCount >= 2, slug + ' has invalid carousel item count')
      assert.equal(data.overflowX, 'auto', slug + ' thumbnails cannot scroll')
      assert(data.scrollbarColor.includes('107, 114, 128'),
        slug + ' is not using neutral gray scrollbar: ' + data.scrollbarColor)
      assert(!data.scrollbarColor.includes('37, 99, 235'),
        slug + ' still has the old blue scrollbar')
      assert(data.thumbWidth >= (device === 'desktop' ? 94 : 78),
        slug + ' thumbnail too narrow: ' + JSON.stringify(data))
      assert(data.thumbHeight >= (device === 'desktop' ? 60 : 50),
        slug + ' thumbnail too short: ' + JSON.stringify(data))
      assert(Math.abs(data.thumbWidth / data.thumbHeight - 96 / 62) < 0.12,
        slug + ' thumbnail lost landscape proportions: ' + JSON.stringify(data))
      assert(Math.abs(data.coverRatio - 16 / 9) < 0.03,
        slug + ' main preview must remain 16:9: ' + JSON.stringify(data))
      if (device === 'desktop') {
        assert(Math.abs(data.topCopy - data.topMedia) < 4,
          slug + ' carousel does not start at the project category: ' + JSON.stringify(data))
        assert(Math.abs(data.leftBottom - data.rightBottom) < 4,
          slug + ' carousel does not end at copy baseline: ' + JSON.stringify(data))
        if (data.actionsBottom !== null) {
          assert(Math.abs(data.actionsBottom - data.railBottom) < 4,
            slug + ' scrollbar not aligned with project buttons: ' + JSON.stringify(data))
        }
      }
      // The main preview and active thumbnail must stay in sync, including
      // edge items (real center, not just "mostly visible").
      await assertThumbnailCentered(page, slug, device, 'initial first slide')
      const activeCount = await page.locator('.case-hero-carousel-count').innerText()
      await page.locator('.case-hero-carousel-controls > button').last().click()
      const nextCount = await page.locator('.case-hero-carousel-count').innerText()
      assert.notEqual(nextCount, activeCount, slug + ' carousel next button did not advance')
      await assertThumbnailCentered(page, slug, device, 'next arrow')

      const middle = Math.floor(data.imageCount / 2)
      await page.locator('.case-hero-carousel-dots button').nth(middle).click()
      assert.equal(await page.locator('.case-hero-carousel-count').innerText(),
        `${middle + 1} / ${data.imageCount}`)
      await assertThumbnailCentered(page, slug, device, 'dot selection')

      await page.locator('.case-hero-thumbnails button').nth(middle - 1).click()
      assert.equal(await page.locator('.case-hero-carousel-count').innerText(),
        `${middle} / ${data.imageCount}`)
      await assertThumbnailCentered(page, slug, device, 'thumbnail click')

      await page.locator('.case-hero-carousel-dots button').last().click()
      await assertThumbnailCentered(page, slug, device, 'last slide')
      await page.locator('.case-hero-carousel-controls > button').last().click()
      assert.equal(await page.locator('.case-hero-carousel-count').innerText(), `1 / ${data.imageCount}`)
      await assertThumbnailCentered(page, slug, device, 'wrap to first')

      // Changing the selected image inside the lightbox must synchronize the
      // image and the centered thumbnail behind the modal as well.
      await page.locator('.case-story-cover').click()
      await page.locator('.image-lightbox-backdrop').waitFor({ state: 'visible', timeout: 12000 })
      await page.getByRole('button', { name: 'Next Image', exact: true }).click()
      await page.getByRole('button', { name: 'Close', exact: true }).click()
      await page.locator('.image-lightbox-backdrop').waitFor({ state: 'hidden' })
      assert.equal(await page.locator('.case-hero-carousel-count').innerText(), `2 / ${data.imageCount}`)
      await assertThumbnailCentered(page, slug, device, 'lightbox navigation')

      await mkdir('test-results', { recursive: true })
      await page.screenshot({ path: `test-results/portfolio-carousel-${slug}-${device}.png`, fullPage: false })
    }
    report.projects.push({ slug, device, ...data })
    console.log('PASS', device, slug, data.hasCarousel ? `gallery (${data.imageCount} images)` : 'no gallery')
    await page.close()
  }
  await context.close()
  assert(railCount >= 2, 'Expected at least two project galleries on ' + device + '; observed ' + railCount)
}

try {
  await waitForServer()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const context = await browser.newContext()
  const discovery = await context.newPage()
  const slugs = await listProjectSlugs(discovery)
  // Keep the public project data loaded by Home when opening isolated desktop/mobile contexts.
  // Without this, the first case renders stale fallback content before Supabase completes.
  const storageState = await context.storageState()
  await context.close()
  assert(slugs.length >= 4, 'Insufficient public projects discovered: ' + JSON.stringify(slugs))
  console.log('Discovered projects:', slugs.join(', '))
  await checkDevice('desktop', { width: 1440, height: 900 }, slugs, storageState)
  await checkDevice('mobile', { width: 390, height: 844 }, slugs, storageState)
  console.log('PASS: shared carousels auto-center active thumbnails for arrows, dots, clicks, edges and lightbox')
} catch (error) {
  report.failures.push(String(error))
  console.error('PORTFOLIO CAROUSEL SMOKE FAILED:', error)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch {}
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/portfolio-carousel-unified.json', JSON.stringify(report, null, 2))
}
