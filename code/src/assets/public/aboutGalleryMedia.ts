import { resolveAboutGalleryMedia as resolveDynamicGalleryMedia } from '../../infrastructure/supabase/aboutGalleryMedia'
import { migratedPublicAsset } from './resolvePublicAsset'

/** Public read adapter; retain the legacy dynamic upload convention separately. */
export function resolveAboutGalleryMedia(imageUrl: string, storagePath?: string) {
  const migrated = migratedPublicAsset(imageUrl)
  if (migrated) return {
    original: migrated.original, card: migrated.display, full: migrated.full,
    hasVariants: migrated.display !== migrated.full,
  }
  return resolveDynamicGalleryMedia(imageUrl, storagePath)
}
