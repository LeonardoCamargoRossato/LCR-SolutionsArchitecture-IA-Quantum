/** Only local raster formats are accepted. SVG and active content are prohibited. */
export type AcceptedImage = { file: File; width: number; height: number; preview: string }
const TYPES = new Set(['image/png','image/jpeg','image/webp'])
const MAX_BYTES = 12 * 1024 * 1024

export async function validateBackground(file: File): Promise<AcceptedImage> {
  if (!TYPES.has(file.type) || !/\.(png|jpe?g|webp)$/i.test(file.name)) {
    throw Error('Use PNG, JPG, JPEG ou WebP. SVG e outros formatos não são aceitos.')
  }
  if (file.size < 32 || file.size > MAX_BYTES) throw Error('A imagem precisa ter até 12 MB.')
  const signature = new Uint8Array(await file.slice(0,16).arrayBuffer())
  const isPng = signature[0] === 137 && signature[1] === 80 && signature[2] === 78 && signature[3] === 71
  const isJpeg = signature[0] === 255 && signature[1] === 216 && signature[2] === 255
  const isWebp = signature[0] === 82 && signature[1] === 73 && signature[2] === 70 && signature[3] === 70 &&
    signature[8] === 87 && signature[9] === 69 && signature[10] === 66 && signature[11] === 80
  if (!(file.type === 'image/png' && isPng || file.type === 'image/jpeg' && isJpeg || file.type === 'image/webp' && isWebp)) {
    throw Error('O conteúdo não corresponde ao formato declarado.')
  }
  const preview = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = preview
    await image.decode()
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth > 8192 || image.naturalHeight > 8192 ||
        image.naturalWidth * image.naturalHeight > 36_000_000) {
      throw Error('Dimensões inválidas. Limite: 8192 px e 36 megapixels.')
    }
    return { file, width: image.naturalWidth, height: image.naturalHeight, preview }
  } catch (error) {
    URL.revokeObjectURL(preview)
    if (error instanceof Error && error.message.startsWith('Dimensões')) throw error
    throw Error('Não foi possível decodificar a imagem. Escolha um arquivo válido.')
  }
}
