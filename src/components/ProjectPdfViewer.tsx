import {
  Download,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  open: boolean
  url: string
  title: string
  onClose: () => void
}

function withZoom(url: string, zoom: number) {
  const base = url.split('#')[0]
  return `${base}#zoom=${zoom}`
}

export function ProjectPdfViewer({ open, url, title, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const [zoom, setZoom] = useState(100)
  const [expandedFallback, setExpandedFallback] = useState(false)

  const viewerUrl = useMemo(() => withZoom(url, zoom), [url, zoom])

  useEffect(() => {
    if (!open) return

    previousFocus.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeRef.current?.focus(), 0)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (document.fullscreenElement) {
          void document.exitFullscreen().finally(onClose)
        } else {
          onClose()
        }
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        setZoom((value) => Math.min(200, value + 10))
      } else if (event.key === '-') {
        event.preventDefault()
        setZoom((value) => Math.max(50, value - 10))
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = previousOverflow
      previousFocus.current?.focus()
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setZoom(100)
      setExpandedFallback(false)
    }
  }, [open])

  if (!open) return null

  const fullscreen = async () => {
    if (modalRef.current?.requestFullscreen) {
      await modalRef.current.requestFullscreen()
    } else {
      setExpandedFallback(true)
    }
  }

  return (
    <div
      className="project-pdf-backdrop"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !document.fullscreenElement &&
          !expandedFallback
        ) {
          onClose()
        }
      }}
    >
      <div
        ref={modalRef}
        className={`project-pdf-modal ${expandedFallback ? 'project-pdf-modal-expanded' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="project-pdf-toolbar">
          <strong>{title}</strong>
          <div className="project-pdf-actions">
            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(50, value - 10))}
              aria-label="Zoom out PDF"
              title="Zoom out"
            >
              <ZoomOut size={18} />
            </button>
            <span>{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(200, value + 10))}
              aria-label="Zoom in PDF"
              title="Zoom in"
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              onClick={() => void fullscreen()}
              aria-label="Fullscreen PDF"
              title="Fullscreen"
            >
              <Maximize2 size={18} />
            </button>
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download PDF"
              title="Download"
            >
              <Download size={18} />
            </a>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close PDF"
              title="Close"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="project-pdf-document">
          <iframe src={viewerUrl} title={title} />
        </div>
      </div>
    </div>
  )
}
