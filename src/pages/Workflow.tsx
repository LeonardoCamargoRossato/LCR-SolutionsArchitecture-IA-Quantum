import { WorkProcessSection } from '../components/WorkProcessSection'
import { lcrWorkflow } from '../data/lcrWorkflow'
import { useI18n } from '../i18n/I18nProvider'

export function Workflow() {
  const { locale } = useI18n()
  return <main className="workflow-page"><WorkProcessSection steps={lcrWorkflow(locale)} /></main>
}
