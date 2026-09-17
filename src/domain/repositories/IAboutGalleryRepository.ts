import type {
  AboutGalleryCreateInput,
  AboutGalleryItem,
} from '../models/AboutGallery'

export interface IAboutGalleryRepository {
  getPublicAboutGallery(): Promise<AboutGalleryItem[]>
  getAdminAboutGallery(): Promise<AboutGalleryItem[]>
  createAboutGalleryItem(value: AboutGalleryCreateInput): Promise<AboutGalleryItem>
  updateAboutGalleryItem(value: AboutGalleryItem): Promise<AboutGalleryItem>
  deleteAboutGalleryItem(id: string): Promise<void>
  reorderAboutGallery(values: Array<Pick<AboutGalleryItem, 'id' | 'sortOrder'>>): Promise<void>
}
