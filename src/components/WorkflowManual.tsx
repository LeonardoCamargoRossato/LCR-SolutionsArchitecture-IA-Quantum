import { useMemo, useState } from 'react'
import type { Locale } from '../i18n/types'

type Block = { type: 'heading'; level: number; text: string } | { type: 'paragraph'; text: string } | { type: 'list'; items: string[] }

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
    return part
  })
}

function parse(markdown: string): Block[] {
  const blocks: Block[] = []; let paragraph: string[] = []; let items: string[] = []
  const flush = () => { if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join(' ') }); if (items.length) blocks.push({ type: 'list', items }); paragraph = []; items = [] }
  markdown.split('\n').forEach((line) => {
    const heading = line.match(/^(#{1,4})\s+(.+)$/); const item = line.match(/^[-*]\s+(.+)$/)
    if (heading) { flush(); blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] }); return }
    if (item) { if (paragraph.length) flush(); items.push(item[1]); return }
    if (!line.trim()) { flush(); return }
    if (items.length) flush(); paragraph.push(line.trim())
  }); flush(); return blocks
}

export function WorkflowManual({ markdown, locale }: { markdown: string; locale: Locale }) {
  const [expanded, setExpanded] = useState(false); const blocks = useMemo(() => parse(markdown), [markdown]); const pt = locale === 'pt-BR'
  return <section className={`workflow-manual${expanded ? ' is-expanded' : ''}`} aria-labelledby="workflow-manual-title">
    <div className="workflow-manual-header"><div><div className="eyebrow">Markdown · Source of truth</div><h2 id="workflow-manual-title">{pt ? 'Manual de orquestração LCR' : 'LCR orchestration manual'}</h2><p>{pt ? 'Documento vivo que sustenta o diagrama e registra papéis, entradas, ações, artefatos e gates.' : 'The living document behind the diagram, recording roles, inputs, actions, artifacts and gates.'}</p></div><button type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? (pt ? 'Fechar visão ampliada' : 'Close expanded view') : (pt ? 'Abrir visão ampliada' : 'Open expanded view')}</button></div>
    <div className="workflow-manual-reader" tabIndex={0}><article>{blocks.map((block, index) => { if (block.type === 'heading') { const Tag = block.level <= 1 ? 'h3' : block.level === 2 ? 'h4' : 'h5'; return <Tag key={index}>{inline(block.text)}</Tag> } if (block.type === 'list') return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}</ul>; return <p key={index}>{inline(block.text)}</p> })}</article></div>
    <div className="workflow-manual-footer"><span>LCR_AGENT_ORCHESTRATION.md</span><a download="LCR_AGENT_ORCHESTRATION.md" href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`}>{pt ? 'Baixar arquivo MD' : 'Download MD file'} ↓</a></div>
  </section>
}
