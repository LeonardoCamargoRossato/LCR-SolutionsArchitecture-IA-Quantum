/** Verify actual first-view resources, not simulated byte percentages.
 * Local content is renderable without remote CMS and Supabase responses.
 */
export type HomeBootTask = 'home-render' | 'hero-media' | 'fonts' | 'door-art'
export type BootOutcome = 'ok' | 'fallback'

export const BOOT_WEIGHTS: Record<HomeBootTask, number> = {
  'home-render': 40,
  'hero-media': 30,
  'fonts': 10,
  'door-art': 20,
}

export function markHomeBoot(name: string) {
  try { performance.mark(name) } catch { /* performance API unavailable */ }
}

export function measureHomeBoot(name: string, start: string, end: string) {
  try { performance.measure(name, start, end) } catch { /* no measurement */ }
}

export function waitForHomeDom(timeoutMs = 9500): Promise<BootOutcome> {
  const ready = () => {
    const header = document.querySelector('header.site-header')
    const hero = document.querySelector('main.portfolio-home .hero-v3')
    const graph = document.querySelector('[data-testid="interactive-ai-visual"]')
    return Boolean(header && hero && graph)
  }
  if (ready()) return Promise.resolve('ok')
  return new Promise(resolve => {
    let done = false
    const finish = (outcome: BootOutcome) => {
      if (done) return
      done = true
      observer.disconnect()
      clearTimeout(timer)
      resolve(outcome)
    }
    const observer = new MutationObserver(() => { if (ready()) finish('ok') })
    observer.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true })
    const timer = window.setTimeout(() => finish('fallback'), timeoutMs)
    if (ready()) finish('ok')
  })
}

function timeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise(resolve => {
    let finished = false
    const timer = window.setTimeout(() => {
      if (!finished) { finished = true; resolve(fallback) }
    }, ms)
    promise.then(value => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      resolve(value)
    }).catch(() => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      resolve(fallback)
    })
  })
}

/** Timeout is a fallback result, never a fake 'downloaded' state. */
export async function waitForHeroMedia(): Promise<BootOutcome> {
  const hero = document.querySelector<HTMLImageElement>('[data-testid="hero-v6-blue-code"]')
  if (!hero) return 'fallback'
  try {
    const result = await timeout(hero.decode().then(() => hero.naturalWidth > 0), 2700, false)
    return result ? 'ok' : 'fallback'
  } catch {
    return 'fallback'
  }
}

export async function waitForFonts(): Promise<BootOutcome> {
  if (!('fonts' in document)) return 'fallback'
  const result = await timeout(document.fonts.ready.then(() => true), 1900, false)
  return result ? 'ok' : 'fallback'
}

/** Door opening art needs decode before the transition, not necessarily the
 * intermediate 8 keyframes: those load progressively as the real tasks finish.
 */
export async function waitForOpeningArt(): Promise<BootOutcome> {
  const base = `${import.meta.env.BASE_URL}assets/home/loading-portal/`
  const sources = ['door-open-base.webp', 'lock-core.webp']
  const decoded = await Promise.all(sources.map(async name => {
    const image = new Image()
    image.decoding = 'async'
    image.src = base + name
    try {
      return await timeout(image.decode().then(() => image.naturalWidth > 0), 3700, false)
    } catch {
      return false
    }
  }))
  return decoded.every(Boolean) ? 'ok' : 'fallback'
}
