import { getLocalAboutGallery } from '../../data/aboutGallery'

/** Read-only versioned gallery. Legacy repositories remain for historical
 * recovery tooling, but are not wired into the application. */
export class AboutGalleryService {
  async getPublicAboutGallery() { return getLocalAboutGallery() }
  async getAdminAboutGallery() { return getLocalAboutGallery(true) }
}
