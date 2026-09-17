import { Atom, Blocks, BrainCircuit, Code2, Network } from 'lucide-react'
import type { Capability } from '../domain/models/SiteContent'
import { useI18n } from '../i18n/I18nProvider'

const icons = [Code2, BrainCircuit, Blocks, Network, Atom]

export function CapabilitiesSection({ capabilities }: { capabilities?: Capability[] }) {
  const { t } = useI18n()
  const safe = Array.isArray(capabilities) ? capabilities : []
  if (!safe.length) return null

  return (
    <section className="section capabilities-section">
      <div className="site-container">
        <div className="section-title section-title-stacked">
          <div>
            <div className="eyebrow">01 / {t('capabilitiesEyebrow')}</div>
            <h2>{t('whatIBuild')}</h2>
          </div>
        </div>

        <div className="capabilities-grid">
          {safe.map((capability, index) => {
            const Icon = icons[index % icons.length]
            const items = Array.isArray(capability.items) ? capability.items : []
            return (
              <article className="capability-card" key={`${capability.title}-${index}`}>
                <Icon className="capability-icon" size={22} strokeWidth={1.8} aria-hidden="true" />
                <h3>{capability.title ?? ''}</h3>
                <p>{capability.description ?? ''}</p>
                <div className="tech-list">
                  {items.map((item) => <span key={item}>{item}</span>)}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
