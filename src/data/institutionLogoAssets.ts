/** Central catalog for the five unique institutional marks currently in portfolio-media.
 * Existing editorial PNG URLs remain in Supabase, so rollback and uploads are safe.
 * SVGs are real, locally hosted vectors; no embedded PNGs or arbitrary remote SVGs.
 */
type LogoLayout = 'extra-wide' | 'wide' | 'compact'
type LogoRecord = { svg: string; layout: LogoLayout }

const catalog: ReadonlyArray<{ suffix: string; asset: LogoRecord }> = [
  { suffix: 'LogoInstitutoPense-1000-X-200-Px-1.png', asset: { svg: 'instituto-pense-mais.svg', layout: 'extra-wide' } },
  { suffix: 'IF-UFRGS_-logo.png', asset: { svg: 'instituto-fisica-ufrgs.svg', layout: 'wide' } },
  { suffix: 'Logo_UFRGS.png', asset: { svg: 'ufrgs.svg', layout: 'compact' } },
  { suffix: 'ITA_logo.png', asset: { svg: 'ita.svg', layout: 'wide' } },
  { suffix: 'Logo-Foton-Azul.png', asset: { svg: 'instituto-foton.svg', layout: 'wide' } },
]

export type ResolvedInstitutionLogo = {
  src: string
  /** Original editor-owned URL, used for fallback and safe reversibility. */
  fallback?: string
  layout: LogoLayout
  vectorized: boolean
}

export function resolveInstitutionLogo(source?: string): ResolvedInstitutionLogo {
  if (!source) return { src: '', layout: 'wide', vectorized: false }

  let pathname: string
  try {
    pathname = decodeURIComponent(new URL(source, 'https://lcr.invalid').pathname)
  } catch {
    return { src: source, layout: 'wide', vectorized: false }
  }

  const fromEditorialStorage = pathname.includes('/storage/v1/object/public/portfolio-media/')
  if (!fromEditorialStorage) return { src: source, layout: 'wide', vectorized: false }

  const logo = catalog.find(({ suffix }) => pathname.toLowerCase().endsWith('/' + suffix.toLowerCase()))
  if (!logo) return { src: source, layout: 'wide', vectorized: false }

  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
  return {
    src: `${base}assets/institutions/svg/${logo.asset.svg}`,
    fallback: source,
    layout: logo.asset.layout,
    vectorized: true,
  }
}

export const institutionLogoCatalog = catalog.map(({ suffix, asset }) => ({
  legacyFilename: suffix,
  svgPath: `public/assets/institutions/svg/${asset.svg}`,
  layout: asset.layout,
}))
