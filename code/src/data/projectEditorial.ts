import type { Project, ProjectPlacement, ProjectSource } from '../domain/models/Project'
import { defaultMoreProjects, defaultProjects } from './defaultProjects'
import { citiesComparingContent } from './citiesComparing'
import { withLocalSelectedCaseGallery } from './selectedCaseGalleries'
const defaults = [...defaultProjects, ...defaultMoreProjects]
export function canonicalSlug(project: Project) {
  if (project.id === 'city-comparing' || project.slug === 'city-comparing') return 'cities-comparing'
  return project.slug
}

export function withEditorialDefaults(project: Project): Project {
  const source: ProjectSource = project.source ?? (project.caseStudy ? 'main' : 'more')
  const placement: ProjectPlacement = project.slug === 'hamlet'
    ? 'more'
    : project.slug === 'animefinder'
      ? 'main'
      : project.placement ?? (source === 'main' ? 'main' : 'more')
  const sortOrder = Number.isFinite(Number(project.sortOrder))
    ? Number(project.sortOrder)
    : Number.isFinite(Number(project.order))
      ? Number(project.order)
      : 999

  return {
    ...project,
    source,
    placement,
    visible: project.visible ?? true,
    sortOrder,
    order: sortOrder,
    caseEnabled: project.caseEnabled ?? true,
  }
}

export function enrichPublishedProject(project: Project): Project {
  const base = defaults.find((item) =>
    item.id === project.id ||
    item.slug === project.slug ||
    (item.slug === 'cities-comparing' && project.slug === 'city-comparing'),
  )

  if (!base) return withEditorialDefaults({ ...project, slug: canonicalSlug(project) })

  const hasSectionValue = (value: unknown) => {
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    if (value && typeof value === 'object') {
      const section = value as Record<string, unknown>
      const body = section.body ?? section.content ?? section.description ?? section.text
      const items = section.items
      return (
        (typeof body === 'string' && body.trim().length > 0) ||
        (Array.isArray(body) && body.length > 0) ||
        (Array.isArray(items) && items.length > 0)
      )
    }
    return false
  }

  const hasNewCaseSections = Boolean(
    hasSectionValue(project.sections?.challenge) ||
    hasSectionValue(project.sections?.solution) ||
    hasSectionValue(project.sections?.architecture) ||
    hasSectionValue(project.sections?.results),
  )

  const enriched = withEditorialDefaults({
    ...base,
    ...project,
    slug: canonicalSlug(project),
    links: { ...base.links, ...project.links },
    sections: hasNewCaseSections
      ? { ...base.sections, ...project.sections }
      : { ...project.sections, ...base.sections },
    translations: {
      ...base.translations,
      ...project.translations,
      'pt-BR': {
        ...base.translations?.['pt-BR'],
        ...project.translations?.['pt-BR'],
        sections: hasNewCaseSections
          ? { ...base.translations?.['pt-BR']?.sections, ...project.translations?.['pt-BR']?.sections }
          : { ...project.translations?.['pt-BR']?.sections, ...base.translations?.['pt-BR']?.sections },
      },
    },
  })

  // These public URLs are code-managed so stale CMS values cannot replace the
  // current published-site actions after remote content hydration.
  if (base.slug === 'speaker-portfolio') {
    return {
      ...enriched,
      links: { ...enriched.links, liveUrl: base.links.liveUrl },
    }
  }

  if (base.slug === 'ce235-real-time-systems') {
    return {
      ...enriched,
      gallery: enriched.gallery.length ? enriched.gallery : base.gallery,
      links: { ...enriched.links, ...base.links },
    }
  }

  if (base.slug === 'webseer') {
    return {
      ...enriched,
      title: base.title,
      subtitle: base.subtitle,
      category: base.category,
      status: base.status,
      description: base.description,
      technologies: base.technologies,
      // Supabase owns the canonical PNG cover; retain code-managed gallery.
      coverImage: enriched.coverImage ?? base.coverImage,
      imageType: enriched.imageType ?? base.imageType,
      gallery: base.gallery,
      isAcademic: base.isAcademic,
      academicContext: base.academicContext,
      caseStudy: base.caseStudy,
      caseEnabled: base.caseEnabled,
      links: { ...enriched.links, ...base.links },
      sections: { ...enriched.sections, ...base.sections },
      translations: {
        ...enriched.translations,
        'pt-BR': {
          ...enriched.translations?.['pt-BR'],
          ...base.translations?.['pt-BR'],
          sections: {
            ...enriched.translations?.['pt-BR']?.sections,
            ...base.translations?.['pt-BR']?.sections,
          },
        },
      },
    }
  }

  if (base.slug === 'embedded-control-platform') {
    return {
      ...enriched,
      title: base.title,
      subtitle: base.subtitle,
      category: base.category,
      status: base.status,
      description: base.description,
      technologies: base.technologies,
      isAcademic: base.isAcademic,
      institutionName: base.institutionName,
      academicContext: base.academicContext,
      sections: { ...enriched.sections, ...base.sections },
      translations: {
        ...enriched.translations,
        'pt-BR': {
          ...enriched.translations?.['pt-BR'],
          ...base.translations?.['pt-BR'],
          sections: {
            ...enriched.translations?.['pt-BR']?.sections,
            ...base.translations?.['pt-BR']?.sections,
          },
        },
      },
    }
  }

  if (base.slug !== 'cities-comparing') return withLocalSelectedCaseGallery(enriched)

  // Preserve the approved case narrative, but never use CMS gallery content.
  return withLocalSelectedCaseGallery({
    ...enriched,
    ...citiesComparingContent,
    links: { ...enriched.links, ...citiesComparingContent.links },
    sections: { ...enriched.sections, ...citiesComparingContent.sections },
    translations: {
      ...enriched.translations,
      'pt-BR': {
        ...enriched.translations?.['pt-BR'],
        ...citiesComparingContent.translations['pt-BR'],
        sections: {
          ...enriched.translations?.['pt-BR']?.sections,
          ...citiesComparingContent.translations['pt-BR'].sections,
        },
      },
    },
  })
}

