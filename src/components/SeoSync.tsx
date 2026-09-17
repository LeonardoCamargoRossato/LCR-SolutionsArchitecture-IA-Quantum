import { useEffect } from 'react'
import { useSiteContent } from '../providers/SiteContentProvider'

const DEFAULT_TITLE = 'LCR - Solutions Architecture | IA + Quantum'

export function SeoSync() {
  const { content } = useSiteContent()

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
  }, [content.seo])

  return null
}
