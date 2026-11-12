import { ChevronLeft, ChevronRight, Maximize2, MoveHorizontal } from 'lucide-react'
import { useMemo, useRef, useState, type PointerEvent } from 'react'
import type { Locale } from '../i18n/types'
import { localizedWorkflowDiagram, workflowDiagrams } from '../data/workflowResources'
import { ImageLightbox } from './ImageLightbox'

type DragStart = { x: number; y: number }

export function WorkflowDocuments({ locale }: { locale: Locale }) {
  const pt = locale === 'pt-BR'
  const [activeIndex, setActiveIndex] = useState(0)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const dragStart = useRef<DragStart | null>(null)
  const suppressClick = useRef(false)

  const resources = useMemo(
    () => workflowDiagrams.map((item) => ({ item, text: localizedWorkflowDiagram(item, locale) })),
    [locale],
  )
  const active = resources[activeIndex] ?? resources[0]
  if (!active) return null

  const goTo = (index: number) => {
    setActiveIndex((index + resources.length) % resources.length)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragStart.current = { x: event.clientX, y: event.clientY }
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    dragStart.current = null
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < 55 || Math.abs(dx) <= Math.abs(dy)) return
    suppressClick.current = true
    goTo(activeIndex + (dx < 0 ? 1 : -1))
  }

  const onImageClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    setOpenIndex(activeIndex)
  }

  const lightboxItems = resources.map(({ item, text }) => ({
    src: `${import.meta.env.BASE_URL}${item.publicPath}`,
    alt: text.title,
    downloadName: item.originalName,
  }))

  return (
    <section className="workflow-documents-section workflow-documents-first" aria-labelledby="workflow-documents-title">
      <div className="site-container workflow-page-resources">
        <header className="workflow-documents-heading">
          <div className="eyebrow">{pt ? 'Como eu trabalho' : 'How I work'}</div>
          <h2 id="workflow-documents-title">
            {pt ? 'LCR Workflow - Arquitetura' : 'LCR Workflow at a glance'}
          </h2>
          <p>
            {pt
              ? 'Comece pelo diagrama real dos agentes e funções. Deslize para ver o documento A4 completo do LCR Workflow.'
              : 'Start with the original diagram of agents and roles. Swipe to see the complete A4 LCR Workflow document.'}
          </p>
        </header>

        <div className="workflow-visual-gallery" aria-label={pt ? 'Galeria dos diagramas LCR' : 'LCR diagrams gallery'}>
          <div className="workflow-visual-hint" aria-hidden="true">
            <MoveHorizontal size={18} />
            <span>{pt ? 'Arraste para o lado para ver o próximo' : 'Swipe sideways to view the next diagram'}</span>
            <ChevronRight size={17} className="workflow-visual-hint-arrow" />
          </div>

          <div
            className="workflow-visual-stage"
            role="region"
            aria-roledescription={pt ? 'carrossel' : 'carousel'}
            aria-label={pt ? 'Diagramas do LCR Workflow' : 'LCR Workflow diagrams'}
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { dragStart.current = null }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault()
                goTo(activeIndex + 1)
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault()
                goTo(activeIndex - 1)
              }
            }}
          >
            <article className="workflow-visual-slide" key={active.item.id} role="group" aria-roledescription={pt ? 'slide' : 'slide'}>
              <button
                className="workflow-visual-image-button"
                type="button"
                onClick={onImageClick}
                aria-label={pt ? `Abrir imagem: ${active.text.title}` : `Open image: ${active.text.title}`}
              >
                <img
                  src={`${import.meta.env.BASE_URL}${active.item.publicPath}`}
                  alt={active.text.title}
                  width={active.item.width}
                  height={active.item.height}
                  draggable={false}
                  decoding="async"
                />
                <span className="workflow-visual-enlarge"><Maximize2 size={18} /> {pt ? 'Ampliar' : 'Enlarge'}</span>
              </button>

              <div className="workflow-visual-caption">
                <div>
                  <span className="workflow-visual-category">{active.text.category}</span>
                  <h3>{active.text.title}</h3>
                  <p>{active.text.description}</p>
                </div>
              </div>
            </article>
          </div>

          <div className="workflow-visual-navigation">
            <button type="button" className="workflow-visual-arrow" aria-label={pt ? 'Diagrama anterior' : 'Previous diagram'} onClick={() => goTo(activeIndex - 1)}>
              <ChevronLeft size={22} />
            </button>
            <div className="workflow-visual-pagination" aria-label={pt ? 'Selecionar diagrama' : 'Select diagram'}>
              {resources.map(({ item, text }, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === activeIndex ? 'is-active' : ''}
                  aria-label={text.title}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => goTo(index)}
                />
              ))}
              <span aria-live="polite">{activeIndex + 1} / {resources.length}</span>
            </div>
            <button type="button" className="workflow-visual-arrow" aria-label={pt ? 'Próximo diagrama' : 'Next diagram'} onClick={() => goTo(activeIndex + 1)}>
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      <ImageLightbox
        items={lightboxItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={(index) => { setOpenIndex(index); setActiveIndex(index) }}
        allowDownload={false}
        ariaLabel={pt ? 'Visualizador dos diagramas do LCR Workflow' : 'LCR Workflow diagram viewer'}
      />
    </section>
  )
}
