import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:5194/LCR-SolutionsArchitecture-IA-Quantum/'
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5194', '--strictPort'], {
  env: process.env, stdio: 'ignore', detached: true,
})
const report = { checks: [], errors: [] }
let browser

async function ready() {
  for (let i = 0; i < 110; i++) {
    try { if ((await fetch(BASE)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  throw Error('Vite server not ready')
}
async function inspect(width, height, locale) {
  const context = await browser.newContext({
    viewport: { width, height }, reducedMotion: 'reduce',
    colorScheme: 'light', locale: 'pt-BR',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  if (locale === 'pt-BR') {
    await page.addInitScript(() => localStorage.setItem('portfolio-locale', 'pt-BR'))
  }
  await page.goto(BASE + '#/', { waitUntil: 'domcontentloaded' })
  await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 20000 })
  await page.evaluate(() => document.fonts.ready)
  const expected = locale === 'pt-BR' ? ['Rede IA', 'Código', 'Hamlet AI'] : ['AI Graph', 'Code', 'Hamlet AI']
  const tabs = page.getByTestId('hero-v5-stage-selector')
  const labels = await tabs.locator('button').allTextContents().then(xs => xs.map(x => x.trim()))
  assert.deepEqual(labels, expected, `V12 must have only three translated stages at ${width}px`)
  const stage = page.getByTestId('interactive-ai-visual')
  assert.equal(await stage.getAttribute('data-phase'), 'neural', 'Hero must start directly on AI Graph')
  assert.equal(await tabs.locator('button').first().getAttribute('aria-pressed'), 'true')
  assert.equal(await page.locator('.hero-v4-scatter').count(), 2, 'Preserve original scatter code/art for provenance')
  const info = await page.evaluate(() => {
    const rect = el => {
      const r = el.getBoundingClientRect()
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }
    }
    const tags = [...document.querySelectorAll('.hero-specializations > .hero-skill-tag')]
    const selector = document.querySelector('.hero-v5-stage-selector')
    const motion = document.querySelector('.hero-graph-motion-control')
    const scene = document.querySelector('.hero-graph-field')
    const heading = document.querySelector('.hero-type-title')
    const eyebrow = document.querySelector('.hero-v3-copy > .eyebrow')
    const graphic = document.querySelector('.hero-v4-desktop')
    const visibleNodes = [...document.querySelectorAll('.hero-v4-desktop .hero-v4-depth-front .hero-v4-neuron-core')]
    return {
      tags: tags.map(x => ({
        rect: rect(x), font: parseFloat(getComputedStyle(x).fontSize),
        paddingLeft: parseFloat(getComputedStyle(x).paddingLeft),
        paddingRight: parseFloat(getComputedStyle(x).paddingRight),
        label: x.getAttribute('aria-label'),
      })),
      group: rect(document.querySelector('.hero-specializations')),
      copy: rect(document.querySelector('.hero-v3-content')),
      selector: rect(selector),
      selectorButtons: [...selector.querySelectorAll('button')].map(x => rect(x)),
      play: rect(motion), scene: rect(scene),
      heading: rect(heading), eyebrow: rect(eyebrow),
      graphic: rect(graphic),
      graphicTop: getComputedStyle(graphic).top,
      firstGraphNodeTop: visibleNodes.length ? Math.min(...visibleNodes.map(x => x.getBoundingClientRect().top)) : null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  assert.equal(info.tags.length, 4)
  assert(info.overflow <= 2, `Horizontal page overflow at ${width}px: ${JSON.stringify(info)}`)
  if (width <= 900) {
    const tags = info.tags.map(x => x.rect)
    assert(tags.every(x => Math.abs(x.top - tags[0].top) < 1.5), 'The four specialization tags must stay in one line')
    assert(Math.abs(info.group.left - info.copy.left) <= 2,
      `Left group alignment changed at ${width}px: ${JSON.stringify(info)}`)
    const gaps = tags.slice(1).map((x, i) => x.left - tags[i].right)
    assert(gaps.every(g => g >= 2 && g <= 12), `Chips are spread apart: ${width}px ${gaps}`)
    assert(info.group.right <= info.copy.right + 2, `Tags overflow copy at ${width}px`)
    assert(info.tags.every(t => t.font >= (width <= 360 ? 8.7 : 9.4)),
      `Tag fonts became illegible at ${width}px: ${JSON.stringify(info.tags)}`)
    assert(info.tags.every(t => t.paddingLeft >= 3.9 && t.paddingRight >= 3.9),
      `Specialization tags touch borders at ${width}px`)
    assert(info.scene.top - info.group.bottom >= 25,
      `Insufficient tag-to-art breathing room at ${width}px`)
    assert(info.selector.height >= 33 && info.selector.height <= 41,
      `Stage bar must be slimmer: ${width}px height ${info.selector.height}`)
    assert(info.selectorButtons.every(x => x.height >= 31 && x.height <= 35),
      `Stage buttons must have compact vertical padding: ${width}px`)
    assert(info.play.width >= 32 && info.play.width <= 36 &&
           info.play.height >= 32 && info.play.height <= 36,
      `Play/Pause is too large: ${width}px ${JSON.stringify(info.play)}`)
    assert(info.play.right + 5 < info.selector.left && Math.abs(info.play.top - info.selector.top) < 5,
      `Play/Pause must remain left of and aligned to the selector at ${width}px`)
    const graph = page.locator('.hero-v4-mobile .hero-v4-neuron-core')
    const points = await graph.evaluateAll(nodes => nodes.map(n => {
      const r = n.getBoundingClientRect()
      return { top: r.top, bottom: r.bottom }
    }))
    const center = (Math.min(...points.map(x => x.top)) + Math.max(...points.map(x => x.bottom))) / 2
    assert(center > info.scene.top + info.scene.height * .24 &&
           center < info.scene.top + info.scene.height * .81,
      `Mobile neural graph drifted from stage center at ${width}px`)
  } else {
    assert(info.graphicTop.startsWith('-'), 'Desktop graph plane must be lifted above V11')
    assert(info.firstGraphNodeTop !== null && info.firstGraphNodeTop < info.heading.bottom,
      `Desktop upper node must rise beside the Hero headline: ${JSON.stringify(info)}`)
    assert(info.graphic.left > info.copy.left + info.copy.width * .6,
      'Desktop graph should remain in the right-hand design area')
  }

  await tabs.locator('button').nth(1).click()
  assert.equal(await stage.getAttribute('data-phase'), 'code')
  await tabs.locator('button').nth(2).click()
  assert.equal(await stage.getAttribute('data-phase'), 'hamnet')
  await tabs.locator('button').first().click()
  assert.equal(await stage.getAttribute('data-phase'), 'neural')
  assert.equal(await tabs.locator('button').first().getAttribute('aria-pressed'), 'true')
  await page.screenshot({ path: `test-results/hero-v12-${width}-${locale}.png`, fullPage: false })
  assert.deepEqual(errors, [], `Browser errors at ${width}px/${locale}`)
  report.checks.push({ width, locale, labels, info })
  console.log('PASS V12', width, locale, 'chips grouped, three scenes, compact controls, desktop graph lift')
  await context.close()
}
try {
  await mkdir('test-results', { recursive: true })
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  for (const [w, h] of [[320, 780], [360, 800], [390, 844], [430, 932], [600, 940],
                       [768, 1024], [900, 900], [1024, 768], [1440, 900]]) {
    await inspect(w, h, 'en-US')
  }
  for (const [w, h] of [[320, 780], [390, 844], [600, 940], [1440, 900]]) {
    await inspect(w, h, 'pt-BR')
  }
  console.log('PASS Hero V12 EN/PT: mobile chips and controls, 3-scene navigation, lifted desktop graph')
} catch (e) {
  report.errors.push(String(e?.stack || e))
  console.error('FAIL Hero V12', e)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch { server.kill('SIGTERM') }
  await writeFile('test-results/hero-v12-results.json', JSON.stringify(report, null, 2))
}
