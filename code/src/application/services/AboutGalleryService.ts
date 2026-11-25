import type {
  AboutGalleryCreateInput,
  AboutGalleryItem,
} from '../../domain/models/AboutGallery'
import type { IAboutGalleryRepository } from '../../domain/repositories/IAboutGalleryRepository'

export class AboutGalleryService {
  constructor(private repo: IAboutGalleryRepository) {}

  getPublicAboutGallery() {
    return this.repo.getPublicAboutGallery()
  }

  getAdminAboutGallery() {
    return this.repo.getAdminAboutGallery()
  }

  createAboutGalleryItem(value: AboutGalleryCreateInput) {
    return this.repo.createAboutGalleryItem(value)
  }

  updateAboutGalleryItem(value: AboutGalleryItem) {
    return this.repo.updateAboutGalleryItem(value)
  }

  deleteAboutGalleryItem(id: string) {
    return this.repo.deleteAboutGalleryItem(id)
  }

  reorderAboutGallery(values: Array<Pick<AboutGalleryItem, 'id' | 'sortOrder'>>) {
    return this.repo.reorderAboutGallery(values)
  }
}
