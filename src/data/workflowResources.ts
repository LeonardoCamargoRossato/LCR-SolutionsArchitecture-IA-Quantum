import type { Locale } from '../i18n/types'

export type WorkflowDiagramResource = {
  id: string
  originalName: string
  publicPath: string
  category: { en: string; pt: string }
  title: { en: string; pt: string }
  description: { en: string; pt: string }
  width: number
  height: number
  sizeBytes: number
  source: string
}

export const workflowDiagrams: WorkflowDiagramResource[] = [
  {
    id: 'lcr-workflow-structure',
    originalName: 'LcrWorkflowEstrutura.png',
    publicPath: 'workflow/LcrWorkflowEstrutura.png',
    category: { en: 'Overview', pt: 'Visão geral' },
    title: { en: 'LCR Workflow structure', pt: 'Estrutura do LCR Workflow' },
    description: {
      en: 'A visual overview of the workflow objective, specialized roles, integrations, repository organization, ADRs and core documentation.',
      pt: 'Visão visual do objetivo do workflow, papéis especializados, integrações, organização do repositório, ADRs e documentação principal.',
    },
    width: 1024,
    height: 1536,
    sizeBytes: 2119499,
    source: 'Google Drive · LCR Workflow source folder',
  },
]

export function localizedWorkflowDiagram(resource: WorkflowDiagramResource, locale: Locale) {
  const pt = locale === 'pt-BR'
  return {
    category: pt ? resource.category.pt : resource.category.en,
    title: pt ? resource.title.pt : resource.title.en,
    description: pt ? resource.description.pt : resource.description.en,
  }
}
