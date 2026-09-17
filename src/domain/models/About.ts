import type { MediaAsset } from './MediaAsset'
import type { Locale } from '../../i18n/types'

export type Experience = { id:string; order:number; title:string; organization:string; organizationUrl?:string; period:string; description:string }
export type Education = { id:string; order:number; institution:string; degree:string; field:string; period:string }
export type ResearchTimelineItem = { id:string; order:number; period:string; title:string; institution:string; description:string }
export type Publication = { id:string; order:number; year:number; title:string; venue:string; authors:string[]; doi?:string; url?:string }

export type AboutContentBlock = {
  id: string
  titlePt: string
  titleEn: string
  contentPt: string
  contentEn: string
  order: number
  visible: boolean
}

export type AboutTranslation = {
  title?: string
  name?: string
  headline?: string
  professionalTitle?: string
  intro?: string
  valueProposition?: string
  bio?: string[]
  location?: string
  email?: string
  areas?: string[]
  scienceCommunication?: string
}

export type AboutContent = {
  name:string
  headline:string
  professionalTitle:string
  intro:string
  valueProposition:string
  title?:string
  bio:string[]
  location:string
  email:string
  profileImage?:MediaAsset
  experiences:Experience[]
  education:Education[]
  researchTimeline:ResearchTimelineItem[]
  areas:string[]
  publications:Publication[]
  scienceCommunication:string
  speakerPortfolioUrl:string
  contentBlocks?:AboutContentBlock[]
  translations?:Partial<Record<Locale, AboutTranslation>>
}
