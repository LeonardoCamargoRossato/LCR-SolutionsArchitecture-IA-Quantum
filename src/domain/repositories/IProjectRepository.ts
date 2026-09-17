import type { Project } from '../models/Project'

export interface IProjectRepository {
  getAll(): Promise<Project[]>
  getAllForAdmin(): Promise<Project[]>
  getBySlug(slug: string, includeHidden?: boolean): Promise<Project | null>
  update(project: Project): Promise<void>
  create(project: Project): Promise<void>
  delete(id: string): Promise<void>
}
