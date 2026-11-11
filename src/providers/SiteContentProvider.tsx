import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { defaultContent } from '../data/defaultContent'
import { defaultMoreProjects, defaultProjects } from '../data/defaultProjects'
import type { Project } from '../domain/models/Project'
import type { SiteContent } from '../domain/models/SiteContent'

type Ctx = {
  content: SiteContent
  projects: Project[]
  loading: boolean
  refresh: () => Promise<void>
  refreshContent: () => Promise<void>
  refreshProjects: () => Promise<void>
}

const C = createContext<Ctx | undefined>(undefined)
const CACHE_TTL = 6 * 60 * 60 * 1000

function readCache<T>(key: string, fallback: T): T {
  try {
    const cached = JSON.parse(localStorage.getItem(key) ?? 'null') as { savedAt?: number; value?: T } | null
    return cached?.savedAt && Date.now() - cached.savedAt < CACHE_TTL && cached.value
      ? cached.value
      : fallback
  } catch {
    return fallback
  }
}

function writeCache<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), value }))
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => readCache('lcr-site-content-v2', defaultContent))
  const [projects, setProjects] = useState<Project[]>(() => readCache('lcr-projects-v2', [
    ...defaultProjects,
    ...defaultMoreProjects,
  ]))
  const [loading, setLoading] = useState(true)

  const refreshContent = async () => {
    const { contentService } = await import('../bootstrap/services')
    const [home, about, research, siteSettings, socialLinks, seo, cvUrl] =
      await Promise.all([
        contentService.getHome(),
        contentService.getAbout(),
        contentService.getResearch(),
        contentService.getSiteSettings(),
        contentService.getSocialLinks(),
        contentService.getSeo(),
        contentService.getCvUrl(),
      ])

    const next = {
      home,
      about,
      research,
      siteSettings,
      socialLinks,
      seo,
      cvUrl,
    }
    setContent(next)
    writeCache('lcr-site-content-v2', next)
  }

  const refreshProjects = async () => {
    const { projectService } = await import('../bootstrap/services')
    const next = await projectService.getAll()
    setProjects(next)
    writeCache('lcr-projects-v2', next)
  }

  const refresh = async () => {
    setLoading(true)
    try {
      await Promise.all([refreshContent(), refreshProjects()])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh().catch((error) => console.error('Content refresh failed.', error)) }, [])

  const value = useMemo(
    () => ({ content, projects, loading, refresh, refreshContent, refreshProjects }),
    [content, projects, loading],
  )

  return <C.Provider value={value}>{children}</C.Provider>
}

export function useSiteContent() {
  const value = useContext(C)
  if (!value) throw new Error('SiteContentProvider missing')
  return value
}
