import { useEffect, useRef } from 'react'
import { useSiteContent } from '../providers/SiteContentProvider'

const DEFAULT_TITLE = 'LCR - Solutions Architecture | IA + Quantum'
const DEFAULT_FAVICON = `${import.meta.env.BASE_URL}projects/logo_LCR_PortifolioApps.png`

export function SeoSync() {
  const { content } = useSiteContent()
  const lastFaviconSource = useRef<string | undefined>(undefined)

  useEffect(() => {
    const s = content.seo
    document.title = s.siteTitle?.trim() || DEFAULT_TITLE

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

    setMeta('meta[name="description"]', s.metaDescription)
    setMeta('meta[property="og:title"]', s.ogTitle)
    setMeta('meta[property="og:description"]', s.ogDescription)
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
  }, [content.seo])

  return null
}
