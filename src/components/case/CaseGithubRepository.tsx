import { ExternalLink, Github } from 'lucide-react'

export function CaseGithubRepository({
  url,
  label,
}: {
  url: string
  label: string
}) {
  if (!url) return null

  return (
    <section className="case-story-section case-github-section">
      <div className="case-content-column">
        <div className="case-story-label">{label}</div>
        <a
          className="case-github-card"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="case-github-icon" aria-hidden="true">
            <Github size={23} />
          </span>
          <span className="case-github-copy">
            <strong>GitHub</strong>
            <span>{url}</span>
          </span>
          <ExternalLink size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
