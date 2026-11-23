import type { PointerEvent } from 'react'

/** The terminal and the assistant are authored demos, never live services.
 * Replaying the transcript remounts a CSS-driven message timeline; no AI call.
 */
const codeLines = [
  { number: '01', indent: 0, keyword: 'const', expression: ' pipeline = createAI()' },
  { number: '02', indent: 1, keyword: 'const', expression: ' context = await retrieve(data)' },
  { number: '03', indent: 1, keyword: 'const', expression: ' layers = neuralNetwork(context)' },
  { number: '04', indent: 1, keyword: 'const', expression: ' insight = await reason(layers)' },
  { number: '05', indent: 1, keyword: 'return', expression: ' respond(insight)' },
  { number: '06', indent: 0, keyword: '//', expression: ' intelligence becomes software' },
] as const

export function EngineeringWorkspace({
  locale, active, replayKey, onReplay,
}: {
  locale: 'pt-BR' | 'en-US'
  active: boolean
  replayKey: number
  onReplay: () => void
}) {
  const pt = locale === 'pt-BR'
  const onRobotMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return
    const box = event.currentTarget.getBoundingClientRect()
    const mx = (event.clientX - box.left) / Math.max(1, box.width) * 2 - 1
    const my = (event.clientY - box.top) / Math.max(1, box.height) * 2 - 1
    event.currentTarget.style.setProperty('--hamnet-yaw', `${(mx * 8).toFixed(1)}deg`)
    event.currentTarget.style.setProperty('--hamnet-pitch', `${(-my * 6).toFixed(1)}deg`)
  }
  const onRobotLeave = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.removeProperty('--hamnet-yaw')
    event.currentTarget.style.removeProperty('--hamnet-pitch')
  }

  return (
    <>
      <div className="hero-v4-code-scene" data-testid="hero-v4-code-scene" aria-hidden="true">
        <div className="hero-v4-code-halo" />
        <div className="hero-v4-code-architecture">
          <span className="hero-v4-code-icon">TS</span>
          <span>intelligence.pipeline.ts</span>
          <span className="hero-v4-code-state">GENERATED CODE</span>
        </div>
        <div className="hero-v4-code-lines">
          {codeLines.map((line, index) => (
            <div className={`hero-v4-code-line hero-v4-code-line--${line.indent}`} key={line.number} style={{ animationDelay: `${index * 125}ms` }}>
              <span className="hero-v4-code-line-number">{line.number}</span>
              <span className="hero-v4-code-keyword">{line.keyword}</span>
              <span>{line.expression}</span>
            </div>
          ))}
        </div>
        <div className="hero-v4-code-lower">
          <span className="hero-v4-code-led" />
          <span>DATA / MODEL / SOFTWARE</span>
          <span>CONCEPT VISUALIZATION</span>
        </div>
      </div>

      <div
        className="hero-v4-hamnet-scene hero-v5-hamnet"
        data-testid="hero-v4-hamnet-scene"
        data-demo-sequence={replayKey}
        aria-hidden={!active}
        inert={!active}
      >
        <div className="hero-v4-hamnet-glow" aria-hidden="true" />
        <div className="hero-v4-bot-persona">
          <button
            type="button"
            className="hero-v5-bot-replay"
            data-testid="hero-v5-hamnet-replay"
            aria-label={pt ? 'Reproduzir demonstração de conversa com Hamlet AI' : 'Replay Hamlet AI conversation demo'}
            onPointerMove={onRobotMove}
            onPointerLeave={onRobotLeave}
            onClick={onReplay}
            title={pt ? 'Clique para repetir a demonstração' : 'Click to replay the demo'}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/home/hero/ai-hamnet-enterprise-v2.svg`}
              alt=""
              className="hero-v4-bot-art"
              width="240"
              height="260"
              decoding="async"
            />
          </button>
          <div className="hero-v4-hamnet-name">Hamlet AI</div>
          <div className="hero-v4-hamnet-state">
            <span aria-hidden="true" /> {pt ? 'Demonstração de assistente de IA' : 'AI assistant concept demo'}
          </div>
          <div className="hero-v5-replay-hint">{pt ? 'Clique para repetir' : 'Click to replay'}</div>
        </div>
        <div className="hero-v4-chat-window hero-v5-chat-window">
          <div className="hero-v4-chat-heading">
            <span className="hero-v4-chat-avatar">AI</span>
            <strong>Hamlet AI</strong>
            <span className="hero-v5-demo-label">{pt ? 'DEMONSTRAÇÃO' : 'DEMO'}</span>
          </div>
          <div className="hero-v5-conversation" key={replayKey} aria-label={pt ? 'Exemplo de conversa simulada' : 'Simulated conversation example'}>
            <div className="hero-v5-chat-user" data-testid="hero-v5-user-message">
              Hello, Hamlet AI.
            </div>
            <div className="hero-v5-chat-thinking" aria-hidden="true">
              <span /><span /><span />
            </div>
            <div className="hero-v5-chat-answer" data-testid="hero-v5-assistant-answer">
              <strong>Hello!</strong>
              <p>{pt
                ? 'Desenvolvo soluções com IA, engenharia de software e dados para transformar problemas complexos em sistemas inteligentes.'
                : 'I build intelligent systems through AI engineering, software development and data-driven solutions.'}</p>
            </div>
          </div>
          <div className="hero-v5-chat-footer">{pt ? 'Conversa ilustrativa · sem conexão com IA' : 'Illustrative conversation · no live AI connection'}</div>
        </div>
      </div>
    </>
  )
}
