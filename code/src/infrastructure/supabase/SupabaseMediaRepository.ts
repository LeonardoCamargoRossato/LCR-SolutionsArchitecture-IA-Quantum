import { isProtectedLegacyMedia } from '../../assets/public/protectedLegacyMedia'

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
  if (file.type === 'image/svg+xml') return 'svg'
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

  /** Save a photo + full-size PNG + optimized WebP as one logical gallery asset.
   *  Editorial imageUrl keeps the uploaded photographic original for rollback;
   *  readers resolve matching derived variants from storagePath.
   */
  async uploadAboutGalleryPhoto(file: File): Promise<MediaAsset> {
    const mime = file.type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
      throw new Error('Galeria: somente arquivos JPG, PNG ou WebP são aceitos.')
    }

    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d')
    if (!context) {
      bitmap.close()
      throw new Error('Conversão PNG/WebP indisponível neste navegador.')
    }
    context.drawImage(bitmap, 0, 0)
    bitmap.close()

    const convert = (type: 'image/png' | 'image/webp') =>
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (!result || result.type !== type) {
            reject(new Error('Não foi possível gerar a versão ' + type))
          } else {
            resolve(result)
          }
        }, type, type === 'image/webp' ? 0.82 : undefined)
      })

    // Never overwrite or delete previously uploaded gallery photographs.
    const pngBlob = mime === 'image/png' ? file : await convert('image/png')
    const webpBlob = await convert('image/webp')
    const stem = Date.now() + '-' + crypto.randomUUID() + '-' + safeBaseName(file.name)
    const originalExtension = mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp'
    const originalPath = 'about/gallery/' + stem + '.' + originalExtension
    const pngPath = 'about/gallery/PNG/' + stem + '.png'
    const webpPath = 'about/gallery/WebP/' + stem + '.webp'
    const uploaded: string[] = []

    try {
      for (const [path, blob, type] of [
        [originalPath, file, mime],
        [pngPath, pngBlob, 'image/png'],
        [webpPath, webpBlob, 'image/webp'],
      ] as Array<[string, Blob, string]>) {
        const { error } = await this.storage.upload(path, blob, {
          contentType: type, cacheControl: '3600', upsert: false,
        })
        if (error) throw error
        uploaded.push(path)
      }

      const [originalRead, pngRead, webpRead] = await Promise.all(
        [originalPath, pngPath, webpPath].map(async (path) => {
          const { data, error } = await this.storage.download(path)
          if (error || !data) throw error || new Error('Storage read-back missing: ' + path)
          return data
        }),
      )
      const hash = async (data: ArrayBuffer) =>
        Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data))).join(',')
      if (await hash(await file.arrayBuffer()) !== await hash(await originalRead.arrayBuffer())) {
        throw new Error('A fotografia original foi alterada durante o envio.')
      }
      if (await hash(await pngBlob.arrayBuffer()) !== await hash(await pngRead.arrayBuffer())) {
        throw new Error('A cópia PNG não corresponde à versão enviada.')
      }
      if (await hash(await webpBlob.arrayBuffer()) !== await hash(await webpRead.arrayBuffer())) {
        throw new Error('A versão WebP não corresponde à versão enviada.')
      }

      const pngImage = await createImageBitmap(pngRead)
      const webpImage = await createImageBitmap(webpRead)
      try {
        if (
          pngImage.width !== canvas.width || pngImage.height !== canvas.height ||
          webpImage.width !== canvas.width || webpImage.height !== canvas.height
        ) {
          throw new Error('As dimensões das fotografias não foram preservadas.')
        }
      } finally {
        pngImage.close()
        webpImage.close()
      }
      const url = this.getPublicUrl(originalPath)
      return {
        id: originalPath, path: originalPath, url,
        cardUrl: this.getPublicUrl(webpPath),
        fullUrl: this.getPublicUrl(pngPath),
        name: file.name, mimeType: mime, category: 'About',
        imageType: 'real-screenshot', createdAt: new Date().toISOString(),
      }
    } catch (error) {
      // Roll back only uniquely named paths created by THIS incomplete upload.
      // Never touch files from earlier requests or the 12 migrated originals.
      if (uploaded.length) await this.storage.remove(uploaded).catch(() => undefined)
      throw error
    }
  }

  // Each cover is an immutable PNG original and its optimized WebP pair.
  // Only new paths created by a failed upload may be cleaned up.
  async uploadProjectCover(file: File, slug: string): Promise<MediaAsset> {
    if (file.type !== 'image/png') {
      throw new Error('Project cover must be a PNG original.')
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error('Invalid project slug for cover upload.')
    }

    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d')
    if (!context) {
      bitmap.close()
      throw new Error('Canvas conversion is unavailable.')
    }
    context.drawImage(bitmap, 0, 0)
    bitmap.close()
    const webpBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob?.type === 'image/webp') resolve(blob)
        else reject(new Error('WebP conversion is unavailable.'))
      }, 'image/webp', 0.82)
    })

    const name = Date.now() + '-' + crypto.randomUUID() + '-' + safeBaseName(file.name)
    const pngPath = 'projects/' + slug + '/PNG/' + name + '.png'
    const webpPath = 'projects/' + slug + '/WebP/' + name + '.webp'
    const uploaded: string[] = []
    try {
      const { error: pngError } = await this.storage.upload(pngPath, file, {
        contentType: 'image/png', cacheControl: '3600', upsert: false,
      })
      if (pngError) throw pngError
      uploaded.push(pngPath)

      const { error: webpError } = await this.storage.upload(webpPath, webpBlob, {
        contentType: 'image/webp', cacheControl: '3600', upsert: false,
      })
      if (webpError) throw webpError
      uploaded.push(webpPath)

      const { data: pngRead, error: pngReadError } = await this.storage.download(pngPath)
      if (pngReadError || !pngRead) throw pngReadError || new Error('PNG verification failed')
      const [sourceHash, uploadedHash] = await Promise.all([
        crypto.subtle.digest('SHA-256', await file.arrayBuffer()),
        crypto.subtle.digest('SHA-256', await pngRead.arrayBuffer()),
      ])
      const sourceBytes = new Uint8Array(sourceHash)
      const uploadedBytes = new Uint8Array(uploadedHash)
      if (!sourceBytes.every((byte, index) => byte === uploadedBytes[index])) {
        throw new Error('PNG checksum verification failed.')
      }

      const { data: webpRead, error: webpReadError } = await this.storage.download(webpPath)
      if (webpReadError || !webpRead) throw webpReadError || new Error('WebP verification failed')
      const webpBytes = new Uint8Array(await webpRead.arrayBuffer())
      if (
        String.fromCharCode(...webpBytes.slice(0, 4)) !== 'RIFF' ||
        String.fromCharCode(...webpBytes.slice(8, 12)) !== 'WEBP'
      ) throw new Error('Invalid WebP signature.')
      const webpImage = await createImageBitmap(webpRead)
      const validDimensions = webpImage.width === canvas.width && webpImage.height === canvas.height
      webpImage.close()
      if (!validDimensions) throw new Error('WebP dimensions mismatch.')

      const url = this.getPublicUrl(pngPath)
      const cardUrl = this.getPublicUrl(webpPath)
      return {
        id: pngPath,
        url, path: pngPath, cardUrl, thumbnailUrl: cardUrl, fullUrl: url,
        name: file.name, mimeType: 'image/png', category: 'Projects',
        imageType: 'real-screenshot', createdAt: new Date().toISOString(),
      }
    } catch (error) {
      // Never touch old or shared assets.
      if (uploaded.length) await this.storage.remove(uploaded).catch(() => undefined)
      throw error
    }
  }

  async replace(
    current: MediaAsset | undefined,
    file: File,
    category: MediaCategory,
    pathPrefix?: string,
  ) {
    // Do not automatically delete previous media; it may still be referenced.
    void current
    return this.upload(file, category, pathPrefix)
  }

  async delete(asset: MediaAsset) {
    const path =
      asset.path && !asset.path.startsWith('http') && !asset.path.startsWith('./')
        ? asset.path
        : storagePathFromPublicUrl(asset.url)

    if (!path) return
    if (isProtectedLegacyMedia({path,url:asset.url})) throw new Error('Versioned media: legacy source is protected.')

    // Protect canonical and legacy project covers from accidental deletion.
    // Files are only retired through an explicitly audited migration/cleanup.
    if (
      /^projects\/[^/]+\/(?:PNG|WebP)\/[^/]+\.(?:png|webp)$/i.test(path) ||
      /^projects\/[^/]+\/[^/]+\.png$/i.test(path) ||
      /^about\/gallery\/(?:PNG\/[^/]+\.png|WebP\/[^/]+\.webp|[^/]+\.(?:jpe?g|png|webp))$/i.test(path)
    ) {
      throw new Error('Capa protegida: primeiro audite todas as referências antes de excluir.')
    }

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
    const folders = ['projects', 'profile', 'cv', 'icons', 'site-assets', 'misc']
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
