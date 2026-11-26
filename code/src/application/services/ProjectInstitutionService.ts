import { findAdditionalWork, getAdditionalInstitutions, isAdditionalInstitution } from '../../data/additionalWork'
import type {
  ProjectInstitution,
  ProjectInstitutionSource,
} from '../../domain/models/ProjectInstitution'
import type { IProjectInstitutionRepository } from '../../domain/repositories/IProjectInstitutionRepository'

export class ProjectInstitutionService {
  constructor(private repo: IProjectInstitutionRepository) {}

  getPublic(projectId: string, projectSource: ProjectInstitutionSource) {
    return findAdditionalWork(projectId) ? Promise.resolve(getAdditionalInstitutions(projectId)) : this.repo.getPublic(projectId, projectSource)
  }

  getAdmin(projectId: string, projectSource: ProjectInstitutionSource) {
    return findAdditionalWork(projectId) ? Promise.resolve(getAdditionalInstitutions(projectId)) : this.repo.getAdmin(projectId, projectSource)
  }

  create(value: Omit<ProjectInstitution, 'id'>) {
    if(findAdditionalWork(value.projectId)) throw new Error('Versioned institution; edit GitHub')
    return this.repo.create(value)
  }

  update(value: ProjectInstitution) {
    if(findAdditionalWork(value.projectId)||isAdditionalInstitution(value.id)) throw new Error('Versioned institution; edit GitHub')
    return this.repo.update(value)
  }

  delete(id: string) {
    if(isAdditionalInstitution(id)) throw new Error('Versioned institution; edit GitHub')
    return this.repo.delete(id)
  }

  reorder(values: Array<Pick<ProjectInstitution, 'id' | 'sortOrder'>>) {
    if(values.some(v=>isAdditionalInstitution(v.id))) throw new Error('Versioned institution; edit GitHub')
    return this.repo.reorder(values)
  }
}
