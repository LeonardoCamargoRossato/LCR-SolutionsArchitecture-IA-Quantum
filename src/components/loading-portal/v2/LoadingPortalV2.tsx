import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { PortalCircuitLights } from './PortalCircuitLights'
import { PortalProgressCounter, confirmedPortalPercent } from './PortalProgressCounter'
import { PortalStaticBackground } from './PortalStaticBackground'
import { PortalDoorOpening } from './PortalDoorOpening'
import { PORTAL_GEOMETRY, type PortalVariant } from './portalGeometry'
import { usePortalVariant, type PortalAssetState } from './usePortalVariant'
import './loading-portal-v2.css'

export type PortalPreviewMode = 'full' | 'background' | 'lights' | 'counter' | 'door'
export interface LoadingPortalV2Props {
  progress: number
  ready: boolean
  variant?: PortalVariant
  playing?: boolean
  paused?: boolean
  speed?: number
  intensity?: number
  duration?: number
  reducedMotion?: boolean
  mode?: PortalPreviewMode
  onOpening?: () => void
  onOpened?: () => void
  onFallback?: () => void
  onAssetState?: (state: PortalAssetState, variant?: PortalVariant) => void
}

/** Shared Lab/production composition. Host owns real readiness; this component
 * has no progress timer, remote service, route logic, or second boot coordinator. */
export function LoadingPortalV2({
  progress, ready, variant, playing = true, paused = false, speed = 1, intensity = .72,
  duration = 1800, reducedMotion = false, mode = 'full', onOpening, onOpened, onFallback, onAssetState,
}: LoadingPortalV2Props) {
  const root = useRef<HTMLDivElement>(null), plane = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'loading' | 'opening' | 'opened' | 'fallback'>('loading')
  const [hidden,setHidden] = useState(() => document.hidden)
  const [systemReduced,setSystemReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [freeze,setFreeze] = useState(false)
  const result = usePortalVariant(root,variant,freeze || phase !== 'loading')
  const callback = useRef({onOpening,onOpened,onFallback,onAssetState})
  callback.current = {onOpening,onOpened,onFallback,onAssetState}
  const completed = useRef(false)
  const requested = (mode === 'full' || mode === 'door') && ready && confirmedPortalPercent(progress,ready) === 100
  const prepared = result?.status === 'ready'
  const open = freeze || (requested && prepared)
  const reduced = systemReduced || reducedMotion
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemReduced(media.matches)
    const visibility = () => setHidden(document.hidden)
    media.addEventListener('change',update); document.addEventListener('visibilitychange',visibility)
    return () => { media.removeEventListener('change',update); document.removeEventListener('visibilitychange',visibility) }
  },[])
  useEffect(() => {
    callback.current.onAssetState?.(result?.status ?? 'loading',result?.variant)
  },[result])
  useEffect(() => {
    if (open) setFreeze(true)
  },[open])
  const end = (fallback: boolean) => {
    if (completed.current) return
    completed.current = true
    setPhase(fallback ? 'fallback' : 'opened')
    if (fallback) callback.current.onFallback?.()
    else callback.current.onOpened?.()
  }
  if (phase === 'opened' || phase === 'fallback') return null
  const selected = result?.variant, geo = selected ? PORTAL_GEOMETRY[selected] : null
  const style = geo ? {
    '--pdo-ratio': geo.width / geo.height,
    '--pdo-exit-left': '-'+(Math.max(geo.left.contentBbox[2],geo.core.contentBbox[2])/geo.width*100+2)+'%',
    '--pdo-exit-right': ((geo.width-geo.right.contentBbox[0])/geo.width*100+2)+'%',
    '--portal-fade-ms': Math.max(0,Math.min(160,duration*.15))+'ms',
  } as CSSProperties : undefined
  const showBackground = mode !== 'lights' && mode !== 'counter'
  const showDoor = mode === 'full' || mode === 'door'
  return <div className="portal-v2-shell" ref={root} data-testid="loading-portal-v2"
    data-phase={phase} data-assets={result?.status ?? 'loading'} data-variant={selected}>
    {selected && geo && <div className="portal-v2-plane" ref={plane} style={style} data-state="closed">
      {prepared && showDoor && <PortalDoorOpening stage={plane} variant={selected} open={open}
        duration={duration} paused={paused || hidden} reducedMotion={reduced}
        onOpening={() => {setPhase('opening');callback.current.onOpening?.()}}
        onOpened={() => end(false)} onFallback={() => end(true)} />}
      {showBackground && <PortalStaticBackground variant={selected}/>}
      <div className="portal-v2-decoration">
        {(mode === 'full' || mode === 'lights') && <PortalCircuitLights variant={selected} playing={playing && !paused && !hidden} speed={speed}
          intensity={intensity} ready={ready && prepared} reducedMotion={reduced}/>}
        {(mode === 'full' || mode === 'counter') && <PortalProgressCounter variant={selected} progress={progress} ready={ready && prepared}/>}
      </div>
    </div>}
    {!selected && <p className="portal-v2-resource-status" role="status">Preparando a porta…</p>}
    {result?.status === 'failed' && <div className="portal-v2-resource-status" role="status">
      Não foi possível preparar os recursos da porta.
      <button type="button" onClick={() => end(true)}>Continuar sem animação</button>
    </div>}
  </div>
}
