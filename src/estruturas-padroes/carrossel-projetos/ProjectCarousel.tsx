import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
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
        <div className="case-hero-thumbnails" aria-label={`${projectTitle} thumbnails`}>
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
