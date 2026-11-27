import assert from 'node:assert/strict'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { chromium } from './isolation/Browser.mjs'

const base = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const report = { checkedAt: new Date().toISOString(), checks: [], failures: [] }
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
  env: process.env, stdio: 'ignore', detached: true,
})
let browser

async function awaitServer() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(base)).ok) return } catch {}
    await new Promise((resolve) => setTimeout(resolve, 400))
  }
  throw new Error('Vite not ready')
}

async function checkPage(name, viewport, mobile) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(base + '#/', { waitUntil: 'domcontentloaded' })
  await page.locator('.home-about-grid .about-media').waitFor({ state: 'attached', timeout: 30000 })
  await page.locator('.about-read-more').scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)

  const metrics = await page.evaluate(() => {
    const media = document.querySelector('.home-about-grid .about-media')
    const copy = document.querySelector('.about-mini-copy--compact')
    const divider = document.querySelector('.about-section-closing')
    const email = media?.querySelector('.about-social-link:last-child')
    const gallery = document.querySelector('.about-gallery-section')
    if (!(media && copy && divider && email)) {
      throw Error('About structure incomplete: ' + JSON.stringify({
        media: !!media, copy: !!copy, divider: !!divider, email: !!email,
        gallery: !!gallery, socialCount: media?.querySelectorAll('.about-social-link').length,
      }))
    }
    const a = media.getBoundingClientRect()
    const b = copy.getBoundingClientRect()
    const c = divider.getBoundingClientRect()
    return {
      mediaBottom: a.bottom,
      copyBottom: b.bottom,
      dividerTop: c.top,
      emailBottom: email.getBoundingClientRect().bottom,
      mediaTop: a.top,
      copyTop: b.top,
      mediaHeight: a.height,
      copyHeight: b.height,
      dividerWidth: c.width,
      galleryTop: gallery?.getBoundingClientRect().top ?? null,
      containerWidth: document.querySelector('.home-about-grid')?.getBoundingClientRect().width,
      footerLinks: [...copy.querySelectorAll('.about-mini-footer .about-universities-footer a')].map((a) => ({
        text: a.textContent?.trim(),
        href: a.getAttribute('href'),
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel'),
      })),
      wholePageScrollWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }
  })
  assert.equal(metrics.footerLinks.length, 3, name + ': expected exactly UFSM/UFRGS/ITA links')
  for (const acronym of ['UFSM', 'UFRGS', 'ITA']) {
    assert(metrics.footerLinks.some((link) => link.text?.startsWith(acronym)), name + ' missing ' + acronym)
  }
  assert(metrics.footerLinks.every((item) => item.target === '_blank' && item.rel?.includes('noopener')),
    name + ': university links must open securely in another tab')
  assert(metrics.dividerWidth >= (metrics.containerWidth ?? 0) - 3, name + ': closing line is not full-width')
  if (metrics.galleryTop !== null) assert(metrics.galleryTop > metrics.dividerTop, name + ': gallery must start below closing line')
  if (!mobile) {
    assert(Math.abs(metrics.copyBottom - metrics.mediaBottom) < 3, name + ': columns do not end on same line: ' + JSON.stringify(metrics))
    assert(Math.abs(metrics.dividerTop - metrics.emailBottom) < 5, name + ': closing rule is not level with email: ' + JSON.stringify(metrics))
    assert(Math.abs(metrics.copyHeight - metrics.mediaHeight) < 3, name + ': columns are not height-matched')
  } else {
    assert(metrics.wholePageScrollWidth <= metrics.viewportWidth + 2, name + ': horizontal page overflow')
  }

  const universityLinks = page.locator('.about-mini-footer .about-universities-footer a')
  assert.equal(await universityLinks.count(), 3)
  await page.locator('.about-read-more').click()
  const dialog = page.locator('.about-details-dialog')
  await dialog.waitFor({ state: 'visible', timeout: 8000 })
  assert.equal(await dialog.getAttribute('aria-labelledby'), 'about-complete-title')
  assert.equal(await dialog.locator('.about-highlight-education a').count(), 3)
  assert((await dialog.innerText()).match(/Foton/), name + ': leadership details missing')
  assert((await dialog.innerText()).match(/UFSM/), name + ': academic information missing')
  await page.locator('.about-details-close').click()
  await dialog.waitFor({ state: 'hidden' })
  if (!mobile) {
    const after = await page.evaluate(() => ({
      left: document.querySelector('.about-media')?.getBoundingClientRect().bottom,
      right: document.querySelector('.about-mini-copy--compact')?.getBoundingClientRect().bottom,
    }))
    assert(Math.abs(after.left - after.right) < 3, name + ': closing modal changed About alignment')
  }

  // Read-only public UI check: cached legacy Toolkit must never reappear.
  assert.equal(await page.locator('.project-card').filter({ hasText: /Scientific Analysis Toolkit|Toolkit de Análise Científica/i }).count(), 0)
  const embedded = await page.locator('.more-projects-grid').innerText()
  assert(/Embedded Control Platform|Plataforma de Controle Embarcado/.test(embedded),
    name + ': embedded-control case was accidentally retired')
  await page.goto(base + '#/projects/scientific-analysis-toolkit', { waitUntil: 'domcontentloaded' })
  await page.locator('.not-found h1').waitFor({ timeout: 13000 })
  assert.equal(await page.locator('.case-story-hero').count(), 0, name + ': retired case still renders')

  await page.goto(base + '#/', { waitUntil: 'domcontentloaded' })
  await page.locator('.more-projects-grid').waitFor({ timeout: 20000 })
  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('lcr-projects-v2') || 'null')
    if (!saved || !Array.isArray(saved.value)) return
    const other = saved.value.find((entry) => entry.slug === 'embedded-control-platform')
    if (!other) return
    saved.value.unshift({ ...other, id: 'scientific-analysis-toolkit', slug: 'scientific-analysis-toolkit',
      title: 'Scientific Analysis Toolkit', visible: true, sortOrder: 0 })
    localStorage.setItem('lcr-projects-v2', JSON.stringify(saved))
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.more-projects-grid').waitFor({ timeout: 20000 })
  assert.equal(await page.locator('.project-card').filter({ hasText: 'Scientific Analysis Toolkit' }).count(), 0,
    name + ': stale cache bypassed retirement filter')
  await page.locator('.about-read-more').scrollIntoViewIfNeeded()
  mkdirSync('test-results', { recursive: true })
  await page.screenshot({ path: `test-results/about-compact-${name}.png`, fullPage: false })
  report.checks.push({ device: name, metrics, result: 'PASS' })
  console.log('PASS', name, 'About alignment, Read More, academic links, retired Toolkit, embedded control and stale cache')
  await context.close()
}

try {
  await awaitServer()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  for (const file of ['public/projects/scientific-analysis.png', 'public/projects/scientific-analysis.svg']) {
    assert(!existsSync(file), 'Retired static asset still published: ' + file)
  }
  await checkPage('desktop-1280', { width: 1280, height: 900 }, false)
  await checkPage('desktop-1440', { width: 1440, height: 900 }, false)
  await checkPage('mobile-390', { width: 390, height: 844 }, true)
  console.log('PASS: About section matches contact baseline at desktop, no regression on mobile')
} catch (error) {
  report.failures.push(String(error))
  console.error('ABOUT/RETIREMENT SMOKE FAILED:', error)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch {}
  mkdirSync('test-results', { recursive: true })
  writeFileSync('test-results/about-compact-retirement.json', JSON.stringify(report, null, 2))
}
