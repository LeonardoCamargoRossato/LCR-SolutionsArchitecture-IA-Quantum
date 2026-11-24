import { PORTAL_ASSET_BASE, PORTAL_GEOMETRY, type PortalVariant } from './portalGeometry'

export function PortalStaticBackground({ variant }: { variant: PortalVariant }) {
  return <img className="pdo-reference portal-v2-background" data-testid="portal-v2-background"
    src={PORTAL_ASSET_BASE + PORTAL_GEOMETRY[variant].reference} alt="" draggable={false}
    decoding="async" />
}
