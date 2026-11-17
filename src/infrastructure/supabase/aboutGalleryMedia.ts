/**
 * Single source of truth for LCR About Gallery media variants.
 *
 * Storage convention (public bucket "portfolio-media"):
 * about/gallery/<asset>.jpg          immutable photographic source
 * about/gallery/PNG/<asset>.png      full-resolution zoom/download
 * about/gallery/WebP/<asset>.webp    initial carousel/card rendering
 *
 * Supabase remains the editorial source: image_url and storage_path are never
 * replaced by an inferred variant, and arbitrary external URLs are untouched.
 */
const GALLERY_PREFIX = 'about/gallery/'
const PUBLIC_MARKER = '/storage/v1/object/public/portfolio-media/'
const FILE_PATTERN = /^(?<stem>[^/]+)\.(?:jpe?g|png|webp)$/i

export type GalleryMediaUrls = {
  original: string
  card: string
  full: string
  hasVariants: boolean
}

export function resolveAboutGalleryMedia(imageUrl: string, storagePath?: string): GalleryMediaUrls {
  const unchanged: GalleryMediaUrls = {
    original: imageUrl, card: imageUrl, full: imageUrl, hasVariants: false,
  }
  if (!imageUrl) return unchanged

  let parsed: URL
  try {
    parsed = new URL(imageUrl)
  } catch {
    return unchanged
  }
  // No guessing for data from other providers or unrelated Storage paths.
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(parsed.origin)) return unchanged

  const markerPos = parsed.pathname.indexOf(PUBLIC_MARKER)
  if (markerPos === -1) return unchanged
  let path: string
  try {
    path = decodeURIComponent(parsed.pathname.slice(markerPos + PUBLIC_MARKER.length))
  } catch {
    return unchanged
  }

  if (!path.startsWith(GALLERY_PREFIX)) return unchanged
  // Source may be JPG, PNG or WebP, but must be at the root of the gallery.
  const name = path.slice(GALLERY_PREFIX.length)
  const match = name.match(FILE_PATTERN)
  if (!match?.groups?.stem) return unchanged
  if (storagePath && storagePath !== path) return unchanged

  const stem = match.groups.stem
  const base = parsed.href.slice(0, parsed.href.indexOf(PUBLIC_MARKER) + PUBLIC_MARKER.length)
  const suffix = parsed.search + parsed.hash
  return {
    original: imageUrl,
    card: base + GALLERY_PREFIX + 'WebP/' + encodeURIComponent(stem) + '.webp' + suffix,
    full: base + GALLERY_PREFIX + 'PNG/' + encodeURIComponent(stem) + '.png' + suffix,
    hasVariants: true,
  }
}
