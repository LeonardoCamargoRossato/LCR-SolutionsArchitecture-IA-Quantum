import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { HeroGraphDesktop, HeroGraphMobile } from './AiSystemsGraph'
import { EngineeringWorkspace } from './EngineeringWorkspace'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Hero V3: one seamless background visual rather than a demo widget.
 * - CSS/SVG animates the scatter -> convergence -> engineering sequence.
 * - requestAnimationFrame runs only after mouse movement, never as a loop.
 * - Observer, document visibility, motion preferences and explicit pause
 *   stop animation entirely when it cannot benefit the visitor.
 */
export function InteractiveAiVisual({ locale }: { locale: 'pt-BR' | 'en-US' }) {
  const root = useRef<HTMLDivElement>(null)
  const pointerFrame = useRef<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia(REDUCED_MOTION).matches)
  const [inViewport, setInViewport] = useState(true)
  const [documentVisible, setDocumentVisible] = useState(() => !document.hidden)
  const playing = !paused && !reduced && inViewport && documentVisible

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION)
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => setDocumentVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => {
    const node = root.current
    if (!node || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry?.isIntersecting ?? true),
      { threshold: 0.03 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current)
  }, [])

  const clearParallax = () => {
    const el = root.current
    if (pointerFrame.current !== null) {
      cancelAnimationFrame(pointerFrame.current)
      pointerFrame.current = null
    }
    if (!el) return
    el.style.setProperty('--hero-shift-back-x', '0px')
    el.style.setProperty('--hero-shift-back-y', '0px')
    el.style.setProperty('--hero-shift-front-x', '0px')
    el.style.setProperty('--hero-shift-front-y', '0px')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!playing || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return
    if (window.innerWidth <= 900 || pointerFrame.current !== null) return

    const element = event.currentTarget
    const rect = element.getBoundingClientRect()
    const offsetX = (event.clientX - rect.left) / Math.max(rect.width, 1) * 2 - 1
    const offsetY = (event.clientY - rect.top) / Math.max(rect.height, 1) * 2 - 1
    pointerFrame.current = requestAnimationFrame(() => {
      pointerFrame.current = null
      const x = Math.max(-1, Math.min(1, offsetX))
      const y = Math.max(-1, Math.min(1, offsetY))
      element.style.setProperty('--hero-shift-back-x', `${(-x * 10).toFixed(1)}px`)
      element.style.setProperty('--hero-shift-back-y', `${(-y * 7).toFixed(1)}px`)
      element.style.setProperty('--hero-shift-front-x', `${(x * 15).toFixed(1)}px`)
      element.style.setProperty('--hero-shift-front-y', `${(y * 11).toFixed(1)}px`)
    })
  }

  return (
    <div
      ref={root}
      className="hero-graph-field"
      data-testid="interactive-ai-visual"
      data-playing={playing ? 'true' : 'false'}
      data-reduced={reduced ? 'true' : 'false'}
      data-layout="responsive-graph"
      onPointerMove={onPointerMove}
      onPointerLeave={clearParallax}
      role="group"
      aria-label={locale === 'pt-BR'
        ? 'Grafo interativo de inteligência artificial que conecta dados, recuperação e raciocínio'
        : 'Interactive intelligent systems graph connecting data, retrieval, and reasoning'}
    >
      <div className="hero-graph-visual" aria-hidden="true">
        <HeroGraphDesktop />
        <HeroGraphMobile />
        <EngineeringWorkspace />
      </div>
      <span className="sr-only">
        {locale === 'pt-BR'
          ? 'Nós e conexões dispersos convergem para um núcleo de inteligência e revelam uma representação conceitual de engenharia de software. Sem processamento real de dados.'
          : 'Scattered nodes and connections converge into an intelligence core and reveal a conceptual software engineering trace. No data is processed.'}
      </span>
      <button
        type="button"
        className="hero-graph-motion-control"
        disabled={reduced}
        aria-label={reduced
          ? (locale === 'pt-BR' ? 'Animação desativada pela preferência de movimento reduzido' : 'Animation disabled by reduced motion preference')
          : paused
            ? (locale === 'pt-BR' ? 'Reativar animação do grafo' : 'Resume graph animation')
            : (locale === 'pt-BR' ? 'Pausar animação do grafo' : 'Pause graph animation')}
        title={paused ? 'Play' : 'Pause'}
        onClick={() => setPaused((old) => !old)}
      >
        {paused || reduced ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      </button>
    </div>
  )
}
