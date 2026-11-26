import type { AboutContent } from '../../domain/models/About'
import type { MediaAsset } from '../../domain/models/MediaAsset'
import { publicAssetCatalog } from './publicAssetCatalog'

// Approved, versioned portrait. The inventory key is provenance only, never
// a runtime Storage lookup. Update the catalog and this key together via Git.
const entry = publicAssetCatalog['profile/1792380122932-87ee4d65-cc32-4005-85d5-24fb6ed67957-fotoperfilLCR.jpeg']
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
export const officialProfileUrl = base + entry.display
export const officialProfileImage: Readonly<MediaAsset> = Object.freeze({
  id: 'official-profile-photo',
  url: officialProfileUrl,
  path: entry.display,
  name: 'Official profile photograph',
  mimeType: 'image/webp',
  category: 'About',
  altText: 'Leonardo Rossato',
  imageType: 'real-screenshot',
})

/** Replace stale CMS/cache values without changing any other editorial field. */
export function withOfficialProfile(about: AboutContent): AboutContent {
  return { ...about, profileImage: officialProfileImage }
}
