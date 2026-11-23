/** Accessible, presentation-only concept based on the AnimeFinder Self-Knowledge pipeline.
 * The graphic never processes user data, calls an API, or renders private records.
 */
const desktopNodes = [
  { id: 'query', x: 69, y: 200, title: 'User', detail: 'Query', role: 'source' },
  { id: 'router', x: 197, y: 200, title: 'Query', detail: 'Router', role: 'router' },
  { id: 'structured', x: 345, y: 85, title: 'Structured', detail: 'Data', role: 'source' },
  { id: 'semantic', x: 345, y: 200, title: 'Semantic', detail: 'Retrieval', role: 'source' },
  { id: 'statistical', x: 345, y: 315, title: 'Statistical', detail: 'Analysis', role: 'source' },
  { id: 'llm', x: 484, y: 200, title: 'LLM', detail: 'Reasoning', role: 'model' },
  { id: 'response', x: 585, y: 200, title: 'Intelligent', detail: 'Response', role: 'output' },
] as const

const desktopPaths = [
  'M97 200 C125 200 149 200 168 200',
  'M226 182 C260 115 289 88 316 85',
  'M226 200 C263 200 293 200 316 200',
  'M226 218 C260 285 289 312 316 315',
  'M374 85 C430 85 431 177 455 189',
  'M374 200 C409 200 435 200 455 200',
  'M374 315 C430 315 431 223 455 211',
  'M513 200 C530 200 543 200 556 200',
] as const

const mobileNodes = [
  { id: 'query', x: 72, y: 65, title: 'User', detail: 'Query', role: 'source' },
  { id: 'router', x: 255, y: 65, title: 'Query', detail: 'Router', role: 'router' },
  { id: 'structured', x: 63, y: 177, title: 'Structured', detail: 'Data', role: 'source' },
  { id: 'semantic', x: 178, y: 177, title: 'Semantic', detail: 'Retrieval', role: 'source' },
  { id: 'statistical', x: 291, y: 177, title: 'Statistical', detail: 'Analysis', role: 'source' },
  { id: 'llm', x: 173, y: 289, title: 'LLM', detail: 'Reasoning', role: 'model' },
  { id: 'response', x: 307, y: 289, title: 'Intelligent', detail: 'Response', role: 'output' },
] as const
const mobilePaths = [
  'M101 65 C146 65 190 65 225 65',
  'M248 94 C193 126 111 125 70 148',
  'M254 94 C223 129 188 133 179 148',
  'M263 94 C289 124 293 133 291 148',
  'M66 206 C84 253 126 271 146 282',
  'M179 206 C179 226 177 251 173 262',
  'M286 206 C264 254 218 269 201 282',
  'M202 289 C227 289 255 289 279 289',
] as const

type NodeSpec = {
  readonly id: string
  readonly x: number
  readonly y: number
  readonly title: string
  readonly detail: string
  readonly role: string
}

function NetworkDrawing({ compact }: { compact: boolean }) {
  const nodes: readonly NodeSpec[] = compact ? mobileNodes : desktopNodes
  const paths: readonly string[] = compact ? mobilePaths : desktopPaths
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={compact ? 'ai-engine-network ai-engine-network--mobile' : 'ai-engine-network ai-engine-network--desktop'}
      viewBox={compact ? '0 0 360 348' : '0 0 640 400'}
      preserveAspectRatio="xMidYMid meet"
    >
      <g className="ai-engine-connections" fill="none">
        {paths.map((path, index) => (
          <g key={path}>
            <path className="ai-engine-route" d={path} />
            <path
              className="ai-engine-tracer"
              d={path}
              style={{ animationDelay: `${index * -0.62}s` }}
            />
          </g>
        ))}
      </g>
      <g className="ai-engine-nodes">
        {nodes.map((node, index) => (
          <g
            className={`ai-engine-node ai-engine-node--${node.role}`}
            key={node.id}
            transform={`translate(${node.x} ${node.y})`}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <circle className="ai-engine-node-halo" r={node.role === 'router' ? 42 : 35} />
            <circle className="ai-engine-node-core" r={node.role === 'router' ? 27 : 23} />
            {node.role === 'router' ? (
              <g className="ai-engine-router-mark" fill="none" strokeWidth="1.7">
                <circle r="9" />
                <path d="M0 -17v8M9 0h8M0 9v8M-17 0h8" />
              </g>
            ) : node.role === 'model' ? (
              <g className="ai-engine-model-mark" fill="none" strokeWidth="1.6">
                <path d="M-9 -8L9 8M-9 8L9 -8M0 -12v24" />
                <circle r="3.3" />
              </g>
            ) : (
              <circle className="ai-engine-node-pip" r="5" />
            )}
            <text className="ai-engine-node-title" x="0" y="45" textAnchor="middle">{node.title}</text>
            <text className="ai-engine-node-detail" x="0" y="60" textAnchor="middle">{node.detail}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

export function AiSystemsGraph() {
  return (
    <div className="ai-engine-graph" data-testid="ai-systems-graph">
      <NetworkDrawing compact={false} />
      <NetworkDrawing compact />
      <p className="ai-engine-graph-footnote">Classification / Retrieval / Evidence / Reasoning</p>
    </div>
  )
}
