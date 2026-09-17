import type { CaseSectionBlock } from '../../utils/caseSections'
import { CaseSection } from './CaseSection'

export function CaseTags({
  id,
  label,
  section,
  fallbackItems = [],
}: {
  id: string
  label: string
  section: CaseSectionBlock
  fallbackItems?: string[]
}) {
  const items = section.items.length > 0 ? section.items : fallbackItems
  const isRole = id === 'role'

  return (
    <CaseSection id={id} label={label} section={section}>
      {items.length > 0 && (
        isRole ? (
          <div className="case-role-lines">
            {items.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
          </div>
        ) : (
          <div className="case-tag-cloud">
            {items.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
          </div>
        )
      )}
    </CaseSection>
  )
}
