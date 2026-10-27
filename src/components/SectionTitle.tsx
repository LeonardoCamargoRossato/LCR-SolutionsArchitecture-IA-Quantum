
type Props = {
  eyebrow?: string
  title: string
  description?: string
  reveal?: 'left' | 'right' | 'scale' | 'fade'
}

export function SectionTitle({ eyebrow, title, description, reveal }: Props) {
  return (
    <div className="section-title" data-reveal={reveal}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
    </div>
  )
}
