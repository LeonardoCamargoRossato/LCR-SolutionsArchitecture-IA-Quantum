import { useEffect, useRef, useState } from 'react'
import { LoadingPortal } from '../../../components/loading-portal/LoadingPortal'
import './loading-portal-lab.css'
import { LoadingPortalV2Lab } from './LoadingPortalV2Lab'
import { PortalMotionEditor } from './PortalMotionEditor'

type Viewport = 'desktop' | 'tablet' | 'mobile'
const VIEWPORTS: Record<Viewport, { label: string; width: number; height: number }> = {
  desktop: { label: 'Desktop · 16:9', width: 1600, height: 900 },
  tablet: { label: 'Tablet · 4:3', width: 1200, height: 900 },
  mobile: { label: 'Mobile · 9:16', width: 390, height: 844 },
}
const DEMO_DURATION = 5600

/**
 * Isolated preview adapter. No auth, Router hooks, Supabase or Home readiness.
 * Lab progress is explicitly simulated; the production boot coordinator will
 * supply measurable tasks in a separately approved follow-up PR.
 */
function LoadingPortalV1Lab() {
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [slow, setSlow] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [holdMs, setHoldMs] = useState(550)
  const [openingMs, setOpeningMs] = useState(1600)
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [cycle, setCycle] = useState(0)
  const [opened, setOpened] = useState(false)
  const lastTime = useRef<number | null>(null)
  const paused = !playing || progress >= 100 || failed || opened

  useEffect(() => {
    if (paused) return
    let frame = 0
    let lastUpdate = 0
    let accumulated = 0
    const tick = (now: number) => {
      if (lastTime.current === null) lastTime.current = now
      accumulated += Math.min(100, Math.max(0, now - lastTime.current))
      lastTime.current = now
      if (now - lastUpdate >= 48) {
        lastUpdate = now
        const delta = accumulated
        accumulated = 0
        const rate = slow ? .18 : 1
        setProgress(value => Math.min(100, value + delta * speed * rate * 100 / DEMO_DURATION))
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      lastTime.current = null
    }
  }, [paused, speed, slow])

  const reset = () => {
    setPlaying(false)
    setProgress(0)
    setReady(false)
    setFailed(false)
    setOpened(false)
    lastTime.current = null
    setCycle(value => value + 1)
  }
  const replay = () => {
    reset()
    setPlaying(true)
  }
  const seek = (value: number) => {
    setPlaying(false)
    if (opened || value < progress && progress >= 100) {
      setOpened(false)
      setCycle(i => i + 1)
    }
    setProgress(value)
  }
  const viewportSpec = VIEWPORTS[viewport]

  return (
    <section className="lcr-portal-lab" data-testid="loading-portal-lab" aria-labelledby="portal-lab-title">
      <div className="lcr-portal-lab-top">
        <div>
          <h2 id="portal-lab-title">Loading Portal · Visual Test V1</h2>
          <p>Arte aprovada do ChatDrawer · laboratório isolado · progresso <strong>simulado</strong>, não tráfego real</p>
        </div>
        <div className="lcr-portal-lab-viewport-choices" role="group" aria-label="Proporção de demonstração">
          {(Object.keys(VIEWPORTS) as Viewport[]).map(option => (
            <button type="button" key={option} aria-pressed={viewport === option}
              onClick={() => setViewport(option)}>{VIEWPORTS[option].label}</button>
          ))}
        </div>
      </div>

      <div className="lcr-portal-lab-stage-wrap">
        <div className={`lcr-portal-lab-stage lcr-portal-lab-stage--${viewport}`}
          data-testid="loading-portal-stage"
          style={{ aspectRatio: `${viewportSpec.width} / ${viewportSpec.height}` }}>
          <div className="lcr-portal-lab-underlay" aria-label="Aplicação de demonstração que será revelada">
            <span>LIVE REACT PREVIEW</span>
            <strong>LCR Portfolio</strong>
            <p>A aplicação real será revelada nesta região após aprovação para integração na Home.</p>
            <button type="button" onClick={() => setPlaying(false)}>Interação disponível após abertura</button>
          </div>
          <LoadingPortal
            key={cycle}
            progress={progress}
            ready={ready && !failed}
            onOpened={() => { setOpened(true); setPlaying(false) }}
            chargedHoldMs={holdMs}
            openingDurationMs={openingMs}
            className="lcr-loading-portal--embedded"
          />
          <span className="lcr-portal-lab-badge">COMPONENT LAB · NOT LIVE HOME</span>
        </div>
      </div>

      <div className="lcr-portal-lab-controls" aria-label="Controles da animação Loading Portal">
        <div className="lcr-portal-lab-status" role="status" aria-live="polite">
          {failed ? 'Falha simulada: animação pausada' :
            opened ? 'Porta aberta · demonstração concluída' :
              ready && progress >= 100 ? 'Pronto · abrindo a porta' :
                playing ? 'Simulação de carregamento em andamento' :
                  'Simulação parada'}
          <strong>{Math.round(progress)}%</strong>
        </div>
        <label className="lcr-portal-lab-range">
          Progresso manual — simulação
          <input aria-label="Progresso manual do portal" data-testid="portal-progress"
            type="range" min="0" max="100" step="1"
            value={Math.round(progress)} onChange={event => seek(Number(event.target.value))} />
        </label>
        <div className="lcr-portal-lab-actions">
          <button type="button" data-testid="portal-play-pause"
            onClick={() => { if (opened) { replay(); return } setFailed(false); setPlaying(v => !v) }}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button type="button" data-testid="portal-replay" onClick={replay}>Replay</button>
          <button type="button" data-testid="portal-reset" onClick={reset}>Reset</button>
          <label><input type="checkbox" aria-label="Ready para abrir"
            checked={ready} onChange={event => setReady(event.target.checked)} /> Ready</label>
          <label><input type="checkbox" aria-label="Simular carregamento lento"
            checked={slow} onChange={event => setSlow(event.target.checked)} /> Rede lenta</label>
          <button type="button" data-testid="portal-simulate-error"
            onClick={() => { setFailed(true); setReady(false); setPlaying(false) }}>Simular falha</button>
        </div>
        <div className="lcr-portal-lab-settings">
          <label>Velocidade de demo
            <select aria-label="Velocidade de demonstração" value={speed}
              onChange={event => setSpeed(Number(event.target.value))}>
              <option value={0.5}>0,5×</option><option value={1}>1×</option>
              <option value={1.5}>1,5×</option><option value={2}>2×</option>
            </select>
          </label>
          <label>Duração de abertura (ms)
            <input type="number" aria-label="Duração de abertura" min="100" max="5000" step="50"
              value={openingMs} onChange={event => setOpeningMs(Math.min(5000, Math.max(100, Number(event.target.value) || 100)))} />
          </label>
          <label>Espera após 100% (ms)
            <input type="number" aria-label="Espera após carregamento" min="0" max="3000" step="50"
              value={holdMs} onChange={event => setHoldMs(Math.min(3000, Math.max(0, Number(event.target.value) || 0)))} />
          </label>
        </div>
        <p className="lcr-portal-lab-hint">
          A porta só abre quando <strong>100% + Ready</strong>. O progresso desta tela é simulado;
          na Home será conectado a tarefas verificáveis, depois de aprovada a experiência.
        </p>
      </div>
    </section>
  )
}

/** Keep the proven V1 preview and tests available while the V2 awaits approval. */
export function LoadingPortalLab() {
  const [version,setVersion] = useState<'v1'|'v2'|'editor'>('editor')
  return <>
    <div className="lcr-lab-component-switch" role="group" aria-label="Versão do Loading Portal">
      <button type="button" data-testid="portal-editor-tab" aria-pressed={version==='editor'} onClick={()=>setVersion('editor')}>Porta de entrada · Editor</button>
      <button type="button" data-testid="portal-v1-preview" aria-pressed={version==='v1'} onClick={()=>setVersion('v1')}>Portal V1 · histórico</button>
      <button type="button" data-testid="portal-v2-preview" aria-pressed={version==='v2'} onClick={()=>setVersion('v2')}>Portal V2 · prévia</button>
    </div>
    {version==='editor' ? <PortalMotionEditor/> : version==='v1' ? <LoadingPortalV1Lab/> : <LoadingPortalV2Lab/>}
  </>
}
