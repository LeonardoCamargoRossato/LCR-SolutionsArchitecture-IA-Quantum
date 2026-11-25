import type { AboutContent } from '../domain/models/About'
import type { Project, ProjectStatus } from '../domain/models/Project'
import type { HomeContent, SiteSettingsContent } from '../domain/models/SiteContent'
import type { Locale } from './types'

export function localizedHome(home: HomeContent, locale: Locale): HomeContent {
  if (locale === 'en-US') return home
  return { ...home, ...(home.translations?.[locale] ?? {}) }
}

export function localizedAbout(about: AboutContent, locale: Locale): AboutContent {
  if (locale === 'en-US') return about
  return { ...about, ...(about.translations?.[locale] ?? {}) }
}

export function localizedSiteSettings(
  settings: SiteSettingsContent,
  locale: Locale,
): SiteSettingsContent {
  if (locale === 'en-US') return settings
  return { ...settings, ...(settings.translations?.[locale] ?? {}) }
}

export function localizedProject(project: Project, locale: Locale): Project {
  if (locale === 'en-US') return project
  const translation = project.translations?.[locale]
  return {
    ...project,
    ...(translation ?? {}),
    gallery: project.gallery.map((item) => ({
      ...item,
      caption: item.captionPt ?? item.caption,
      altText: item.altTextPt ?? item.altText,
    })),
    sections: {
      ...project.sections,
      ...(translation?.sections ?? {}),
    },
  }
}

/** Translate standard status badges regardless of project CMS translation coverage. */
export function localizedProjectStatus(status: ProjectStatus, locale: Locale): string {
  if (locale === 'en-US') {
    return status === 'Projeto Acadêmico' ? 'Academic Project' : status
  }
  const portuguese: Partial<Record<ProjectStatus, string>> = {
    'Live': 'Ativo',
    'Private Platform': 'Plataforma Privada',
    'Case Study in Progress': 'Estudo de Caso em Desenvolvimento',
    'Coming Soon': 'Em breve',
    'Academic Project': 'Projeto Acadêmico',
    'Projeto Acadêmico': 'Projeto Acadêmico',
  }
  return portuguese[status] ?? status
}
