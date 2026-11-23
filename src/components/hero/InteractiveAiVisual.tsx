import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { HeroGraphDesktop, HeroGraphMobile } from './AiSystemsGraph'
import { EngineeringWorkspace } from './EngineeringWorkspace'
import { HeroBackgroundGraph } from './HeroBackgroundGraph'

type Phase = 'scatter' | 'neural' | 'code' | 'hamnet'
const PHASES: readonly Phase[] = ['scatter', 'neural', 'code', 'hamnet']
const DURATION: Record<Phase, number> = {
  scatter: 3300,
  neural: 7900,
  code: 5600,
  hamnet: 6600,
}
const REDUCED = '(prefers-reduced-motion: reduce)'
type DragOrigin = { x: number; y: number; yaw: number; pitch: number }

/**
 * The only timer advances the scene at a human-readable pace.
 * CSS animates the graphics. Pointer/keyboard controls manipulate a small
 * 2.5D transform; pointer updates are coalesced into one frame on demand.
 */
export function InteractiveAiVisual({ locale }: { locale: 'pt-BR' | 'en-US' }) {
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)
  const drag = useRef<DragOrigin | null>(null)
  const rotation = useRef({ yaw: -6, pitch: 5 })
  const [reduced, setReduced] = useState(() => window.matchMedia(REDUCED).matches)
  const [phase, setPhase] = useState<Phase>(() => window.matchMedia(REDUCED).matches ? 'neural' : 'scatter')
  const [paused, setPaused] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [visible, setVisible] = useState(true)
  const [documentVisible, setDocumentVisible] = useState(() => !document.hidden)
  const playing = !paused && !reduced && visible && documentVisible

  useEffect(() => {
    const preference = window.matchMedia(REDUCED)
    const update = () => {
      setReduced(preference.matches)
      if (preference.matches) setPhase('neural')
    }
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    if (!root.current || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { threshold: 0.035 },
    )
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || dragging) return
    const timeout = window.setTimeout(() => {
      setPhase((old) => PHASES[(PHASES.indexOf(old) + 1) % PHASES.length])
    }, DURATION[phase])
    return () => window.clearTimeout(timeout)
  }, [playing, dragging, phase])

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
  }, [])

  const applyRotation = (yaw: number, pitch: number) => {
    rotation.current = {
      yaw: Math.max(-23, Math.min(23, yaw)),
      pitch: Math.max(-15, Math.min(15, pitch)),
    }
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      root.current?.style.setProperty('--neural-tilt-y', `${rotation.current.yaw.toFixed(1)}deg`)
      root.current?.style.setProperty('--neural-tilt-x', `${rotation.current.pitch.toFixed(1)}deg`)
    })
  }

  const onBackdropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || !visible || !documentVisible || window.innerWidth <= 900 || event.pointerType === 'touch') return
    const x = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth) * 2 - 1))
    const y = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight) * 2 - 1))
    // Very small presentation-only parallax; no React render or RAF loop.
    event.currentTarget.style.setProperty('--fabric-parallax-x', `${(x * 9).toFixed(1)}px`)
    event.currentTarget.style.setProperty('--fabric-parallax-y', `${(y * 7).toFixed(1)}px`)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!playing || phase !== 'neural' || window.innerWidth <= 900 || event.pointerType === 'touch') return
    if (event.button !== 0) return
    drag.current = {
      x: event.clientX, y: event.clientY,
      yaw: rotation.current.yaw, pitch: rotation.current.pitch,
    }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !playing) return
    applyRotation(
      drag.current.yaw + (event.clientX - drag.current.x) * .13,
      drag.current.pitch - (event.clientY - drag.current.y) * .10,
    )
  }

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onKeyboardRotate = (event: KeyboardEvent<HTMLDivElement>) => {
    if (phase !== 'neural' || reduced) return
    const change: Record<string, [number, number]> = {
      ArrowLeft: [-4, 0], ArrowRight: [4, 0],
      ArrowUp: [0, -4], ArrowDown: [0, 4],
    }
    if (!change[event.key]) return
    event.preventDefault()
    applyRotation(rotation.current.yaw + change[event.key][0], rotation.current.pitch + change[event.key][1])
  }

  const pt = locale === 'pt-BR'
  return (
    <div
      ref={root}
      className="hero-graph-field hero-graph-field--v4 hero-graph-field--v5"
      data-testid="interactive-ai-visual"
      data-phase={phase}
      data-playing={playing ? 'true' : 'false'}
      data-reduced={reduced ? 'true' : 'false'}
      data-dragging={dragging ? 'true' : 'false'}
      onPointerMove={onBackdropPointerMove}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--fabric-parallax-x', '0px')
        event.currentTarget.style.setProperty('--fabric-parallax-y', '0px')
      }}
      role="group"
      aria-label={pt ? 'Animação da evolução de dados em redes neurais, código e AI Hamnet' : 'From scattered data to neural layers, code and AI Hamnet'}
    >
      <HeroBackgroundGraph />
      <div className="hero-v4-art" aria-hidden="true">
        <div className="hero-v4-desktop"><HeroGraphDesktop /></div>
        <div className="hero-v4-mobile"><HeroGraphMobile /></div>
      </div>
      <EngineeringWorkspace
        locale={locale}
        active={phase === 'hamnet'}
        replayKey={replayKey}
        onReplay={() => setReplayKey(key => key + 1)}
      />

      <div
        className="hero-v4-interaction"
        data-testid="hero-v4-drag-target"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onKeyDown={onKeyboardRotate}
        role="group"
        tabIndex={phase === 'neural' ? 0 : -1}
        aria-label={pt
          ? 'Explorar camadas neurais: arraste com o mouse ou use as teclas de seta'
          : 'Explore the neural layers: drag with mouse or use arrow keys'}
      />
      <span className="hero-v4-visually-hidden">
        {pt
          ? 'Visualização conceitual: fluxos binários convergem de um grafo em perspectiva para camadas neurais, código e uma conversa ilustrativa com AI Hamnet. Não há conexão com IA nesta animação.'
          : 'Conceptual visual: binary packets flow through a perspective data network into neural layers, source code and a simulated AI Hamnet conversation. No live AI connection.'}
      </span>
      <div className="hero-v4-stage-marker" aria-hidden="true">
        {phase === 'scatter' ? 'DATA INPUT' : phase === 'neural' ? 'NEURAL ARCHITECTURE' : phase === 'code' ? 'SOFTWARE GENERATION' : 'AI HAMNET'}
        {phase === 'neural' && !reduced ? <span className="hero-v4-drag-hint"> · {pt ? 'ARRASTE PARA EXPLORAR' : 'DRAG TO EXPLORE'}</span> : null}
      </div>
      <button
        type="button"
        className="hero-graph-motion-control"
        disabled={reduced}
        aria-label={reduced
          ? (pt ? 'Animação desativada por preferência de movimento reduzido' : 'Animation disabled by reduced motion preference')
          : paused
            ? (pt ? 'Reiniciar animação do grafo' : 'Resume graph animation')
            : (pt ? 'Pausar animação do grafo' : 'Pause graph animation')}
        onClick={() => setPaused((old) => !old)}
      >
        {paused || reduced ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      </button>
    </div>
  )
}
