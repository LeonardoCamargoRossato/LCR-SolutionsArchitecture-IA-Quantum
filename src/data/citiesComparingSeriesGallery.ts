import type { ProjectGalleryItem } from '../domain/models/Project'

// Reviewed screenshots from the user's original Research Platform Series Compare set.
// The repository publishes derived formats together; no Supabase asset duplication.
// Imported once here so CaseHero, thumbnails and lightbox share canonical paths.
const directory = `${import.meta.env.BASE_URL}projects/cities-comparing/series-compare`

const captions = [
  [
    "Original Streamlit Alpha",
    "Visualização da proposta inicial de comparação de cidades e países",
    "Original Streamlit Alpha — introduction to comparing cities"
  ],
  [
    "Escalas da comparação",
    "Painel de comparação entre cidades, países e macrorregiões",
    "Comparison scales — cities, countries and macroregions"
  ],
  [
    "Comparação entre duas cidades",
    "Painel para análise lado a lado de indicadores urbanos",
    "Two-city side-by-side comparison"
  ],
  [
    "Gráfico de dispersão",
    "Visualização interativa de indicadores com gráficos de dispersão",
    "Interactive Normal Scatter dashboard"
  ],
  [
    "Binscatter",
    "Comparação de distribuições e tendências usando bins",
    "Binscatter visualization and trends"
  ],
  [
    "ScatterGraph e B-GCA",
    "Representação de dados como grafos de proximidade",
    "ScatterGraph B-GCA network visualization"
  ],
  [
    "Notebooks e resultados",
    "Código científico e análise estatística da pesquisa",
    "Scientific notebooks and analysis results"
  ]
] as const

export const citiesComparingSeriesGallery: ProjectGalleryItem[] = captions.map(([titlePt, altPt, altEn], index) => {
  const number = String(index + 1).padStart(2, '0')
  const basename = `Research_Platform_Series_Compare_${number}`
  const cardUrl = `${directory}/WebP/${basename}.webp`
  const fullUrl = `${directory}/PNG/${basename}.png`
  const id = `cities-comparing-series-compare-${number}`

  return {
    id,
    image: {
      id,
      url: cardUrl,
      path: cardUrl,
      name: basename,
      mimeType: 'image/webp',
      category: 'Projects',
      altText: altEn,
      imageType: 'real-screenshot',
      cardUrl,
      thumbnailUrl: cardUrl,
      fullUrl,
    },
    caption: `Research Platform Series Compare — ${number}`,
    captionPt: `Research Platform Series Compare — ${number} · ${titlePt}`,
    altText: altEn,
    altTextPt: altPt,
    cardUrl,
    thumbnailUrl: cardUrl,
    fullUrl,
    order: index + 2, // existing graphical abstract is gallery item 1
    sortOrder: index + 2,
    visible: true,
    imageClassification: 'real-screenshot',
  }
})
