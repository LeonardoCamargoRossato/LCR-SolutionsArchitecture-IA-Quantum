import { Link } from 'react-router-dom'
import { AgentOrchestration } from '../components/AgentOrchestration'
import { WorkProcessSection } from '../components/WorkProcessSection'
import { WorkflowDocuments } from '../components/WorkflowDocuments'
import { lcrWorkflow } from '../data/lcrWorkflow'
import { useI18n } from '../i18n/I18nProvider'
import orchestrationMarkdown from '../../docs/LCR_AGENT_ORCHESTRATION.md?raw'

export function Workflow() {
  const { locale } = useI18n()
  const pt = locale === 'pt-BR'
  return <main className="workflow-page">
    <section className="workflow-page-hero"><div className="site-container"><Link className="case-back-link" to="/">← {pt ? 'Voltar ao portfólio' : 'Back to portfolio'}</Link><div className="eyebrow">LCR Workflow</div><h1>{pt ? 'Como eu estruturo decisões e entregas' : 'How I structure decisions and delivery'}</h1><p>{pt ? 'Uma visão do sistema de planejamento, autorização humana, implementação, verificação independente e publicação.' : 'A view of the system for planning, human authorization, implementation, independent verification and publication.'}</p></div></section>
    <div className="site-container"><AgentOrchestration markdown={orchestrationMarkdown} locale={locale} /></div>
    <WorkProcessSection steps={lcrWorkflow(locale)} />
    <WorkflowDocuments markdown={orchestrationMarkdown} locale={locale} />
  </main>
}
