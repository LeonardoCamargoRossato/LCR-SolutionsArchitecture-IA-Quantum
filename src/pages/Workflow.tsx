import { Link } from 'react-router-dom'
import { AgentOrchestration } from '../components/AgentOrchestration'
import { WorkflowDocuments } from '../components/WorkflowDocuments'
import { WorkflowManual } from '../components/WorkflowManual'
import { WorkflowProcessBrowser } from '../components/WorkflowProcessBrowser'
import { lcrWorkflow } from '../data/lcrWorkflow'
import { useI18n } from '../i18n/I18nProvider'
import orchestrationMarkdown from '../../docs/LCR_AGENT_ORCHESTRATION.md?raw'

export function Workflow() {
  const { locale } = useI18n()
  const pt = locale === 'pt-BR'

  return (
    <main className="workflow-page">
      <section className="workflow-page-hero">
        <div className="site-container">
          <Link className="case-back-link" to="/">
            ← {pt ? 'Voltar ao portfólio' : 'Back to portfolio'}
          </Link>
          <div className="eyebrow">LCR Workflow</div>
          <h1>{pt ? 'Como eu estruturo decisões e entregas' : 'How I structure decisions and delivery'}</h1>
          <p>
            {pt
              ? 'Uma visão do sistema de planejamento, autorização humana, implementação, verificação independente e publicação.'
              : 'A view of the system for planning, human authorization, implementation, independent verification and publication.'}
          </p>
        </div>
      </section>

      <WorkflowDocuments locale={locale} />

      <WorkflowProcessBrowser steps={lcrWorkflow(locale)} locale={locale} />

      <div className="site-container workflow-agents-section">
        <AgentOrchestration markdown={orchestrationMarkdown} locale={locale} />
      </div>

      <div className="site-container workflow-page-resources workflow-manual-section">
        <WorkflowManual markdown={orchestrationMarkdown} locale={locale} />
      </div>
    </main>
  )
}
