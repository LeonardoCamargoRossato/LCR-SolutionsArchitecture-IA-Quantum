import type { AboutContent } from '../../domain/models/About'
import type {
  Capability,
  HomeContent,
  ResearchContent,
  SeoContent,
  SiteSettingsContent,
  SocialLink,
  WorkProcessStep,
} from '../../domain/models/SiteContent'
import type { IContentRepository } from '../../domain/repositories/IContentRepository'
import { cleanUndefined, mediaAssetFromUrl } from './helpers'
import { requireSupabase } from './supabaseClient'

const MAIN_ID = 'main'

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function normalizeItems(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function normalizeCapabilities(value: unknown): Capability[] {
  const source = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? ('title' in value ? [value] : Object.values(value as Record<string, unknown>))
      : []

  return source
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      title: stringValue(item.title),
      description: stringValue(item.description),
      items: normalizeItems(item.items),
    }))
    .filter((item) => item.title || item.description || item.items.length)
}

function normalizeWorkProcess(value: unknown): WorkProcessStep[] {
  const source = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? ('title' in value ? [value] : Object.values(value as Record<string, unknown>))
      : []

  return source
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item, index) => ({
      step: stringValue(item.step, String(index + 1).padStart(2, '0')),
      title: stringValue(item.title),
      description: stringValue(item.description),
    }))
    .filter((item) => item.title || item.description)
}

export class SupabaseContentRepository implements IContentRepository {
  async getHome(): Promise<HomeContent | null> {
    const { data, error } = await requireSupabase()
      .from('site_settings')
      .select('*')
      .eq('id', MAIN_ID)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    const en = (data.home_en ?? {}) as Partial<HomeContent>
    const pt = (data.home_pt ?? {}) as Partial<HomeContent>

    return {
      eyebrow: en.eyebrow ?? data.hero_name ?? 'LEONARDO ROSSATO',
      title: en.title ?? data.hero_title_en ?? '',
      highlightedWords: en.highlightedWords ?? '',
      description: en.description ?? data.hero_subtitle_en ?? '',
      focus: en.focus ?? '',
      skills: Array.isArray(en.skills) ? en.skills : [],
      translations: {
        'pt-BR': {
          ...pt,
          title: pt.title ?? data.hero_title_pt ?? en.title ?? data.hero_title_en ?? undefined,
          description: pt.description ?? data.hero_subtitle_pt ?? en.description ?? data.hero_subtitle_en ?? undefined,
          skills: Array.isArray(pt.skills) ? pt.skills : Array.isArray(en.skills) ? en.skills : [],
        },
      },
    }
  }

