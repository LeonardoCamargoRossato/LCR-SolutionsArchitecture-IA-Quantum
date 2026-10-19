import type { Experience } from '../domain/models/About'
import { useI18n } from '../i18n/I18nProvider'

export function ExperienceSection({ experiences }: { experiences?: Experience[] }) {
  const { t } = useI18n()
  const items = Array.isArray(experiences)
    ? [...experiences].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    : []

  if (!items.length) return null

  return (
    <section className="section experience-section" id="experience">
      <div className="site-container">
        <div className="section-title section-title-stacked">
          <div>
            <div className="eyebrow">04 / {t('experienceEyebrow')}</div>
            <h2>{t('experienceTitle')}</h2>
          </div>
        </div>

        <div className="experience-list">
          {items.map((item) => (
            <article className="experience-item" key={item.id}>
              <div className="experience-period">{item.period}</div>
              <div className="experience-main">
                <h3>{item.title}</h3>
                {item.organizationUrl ? (
                  <a href={item.organizationUrl} target="_blank" rel="noreferrer">
                    {item.organization}
                  </a>
                ) : (
                  <div className="experience-organization">{item.organization}</div>
                )}
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
