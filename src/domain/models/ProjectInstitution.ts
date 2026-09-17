export type ProjectInstitutionSource = 'projects' | 'more_projects'

export type ProjectInstitution = {
  id: string
  projectId: string
  projectSource: ProjectInstitutionSource
  institutionName: string
  institutionLogoUrl?: string
  institutionUrl?: string
  sortOrder: number
  visible: boolean
}
