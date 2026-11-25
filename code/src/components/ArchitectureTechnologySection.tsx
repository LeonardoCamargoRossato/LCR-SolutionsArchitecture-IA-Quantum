import type { Capability } from '../domain/models/SiteContent'
import { useI18n } from '../i18n/I18nProvider'

export function ArchitectureTechnologySection({ capabilities }: { capabilities?: Capability[] }) {
  const { t } = useI18n()
  const safe = Array.isArray(capabilities) ? capabilities : []
  if (!safe.length) return null

  return (
    <section className="section architecture-tech-section">
      <div className="site-container architecture-tech-layout">
        <div>
          <div className="eyebrow">06 / {t('technologyEyebrow')}</div>
          <h2>{t('architectureTechnology')}</h2>
        </div>

        <div className="architecture-tech-groups">
          {safe.map((group, index) => (
            <div className="architecture-tech-group" key={`${group.title}-${index}`}>
              <h3>{group.title ?? ''}</h3>
              <div className="tech-list">
                {(Array.isArray(group.items) ? group.items : []).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
