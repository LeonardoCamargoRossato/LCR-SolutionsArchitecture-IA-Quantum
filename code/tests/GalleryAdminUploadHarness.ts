import { SupabaseMediaRepository } from '../src/infrastructure/supabase/SupabaseMediaRepository'

async function demo() {
  const canvas = document.createElement('canvas')
  canvas.width = 160
  canvas.height = 100
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No 2D canvas')
  context.fillStyle = '#2563eb'
  context.fillRect(0, 0, 160, 100)
  context.fillStyle = '#ffffff'
  context.fillRect(30, 20, 60, 50)
  const jpg = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No JPEG')), 'image/jpeg', 0.9))
  const file = new File([jpg], 'Gallery-Sample.jpg', { type: 'image/jpeg' })
  const asset = await new SupabaseMediaRepository().uploadAboutGalleryPhoto(file)
  if (!asset.path.startsWith('about/gallery/') || !asset.path.endsWith('.jpg')) throw new Error('Missing original')
  if (!asset.cardUrl?.includes('/WebP/') || !asset.cardUrl.endsWith('.webp')) throw new Error('Missing WebP')
  if (!asset.fullUrl?.includes('/PNG/') || !asset.fullUrl.endsWith('.png')) throw new Error('Missing PNG')
  document.getElementById('result')!.textContent = 'PASS:' + [asset.path, asset.cardUrl, asset.fullUrl].join('|')
}
demo().catch(error => {
  document.getElementById('result')!.textContent = 'FAIL:' + String(error)
})
