import geometry from './portal-door-geometry.json'

export type PortalVariant = keyof typeof geometry.variants
export const PORTAL_GEOMETRY = geometry.variants
export const PORTAL_VARIANTS = Object.keys(PORTAL_GEOMETRY) as PortalVariant[]
export const PORTAL_ASSET_BASE = import.meta.env.BASE_URL + 'assets/home/loading-portal/'

/** Minimize the proportion of the source cropped by a uniform cover transform. */
export function selectPortalVariant(width: number, height: number): PortalVariant {
  if (!(width > 0 && height > 0)) return '16x9'
  const ratio = width / height
  return PORTAL_VARIANTS.reduce((best, key) => {
    const distance = (id: PortalVariant) => Math.abs(Math.log(ratio / (PORTAL_GEOMETRY[id].width / PORTAL_GEOMETRY[id].height)))
    return distance(key) < distance(best) ? key : best
  }, '16x9' as PortalVariant)
}

export function portalAssetUrls(variant: PortalVariant) {
  const g = PORTAL_GEOMETRY[variant]
  return [g.reference, g.left.path, g.right.path, g.core.path].map(path => PORTAL_ASSET_BASE + path)
}
