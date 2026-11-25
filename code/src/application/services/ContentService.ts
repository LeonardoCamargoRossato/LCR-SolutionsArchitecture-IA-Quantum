import type { IContentRepository } from '../../domain/repositories/IContentRepository'
import { defaultContent } from '../../data/defaultContent'
import { externalLinks } from '../../config/externalLinks'

export class ContentService {
  constructor(private repo: IContentRepository) {}

  async getHome() {
    try { return (await this.repo.getHome()) ?? defaultContent.home }
    catch { return defaultContent.home }
  }

  saveHome(v: typeof defaultContent.home) { return this.repo.saveHome(v) }

  async getAbout() {
    try {
      const about = (await this.repo.getAbout()) ?? defaultContent.about
      return { ...about, speakerPortfolioUrl: externalLinks.speaker }
    }
    catch { return defaultContent.about }
  }

  saveAbout(v: typeof defaultContent.about) { return this.repo.saveAbout(v) }

  async getResearch() {
    try { return (await this.repo.getResearch()) ?? defaultContent.research }
    catch { return defaultContent.research }
  }

  saveResearch(v: typeof defaultContent.research) { return this.repo.saveResearch(v) }

  async getSiteSettings() {
    try { return (await this.repo.getSiteSettings()) ?? defaultContent.siteSettings }
    catch { return defaultContent.siteSettings }
  }

  saveSiteSettings(v: typeof defaultContent.siteSettings) { return this.repo.saveSiteSettings(v) }

  async getSocialLinks() {
    try {
      const links = (await this.repo.getSocialLinks()) ?? defaultContent.socialLinks
      return links.map((link) => link.id === 'speaker' || link.platform === 'Speaker Portfolio'
        ? { ...link, url: externalLinks.speaker }
        : link)
    }
    catch { return defaultContent.socialLinks }
  }

  saveSocialLinks(v: typeof defaultContent.socialLinks) { return this.repo.saveSocialLinks(v) }

  async getSeo() {
    try { return (await this.repo.getSeo()) ?? defaultContent.seo }
    catch { return defaultContent.seo }
  }

  saveSeo(v: typeof defaultContent.seo) { return this.repo.saveSeo(v) }

  async getCvUrl() {
    try { return (await this.repo.getCvUrl()) ?? undefined }
    catch { return undefined }
  }

  saveCvUrl(url: string) { return this.repo.saveCvUrl(url) }
}
