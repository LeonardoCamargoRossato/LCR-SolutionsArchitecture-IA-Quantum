import { ChevronLeft, ChevronRight, ExternalLink, FileText, Github, GraduationCap, Maximize2 } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../../domain/models/Project'
import type { ProjectInstitution } from '../../domain/models/ProjectInstitution'
import { SafeImage } from '../SafeImage'
import { CaseInstitutionLogos } from './CaseInstitutionLogos'

const ImageLightbox = lazy(() => import('../ImageLightbox').then((module) => ({ default: module.ImageLightbox })))

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
  const cover = project.coverImage?.cardUrl || project.coverImage?.url || './projects/foton-hub.svg'
  const coverItem = {
    src: cover,
    fullSrc: project.coverImage?.fullUrl || project.coverImage?.url || cover,
    previewSrc: project.coverImage?.previewUrl,
    thumbnailSrc: project.coverImage?.thumbnailUrl || cover,
    alt: project.coverImage?.altText || `${project.title} project cover`,
    caption: project.title,
    downloadName: `${project.slug}-cover`,
  }
  const galleryItems = (project.gallery ?? [])
    .filter((item) => item.visible !== false && item.image?.url)
    .sort((a, b) => (a.sortOrder ?? a.order) - (b.sortOrder ?? b.order))
    .map((item) => ({
      src: item.cardUrl || item.image!.url,
      fullSrc: item.fullUrl || item.image!.url,
      previewSrc: item.previewUrl,
      thumbnailSrc: item.thumbnailUrl || item.cardUrl || item.image!.url,
      alt: item.altText || item.image!.altText || item.caption || `${project.title} project image`,
      caption: item.caption,
      downloadName: `${project.slug}-${item.id}`,
    }))
  const normalizedCover = cover.replace(/^\.\//, '/')
  const heroItems = [coverItem, ...galleryItems.filter((item) => item.fullSrc.replace(/^\.\//, '/') !== normalizedCover)]
  const technologies = Array.isArray(project.technologies) ? project.technologies : []
  const description = (project.description ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const [heroIndex, setHeroIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const pointerStart = useRef<number | null>(null)
  const hasCarousel = heroItems.length > 1

  useEffect(() => {
    setHeroIndex(0)
    setLightboxIndex(null)
  }, [project.slug])

  useEffect(() => {
    if (heroItems.length < 2) return
    const adjacent = [
      heroItems[(heroIndex - 1 + heroItems.length) % heroItems.length],
      heroItems[(heroIndex + 1) % heroItems.length],
    ]
    adjacent.forEach((item) => {
      const image = new Image()
      image.src = item.src
    })
  }, [heroIndex, heroItems])

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
            onPointerDown={(event) => { pointerStart.current = event.clientX }}
            onPointerUp={(event) => {
              if (pointerStart.current === null) return
              const distance = event.clientX - pointerStart.current
              pointerStart.current = null
              if (Math.abs(distance) > 48) changeSlide(heroIndex + (distance < 0 ? 1 : -1))
            }}
          >
            <SafeImage
              src={heroItems[heroIndex].src}
              previewSrc={heroItems[heroIndex].previewSrc}
              alt={heroItems[heroIndex].alt}
              eager={heroIndex === 0}
              sizes="(max-width: 980px) 100vw, 48vw"
            />
            <span className="image-zoom-indicator" aria-hidden="true">
              <Maximize2 size={17} />
            </span>
          </button>
          {heroItems[heroIndex].caption && <p className="case-hero-caption">{heroItems[heroIndex].caption}</p>}

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
          {hasCarousel && (
            <div className="case-hero-thumbnails" aria-label={`${project.title} thumbnails`}>
              {heroItems.map((item, index) => (
                <button key={`${item.src}-thumb`} type="button" className={index === heroIndex ? 'is-active' : ''} onClick={() => changeSlide(index)} aria-label={`Show project image ${index + 1}`}>
                  <SafeImage src={item.thumbnailSrc} previewSrc={item.previewSrc} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {lightboxIndex !== null && (
          <Suspense fallback={null}>
            <ImageLightbox
              items={heroItems.map((item) => ({ src: item.fullSrc, alt: item.alt, downloadName: item.downloadName }))}
              index={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onChange={hasCarousel ? (index) => {
                setHeroIndex(index)
                setLightboxIndex(index)
              } : undefined}
              allowDownload={false}
              ariaLabel={`${project.title} project images`}
            />
          </Suspense>
        )}
      </div>
    </section>
  )
}
