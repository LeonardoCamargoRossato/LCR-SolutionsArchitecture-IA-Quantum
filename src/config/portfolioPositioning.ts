import type { Locale } from '../i18n/types'

/**
 * The public Hero must never mix PT and EN copy (including CMS hydration).
 * Short labels preserve meaning and accessible full labels on small screens.
 * Retain the existing physical hero assets and their original naming.
 */
export const PORTFOLIO_HERO_CONTENT = {
  'en-US': {
    title: 'AI Engineering & Software Development',
    subtitle: 'Building Intelligent Solutions.',
    description: 'I design and build intelligent software, combining AI, data, hybrid RAG, and systems architecture.',
    positioning: 'AI Engineer | Software Development | Applied AI | Systems Architecture',
    tags: [
      { full: 'LLMs & AI Agents', short: 'LLMs & Agents' },
      { full: 'RAG & Hybrid Retrieval', short: 'Hybrid RAG' },
      { full: 'Data & Optimization', short: 'Data & Opt.' },
      { full: 'Quantum Computing', short: 'Quantum' },
    ],
  },
  'pt-BR': {
    title: 'Engenheiro de IA e Desenvolvimento de Software',
    subtitle: 'Construindo Soluções Inteligentes.',
    description: 'Projeto e desenvolvo software inteligente, combinando IA, dados, RAG híbrido e arquitetura de sistemas.',
    positioning: 'Engenheiro de IA | Desenvolvimento de Software | IA Aplicada | Arquitetura de Sistemas',
    tags: [
      { full: 'LLMs e Agentes de IA', short: 'LLMs e Agentes' },
      { full: 'RAG e Recuperação Híbrida', short: 'RAG Híbrido' },
      { full: 'Dados e Otimização', short: 'Dados/Otim.' },
      { full: 'Computação Quântica', short: 'Quântica' },
    ],
  },
} as const satisfies Record<Locale, {
  title: string
  subtitle: string
  description: string
  positioning: string
  tags: ReadonlyArray<{ full: string; short: string }>
}>

export const PORTFOLIO_HERO_TITLE = PORTFOLIO_HERO_CONTENT['en-US'].title
export const PORTFOLIO_HERO_SUBTITLE = PORTFOLIO_HERO_CONTENT['en-US'].subtitle
export const PORTFOLIO_HERO_DESCRIPTION = PORTFOLIO_HERO_CONTENT['en-US'].description
export const PORTFOLIO_HERO_TAGS = PORTFOLIO_HERO_CONTENT['en-US'].tags.map(tag => tag.full)
export const PROFESSIONAL_POSITIONING = PORTFOLIO_HERO_CONTENT['en-US'].positioning

export const PORTFOLIO_SKILLS = {
  'en-US': ['LLMs', 'AI Agents', 'RAG & Hybrid Retrieval', 'Python', 'Data Engineering', 'Mathematical Optimization', 'Quantum Computing'],
  'pt-BR': ['LLMs', 'Agentes de IA', 'RAG & Recuperação Híbrida', 'Python', 'Engenharia de Dados', 'Otimização Matemática', 'Computação Quântica'],
} as const
