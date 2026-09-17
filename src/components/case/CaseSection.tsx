import type { ReactNode } from 'react'
import type { CaseSectionBlock } from '../../utils/caseSections'

export function CaseSection({
  id,
  label,
  section,
  accent = false,
  children,
}: {
  id: string
  label: string
  section: CaseSectionBlock
  accent?: boolean
  children?: ReactNode
}) {
  const heading = section.title || label

  return (
    <section id={id} className={`case-story-section${accent ? ' case-story-section-accent' : ''}`}>
      <div className="case-content-column">
        <div className="case-story-label">{heading}</div>

        {section.body.length > 0 && (
          <div className={`case-story-body-grid${section.body.length > 1 ? ' is-multi' : ''}`}>
            {section.body.map((paragraph, index) => (
              <p className="case-story-body" key={`${id}-body-${index}`}>{paragraph}</p>
            ))}
          </div>
        )}

        {children}
      </div>
    </section>
  )
}
