import type {
  ProjectInstitution,
  ProjectInstitutionSource,
} from '../../domain/models/ProjectInstitution'
import type { IProjectInstitutionRepository } from '../../domain/repositories/IProjectInstitutionRepository'

export class ProjectInstitutionService {
  constructor(private repo: IProjectInstitutionRepository) {}

  getPublic(projectId: string, projectSource: ProjectInstitutionSource) {
    return this.repo.getPublic(projectId, projectSource)
  }

  getAdmin(projectId: string, projectSource: ProjectInstitutionSource) {
    return this.repo.getAdmin(projectId, projectSource)
  }

  create(value: Omit<ProjectInstitution, 'id'>) {
    return this.repo.create(value)
  }

  update(value: ProjectInstitution) {
    return this.repo.update(value)
  }

  delete(id: string) {
    return this.repo.delete(id)
  }

  reorder(values: Array<Pick<ProjectInstitution, 'id' | 'sortOrder'>>) {
    return this.repo.reorder(values)
  }
}
