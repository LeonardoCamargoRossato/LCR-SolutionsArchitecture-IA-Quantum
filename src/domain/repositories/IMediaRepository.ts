import type { MediaAsset, MediaCategory } from '../models/MediaAsset'

export interface IMediaRepository {
  upload(file: File, category: MediaCategory, pathPrefix?: string): Promise<MediaAsset>
  replace(current: MediaAsset | undefined, file: File, category: MediaCategory, pathPrefix?: string): Promise<MediaAsset>
  delete(asset: MediaAsset): Promise<void>
  getLibrary(): Promise<MediaAsset[]>
  getPublicUrl(path: string): string
}
