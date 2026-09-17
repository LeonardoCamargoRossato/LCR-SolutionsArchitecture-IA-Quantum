import type {
  Project,
  ProjectPlacement,
  ProjectSource,
} from '../../domain/models/Project'
import type { IProjectRepository } from '../../domain/repositories/IProjectRepository'
import { cleanUndefined, mediaAssetFromUrl } from './helpers'
import { requireSupabase } from './supabaseClient'

type Row = Record<string, any>

function normalizePlacement(value: unknown, fallback: ProjectPlacement): ProjectPlacement {
  return value === 'main' || value === 'more' ? value : fallback
}

function toProject(row: Row, source: ProjectSource): Project {
  const isMainSource = source === 'main'
  const technologies = Array.isArray(row.technologies) ? row.technologies : []
  const gallery = Array.isArray(row.gallery) ? row.gallery : []
  const sectionsEn = row.sections_en ?? row.sections_pt ?? {}
  const sectionsPt = row.sections_pt ?? row.sections_en ?? {}
  const sortOrder = Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 999
  const placement = normalizePlacement(row.placement, isMainSource ? 'main' : 'more')

  return {
    id: row.id,
    slug: row.slug ?? row.id,
    title: row.title_en ?? row.title_pt ?? '',
    subtitle: row.subtitle_en ?? row.subtitle_pt ?? undefined,
    category: row.category_en ?? row.category_pt ?? '',
    status: isMainSource
      ? (row.status ?? 'Live')
      : (row.status_en ?? row.status_pt ?? row.status ?? 'Case Study in Progress'),
    description: isMainSource
      ? (row.short_description_en ?? row.short_description_pt ?? '')
      : (row.description_en ?? row.description_pt ?? ''),
    technologies,
    coverImage: mediaAssetFromUrl(
      isMainSource ? row.cover_url : (row.image_url ?? row.icon_url),
      isMainSource ? 'Projects' : 'Icons',
      isMainSource ? `${row.slug}-cover` : `${row.id}-image`,
    ),
    imageType: (isMainSource ? row.cover_url : (row.image_url ?? row.icon_url))
      ? 'real-screenshot'
      : 'illustrative-placeholder',
    sections: sectionsEn,
    links: {
      liveUrl: isMainSource
        ? (row.external_url ?? undefined)
        : (row.project_url ?? row.external_url ?? undefined),
      githubUrl: row.github_url ?? undefined,
      researchUrl: row.research_url ?? undefined,
      institutionUrl: row.institution_url ?? undefined,
    },
    gallery,
    order: sortOrder,
    sortOrder,
    visible: row.visible ?? true,
    placement,
    source,
    featured: row.featured ?? false,
    badge: row.badge ?? undefined,
    theme: 'default',
    year: row.year ?? undefined,
    // Legacy group/source flag. Placement and case availability are independent.
    caseStudy: isMainSource,
    caseEnabled: row.case_enabled ?? true,
    isAcademic: row.is_academic ?? false,
    institutionName: row.institution_name ?? undefined,
    institutionLogoUrl: row.institution_logo_url ?? undefined,
    reportPdfUrl: row.report_pdf_url ?? undefined,
    reportTitle: row.report_title_en ?? row.report_title_pt ?? undefined,
    academicContext: row.academic_context_en ?? row.academic_context_pt ?? undefined,
    translations: {
      'pt-BR': {
        title: row.title_pt ?? row.title_en ?? '',
        subtitle: row.subtitle_pt ?? row.subtitle_en ?? undefined,
        category: row.category_pt ?? row.category_en ?? '',
        status: isMainSource
          ? (row.status ?? undefined)
          : (row.status_pt ?? row.status_en ?? row.status ?? undefined),
        description: isMainSource
          ? (row.short_description_pt ?? row.short_description_en ?? '')
          : (row.description_pt ?? row.description_en ?? ''),
        technologies,
        sections: sectionsPt,
        reportTitle: row.report_title_pt ?? row.report_title_en ?? undefined,
        academicContext: row.academic_context_pt ?? row.academic_context_en ?? undefined,
      },
    },
  }
}


function sectionPlainText(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .join('\n\n')
  }
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>
    const body = source.body ?? source.content ?? source.description ?? source.text
    if (typeof body === 'string') return body
    if (Array.isArray(body)) {
      return body
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .join('\n\n')
    }
  }
  return ''
}

function editorialOrder(project: Project) {
  return Number.isFinite(Number(project.sortOrder))
    ? Number(project.sortOrder)
    : Number.isFinite(Number(project.order))
      ? Number(project.order)
      : 999
}

