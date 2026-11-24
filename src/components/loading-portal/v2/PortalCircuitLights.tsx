import { type CSSProperties } from 'react'
import geometry from './portal-circuit-paths.json'
import { PORTAL_GEOMETRY, type PortalVariant } from './portalGeometry'
import './portal-circuit-lights.css'

export interface PortalCircuitLightsProps {
  playing?: boolean
  speed?: number
  intensity?: number
  ready?: boolean
  reducedMotion?: boolean
  variant: PortalVariant
}
const clamp = (value: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min

/** Drawer paths in master coordinates. The shared mechanical geometry also
 * covers 4:3; never independently select or transform the background. */
export function PortalCircuitLights({
  playing = true, speed = 1, intensity = .72, ready = false, reducedMotion = false, variant,
}: PortalCircuitLightsProps) {
  const geo = PORTAL_GEOMETRY[variant]
  const { scale_x, scale_y, translate_x, translate_y } = geo.transform
  const transform = 'translate(' + translate_x + ' ' + translate_y + ') scale(' + scale_x + ' ' + scale_y + ')'
  const style = {
    '--pcl-cycle': 6500 / clamp(speed, .25, 3) + 'ms',
    '--pcl-intensity': String(clamp(intensity, 0, 1)),
  } as CSSProperties
  return <svg className="pcl-overlay" xmlns="http://www.w3.org/2000/svg"
    viewBox={'0 0 ' + geo.width + ' ' + geo.height} preserveAspectRatio="xMidYMid meet"
    data-playing={playing && !reducedMotion ? 'true' : 'false'} data-ready={ready ? 'true' : 'false'}
    data-reduced={reducedMotion ? 'true' : 'false'} aria-hidden="true" focusable="false" style={style}>
    <g transform={transform}>
      {geometry.paths.map(path => {
        const dashStyle = { '--pcl-delay': Math.round(path.delay * 1000) + 'ms', '--pcl-duration-factor': path.durationFactor } as CSSProperties
        return <g key={path.id} className="pcl-strand" data-kind={path.kind} data-path-id={path.id} style={dashStyle}>
          <path className="pcl-track" d={path.d} />
          <path className="pcl-halo" d={path.d} pathLength={100} />
          <path className="pcl-hot" d={path.d} pathLength={100} />
        </g>
      })}
    </g>
  </svg>
}
