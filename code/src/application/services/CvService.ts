
import type { IContentRepository } from '../../domain/repositories/IContentRepository'
import type { IMediaRepository } from '../../domain/repositories/IMediaRepository'

export class CvService {
  constructor(
    private content: IContentRepository,
    private media: IMediaRepository,
  ) {}

  getCurrentCv() {
    return this.content.getCvUrl()
  }

  async replaceCv(file: File) {
    if (file.type !== 'application/pdf') {
      throw new Error('Formato não suportado. Envie um arquivo PDF.')
    }
    if (file.size > 12 * 1024 * 1024) {
      throw new Error('Arquivo excede o limite permitido de 12 MB.')
    }

    const previousUrl = await this.content.getCvUrl().catch(() => null)
    const previousAsset = previousUrl
      ? (await this.media.getLibrary().catch(() => [])).find(
          (item) => item.url === previousUrl,
        )
      : undefined

    const asset = await this.media.upload(file, 'Documents', 'cv')

    try {
      await this.content.saveCvUrl(asset.url)
    } catch (error) {
      await this.media.delete(asset).catch(() => undefined)
      throw error
    }

    if (previousAsset) {
      this.media.delete(previousAsset).catch((error) => {
        console.warn('Não foi possível remover o CV anterior.', error)
      })
    }

    return asset.url
  }

  async removeCv() {
    await this.content.removeCvUrl()
  }

  async downloadCv() {
    const url = await this.getCurrentCv()
    if (!url) throw new Error('Currículo não disponível.')
    return url
  }
}
