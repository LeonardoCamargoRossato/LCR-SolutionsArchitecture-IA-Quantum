export type CaseFact = {
  label: string
  value: string
  icon?: string
}

export function CaseFacts({ facts }: { facts: CaseFact[] }) {
  const visible = facts.filter((fact) => (fact.value ?? '').trim().length > 0)
  if (!visible.length) return null

  return (
    <section className="case-facts-wrap" aria-label="Project facts">
      <div className="site-container">
        <div className="case-facts">
          {visible.map((fact) => (
            <div className="case-fact" key={`${fact.label}-${fact.value}`}>
              <div className="case-fact-heading">
                <span>{fact.label}</span>
              </div>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
