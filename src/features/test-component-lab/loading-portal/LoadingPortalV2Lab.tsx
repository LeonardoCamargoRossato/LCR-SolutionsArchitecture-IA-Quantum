import { useEffect, useState } from 'react'
import { LoadingPortalV2, type PortalPreviewMode } from '../../../components/loading-portal/v2/LoadingPortalV2'
import { PORTAL_GEOMETRY, PORTAL_VARIANTS, type PortalVariant } from '../../../components/loading-portal/v2/portalGeometry'
import { type PortalAssetState } from '../../../components/loading-portal/v2/usePortalVariant'
import { PORTAL_OPENING_MS } from '../../../components/loading-portal/v2/useCinematicProgress'
import './loading-portal-v2-lab.css'

const MODES: {id:PortalPreviewMode; label:string}[] = [
  {id:'full',label:'Full Composition'}, {id:'background',label:'Background Only'},
  {id:'lights',label:'Circuit Lights Only'}, {id:'counter',label:'Counter Preview'},
  {id:'door',label:'Door Opening Preview'},
]
const LABELS:Record<PortalVariant,string> = {
  '16x9':'16:9 · Desktop', '16x10':'16:10 · Notebook', '21x9':'21:9 · Ultrawide',
  '4x3':'4:3 · Tablet', '3x4':'3:4 · Tablet retrato', '9x16':'9:16 · Mobile', '9x19_5':'9:19,5 · Mobile longo',
}

/** A simulation-only adapter. The same visual component later receives real
 * confirmed milestones from HomeBootCoordinator. V1 remains independently available. */
