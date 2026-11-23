import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  DEFAULT_LOADING_PORTAL_ASSETS,
  LOADING_PORTAL_KEYFRAMES,
  assetUrl,
  clampProgress,
  resolveKeyframes,
} from './loadingPortal.frames'
import type { LoadingPortalPhase, LoadingPortalProps } from './LoadingPortal.types'
import './LoadingPortal.css'

/** LCR Loading Portal V1: approved eight-frame artwork and two sliding halves.
 * Does not own loading progress, routing, authentication or Home readiness.
 */
export function LoadingPortal({
  progress, ready, onOpened, onOpening,
  assetBaseUrl = DEFAULT_LOADING_PORTAL_ASSETS,
  chargedHoldMs = 550,
  openingDurationMs = 1600,
  className = '',
}: LoadingPortalProps) {
  const safeProgress = clampProgress(progress)
  const [phase, setPhase] = useState<LoadingPortalPhase>('charging')
  const callbackRef = useRef(onOpened)
  const openingCallbackRef = useRef(onOpening)
  const completedRef = useRef(false)
  callbackRef.current = onOpened
  openingCallbackRef.current = onOpening

  const keyframes = useMemo(() => resolveKeyframes(safeProgress), [safeProgress])
  const leaving = phase === 'opening' || phase === 'opened'
  const showSliding = (phase === 'charged' && safeProgress >= 100) || leaving
  const openPanel = assetUrl(assetBaseUrl, 'door-open-base.webp')
  const lockCore = assetUrl(assetBaseUrl, 'lock-core.webp')

  useEffect(() => {
    if (safeProgress < 100 || !ready) {
      if (safeProgress < 100) completedRef.current = false
      setPhase(safeProgress >= 100 ? 'charged' : 'charging')
      return
    }
    setPhase('charged')
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const hold = reduce ? 0 : Math.max(0, chargedHoldMs)
    const opening = reduce ? 0 : Math.max(0, openingDurationMs)
    const start = window.setTimeout(() => {
      setPhase('opening')
      openingCallbackRef.current?.()
    }, hold)
    const done = window.setTimeout(() => {
      setPhase('opened')
      if (!completedRef.current) {
        completedRef.current = true
        callbackRef.current?.()
      }
    }, hold + opening + (reduce ? 0 : 50))
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(done)
    }
  }, [safeProgress, ready, chargedHoldMs, openingDurationMs])

  // Load only the adjacent approved frames and opening assets when relevant.
  // Unlike the original demo, the other 7 frames do not all compete on mount.
  useEffect(() => {
    const near = new Set<string>([keyframes.from, keyframes.to])
    if (safeProgress >= 80) {
      near.add('portal-100.webp')
      near.add('door-open-base.webp')
      near.add('lock-core.webp')
    }
    const images = [...near].filter(name => name !== 'portal-000.webp').map(filename => {
      const image = new Image()
      image.decoding = 'async'
      image.src = assetUrl(assetBaseUrl, filename)
      return image
    })
    return () => { images.length = 0 }
  }, [assetBaseUrl, keyframes.from, keyframes.to, safeProgress >= 80])

  if (phase === 'opened') return null
  const componentStyle = {
    '--portal-open-duration': `${openingDurationMs}ms`,
  } as CSSProperties

  return (
    <div
      className={`lcr-loading-portal ${leaving ? 'lcr-loading-portal--opening' : ''} ${className}`}
      data-testid="loading-portal"
      data-phase={phase}
      style={componentStyle}
      aria-label="Carregando LCR Portfólio"
    >
      <div className="lcr-loading-portal__energy" aria-hidden="true" />
      {!showSliding ? (
        <div className="lcr-loading-portal__still" aria-hidden="true">
          <img
            className="lcr-loading-portal__art"
            src={assetUrl(assetBaseUrl, keyframes.from)}
            alt=""
            fetchPriority={safeProgress === 0 ? 'high' : 'auto'}
            decoding="async"
          />
          {keyframes.to !== keyframes.from && (
            <img
              className="lcr-loading-portal__art"
              src={assetUrl(assetBaseUrl, keyframes.to)}
              alt=""
              decoding="async"
              style={{ opacity: keyframes.mix }}
            />
          )}
        </div>
      ) : (
        <div className="lcr-loading-portal__sliding" aria-hidden="true">
          <div className="lcr-loading-portal__leaf lcr-loading-portal__leaf--left">
            <img src={openPanel} alt="" decoding="async"
              className="lcr-loading-portal__leaf-art lcr-loading-portal__leaf-art--left" />
          </div>
          <div className="lcr-loading-portal__leaf lcr-loading-portal__leaf--right">
            <img src={openPanel} alt="" decoding="async"
              className="lcr-loading-portal__leaf-art lcr-loading-portal__leaf-art--right" />
          </div>
          <img src={lockCore} alt="" decoding="async" className="lcr-loading-portal__lock-core" />
          <div className="lcr-loading-portal__middle-flare" />
        </div>
      )}
      {!leaving && (
        <div className="lcr-loading-portal__counter"
          role="progressbar"
          aria-label="Progresso do carregamento"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(safeProgress)}
        >
          <span className="lcr-loading-portal__counter-value">{Math.round(safeProgress)}%</span>
        </div>
      )}
      <div className="lcr-loading-portal__vignette" aria-hidden="true" />
    </div>
  )
}
export default LoadingPortal
