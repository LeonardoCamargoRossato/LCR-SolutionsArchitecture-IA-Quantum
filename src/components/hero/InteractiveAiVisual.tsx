import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { HeroGraphDesktop, HeroGraphMobile } from './AiSystemsGraph'
import { EngineeringWorkspace } from './EngineeringWorkspace'
import { HeroBackgroundGraph } from './HeroBackgroundGraph'

type Phase = 'neural' | 'code' | 'hamnet'
// Three interactive scenes, starting directly with the AI graph.
// The original scatter SVG source stays archived in AiSystemsGraph for provenance.
const PHASES: readonly Phase[] = ['neural', 'code', 'hamnet']
const DURATION: Record<Phase, number> = {
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
  const [phase, setPhase] = useState<Phase>('neural')
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

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || !visible || !documentVisible || phase !== 'neural' || window.innerWidth <= 900 || event.pointerType === 'touch') return
    if (event.button !== 0) return
    drag.current = {
      x: event.clientX, y: event.clientY,
      yaw: rotation.current.yaw, pitch: rotation.current.pitch,
    }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || reduced || !visible || !documentVisible) return
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
  const sceneOptions: { phase: Phase; label: string }[] = pt
    ? [
        { phase: 'neural', label: 'Rede IA' },
        { phase: 'code', label: 'Código' },
        { phase: 'hamnet', label: 'Hamlet AI' },
      ]
    : [
        { phase: 'neural', label: 'AI Graph' },
        { phase: 'code', label: 'Code' },
        { phase: 'hamnet', label: 'Hamlet AI' },
      ]
  const selectScene = (selected: Phase) => {
    setPhase(selected)
    // Deliberate selection stays in place until Play is pressed.
    setPaused(true)
    if (selected === 'hamnet') setReplayKey((key) => key + 1)
  }

  return (
    <div
      ref={root}
      className="hero-graph-field hero-graph-field--v4 hero-graph-field--v5"
      data-testid="interactive-ai-visual"
      data-phase={phase}
      data-playing={playing ? 'true' : 'false'}
      data-reduced={reduced ? 'true' : 'false'}
      data-dragging={dragging ? 'true' : 'false'}
      role="group"
      aria-label={pt ? 'Visualização de rede neural, código e Hamlet AI' : 'AI neural graph, code and Hamlet AI visualization'}
    >
      <HeroBackgroundGraph />
      <div className="hero-v4-art" aria-hidden="true">
        <div className="hero-v4-desktop"><HeroGraphDesktop locale={locale} /></div>
        <div className="hero-v4-mobile"><HeroGraphMobile locale={locale} /></div>
      </div>
      <EngineeringWorkspace
        locale={locale}
        active={phase === 'hamnet'}
        replayKey={replayKey}
        onReplay={() => {
          setReplayKey((key) => key + 1)
          // A replay click is a deliberate request to run the conversation.
          if (!reduced) setPaused(false)
        }}
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
          ? 'Visualização conceitual de camadas neurais, geração de código e uma conversa ilustrativa com Hamlet AI. Não há conexão com IA nesta animação.'
          : 'Conceptual visual: neural layers, generated source code and a simulated Hamlet AI conversation. No live AI connection.'}
      </span>
      <div
        className="hero-v5-stage-selector"
        data-testid="hero-v5-stage-selector"
        role="group"
        aria-label={pt ? 'Selecionar etapa da visualização' : 'Select a visualization stage'}
      >
        {sceneOptions.map(({ phase: option, label }) => (
          <button
            key={option}
            type="button"
            className="hero-v5-stage-button"
            aria-pressed={phase === option}
            onClick={() => selectScene(option)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="hero-v4-stage-marker" aria-hidden="true">
        {phase === 'neural' ? (pt ? 'ARQUITETURA NEURAL' : 'NEURAL ARCHITECTURE') : phase === 'code' ? (pt ? 'GERAÇÃO DE SOFTWARE' : 'SOFTWARE GENERATION') : 'HAMLET AI'}
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
