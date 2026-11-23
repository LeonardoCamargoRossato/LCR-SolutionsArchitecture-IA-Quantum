import type { CSSProperties } from 'react'

/** Decorative data architecture that persists behind every active Hero scene.
 * The static, source-controlled SVG provides the architecture. CSS-only
 * packet motion supplies 01 / 10 / 0011 flows with no network calls or timers.
 */
const packets = [
  { x: 64, y: 10, data: '01', depth: 'far', delay: -1.1 },
  { x: 79, y: 20, data: '1010', depth: 'near', delay: -4.2 },
  { x: 92, y: 31, data: '0011', depth: 'near', delay: -7.3 },
  { x: 72, y: 43, data: '10', depth: 'far', delay: -2.7 },
  { x: 96, y: 54, data: '010011', depth: 'near', delay: -6.1 },
  { x: 63, y: 65, data: '1101', depth: 'far', delay: -5.3 },
  { x: 83, y: 75, data: '01', depth: 'near', delay: -8.1 },
  { x: 95, y: 87, data: '101', depth: 'far', delay: -3.9 },
  { x: 75, y: 92, data: '0010', depth: 'far', delay: -9.2 },
  { x: 88, y: 15, data: '0110', depth: 'far', delay: -0.2 },
  { x: 68, y: 82, data: '10', depth: 'near', delay: -2.3 },
  { x: 96, y: 66, data: '0101', depth: 'far', delay: -8.5 },
] as const

type PacketStyle = CSSProperties & {
  '--data-x': string
  '--data-y': string
  '--data-delay': string
}

export function HeroBackgroundGraph() {
  return (
    <div className="hero-v5-background" data-testid="hero-v5-background" aria-hidden="true">
      <div className="hero-v5-backdrop-fabric">
        <img
          className="hero-v5-backdrop-svg"
          src={`${import.meta.env.BASE_URL}assets/home/hero/lcr-data-network-background.svg`}
          alt=""
          width="1530"
          height="760"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="hero-v5-backdrop-packets" data-testid="hero-v5-packets">
        {packets.map(({ x, y, data, depth, delay }, index) => (
          <span
            className={`hero-v5-packet hero-v5-packet--${depth}`}
            key={index}
            style={{
              '--data-x': `${x}%`,
              '--data-y': `${y}%`,
              '--data-delay': `${delay}s`,
            } as PacketStyle}
          >
            {data}
          </span>
        ))}
      </div>
      <span className="hero-v5-backdrop-vignette" />
    </div>
  )
}
