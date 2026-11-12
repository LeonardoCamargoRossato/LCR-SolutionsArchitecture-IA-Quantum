import type { Locale } from '../i18n/types'

export type WorkflowDiagramResource = {
  id: string
  originalName: string
  publicPath: string
  thumbnailPath: string
  previewPath: string
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
    id: 'lcr-agents-roles-functions',
    originalName: 'LCR_Workflow_Agentes_Papeis_Funcoes.png',
    publicPath: 'workflow/LCR_Workflow_Agentes_Papeis_Funcoes.png',
    thumbnailPath: 'workflow/LCR_Workflow_Agentes_Papeis_Funcoes.png',
    previewPath: 'workflow/LCR_Workflow_Agentes_Papeis_Funcoes.png',
    category: { en: 'Agents & Roles', pt: 'Agentes e Funções' },
    title: { en: 'LCR Workflow — Agents, Roles and Functions', pt: 'LCR Workflow — Agentes, Papéis e Funções' },
    description: {
      en: 'A visual map of the specialized agents used in the workflow, their responsibilities, human approval gates and the overall delivery cycle.',
      pt: 'Mapa visual dos agentes especializados usados no workflow, suas responsabilidades, gates de aprovação humana e o ciclo geral de entrega.',
    },
    width: 1536,
    height: 1024,
    sizeBytes: 1793986,
    source: 'Original LCR agent diagram · Google Drive / conversation',
  },
  {
    id: 'lcr-workflow-structure',
    originalName: 'LcrWorkflowEstrutura.png',
    publicPath: 'workflow/LcrWorkflowEstrutura.png',
    thumbnailPath: 'workflow/lcr-workflow-structure-thumb.svg',
    previewPath: 'workflow/lcr-workflow-structure-preview.svg',
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
