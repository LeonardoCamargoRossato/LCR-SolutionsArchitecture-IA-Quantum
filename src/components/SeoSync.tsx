import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { localizedProject } from '../i18n/content'
import { useI18n } from '../i18n/I18nProvider'
import { useSiteContent } from '../providers/SiteContentProvider'

const DEFAULT_TITLE = 'Leonardo Camargo Rossato | AI Engineering & Software Development'
const DEFAULT_FAVICON = `${import.meta.env.BASE_URL}projects/logo_LCR_PortifolioApps.png`

export function SeoSync() {
  const { content, projects } = useSiteContent()
  const { pathname } = useLocation()
  const { locale } = useI18n()
  const lastFaviconSource = useRef<string | undefined>(undefined)

  useEffect(() => {
    const s = content.seo
    const slug = pathname.startsWith('/projects/') ? pathname.slice('/projects/'.length) : null
    const caseSource = slug ? projects.find((project) => project.slug === slug && project.visible !== false && project.caseEnabled !== false) : null
    const currentCase = caseSource ? localizedProject(caseSource, locale) : null
    const caseDescription = currentCase?.description?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const title = currentCase ? `${currentCase.title} | Leonardo Camargo Rossato` : (s.siteTitle?.trim() || DEFAULT_TITLE)
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

    setMeta('meta[name="description"]', caseDescription || s.metaDescription)
    setMeta('meta[property="og:title"]', currentCase ? title : s.ogTitle)
    setMeta('meta[property="og:description"]', caseDescription || s.ogDescription)
    setMeta('meta[property="og:image"]', s.ogImage)

    const configuredFavicon = s.faviconUrl?.trim()
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
        : 'image/png'

      favicon.href = configuredFavicon
        ? `${configuredFavicon}${configuredFavicon.includes('?') ? '&' : '?'}v=${Date.now()}`
        : DEFAULT_FAVICON

      favicon.dataset.source = faviconSource
      lastFaviconSource.current = faviconSource
    }
  }, [content.seo, pathname, projects, locale])

  return null
}
