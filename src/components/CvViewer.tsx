import { Download, Maximize2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'

type Props = {
  open: boolean
  url: string
  onClose: () => void
}

export function CvViewer({ open, url, onClose }: Props) {
  const { t } = useI18n()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [expandedFallback, setExpandedFallback] = useState(false)

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeButtonRef.current?.focus(), 0)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (document.fullscreenElement) {
          void document.exitFullscreen().finally(onClose)
        } else {
          onClose()
        }
        return
      }

      if (event.key !== 'Tab' || !modalRef.current) return
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) setExpandedFallback(false)
  }, [open])

  if (!open) return null

  const enterFullscreen = async () => {
    if (modalRef.current?.requestFullscreen) {
      await modalRef.current.requestFullscreen()
      return
    }
    setExpandedFallback(true)
  }

  const handleBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (document.fullscreenElement || expandedFallback) return
    onClose()
  }

  return (
    <div className="cv-viewer-backdrop" onMouseDown={handleBackdrop}>
      <div
        ref={modalRef}
        className={`cv-viewer-modal ${expandedFallback ? 'cv-viewer-modal-expanded' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-viewer-title"
      >
        <div className="cv-viewer-toolbar">
          <strong id="cv-viewer-title">{t('curriculumVitae')}</strong>
          <div className="cv-viewer-actions">
            <button type="button" onClick={() => void enterFullscreen()} aria-label="Fullscreen CV" title={t('fullscreenCv')}>
              <Maximize2 size={18} />
            </button>
            <a href={url} download="leonardo-rossato-cv.pdf" target="_blank" rel="noreferrer" aria-label="Download CV" title={t('downloadCv')}>
              <Download size={18} />
            </a>
            <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close CV" title={t('closeCv')}>
              <X size={19} />
            </button>
          </div>
        </div>
        <div className="cv-viewer-document">
          <iframe src={url} title={t('curriculumVitae')} />
        </div>
      </div>
    </div>
  )
}
