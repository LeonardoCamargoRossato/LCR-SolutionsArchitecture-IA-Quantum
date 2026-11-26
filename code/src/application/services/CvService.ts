import { officialCvUrl } from '../../assets/public/officialCv'
import type { IContentRepository } from '../../domain/repositories/IContentRepository'
import type { IMediaRepository } from '../../domain/repositories/IMediaRepository'

/** The public PDF is versioned. Keep legacy repository contracts, never mutate them. */
export class CvService {
  constructor(_content: IContentRepository, _media: IMediaRepository) {}
  async getCurrentCv() { return officialCvUrl }
  async replaceCv(_file: File): Promise<string> { throw new Error('Official CV is versioned on GitHub.') }
  async removeCv(): Promise<void> { throw new Error('Official CV is versioned on GitHub.') }
  async downloadCv() { return officialCvUrl }
}
