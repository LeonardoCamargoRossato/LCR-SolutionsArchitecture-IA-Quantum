import { publicAssetCatalog } from './publicAssetCatalog'

type AssetRole = 'display' | 'full' | 'original'
const origin = 'https://wdjffhfnzydudmhhekmk.supabase.co'
const marker = '/storage/v1/object/public/portfolio-media/'
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
function local(path: string) { return base + path.split('/').map(encodeURIComponent).join('/') }

/** Resolve only the audited project, bucket and exact decoded object key.
 * Editorial fields remain unchanged; new/unmapped uploads and other origins
 * keep their existing contracts. Query tokens are not forwarded to local files.
 */
export function migratedPublicAsset(source?: string) {
  if (!source) return undefined
  try {
    const url = new URL(source)
    if (url.origin !== origin || url.username || url.password || !url.pathname.startsWith(marker)) return undefined
    const path = decodeURIComponent(url.pathname.slice(marker.length))
    if (!Object.hasOwn(publicAssetCatalog, path)) return undefined
    const entry = publicAssetCatalog[path]
    return { display: local(entry.display), full: local(entry.full), original: local(entry.original) }
  } catch { return undefined }
}
export function resolvePublicAsset(source: string, role?: AssetRole): string
export function resolvePublicAsset(source: string | undefined, role?: AssetRole): string | undefined
export function resolvePublicAsset(source: string | undefined, role: AssetRole = 'display') {
  return migratedPublicAsset(source)?.[role] ?? source
}

/** Asset changes must not fall back to Storage after a local request fails. */
export function resolveAssetFallback(source?: string, fallback?: string, role: AssetRole = 'display') {
  if (migratedPublicAsset(source)) return undefined
  return resolvePublicAsset(fallback, role)
}
