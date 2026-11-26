import { resolvePublicAsset, resolveAssetFallback } from '../assets/public/resolvePublicAsset'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'

export type ImageLightboxItem = {
  src: string
  alt: string
  downloadName?: string
  fallbackSrc?: string
}

type Props = {
  items: ImageLightboxItem[]
  index: number | null
  onClose: () => void
  onChange?: (index: number) => void
  allowDownload?: boolean
  details?: ReactNode
  ariaLabel?: string
}

export function ImageLightbox({
  items,
  index,
  onClose,
  onChange,
  allowDownload = false,
  details,
  ariaLabel,
}: Props) {
  const { locale } = useI18n()
  const pt = locale === 'pt-BR'
  const entry = index !== null ? items[index] : undefined
  const current = entry ? { ...entry, src: resolvePublicAsset(entry.src, 'full'),
    fallbackSrc: resolveAssetFallback(entry.src, entry.fallbackSrc, 'full') } : undefined
  const modalRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  const [failedSource, setFailedSource] = useState<string>()
  const showFallback = Boolean(current && failedSource === current.src)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  const hasNavigation = items.length > 1 && Boolean(onChange)

  useEffect(() => {
    if (!current) return
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setDragging(false)
    previousFocus.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeRef.current?.focus(), 0)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (hasNavigation && event.key === 'ArrowLeft') {
        event.preventDefault()
        onChange?.((index! - 1 + items.length) % items.length)
      } else if (hasNavigation && event.key === 'ArrowRight') {
        event.preventDefault()
        onChange?.((index! + 1) % items.length)
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        setZoom((value) => Math.min(4, value + 0.25))
      } else if (event.key === '-') {
        event.preventDefault()
        setZoom((value) => Math.max(0.5, value - 0.25))
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus.current?.focus()
    }
  }, [current?.src, hasNavigation, index, items.length, onChange, onClose])

  useEffect(() => {
    if (zoom < 1) setPan({ x: 0, y: 0 })
  }, [zoom])

  if (!current || index === null) return null

  const fullscreen = async () => {
    if (modalRef.current?.requestFullscreen) {
      await modalRef.current.requestFullscreen()
    }
  }

  const download = async () => {
    const filename = current.downloadName || current.alt || 'image'
    let chosenUrl = current.src
    try {
      let response = await fetch(chosenUrl)
      if (!response.ok && current.fallbackSrc) {
        // Existing legacy gallery items remain viewable while variants settle.
        chosenUrl = current.fallbackSrc
        response = await fetch(chosenUrl)
      }
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      const fallbackExtension = chosenUrl.split(/[?#]/)[0].split('.').pop()?.toLowerCase() || 'jpg'
      anchor.download = (chosenUrl === current.src
        ? filename
        : filename.replace(/\.[^.]+$/, '') + '.' + fallbackExtension
      ).replace(/[^a-zA-Z0-9._-]+/g, '-')
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(chosenUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className="image-lightbox-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !document.fullscreenElement) onClose()
      }}
    >
      <div
        ref={modalRef}
        className={`image-lightbox${details ? ' has-details' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? (pt ? 'Visualizador de imagens' : 'Image viewer')}
      >
        <div className="image-lightbox-toolbar">
          <div className="image-lightbox-counter">
            {hasNavigation ? `${index + 1} / ${items.length}` : ''}
          </div>
          <div className="image-lightbox-actions">
            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
              disabled={zoom <= 0.5}
              aria-label={pt ? 'Diminuir zoom' : 'Zoom Out'}
            >
              <ZoomOut size={18} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(4, value + 0.25))}
              disabled={zoom >= 4}
              aria-label={pt ? 'Aumentar zoom' : 'Zoom In'}
            >
              <ZoomIn size={18} />
            </button>
            {allowDownload && (
              <button type="button" onClick={() => void download()} aria-label={pt ? 'Baixar imagem' : 'Download'}>
                <Download size={18} />
              </button>
            )}
            <button type="button" onClick={() => void fullscreen()} aria-label={pt ? 'Tela cheia' : 'Fullscreen'}>
              <Maximize2 size={18} />
            </button>
            <button ref={closeRef} type="button" onClick={onClose} aria-label={pt ? 'Fechar' : 'Close'}>
              <X size={19} />
            </button>
          </div>
        </div>

        <div
          className={`image-lightbox-body${hasNavigation ? '' : ' no-navigation'}${details ? ' has-details' : ''}`}
        >
          {hasNavigation && (
            <button
              type="button"
              className="image-lightbox-nav image-lightbox-prev"
              onClick={() => onChange?.((index - 1 + items.length) % items.length)}
              aria-label={pt ? 'Imagem anterior' : 'Previous Image'}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div
            className={`image-lightbox-viewport${zoom >= 1 ? ' is-pannable' : ''}${dragging ? ' is-dragging' : ''}`}
            onWheel={(event) => {
              event.preventDefault()
              const delta = event.deltaY < 0 ? 0.1 : -0.1
              setZoom((value) => Math.max(0.5, Math.min(4, Number((value + delta).toFixed(2)))))
            }}
            onPointerDown={(event) => {
              if (zoom < 1) return
              event.preventDefault()
              dragRef.current = {
                x: event.clientX,
                y: event.clientY,
                panX: pan.x,
                panY: pan.y,
              }
              setDragging(true)
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current
              if (!drag || zoom < 1) return
              event.preventDefault()
              setPan({
                x: drag.panX + event.clientX - drag.x,
                y: drag.panY + event.clientY - drag.y,
              })
            }}
            onPointerUp={(event) => {
              dragRef.current = null
              setDragging(false)
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId)
              }
            }}
            onPointerCancel={(event) => {
              dragRef.current = null
              setDragging(false)
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId)
              }
            }}
          >
            <img
              key={current.src}
              src={showFallback && current.fallbackSrc ? current.fallbackSrc : current.src}
              onError={() => { if (current.fallbackSrc && !showFallback) setFailedSource(current.src) }}
              alt={current.alt}
              draggable={false}
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            />
          </div>

          {hasNavigation && (
            <button
              type="button"
              className="image-lightbox-nav image-lightbox-next"
              onClick={() => onChange?.((index + 1) % items.length)}
              aria-label={pt ? 'Próxima imagem' : 'Next Image'}
            >
              <ChevronRight size={22} />
            </button>
          )}

          {details && <div className="image-lightbox-details">{details}</div>}
        </div>
      </div>
    </div>
  )
}
