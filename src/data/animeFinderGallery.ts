import type { Project, ProjectGalleryItem } from '../domain/models/Project'

/**
 * Screenshot catalog: exact filenames map to the preserved original PNG and
 * derived WebP variants in public/assets/projects/animefinder.
 * The originals are unaltered 1280x1024 screenshots supplied by the owner.
 * Rendering only activates when the complete asset manifest has been deployed.
 */
export const animeFinderScreenshots = [
  { id: '01-landing-page', pt: 'Página pública do AnimeFinder', en: 'AnimeFinder public landing page' },
  { id: '02-login-google', pt: 'Acesso privado com Google', en: 'Private access with Google' },
  { id: '03-discovery-catalog', pt: 'Catálogo completo e filtros', en: 'Full discovery catalog and filters' },
  { id: '04-discovery-naruto', pt: 'Busca do catálogo por Naruto', en: 'Anime catalog search for Naruto' },
  { id: '05-anime-details', pt: 'Detalhes técnicos de uma obra', en: 'Anime technical details' },
  { id: '06-related-works', pt: 'Mapa de obras relacionadas', en: 'Related works franchise map' },
  { id: '07-hamlet-discovery', pt: 'Chat Hamlet AI para descoberta', en: 'Hamlet AI discovery conversation' },
  { id: '08-hamlet-recommendations', pt: 'Painel de recomendações com IA', en: 'AI recommendation results panel' },
  { id: '09-self-knowledge-home', pt: 'Motor de autoconhecimento Hamlet', en: 'Hamlet Self-Knowledge engine' },
  { id: '10-self-knowledge-question', pt: 'Consulta ao conhecimento pessoal', en: 'Personal knowledge query' },
  { id: '11-self-knowledge-answer', pt: 'Resposta contextual de autoconhecimento', en: 'Contextual Self-Knowledge answer' },
  { id: '12-personal-catalog', pt: 'Catálogo pessoal e classificações', en: 'Personal watched catalog' },
  { id: '13-world-trigger-detail', pt: 'Detalhes de World Trigger', en: 'World Trigger details page' },
  { id: '14-personal-knowledge', pt: 'Comentários e personagens favoritos', en: 'Personal comments and favorite characters' },
  { id: '15-character-profile', pt: 'Perfil detalhado de personagem', en: 'Character profile details' },
  { id: '16-knowledge-editor', pt: 'Editor assistido de conhecimento pessoal', en: 'Guided personal knowledge editor' },
] as const

export const animeFinderAssetRoot = `${import.meta.env.BASE_URL}assets/projects/animefinder`

export function animeFinderAssetPaths(id: string) {
  const stem = `animefinder-${id}`
  return {
    png: `${animeFinderAssetRoot}/PNG/${stem}.png`,
    webp: `${animeFinderAssetRoot}/WebP/${stem}.webp`,
  }
}

/** Non-destructive: never modifies the Supabase object or other projects. */
export function withAnimeFinderScreenshots(project: Project): Project {
  if (project.slug !== 'animefinder') return project
  const first = animeFinderScreenshots[0]
  const coverPaths = animeFinderAssetPaths(first.id)
  const extraImages: ProjectGalleryItem[] = animeFinderScreenshots.slice(1).map((asset, index) => {
    const paths = animeFinderAssetPaths(asset.id)
    return {
      id: asset.id,
      image: {
        id: `animefinder-${asset.id}`,
        url: paths.png,
        path: paths.png,
        cardUrl: paths.webp,
        thumbnailUrl: paths.webp,
        fullUrl: paths.png,
        name: asset.en,
        mimeType: 'image/png',
        category: 'Projects',
        imageType: 'real-screenshot',
      },
      cardUrl: paths.webp,
      thumbnailUrl: paths.webp,
      fullUrl: paths.png,
      altText: `AnimeFinder — ${asset.en}`,
      altTextPt: `AnimeFinder — ${asset.pt}`,
      caption: asset.en,
      captionPt: asset.pt,
      order: index + 2,
      sortOrder: index + 2,
      visible: true,
      imageClassification: 'real-screenshot',
    }
  })
  return {
    ...project,
    coverImage: {
      id: 'animefinder-real-cover',
      url: coverPaths.png,
      path: coverPaths.png,
      cardUrl: coverPaths.webp,
      thumbnailUrl: coverPaths.webp,
      fullUrl: coverPaths.png,
      name: first.en,
      altText: `AnimeFinder — ${first.en}`,
      mimeType: 'image/png',
      category: 'Projects',
      imageType: 'real-screenshot',
    },
    imageType: 'real-screenshot',
    gallery: [
      ...extraImages,
      ...project.gallery.filter((item) => !extraImages.some((asset) => asset.id === item.id)),
    ],
  }
}
