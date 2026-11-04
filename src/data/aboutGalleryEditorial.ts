import type { AboutGalleryItem } from '../domain/models/AboutGallery'

const titles: Record<number, string> = {
  1: 'Natal - RN | Congresso Internacional de Matéria Condensada 2023',
  2: 'Curitiba - Paraná | Congresso de Econofísica e Sistemas Complexos 2023',
  3: 'São Paulo - SP | MVComp 2025',
  4: 'Porto Alegre - RS | Inauguração da LACEQUI na PUC - TecnoPUC 2025',
  5: 'Porto Alegre - RS | Primeira Semana de Computação Quântica da UFRGS 2025',
  6: 'Foz do Iguaçu - PR | Latinoware 2025',
  8: 'São Paulo - SP | ALESP (Assembleia Legislativa do Estado de São Paulo)',
  9: 'Porto Alegre - RS | Tech Now 2025',
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
    .filter(({ number }) => number !== 7 && number !== 10)
    .map(({ item, number }) => {
      if (!number || !titles[number]) return { ...item, editorialOrder: 1000 + item.sortOrder }
      return {
        ...item,
        titlePt: titles[number],
        titleEn: titles[number],
        captionPt: undefined,
        captionEn: undefined,
        locationPt: undefined,
        locationEn: undefined,
        editorialOrder: number === 9 ? 0 : number === 11 ? 1 : number === 8 ? 2 : number === 12 ? 3 : number + 4,
      }
    })
    .sort((a, b) => a.editorialOrder - b.editorialOrder)
    .map(({ editorialOrder: _, ...item }) => item)
}
