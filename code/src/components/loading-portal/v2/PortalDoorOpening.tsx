import { memo, useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { createDoorMotion, type DoorMotion } from './door-motion.js'
import { PORTAL_ASSET_BASE, PORTAL_GEOMETRY, type PortalVariant } from './portalGeometry'

function sprite(b: number[], w: number, h: number): CSSProperties {
  return { left: b[0]/w*100+'%', top: b[1]/h*100+'%', width: (b[2]-b[0])/w*100+'%', height: (b[3]-b[1])/h*100+'%' }
}

export interface PortalDoorOpeningProps {
  stage: RefObject<HTMLDivElement | null>
  variant: PortalVariant
  open: boolean
  duration?: number
  cinematic?: boolean
  mobile?: boolean
  paused?: boolean
  reducedMotion?: boolean
  onOpening?: () => void
  onOpened?: () => void
  onFallback?: () => void
}

/** Sprites are already decoded by the single variant loader. The core is
 * a child of the left leaf and uses exactly its transform. */
export const PortalDoorOpening = memo(function PortalDoorOpening(props: PortalDoorOpeningProps) {
  const { stage, variant, open, paused = false } = props
  const motion = useRef<DoorMotion | null>(null)
  const current = useRef(props)
  current.current = props
  useEffect(() => {
    if (!open) return
    let controller: DoorMotion | null = null
    // Defer first start one frame, allowing StrictMode's probe cleanup to
    // cancel before any lifecycle callback is fired.
    const frame = requestAnimationFrame(() => {
      const el = stage.current
      if (!el) return
      const options = current.current
      try {
        controller = createDoorMotion(el, {
          duration: options.duration, cinematic: options.cinematic, mobile: options.mobile, reducedMotion: options.reducedMotion,
          onOpening: () => current.current.onOpening?.(),
          onOpened: () => current.current.onOpened?.(),
          onFallback: () => current.current.onFallback?.(),
        })
        motion.current = controller
        if (current.current.paused) controller.pause()
      } catch { current.current.onFallback?.() }
    })
    return () => {
      cancelAnimationFrame(frame)
      controller?.cancel()
      if (motion.current === controller) motion.current = null
    }
  }, [stage, variant, open])
  useEffect(() => {
    if (paused) motion.current?.pause()
    else motion.current?.play()
  }, [paused])

  const v = PORTAL_GEOMETRY[variant], w = v.width, h = v.height
  const [cx,cy] = v.coreCenter, [rx,ry] = v.coreRadius
  return <>
    <div className="pdo-leaf pdo-right" data-testid="portal-v2-right" aria-hidden="true">
      <img className="pdo-sprite" alt="" draggable={false} src={PORTAL_ASSET_BASE+v.right.path} style={sprite(v.right.bbox,w,h)} />
    </div>
    <div className="pdo-leaf pdo-left" data-testid="portal-v2-left" aria-hidden="true">
      <img className="pdo-sprite" alt="" draggable={false} src={PORTAL_ASSET_BASE+v.left.path} style={sprite(v.left.bbox,w,h)} />
      <img className="pdo-sprite" data-testid="portal-v2-core" alt="" draggable={false} src={PORTAL_ASSET_BASE+v.core.path} style={sprite(v.core.bbox,w,h)} />
    </div>
    <div className="pdo-glow" aria-hidden="true" style={sprite([cx-rx*.78,cy-ry*.78,cx+rx*.78,cy+ry*.78],w,h)}/>
    <div className="pdo-seam" aria-hidden="true" style={{left:v.splitX/w*100+'%'}}/>
    {props.cinematic && <div className="pdo-activation-flare" data-testid="portal-opening-flare" aria-hidden="true" style={sprite([cx-rx*1.12,cy-ry*1.12,cx+rx*1.12,cy+ry*1.12],w,h)}/>}
  </>
})
