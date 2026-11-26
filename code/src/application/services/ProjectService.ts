import { getAdditionalWork, findAdditionalWork, isAdditionalWork } from '../../data/additionalWork'
import { enrichPublishedProject as enrich, withEditorialDefaults, canonicalSlug } from '../../data/projectEditorial'
import { getSelectedWork, isSelectedWork } from '../../data/selectedWork'
import type { IProjectRepository } from '../../domain/repositories/IProjectRepository'
import type { Project } from '../../domain/models/Project'
import { defaultMoreProjects, defaultProjects } from '../../data/defaultProjects'
import { withLocalSelectedCaseGallery } from '../../data/selectedCaseGalleries'
import { animeFinderProject } from '../../data/animeFinderProject'
import { RETIRED_PROJECT_SLUGS } from '../../config/retiredProjects'

const defaults = [...defaultProjects, ...defaultMoreProjects]
const retiredSlugs = RETIRED_PROJECT_SLUGS

function sortEditorial(items: Project[]) {
  return [...items].sort((a, b) => {
    const placementA = a.placement ?? (a.caseStudy ? 'main' : 'more')
    const placementB = b.placement ?? (b.caseStudy ? 'main' : 'more')
    if (placementA !== placementB) return placementA === 'main' ? -1 : 1
    return (a.sortOrder ?? a.order ?? 999) - (b.sortOrder ?? b.order ?? 999)
  })
}

function fallbackDefaults() {
  return defaults.filter((project) => !retiredSlugs.has(project.slug)).map(withEditorialDefaults)
}

/** Minimal offline case bridge. Do not change CMS-backed detail pages
 * when available; use only the existing approved case for missing routes. */
export function selectedCaseFallback(slug: string): Project | undefined {
  const card = getSelectedWork().find(p => p.slug === slug || p.id === slug)
  if (!card) return undefined
  const existing = defaults.find(p => p.slug === card.slug)
  if (!existing) return undefined
  return withLocalSelectedCaseGallery({ ...existing, ...card, sections:existing.sections, gallery:existing.gallery,
    translations:{ ...existing.translations, 'pt-BR':{
      ...existing.translations?.['pt-BR'], ...card.translations?.['pt-BR'],
      sections:existing.translations?.['pt-BR']?.sections,
    } } })
}
export class ProjectService {
  constructor(private repo: IProjectRepository) {}

  async getAll() {
    // Only the not-yet-migrated Selected Work case details depend on CMS.
    // Additional Work is present before and after a backend failure.
    const local = getAdditionalWork()
    try {
      const remote = await this.repo.getAll()
      let selected = remote.filter(p=>isSelectedWork(p)&&p.visible!==false)
      if(!selected.some(p=>p.slug===animeFinderProject.slug)){
        const existing=await this.repo.getBySlug(animeFinderProject.slug,true)
        if(!existing)selected=[...selected,animeFinderProject]
      }
      return sortEditorial([...selected.map(enrich), ...local])
    } catch { return local }
  }

  async getAllForAdmin() {
    const remote = await this.repo.getAllForAdmin()
    return sortEditorial([...getSelectedWork(), ...getAdditionalWork(), ...remote.filter((project) => !retiredSlugs.has(project.slug) && !isSelectedWork(project) && !isAdditionalWork(project)).map(enrich)])
  }

  async getBySlug(slug: string, includeHidden = false) {
    if (retiredSlugs.has(slug)) return null
    const local = findAdditionalWork(slug)
    if (local) return local
    const accepted = slug === 'cities-comparing' ? ['cities-comparing', 'city-comparing'] : [slug]
    try {
      const all = includeHidden ? await this.repo.getAllForAdmin() : await this.repo.getAll()
      const found = all.find((project) => accepted.includes(project.slug) || (slug === 'cities-comparing' && project.id === 'city-comparing'))
      const project = found ?? (slug === animeFinderProject.slug ? await this.repo.getBySlug(animeFinderProject.slug, true) ?? animeFinderProject : null)
      if (!includeHidden && project?.visible === false) return null
      return project ? enrich(project) : selectedCaseFallback(slug) ?? null
    } catch {
      return selectedCaseFallback(slug) ?? null
    }
  }

  private assertEditable(value: string | Project) {
    if (isSelectedWork(value) || isAdditionalWork(value)) throw new Error('Public project is versioned on GitHub; edit the repository.')
  }
  update(project: Project) { this.assertEditable(project); return this.repo.update(withEditorialDefaults({ ...project, slug: canonicalSlug(project) })) }
  create(project: Project) { this.assertEditable(project); return this.repo.create(withEditorialDefaults({ ...project, slug: canonicalSlug(project) })) }
  delete(id: string) { this.assertEditable(id); return this.repo.delete(id) }
}
