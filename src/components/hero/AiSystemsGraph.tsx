/**
 * Hero V4 — deterministic data cloud and fully connected neural network.
 * This is an original, diagrammatic 2.5D illustration, not an ML inference
 * engine. SVG coordinates are generated once: no canvas or per-frame JS.
 */
type Point = { x: number; y: number; r: number }
type SceneSize = 'desktop' | 'mobile'

const fraction = (value: number) => value - Math.floor(value)

function scatterNodes(size: SceneSize): Point[] {
  const mobile = size === 'mobile'
  const count = mobile ? 22 : 48
  const width = mobile ? 390 : 790
  const height = mobile ? 310 : 510
  return Array.from({ length: count }, (_, index) => {
    const x = fraction(Math.sin((index + 7) * 17.24) * 43758.5453)
    const y = fraction(Math.sin((index + 11) * 29.46) * 21278.2234)
    return {
      x: 25 + x * (width - 50),
      y: 22 + y * (height - 44),
      r: index % 7 === 0 ? 4.5 : index % 3 === 0 ? 3.1 : 1.8,
    }
  })
}

const desktopScatter = scatterNodes('desktop')
const mobileScatter = scatterNodes('mobile')

function Scatter({ size }: { size: SceneSize }) {
  const mobile = size === 'mobile'
  const nodes = mobile ? mobileScatter : desktopScatter
  return (
    <svg
      data-testid={mobile ? 'hero-scatter-mobile' : 'hero-scatter-desktop'}
      className={`hero-v4-vector hero-v4-vector--${size}`}
      viewBox={mobile ? '0 0 390 310' : '0 0 790 510'}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g className="hero-v4-scatter-edges">
        {nodes.map((node, index) => {
          // Connect only near neighbours; avoid the former starburst of
          // random crossings, which read as a chaotic scribble.
          const other = nodes.reduce((nearest, candidate, j) => {
            if (j === index) return nearest
            const distance = Math.hypot(node.x - candidate.x, node.y - candidate.y)
            if (distance >= nearest.distance) return nearest
            return { point: candidate, distance }
          }, { point: nodes[(index + 1) % nodes.length], distance: Infinity })
          return <line key={index} x1={node.x} y1={node.y} x2={other.point.x} y2={other.point.y} />
        })}
      </g>
      <g>
        {nodes.map((node, index) => (
          <circle
            key={index}
            cx={node.x}
            cy={node.y}
            r={node.r}
            className={index % 7 === 0 ? 'hero-v4-data-point hero-v4-data-point--bright' : 'hero-v4-data-point'}
            style={{ animationDelay: `${(index % 9) * -0.29}s` }}
          />
        ))}
      </g>
      <g className="hero-v4-scatter-flows">
        {nodes.filter((_, index) => index % (mobile ? 4 : 6) === 0).map((node, index) => (
          <path
            key={index}
            d={`M ${node.x.toFixed(1)} ${node.y.toFixed(1)} Q ${mobile ? 207 : 466} ${mobile ? 158 : 255} ${mobile ? 195 : 410} ${mobile ? 146 : 248}`}
            style={{ animationDelay: `${index * -0.28}s` }}
          />
        ))}
      </g>
    </svg>
  )
}

type LayerNode = { id: string; x: number; y: number; layer: number; depth: number }
function createLayers(size: SceneSize): LayerNode[][] {
  const mobile = size === 'mobile'
  const xs = mobile ? [56, 145, 240, 333] : [92, 289, 492, 700]
  const counts = mobile ? [3, 5, 5, 3] : [5, 7, 7, 4]
  const spacing = mobile ? 46 : 57
  const center = mobile ? 155 : 249
  return xs.map((x, layer) =>
    Array.from({ length: counts[layer] }, (_, index) => ({
      id: `n${layer}-${index}`,
      x,
      y: center + (index - (counts[layer] - 1) / 2) * spacing + (layer % 2 ? 2 : -3),
      layer,
      depth: (layer - 1.5) * (mobile ? 7 : 18),
    })),
  )
}
const desktopLayers = createLayers('desktop')
const mobileLayers = createLayers('mobile')

function NeuralNetwork({ size, locale }: { size: SceneSize; locale: 'pt-BR' | 'en-US' }) {
  const mobile = size === 'mobile'
  const layers = mobile ? mobileLayers : desktopLayers
  const edges = layers.slice(0, -1).flatMap((layer, index) =>
    layer.flatMap((from) =>
      layers[index + 1].map((to) => ({ from, to, key: `${from.id}-${to.id}` })),
    ),
  )
  return (
    <svg
      data-testid={mobile ? 'hero-neural-mobile' : 'hero-neural-desktop'}
      className={`hero-v4-vector hero-v4-vector--${size}`}
      viewBox={mobile ? '0 0 390 310' : '0 0 790 510'}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`hero-v4-neuron-edge-${size}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--neural-line)" stopOpacity=".23" />
          <stop offset="52%" stopColor="var(--neural-glow)" stopOpacity=".74" />
          <stop offset="100%" stopColor="var(--neural-line)" stopOpacity=".33" />
        </linearGradient>
      </defs>
      <g className="hero-v4-neural-edges">
        {edges.map(({ from, to, key }, index) => (
          <line
            key={key}
            x1={from.x} y1={from.y + from.depth * .3}
            x2={to.x} y2={to.y + to.depth * .3}
            stroke={`url(#hero-v4-neuron-edge-${size})`}
            style={{ animationDelay: `${(index % 15) * -0.16}s` }}
          />
        ))}
      </g>
      {layers.map((layer, index) => (
        <g key={index} className="hero-v4-neural-layer" style={{ animationDelay: `${index * .13}s` }}>
          {layer.map((node) => (
            <g key={node.id} className="hero-v4-neuron">
              <circle cx={node.x} cy={node.y} r={mobile ? 12 : 15} className="hero-v4-neuron-halo" />
              <circle cx={node.x} cy={node.y} r={mobile ? 6.5 : 8.5} className="hero-v4-neuron-core" />
              <circle cx={node.x - 1.6} cy={node.y - 1.5} r={mobile ? 1.7 : 2.1} className="hero-v4-neuron-highlight" />
            </g>
          ))}
        </g>
      ))}
      <g className="hero-v4-neural-caption">
        <text x={mobile ? 195 : 394} y={mobile ? 301 : 483} textAnchor="middle">{locale === 'pt-BR' ? 'ENTRADA → CAMADAS OCULTAS → SAÍDA' : 'INPUT → HIDDEN LAYERS → OUTPUT'}</text>
      </g>
    </svg>
  )
}

export function HeroGraphDesktop({ locale }: { locale: 'pt-BR' | 'en-US' }) {
  return (
    <>
      <div className="hero-v4-scatter" data-testid="hero-scatter-scene"><Scatter size="desktop" /></div>
      <div className="hero-v4-neural-depth" data-testid="hero-neural-scene">
        <div className="hero-v4-depth-shadow"><NeuralNetwork size="desktop" locale={locale} /></div>
        <div className="hero-v4-depth-front"><NeuralNetwork size="desktop" /></div>
      </div>
    </>
  )
}

export function HeroGraphMobile({ locale }: { locale: 'pt-BR' | 'en-US' }) {
  return (
    <>
      <div className="hero-v4-scatter" data-testid="hero-scatter-scene-mobile"><Scatter size="mobile" /></div>
      <div className="hero-v4-neural-depth" data-testid="hero-neural-scene-mobile">
        <div className="hero-v4-depth-front"><NeuralNetwork size="mobile" locale={locale} /></div>
      </div>
    </>
  )
}
