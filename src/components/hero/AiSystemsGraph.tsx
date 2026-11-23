import type { CSSProperties } from 'react'

/**
 * LCR living systems graph, deterministic and private-data-free.
 *
 * React generates SVG geometry once at module load. CSS handles the visual
 * timeline; there is no per-frame simulation, random layout, canvas,
 * network request, third-party graph library, or image payload.
 *
 * Desktop and mobile intentionally have different compositions.
 */
type Point = { id: string; x: number; y: number; radius: number; index: number }
type Cluster = { x: number; y: number; rx: number; ry: number; count: number; phase: number }
type MotionVars = CSSProperties & { '--converge-x': string; '--converge-y': string; '--pulse-delay': string }

const DESKTOP_HUB = { x: 1018, y: 343 }
const clusters: readonly Cluster[] = [
  { x: 182, y: 128, rx: 178, ry: 115, count: 11, phase: 0.2 },
  { x: 575, y: 94, rx: 200, ry: 99, count: 11, phase: 1.1 },
  { x: 1145, y: 100, rx: 240, ry: 100, count: 11, phase: 2.6 },
  { x: 1320, y: 480, rx: 170, ry: 146, count: 11, phase: 0.8 },
  { x: 791, y: 612, rx: 211, ry: 102, count: 11, phase: 1.9 },
  { x: 351, y: 519, rx: 225, ry: 145, count: 11, phase: 0.45 },
]

function makeClusterNodes(): Point[][] {
  return clusters.map((cluster, clusterIndex) =>
    Array.from({ length: cluster.count }, (_, i) => {
      const angle = cluster.phase + (i * Math.PI * 2) / cluster.count
      const distance = 0.41 + 0.49 * (0.5 + 0.5 * Math.sin(i * 6.8 + clusterIndex * 4.3))
      return {
        id: `c${clusterIndex}-${i}`,
        index: i,
        x: Math.max(12, Math.min(1427, Math.round(cluster.x + Math.cos(angle) * cluster.rx * distance))),
        y: Math.max(10, Math.min(690, Math.round(cluster.y + Math.sin(angle) * cluster.ry * distance))),
        radius: i % 4 === 0 ? 4.1 : i % 3 === 0 ? 2.8 : 1.8,
      }
    }),
  )
}

const desktopClusters = makeClusterNodes()
const desktopParticles = desktopClusters.flat()
const desktopStreams = desktopClusters.flatMap((cluster) =>
  cluster.filter((_, index) => index === 0 || index === 4 || index === 8),
)

const desktopLinks = desktopClusters.flatMap((cluster) =>
  cluster.map((point, i) => ({
    id: `${point.id}-link`,
    start: point,
    end: cluster[(i + 1) % cluster.length],
  })),
)

function bezierToHub(point: Point, hub: { x: number; y: number }, offset: number) {
  const middleX = point.x + (hub.x - point.x) * 0.57
  const middleY = point.y + (hub.y - point.y) * 0.43 + offset
  return `M${point.x} ${point.y} Q${middleX.toFixed(1)} ${middleY.toFixed(1)} ${hub.x} ${hub.y}`
}

function movementVars(point: Point, hub: { x: number; y: number }, delay: number): MotionVars {
  return {
    '--converge-x': `${((hub.x - point.x) * 0.94).toFixed(1)}px`,
    '--converge-y': `${((hub.y - point.y) * 0.94).toFixed(1)}px`,
    '--pulse-delay': `${delay.toFixed(2)}s`,
  }
}

function HeroCore({ x, y, compact = false }: { x: number; y: number; compact?: boolean }) {
  return (
    <g className={compact ? 'hero-graph-core hero-graph-core--mobile' : 'hero-graph-core'}>
      <circle cx={x} cy={y} r={compact ? 76 : 154} className="hero-core-aura" />
      <circle cx={x} cy={y} r={compact ? 56 : 117} className="hero-core-outer" />
      <circle cx={x} cy={y} r={compact ? 39 : 83} className="hero-core-ring" />
      <circle cx={x} cy={y} r={compact ? 19 : 38} className="hero-core-interior" />
      <circle cx={x} cy={y} r={compact ? 8 : 12} className="hero-core-center" />
      <g className="hero-core-orbit" style={{ transformOrigin: `${x}px ${y}px` }}>
        <circle cx={x} cy={y} r={compact ? 47 : 98} className="hero-core-orbit-path" />
        <circle cx={x} cy={y - (compact ? 47 : 98)} r={compact ? 3.2 : 4.4} className="hero-core-orbit-dot" />
      </g>
      <g className="hero-core-orbit hero-core-orbit--inverse" style={{ transformOrigin: `${x}px ${y}px` }}>
        <circle cx={x} cy={y} r={compact ? 33 : 63} className="hero-core-orbit-path hero-core-orbit-path--secondary" />
        <circle cx={x + (compact ? 33 : 63)} cy={y} r={compact ? 2.5 : 3.8} className="hero-core-orbit-dot" />
      </g>
      {!compact && (
        <g className="hero-core-caption" fill="currentColor">
          <text x={x} y={y + 174} textAnchor="middle">INTELLIGENCE / SYSTEMS ARCHITECTURE</text>
          <text x={x} y={y + 189} textAnchor="middle" className="hero-core-caption-small">DATA · RETRIEVAL · REASONING · COMPUTE</text>
        </g>
      )}
    </g>
  )
}

