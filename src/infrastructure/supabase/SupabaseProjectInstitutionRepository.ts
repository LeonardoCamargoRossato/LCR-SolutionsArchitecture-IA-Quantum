import type {
  ProjectInstitution,
  ProjectInstitutionSource,
} from '../../domain/models/ProjectInstitution'
import type { IProjectInstitutionRepository } from '../../domain/repositories/IProjectInstitutionRepository'
import { requireSupabase } from './supabaseClient'

type Row = Record<string, any>

function toInstitution(row: Row): ProjectInstitution {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    projectSource: row.project_source === 'more_projects' ? 'more_projects' : 'projects',
    institutionName: row.institution_name ?? '',
    institutionLogoUrl: row.institution_logo_url ?? undefined,
    institutionUrl: row.institution_url ?? undefined,
    sortOrder: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 999,
    visible: row.visible ?? true,
  }
}

function toRow(value: Omit<ProjectInstitution, 'id'> | ProjectInstitution) {
  return {
    project_id: value.projectId,
    project_source: value.projectSource,
    institution_name: value.institutionName,
    institution_logo_url: value.institutionLogoUrl ?? null,
    institution_url: value.institutionUrl ?? null,
    sort_order: value.sortOrder,
    visible: value.visible,
    updated_at: new Date().toISOString(),
  }
}

export class SupabaseProjectInstitutionRepository
  implements IProjectInstitutionRepository {
  async getPublic(projectId: string, projectSource: ProjectInstitutionSource) {
    const { data, error } = await requireSupabase()
      .from('project_institutions')
      .select('*')
      .eq('project_id', projectId)
      .eq('project_source', projectSource)
      .eq('visible', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data ?? []).map(toInstitution)
  }

  async getAdmin(projectId: string, projectSource: ProjectInstitutionSource) {
    const { data, error } = await requireSupabase()
      .from('project_institutions')
      .select('*')
      .eq('project_id', projectId)
      .eq('project_source', projectSource)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data ?? []).map(toInstitution)
  }

  async create(value: Omit<ProjectInstitution, 'id'>) {
    const { data, error } = await requireSupabase()
      .from('project_institutions')
      .insert(toRow(value))
      .select('*')
      .single()

    if (error) throw error
    return toInstitution(data)
  }

  async update(value: ProjectInstitution) {
    const { data, error } = await requireSupabase()
      .from('project_institutions')
      .update(toRow(value))
      .eq('id', value.id)
      .select('*')
      .single()

    if (error) throw error
    return toInstitution(data)
  }

  async delete(id: string) {
    const { error } = await requireSupabase()
      .from('project_institutions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async reorder(values: Array<Pick<ProjectInstitution, 'id' | 'sortOrder'>>) {
    const supabase = requireSupabase()
    const results = await Promise.all(
      values.map(({ id, sortOrder }) =>
        supabase
          .from('project_institutions')
          .update({
            sort_order: sortOrder,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id),
      ),
    )
    const failed = results.find((result) => result.error)
    if (failed?.error) throw failed.error
  }
}