  async saveHome(value: HomeContent) {
    const pt = value.translations?.['pt-BR'] ?? {}
    const { error } = await requireSupabase().from('site_settings').upsert({
      id: MAIN_ID,
      hero_name: value.eyebrow,
      hero_title_en: value.title,
      hero_title_pt: pt.title ?? value.title,
      hero_subtitle_en: value.description,
      hero_subtitle_pt: pt.description ?? value.description,
      home_en: cleanUndefined({
        eyebrow: value.eyebrow,
        title: value.title,
        highlightedWords: value.highlightedWords,
        description: value.description,
        focus: value.focus,
        skills: value.skills,
      }),
      home_pt: cleanUndefined(pt),
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
  }

  async getAbout(): Promise<AboutContent | null> {
    const { data, error } = await requireSupabase()
      .from('about')
      .select('*')
      .eq('id', MAIN_ID)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    const en = (data.content_en ?? {}) as Partial<AboutContent>
    const pt = (data.content_pt ?? {}) as Partial<AboutContent>

    const professionalTitleEn =
      data.professional_title_en ?? en.professionalTitle ?? en.headline ?? ''
    const professionalTitlePt =
      data.professional_title_pt ?? pt.professionalTitle ?? pt.headline ?? professionalTitleEn
    const introEn = data.intro_en ?? en.intro ?? ''
    const introPt = data.intro_pt ?? pt.intro ?? introEn
    const valuePropositionEn = data.value_proposition_en ?? en.valueProposition ?? ''
    const valuePropositionPt = data.value_proposition_pt ?? pt.valueProposition ?? valuePropositionEn

    return {
      name: en.name ?? 'Leonardo Rossato',
      headline: professionalTitleEn,
      professionalTitle: professionalTitleEn,
      intro: introEn,
      valueProposition: valuePropositionEn,
      title: en.title,
      bio: Array.isArray(en.bio) ? en.bio : data.description_en ? [data.description_en] : [],
      location: en.location ?? '',
      email: en.email ?? 'leo.c.rossato@gmail.com',
      profileImage: mediaAssetFromUrl(data.profile_image_url, 'About', 'profile-image'),
      experiences: Array.isArray(en.experiences) ? en.experiences : [],
      education: Array.isArray(en.education) ? en.education : [],
      researchTimeline: Array.isArray(en.researchTimeline) ? en.researchTimeline : [],
      areas: Array.isArray(en.areas) ? en.areas : [],
      publications: Array.isArray(en.publications) ? en.publications : [],
      scienceCommunication: en.scienceCommunication ?? '',
      speakerPortfolioUrl: en.speakerPortfolioUrl ?? '',
      contentBlocks: Array.isArray(en.contentBlocks) ? en.contentBlocks : [],
      translations: {
        'pt-BR': {
          ...pt,
          headline: professionalTitlePt,
          professionalTitle: professionalTitlePt,
          intro: introPt,
          valueProposition: valuePropositionPt,
          bio: Array.isArray(pt.bio)
            ? pt.bio
            : data.description_pt
              ? [data.description_pt]
              : Array.isArray(en.bio)
                ? en.bio
                : [],
          areas: Array.isArray(pt.areas)
            ? pt.areas
            : Array.isArray(en.areas)
              ? en.areas
              : [],
        },
      },
    }
  }

  async saveAbout(value: AboutContent) {
    const pt = value.translations?.['pt-BR'] ?? {}
    const { error } = await requireSupabase().from('about').upsert({
      id: MAIN_ID,
      description_en: value.bio.join('\n\n'),
      description_pt: pt.bio?.join('\n\n') ?? value.bio.join('\n\n'),
      profile_image_url: value.profileImage?.url ?? null,
      content_en: cleanUndefined({
        ...value,
        profileImage: undefined,
        translations: undefined,
      }),
      content_pt: cleanUndefined(pt),
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
  }

  async getResearch(): Promise<ResearchContent | null> {
    const { data, error } = await requireSupabase()
      .from('site_settings')
      .select('research_en')
      .eq('id', MAIN_ID)
      .maybeSingle()
    if (error) throw error
    return (data?.research_en as ResearchContent | null) ?? null
  }

  async saveResearch(value: ResearchContent) {
    const { error } = await requireSupabase().from('site_settings').upsert({
      id: MAIN_ID,
      research_en: cleanUndefined(value),
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
  }

  async getSiteSettings(): Promise<SiteSettingsContent | null> {
    const { data, error } = await requireSupabase()
      .from('site_settings')
      .select(`
        footer_tagline_en,
        footer_tagline_pt,
        contact_intro_en,
        contact_intro_pt,
        projects_intro_en,
        projects_intro_pt,
        architecture_statement_en,
        architecture_statement_pt,
        capabilities_en,
        capabilities_pt,
        work_process_en,
        work_process_pt,
        main_card_scale,
        more_card_scale
      `)
      .eq('id', MAIN_ID)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    const capabilitiesEn = normalizeCapabilities(data.capabilities_en)
    const capabilitiesPt = normalizeCapabilities(data.capabilities_pt)
    const workProcessEn = normalizeWorkProcess(data.work_process_en)
    const workProcessPt = normalizeWorkProcess(data.work_process_pt)

    return {
      footerTagline: data.footer_tagline_en ?? data.footer_tagline_pt ?? '',
      contactIntro: data.contact_intro_en ?? data.contact_intro_pt ?? '',
      projectsIntro: data.projects_intro_en ?? data.projects_intro_pt ?? '',
      architectureStatement:
        data.architecture_statement_en ?? data.architecture_statement_pt ?? '',
      capabilities: capabilitiesEn.length ? capabilitiesEn : capabilitiesPt,
      workProcess: workProcessEn.length ? workProcessEn : workProcessPt,
      mainCardScale: Math.min(130, Math.max(70, Number(data.main_card_scale) || 100)),
      moreCardScale: Math.min(130, Math.max(70, Number(data.more_card_scale) || 100)),
      translations: {
        'pt-BR': {
          footerTagline: data.footer_tagline_pt ?? data.footer_tagline_en ?? '',
          contactIntro: data.contact_intro_pt ?? data.contact_intro_en ?? '',
          projectsIntro: data.projects_intro_pt ?? data.projects_intro_en ?? '',
          architectureStatement:
            data.architecture_statement_pt ?? data.architecture_statement_en ?? '',
          capabilities: capabilitiesPt.length ? capabilitiesPt : capabilitiesEn,
          workProcess: workProcessPt.length ? workProcessPt : workProcessEn,
        },
      },
    }
  }

  async saveSiteSettings(value: SiteSettingsContent) {
    const clamp = (input: number) => Math.min(130, Math.max(70, Math.round(input || 100)))
    const { error } = await requireSupabase()
      .from('site_settings')
      .update({
        main_card_scale: clamp(value.mainCardScale),
        more_card_scale: clamp(value.moreCardScale),
        updated_at: new Date().toISOString(),
      })
      .eq('id', MAIN_ID)
    if (error) throw error
  }

  async getSocialLinks(): Promise<SocialLink[] | null> {
    const { data, error } = await requireSupabase()
      .from('social_links')
      .select('*')
      .order('sort_order')
    if (error) throw error
    if (!data?.length) return null

    return data.map((item) => ({
      id: item.id,
      platform: item.platform,
      label: item.label ?? item.platform,
      url: item.url,
      icon: item.icon ?? item.platform.toLowerCase(),
      visible: item.visible,
      order: item.sort_order,
    }))
  }

  async saveSocialLinks(values: SocialLink[]) {
    const rows = values.map((item) => ({
      id: item.id,
      platform: item.platform,
      label: item.label,
      url: item.url,
      icon: item.icon,
      visible: item.visible,
      sort_order: item.order,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await requireSupabase()
      .from('social_links')
      .upsert(rows, { onConflict: 'id' })
    if (error) throw error
  }

  async getSeo(): Promise<SeoContent | null> {
    const { data, error } = await requireSupabase()
      .from('seo')
      .select('*')
      .eq('id', MAIN_ID)
      .maybeSingle()
    if (error) throw error
    if (!data) return null

    return {
      siteTitle: data.site_title ?? '',
      metaDescription: data.meta_description ?? '',
      ogTitle: data.og_title ?? '',
      ogDescription: data.og_description ?? '',
      ogImage: data.og_image ?? undefined,
      faviconUrl: data.favicon_url ?? undefined,
    }
  }

  async saveSeo(value: SeoContent) {
    const { error } = await requireSupabase().from('seo').upsert({
      id: MAIN_ID,
      site_title: value.siteTitle,
      meta_description: value.metaDescription,
      og_title: value.ogTitle,
      og_description: value.ogDescription,
      og_image: value.ogImage ?? null,
      favicon_url: value.faviconUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
  }

  async getCvUrl() {
    const { data, error } = await requireSupabase()
      .from('about')
      .select('cv_url')
      .eq('id', MAIN_ID)
      .maybeSingle()
    if (error) throw error
    return data?.cv_url ?? null
  }

  async saveCvUrl(url: string) {
    const { error } = await requireSupabase().from('about').upsert({
      id: MAIN_ID,
      cv_url: url,
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
  }

  async removeCvUrl() {
    const { error } = await requireSupabase()
      .from('about')
      .update({ cv_url: null, updated_at: new Date().toISOString() })
      .eq('id', MAIN_ID)
    if (error) throw error
  }
}
