import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { aboutGalleryService } from '../bootstrap/services'
import type { AboutGalleryItem } from '../domain/models/AboutGallery'
import { useI18n } from '../i18n/I18nProvider'
import { AboutGalleryLightbox } from './AboutGalleryLightbox'

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
  const [items, setItems] = useState<AboutGalleryItem[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    aboutGalleryService
      .getPublicAboutGallery()
      .then((next) => {
        if (!cancelled) setItems(next)
      })
      .catch((error) => {
        console.error('Supabase about gallery query failed.', error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const copy = useMemo(
    () =>
      locale === 'pt-BR'
        ? {
            title: 'Experiências & Apresentações',
            description: 'Palestras, cursos, eventos e apresentações técnicas.',
          }
        : {
            title: 'Experiences & Presentations',
            description: 'Talks, courses, events and technical presentations.',
          },
    [locale],
  )

  if (!items.length) return null

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({
      left: direction * Math.max(280, rail.clientWidth * 0.78),
      behavior: 'smooth',
    })
  }

  return (
    <div className="about-gallery-section">
      <div className="about-gallery-heading">
        <div>
          <div className="eyebrow">05.1 / Gallery</div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
        <div className="about-gallery-controls">
          <button type="button" onClick={() => scroll(-1)} aria-label="Previous images">
            <ChevronLeft size={19} />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Next images">
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      <div ref={railRef} className="about-gallery-rail">
        {items.map((item, index) => {
          const localizedItem = localized(item, locale)
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
              onClick={() => setLightboxIndex(index)}
              aria-label={localizedItem.title || alt}
            >
              <img src={item.imageUrl} alt={alt} loading="lazy" />
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

      <AboutGalleryLightbox
        items={items}
        index={lightboxIndex}
        locale={locale}
        onClose={() => setLightboxIndex(null)}
        onChange={setLightboxIndex}
      />
    </div>
  )
}
