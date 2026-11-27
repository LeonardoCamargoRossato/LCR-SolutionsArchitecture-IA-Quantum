import type { AboutGalleryItem } from '../domain/models/AboutGallery'

/** Exact editorial snapshot, 2026-11-26. IDs and nullable metadata verified
 * through one read-only export; public titles/order from aboutGalleryEditorial
 * and owner-approved sequence. No network lookup, no invented translations.
 * Missing descriptions, captions, locations, dates and URLs remain absent.
 * Hidden entries remain versioned, not included in the public UI. */
type Entry = Omit<AboutGalleryItem, 'imageUrl' | 'storagePath'> & {
  photoNumber: number
  legacySortOrder: number
  media: { card: string; full: string; original: string }
}
export const aboutGalleryCatalog: ReadonlyArray<Entry> = [
  {
    "id": "74b859f4-fed5-4572-8bad-fa36fa15c5ac",
    "photoNumber": 9,
    "titlePt": "Porto Alegre - RS | Tech Now 2025",
    "titleEn": "Porto Alegre - RS | Tech Now 2025",
    "linkType": "none",
    "visible": true,
    "sortOrder": 1,
    "legacySortOrder": 1,
    "media": {
      "card": "assets/about/gallery/WebP/1789571862628-119f0928-a93e-46ed-a09a-901f977f60a8-palestrando-9.webp",
      "full": "assets/about/gallery/PNG/1789571862628-119f0928-a93e-46ed-a09a-901f977f60a8-palestrando-9.png",
      "original": "assets/about/gallery/originals/1789571862628-119f0928-a93e-46ed-a09a-901f977f60a8-palestrando-9.jpg"
    }
  },
  {
    "id": "b4186111-09aa-48b1-b4d9-ad8fcef4eb65",
    "photoNumber": 11,
    "titlePt": "Porto Alegre - RS | South Summit 2026",
    "titleEn": "Porto Alegre - RS | South Summit 2026",
    "linkType": "none",
    "visible": true,
    "sortOrder": 2,
    "legacySortOrder": 11,
    "media": {
      "card": "assets/about/gallery/WebP/1789571889074-8ba328b3-a6f4-4252-a9f9-c6d90be3eb80-palestrando-11.webp",
      "full": "assets/about/gallery/PNG/1789571889074-8ba328b3-a6f4-4252-a9f9-c6d90be3eb80-palestrando-11.png",
      "original": "assets/about/gallery/originals/1789571889074-8ba328b3-a6f4-4252-a9f9-c6d90be3eb80-palestrando-11.jpg"
    }
  },
  {
    "id": "0bdee20b-f1d5-4c58-9e7c-5b3c9d743d06",
    "photoNumber": 8,
    "titlePt": "São Paulo - SP | ALESP - 2025 (Assembleia Legislativa do Estado de São Paulo)",
    "titleEn": "São Paulo - SP | ALESP - 2025 (Assembleia Legislativa do Estado de São Paulo)",
    "linkType": "none",
    "visible": true,
    "sortOrder": 3,
    "legacySortOrder": 9,
    "media": {
      "card": "assets/about/gallery/WebP/1789571852749-67a24381-2bc4-4381-9cf4-08c3f43f4fe1-palestrando-8.webp",
      "full": "assets/about/gallery/PNG/1789571852749-67a24381-2bc4-4381-9cf4-08c3f43f4fe1-palestrando-8.png",
      "original": "assets/about/gallery/originals/1789571852749-67a24381-2bc4-4381-9cf4-08c3f43f4fe1-palestrando-8.jpg"
    }
  },
  {
    "id": "37b7b020-dbc1-4c04-bd7b-c014a7afe863",
    "photoNumber": 12,
    "titlePt": "São Paulo - SP | AUTOCOM Summit 2026",
    "titleEn": "São Paulo - SP | AUTOCOM Summit 2026",
    "linkType": "none",
    "visible": true,
    "sortOrder": 4,
    "legacySortOrder": 12,
    "media": {
      "card": "assets/about/gallery/WebP/1789572227151-8edb333c-c1f5-4b06-9d90-acf0b2bfbb2b-palestrando-12.webp",
      "full": "assets/about/gallery/PNG/1789572227151-8edb333c-c1f5-4b06-9d90-acf0b2bfbb2b-palestrando-12.png",
      "original": "assets/about/gallery/originals/1789572227151-8edb333c-c1f5-4b06-9d90-acf0b2bfbb2b-palestrando-12.jpg"
    }
  },
  {
    "id": "150121e0-7ab6-4f9f-b56a-779f6a45b956",
    "photoNumber": 1,
    "titlePt": "Natal - RN | Congresso Internacional de Matéria Condensada 2023",
    "titleEn": "Natal - RN | Congresso Internacional de Matéria Condensada 2023",
    "linkType": "none",
    "visible": true,
    "sortOrder": 5,
    "legacySortOrder": 2,
    "media": {
      "card": "assets/about/gallery/WebP/1789571785798-b6287f6d-cc44-4bd3-8783-ca2fbdf2930b-palestrando-1.webp",
      "full": "assets/about/gallery/PNG/1789571785798-b6287f6d-cc44-4bd3-8783-ca2fbdf2930b-palestrando-1.png",
      "original": "assets/about/gallery/originals/1789571785798-b6287f6d-cc44-4bd3-8783-ca2fbdf2930b-palestrando-1.jpg"
    }
  },
  {
    "id": "f99f6d5e-a03b-4375-bdf1-4082680555cf",
    "photoNumber": 2,
    "titlePt": "Curitiba - Paraná | Congresso de Econofísica e Sistemas Complexos 2023",
    "titleEn": "Curitiba - Paraná | Congresso de Econofísica e Sistemas Complexos 2023",
    "linkType": "none",
    "visible": true,
    "sortOrder": 6,
    "legacySortOrder": 3,
    "media": {
      "card": "assets/about/gallery/WebP/1789571793547-0cefe15d-dff1-4d14-83da-d2cee9bc3f96-palestrando-2.webp",
      "full": "assets/about/gallery/PNG/1789571793547-0cefe15d-dff1-4d14-83da-d2cee9bc3f96-palestrando-2.png",
      "original": "assets/about/gallery/originals/1789571793547-0cefe15d-dff1-4d14-83da-d2cee9bc3f96-palestrando-2.jpg"
    }
  },
  {
    "id": "0a16c827-14e3-4ad6-8303-f8410ed7f652",
    "photoNumber": 3,
    "titlePt": "São Paulo - SP | MVComp 2025",
    "titleEn": "São Paulo - SP | MVComp 2025",
    "linkType": "none",
    "visible": true,
    "sortOrder": 7,
    "legacySortOrder": 4,
    "media": {
      "card": "assets/about/gallery/WebP/1789571801186-0f09a16d-f380-455d-bfcd-8d26548bb286-palestrando-3.webp",
      "full": "assets/about/gallery/PNG/1789571801186-0f09a16d-f380-455d-bfcd-8d26548bb286-palestrando-3.png",
      "original": "assets/about/gallery/originals/1789571801186-0f09a16d-f380-455d-bfcd-8d26548bb286-palestrando-3.jpg"
    }
  },
  {
    "id": "72297bc3-2530-4f46-96f6-1348704ca148",
    "photoNumber": 4,
    "titlePt": "Porto Alegre - RS | Inauguração da LACQ (Liga Acadêmica de Computação Quântica) na PUCRS — Tecnopuc 2025",
    "titleEn": "Porto Alegre - RS | Inauguração da LACQ (Liga Acadêmica de Computação Quântica) na PUCRS — Tecnopuc 2025",
    "linkType": "none",
    "visible": true,
    "sortOrder": 8,
    "legacySortOrder": 5,
    "media": {
      "card": "assets/about/gallery/WebP/1789571811030-2945a4f7-87e0-4535-9841-4cfde152eceb-palestrando-4.webp",
      "full": "assets/about/gallery/PNG/1789571811030-2945a4f7-87e0-4535-9841-4cfde152eceb-palestrando-4.png",
      "original": "assets/about/gallery/originals/1789571811030-2945a4f7-87e0-4535-9841-4cfde152eceb-palestrando-4.jpg"
    }
  },
  {
    "id": "9963a7e2-550b-4435-9c14-d7289ad40d8a",
    "photoNumber": 5,
    "titlePt": "Porto Alegre - RS | Primeira Semana de Computação Quântica da UFRGS 2025",
    "titleEn": "Porto Alegre - RS | Primeira Semana de Computação Quântica da UFRGS 2025",
    "linkType": "none",
    "visible": true,
    "sortOrder": 9,
    "legacySortOrder": 6,
    "media": {
      "card": "assets/about/gallery/WebP/1789571818244-4b919e6a-9188-4b40-a58b-2a669be3c183-palestrando-5.webp",
      "full": "assets/about/gallery/PNG/1789571818244-4b919e6a-9188-4b40-a58b-2a669be3c183-palestrando-5.png",
      "original": "assets/about/gallery/originals/1789571818244-4b919e6a-9188-4b40-a58b-2a669be3c183-palestrando-5.jpg"
    }
  },
  {
    "id": "e61f69c2-574f-43e1-9555-bf251c87c223",
    "photoNumber": 6,
    "titlePt": "Foz do Iguaçu - PR | Latinoware 2025",
    "titleEn": "Foz do Iguaçu - PR | Latinoware 2025",
    "linkType": "none",
    "visible": true,
    "sortOrder": 10,
    "legacySortOrder": 7,
    "media": {
      "card": "assets/about/gallery/WebP/1789571828453-cfc3921b-7e7a-4d64-827c-f3d4d3782ce5-palestrando-6.webp",
      "full": "assets/about/gallery/PNG/1789571828453-cfc3921b-7e7a-4d64-827c-f3d4d3782ce5-palestrando-6.png",
      "original": "assets/about/gallery/originals/1789571828453-cfc3921b-7e7a-4d64-827c-f3d4d3782ce5-palestrando-6.jpg"
    }
  },
  {
    "id": "8f1e276a-334f-45d2-86cc-fb4cc7511be0",
    "photoNumber": 7,
    "titlePt": "palestrando (7)",
    "titleEn": "palestrando (7)",
    "linkType": "none",
    "visible": false,
    "sortOrder": 11,
    "legacySortOrder": 8,
    "media": {
      "card": "assets/about/gallery/WebP/1789571843484-bd83235e-a2bf-4416-ba8f-eb29eb271307-palestrando-7.webp",
      "full": "assets/about/gallery/PNG/1789571843484-bd83235e-a2bf-4416-ba8f-eb29eb271307-palestrando-7.png",
      "original": "assets/about/gallery/originals/1789571843484-bd83235e-a2bf-4416-ba8f-eb29eb271307-palestrando-7.jpg"
    }
  },
  {
    "id": "71cdcba8-bd02-4192-9ea0-5e0b7d4f76c9",
    "photoNumber": 10,
    "titlePt": "palestrando (10)",
    "titleEn": "palestrando (10)",
    "linkType": "none",
    "visible": false,
    "sortOrder": 12,
    "legacySortOrder": 10,
    "media": {
      "card": "assets/about/gallery/WebP/1789571874216-6ee14aef-bc22-4285-a12c-3c7da26b2273-palestrando-10.webp",
      "full": "assets/about/gallery/PNG/1789571874216-6ee14aef-bc22-4285-a12c-3c7da26b2273-palestrando-10.png",
      "original": "assets/about/gallery/originals/1789571874216-6ee14aef-bc22-4285-a12c-3c7da26b2273-palestrando-10.jpg"
    }
  }
]

export type LocalAboutGalleryItem = AboutGalleryItem & {
  photoNumber: number
  legacySortOrder: number
  media: { card: string; full: string; original: string }
}
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
const local = (path: string) => base + path.split('/').map(encodeURIComponent).join('/')
export function getLocalAboutGallery(includeHidden = false): LocalAboutGalleryItem[] {
  return aboutGalleryCatalog.filter(item => includeHidden || item.visible)
    .sort((a,b) => a.sortOrder - b.sortOrder)
    .map(item => ({
      ...item, imageUrl: local(item.media.original),
      media: { card: local(item.media.card), full: local(item.media.full), original: local(item.media.original) },
    }))
}
