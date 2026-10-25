import { Atom, Blocks, BrainCircuit, ChevronDown, Code2, Network, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryForCapability } from '../data/capabilityCategories'
import type { Project } from '../domain/models/Project'
import type { Capability } from '../domain/models/SiteContent'
import { localizedProject } from '../i18n/content'
import { useI18n } from '../i18n/I18nProvider'

const icons = { software: Code2, ai: BrainCircuit, data: Blocks, science: Atom, enterprise: Network }

export function CapabilitiesSection({ capabilities, projects }: { capabilities?: Capability[]; projects: Project[] }) {
  const { t, locale } = useI18n()
  const prefix = useId()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const safe = Array.isArray(capabilities) ? capabilities : []
  const selected = selectedIndex === null ? undefined : safe[selectedIndex]
  const category = selected ? categoryForCapability(selected) : undefined
  const panelId = `${prefix}-capability-details`
  const isPortuguese = locale === 'pt-BR'

  useEffect(() => {
    if (selectedIndex !== null) {
      panelRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'nearest',
      })
    }
  }, [selectedIndex])

  if (!safe.length) return null

  const close = () => {
    const previousIndex = selectedIndex
    setSelectedIndex(null)
    document.getElementById(`${prefix}-capability-${previousIndex}`)?.focus({ preventScroll: true })
  }
  const selectedItems = Array.isArray(selected?.items) ? selected.items : []
  const relatedProjects = (category?.projects ?? []).flatMap((reference) => {
    const project = projects.find((item) => item.slug === reference.slug && item.visible !== false && item.caseEnabled !== false)
    return project ? [{ project: localizedProject(project, locale), reference }] : []
  }).slice(0, 3)

  return (
    <section className="section capabilities-section">
      <div className="site-container">
        <div className="section-title section-title-stacked">
          <div>
            <div className="eyebrow">03 / {t('capabilitiesEyebrow')}</div>
            <h2>{t('whatIBuild')}</h2>
          </div>
        </div>

        <div className="capabilities-grid">
          {safe.map((capability, index) => {
            const group = categoryForCapability(capability)
            const Icon = icons[group.id as keyof typeof icons]
            const items = Array.isArray(capability.items) ? capability.items : []
            const expanded = selectedIndex === index
            return (
              <article className="capability-card" data-capability={group.id} data-expanded={expanded} key={`${group.id}-${index}`}>
                <button
                  className="capability-trigger"
                  id={`${prefix}-capability-${index}`}
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  aria-labelledby={`${prefix}-capability-title-${index}`}
                  onClick={() => setSelectedIndex(expanded ? null : index)}
                >
                  <Icon className="capability-icon" size={25} strokeWidth={1.8} aria-hidden="true" />
                  <span className="capability-title" id={`${prefix}-capability-title-${index}`}>{isPortuguese ? group.pt : group.en}</span>
                  <span className="capability-description">{capability.description ?? ''}</span>
                  <span className="tech-list capability-preview">
                    {items.slice(0, 5).map((item, itemIndex) => <span key={`${item}-${itemIndex}`}>{item}</span>)}
                  </span>
                  <span className="capability-cta">
                    {expanded ? (isPortuguese ? 'Recolher detalhes' : 'Hide details') : (isPortuguese ? 'Ver todas as competências' : 'View all competencies')}
                    <span className="capability-count">{items.length}</span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </span>
                </button>
              </article>
            )
          })}
        </div>

        {selected && category && (
          <div
            className="capability-details"
            data-capability={category.id}
            id={panelId}
            ref={panelRef}
            role="region"
            aria-labelledby={`${prefix}-capability-details-title`}
            onKeyDown={(event) => {
              if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() }
            }}
          >
            <div className="capability-details-header">
              <div>
                <span className="capability-category-label">{isPortuguese ? category.pt : category.en}</span>
                <h3 id={`${prefix}-capability-details-title`}>{selected.title}</h3>
              </div>
              <button className="capability-close" type="button" onClick={close}>
                <X size={16} aria-hidden="true" />{isPortuguese ? 'Fechar' : 'Close'}
              </button>
            </div>
            <p className="capability-details-description">{selected.description}</p>
            <h4>{isPortuguese ? 'Todas as competências' : 'All competencies'}</h4>
            <div className="tech-list capability-all-items">
              {selectedItems.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
            </div>
            {relatedProjects.length > 0 && (
              <div className="capability-projects">
                <h4>{isPortuguese ? 'Competências aplicadas nestes projetos' : 'Applied in these projects'}</h4>
                <div className="capability-project-grid">
                  {relatedProjects.map(({ project, reference }) => (
                    <Link className="capability-project-link" key={project.id} to={`/projects/${project.slug}`}>
                      <strong>{project.title}<span aria-hidden="true"> →</span></strong>
                      <span>{isPortuguese ? reference.pt : reference.en}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
