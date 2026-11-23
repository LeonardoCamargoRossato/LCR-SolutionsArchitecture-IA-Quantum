/** Approved, bilingual LCR portfolio positioning (November 2026). */
export const PORTFOLIO_HERO_TITLE = 'AI Engineering & Software Development'
export const PORTFOLIO_HERO_SUBTITLE = 'Building Intelligent Solutions.'
export const PROFESSIONAL_POSITIONING = 'AI Engineer | Software Development | Applied AI | Systems Architecture'
export const PORTFOLIO_SKILLS = {
  'en-US': ['LLMs', 'AI Agents', 'RAG & Hybrid Retrieval', 'Python', 'Data Engineering', 'Mathematical Optimization', 'Quantum Computing'],
  'pt-BR': ['LLMs', 'Agentes de IA', 'RAG & Recuperação Híbrida', 'Python', 'Engenharia de Dados', 'Otimização Matemática', 'Computação Quântica'],
} as const

/** The only Hero paragraph, in English across locales. CMS data remains intact
 * for About and other sections; this copy cannot revert during hydration. */
export const PORTFOLIO_HERO_DESCRIPTION =
  'I design and build intelligent software, combining AI, data, and systems architecture.'

/** Deliberately concise: the full skills inventory lives in Capabilities. */
export const PORTFOLIO_HERO_TAGS = [
  'LLMs & AI Agents',
  'RAG & Hybrid Retrieval',
  'Python & Software Engineering',
  'Data & Optimization',
  'Quantum Computing',
] as const
