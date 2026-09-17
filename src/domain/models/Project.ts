import type { MediaAsset } from './MediaAsset'
import type { Locale } from '../../i18n/types'

export type ProjectStatus = 'Live' | 'Private Platform' | 'Case Study in Progress' | 'Coming Soon' | 'Academic Project' | 'Projeto Acadêmico'

export type ProjectPlacement = 'main' | 'more'
export type ProjectSource = 'main' | 'more'

export type ProjectSectionValue =
  | string
  | string[]
  | {
      title?: string
      body?: string | string[]
      items?: unknown[]
      content?: string | string[]
      description?: string | string[]
      text?: string | string[]
    }
  | null
  | undefined

export type ProjectSections = Record<string, ProjectSectionValue> & {
  overview?: ProjectSectionValue
  challenge?: ProjectSectionValue
  context?: ProjectSectionValue
  solution?: ProjectSectionValue
  approach?: ProjectSectionValue
  architecture?: ProjectSectionValue
  hardware?: ProjectSectionValue
  embedded_logic?: ProjectSectionValue
  web_interface?: ProjectSectionValue
  integration?: ProjectSectionValue
  features?: ProjectSectionValue
  role?: ProjectSectionValue
  results?: ProjectSectionValue
  technologies?: ProjectSectionValue

  /** Legacy case fields kept for backwards compatibility with earlier portfolio data. */
  advantages?: ProjectSectionValue
  userExperience?: ProjectSectionValue
  properties?: ProjectSectionValue
  technologiesUsed?: ProjectSectionValue
}

export type ProjectLinkSet = {
  liveUrl?: string
  githubUrl?: string
  researchUrl?: string
  institutionUrl?: string
}

export type ProjectGalleryItem = {
  id: string
  image?: MediaAsset
  caption: string
  altText: string
  /** Legacy order alias kept for compatibility with older components/data. */
  order: number
  sortOrder?: number
  visible?: boolean
  placement?: ProjectPlacement
  /** Physical Supabase source table; does not change when placement changes. */
  source?: ProjectSource
}

export type ProjectTranslation = {
  title?: string
  subtitle?: string
  category?: string
  status?: ProjectStatus
  description?: string
  technologies?: string[]
  sections?: ProjectSections
  reportTitle?: string
  academicContext?: string
}

export type Project = {
  id: string
  slug: string
  title: string
  subtitle?: string
  category: string
  status: ProjectStatus
  description: string
  technologies: string[]
  coverImage?: MediaAsset
  imageType?: 'real-screenshot' | 'illustrative-placeholder'
  sections: ProjectSections
  links: ProjectLinkSet
  gallery: ProjectGalleryItem[]
  /** Legacy order alias kept for compatibility with older components/data. */
  order: number
  sortOrder?: number
  visible?: boolean
  placement?: ProjectPlacement
  /** Physical Supabase source table; does not change when placement changes. */
  source?: ProjectSource
  featured?: boolean
  badge?: string
  theme?: 'default' | 'dark'
  year?: string
  caseStudy: boolean
  /** Controls whether /projects/:slug is available independently from the Home group. */
  caseEnabled?: boolean

  /** Optional academic/project documentation metadata from Supabase. */
  isAcademic?: boolean
  institutionName?: string
  institutionLogoUrl?: string
  reportPdfUrl?: string
  reportTitle?: string
  academicContext?: string

  translations?: Partial<Record<Locale, ProjectTranslation>>
}
