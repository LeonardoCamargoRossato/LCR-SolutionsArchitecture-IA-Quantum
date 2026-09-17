
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
  return {
    id: `remote-${name}`,
    url,
    path: storagePathFromPublicUrl(url) || url,
    name,
    mimeType: name.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : 'image/*',
    category,
    imageType: 'real-screenshot',
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