export function HeroGraphDesktop() {
  return (
    <svg
      viewBox="0 0 1440 700"
      preserveAspectRatio="xMidYMid slice"
      className="hero-living-svg hero-living-svg--desktop"
      focusable="false"
      aria-hidden="true"
      data-testid="hero-graph-desktop"
    >
      <defs>
        <radialGradient id="hero-lcr-lightfield"><stop offset="0%" className="hero-svg-glow-first" /><stop offset="100%" className="hero-svg-glow-last" /></radialGradient>
        <linearGradient id="hero-lcr-connection" x1="0%" y1="10%" x2="100%" y2="100%">
          <stop offset="0%" className="hero-svg-gradient-start" />
          <stop offset="55%" className="hero-svg-gradient-middle" />
          <stop offset="100%" className="hero-svg-gradient-end" />
        </linearGradient>
      </defs>
      <circle cx="1018" cy="343" r="315" fill="url(#hero-lcr-lightfield)" className="hero-living-atmosphere" />
      <g className="hero-living-layer hero-living-layer--mesh">
        {desktopLinks.map(({ id, start, end }) => (
          <path key={id} d={`M${start.x} ${start.y} L${end.x} ${end.y}`} className="hero-network-thread" />
        ))}
        {desktopParticles.map((point) => (
          <circle key={point.id} cx={point.x} cy={point.y} r={point.radius} className={point.radius > 3 ? 'hero-network-vertex hero-network-vertex--bright' : 'hero-network-vertex'} />
        ))}
      </g>
      <g className="hero-living-layer hero-living-layer--streams">
        {desktopStreams.map((point, index) => (
          <g key={point.id}>
            <path
              d={bezierToHub(point, DESKTOP_HUB, Math.sin(index * 2.1) * 95)}
              className="hero-network-ray"
              style={{ animationDelay: `${((index % 6) * -0.46).toFixed(2)}s` }}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={index % 3 === 0 ? 5.2 : 3.6}
              className="hero-network-traveler"
              style={movementVars(point, DESKTOP_HUB, (index % 7) * -0.49)}
            />
          </g>
        ))}
      </g>
      <HeroCore x={DESKTOP_HUB.x} y={DESKTOP_HUB.y} />
    </svg>
  )
}

/**
 * Purpose-built compact scene. Large central focal point, fewer routes, larger
 * visual weights, no tiny code; does not simply scale the desktop graph.
 */
const MOBILE_HUB = { x: 200, y: 166 }
const mobileStarts = [
  [18, 32], [57, 73], [95, 20], [137, 61], [218, 23],
  [308, 41], [363, 83], [346, 154], [373, 231], [296, 252],
  [219, 282], [130, 273], [44, 238], [20, 170], [88, 140],
] as const
const mobileNodes = mobileStarts.map(([x, y], index) => ({ id: `m${index}`, x, y, index, radius: index % 3 === 0 ? 4.1 : 2.7 }))

export function HeroGraphMobile() {
  return (
    <svg
      viewBox="0 0 390 300"
      preserveAspectRatio="xMidYMid meet"
      className="hero-living-svg hero-living-svg--mobile"
      focusable="false"
      aria-hidden="true"
      data-testid="hero-graph-mobile"
    >
      <defs>
        <radialGradient id="hero-lcr-mobile-field"><stop offset="0%" className="hero-svg-glow-first" /><stop offset="100%" className="hero-svg-glow-last" /></radialGradient>
      </defs>
      <ellipse cx="200" cy="164" rx="183" ry="140" fill="url(#hero-lcr-mobile-field)" className="hero-living-atmosphere" />
      <g className="hero-living-layer hero-living-layer--mesh">
        {mobileNodes.map((point, index) => (
          <path key={`m-edge-${index}`} d={`M${point.x} ${point.y} L${mobileNodes[(index + 3) % mobileNodes.length].x} ${mobileNodes[(index + 3) % mobileNodes.length].y}`} className="hero-network-thread" />
        ))}
        {mobileNodes.map((point) => (
          <circle key={point.id} cx={point.x} cy={point.y} r={point.radius} className="hero-network-vertex hero-network-vertex--bright" />
        ))}
      </g>
      <g className="hero-living-layer hero-living-layer--streams">
        {mobileNodes.filter((point) => point.index % 2 === 0).map((point, i) => (
          <g key={point.id}>
            <path d={bezierToHub(point, MOBILE_HUB, (i % 3 - 1) * 39)} className="hero-network-ray" />
            <circle cx={point.x} cy={point.y} r="3.8" className="hero-network-traveler" style={movementVars(point, MOBILE_HUB, (i % 4) * -0.65)} />
          </g>
        ))}
      </g>
      <HeroCore x={MOBILE_HUB.x} y={MOBILE_HUB.y} compact />
      <text className="hero-mobile-graph-caption" x="200" y="290" textAnchor="middle">INTELLIGENCE FROM CONNECTED SYSTEMS</text>
    </svg>
  )
}
