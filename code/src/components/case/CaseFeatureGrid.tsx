import type { CaseSectionBlock } from '../../utils/caseSections'
import { CaseSection } from './CaseSection'

export function CaseFeatureGrid({ label, section }: { label: string; section: CaseSectionBlock }) {
  return (
    <CaseSection id="features" label={label} section={section}>
      {section.items.length > 0 && (
        <div className="case-feature-grid">
          {section.items.map((item, index) => (
            <div className="case-feature-item" key={`${item}-${index}`}>
              <span aria-hidden="true">✓</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      )}
    </CaseSection>
  )
}
