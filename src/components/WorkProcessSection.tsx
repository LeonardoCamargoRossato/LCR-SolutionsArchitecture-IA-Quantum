import { ChevronDown, GripVertical, X } from 'lucide-react'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import type { WorkProcessStep } from '../domain/models/SiteContent'
import { useI18n } from '../i18n/I18nProvider'
import './WorkProcessSection.css'

type Point = { x: number; y: number }
type Box = Point & { width: number; height: number }
type Drag = { index: number; pointerId: number; start: Point; origin: Point; handle: HTMLButtonElement }
const desktopQuery = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
const motionQuery = '(prefers-reduced-motion: reduce)'

export function WorkProcessSection({ steps }: { steps?: WorkProcessStep[] }) {
  const { t, locale } = useI18n()
  const pt = locale === 'pt-BR'
  const prefix = useId()
  const safe = Array.isArray(steps) ? steps : []
  const stageRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const nodeRefs = useRef<(HTMLElement | null)[]>([])
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const offsets = useRef<Point[]>([])
  const geometry = useRef<{ bounds: Box; boxes: Box[] }>({ bounds: { x: 0, y: 0, width: 0, height: 0 }, boxes: [] })
  const drag = useRef<Drag | null>(null)
  const frame = useRef<number | null>(null)
  const [entered, setEntered] = useState(false)
  const [introComplete, setIntroComplete] = useState(() => window.matchMedia(motionQuery).matches)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia(motionQuery).matches)
  const [dragEnabled, setDragEnabled] = useState(() => window.matchMedia(desktopQuery).matches)
  const [dragging, setDragging] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [detailIndex, setDetailIndex] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const detail = detailIndex === null ? undefined : safe[detailIndex]
  const open = selectedIndex !== null && !!detail
  const panelId = `${prefix}-process-details`
  const hintId = `${prefix}-process-hint`

  // SVG attributes and transforms are updated at most once per frame, not through
  // React state on every pointer movement. Geometry is only read on layout changes.
  const draw = useCallback(() => {
    const { boxes } = geometry.current
    boxes.forEach((_, index) => {
      const offset = offsets.current[index] ?? { x: 0, y: 0 }
      const node = nodeRefs.current[index]
      if (node) node.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0)`
    })
    boxes.slice(0, -1).forEach((box, index) => {
      const next = boxes[index + 1]
      const a = offsets.current[index] ?? { x: 0, y: 0 }
      const b = offsets.current[index + 1] ?? { x: 0, y: 0 }
      const first = { x: box.x + a.x, y: box.y + a.y, width: box.width, height: box.height }
      const second = { x: next.x + b.x, y: next.y + b.y, width: next.width, height: next.height }
      let path: string
      if (Math.abs(first.y - second.y) > Math.min(first.height, second.height) * .5) {
        const down = second.y > first.y
        const x1 = first.x + first.width / 2
        const y1 = first.y + (down ? first.height : 0)
        const x2 = second.x + second.width / 2
        const y2 = second.y + (down ? 0 : second.height)
        const mid = (y1 + y2) / 2
        path = `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`
      } else {
        const right = second.x >= first.x
        const x1 = first.x + (right ? first.width : 0)
        const y1 = first.y + first.height / 2
        const x2 = second.x + (right ? 0 : second.width)
        const y2 = second.y + second.height / 2
        const bend = Math.max(16, Math.abs(x2 - x1) / 2) * (right ? 1 : -1)
        path = `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`
      }
      pathRefs.current[index]?.setAttribute('d', path)
    })
  }, [])

  const bounded = useCallback((index: number, point: Point): Point => {
    const { boxes, bounds } = geometry.current
    const box = boxes[index]
    if (!box) return { x: 0, y: 0 }
    return {
      x: Math.max(8 - box.x, Math.min(bounds.width - box.x - box.width - 8, point.x)),
      y: Math.max(8 - box.y, Math.min(bounds.height - box.y - box.height - 8, point.y)),
    }
  }, [])

  const scheduleDraw = useCallback(() => {
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => { frame.current = null; draw() })
  }, [draw])

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const rect = stage.getBoundingClientRect()
      geometry.current = {
        bounds: { x: 0, y: 0, width: rect.width, height: rect.height },
        boxes: nodeRefs.current.slice(0, safe.length).map((node, index) => {
          const box = node!.getBoundingClientRect()
          const offset = offsets.current[index] ?? { x: 0, y: 0 }
          return { x: box.left - rect.left - offset.x, y: box.top - rect.top - offset.y, width: box.width, height: box.height }
        }),
      }
      offsets.current = geometry.current.boxes.map((_, index) => bounded(index, offsets.current[index] ?? { x: 0, y: 0 }))
      draw()
    }
    measure()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    observer?.observe(stage)
    nodeRefs.current.forEach((node) => { if (node) observer?.observe(node) })
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [safe.length, bounded, draw])

  useEffect(() => {
    const motion = window.matchMedia(motionQuery)
    const desktop = window.matchMedia(desktopQuery)
    const updateMotion = () => { setReducedMotion(motion.matches); if (motion.matches) { setEntered(true); setIntroComplete(true) } }
    const updateDesktop = () => {
      setDragEnabled(desktop.matches)
      if (!desktop.matches) {
        if (drag.current) offsets.current[drag.current.index] = drag.current.origin
        drag.current = null
        setDragging(null)
        offsets.current = []
        draw()
      }
    }
    motion.addEventListener('change', updateMotion)
    desktop.addEventListener('change', updateDesktop)
    return () => { motion.removeEventListener('change', updateMotion); desktop.removeEventListener('change', updateDesktop) }
  }, [draw])

  useEffect(() => {
    const stage = stageRef.current
    const section = sectionRef.current
    if (!stage || !section) return
    if (reducedMotion || typeof IntersectionObserver === 'undefined') { setEntered(true); return }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === stage && entry.isIntersecting) setEntered(true)
        if (entry.target === section && !entry.isIntersecting && !drag.current) {
          setEntered(false)
          setIntroComplete(false)
          setSelectedIndex(null)
          offsets.current = []
          draw()
        }
      })
    }, { threshold: .12, rootMargin: '0px 0px -48px 0px' })
    observer.observe(stage)
    observer.observe(section)
    return () => observer.disconnect()
  }, [reducedMotion, safe.length, draw])

  if (!safe.length) return null

  const chooseStep = (index: number) => {
    setDetailIndex(index)
    setSelectedIndex(selectedIndex === index ? null : index)
  }
  const completeIntro = () => { setEntered(true); setIntroComplete(true) }
  const closeDetails = () => {
    setSelectedIndex(null)
    document.getElementById(`${prefix}-process-${selectedIndex}`)?.focus({ preventScroll: true })
  }
  const startDrag = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    if (!dragEnabled || drag.current || event.pointerType !== 'mouse' || event.button !== 0) return
    event.preventDefault()
    completeIntro()
    drag.current = { index, pointerId: event.pointerId, start: { x: event.clientX, y: event.clientY }, origin: { ...(offsets.current[index] ?? { x: 0, y: 0 }) }, handle: event.currentTarget }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(index)
  }
  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const active = drag.current
    if (!active || active.pointerId !== event.pointerId) return
    offsets.current[active.index] = bounded(active.index, { x: active.origin.x + event.clientX - active.start.x, y: active.origin.y + event.clientY - active.start.y })
    scheduleDraw()
  }
  const finishDrag = (event: PointerEvent<HTMLButtonElement>, cancel = false) => {
    const active = drag.current
    if (!active || active.pointerId !== event.pointerId) return
    if (cancel) offsets.current[active.index] = active.origin
    drag.current = null
    if (active.handle.hasPointerCapture(event.pointerId)) active.handle.releasePointerCapture(event.pointerId)
    setDragging(null)
    scheduleDraw()
    setAnnouncement(cancel ? (pt ? 'Movimentação cancelada.' : 'Movement cancelled.') : (pt ? `Etapa ${active.index + 1} reposicionada.` : `Step ${active.index + 1} repositioned.`))
  }
  const moveWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!dragEnabled) return
    const directions: Record<string, Point> = { ArrowLeft: { x: -12, y: 0 }, ArrowRight: { x: 12, y: 0 }, ArrowUp: { x: 0, y: -12 }, ArrowDown: { x: 0, y: 12 } }
    const direction = directions[event.key]
    if (!direction && event.key !== 'Home') return
    event.preventDefault()
    const current = offsets.current[index] ?? { x: 0, y: 0 }
    offsets.current[index] = event.key === 'Home' ? { x: 0, y: 0 } : bounded(index, { x: current.x + direction.x, y: current.y + direction.y })
    scheduleDraw()
    setAnnouncement(pt ? `Etapa ${index + 1} reposicionada.` : `Step ${index + 1} repositioned.`)
  }

  return (
    <section className="section section-soft work-process-section work-process-animated" id="how-i-work" ref={sectionRef}>
      <div className="site-container">
        <div className="section-title section-title-stacked">
          <div>
            <div className="eyebrow">05 / {t('processEyebrow')}</div>
            <h2>{t('howIWork')}</h2>
          </div>
        </div>
        <div className="process-toolbar">
          <p id={hintId}>{pt ? 'Clique em uma etapa para explorar os detalhes.' : 'Select a step to explore its details.'} {dragEnabled && (pt ? 'Reposicione os cards pela alça ou use as setas do teclado com a alça em foco.' : 'Reposition cards using the handle, or use arrow keys while the handle is focused.')}</p>
        </div>
        <div className="process-stage" ref={stageRef} data-entered={entered} data-intro-complete={introComplete} data-reduced={reducedMotion} data-draggable={dragEnabled}>
          <svg className="process-wires" aria-hidden="true" focusable="false">
            <defs><marker id={`${prefix}-process-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M 1 1 L 7 4 L 1 7" fill="none" stroke="currentColor" strokeWidth="1.5" /></marker></defs>
            {safe.slice(0, -1).map((_, index) => <path className="process-connection" key={index} ref={(node) => { pathRefs.current[index] = node }} pathLength={1} markerEnd={`url(#${prefix}-process-arrow)`} style={{ '--connection-index': index } as CSSProperties} />)}
          </svg>
          <div className="work-process-grid">
            {safe.map((item, index) => (
              <article className="process-node" ref={(node) => { nodeRefs.current[index] = node }} key={`${item.step}-${index}`} data-stage-index={index} data-dragging={dragging === index} style={{ '--process-index': index } as CSSProperties}>
                <div className="process-card" data-selected={selectedIndex === index} onAnimationEnd={(event) => { if (index === safe.length - 1 && event.animationName === 'process-card-enter') setIntroComplete(true) }}>
                  <button className="process-card-trigger" type="button" id={`${prefix}-process-${index}`} aria-labelledby={`${prefix}-process-title-${index}`} aria-expanded={selectedIndex === index} aria-controls={panelId} onClick={() => chooseStep(index)} onFocus={completeIntro}>
                    <span className="work-process-number">{item.step || String(index + 1).padStart(2, '0')}</span>
                    <span className="process-card-title" id={`${prefix}-process-title-${index}`}>{item.title ?? ''}</span>
                    <span className="process-card-summary">{item.description ?? ''}</span>
                    <span className="process-card-cta">{pt ? 'Explorar etapa' : 'Explore step'}<ChevronDown size={15} aria-hidden="true" /></span>
                  </button>
                  {dragEnabled && <button className="process-drag-handle" type="button" aria-label={`${pt ? 'Mover etapa' : 'Move step'} ${index + 1}`} aria-describedby={hintId} title={pt ? 'Arraste para mover. Setas: mover; Home: restaurar esta etapa.' : 'Drag to move. Arrow keys: move; Home: reset this step.'} onFocus={completeIntro} onPointerDown={(event) => startDrag(event, index)} onPointerMove={moveDrag} onPointerUp={(event) => finishDrag(event)} onPointerCancel={(event) => finishDrag(event, true)} onLostPointerCapture={(event) => finishDrag(event, true)} onKeyDown={(event) => moveWithKeyboard(event, index)}><GripVertical size={19} aria-hidden="true" /></button>}
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="process-detail-shell" data-open={open} aria-hidden={!open} inert={!open}>
          <div className="process-detail-clip">
            {detail && <section className="process-details" id={panelId} role="region" aria-labelledby={`${prefix}-process-detail-title`} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); closeDetails() } }}>
              <div className="process-details-header"><div><span className="process-detail-label">{pt ? 'Etapa' : 'Step'} {detail.step || (detailIndex ?? 0) + 1}</span><h3 id={`${prefix}-process-detail-title`}>{detail.title}</h3></div><button className="process-close" type="button" onClick={closeDetails}><X size={16} aria-hidden="true" />{pt ? 'Fechar' : 'Close'}</button></div>
              <p className="process-details-lead">{detail.description}</p>
              {typeof detail.details === 'string' && detail.details.trim() ? <p className="process-details-body">{detail.details}</p> : <div className="process-placeholder"><span>{pt ? 'Conteúdo em preparação' : 'Content in preparation'}</span><p>{pt ? 'Espaço reservado para documentação, exemplos e materiais adicionais desta etapa. Esses detalhes ainda não foram cadastrados.' : 'Placeholder for documentation, examples and additional materials for this step. These details have not been added yet.'}</p></div>}
            </section>}
          </div>
        </div>
        <span className="process-announcement" role="status" aria-live="polite">{announcement}</span>
      </div>
    </section>
  )
}
