import type { AboutContent } from './About'
import type { Locale } from '../../i18n/types'

export type HomeTranslation = {
  eyebrow?: string
  title?: string
  highlightedWords?: string
  description?: string
  focus?: string
  skills?: string[]
}

export type HomeContent = {
  eyebrow: string
  title: string
  highlightedWords: string
  description: string
  focus: string
  skills: string[]
  translations?: Partial<Record<Locale, HomeTranslation>>
}

export type ResearchContent = {
  title: string
  description: string
  areas: string[]
}

export type Capability = {
  title: string
  description: string
  items: string[]
}

export type WorkProcessStep = {
  step: string
  title: string
  description: string
}

export type SiteSettingsTranslation = {
  footerTagline?: string
  contactIntro?: string
  projectsIntro?: string
  architectureStatement?: string
  capabilities?: Capability[]
  workProcess?: WorkProcessStep[]
}

export type SiteSettingsContent = {
  footerTagline: string
  contactIntro: string
  projectsIntro: string
  architectureStatement: string
  capabilities: Capability[]
  workProcess: WorkProcessStep[]
  mainCardScale: number
  moreCardScale: number
  translations?: Partial<Record<Locale, SiteSettingsTranslation>>
}

export type SeoContent = {
  siteTitle: string
  metaDescription: string
  ogTitle: string
  ogDescription: string
  ogImage?: string
}

export type SocialLink = {
  id: string
  platform: string
  label: string
  url: string
  icon: string
  visible: boolean
  order: number
}

export type SiteContent = {
  home: HomeContent
  about: AboutContent
  research: ResearchContent
  siteSettings: SiteSettingsContent
  socialLinks: SocialLink[]
  seo: SeoContent
  cvUrl?: string
}
