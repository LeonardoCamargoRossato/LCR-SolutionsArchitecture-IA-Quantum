import { ExternalLink, FileText, Github, GraduationCap } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../../domain/models/Project'
import type { ProjectInstitution } from '../../domain/models/ProjectInstitution'
import { ProjectCarousel } from '../../estruturas-padroes/carrossel-projetos/ProjectCarousel'
import { buildProjectCarouselImages } from '../../estruturas-padroes/carrossel-projetos/carousel-images'
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
  const carouselImages = useMemo(() => buildProjectCarouselImages(project), [project])
  const technologies = Array.isArray(project.technologies) ? project.technologies : []
  const description = (project.description ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  return (
    <section className="case-story-hero">
      <div className="site-container">
        <Link className="case-back-link" to="/">← {backLabel}</Link>
        <div className="case-story-hero-grid">
          <div className="case-story-hero-copy">
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
            {project.links.liveUrl && <a className="button" href={project.links.liveUrl} target="_blank" rel="noopener noreferrer">{primaryLabel}<ExternalLink size={14} aria-hidden="true" /></a>}
            {project.links.researchUrl && <a className="button button-secondary" href={project.links.researchUrl} target="_blank" rel="noopener noreferrer">{researchLabel}<ExternalLink size={14} aria-hidden="true" /></a>}
          </div>
        </div>

          <ProjectCarousel key={project.slug} projectTitle={project.title} images={carouselImages} />
        </div>
      </div>
    </section>
  )
}
