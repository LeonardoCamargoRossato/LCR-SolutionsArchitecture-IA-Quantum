import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import {
  useMemo,
  useRef,
  useState,
} from 'react'
import type { AboutGalleryItem } from '../domain/models/AboutGallery'
import { useI18n } from '../i18n/I18nProvider'
import { AboutGalleryLightbox } from './AboutGalleryLightbox'
import { SafeImage } from './SafeImage'
import { getLocalAboutGallery } from '../data/aboutGallery'
import { resolveAboutGalleryMedia } from '../assets/public/aboutGalleryMedia'

function localized(item: AboutGalleryItem, locale: 'en-US' | 'pt-BR') {
  const pt = locale === 'pt-BR'
  return {
    title: pt
      ? item.titlePt ?? item.titleEn ?? ''
      : item.titleEn ?? item.titlePt ?? '',
    caption: pt
      ? item.captionPt ?? item.captionEn ?? ''
      : item.captionEn ?? item.captionPt ?? '',
    location: pt
      ? item.locationPt ?? item.locationEn ?? ''
      : item.locationEn ?? item.locationPt ?? '',
  }
}

export function AboutGallery() {
  const { locale } = useI18n()
  const items = useMemo(() => getLocalAboutGallery(), [])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [galleryExpanded, setGalleryExpanded] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)

  const copy = useMemo(
    () =>
      locale === 'pt-BR'
        ? {
            title: 'Experiências & Apresentações',
            description: 'Palestras, cursos, eventos e apresentações técnicas.',
            showGallery: 'Mostrar todas as imagens',
            hideGallery: 'Ocultar todas as imagens',
          }
        : {
            title: 'Experiences & Presentations',
            description: 'Talks, courses, events and technical presentations.',
            showGallery: 'Show all gallery images',
            hideGallery: 'Hide all gallery images',
          },
    [locale],
  )

  if (!items.length) return null

  const scroll = (direction: -1 | 1) => {
    const nextIndex = Math.max(0, Math.min(items.length - 1, activeIndex + direction))
    const rail = railRef.current
    const target = rail?.children.item(nextIndex)
    if (rail && target instanceof HTMLElement) {
      const viewport = rail.getBoundingClientRect()
      const item = target.getBoundingClientRect()
      const nextLeft = rail.scrollLeft + item.left - viewport.left - (viewport.width - item.width) / 2
      rail.scrollTo({
        left: Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, nextLeft)),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
    }
    setActiveIndex(nextIndex)
  }

  const syncVisibleIndex = () => {
    const rail = railRef.current
    if (!rail || !items.length) return
    const bounds = rail.getBoundingClientRect()
    const left = bounds.left + 8
    let firstVisibleIndex = 0
    for (let index = 0; index < rail.children.length; index += 1) {
      const child = rail.children.item(index)
      if (child instanceof HTMLElement && child.getBoundingClientRect().right > left) {
        firstVisibleIndex = index
        break
      }
    }
    setActiveIndex(firstVisibleIndex)
  }

  return (
    <div className="about-gallery-section" data-reveal="fade">
      <div className="about-gallery-heading">
        <div>
          <div className="eyebrow">06.1 / Gallery</div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
        <div className="about-gallery-controls">
          <span className="about-gallery-counter" aria-live="polite" aria-label={locale === 'pt-BR' ? 'Imagem atual e total' : 'Current image and total'}>{activeIndex + 1} / {items.length}</span>
          <button
            type="button"
            onClick={() => setGalleryExpanded((open) => !open)}
            aria-label={galleryExpanded ? copy.hideGallery : copy.showGallery}
            aria-expanded={galleryExpanded}
            aria-controls="about-gallery-all-images"
            title={galleryExpanded ? copy.hideGallery : copy.showGallery}
            className={galleryExpanded ? 'is-active' : undefined}
          >
            <LayoutGrid size={19} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scroll(-1)} aria-label={locale === 'pt-BR' ? 'Imagens anteriores' : 'Previous images'}>
            <ChevronLeft size={19} />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label={locale === 'pt-BR' ? 'Próximas imagens' : 'Next images'}>
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      <div ref={railRef} className="about-gallery-rail" onScroll={syncVisibleIndex}>
        {items.map((item, index) => {
          const localizedItem = localized(item, locale)
          const media = resolveAboutGalleryMedia(item)
          const alt = [
            localizedItem.title,
            localizedItem.caption,
            localizedItem.location,
          ].filter(Boolean).join(' — ') || 'About gallery image'
          return (
            <button
              key={item.id}
              type="button"
              className="about-gallery-card"
              data-photo-number={item.photoNumber}
              onClick={() => { setActiveIndex(index); setLightboxIndex(index) }}
              aria-label={localizedItem.title || alt}
            >
              <SafeImage
                src={media.card}
                alt={alt}
                loading="lazy"
                sizes="(max-width: 680px) 86vw, 380px"
              />
              <span className="about-gallery-card-copy">
                {localizedItem.title && <strong>{localizedItem.title}</strong>}
                {(localizedItem.location || localizedItem.caption) && (
                  <small>{localizedItem.location || localizedItem.caption}</small>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {galleryExpanded && (
        <div className="about-gallery-grid-panel" id="about-gallery-all-images" aria-label={copy.showGallery}>
          {items.map((item, index) => {
            const entry = localized(item, locale)
            const media = resolveAboutGalleryMedia(item)
            return (
              <button
                type="button"
                className="about-gallery-grid-item"
                data-photo-number={item.photoNumber}
                key={item.id}
                aria-label={entry.title || `${index + 1} / ${items.length}`}
                onClick={() => { setActiveIndex(index); setLightboxIndex(index) }}
              >
                <SafeImage
                  src={media.card}
                  loading="lazy"
                  sizes="(max-width: 560px) 44vw, (max-width: 900px) 31vw, 220px"
                  alt={entry.title || `Gallery image ${index + 1}`}
                />
                <span className="about-gallery-grid-item-number">{index + 1} / {items.length}</span>
              </button>
            )
          })}
        </div>
      )}

      <AboutGalleryLightbox
        allowDownload
        items={items}
        index={lightboxIndex}
        locale={locale}
        onClose={() => setLightboxIndex(null)}
        onChange={setLightboxIndex}
      />
    </div>
  )
}
