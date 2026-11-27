export type ProjectStatus =
  | 'Live'
  | 'Private Platform'
  | 'Case Study in Progress'
  | 'Coming Soon'

export type ProjectTheme = 'default' | 'dark'

export type ProjectSection = {
  title: string
  body?: string[]
  items?: string[]
}

export type ProjectLink = {
  label: string
  url?: string
  kind?: 'primary' | 'secondary'
}

export type Project = {
  id: string
  slug: string
  title: string
  subtitle?: string
  category: string
  description: string
  technologies: string[]
  coverImage: string
  featured?: boolean
  badge?: string
  status: ProjectStatus
  theme?: ProjectTheme
  year?: string
  caseStudy: boolean
  links?: ProjectLink[]
  sections?: {
    overview?: ProjectSection
    challenge?: ProjectSection
    solution?: ProjectSection
    features?: ProjectSection
    architecture?: ProjectSection
    role?: ProjectSection
  }
  gallery?: {
    label: string
    image?: string
  }[]
}
