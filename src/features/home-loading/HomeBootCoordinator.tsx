import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { LoadingPortal } from '../../components/loading-portal/LoadingPortal'
import { HomeMotionProvider } from './HomeMotionContext'
import {
  BOOT_WEIGHTS, markHomeBoot, measureHomeBoot,
  waitForHomeDom, waitForHeroMedia, waitForFonts, waitForOpeningArt,
  type BootOutcome, type HomeBootTask,
} from './preloadCriticalResources'
import './home-boot.css'

type BootState = 'initializing' | 'loading' | 'ready' | 'opening' | 'opened' | 'degraded' | 'error'
type Results = Partial<Record<HomeBootTask, BootOutcome>>
const SESSION_KEY = 'lcr-loading-portal-v1-opened'

function readSession() {
  try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}
function recordSession() {
  try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* private mode */ }
}

/**
 * The REAL mounted Home stays under an accessible, blocking portal.
 * Progress is weighted completed tasks; it never represents network bytes.
 * Supabase, below-fold galleries and optional third-party services are not
 * readiness requirements. The artwork and Lab are unchanged.
 */
export function HomeBootCoordinator({ children }: { children: ReactNode }) {
  const location = useLocation()
  const home = location.pathname === '/'
  const force = new URLSearchParams(location.search).get('portal')
  const [gate] = useState(() => home && force !== 'skip' && (force === 'replay' || !readSession()))
  const active = home && gate
  const [state, setState] = useState<BootState>(() => gate ? 'initializing' : 'opened')
  const [results, setResults] = useState<Results>({})
  const [displayProgress, setDisplayProgress] = useState(() => gate ? 0 : 100)
  const [slow, setSlow] = useState(false)
  const [homeSafe, setHomeSafe] = useState(false)
  const [openingArtOk, setOpeningArtOk] = useState(false)

  const permittedToAnimate = !active || state === 'opened'
  const completed = Object.entries(results).reduce(
    (sum, [name, outcome]) => sum + (outcome ? BOOT_WEIGHTS[name as HomeBootTask] : 0), 0,
  )
  const targetProgress = homeSafe ? completed : Math.min(completed, 95)
  const ready = homeSafe && completed === 100 && ['ready', 'degraded', 'opening', 'opened'].includes(state)
  const showPortal = active && state !== 'opened'

  const mark = useCallback((task: HomeBootTask, outcome: BootOutcome) => {
    setResults(previous => ({ ...previous, [task]: outcome }))
    markHomeBoot(`home-boot:${task}:${outcome}`)
  }, [])

  useEffect(() => {
    if (!active || state === 'opened') return
    let cancelled = false
    const outcomes: Results = {}
    markHomeBoot('portal-mounted')
    setState('loading')
    const apply = (task: HomeBootTask, outcome: BootOutcome) => {
      if (cancelled) return
      outcomes[task] = outcome
      mark(task, outcome)
    }
    const domTask = waitForHomeDom().then(outcome => {
      apply('home-render', outcome)
      if (outcome === 'ok' && !cancelled) {
        setHomeSafe(true)
        markHomeBoot('home-render-ready')
        return waitForHeroMedia().then(media => {
          apply('hero-media', media)
          return media
        })
      }
      return 'fallback' as const
    })
    const tasks = [
      domTask,
      waitForFonts().then(outcome => apply('fonts', outcome)),
      waitForOpeningArt().then(outcome => {
        apply('door-art', outcome)
        if (!cancelled) setOpeningArtOk(outcome === 'ok')
      }),
    ]
    void Promise.all(tasks).then(() => {
      if (cancelled) return
      const rendered = Boolean(document.querySelector('main.portfolio-home .hero-v3'))
      if (!rendered) {
        setState('error')
        return
      }
      markHomeBoot('home-critical-resources-ready')
      // Readiness is deliberately independent of remote CMS completion.
      setState(Object.values(outcomes).some(value => value === 'fallback') ? 'degraded' : 'ready')
    }).catch(() => {
      if (!cancelled) setState('error')
    })
    const slowTimer = window.setTimeout(() => { if (!cancelled) setSlow(true) }, 7000)
    const faultTimer = window.setTimeout(() => {
      if (!cancelled && !document.querySelector('main.portfolio-home .hero-v3')) {
        setState('error')
      }
    }, 12000)
    return () => {
      cancelled = true
      window.clearTimeout(slowTimer)
      window.clearTimeout(faultTimer)
    }
  // Run once for this boot instance; results and state changes are outputs,
  // not reasons to restart downloads.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mark])

  useEffect(() => {
    if (!showPortal) return
    let frame = 0
    let last = 0
    const tick = (now: number) => {
      if (!last) last = now
      const delta = Math.min(now - last, 80)
      last = now
      setDisplayProgress(old => {
        const goal = ready ? 100 : Math.min(99, targetProgress)
        return old >= goal ? old : Math.min(goal, old + delta * .09)
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [showPortal, ready, targetProgress])

  useEffect(() => {
    if (!showPortal) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [showPortal])

  // Failed decorative door art cannot hold a safely mounted Home hostage.
  useEffect(() => {
    if (!active || !homeSafe || !ready || openingArtOk || state !== 'degraded') return
    const timer = window.setTimeout(() => {
      recordSession()
      setState('opened')
      markHomeBoot('portal-opened')
      markHomeBoot('home-animation-started')
    }, 450)
    return () => window.clearTimeout(timer)
  }, [active, homeSafe, ready, openingArtOk, state])

  const opened = useCallback(() => {
    recordSession()
    setState('opened')
    markHomeBoot('portal-opened')
    measureHomeBoot('portal-total', 'portal-mounted', 'portal-opened')
    markHomeBoot('home-animation-started')
  }, [])
  const skip = () => {
    if (!document.querySelector('main.portfolio-home .hero-v3')) return
    opened()
  }

  return (
    <HomeMotionProvider enabled={permittedToAnimate}>
      <div
        className="home-boot-app"
        data-testid="home-boot-app"
        data-boot-state={active ? state : 'bypassed'}
        data-home-ready={homeSafe ? 'true' : 'false'}
        aria-hidden={showPortal ? 'true' : undefined}
        ref={node => {
          if (!node) return
          if (showPortal) node.setAttribute('inert', '')
          else node.removeAttribute('inert')
        }}
      >
        {children}
      </div>
      {showPortal && (
        <div className="home-boot-overlay" data-testid="home-boot-overlay" data-boot-state={state}>
          {openingArtOk || !ready ? (
            <LoadingPortal
              progress={displayProgress}
              ready={ready && openingArtOk && state !== 'error'}
              onOpening={() => {
                setState('opening')
                markHomeBoot('portal-opening')
              }}
              onOpened={opened}
            />
          ) : null}
          {(slow || state === 'error' || (ready && !openingArtOk)) && (
            <div className="home-boot-recovery" role="status" aria-live="polite">
              <p>{state === 'error'
                ? 'Não foi possível preparar a capa automaticamente.'
                : ready && !openingArtOk
                  ? 'A animação da porta não pôde ser carregada.'
                  : 'O carregamento está demorando mais que o esperado.'}</p>
              {homeSafe && (
                <button type="button" data-testid="home-boot-continue" onClick={skip}>
                  Abrir portfólio
                </button>
              )}
              <button type="button" onClick={() => window.location.reload()}>
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      )}
    </HomeMotionProvider>
  )
}
