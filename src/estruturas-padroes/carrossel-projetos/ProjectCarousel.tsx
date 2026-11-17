import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SafeImage } from '../../components/SafeImage'
import type { ProjectCarouselImage } from './carousel-images'

const ImageLightbox = lazy(() =>
  import('../../components/ImageLightbox').then((module) => ({ default: module.ImageLightbox })),
)

type Props = {
  projectTitle: string
  images: readonly ProjectCarouselImage[]
}

/**
 * One reusable view for main and additional portfolio projects.
 * Only the data changes: image paths, file names, captions, and alt text.
 * The main image always keeps a fixed 16:9 aspect ratio; the thumbnail row
 * absorbs any extra height needed to match the hero copy.
 */
export function ProjectCarousel({ projectTitle, images }: Props) {
  const [index, setIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const pointerStart = useRef<number | null>(null)
  const swiped = useRef(false)
  const thumbnailRailRef = useRef<HTMLDivElement>(null)
  const previousIndexRef = useRef<number | null>(null)
  const hasCarousel = images.length > 1
  const current = images[index] ?? images[0]

  useEffect(() => {
    if (!hasCarousel) return
    for (const adjacent of [
      images[(index - 1 + images.length) % images.length],
      images[(index + 1) % images.length],
    ]) {
      const preload = new Image()
      preload.src = adjacent.src
    }
  }, [images, index, hasCarousel])

  // Keep the highlighted miniature centered when changing slides via arrows,
  // dots, thumbnails, swipe or the lightbox. Scroll only the thumbnail rail,
  // never the document (scrollIntoView could move the entire page).
  useLayoutEffect(() => {
    if (!hasCarousel) return
    const rail = thumbnailRailRef.current
    const active = rail?.querySelector<HTMLButtonElement>('button.is-active')
    if (!rail || !active) return

    const centerActive = (behavior: ScrollBehavior) => {
      // Equal edge gutters allow the first and last thumbnails to center too.
      const edgeSpace = Math.max(2, (rail.clientWidth - active.offsetWidth) / 2)
      rail.style.setProperty('--carousel-edge-space', `${edgeSpace}px`)

      const railBounds = rail.getBoundingClientRect()
      const activeBounds = active.getBoundingClientRect()
      const desired = rail.scrollLeft
        + activeBounds.left + activeBounds.width / 2
        - railBounds.left - rail.clientWidth / 2
      const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth)
      rail.scrollTo({ left: Math.max(0, Math.min(maxScroll, desired)), behavior })
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior: ScrollBehavior = previousIndexRef.current === null || reducedMotion
      ? 'auto'
      : 'smooth'
    centerActive(behavior)
    previousIndexRef.current = index
  }, [index, hasCarousel, images])

  useEffect(() => {
    if (!hasCarousel || typeof ResizeObserver === 'undefined') return
    const rail = thumbnailRailRef.current
    if (!rail) return
    let frame = 0
    let previousWidth = rail.clientWidth
    const observer = new ResizeObserver(() => {
      // Re-center after responsive width changes; avoid cancelling a smooth
      // navigation animation on mere thumbnail-size/height changes.
      const width = rail.clientWidth
      if (Math.abs(width - previousWidth) < 1) return
      previousWidth = width
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const active = rail.querySelector<HTMLButtonElement>('button.is-active')
        if (!active) return
        rail.style.setProperty(
          '--carousel-edge-space',
          `${Math.max(2, (width - active.offsetWidth) / 2)}px`,
        )
        const railBounds = rail.getBoundingClientRect()
        const activeBounds = active.getBoundingClientRect()
        const target = rail.scrollLeft + activeBounds.left + activeBounds.width / 2
          - railBounds.left - rail.clientWidth / 2
        rail.scrollTo({
          left: Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, target)),
          behavior: 'auto',
        })
      })
    })
    observer.observe(rail)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [hasCarousel])

  if (!current) return null

  const changeSlide = (nextIndex: number) => {
    setIndex((nextIndex + images.length) % images.length)
  }

  return (
    <div className={`case-hero-media${hasCarousel ? ' has-carousel' : ''}`} data-standard-structure="project-carousel">
      <button
        type="button"
        className="case-story-cover case-cover-zoom"
        onClick={() => {
          if (swiped.current) {
            swiped.current = false
            return
          }
          setLightboxIndex(index)
        }}
        aria-label={`Open ${projectTitle} image ${index + 1}`}
        onPointerDown={(event) => {
          pointerStart.current = event.clientX
          swiped.current = false
        }}
        onPointerUp={(event) => {
          if (pointerStart.current === null) return
          const distance = event.clientX - pointerStart.current
          pointerStart.current = null
          if (hasCarousel && Math.abs(distance) > 48) {
            swiped.current = true
            changeSlide(index + (distance < 0 ? 1 : -1))
          }
        }}
        onPointerCancel={() => { pointerStart.current = null }}
      >
        <SafeImage
          src={current.src}
          previewSrc={current.previewSrc}
          alt={current.alt}
          eager={index === 0}
          sizes="(max-width: 980px) 100vw, 48vw"
        />
        <span className="image-zoom-indicator" aria-hidden="true">
          <Maximize2 size={17} />
        </span>
      </button>

      {(hasCarousel || current.caption) && (
        <p className="case-hero-caption">{current.caption || '\u00a0'}</p>
      )}

      {hasCarousel && (
        <div className="case-hero-carousel-controls" aria-label={`${projectTitle} image carousel`}>
          <button type="button" onClick={() => changeSlide(index - 1)} aria-label="Previous project image">
            <ChevronLeft size={18} />
          </button>
          <div className="case-hero-carousel-dots">
            {images.map((image, imageIndex) => (
              <button
                key={`${image.src}-${imageIndex}`}
                type="button"
                className={imageIndex === index ? 'is-active' : ''}
                onClick={() => changeSlide(imageIndex)}
                aria-label={`Show project image ${imageIndex + 1}`}
                aria-current={imageIndex === index ? 'true' : undefined}
              />
            ))}
          </div>
          <span className="case-hero-carousel-count">{index + 1} / {images.length}</span>
          <button type="button" onClick={() => changeSlide(index + 1)} aria-label="Next project image">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {hasCarousel && (
        <div ref={thumbnailRailRef} className="case-hero-thumbnails" aria-label={`${projectTitle} thumbnails`}>
          {images.map((image, imageIndex) => (
            <button
              key={`${image.src}-${imageIndex}-thumb`}
              type="button"
              className={imageIndex === index ? 'is-active' : ''}
              onClick={() => changeSlide(imageIndex)}
              aria-label={`Show project image ${imageIndex + 1}`}
              aria-current={imageIndex === index ? 'true' : undefined}
            >
              <SafeImage src={image.thumbnailSrc} previewSrc={image.previewSrc} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Suspense fallback={null}>
          <ImageLightbox
            items={images.map((image) => ({
              src: image.fullSrc,
              alt: image.alt,
              downloadName: image.downloadName,
            }))}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onChange={hasCarousel ? (nextIndex) => {
              setIndex(nextIndex)
              setLightboxIndex(nextIndex)
            } : undefined}
            allowDownload
            ariaLabel={`${projectTitle} project images`}
          />
        </Suspense>
      )}
    </div>
  )
}
