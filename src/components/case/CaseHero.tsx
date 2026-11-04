import { ChevronLeft, ChevronRight, ExternalLink, FileText, Github, GraduationCap, Maximize2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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
  const galleryItems = (project.gallery ?? [])
    .filter((item) => item.visible !== false && item.image?.url)
    .sort((a, b) => (a.sortOrder ?? a.order) - (b.sortOrder ?? b.order))
    .map((item) => ({
      src: item.image!.url,
      alt: item.altText || item.image!.altText || item.caption || `${project.title} project image`,
      downloadName: `${project.slug}-${item.id}`,
    }))
  const heroItems = galleryItems.length > 0
    ? galleryItems
    : [{ src: cover, alt: `${project.title} project cover`, downloadName: `${project.slug}-cover` }]
  const technologies = Array.isArray(project.technologies) ? project.technologies : []
  const description = (project.description ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const [heroIndex, setHeroIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const hasCarousel = heroItems.length > 1

  useEffect(() => {
    setHeroIndex(0)
    setLightboxIndex(null)
  }, [project.slug])

  const changeSlide = (index: number) => {
    setHeroIndex((index + heroItems.length) % heroItems.length)
  }

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
            {project.links.liveUrl && <a className="button" href={project.links.liveUrl} target="_blank" rel="noopener noreferrer">{primaryLabel}<ExternalLink size={14} aria-hidden="true" /></a>}
            {project.links.researchUrl && <a className="button button-secondary" href={project.links.researchUrl} target="_blank" rel="noopener noreferrer">{researchLabel}<ExternalLink size={14} aria-hidden="true" /></a>}
          </div>
        </div>

        <div className={`case-hero-media${hasCarousel ? ' has-carousel' : ''}`}>
          <button
            type="button"
            className="case-story-cover case-cover-zoom"
            onClick={() => setLightboxIndex(heroIndex)}
            aria-label={`Open ${project.title} image ${heroIndex + 1}`}
          >
            <SafeImage src={heroItems[heroIndex].src} alt={heroItems[heroIndex].alt} />
            <span className="image-zoom-indicator" aria-hidden="true">
              <Maximize2 size={17} />
            </span>
          </button>

          {hasCarousel && (
            <div className="case-hero-carousel-controls" aria-label={`${project.title} image carousel`}>
              <button type="button" onClick={() => changeSlide(heroIndex - 1)} aria-label="Previous project image">
                <ChevronLeft size={18} />
              </button>
              <div className="case-hero-carousel-dots">
                {heroItems.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    className={index === heroIndex ? 'is-active' : ''}
                    onClick={() => changeSlide(index)}
                    aria-label={`Show project image ${index + 1}`}
                    aria-current={index === heroIndex ? 'true' : undefined}
                  />
                ))}
              </div>
              <span className="case-hero-carousel-count">{heroIndex + 1} / {heroItems.length}</span>
              <button type="button" onClick={() => changeSlide(heroIndex + 1)} aria-label="Next project image">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <ImageLightbox
          items={heroItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={hasCarousel ? (index) => {
            setHeroIndex(index)
            setLightboxIndex(index)
          } : undefined}
          allowDownload={false}
          ariaLabel={`${project.title} project images`}
        />
      </div>
    </section>
  )
}
