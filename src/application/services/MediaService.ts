import type { MediaCategory } from '../../domain/models/MediaAsset'
import type { IMediaRepository } from '../../domain/repositories/IMediaRepository'

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE = 8 * 1024 * 1024
const MAX_DOCUMENT = 12 * 1024 * 1024

export class MediaService {
  constructor(private repo: IMediaRepository) {}

  validateImage(file: File) {
    if (!IMAGE_TYPES.includes(file.type)) throw new Error('Formato não suportado. Use PNG, JPG, JPEG ou WEBP.')
    if (file.size > MAX_IMAGE) throw new Error('Arquivo excede o limite permitido de 8 MB.')
  }

  validatePdf(file: File) {
    if (file.type !== 'application/pdf') throw new Error('Formato não suportado. Envie um arquivo PDF.')
    if (file.size > MAX_DOCUMENT) throw new Error('Arquivo excede o limite permitido de 12 MB.')
  }

  async upload(file: File, category: MediaCategory, pathPrefix?: string) {
    if (category === 'Documents') this.validatePdf(file)
    else if (category === 'Projects' || category === 'About' || category === 'Icons') this.validateImage(file)
    return this.repo.upload(file, category, pathPrefix)
  }

  async replace(current: Parameters<IMediaRepository['replace']>[0], file: File, category: MediaCategory, pathPrefix?: string) {
    if (category === 'Documents') this.validatePdf(file)
    else this.validateImage(file)
    return this.repo.replace(current, file, category, pathPrefix)
  }

  delete(...args: Parameters<IMediaRepository['delete']>) { return this.repo.delete(...args) }
  getLibrary() { return this.repo.getLibrary() }
  getPublicUrl(path: string) { return this.repo.getPublicUrl(path) }
}
