import type { Experience } from '../domain/models/About'
import type { Locale } from '../i18n/types'

const resourceGroups = [
  {
    match: /\bufsm\b/i,
    links: [
      { url: 'https://doi.org/10.1016/j.physa.2023.128778', pt: 'Artigo do TCC', en: 'Undergraduate research paper' },
      { url: 'https://github.com/LeonardoCamargoRossato/Papers_Supplementary_Info_SI/tree/main/CondensedMatter', pt: 'Matéria Condensada no GitHub', en: 'Condensed Matter on GitHub' },
    ],
  },
  {
    match: /\bufrgs\b/i,
    links: [
      { url: 'https://leonardocamargorossato.github.io/CitiesComparing_ResearchPlatform/', pt: 'Abrir Cities Comparing', en: 'Open Cities Comparing' },
      { url: 'https://doi.org/10.1140/epjb/s10051-024-00766-5', pt: 'Artigo de Econofísica', en: 'Econophysics paper' },
      { url: 'https://github.com/LeonardoCamargoRossato/Papers_Supplementary_Info_SI/tree/main/Econophysics/Analysis_SocioEconomic_Indicators_Brazil_and_Americas', pt: 'Econofísica no GitHub', en: 'Econophysics on GitHub' },
    ],
  },
  {
    match: /\bfoton\b/i,
    links: [
      { url: 'https://institutofoton.com.br/', pt: 'Instituto Foton', en: 'Foton Institute' },
      { url: 'https://leonardocamargorossato.github.io/LCR-SolutionsArchitecture-IA-Quantum/#/projects/foton-hub', pt: 'Conhecer o Foton Hub', en: 'Explore Foton Hub' },
    ],
  },
]

export function resourcesForExperience(experience: Experience, locale: Locale) {
  // Match institution names as well as IDs so CMS-generated IDs work too.
  const group = resourceGroups.find(({ match }) => match.test(`${experience.id} ${experience.organization}`))
  return group?.links.map(({ url, pt, en }) => ({ url, label: locale === 'pt-BR' ? pt : en })) ?? []
}
