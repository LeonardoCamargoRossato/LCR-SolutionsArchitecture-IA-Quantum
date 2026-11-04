import type { AboutGalleryItem } from '../domain/models/AboutGallery'

const locations: Record<number, string> = {
  1: 'Natal - RN',
  2: 'Curitiba - Paraná',
  3: 'São Paulo - SP',
  4: 'Porto Alegre - Rio Grande do Sul',
  5: 'Porto Alegre - Rio Grande do Sul',
  6: 'Foz do Iguaçu - PR',
  8: 'São Paulo - SP | ALESP (Assembleia Legislativa do Estado de São Paulo)',
  9: 'Porto Alegre - Rio Grande do Sul',
  10: 'Porto Alegre - RS',
  11: 'Porto Alegre - RS | South Summit 2026',
  12: 'São Paulo - SP | AUTOCOM Summit 2026',
}

function speakingPhotoNumber(item: AboutGalleryItem) {
  const searchable = [
    item.titlePt,
    item.titleEn,
    item.captionPt,
    item.captionEn,
    item.descriptionPt,
    item.descriptionEn,
    item.storagePath,
    item.imageUrl,
  ].filter(Boolean).join(' ')

  let decoded = searchable
  try { decoded = decodeURIComponent(searchable) } catch { /* Keep the original value. */ }
  const match = decoded.match(/palestrando[\s_-]*(\d{1,2})/i)
  return match ? Number(match[1]) : undefined
}

/** Editorial hotfix for the public speaking carousel. */
export function normalizeAboutGallery(items: AboutGalleryItem[]) {
  return items
    .map((item) => ({ item, number: speakingPhotoNumber(item) }))
    .filter(({ number }) => number !== 7)
    .map(({ item, number }) => {
      if (!number || !locations[number]) return { ...item, editorialOrder: 1000 + item.sortOrder }
      return {
        ...item,
        locationPt: locations[number],
        locationEn: locations[number],
        editorialOrder: number === 11 ? 0 : number === 12 ? 1 : number + 2,
      }
    })
    .sort((a, b) => a.editorialOrder - b.editorialOrder)
    .map(({ editorialOrder: _, ...item }) => item)
}
