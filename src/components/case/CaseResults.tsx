import type { CaseSectionBlock } from '../../utils/caseSections'

export function CaseResults({ label, section }: { label: string; section: CaseSectionBlock }) {
  return (
    <section id="results" className="case-story-section">
      <div className="case-content-column">
        <div className="case-results-box">
          <div className="case-story-label">{section.title || label}</div>

          {section.body.length > 0 && (
            <div className={`case-story-body-grid${section.body.length > 1 ? ' is-multi' : ''}`}>
              {section.body.map((paragraph, index) => (
                <p className="case-story-body" key={`results-body-${index}`}>{paragraph}</p>
              ))}
            </div>
          )}

          {section.items.length > 0 && (
            <ul className="case-results-list">
              {section.items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
