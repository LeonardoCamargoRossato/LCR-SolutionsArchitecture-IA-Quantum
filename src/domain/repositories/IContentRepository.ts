import type { AboutContent } from '../models/About'
import type {
  HomeContent,
  ResearchContent,
  SeoContent,
  SiteSettingsContent,
  SocialLink,
} from '../models/SiteContent'

export interface IContentRepository {
  getHome(): Promise<HomeContent | null>
  saveHome(v: HomeContent): Promise<void>
  getAbout(): Promise<AboutContent | null>
  saveAbout(v: AboutContent): Promise<void>
  getResearch(): Promise<ResearchContent | null>
  saveResearch(v: ResearchContent): Promise<void>
  getSiteSettings(): Promise<SiteSettingsContent | null>
  saveSiteSettings(v: SiteSettingsContent): Promise<void>
  getSocialLinks(): Promise<SocialLink[] | null>
  saveSocialLinks(v: SocialLink[]): Promise<void>
  getSeo(): Promise<SeoContent | null>
  saveSeo(v: SeoContent): Promise<void>
  getCvUrl(): Promise<string | null>
  saveCvUrl(url: string): Promise<void>
  removeCvUrl(): Promise<void>
}
