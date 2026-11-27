import type { Project, ProjectGalleryItem } from '../domain/models/Project'
import { getSelectedWork } from './selectedWork'
import { citiesComparingSeriesGallery } from './citiesComparingSeriesGallery'

/** The two case galleries are a curated, versioned presentation contract.
 * Main's public CMS rows (read-only export 2026-11-26) contain no extra
 * gallery entries for either project. Foton's approved cover is the sole
 * verified public image. Do not publish private platform screenshots.
 * AnimeFinder and all other projects are intentionally outside this adapter. */
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
const abstractRoot = base + 'projects/cities-comparing/graphical-abstract'
const abstract: ProjectGalleryItem = {
  id: 'cities-comparing-graphical-abstract',
  image: {
    id: 'cities-comparing-graphical-abstract',
    url: abstractRoot + '-card.webp',
    path: abstractRoot + '-card.webp',
    name: 'Cities Comparing graphical abstract',
    mimeType: 'image/webp',
    category: 'Projects',
    altText: 'Graphical abstract for the Cities Comparing research platform',
    imageType: 'real-screenshot',
    previewUrl: abstractRoot + '-preview.webp',
    thumbnailUrl: abstractRoot + '-thumb.webp',
    cardUrl: abstractRoot + '-card.webp',
    fullUrl: abstractRoot + '-full.webp',
  },
  downloadName: 'cities-comparing-graphical-abstract.webp',
  caption: 'Graphical abstract',
  altText: 'Graphical abstract for the Cities Comparing research platform',
  cardUrl: abstractRoot + '-card.webp',
  thumbnailUrl: abstractRoot + '-thumb.webp',
  fullUrl: abstractRoot + '-full.webp',
  order: 1, sortOrder: 1, visible: true,
}

export const citiesComparingCaseGallery: readonly ProjectGalleryItem[] = [
  abstract, ...citiesComparingSeriesGallery,
]
export const fotonHubCaseGallery: readonly ProjectGalleryItem[] = []

/** Cover is a separate slide in ProjectCarousel; never duplicate it in gallery.
 * The catalogue wins over every CMS/cache response for image presentation,
 * while the other case fields continue to follow their established contract.
 */
export function withLocalSelectedCaseGallery(project: Project): Project {
  const slug = project.slug === 'city-comparing' ? 'cities-comparing' : project.slug
  if (slug !== 'cities-comparing' && slug !== 'foton-hub') return project
  const card = getSelectedWork().find(item => item.slug === slug)
  if (!card?.coverImage) throw new Error('Missing approved selected case cover: ' + slug)
  return {
    ...project, slug, coverImage: card.coverImage, imageType: card.imageType,
    gallery: [...(slug === 'cities-comparing' ? citiesComparingCaseGallery : fotonHubCaseGallery)],
  }
}
