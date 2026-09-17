import type { CaseSectionBlock } from '../../utils/caseSections'
import { hasCaseSection } from '../../utils/caseSections'
import { CaseIcon } from './CaseIcon'

type Stage = {
  id: string
  label: string
  section: CaseSectionBlock
}

export function CaseSystemFlow({
  label,
  flowLabel,
  stages,
}: {
  label: string
  flowLabel: string
  stages: Stage[]
}) {
  const visibleStages = stages.filter((stage) => hasCaseSection(stage.section))
  if (!visibleStages.length) return null

  return (
    <section id="system-flow" className="case-story-section case-system-flow-section">
      <div className="case-content-column">
        <div className="case-story-label">{flowLabel || label}</div>

        <div className="case-system-flow">
          {visibleStages.map((stage, index) => (
            <article className="case-system-flow-stage" key={stage.id}>
              <div className="case-system-flow-title">
                <span className="case-system-flow-icon">
                  <CaseIcon
                    name={
                      stage.id === 'hardware'
                        ? 'hardware'
                        : stage.id === 'embedded-logic'
                          ? 'embedded'
                          : stage.id === 'web-interface'
                            ? 'web'
                            : 'integration'
                    }
                    size={18}
                  />
                </span>
                <span className="case-system-flow-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3>{stage.section.title || stage.label}</h3>

              {stage.section.body.map((paragraph, paragraphIndex) => (
                <p key={`${stage.id}-body-${paragraphIndex}`}>{paragraph}</p>
              ))}

              {stage.section.items.map((item, itemIndex) => (
                <p className="case-system-flow-detail" key={`${stage.id}-item-${itemIndex}`}>
                  {item}
                </p>
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
