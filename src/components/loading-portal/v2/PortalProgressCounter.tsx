import { memo } from 'react'
import { PORTAL_GEOMETRY, type PortalVariant } from './portalGeometry'

export function confirmedPortalPercent(progress: number, ready: boolean): number {
  const safe = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0
  return Math.min(ready ? 100 : 99, Math.floor(safe))
}

export const PortalProgressCounter = memo(function PortalProgressCounter({
  progress, ready, variant,
}: { progress: number; ready: boolean; variant: PortalVariant }) {
  const g = PORTAL_GEOMETRY[variant]
  const [cx,cy] = g.coreCenter
  const percent = confirmedPortalPercent(progress, ready)
  const w = 152 * g.transform.scale_x
  const h = 105 * g.transform.scale_y
  return <div className="portal-v2-counter" data-testid="portal-v2-counter" role="progressbar"
    aria-label="Progresso de preparação" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
    style={{left: cx/g.width*100+'%', top: cy/g.height*100+'%', width: w/g.width*100+'%', height: h/g.height*100+'%'}}>
    <span>{percent}%</span>
  </div>
})
