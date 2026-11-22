import type { Capability } from '../domain/models/SiteContent'

type RelatedProject = { slug: string; pt: string; en: string }
type CapabilityCategory = {
  id: string
  pt: string
  en: string
  projects: RelatedProject[]
}

/** Human-curated project associations; hidden or unavailable cases are filtered by the UI. */
const categories: Record<string, CapabilityCategory> = {
  ai: {
    id: 'ai', pt: 'Engenharia de IA & Sistemas Inteligentes', en: 'AI Engineering & Intelligent Systems',
    projects: [
      { slug: 'animefinder', pt: 'LLMs, RAG e recuperação híbrida orientada por evidências.', en: 'LLMs, RAG and evidence-grounded hybrid retrieval.' },
      { slug: 'hamlet', pt: 'Chatbot contextual com busca semântica e fontes.', en: 'Contextual chatbot with semantic retrieval and sources.' },
      { slug: 'foton-hub', pt: 'Integrações GPT no ecossistema corporativo.', en: 'GPT integrations in an enterprise environment.' },
    ],
  },
  software: {
    id: 'software', pt: 'Engenharia de Software & Arquitetura', en: 'Software Engineering & Architecture',
    projects: [
      { slug: 'foton-hub', pt: 'Plataforma React/SPFx e integração Microsoft 365.', en: 'React/SPFx platform and Microsoft 365 integration.' },
      { slug: 'animefinder', pt: 'Aplicação React e serviços Supabase integrados.', en: 'React application and integrated Supabase services.' },
      { slug: 'hamlet', pt: 'Plataforma full-stack com banco, storage e administração.', en: 'Full-stack platform with database, storage and administration.' },
    ],
  },
  data: {
    id: 'data', pt: 'Engenharia de Dados & Otimização Matemática', en: 'Data Engineering & Mathematical Optimization',
    projects: [
      { slug: 'cities-comparing', pt: 'Engenharia de dados, Binscatter, B-GCA e comparação quantitativa.', en: 'Data engineering, Binscatter, B-GCA and quantitative comparison.' },
      { slug: 'animefinder', pt: 'PostgreSQL, recuperação estatística e semântica.', en: 'PostgreSQL with statistical and semantic retrieval.' },
      { slug: 'webseer', pt: 'Análise de texto e visualização exploratória.', en: 'Text analysis and exploratory visualization.' },
    ],
  },
  science: {
    id: 'science', pt: 'Computação Quântica & Científica', en: 'Quantum & Scientific Computing',
    projects: [
      { slug: 'quantum-education-apps', pt: 'Aplicações didáticas de computação quântica.', en: 'Quantum computing educational applications.' },
      { slug: 'ce235-real-time-systems', pt: 'Engenharia acadêmica de tempo real e telemetria.', en: 'Academic real-time engineering and telemetry.' },
      { slug: 'cities-comparing', pt: 'Métodos quantitativos e computação científica.', en: 'Quantitative methods and scientific computing.' },
    ],
  },
  enterprise: {
    id: 'enterprise', pt: 'Sistemas Corporativos & Integração', en: 'Enterprise Systems & Integration',
    projects: [
      { slug: 'foton-hub', pt: 'Arquitetura modular, SharePoint/SPFx e Microsoft 365.', en: 'Modular architecture, SharePoint/SPFx and Microsoft 365.' },
    ],
  },
}

export function categoryForCapability(capability: Capability): CapabilityCategory {
  const title = (capability.title ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  // First match the explicit engineering names. Otherwise "Architecture"
  // would incorrectly classify software engineering as enterprise.
  if (/ai engineering|engenharia de ia|intelligent systems|sistemas inteligentes|applied ai|ia aplicada/.test(title)) return categories.ai
  if (/software|engenharia de software|desenvolvimento de software/.test(title)) return categories.software
  if (/data|dados|optimization|otimiz|quantitative|quantitativ/.test(title)) return categories.data
  if (/quantum|quantic|scientific|cientific/.test(title)) return categories.science
  if (/enterprise|corporativ|integracao|integration|sistemas corporativos|arquitetura/.test(title)) return categories.enterprise
  return categories.software
}
