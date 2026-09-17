import { FileText, Github, GraduationCap, Maximize2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../../domain/models/Project'
import type { ProjectInstitution } from '../../domain/models/ProjectInstitution'
import { SafeImage } from '../SafeImage'
import { ImageLightbox } from '../ImageLightbox'
import { CaseInstitutionLogos } from './CaseInstitutionLogos'

export function CaseHero({
  project,
  backLabel,
  statusLabel,
  privatePlatformLabel,
  primaryLabel,
  researchLabel,
  githubLabel,
  reportDownloadLabel,
  institutions,
}: {
  project: Project
  backLabel: string
  statusLabel: string
  privatePlatformLabel: string
  primaryLabel: string
  researchLabel: string
  githubLabel: string
  reportDownloadLabel: string
  institutions: ProjectInstitution[]
}) {
  const cover = project.coverImage?.url || './projects/foton-hub.svg'
  const technologies = Array.isArray(project.technologies) ? project.technologies : []
  const description = (project.description ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const [coverOpen, setCoverOpen] = useState(false)

  return (
    <section className="case-story-hero">
      <div className="site-container case-story-hero-grid">
        <div className="case-story-hero-copy">
          <Link className="case-back-link" to="/">← {backLabel}</Link>

          <div className="eyebrow">{project.category}</div>
          <h1>{project.title}</h1>
          {project.subtitle && <p className="case-story-subtitle">{project.subtitle}</p>}
          {description && <p className="case-story-description">{description}</p>}

          {technologies.length > 0 && (
            <div className="tech-list case-story-tech">
              {technologies.map((technology) => <span key={technology}>{technology}</span>)}
            </div>
          )}

          <div className="case-story-status">
            <span>{statusLabel}</span>
            <strong>{project.status === 'Private Platform' ? privatePlatformLabel : project.status}</strong>
          </div>

          {(project.links.githubUrl || project.reportPdfUrl || (project.isAcademic && project.academicContext)) && (
            <div className="case-hero-metadata" aria-label="Project links and context">
              {project.links.githubUrl && (
                <a href={project.links.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github size={15} />
                  <span>{githubLabel}</span>
                </a>
              )}

              {project.reportPdfUrl && (
                <a
                  href={project.reportPdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText size={15} />
                  <span>{reportDownloadLabel}</span>
                </a>
              )}

              {project.isAcademic && project.academicContext && (
                <span className="case-hero-context">
                  <GraduationCap size={15} />
                  <span>{project.academicContext}</span>
                </span>
              )}
            </div>
          )}

          <CaseInstitutionLogos institutions={institutions} />

          <div className="case-actions">
            {project.links.liveUrl && <a className="button" href={project.links.liveUrl} target="_blank" rel="noopener noreferrer">{primaryLabel} ↗</a>}
            {project.links.researchUrl && <a className="button button-secondary" href={project.links.researchUrl} target="_blank" rel="noopener noreferrer">{researchLabel} ↗</a>}
          </div>
        </div>

        <button
          type="button"
          className="case-story-cover case-cover-zoom"
          onClick={() => setCoverOpen(true)}
          aria-label={`Open ${project.title} cover image`}
        >
          <SafeImage src={cover} alt={`${project.title} project cover`} />
          <span className="image-zoom-indicator" aria-hidden="true">
            <Maximize2 size={17} />
          </span>
        </button>

        <ImageLightbox
          items={[{
            src: cover,
            alt: `${project.title} project cover`,
            downloadName: `${project.slug}-cover`,
          }]}
          index={coverOpen ? 0 : null}
          onClose={() => setCoverOpen(false)}
          allowDownload={false}
          ariaLabel={`${project.title} cover image`}
        />
      </div>
    </section>
  )
}
