import { Link } from 'react-router-dom'
import type { Project } from '../domain/models/Project'
import { localizedProject } from '../i18n/content'
import { useI18n } from '../i18n/I18nProvider'
import { SafeImage } from './SafeImage'

type ProjectCardVariant = 'primary' | 'compact'

type Props = {
  project: Project
  variant?: ProjectCardVariant
}

export function ProjectCard({ project, variant = 'primary' }: Props) {
  const { locale, t } = useI18n()
  const current = localizedProject(project, locale)
  const description = (current.description ?? '').replace(/<[^>]*>/g, ' ')
  const technologies = current.technologies ?? []
  const image = current.coverImage?.url
  const ctaLabel = t('viewCase')
  const cardClassName = `project-card project-card-${variant} ${current.featured ? 'project-card-featured-accent' : ''}`

  const content = (
    <>
      <div className="project-image-wrap">
        {current.badge && <span className="project-badge">{current.badge}</span>}
        {image ? (
          <SafeImage
            className="project-image"
            src={image}
            alt={`${current.title ?? 'Project'} project cover`}
            fallbackLabel={current.title || 'Project image unavailable'}
            loading="lazy"
          />
        ) : (
          <div
            className="project-image-placeholder"
            role="img"
            aria-label={`${current.title ?? 'Project'} image placeholder`}
          >
            {current.slug === 'quantum-education-apps' ? (
              <div className="project-image-placeholder-content">
                <span className="project-image-placeholder-icon" aria-hidden="true">⚛</span>
                <strong>{current.title ?? 'Quantum Computing Educational Apps'}</strong>
              </div>
            ) : (
              <span>{(current.title ?? 'Project').slice(0, 1).toUpperCase()}</span>
            )}
          </div>
        )}
      </div>

      <div className="project-content">
        <div className="project-meta-row">
          <span className="project-category">{current.category ?? ''}</span>
          <span className="project-status">
            {current.status === 'Private Platform' ? t('privatePlatform') : current.status}
          </span>
        </div>

        <h3>{current.title ?? ''}</h3>
        {current.subtitle && <p className="project-subtitle">{current.subtitle}</p>}
        <p className="project-description">{description}</p>

        <div className="project-footer-row">
          <div className="tech-list">
            {technologies.slice(0, variant === 'compact' ? 4 : 5).map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </div>
          <span className="view-link">{ctaLabel} ↗</span>
        </div>
      </div>
    </>
  )

  return (
    <Link
      to={`/projects/${current.slug}`}
      className={cardClassName}
      aria-label={`${ctaLabel}: ${current.title ?? ''}`}
    >
      {content}
    </Link>
  )
}