export function LoadingPortalV2Lab() {
  const [variant,setVariant] = useState<PortalVariant>('16x9')
  const [mode,setMode] = useState<PortalPreviewMode>('full')
  const [cycle,setCycle] = useState(0)
  const [progress,setProgress] = useState(0)
  const [ready,setReady] = useState(false)
  const [playing,setPlaying] = useState(false)
  const [paused,setPaused] = useState(false)
  const [slow,setSlow] = useState(false)
  const [blocked,setBlocked] = useState(false)
  const [failed,setFailed] = useState(false)
  const [reduced,setReduced] = useState(false)
  const [speed,setSpeed] = useState(1)
  const [intensity,setIntensity] = useState(.72)
  const [duration,setDuration] = useState(PORTAL_OPENING_MS)
  const [assetState,setAssetState] = useState<PortalAssetState>('loading')
  const [phase,setPhase] = useState<'loading'|'opening'|'opened'|'fallback'>('loading')
  const geo = PORTAL_GEOMETRY[variant]

  useEffect(() => {
    if (!playing || paused || blocked || failed || progress >= 100 || phase !== 'loading') return
    // Simulation exists ONLY in this Lab adapter, never in LoadingPortalV2.
    const timer = window.setInterval(() => {
      if (!document.hidden) setProgress(p => Math.min(100,p+(slow ? .5 : 2)))
    },100)
    return () => window.clearInterval(timer)
  },[playing,paused,blocked,failed,progress>=100,phase,slow])

  const reset = (play = false) => {
    setCycle(c=>c+1);setProgress(0);setReady(false);setPlaying(play);setPaused(false)
    setFailed(false);setBlocked(false);setPhase('loading');setAssetState('loading')
  }
  const seek = (value:number) => {
    if (phase==='opened' || phase==='fallback') reset()
    setPlaying(false);setProgress(value)
  }
  const opening = phase==='opening'
  const status = failed ? 'Falha simulada — nenhum avanço autorizado' :
    phase==='opened' ? 'Porta aberta · composição concluída' :
    phase==='fallback' ? 'Fallback · sem abertura mecânica' :
    opening ? 'Abertura mecânica' : assetState==='failed' ? 'Falha real de recurso' :
    blocked ? 'Tarefa simulada bloqueada' : assetState==='loading' ? 'Preparando a variante' :
    ready && progress>=100 ? 'Pronto' : 'Carregamento simulado'
  return <section className="lcr-portal-lab" data-testid="loading-portal-v2-lab" aria-labelledby="portal-v2-title">
    <div className="lcr-portal-lab-top">
      <div><h2 id="portal-v2-title">Loading Portal · Visual Test V2</h2>
        <p>Arte original do Drawer · uma geometria · sete variantes · progresso exclusivamente <strong>simulado</strong></p></div>
      <label>Variante
        <select data-testid="portal-v2-variant" value={variant} disabled={opening}
          onChange={event=>{setVariant(event.target.value as PortalVariant);reset()}}>
          {PORTAL_VARIANTS.map(id=><option key={id} value={id}>{LABELS[id]}</option>)}
        </select>
      </label>
    </div>
    <div className="lcr-portal-lab-viewport-choices" role="group" aria-label="Camada de demonstração">
      {MODES.map(item=><button key={item.id} type="button" disabled={opening}
        aria-pressed={mode===item.id} onClick={()=>{setMode(item.id);reset()}}>{item.label}</button>)}
    </div>
    <div className="lcr-portal-lab-stage-wrap">
      <div className={'lcr-portal-lab-stage lcr-portal-v2-lab-stage'+(geo.width<geo.height?' lcr-portal-v2-lab-portrait':'')}
        data-testid="portal-v2-lab-stage" style={{aspectRatio:geo.width+' / '+geo.height}}>
        <div className="lcr-portal-lab-underlay" data-testid="portal-v2-underlay" aria-label="Aplicação real de demonstração React">
          <span>LIVE REACT PREVIEW</span><strong>LCR Portfolio</strong>
          <p>Este conteúdo React já está montado atrás da porta. A Home pública reutiliza esta composição com a sequência visual de três segundos.</p>
          <button type="button" onClick={()=>setPlaying(false)}>Interação disponível após abertura</button>
        </div>
        {phase!=='opened' && phase!=='fallback' && <LoadingPortalV2 key={cycle}
          variant={variant} mode={mode} progress={progress} ready={ready&&!failed&&!blocked}
          playing={!failed} paused={paused} speed={speed} intensity={intensity}
          duration={duration} reducedMotion={reduced}
          onAssetState={state=>setAssetState(state)}
          onOpening={()=>setPhase('opening')}
          onOpened={()=>{setPhase('opened');setPlaying(false)}}
          onFallback={()=>{setPhase('fallback');setPlaying(false)}} />}
        <span className="lcr-portal-lab-badge">LAB · SIMULATION</span>
      </div>
    </div>
    <div className="lcr-portal-lab-controls">
      <div className="lcr-portal-lab-status" role="status" data-testid="portal-v2-lab-status">
        {status}<strong>{Math.min(ready&&!failed&&!blocked&&assetState==='ready'?100:99,Math.floor(progress))}%</strong>
      </div>
      <label className="lcr-portal-lab-range">Progresso manual — simulação
        <input type="range" min="0" max="100" step="1" data-testid="portal-v2-progress"
          disabled={opening} value={Math.floor(progress)} onChange={e=>seek(Number(e.target.value))}/>
      </label>
      <div className="lcr-portal-lab-actions">
        <button type="button" data-testid="portal-v2-play-pause" onClick={()=>{
          if (phase==='opened'||phase==='fallback') {reset(true);return}
          setPaused(v=>playing&&!paused ? true : false);setPlaying(v=>!v)
        }}>{playing&&!paused?'Pause':'Play'}</button>
        <button type="button" onClick={()=>reset(true)}>Replay</button>
        <button type="button" data-testid="portal-v2-reset" onClick={()=>reset()}>Reset</button>
        <button type="button" data-testid="portal-v2-open" disabled={opening||failed||blocked||!(mode==='full'||mode==='door')}
          onClick={()=>{if(phase!=='loading')reset();setPaused(false);setProgress(100);setReady(true)}}>Testar abertura</button>
        <label><input type="checkbox" data-testid="portal-v2-ready" disabled={opening||failed||blocked} checked={ready}
          onChange={e=>setReady(e.target.checked)}/> Ready</label>
        <label><input type="checkbox" checked={slow} onChange={e=>setSlow(e.target.checked)}/> Rede lenta</label>
        <label><input type="checkbox" checked={blocked} disabled={opening} onChange={e=>setBlocked(e.target.checked)}/> Tarefa bloqueada</label>
        <button type="button" disabled={opening} onClick={()=>{setFailed(true);setReady(false);setPlaying(false)}}>Simular falha</button>
        <label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Reduced Motion</label>
      </div>
      <div className="lcr-portal-lab-settings">
        <label>Velocidade das luzes
          <input type="range" min=".25" max="3" step=".25" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/>
          {speed.toFixed(2)}×
        </label>
        <label>Intensidade das luzes
          <input type="range" min="0" max="1" step=".05" value={intensity} onChange={e=>setIntensity(Number(e.target.value))}/>
          {Math.round(intensity*100)}%
        </label>
        <label>Duração da abertura (ms)
          <input type="number" min="250" max="12000" step="50" value={duration} disabled={opening}
            onChange={e=>setDuration(Math.max(250,Math.min(12000,Number(e.target.value)||PORTAL_OPENING_MS)))}/>
        </label>
      </div>
      <p className="lcr-portal-lab-hint">100% exige Ready e os assets decodificados. A velocidade das luzes não interfere na simulação. Os recortes da V2 são os mesmos que serão reutilizados na Home.</p>
    </div>
  </section>
}
