import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AiSystemsGraph } from './AiSystemsGraph'
import { EngineeringWorkspace } from './EngineeringWorkspace'

type Scene = 'graph' | 'workspace'
const CYCLE_MS = 7_000
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * One 7s timer at a time; CSS/SVG owns all per-frame motion.
 * Automatic cycling pauses on hover, keyboard focus, offscreen, hidden tab,
 * user pause and reduced-motion preference. Manual selection stops auto
 * until the user explicitly resumes.
 */
export function InteractiveAiVisual({ locale }: { locale: 'pt-BR' | 'en-US' }) {
  const root = useRef<HTMLDivElement>(null)
  const [scene, setScene] = useState<Scene>('graph')
  const [reduced, setReduced] = useState(() => window.matchMedia(REDUCED_QUERY).matches)
  const [auto, setAuto] = useState(() => !window.matchMedia(REDUCED_QUERY).matches)
  const [visible, setVisible] = useState(true)
  const [tabVisible, setTabVisible] = useState(() => !document.hidden)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const running = auto && !reduced && visible && tabVisible && !hovered && !focused

  useEffect(() => {
    const media = window.matchMedia(REDUCED_QUERY)
    const update = () => {
      setReduced(media.matches)
      if (media.matches) setAuto(false)
    }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => {
    const node = root.current
    if (!node || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.07 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!running) return
    const timeout = window.setTimeout(() => {
      setScene((previous) => previous === 'graph' ? 'workspace' : 'graph')
    }, CYCLE_MS)
    return () => window.clearTimeout(timeout)
  }, [running, scene])

  const selectScene = (next: Scene) => {
    setScene(next)
    setAuto(false)
  }
  const pt = locale === 'pt-BR'
  const toggleAuto = () => {
    if (reduced) return
    setAuto((previous) => !previous)
  }

  return (
    <div
      ref={root}
      className="ai-engine"
      data-testid="interactive-ai-visual"
      data-state={scene}
      data-auto={auto ? 'on' : 'off'}
      data-running={running ? 'true' : 'false'}
      data-reduced={reduced ? 'true' : 'false'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
      }}
      role="region"
      aria-label={pt ? 'Visualização interativa da arquitetura de IA e engenharia de software' : 'Interactive AI architecture and software engineering visualization'}
    >
      <div className="ai-engine-toolbar">
        <span className="ai-engine-brand">
          <span className="ai-engine-brand-mark" aria-hidden="true" />
          LCR / ENGINEERING
        </span>
        <span className="ai-engine-mode" aria-live="off">
          {scene === 'graph' ? 'INTELLIGENT SYSTEMS' : 'SOFTWARE WORKSPACE'}
        </span>
      </div>

      <div className="ai-engine-stage">
        <div className="ai-engine-scene ai-engine-scene--graph" aria-hidden={scene !== 'graph'}>
          <AiSystemsGraph />
        </div>
        <div className="ai-engine-scene ai-engine-scene--workspace" aria-hidden={scene !== 'workspace'}>
          <EngineeringWorkspace />
        </div>
      </div>

      <div className="ai-engine-footer">
        <div className="ai-engine-tabs" role="group" aria-label={pt ? 'Escolher visualização' : 'Choose visualization'}>
          <button
            type="button"
            className="ai-engine-switch"
            onClick={() => selectScene('graph')}
            aria-pressed={scene === 'graph'}
          >
            AI Systems
          </button>
          <button
            type="button"
            className="ai-engine-switch"
            onClick={() => selectScene('workspace')}
            aria-pressed={scene === 'workspace'}
          >
            Engineering Workspace
          </button>
        </div>
        <button
          type="button"
          className="ai-engine-playback"
          disabled={reduced}
          onClick={toggleAuto}
          aria-label={
            reduced
              ? (pt ? 'Alternância automática indisponível com movimento reduzido' : 'Auto cycle unavailable with reduced motion')
              : auto
                ? (pt ? 'Pausar alternância automática' : 'Pause automatic switching')
                : (pt ? 'Retomar alternância automática' : 'Resume automatic switching')
          }
          title={
            reduced
              ? (pt ? 'Movimento reduzido ativado' : 'Reduced motion enabled')
              : auto ? (pt ? 'Pausar' : 'Pause') : (pt ? 'Retomar' : 'Resume')
          }
        >
          {auto ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}
