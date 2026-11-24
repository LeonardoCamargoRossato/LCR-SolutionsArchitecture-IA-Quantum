import { memo, type CSSProperties } from 'react'
import { PORTAL_GEOMETRY, type PortalVariant } from './portalGeometry'

export function confirmedPortalPercent(progress: number, ready: boolean): number {
  const safe = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0
  return Math.min(ready ? 100 : 99, Math.floor(safe))
}

export const PortalProgressCounter = memo(function PortalProgressCounter({
  progress, ready, variant, cinematic = false,
}: { progress: number; ready: boolean; variant: PortalVariant; cinematic?: boolean }) {
  const g = PORTAL_GEOMETRY[variant]
  const [cx,cy] = g.coreCenter
  const percent = confirmedPortalPercent(progress, ready)
  const w = 152 * g.transform.scale_x
  const h = 105 * g.transform.scale_y
  return <div className="portal-v2-counter" data-testid="portal-v2-counter" role="progressbar"
    aria-label={cinematic ? "Sequência visual de abertura" : "Progresso de preparação"} aria-valuetext={cinematic && percent === 99 && !ready ? "99% — aguardando os recursos necessários" : undefined} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
    style={{left: cx/g.width*100+'%', top: cy/g.height*100+'%', width: w/g.width*100+'%', height: h/g.height*100+'%'}}>
    <div className="portal-v2-counter-inner">
      <span className="portal-v2-counter-number">{percent}%</span>
      <span className="portal-v2-charge-track" aria-hidden="true">
        <span className="portal-v2-charge-fill" data-testid="portal-v2-charge-fill"
          style={{'--charge': percent / 100} as CSSProperties}/>
      </span>
    </div>
  </div>
})
