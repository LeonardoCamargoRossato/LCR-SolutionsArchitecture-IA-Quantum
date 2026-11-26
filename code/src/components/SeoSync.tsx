import { resolvePublicAsset } from '../assets/public/resolvePublicAsset'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { PORTFOLIO_HERO_CONTENT } from '../config/portfolioPositioning'
import { localizedProject } from '../i18n/content'
import { useI18n } from '../i18n/I18nProvider'
import { useSiteContent } from '../providers/SiteContentProvider'

const DEFAULT_TITLE = 'Leonardo Camargo Rossato | AI Engineering & Software Development'
const DEFAULT_FAVICON = `${import.meta.env.BASE_URL}projects/logo_LCR_PortifolioApps.png`

export function SeoSync() {
  const { content, projects, selectedWork } = useSiteContent()
  const { pathname } = useLocation()
  const { locale } = useI18n()
  const lastFaviconSource = useRef<string | undefined>(undefined)

  useEffect(() => {
    const s = content.seo
    const slug = pathname.startsWith('/projects/') ? pathname.slice('/projects/'.length) : null
    const caseSource = slug ? (projects.find((project) => project.slug === slug && project.visible !== false && project.caseEnabled !== false) ?? selectedWork.find(project => project.slug === slug)) : null
    const currentCase = caseSource ? localizedProject(caseSource, locale) : null
    const caseDescription = currentCase?.description?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const localizedHero = PORTFOLIO_HERO_CONTENT[locale]
    const title = currentCase
      ? `${currentCase.title} | Leonardo Camargo Rossato`
      : locale === 'pt-BR'
        ? `Leonardo Camargo Rossato | ${localizedHero.title}`
        : (s.siteTitle?.trim() || DEFAULT_TITLE)
    document.title = title

    const setMeta = (selector: string, value?: string) => {
      const safeValue = value?.trim()
      if (!safeValue) return

      let element = document.querySelector(selector) as HTMLMetaElement | null
      if (!element) {
        element = document.createElement('meta')
        const name = selector.match(/"([^"]+)"/)?.[1] || ''
        if (selector.includes('property=')) element.setAttribute('property', name)
        else element.name = name
        document.head.appendChild(element)
      }
      element.content = safeValue
    }

    const description = caseDescription || (locale === 'pt-BR' ? localizedHero.description : s.metaDescription)
    setMeta('meta[name="description"]', description)
    // Social crawlers receive index.html, including hash routes. Keep the
    // canonical portfolio card identical before and after hydration. The
    // localized browser title, description and favicon remain dynamic.

    const configuredFavicon = resolvePublicAsset(s.faviconUrl?.trim())
    const faviconSource = configuredFavicon || DEFAULT_FAVICON

    if (lastFaviconSource.current !== faviconSource) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
      if (!favicon) {
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        document.head.appendChild(favicon)
      }

      favicon.type = configuredFavicon?.toLowerCase().includes('.svg')
        ? 'image/svg+xml'
        : configuredFavicon?.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/png'

      favicon.href = configuredFavicon
        ? configuredFavicon
        : DEFAULT_FAVICON

      favicon.dataset.source = faviconSource
      lastFaviconSource.current = faviconSource
    }
  }, [content.seo, pathname, projects, selectedWork, locale])

  return null
}
