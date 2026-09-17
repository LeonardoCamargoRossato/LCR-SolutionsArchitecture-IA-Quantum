import type { WorkProcessStep } from '../domain/models/SiteContent'
import { useI18n } from '../i18n/I18nProvider'

export function WorkProcessSection({ steps }: { steps?: WorkProcessStep[] }) {
  const { t } = useI18n()
  const safe = Array.isArray(steps) ? steps : []
  if (!safe.length) return null

  return (
    <section className="section section-soft work-process-section">
      <div className="site-container">
        <div className="section-title section-title-stacked">
          <div>
            <div className="eyebrow">04 / {t('processEyebrow')}</div>
            <h2>{t('howIWork')}</h2>
          </div>
        </div>

        <div className="work-process-grid">
          {safe.map((item, index) => (
            <article className="work-process-step" key={`${item.step}-${item.title}-${index}`}>
              <span className="work-process-number">{item.step || String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title ?? ''}</h3>
              <p>{item.description ?? ''}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
