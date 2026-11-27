export type AboutGalleryLinkType =
  | 'none'
  | 'speaker_portfolio'
  | 'instituto_pense_mais'
  | 'custom'

export type AboutGalleryItem = {
  id: string
  imageUrl: string
  storagePath?: string

  titlePt?: string
  titleEn?: string

  descriptionPt?: string
  descriptionEn?: string

  captionPt?: string
  captionEn?: string

  locationPt?: string
  locationEn?: string

  eventDate?: string

  externalUrl?: string
  linkType: AboutGalleryLinkType

  visible: boolean
  sortOrder: number
}

export type AboutGalleryCreateInput = Omit<AboutGalleryItem, 'id'>
