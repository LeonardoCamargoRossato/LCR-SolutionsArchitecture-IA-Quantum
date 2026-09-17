import { ExternalLink } from 'lucide-react'
import { useMemo } from 'react'
import type { AboutGalleryItem } from '../domain/models/AboutGallery'
import type { Locale } from '../i18n/types'
import { ImageLightbox } from './ImageLightbox'

const SPEAKER_PORTFOLIO = 'https://leonardo-camargo-rossato.lovable.app/'
const INSTITUTO_PENSE_MAIS = 'https://institutopensemais.com/'

function localized(item: AboutGalleryItem, locale: Locale) {
  const pt = locale === 'pt-BR'
  return {
    title: pt ? item.titlePt ?? item.titleEn ?? '' : item.titleEn ?? item.titlePt ?? '',
    description: pt ? item.descriptionPt ?? item.descriptionEn ?? '' : item.descriptionEn ?? item.descriptionPt ?? '',
    caption: pt ? item.captionPt ?? item.captionEn ?? '' : item.captionEn ?? item.captionPt ?? '',
    location: pt ? item.locationPt ?? item.locationEn ?? '' : item.locationEn ?? item.locationPt ?? '',
  }
}

function relatedLink(item: AboutGalleryItem, locale: Locale) {
  switch (item.linkType) {
    case 'speaker_portfolio':
      return {
        href: SPEAKER_PORTFOLIO,
        label: locale === 'pt-BR' ? 'Portfólio de Palestras' : 'Speaker Portfolio',
      }
    case 'instituto_pense_mais':
      return { href: INSTITUTO_PENSE_MAIS, label: 'Instituto Pense+' }
    case 'custom':
      return item.externalUrl
        ? { href: item.externalUrl, label: locale === 'pt-BR' ? 'Abrir link relacionado' : 'Open related link' }
        : undefined
    default:
      return undefined
  }
}

type Props = {
  items: AboutGalleryItem[]
  index: number | null
  locale: Locale
  onClose: () => void
  onChange: (index: number) => void
  allowDownload?: boolean
}

export function AboutGalleryLightbox({
  items,
  index,
  locale,
  onClose,
  onChange,
  allowDownload = false,
}: Props) {
  const current = index !== null ? items[index] : undefined
  const copy = useMemo(() => current ? localized(current, locale) : undefined, [current, locale])
  const link = useMemo(() => current ? relatedLink(current, locale) : undefined, [current, locale])

  if (!current || !copy) return null

  const date = current.eventDate
    ? new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }).format(new Date(`${current.eventDate}T12:00:00`))
    : ''

  const viewerItems = items.map((item) => {
    const localizedItem = localized(item, locale)
    return {
      src: item.imageUrl,
      alt: [localizedItem.title, localizedItem.caption, localizedItem.location].filter(Boolean).join(' — ') || 'About gallery image',
      downloadName: localizedItem.title || 'about-gallery-image',
    }
  })

  return (
    <ImageLightbox
      items={viewerItems}
      index={index}
      onClose={onClose}
      onChange={onChange}
      allowDownload={allowDownload}
      ariaLabel={copy.title || 'About gallery'}
      details={
        <div className="about-lightbox-copy">
          {copy.title && <h3>{copy.title}</h3>}
          <div className="about-lightbox-meta">
            {copy.location && <span>{copy.location}</span>}
            {date && <span>{date}</span>}
          </div>
          {copy.description && <p>{copy.description}</p>}
          {copy.caption && <small>{copy.caption}</small>}
          {link && (
            <a
              className="button button-secondary about-lightbox-link"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label} <ExternalLink size={15} />
            </a>
          )}
        </div>
      }
    />
  )
}
