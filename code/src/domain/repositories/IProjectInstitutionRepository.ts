import type {
  ProjectInstitution,
  ProjectInstitutionSource,
} from '../models/ProjectInstitution'

export interface IProjectInstitutionRepository {
  getPublic(projectId: string, projectSource: ProjectInstitutionSource): Promise<ProjectInstitution[]>
  getAdmin(projectId: string, projectSource: ProjectInstitutionSource): Promise<ProjectInstitution[]>
  create(value: Omit<ProjectInstitution, 'id'>): Promise<ProjectInstitution>
  update(value: ProjectInstitution): Promise<ProjectInstitution>
  delete(id: string): Promise<void>
  reorder(values: Array<Pick<ProjectInstitution, 'id' | 'sortOrder'>>): Promise<void>
}
