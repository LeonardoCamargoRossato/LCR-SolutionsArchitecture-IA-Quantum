
import type { MediaAsset, MediaCategory } from '../../domain/models/MediaAsset'
import type { IMediaRepository } from '../../domain/repositories/IMediaRepository'
import {
  requireSupabase,
  supabaseMediaBucket,
} from './supabaseClient'
import { storagePathFromPublicUrl } from './helpers'

function safeBaseName(name: string) {
  const base = name.replace(/\.[^.]+$/, '')
  return base
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'media'
}

function extension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName) return fromName
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/png') return 'png'
  if (file.type === 'application/pdf') return 'pdf'
  return 'jpg'
}

function prefixFor(category: MediaCategory, requested?: string) {
  if (requested) {
    const clean = requested.replace(/^\/+|\/+$/g, '')
    if (clean.startsWith('projects/')) return clean
    if (clean === 'profile' || clean.startsWith('profile/')) return 'profile'
    if (clean === 'cv' || clean.startsWith('cv/')) return 'cv'
    if (clean === 'icons' || clean.startsWith('icons/')) return 'icons'
    return clean
  }

  if (category === 'Projects') return 'projects/misc'
  if (category === 'About') return 'profile'
  if (category === 'Documents') return 'cv'
  if (category === 'Icons') return 'icons'
  return 'misc'
}

function inferCategory(path: string): MediaCategory {
  if (path.startsWith('projects/')) return 'Projects'
  if (path.startsWith('profile/')) return 'About'
  if (path.startsWith('cv/')) return 'Documents'
  if (path.startsWith('icons/')) return 'Icons'
  return 'Other'
}

export class SupabaseMediaRepository implements IMediaRepository {
  private get storage() {
    return requireSupabase().storage.from(supabaseMediaBucket)
  }

  getPublicUrl(path: string) {
    return this.storage.getPublicUrl(path).data.publicUrl
  }

  async upload(
    file: File,
    category: MediaCategory,
    pathPrefix?: string,
  ): Promise<MediaAsset> {
    const prefix = prefixFor(category, pathPrefix)
    const path =
      `${prefix}/${Date.now()}-${crypto.randomUUID()}-${safeBaseName(file.name)}.${extension(file)}`

    const { error } = await this.storage.upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw error

    const url = this.getPublicUrl(path)
    if (!url) {
      await this.storage.remove([path]).catch(() => undefined)
      throw new Error('Upload concluído, mas não foi possível obter a URL pública.')
    }

    return {
      id: path,
      url,
      path,
      name: file.name,
      mimeType: file.type,
      category,
      createdAt: new Date().toISOString(),
      imageType: file.type.startsWith('image/')
        ? 'real-screenshot'
        : undefined,
    }
  }

  async replace(
    current: MediaAsset | undefined,
    file: File,
    category: MediaCategory,
    pathPrefix?: string,
  ) {
    const next = await this.upload(file, category, pathPrefix)

    if (current) {
      this.delete(current).catch((error) => {
        console.warn('Não foi possível remover a mídia anterior.', error)
      })
    }

    return next
  }

  async delete(asset: MediaAsset) {
    const path =
      asset.path && !asset.path.startsWith('http') && !asset.path.startsWith('./')
        ? asset.path
        : storagePathFromPublicUrl(asset.url)

    if (!path) return

    const { error } = await this.storage.remove([path])
    if (error) throw error
  }

  private async listRecursive(prefix: string): Promise<MediaAsset[]> {
    const result: MediaAsset[] = []
    const { data, error } = await this.storage.list(prefix, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (error) throw error

    for (const item of data ?? []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name

      if (!item.id) {
        result.push(...(await this.listRecursive(path)))
        continue
      }

      const url = this.getPublicUrl(path)
      result.push({
        id: path,
        url,
        path,
        name: item.name,
        mimeType: item.metadata?.mimetype ?? 'application/octet-stream',
        category: inferCategory(path),
        createdAt: item.created_at ?? undefined,
      })
    }

    return result
  }

  async getLibrary() {
    const folders = ['projects', 'profile', 'cv', 'icons', 'misc']
    const groups = await Promise.all(
      folders.map((folder) =>
        this.listRecursive(folder).catch((error) => {
          console.warn(`Não foi possível listar ${folder}.`, error)
          return []
        }),
      ),
    )
    return groups.flat()
  }
}
