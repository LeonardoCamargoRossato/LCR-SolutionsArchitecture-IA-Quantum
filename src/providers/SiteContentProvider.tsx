import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { contentService, projectService } from '../bootstrap/services'
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

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [projects, setProjects] = useState<Project[]>([
    ...defaultProjects,
    ...defaultMoreProjects,
  ])
  const [loading, setLoading] = useState(true)

  const refreshContent = async () => {
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

    setContent({
      home,
      about,
      research,
      siteSettings,
      socialLinks,
      seo,
      cvUrl,
    })
  }

  const refreshProjects = async () => {
    setProjects(await projectService.getAll())
  }

  const refresh = async () => {
    setLoading(true)
    try {
      await Promise.all([refreshContent(), refreshProjects()])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [])

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
