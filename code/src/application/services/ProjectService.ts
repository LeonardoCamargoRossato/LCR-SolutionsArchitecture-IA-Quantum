import { getSelectedCases, findSelectedCase } from '../../data/selectedCases'
import { getAdditionalWork, findAdditionalWork, isAdditionalWork } from '../../data/additionalWork'
import { enrichPublishedProject as enrich, withEditorialDefaults, canonicalSlug } from '../../data/projectEditorial'
import { getSelectedWork, isSelectedWork } from '../../data/selectedWork'
import type { IProjectRepository } from '../../domain/repositories/IProjectRepository'
import type { Project } from '../../domain/models/Project'
import { RETIRED_PROJECT_SLUGS } from '../../config/retiredProjects'

const retiredSlugs = RETIRED_PROJECT_SLUGS

function sortEditorial(items: Project[]) {
  return [...items].sort((a, b) => {
    const placementA = a.placement ?? (a.caseStudy ? 'main' : 'more')
    const placementB = b.placement ?? (b.caseStudy ? 'main' : 'more')
    if (placementA !== placementB) return placementA === 'main' ? -1 : 1
    return (a.sortOrder ?? a.order ?? 999) - (b.sortOrder ?? b.order ?? 999)
  })
}

/** Compatibility entrypoint for existing callers; selected cases are now local. */
export function selectedCaseFallback(slug:string):Project|undefined { return findSelectedCase(slug) }
export class ProjectService {
  constructor(private repo: IProjectRepository) {}

  async getAll() { return sortEditorial([...getSelectedCases(), ...getAdditionalWork()]) }

  async getAllForAdmin() {
    const remote = await this.repo.getAllForAdmin()
    return sortEditorial([...getSelectedWork(), ...getAdditionalWork(), ...remote.filter((project) => !retiredSlugs.has(project.slug) && !isSelectedWork(project) && !isAdditionalWork(project)).map(enrich)])
  }

  async getBySlug(slug: string, includeHidden = false) {
    if (retiredSlugs.has(slug)) return null
    const local = findSelectedCase(slug) ?? findAdditionalWork(slug)
    if (local) return local
    if(!includeHidden)return null
    try{
      const project=await this.repo.getBySlug(slug,true)
      return project&&!retiredSlugs.has(project.slug)?enrich(project):null
    }catch{return null}
  }

  private assertEditable(value: string | Project) {
    if (isSelectedWork(value) || isAdditionalWork(value)) throw new Error('Public project is versioned on GitHub; edit the repository.')
  }
  update(project: Project) { this.assertEditable(project); return this.repo.update(withEditorialDefaults({ ...project, slug: canonicalSlug(project) })) }
  create(project: Project) { this.assertEditable(project); return this.repo.create(withEditorialDefaults({ ...project, slug: canonicalSlug(project) })) }
  delete(id: string) { this.assertEditable(id); return this.repo.delete(id) }
}
