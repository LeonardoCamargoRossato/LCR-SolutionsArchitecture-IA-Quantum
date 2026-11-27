import type { LocalAboutGalleryItem } from '../../data/aboutGallery'

/** Explicit local variants, never Storage inference or remote fallback. */
export function resolveAboutGalleryMedia(item: LocalAboutGalleryItem) {
  return { ...item.media, hasVariants: true as const }
}
