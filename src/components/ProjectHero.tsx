import { DemandImage } from './DemandImage'
import type { Project } from '../types/project'
import { useI18n } from '../i18n/I18nProvider'

export function ProjectHero({ project }: { project: Project }) {
  const { locale, t } = useI18n()
  return (
    <section className={`case-hero ${project.theme === 'dark' ? 'case-hero-dark' : ''}`}>
      <div className="container">
        <div className="case-hero-grid">
          <div className="case-heading">
            <div className="eyebrow">{project.category}</div>
            <h1>{project.title}</h1>
            {project.subtitle && <p className="case-subtitle">{project.subtitle}</p>}
            <p className="case-description">{project.description}</p>

            <div className="tech-list case-tech">
              {project.technologies.map((tech) => <span key={tech}>{tech}</span>)}
            </div>

            <div className="case-actions">
              {project.links?.map((link) =>
                link.url ? (
                  <a
                    key={link.label}
                    className={`button ${link.kind === 'secondary' ? 'button-secondary' : ''}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label} ↗
                  </a>
                ) : (
                  <span key={link.label} className="button button-disabled" title={locale === 'pt-BR' ? 'URL ainda não cadastrada' : 'URL not added yet'}>
                    {link.label}
                  </span>
                ),
              )}
              {project.status === 'Private Platform' && (
                <span className="button button-disabled">{t('privatePlatform')}</span>
              )}
            </div>
          </div>

          <div className="case-index">
            <span>{t('status')}</span>
            <strong>{project.status}</strong>
          </div>
        </div>

        <div className="browser-frame case-cover">
          <div className="browser-bar">
            <span /><span /><span />
          </div>
          <DemandImage src={project.coverImage} alt={locale === 'pt-BR' ? `Interface da aplicação ${project.title}` : `${project.title} application interface`} />
        </div>
      </div>
    </section>
  )
}
