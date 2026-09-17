import type { Project } from '../types/project'

export function ProjectHero({ project }: { project: Project }) {
  return (
    <section className={`case-hero ${project.theme === 'dark' ? 'case-hero-dark' : ''}`}>
      <div className="container">
        <div className="case-hero-grid">
          <div className="case-heading">
            <div className="eyebrow">{project.category}</div>
            <h1>{project.title}</h1>
            {project.subtitle && <p className="case-subtitle">{project.subtitle}</p>}
            <p className="case-description">{project.description}</p>

            <div className="tech-list case-tech">
              {project.technologies.map((tech) => <span key={tech}>{tech}</span>)}
            </div>

            <div className="case-actions">
              {project.links?.map((link) =>
                link.url ? (
                  <a
                    key={link.label}
                    className={`button ${link.kind === 'secondary' ? 'button-secondary' : ''}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label} ↗
                  </a>
                ) : (
                  <span key={link.label} className="button button-disabled" title="URL not added yet">
                    {link.label}
                  </span>
                ),
              )}
              {project.status === 'Private Platform' && (
                <span className="button button-disabled">Private Platform</span>
              )}
            </div>
          </div>

          <div className="case-index">
            <span>Status</span>
            <strong>{project.status}</strong>
          </div>
        </div>

        <div className="browser-frame case-cover">
          <div className="browser-bar">
            <span /><span /><span />
          </div>
          <img src={project.coverImage} alt={`${project.title} application interface`} />
        </div>
      </div>
    </section>
  )
}
