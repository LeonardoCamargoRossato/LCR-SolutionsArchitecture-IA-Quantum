import { resolvePublicAsset } from '../../assets/public/resolvePublicAsset'
import type { Project } from '../../domain/models/Project'

/** Paths and captions are supplied by each project; no project-specific UI branches. */
export type ProjectCarouselImage = {
  src: string
  fullSrc: string
  previewSrc?: string
  thumbnailSrc: string
  alt: string
  caption?: string
  downloadName: string
}

/**
 * Adapter from the existing editorial/Supabase project catalogue to the
 * reusable carousel contract. Preserve all image paths, variants and ordering.
 * Card/WebP first; original/PNG on zoom where the catalogue provides them.
 */
export function buildProjectCarouselImages(project: Project): ProjectCarouselImage[] {
  const cover = project.coverImage?.cardUrl || project.coverImage?.url || './projects/foton-hub.svg'
  const coverImage: ProjectCarouselImage = {
    src: cover,
    fullSrc: project.coverImage?.fullUrl || project.coverImage?.url || cover,
    previewSrc: project.coverImage?.previewUrl,
    thumbnailSrc: project.coverImage?.thumbnailUrl || cover,
    alt: project.coverImage?.altText || `${project.title} project cover`,
    caption: project.title,
    downloadName: `${project.slug}-cover.png`,
  }

  const gallery = (project.gallery ?? [])
    .filter((item) => item.visible !== false && item.image?.url)
    .sort((a, b) => (a.sortOrder ?? a.order) - (b.sortOrder ?? b.order))
    .map((item): ProjectCarouselImage => ({
      src: item.cardUrl || item.image!.url,
      fullSrc: item.fullUrl || item.image!.url,
      previewSrc: item.previewUrl,
      thumbnailSrc: item.thumbnailUrl || item.cardUrl || item.image!.url,
      alt: item.altText || item.image!.altText || item.caption || `${project.title} project image`,
      caption: item.caption,
      downloadName: item.downloadName ?? `${project.slug}-${item.id}${(item.fullUrl ?? '').toLowerCase().endsWith('.png') ? '.png' : ''}`,
    }))

  const normalizePath = (path: string) => path.replace(/^\.\//, '/')
  return [
    coverImage,
    ...gallery.filter((image) => normalizePath(image.fullSrc) !== normalizePath(cover)),
  ].map(image => ({ ...image, src: resolvePublicAsset(image.src),
    thumbnailSrc: resolvePublicAsset(image.thumbnailSrc), previewSrc: resolvePublicAsset(image.previewSrc),
    fullSrc: resolvePublicAsset(image.fullSrc, 'full') }))
}
