
import type { MediaAsset, MediaCategory } from '../../domain/models/MediaAsset'
import { supabaseMediaBucket } from './supabaseClient'

export function storagePathFromPublicUrl(url?: string) {
  if (!url) return ''
  const marker = `/storage/v1/object/public/${supabaseMediaBucket}/`
  const index = url.indexOf(marker)
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : ''
}

export function mediaAssetFromUrl(
  url: string | null | undefined,
  category: MediaCategory,
  name = 'media',
): MediaAsset | undefined {
  if (!url) return undefined
  const path = storagePathFromPublicUrl(url) || url
  const isAnimeFinderBrand = /(?:^|\/)animefinder\/animefinder-brand\.svg$/i.test(path)
  // For migrated project covers, keep the PNG URL as the canonical editorial
  // value (including admin saves) while serving WebP in cards and carousels.
  // Old PNG URLs continue to work unchanged throughout the migration.
  const isMigratedCover =
    /^projects\/[^/]+\/PNG\/[^/]+\.png$/i.test(path)
  const optimizedUrl = isMigratedCover
    ? url.replace('/PNG/', '/WebP/').replace(/\.png(?:$|(?=[?#]))/i, '.webp')
    : undefined

  return {
    id: `remote-${name}`,
    url,
    path,
    name,
    mimeType: name.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : /\.svg(?:$|[?#])/i.test(path) ? 'image/svg+xml' : 'image/*',
    category,
    imageType: isAnimeFinderBrand ? 'illustrative-placeholder' : 'real-screenshot',
    ...(optimizedUrl
      ? { cardUrl: optimizedUrl, thumbnailUrl: optimizedUrl, fullUrl: url }
      : {}),
  }
}

export function cleanUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(cleanUndefined) as T
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, cleanUndefined(item)]),
    ) as T
  }
  return value
}
