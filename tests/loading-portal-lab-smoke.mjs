import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:5197/LCR-SolutionsArchitecture-IA-Quantum/'
const LAB = BASE + '#/test-component-lab'
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5197', '--strictPort'], {
  env: process.env, detached: true, stdio: 'ignore',
})
let browser
const report = { checks: [], errors: [] }
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
async function ready() {
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(BASE)).ok) return } catch {}
    await pause(250)
  }
  throw Error('Vite not ready')
}
async function seek(page, value) {
  await page.getByTestId('portal-progress').evaluate((input, n) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(input, String(n))
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}
async function inspect(name, width, height, reduced) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const errors = []
  const broken = []
  const remote = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('request', req => { if (/supabase[.]co/.test(req.url())) remote.push(req.url()) })
  page.on('response', response => {
    if (response.url().includes('/assets/home/loading-portal/') && response.status() >= 400)
      broken.push(response.url() + ':' + response.status())
  })
  await page.goto(LAB, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('test-component-lab').waitFor()
  const switcher = page.getByTestId('lab-component-switch')
  assert.equal(await switcher.locator('button').count(), 2)
  assert.equal(await page.getByTestId('particle-wave-canvas').count(), 1,
    'Default Particle Wave editor must remain the initial experience')
  await switcher.getByRole('button', { name: 'Loading Portal' }).click()
  const portal = page.getByTestId('loading-portal')
  await portal.waitFor()
  assert.equal(await page.getByTestId('particle-wave-canvas').count(), 0,
    'Inactive Particle Wave must unmount its animation and timers')
  assert.equal(await portal.getAttribute('data-phase'), 'charging')
  assert.equal(await page.getByTestId('portal-progress').inputValue(), '0')
  assert.equal(await page.getByTestId('loading-portal-lab').count(), 1)
  assert.equal(await page.locator('header.site-header').count(), 0,
    'Component Lab must remain isolated from authenticated app/providers')

  const portalImages = page.locator('.lcr-loading-portal img')
  await page.waitForFunction(() => [...document.querySelectorAll('.lcr-loading-portal img')]
    .every(i => i.complete && i.naturalWidth > 0), null, { timeout: 7000 })
  assert.deepEqual(broken, [], 'All approved V1 WebPs must load; no placeholder or 404')
  assert.equal(await page.locator('.lcr-loading-portal__art').count(), 2,
    'First two keyframes should be available for interpolated crossfades')

  if (width < 500) await page.getByRole('button', { name: 'Mobile · 9:16' }).click()
  const stage = page.getByTestId('loading-portal-stage')
  const stageMetrics = await stage.evaluate(el => {
    const r = el.getBoundingClientRect()
    return { width: r.width, height: r.height, overflow: document.documentElement.scrollWidth - innerWidth }
  })
  assert(stageMetrics.overflow <= 2, 'No horizontal overflow')
  if (width < 500) assert(stageMetrics.height > stageMetrics.width,
    'Mobile reference should be portrait with the portal core in view')

  await seek(page, 50)
  await page.waitForFunction(() =>
    document.querySelector('[data-testid="loading-portal"] [role="progressbar"]')?.getAttribute('aria-valuenow') === '50')
  assert.equal(await portal.getAttribute('data-phase'), 'charging')
  await seek(page, 100)
  await page.waitForFunction(() =>
    document.querySelector('[data-testid="loading-portal"]')?.getAttribute('data-phase') === 'charged')
  await pause(350)
  assert.equal(await portal.getAttribute('data-phase'), 'charged',
    'Never open at 100% before the independent Ready signal')
  await page.getByLabel('Duração de abertura').fill('150')
  await page.getByLabel('Espera após carregamento').fill('0')
  await page.getByLabel('Ready para abrir').check()
  await page.waitForFunction(() =>
    document.querySelector('[data-testid="loading-portal"]')?.dataset.phase === 'opening', null, { timeout: 6000 })
  assert.equal(await page.locator('.lcr-loading-portal__leaf').count(), 2)
  assert.equal(await page.locator('.lcr-loading-portal__lock-core').count(), 1)
  await portal.waitFor({ state: 'detached', timeout: 7000 })
  assert((await page.getByTestId('loading-portal-lab').innerText()).includes('Porta aberta'),
    'Portal must open and reveal actual React demo backdrop')

  await page.getByTestId('portal-reset').click()
  await portal.waitFor()
  assert.equal(await portal.getAttribute('data-phase'), 'charging')
  assert.equal(await page.getByTestId('portal-progress').inputValue(), '0')
  await page.getByTestId('portal-simulate-error').click()
  assert((await page.getByTestId('loading-portal-lab').innerText()).includes('Falha simulada'))
  assert.equal(await page.getByLabel('Ready para abrir').isChecked(), false)
  await page.getByTestId('portal-replay').click()
  await page.waitForTimeout(150)
  const valueAfterReplay = Number(await page.getByTestId('portal-progress').inputValue())
  assert(valueAfterReplay > 0, 'Replay should resume simulated loading')
  await page.getByTestId('portal-play-pause').click()
  assert.equal(await page.getByTestId('portal-play-pause').innerText(), 'Play')
  await switcher.getByRole('button', { name: 'Particle Wave' }).click()
  await page.getByTestId('particle-wave-canvas').waitFor()
  await switcher.getByRole('button', { name: 'Loading Portal' }).click()
  assert.equal(await portal.getAttribute('data-phase'), 'charging',
    'Switching components should not retain a disposed door animation')
  assert.deepEqual(remote, [], 'Lab must not contact Supabase')
  assert.deepEqual(errors, [], 'Browser errors: ' + errors.join('; '))
  await mkdir('test-results', { recursive: true })
  await page.screenshot({ path: `test-results/loading-portal-v1-${name}.png`, fullPage: true })
  report.checks.push({ name, reduced, stageMetrics, assetsOk: true })
  console.log('PASS Loading Portal Lab', name)
  await context.close()
}
try {
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await inspect('desktop', 1440, 900, false)
  await inspect('mobile-reduced', 390, 844, true)
  console.log('PASS portal Lab: Ready gating, opening leaves, core, replay, mobile and reduced motion')
} catch(e) {
  report.errors.push(String(e?.stack || e))
  console.error('FAIL Loading Portal Lab', e)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch { server.kill('SIGTERM') }
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/loading-portal-v1-results.json', JSON.stringify(report, null, 2))
}
