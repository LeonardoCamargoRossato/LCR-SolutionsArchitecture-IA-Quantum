import { officialCvUrl } from '../../assets/public/officialCv'
import { withOfficialProfile } from '../../assets/public/officialProfile'
import type { IContentRepository } from '../../domain/repositories/IContentRepository'
import { defaultContent } from '../../data/defaultContent'
import { publishedContentSnapshot } from '../../data/publishedContentSnapshot'
import { externalLinks } from '../../config/externalLinks'

export class ContentService {
  constructor(private repo: IContentRepository) {}

  async getHome() {
    try { return (await this.repo.getHome()) ?? publishedContentSnapshot.home }
    catch { return publishedContentSnapshot.home }
  }

  saveHome(v: typeof defaultContent.home) { return this.repo.saveHome(v) }

  async getAbout() {
    try {
      const about = (await this.repo.getAbout()) ?? publishedContentSnapshot.about
      return withOfficialProfile({ ...about, speakerPortfolioUrl: externalLinks.speaker })
    }
    catch { return withOfficialProfile(publishedContentSnapshot.about) }
  }

  saveAbout(v: typeof defaultContent.about) { return this.repo.saveAbout(v) }

  async getResearch() {
    try { return (await this.repo.getResearch()) ?? defaultContent.research }
    catch { return defaultContent.research }
  }

  saveResearch(v: typeof defaultContent.research) { return this.repo.saveResearch(v) }

  async getSiteSettings() {
    try { return (await this.repo.getSiteSettings()) ?? publishedContentSnapshot.siteSettings }
    catch { return publishedContentSnapshot.siteSettings }
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
    try { return (await this.repo.getSeo()) ?? publishedContentSnapshot.seo }
    catch { return publishedContentSnapshot.seo }
  }

  saveSeo(v: typeof defaultContent.seo) { return this.repo.saveSeo(v) }

  async getCvUrl() { return officialCvUrl }

  saveCvUrl(_url: string): Promise<void> { return Promise.reject(new Error('Official CV is versioned on GitHub.')) }
}
