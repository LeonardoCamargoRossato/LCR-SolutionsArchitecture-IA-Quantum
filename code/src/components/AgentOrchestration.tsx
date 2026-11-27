import { useMemo, useState } from 'react'
import type { Locale } from '../i18n/types'

type Agent = { id: string; name: string; role: string; inputs: string; actions: string; outputs: string; gate: string }
type Field = 'Name' | 'Role' | 'Inputs' | 'Actions' | 'Outputs' | 'Gate'

function parseAgents(markdown: string, locale: Locale): Agent[] {
  const language = locale === 'pt-BR' ? 'PT' : 'EN'
  return markdown.split(/^## /m).slice(1).map((section) => {
    const [heading, ...lines] = section.trim().split('\n')
    const read = (field: Field) => lines.find((line) => line.startsWith(`- ${field} ${language}:`))?.split(':').slice(1).join(':').trim() ?? ''
    return { id: heading.trim(), name: read('Name'), role: read('Role'), inputs: read('Inputs'), actions: read('Actions'), outputs: read('Outputs'), gate: read('Gate') }
  }).filter((agent) => agent.id && agent.name)
}

const flow = ['human', 'planner', 'human', 'builder', 'ci', 'auditor', 'builder', 'human']

export function AgentOrchestration({ markdown, locale }: { markdown: string; locale: Locale }) {
  const agents = useMemo(() => parseAgents(markdown, locale), [markdown, locale])
  const byId = useMemo(() => new Map(agents.map((agent) => [agent.id, agent])), [agents])
  const [selected, setSelected] = useState('planner')
  const current = byId.get(selected) ?? agents[0]
  const pt = locale === 'pt-BR'

  return <section className="agent-orchestration" aria-labelledby="agent-orchestration-title">
    <div className="agent-orchestration-heading"><div><div className="eyebrow">{pt ? 'Orquestração' : 'Orchestration'}</div><h2 id="agent-orchestration-title">{pt ? 'Agentes, gates e ciclos de retorno' : 'Agents, gates and return loops'}</h2><p>{pt ? 'Selecione um elemento do fluxo para entender responsabilidades, entradas, ações e condições de avanço.' : 'Select a flow element to inspect responsibilities, inputs, actions and advancement conditions.'}</p></div></div>
    <div className="agent-flow-scroll" tabIndex={0} aria-label={pt ? 'Diagrama horizontal da orquestração' : 'Horizontal orchestration diagram'}>
      <div className="agent-flow">
        {flow.map((id, index) => { const agent = byId.get(id); if (!agent) return null; return <div className="agent-flow-segment" key={`${id}-${index}`}>
          <button type="button" className={selected === id ? 'is-active' : ''} onClick={() => setSelected(id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{agent.name}</strong><small>{index === 2 || index === 7 ? (pt ? 'Gate humano' : 'Human gate') : agent.role}</small></button>
          {index < flow.length - 1 && <span className="agent-flow-arrow" aria-hidden="true">→</span>}
        </div>})}
      </div>
    </div>
    {current && <article className="agent-focus" aria-live="polite"><div className="agent-focus-intro"><span>{pt ? 'Elemento selecionado' : 'Selected element'}</span><h3>{current.name}</h3><p>{current.role}</p></div><dl><div><dt>{pt ? 'Entradas' : 'Inputs'}</dt><dd>{current.inputs}</dd></div><div><dt>{pt ? 'Ações' : 'Actions'}</dt><dd>{current.actions}</dd></div><div><dt>{pt ? 'Artefatos' : 'Outputs'}</dt><dd>{current.outputs}</dd></div><div><dt>Gate</dt><dd>{current.gate}</dd></div></dl></article>}
    <div className="agent-library"><div className="agent-library-title"><h3>{pt ? 'Biblioteca de responsabilidades' : 'Responsibility library'}</h3><p>{pt ? 'Abra apenas o agente que deseja examinar.' : 'Expand only the agent you want to inspect.'}</p></div>{agents.map((agent) => <details key={agent.id}><summary><span>{agent.name}</span><small>{agent.role}</small></summary><div><p><strong>{pt ? 'Entradas:' : 'Inputs:'}</strong> {agent.inputs}</p><p><strong>{pt ? 'Ações:' : 'Actions:'}</strong> {agent.actions}</p><p><strong>{pt ? 'Artefatos:' : 'Outputs:'}</strong> {agent.outputs}</p><p><strong>Gate:</strong> {agent.gate}</p></div></details>)}</div>
  </section>
}
