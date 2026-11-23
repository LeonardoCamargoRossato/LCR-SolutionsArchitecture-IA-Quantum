/**
 * Hero V4 outcomes: generated code resolves into AI Hamnet's conversation.
 * Visual-only, deterministic. Never executes the displayed code or connects
 * to an assistant, model, user account or external data source.
 */

const codeLines = [
  { number: '01', indent: 0, keyword: 'const', expression: ' pipeline = createAI()' },
  { number: '02', indent: 1, keyword: 'const', expression: ' context = await retrieve(data)' },
  { number: '03', indent: 1, keyword: 'const', expression: ' layers = neuralNetwork(context)' },
  { number: '04', indent: 1, keyword: 'const', expression: ' insight = await reason(layers)' },
  { number: '05', indent: 1, keyword: 'return', expression: ' respond(insight)' },
  { number: '06', indent: 0, keyword: '//', expression: ' intelligence becomes software' },
] as const

export function EngineeringWorkspace({ locale }: { locale: 'pt-BR' | 'en-US' }) {
  const pt = locale === 'pt-BR'
  return (
    <>
      <div className="hero-v4-code-scene" data-testid="hero-v4-code-scene">
        <div className="hero-v4-code-halo" aria-hidden="true" />
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

      <div className="hero-v4-hamnet-scene" data-testid="hero-v4-hamnet-scene">
        <div className="hero-v4-hamnet-glow" aria-hidden="true" />
        <div className="hero-v4-bot-persona">
          <img
            src={`${import.meta.env.BASE_URL}assets/home/hero/ai-hamnet-robot.svg`}
            alt=""
            className="hero-v4-bot-art"
            width="150"
            height="150"
            decoding="async"
          />
          <div className="hero-v4-hamnet-name">AI Hamnet</div>
          <div className="hero-v4-hamnet-state"><span /> Intelligent assistant concept</div>
        </div>
        <div className="hero-v4-chat-window">
          <div className="hero-v4-chat-heading">
            <span className="hero-v4-chat-avatar">AI</span>
            <strong>AI Hamnet</strong>
            <span className="hero-v4-chat-online">●</span>
          </div>
          <div className="hero-v4-chat-bubble">
            <div className="hero-v4-chat-hello">Hello!</div>
            <p>{pt ? 'Eu transformo dados em soluções inteligentes.' : 'I turn data into intelligent solutions.'}</p>
          </div>
          <div className="hero-v4-chat-bottom"><span /> <span /> <span /></div>
        </div>
      </div>
    </>
  )
}
