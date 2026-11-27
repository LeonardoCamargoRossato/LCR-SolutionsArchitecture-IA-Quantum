import { externalLinks } from '../config/externalLinks'
import { localizedSiteSettings } from '../i18n/content'
import { useI18n } from '../i18n/I18nProvider'
import { useSiteContent } from '../providers/SiteContentProvider'

export function Footer() {
  const { content } = useSiteContent()
  const { locale, t } = useI18n()
  const settings = localizedSiteSettings(content.siteSettings, locale)
  const tagline = settings.footerTagline || t('footerTagline')

  return (
    <footer className="footer">
      <div className="site-container footer-grid">
        <div>
          <div className="footer-name">Leonardo Rossato</div>
          <div className="footer-tagline">{tagline}</div>
          <a className="footer-email" href={externalLinks.email}>
            leo.c.rossato@gmail.com
          </a>
        </div>

        <div className="footer-links">
          <a href={externalLinks.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={externalLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={externalLinks.instagram} target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>

      <div className="site-container footer-bottom">
        © {new Date().getFullYear()} Leonardo Rossato
      </div>
    </footer>
  )
}
