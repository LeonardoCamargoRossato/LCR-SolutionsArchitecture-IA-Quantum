import type { IProjectRepository } from '../../domain/repositories/IProjectRepository'
import type { Project, ProjectPlacement, ProjectSource } from '../../domain/models/Project'
import { defaultMoreProjects, defaultProjects } from '../../data/defaultProjects'

const defaults = [...defaultProjects, ...defaultMoreProjects]

function canonicalSlug(project: Project) {
  if (project.id === 'city-comparing' || project.slug === 'city-comparing') return 'cities-comparing'
  return project.slug
}

function withEditorialDefaults(project: Project): Project {
  const source: ProjectSource = project.source ?? (project.caseStudy ? 'main' : 'more')
  const placement: ProjectPlacement = project.placement ?? (source === 'main' ? 'main' : 'more')
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

function enrich(project: Project): Project {
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

  return withEditorialDefaults({
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
}

function sortEditorial(items: Project[]) {
  return [...items].sort((a, b) => {
    const placementA = a.placement ?? (a.caseStudy ? 'main' : 'more')
    const placementB = b.placement ?? (b.caseStudy ? 'main' : 'more')
    if (placementA !== placementB) return placementA === 'main' ? -1 : 1
    return (a.sortOrder ?? a.order ?? 999) - (b.sortOrder ?? b.order ?? 999)
  })
}

function fallbackDefaults() {
  return defaults.filter((project) => project.slug !== 'power-platform').map(withEditorialDefaults)
}

export class ProjectService {
  constructor(private repo: IProjectRepository) {}

  async getAll() {
    try {
      const remote = await this.repo.getAll()
      return sortEditorial(remote.filter((project) => project.slug !== 'power-platform' && project.visible !== false).map(enrich))
    } catch {
      // Do not expose local defaults when the remote visibility query fails.
      return []
    }
  }

  async getAllForAdmin() {
    const remote = await this.repo.getAllForAdmin()
    return sortEditorial(remote.filter((project) => project.slug !== 'power-platform').map(enrich))
  }

  async getBySlug(slug: string, includeHidden = false) {
    if (slug === 'power-platform') return null
    const accepted = slug === 'cities-comparing' ? ['cities-comparing', 'city-comparing'] : [slug]
    try {
      const all = includeHidden ? await this.repo.getAllForAdmin() : await this.repo.getAll()
      const found = all.find((project) => accepted.includes(project.slug) || (slug === 'cities-comparing' && project.id === 'city-comparing'))
      return found ? enrich(found) : null
    } catch {
      return null
    }
  }

  update(project: Project) { return this.repo.update(withEditorialDefaults({ ...project, slug: canonicalSlug(project) })) }
  create(project: Project) { return this.repo.create(withEditorialDefaults({ ...project, slug: canonicalSlug(project) })) }
  delete(id: string) { return this.repo.delete(id) }
}
