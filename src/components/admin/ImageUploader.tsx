
import { useEffect, useState } from 'react'
import { ImageUp } from 'lucide-react'

type Props = {
  currentUrl?: string
  label: string
  busy?: boolean
  onSave: (file: File) => Promise<void>
  onRemove?: () => Promise<void>
}

export function ImageUploader({
  currentUrl,
  label,
  busy,
  onSave,
  onRemove,
}: Props) {
  const [file, setFile] = useState<File>()
  const [preview, setPreview] = useState<string>()
  const [localError, setLocalError] = useState('')
  const [localSaving, setLocalSaving] = useState(false)

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  const clearSelection = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(undefined)
    setPreview(undefined)
  }

  const select = (next?: File) => {
    setLocalError('')
    if (!next) return clearSelection()

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(next.type)) {
      setLocalError('Formato não suportado. Use PNG, JPG, JPEG ou WEBP.')
      return
    }

    if (next.size > 8 * 1024 * 1024) {
      setLocalError('Arquivo excede o limite permitido de 8 MB.')
      return
    }

    if (preview) URL.revokeObjectURL(preview)
    setFile(next)
    setPreview(URL.createObjectURL(next))
  }

  const saving = Boolean(busy || localSaving)

  const save = async () => {
    if (!file || saving) return
    setLocalError('')
    setLocalSaving(true)
    try {
      await onSave(file)
      clearSelection()
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a imagem.',
      )
      console.error('Image upload failed:', error)
    } finally {
      setLocalSaving(false)
    }
  }

  return (
    <div className="upload-block">
      <div className="field-label">{label}</div>

      <div className="upload-preview">
        {preview || currentUrl ? (
          <img src={preview || currentUrl} alt={`${label} preview`} />
        ) : (
          <div className="empty-media">No image</div>
        )}
        {preview && (
          <span className="not-saved-badge">
            Imagem ainda não salva
          </span>
        )}
      </div>

      <label
        className="drop-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          select(event.dataTransfer.files?.[0])
        }}
      >
        <ImageUp size={20} />
        <span>Drag & drop image here or select an image</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={saving}
          onChange={(event) => select(event.target.files?.[0])}
        />
      </label>

      {localError && <span className="inline-error">{localError}</span>}

      <div className="upload-actions">
        {file && (
          <>
            <button
              className="button"
              type="button"
              disabled={saving}
              onClick={save}
            >
              {saving ? 'Salvando imagem...' : 'SALVAR IMAGEM'}
            </button>
            <button
              className="button button-secondary"
              type="button"
              disabled={saving}
              onClick={clearSelection}
            >
              Cancel
            </button>
          </>
        )}

        {!file && currentUrl && onRemove && (
          <button
            className="text-danger"
            type="button"
            disabled={saving}
            onClick={onRemove}
          >
            Remove image
          </button>
        )}
      </div>
    </div>
  )
}
