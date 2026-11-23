import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = 'http://127.0.0.1:5173/LCR-SolutionsArchitecture-IA-Quantum/'
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
  env: process.env, stdio: 'ignore', detached: true,
})
const MAIN = ['Foton Hub', 'Cities Comparing', 'AnimeFinder']
const MORE = ['Hamlet', 'WebSeer', 'MetCompB']
const H1 = 'AI Engineering & Software Development'
const SUBTITLE = 'Building Intelligent Solutions.'
const report = { tests: [], failures: [] }
let browser

async function ready() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(base)).ok) return } catch {}
    await new Promise((resolve) => setTimeout(resolve, 350))
  }
  throw new Error('Vite did not start')
}

async function checkHomepage(page, label) {
  await page.goto(base + '#/', { waitUntil: 'domcontentloaded' })
  await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 20000 })
  await page.waitForFunction(() => {
    const names = [...document.querySelectorAll('.selected-grid .project-card-primary h3')].map((x) => x.textContent?.trim())
    return names.length === 3 && names[0] === 'Foton Hub' && names[1] === 'Cities Comparing' && names[2] === 'AnimeFinder'
  }, null, { timeout: 30000 })

  const info = await page.evaluate(() => {
    const h1 = document.querySelector('.hero-type-title')
    const subtitle = document.querySelector('.hero-identity-subtitle')
    const mainCards = [...document.querySelectorAll('.selected-grid .project-card-primary h3')].map((node) => node.textContent?.trim())
    const moreCards = [...document.querySelectorAll('.more-projects-grid .project-card-compact h3')].map((node) => node.textContent?.trim())
    return {
      locale: document.documentElement.lang,
      h1: h1?.getAttribute('aria-label'),
      h1Complete: h1?.getAttribute('data-typing-complete'),
      subtitle: subtitle?.textContent?.trim(),
      opacity: subtitle ? Number(getComputedStyle(subtitle).opacity) : 0,
      mainCards,
      moreCards,
      specializations: [...document.querySelectorAll('.hero-specializations > span')].map((x) => x.getAttribute('aria-label')),
      homeSeo: document.title,
      htmlWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      heroHeight: document.querySelector('.hero-type-title')?.getBoundingClientRect().height,
    }
  })
  const expectedH1 = info.locale === 'pt-BR' ? 'Engenheiro de IA e Desenvolvimento de Software' : H1
  assert.equal(info.h1, expectedH1)
  assert.equal(info.h1Complete, 'true')
  assert.equal(info.subtitle, info.locale === 'pt-BR' ? 'Construindo Soluções Inteligentes.' : SUBTITLE)
  await page.waitForFunction(() => {
    const el = document.querySelector('.hero-identity-subtitle')
    return !!el && Number(getComputedStyle(el).opacity) > .98
  }, null, { timeout: 4000 })
  assert.deepEqual(info.mainCards, MAIN)
  assert.equal(info.moreCards[0]?.includes(MORE[0]), true)
  assert.equal(info.moreCards[1]?.includes(MORE[1]), true)
  assert.equal(info.moreCards[2]?.includes(MORE[2]), true)
  assert.equal(new Set([...info.mainCards, ...info.moreCards]).size, info.mainCards.length + info.moreCards.length)
  assert.deepEqual(info.specializations, info.locale === 'pt-BR' ? ['LLMs e Agentes de IA','RAG e Recuperação Híbrida','Dados e Otimização','Computação Quântica'] : ['LLMs & AI Agents', 'RAG & Hybrid Retrieval', 'Data & Optimization', 'Quantum Computing'])
  assert(info.homeSeo.includes(expectedH1), 'SEO reverted after loading remote content: '+info.homeSeo)
  assert(info.htmlWidth <= info.viewportWidth + 2, 'Page horizontal overflow: '+JSON.stringify(info))
  assert(info.heroHeight > 0, 'Typing title reserved no layout height')
  await mkdir('test-results', { recursive: true })
  await page.screenshot({ path: `test-results/ai-positioning-home-${label}.png`, fullPage: false })
  report.tests.push({ name: 'homepage-'+label, ...info })
  console.log('PASS',label,'hero + ordering + bilingual context',JSON.stringify(info.mainCards),JSON.stringify(info.moreCards.slice(0,3)))
}

async function testViewport(name, viewport, reducedMotion) {
  const ctx = await browser.newContext({ viewport, reducedMotion: reducedMotion ? 'reduce' : 'no-preference' })
  const page = await ctx.newPage()
  await checkHomepage(page, name)
  // The flag picker must be accessible without opening the mobile menu.
  const language = page.locator('.language-picker-trigger')
  assert(await language.isVisible(), 'Language selector must be visible in the header')
  await language.click()
  await page.getByRole('button', { name: /EN USA/ }).last().click()
  await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor({ timeout: 15000 })
  assert.equal(await page.locator('.hero-type-title').getAttribute('aria-label'), H1)
  assert.equal(await page.locator('.hero-identity-subtitle').innerText(), SUBTITLE)
  assert((await page.locator('.hero-description').innerText()).includes('hybrid RAG'))
  await language.click()
  await page.getByRole('button', { name: /PT BR/ }).last().click()
  assert.equal(await page.locator('.hero-type-title').getAttribute('aria-label'), 'Engenheiro de IA e Desenvolvimento de Software')
  assert((await page.locator('.hero-description').innerText()).includes('RAG híbrido'))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await checkHomepage(page, name+'-reload')

  // Case routes must continue to work using the shared existing components.
  for (const slug of ['animefinder', 'hamlet', 'foton-hub', 'cities-comparing', 'webseer']) {
    await page.goto(base + '#/projects/' + slug, { waitUntil: 'domcontentloaded' })
    await page.locator('.case-story-hero h1').waitFor({ timeout: 16000 })
    assert(!(await page.locator('.not-found').count()), 'Case is missing: '+slug)
    const found = await page.locator('.case-story-hero h1').innerText()
    if(slug === 'animefinder') assert(found.includes('AnimeFinder'))
    if(slug === 'hamlet') assert(found.includes('Hamlet'))
    const seo = await page.title()
    assert(seo.includes('Leonardo Camargo Rossato'), 'SEO case title not updated: '+seo)
    if(slug === 'animefinder') {
      assert((await page.locator('.case-story-content').innerText()).includes('pgvector'),
        'AnimeFinder architecture missing pgvector evidence')
      assert((await page.locator('.case-story-content').innerText()).includes('Gemini'),
        'AnimeFinder architecture missing Gemini context')
    }
    if(slug === 'hamlet') {
      assert((await page.locator('.case-story-content').innerText()).includes('RAG'),
        'Hamlet case missing documented RAG scope')
    }
    report.tests.push({ name: name+'-case-'+slug, title: found, seo })
    console.log('PASS',name,'case',slug)
  }
  await ctx.close()
}

try {
  await ready()
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  await testViewport('desktop', { width: 1440, height: 900 }, false)
  await testViewport('mobile-reduced-motion', { width: 390, height: 844 }, true)
  console.log('PASS: Hero, ordering, CMS hydration, bilingual copy, responsive and case routes')
} catch (error) {
  report.failures.push(String(error))
  console.error('PORTFOLIO AI POSITIONING SMOKE FAILED:',error)
  process.exitCode = 1
} finally {
  if(browser) await browser.close()
  try { process.kill(-server.pid,'SIGTERM') } catch {}
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/ai-positioning-smoke.json', JSON.stringify(report,null,2))
}
