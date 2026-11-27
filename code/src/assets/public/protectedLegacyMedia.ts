import type { MediaAsset } from '../../domain/models/MediaAsset'
import { publicAssetCatalog } from './publicAssetCatalog'
import { migratedPublicAsset } from './resolvePublicAsset'

/** Preserve the audited migration and its rollback sources, not just covers. */
export function isProtectedLegacyMedia(asset: Pick<MediaAsset,'path'|'url'>) {
  const path = asset.path.replace(/^\/+/, '')
  return Object.hasOwn(publicAssetCatalog,path) || Boolean(migratedPublicAsset(asset.url)) ||
    /^projects\/[^/]+\/(?:PNG|WebP)\/[^/]+\.(?:png|webp)$/i.test(path) ||
    /^projects\/[^/]+\/[^/]+\.png$/i.test(path) ||
    /^about\/gallery\/(?:PNG\/[^/]+\.png|WebP\/[^/]+\.webp|[^/]+\.(?:jpe?g|png|webp))$/i.test(path)
}
