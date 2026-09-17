import type { CaseSectionBlock } from '../../utils/caseSections'
import { CaseSection } from './CaseSection'

export function CaseArchitecture({ label, section }: { label: string; section: CaseSectionBlock }) {
  return (
    <CaseSection id="architecture" label={label} section={section}>
      {section.items.length > 0 && (
        <div className="case-architecture-grid">
          {section.items.map((item, index) => (
            <div className="case-architecture-item" key={`${item}-${index}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      )}
    </CaseSection>
  )
}
