import { ArrowRight, Maximize2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { Locale } from '../i18n/types'
import { localizedWorkflowDiagram, workflowDiagrams } from '../data/workflowResources'
import { ImageLightbox } from './ImageLightbox'

export function WorkflowDocuments({ locale }: { locale: Locale }) {
  const pt = locale === 'pt-BR'
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; scrollLeft: number; moved: boolean } | null>(null)

  const localized = useMemo(
    () => workflowDiagrams.map((item) => ({ item, text: localizedWorkflowDiagram(item, locale) })),
    [locale],
  )

  const lightboxItems = localized.map(({ item, text }) => ({
    src: `${import.meta.env.BASE_URL}${item.publicPath}`,
    alt: text.title,
    downloadName: item.originalName,
  }))

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragRef.current = {
      x: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const delta = event.clientX - drag.x
    if (Math.abs(delta) > 5) drag.moved = true
    if (!drag.moved) return
    event.preventDefault()
    event.currentTarget.scrollLeft = drag.scrollLeft - delta
  }

  const endPointerDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    window.setTimeout(() => {
      dragRef.current = null
    }, 0)
  }

  return (
    <section className="workflow-documents-section workflow-documents-first" aria-labelledby="workflow-documents-title">
      <div className="site-container workflow-page-resources">
        <header className="workflow-documents-heading">
          <div className="eyebrow">{pt ? 'Como eu trabalho' : 'How I work'}</div>
          <h2 id="workflow-documents-title">
            {pt ? 'LCR Workflow em visão visual' : 'LCR Workflow at a glance'}
          </h2>
          <p>
            {pt
              ? 'Comece pelo mapa dos agentes e funções. Arraste para o lado para consultar o documento A4 completo da estrutura do LCR Workflow.'
              : 'Start with the map of agents and roles. Drag sideways to inspect the complete A4 overview of the LCR Workflow structure.'}
          </p>
        </header>

        <div className="workflow-carousel-shell">
          <div className="workflow-swipe-hint" aria-hidden="true">
            <span>{pt ? 'Arraste para o lado' : 'Drag sideways'}</span>
            <ArrowRight size={18} />
          </div>

          <div
            ref={scrollerRef}
            className="workflow-document-carousel"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endPointerDrag}
            onPointerCancel={endPointerDrag}
          >
            {localized.map(({ item, text }, index) => (
              <article className="workflow-document-slide" key={item.id}>
                <button
                  className="workflow-document-image"
                  type="button"
                  onClick={() => {
                    if (dragRef.current?.moved) return
                    setOpenIndex(index)
                  }}
                  aria-label={pt ? `Abrir diagrama: ${text.title}` : `Open diagram: ${text.title}`}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}${item.publicPath}`}
                    alt={text.title}
                    width={item.width}
                    height={item.height}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <span><Maximize2 size={18} /> {pt ? 'Abrir' : 'Open'}</span>
                </button>

                <div className="workflow-document-copy">
                  <span>{text.category}</span>
                  <h3>{text.title}</h3>
                  <p>{text.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="workflow-carousel-dots" aria-hidden="true">
            {localized.map((resource, index) => (
              <span className={index === 0 ? 'is-active' : ''} key={resource.item.id} />
            ))}
          </div>
        </div>
      </div>

      <ImageLightbox
        items={lightboxItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
        allowDownload={false}
        ariaLabel={pt ? 'Visualizador dos diagramas do LCR Workflow' : 'LCR Workflow diagram viewer'}
      />
    </section>
  )
}
