import type { AboutContent } from '../domain/models/About'
import type { Project } from '../domain/models/Project'
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
  if (!translation) return project
  return {
    ...project,
    ...translation,
    sections: {
      ...project.sections,
      ...(translation.sections ?? {}),
    },
  }
}
