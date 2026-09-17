
type Props = {
  eyebrow?: string
  title: string
  description?: string
}

export function SectionTitle({ eyebrow, title, description }: Props) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
    </div>
  )
}
