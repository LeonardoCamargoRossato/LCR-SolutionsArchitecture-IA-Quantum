import type {
  AboutGalleryCreateInput,
  AboutGalleryItem,
  AboutGalleryLinkType,
} from '../../domain/models/AboutGallery'
import type { IAboutGalleryRepository } from '../../domain/repositories/IAboutGalleryRepository'
import { requireSupabase } from './supabaseClient'

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function linkType(value: unknown): AboutGalleryLinkType {
  return value === 'speaker_portfolio' ||
    value === 'instituto_pense_mais' ||
    value === 'custom'
    ? value
    : 'none'
}

function toItem(row: Record<string, any>): AboutGalleryItem {
  return {
    id: String(row.id),
    imageUrl: text(row.image_url) ?? '',
    storagePath: text(row.storage_path),
    titlePt: text(row.title_pt),
    titleEn: text(row.title_en),
    descriptionPt: text(row.description_pt),
    descriptionEn: text(row.description_en),
    captionPt: text(row.caption_pt),
    captionEn: text(row.caption_en),
    locationPt: text(row.location_pt),
    locationEn: text(row.location_en),
    eventDate: text(row.event_date),
    externalUrl: text(row.external_url),
    linkType: linkType(row.link_type),
    visible: row.visible ?? true,
    sortOrder: Number.isFinite(Number(row.sort_order))
      ? Number(row.sort_order)
      : 999,
  }
}

function toRow(value: AboutGalleryCreateInput | AboutGalleryItem) {
  return {
    image_url: value.imageUrl,
    storage_path: value.storagePath ?? null,
    title_pt: value.titlePt ?? null,
    title_en: value.titleEn ?? null,
    description_pt: value.descriptionPt ?? null,
    description_en: value.descriptionEn ?? null,
    caption_pt: value.captionPt ?? null,
    caption_en: value.captionEn ?? null,
    location_pt: value.locationPt ?? null,
    location_en: value.locationEn ?? null,
    event_date: value.eventDate || null,
    external_url: value.externalUrl ?? null,
    link_type: value.linkType,
    visible: value.visible,
    sort_order: value.sortOrder,
    updated_at: new Date().toISOString(),
  }
}

export class SupabaseAboutGalleryRepository
  implements IAboutGalleryRepository {
  async getPublicAboutGallery() {
    const { data, error } = await requireSupabase()
      .from('about_gallery')
      .select('*')
      .eq('visible', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data ?? []).map((row) => toItem(row))
  }

  async getAdminAboutGallery() {
    const { data, error } = await requireSupabase()
      .from('about_gallery')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data ?? []).map((row) => toItem(row))
  }

  async createAboutGalleryItem(value: AboutGalleryCreateInput) {
    const { data, error } = await requireSupabase()
      .from('about_gallery')
      .insert(toRow(value))
      .select('*')
      .single()

    if (error) throw error
    return toItem(data)
  }

  async updateAboutGalleryItem(value: AboutGalleryItem) {
    const { data, error } = await requireSupabase()
      .from('about_gallery')
      .update(toRow(value))
      .eq('id', value.id)
      .select('*')
      .single()

    if (error) throw error
    return toItem(data)
  }

  async deleteAboutGalleryItem(id: string) {
    const { error } = await requireSupabase()
      .from('about_gallery')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async reorderAboutGallery(
    values: Array<Pick<AboutGalleryItem, 'id' | 'sortOrder'>>,
  ) {
    const supabase = requireSupabase()
    const results = await Promise.all(
      values.map(({ id, sortOrder }) =>
        supabase
          .from('about_gallery')
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