function mainRow(project: Project) {
  const pt = project.translations?.['pt-BR'] ?? {}
  const sortOrder = editorialOrder(project)
  return cleanUndefined({
    id: project.id,
    slug: project.slug,
    sort_order: sortOrder,
    placement: project.placement ?? 'main',
    visible: project.visible ?? true,
    title_en: project.title,
    title_pt: pt.title ?? project.title,
    subtitle_en: project.subtitle ?? null,
    subtitle_pt: pt.subtitle ?? project.subtitle ?? null,
    category_en: project.category,
    category_pt: pt.category ?? project.category,
    short_description_en: project.description,
    short_description_pt: pt.description ?? project.description,
    full_description_en: sectionPlainText(project.sections.overview),
    full_description_pt: sectionPlainText(pt.sections?.overview),
    sections_en: project.sections,
    sections_pt: pt.sections ?? {},
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    external_url: project.links.liveUrl ?? null,
    github_url: project.links.githubUrl ?? null,
    research_url: project.links.researchUrl ?? null,
    institution_url: project.links.institutionUrl ?? null,
    is_academic: project.isAcademic ?? false,
    institution_name: project.institutionName ?? null,
    institution_logo_url: project.institutionLogoUrl ?? null,
    report_pdf_url: project.reportPdfUrl ?? null,
    report_title_en: project.reportTitle ?? null,
    report_title_pt: pt.reportTitle ?? project.reportTitle ?? null,
    academic_context_en: project.academicContext ?? null,
    academic_context_pt: pt.academicContext ?? project.academicContext ?? null,
    cover_url: project.coverImage?.url ?? null,
    status: project.status,
    featured: project.featured ?? false,
    badge: project.badge ?? null,
    year: project.year ?? null,
    gallery: Array.isArray(project.gallery) ? project.gallery : [],
    updated_at: new Date().toISOString(),
  })
}

function moreRow(project: Project) {
  const pt = project.translations?.['pt-BR'] ?? {}
  const sortOrder = editorialOrder(project)
  return cleanUndefined({
    id: project.id,
    slug: project.slug,
    title_en: project.title,
    title_pt: pt.title ?? project.title,
    description_en: project.description,
    description_pt: pt.description ?? project.description,
    category_en: project.category,
    category_pt: pt.category ?? project.category,
    subtitle_en: project.subtitle ?? null,
    subtitle_pt: pt.subtitle ?? project.subtitle ?? null,
    status_en: project.status,
    status_pt: pt.status ?? project.status,
    sections_en: project.sections ?? {},
    sections_pt: pt.sections ?? {},
    case_enabled: project.caseEnabled ?? true,
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    image_url: project.coverImage?.url ?? null,
    project_url: project.links.liveUrl ?? null,
    github_url: project.links.githubUrl ?? null,
    institution_url: project.links.institutionUrl ?? null,
    is_academic: project.isAcademic ?? false,
    institution_name: project.institutionName ?? null,
    institution_logo_url: project.institutionLogoUrl ?? null,
    report_pdf_url: project.reportPdfUrl ?? null,
    report_title_en: project.reportTitle ?? null,
    report_title_pt: pt.reportTitle ?? project.reportTitle ?? null,
    academic_context_en: project.academicContext ?? null,
    academic_context_pt: pt.academicContext ?? project.academicContext ?? null,
    visible: project.visible ?? true,
    placement: project.placement ?? 'more',
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  })
}

function sortProjects(items: Project[]) {
  return [...items].sort((a, b) => {
    const placementA = a.placement ?? (a.caseStudy ? 'main' : 'more')
    const placementB = b.placement ?? (b.caseStudy ? 'main' : 'more')
    if (placementA !== placementB) return placementA === 'main' ? -1 : 1
    return editorialOrder(a) - editorialOrder(b)
  })
}

export class SupabaseProjectRepository implements IProjectRepository {
  private async load(includeHidden: boolean) {
    const supabase = requireSupabase()
    let mainQuery = supabase.from('projects').select('*')
    let moreQuery = supabase.from('more_projects').select('*')

    if (!includeHidden) {
      mainQuery = mainQuery.eq('visible', true)
      moreQuery = moreQuery.eq('visible', true)
    }

    const [main, more] = await Promise.all([
      mainQuery.order('sort_order'),
      moreQuery.order('sort_order'),
    ])

    if (main.error) throw main.error
    if (more.error) throw more.error

    return sortProjects([
      ...(main.data ?? []).map((row) => toProject(row, 'main')),
      ...(more.data ?? []).map((row) => toProject(row, 'more')),
    ])
  }

  getAll() { return this.load(false) }
  getAllForAdmin() { return this.load(true) }

  async getBySlug(slug: string, includeHidden = false) {
    const all = await this.load(includeHidden)
    return all.find((item) => item.slug === slug) ?? null
  }

  async update(project: Project) {
    const supabase = requireSupabase()
    // Placement never moves records between physical tables.
    const source = project.source ?? (project.caseStudy ? 'main' : 'more')
    if (source === 'main') {
      const { error } = await supabase
        .from('projects')
        .upsert(mainRow(project), { onConflict: 'id' })
      if (error) throw error
      return
    }

    const { error } = await supabase
      .from('more_projects')
      .upsert(moreRow(project), { onConflict: 'id' })
    if (error) throw error
  }

  create(project: Project) { return this.update(project) }

  async delete(id: string) {
    const supabase = requireSupabase()
    const main = await supabase.from('projects').delete().eq('id', id)
    if (main.error) throw main.error
    const more = await supabase.from('more_projects').delete().eq('id', id)
    if (more.error) throw more.error
  }
}
