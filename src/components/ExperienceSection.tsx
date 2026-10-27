import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import { ExternalLink } from 'lucide-react'
import { resourcesForExperience } from '../data/experienceResources'
import type { Experience } from '../domain/models/About'
import { useI18n } from '../i18n/I18nProvider'

export function ExperienceSection({ experiences }: { experiences?: Experience[] }) {
  const { t, locale } = useI18n()
  const prefix = useId()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [horizontal, setHorizontal] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const items = Array.isArray(experiences)
    ? [...experiences].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    : []
  const selected = items.find((item) => item.id === selectedId) ?? items[0]

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const update = () => setHorizontal(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  if (!selected) return null

  const resources = resourcesForExperience(selected, locale)

  const tabId = (id: string) => `${prefix}-experience-${id}`
  const panelId = `${prefix}-experience-panel`
  const headingId = `${prefix}-experience-heading`

  const navigateTabs = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number
    if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    else if (event.key === (horizontal ? 'ArrowRight' : 'ArrowDown')) next = (index + 1) % items.length
    else if (event.key === (horizontal ? 'ArrowLeft' : 'ArrowUp')) next = (index - 1 + items.length) % items.length
    else return
    event.preventDefault()
    setSelectedId(items[next].id)
    document.getElementById(tabId(items[next].id))?.focus()
  }

  return (
    <section className="section experience-section" id="experience">
      <div className="site-container">
        <div className="section-title section-title-stacked" data-reveal="scale">
          <div>
            <div className="eyebrow">04 / {t('experienceEyebrow')}</div>
            <h2 id={headingId}>{t('experienceTitle')}</h2>
          </div>
        </div>

        <div className="experience-browser" data-reveal="scale" style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
          <div
            className="experience-tabs"
            role="tablist"
            aria-labelledby={headingId}
            aria-orientation={horizontal ? 'horizontal' : 'vertical'}
          >
            {items.map((item, index) => (
              <button
                className="experience-tab"
                key={item.id}
                id={tabId(item.id)}
                type="button"
                role="tab"
                aria-selected={selected.id === item.id}
                aria-controls={panelId}
                tabIndex={selected.id === item.id ? 0 : -1}
                onClick={() => setSelectedId(item.id)}
                onKeyDown={(event) => navigateTabs(event, index)}
              >
                <span className="experience-tab-title">{item.title}</span>
                <span className="experience-tab-period">{item.period}</span>
              </button>
            ))}
          </div>

          <article
            className="experience-panel"
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId(selected.id)}
            tabIndex={0}
          >
            <div className="experience-panel-period">{selected.period}</div>
            <h3>{selected.title}</h3>
            {selected.organizationUrl ? (
              <a className="experience-panel-organization" href={selected.organizationUrl} target="_blank" rel="noopener noreferrer">
                {selected.organization} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <div className="experience-panel-organization">{selected.organization}</div>
            )}
            <p className="experience-panel-description">{selected.description}</p>
            {resources.length > 0 && (
              <div className="experience-panel-resources" aria-label={locale === 'pt-BR' ? 'Links da experiência' : 'Experience resources'}>
                {resources.map(({ url, label }) => (
                  <a className="button button-secondary" key={url} href={url} target="_blank" rel="noopener noreferrer">
                    {label}<ExternalLink size={14} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
