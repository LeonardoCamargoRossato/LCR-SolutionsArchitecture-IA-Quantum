import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { PortalCircuitLights } from './PortalCircuitLights'
import { CinematicPortalCounter, PortalProgressCounter, confirmedPortalPercent } from './PortalProgressCounter'
import { PortalStaticBackground } from './PortalStaticBackground'
import { PortalDoorOpening } from './PortalDoorOpening'
import { PORTAL_GEOMETRY, type PortalVariant } from './portalGeometry'
import { usePortalVariant, type PortalAssetState } from './usePortalVariant'
import { PORTAL_OPENING_MS, PORTAL_CHARGED_MS, PORTAL_MOBILE_CHARGED_MS, PORTAL_MOBILE_OPENING_MS } from './useCinematicProgress'
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
  allowFallback?: boolean
  /** Presentation-only count; never authorizes readiness. */
  cinematic?: boolean
  onVisualComplete?: () => void
  onAssetState?: (state: PortalAssetState, variant?: PortalVariant) => void
}

/** Shared Lab/production composition. Host owns real readiness; this component
 * has no progress timer, remote service, route logic, or second boot coordinator. */
export const LoadingPortalV2 = memo(function LoadingPortalV2({
  progress, ready, variant, playing = true, paused = false, speed = 1, intensity = .72,
  duration = PORTAL_OPENING_MS, reducedMotion = false, mode = 'full', allowFallback = true, cinematic = false, onVisualComplete, onOpening, onOpened, onFallback, onAssetState,
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
  const prepared = result?.status === 'ready'
  const reduced = systemReduced || reducedMotion
  const realReady = ready && prepared && confirmedPortalPercent(progress,ready) === 100
  const cinematicActive = cinematic && mode === 'full'
  const [visualHundred,setVisualHundred] = useState(false)
  const [visualComplete,setVisualComplete] = useState(false)
  const onHundred = useCallback(() => setVisualHundred(true),[])
  const onComplete = useCallback(() => setVisualComplete(true),[])
  const displayHundred = cinematicActive ? visualHundred : confirmedPortalPercent(progress,ready) === 100
  const requested = (mode === 'full' || mode === 'door') && realReady &&
    (!cinematicActive || visualComplete)
  const open = freeze || requested
  const visualCallback = useRef(onVisualComplete)
  visualCallback.current = onVisualComplete
  const visualReported = useRef(false)
  useEffect(() => {
    if (realReady && displayHundred && !visualReported.current) {
      visualReported.current = true
      visualCallback.current?.()
    }
  }, [realReady, displayHundred])
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
  const end = useCallback((fallback: boolean) => {
    if (completed.current) return
    completed.current = true
    setPhase(fallback ? 'fallback' : 'opened')
    if (fallback) callback.current.onFallback?.()
    else callback.current.onOpened?.()
  },[])
  const notifyOpening = useCallback(() => {setPhase('opening');callback.current.onOpening?.()},[])
  const notifyOpened = useCallback(() => end(false),[end])
  const notifyFallback = useCallback(() => end(true),[end])
  const selected = result?.variant, geo = selected ? PORTAL_GEOMETRY[selected] : null
  // Keep manual Lab duration intact. Production portrait variants use a separate motion clock.
  const mobile = cinematicActive && (selected === '9x16' || selected === '9x19_5' || selected === '3x4' || window.matchMedia('(pointer: coarse) and (max-width: 1000px)').matches)
  const holdMs = mobile ? PORTAL_MOBILE_CHARGED_MS : PORTAL_CHARGED_MS
  const openingMs = mobile ? PORTAL_MOBILE_OPENING_MS : duration
  const style = useMemo(() => geo ? {
    '--pdo-ratio': geo.width / geo.height,
    '--pdo-exit-left': '-'+(Math.max(geo.left.contentBbox[2],geo.core.contentBbox[2])/geo.width*100+2)+'%',
    '--pdo-exit-right': ((geo.width-geo.right.contentBbox[0])/geo.width*100+2)+'%',
    '--portal-fade-ms': Math.max(0,Math.min(160,duration*.15))+'ms',
  } as CSSProperties : undefined,[geo,duration])
  if (phase === 'opened' || phase === 'fallback') return null
  const showBackground = mode !== 'lights' && mode !== 'counter'
  const showDoor = mode === 'full' || mode === 'door'
  return <div className="portal-v2-shell" ref={root} data-testid="loading-portal-v2"
    data-phase={phase === 'loading' && cinematicActive && realReady && displayHundred ? 'charged' : phase} data-motion-profile={mobile ? "mobile" : "desktop"} data-assets={result?.status ?? 'loading'} data-variant={selected}
    data-real-ready={realReady ? 'true' : 'false'}>
    {selected && geo && <div className="portal-v2-plane" ref={plane} style={style} data-state="closed" data-motion-prepared={prepared && realReady && displayHundred ? "true" : "false"}>
      {prepared && showDoor && <PortalDoorOpening stage={plane} variant={selected} open={open}
        duration={openingMs} cinematic={cinematicActive} mobile={mobile} paused={paused || hidden} reducedMotion={reduced}
        onOpening={notifyOpening}
        onOpened={notifyOpened} onFallback={notifyFallback} />}
      {showBackground && <PortalStaticBackground variant={selected}/>}
      <div className="portal-v2-decoration">
        {(mode === 'full' || mode === 'lights') && <PortalCircuitLights variant={selected} playing={playing && !paused && !hidden} speed={speed}
          intensity={intensity} ready={realReady && displayHundred} reducedMotion={reduced} energyFlow={cinematicActive}/>}
        {cinematicActive ? <CinematicPortalCounter variant={selected} ready={realReady}
          visible={result?.status !== 'failed'} paused={paused || hidden} reducedMotion={reduced}
          onHundred={onHundred} onComplete={onComplete} speed={speed} intensity={intensity} playing={playing} holdMs={holdMs}/> :
          (mode === 'full' || mode === 'counter') && <PortalProgressCounter variant={selected} progress={progress} ready={realReady} cinematic={cinematic}/>}
      </div>
    </div>}
    {!selected && <p className="portal-v2-resource-status" role="status">Preparando a porta…</p>}
    {result?.status === 'failed' && <div className="portal-v2-resource-status" role="status">
      Não foi possível preparar os recursos da porta.
      {allowFallback && <button type="button" onClick={() => end(true)}>Continuar sem animação</button>}
    </div>}
  </div>
})
