import { ExternalLink } from 'lucide-react'
import type { Experience } from '../domain/models/About'
import { useI18n } from '../i18n/I18nProvider'

type University = {
  acronym: 'UFSM' | 'UFRGS' | 'ITA'
  href: string
  pt: string
  en: string
  titlePt: string
  titleEn: string
}

const universities: University[] = [
  {
    acronym: 'UFSM',
    href: 'https://www.ufsm.br/',
    pt: 'Universidade Federal de Santa Maria',
    en: 'Federal University of Santa Maria',
    titlePt: 'Físico',
    titleEn: 'BSc in Physics',
  },
  {
    acronym: 'UFRGS',
    href: 'https://www.ufrgs.br/',
    pt: 'Universidade Federal do Rio Grande do Sul',
    en: 'Federal University of Rio Grande do Sul',
    titlePt: 'Mestre em Física',
    titleEn: 'MSc in Physics',
  },
  {
    acronym: 'ITA',
    href: 'https://www.ita.br/',
    pt: 'Instituto Tecnológico de Aeronáutica',
    en: 'Aeronautics Institute of Technology',
    titlePt: 'Doutorando em Engenharia Eletrônica e Computação',
    titleEn: 'PhD Candidate in Electronic Engineering and Computing',
  },
]

/**
 * Small curated summary in the Home About section. Details and dates of each
 * leadership appointment are also maintained in the CMS experiences array.
 * University links use verified official sites and open in a separate tab.
 */
export function AboutHighlights({ experiences }: { experiences: Experience[] }) {
  const { locale } = useI18n()
  const pt = locale === 'pt-BR'
  const foton = experiences.find((item) => item.id === 'foton')
  const movement = experiences.find((item) => item.id === 'quantum-leagues')

  return (
    <div className="about-highlights">
      <section className="about-highlight-block" aria-label={pt ? 'Liderança' : 'Leadership'}>
        <h3>{pt ? 'Liderança e voluntariado' : 'Leadership & Volunteering'}</h3>
        <div className="about-highlight-list">
          <div className="about-highlight-entry">
            <strong>{pt ? 'Presidente e cofundador do Instituto Foton' : 'President and co-founder of Instituto Foton'} (2025–2026)</strong>
            <small>{foton?.organization || 'Instituto Foton'} · {pt ? 'Voluntário' : 'Volunteer'}</small>
          </div>
          <div className="about-highlight-entry">
            <strong>
              {pt
                ? 'Vice-presidente e cofundador do Movimento Nacional de Ligas Acadêmicas de Computação Quântica no Brasil'
                : 'Vice-president and co-founder of Brazil’s National Quantum Computing Academic Leagues Movement'} (2024–2025)
            </strong>
            <small>{movement?.organization || (pt ? 'Movimento Nacional de Ligas Acadêmicas de Computação Quântica' : 'National Quantum Computing Academic Leagues Movement')} · {pt ? 'Voluntário' : 'Volunteer'}</small>
          </div>
        </div>
      </section>

      <section className="about-highlight-block" aria-label={pt ? 'Comunicação científica' : 'Science communication'}>
        <h3>{pt ? 'Comunicação científica' : 'Science Communication'}</h3>
        <p>{pt ? 'Mais de 50 palestras realizadas em português e inglês.' : 'More than 50 talks delivered in Portuguese and English.'}</p>
      </section>

      <section className="about-highlight-block" aria-label={pt ? 'Formação acadêmica' : 'Education'}>
        <h3>{pt ? 'Formação acadêmica' : 'Academic Education'}</h3>
        <div className="about-highlight-education">
          {universities.map((university) => (
            <a
              key={university.acronym}
              href={university.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${pt ? university.pt : university.en} (${university.acronym}) — ${pt ? 'abrir site oficial em nova aba' : 'open official website in new tab'}`}
            >
              <strong>{pt ? university.titlePt : university.titleEn} ({university.acronym})</strong>
              <span>{pt ? university.pt : university.en} <ExternalLink size={12} aria-hidden="true" /></span>
            </a>
          ))}
        </div>
      </section>

      <nav className="about-universities-footer" aria-label={pt ? 'Sites oficiais das universidades' : 'Official university websites'}>
        {universities.map((university) => (
          <a
            key={university.acronym}
            href={university.href}
            target="_blank"
            rel="noopener noreferrer"
            title={pt ? university.pt : university.en}
          >
            {university.acronym} <span aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
