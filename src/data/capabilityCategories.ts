import type { Capability } from '../domain/models/SiteContent'

type RelatedProject = { slug: string; pt: string; en: string }
type CapabilityCategory = {
  id: string
  pt: string
  en: string
  projects: RelatedProject[]
}

const categories: Record<string, CapabilityCategory> = {
  software: {
    id: 'software', pt: 'Software', en: 'Software',
    projects: [
      { slug: 'foton-hub', pt: 'Aplicação web, componentes reutilizáveis e integrações.', en: 'Web application, reusable components and integrations.' },
      { slug: 'hamlet', pt: 'Plataforma web e experiência interativa de conteúdo.', en: 'Web platform and interactive content experience.' },
      { slug: 'speaker-portfolio', pt: 'Interface responsiva, conteúdo e galerias de mídia.', en: 'Responsive interface, content and media galleries.' },
    ],
  },
  ai: {
    id: 'ai', pt: 'IA Aplicada', en: 'Applied AI',
    projects: [
      { slug: 'hamlet', pt: 'Chatbot, LLM e acesso ao conhecimento com RAG.', en: 'Chatbot, LLM and knowledge access with RAG.' },
      { slug: 'foton-hub', pt: 'Integrações GPT e acesso assistido ao conhecimento institucional.', en: 'GPT integrations and assisted access to institutional knowledge.' },
    ],
  },
  data: {
    id: 'data', pt: 'Dados & Otimização', en: 'Data & Optimization',
    projects: [
      { slug: 'cities-comparing', pt: 'Engenharia de dados, Binscatter, B-GCA e análise comparativa.', en: 'Data engineering, Binscatter, B-GCA and comparative analysis.' },
      { slug: 'scientific-analysis', pt: 'Pipelines científicos, estatística e visualização de dados.', en: 'Scientific pipelines, statistics and data visualization.' },
      { slug: 'webseer', pt: 'Análise de texto, visualização e apoio à decisão.', en: 'Text analysis, visualization and decision support.' },
    ],
  },
  science: {
    id: 'science', pt: 'Sistemas Científicos & Quânticos', en: 'Scientific & Quantum Systems',
    projects: [
      { slug: 'quantum-education-apps', pt: 'Aplicações educacionais de computação quântica.', en: 'Quantum computing educational applications.' },
      { slug: 'scientific-analysis', pt: 'Computação científica e fluxos de pesquisa reprodutíveis.', en: 'Scientific computing and reproducible research workflows.' },
      { slug: 'ce235-real-time-systems', pt: 'Projeto acadêmico de sistemas de tempo real e telemetria simulada.', en: 'Academic real-time systems project and simulated telemetry.' },
    ],
  },
  enterprise: {
    id: 'enterprise', pt: 'Arquitetura Corporativa', en: 'Enterprise Architecture',
    projects: [
      { slug: 'foton-hub', pt: 'Arquitetura modular, SharePoint/SPFx e integrações Microsoft 365.', en: 'Modular architecture, SharePoint/SPFx and Microsoft 365 integrations.' },
    ],
  },
}

export function categoryForCapability(capability: Capability) {
  const title = (capability.title ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (/quantum|quantic|scientific|cientific/.test(title)) return categories.science
  if (/enterprise|corporativ|architecture|arquitetura/.test(title)) return categories.enterprise
  if (/applied ai|ia aplicada|agent|inteligencia artificial/.test(title)) return categories.ai
  if (/data|dados|optimization|otimiz|quantitative|quantitativ/.test(title)) return categories.data
  return categories.software
}
