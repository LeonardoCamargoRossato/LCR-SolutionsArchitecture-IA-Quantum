import type { Project } from '../types/project'

export function ProjectGallery({ project }: { project: Project }) {
  if (!project.gallery?.length) return null

  return (
    <section className="case-section">
      <div className="container">
        <div className="case-section-label">07</div>
        <div className="case-section-content">
          <h2>Gallery</h2>
          <div className="gallery-grid">
            {project.gallery.map((item, index) => (
              <figure className="gallery-item" key={`${item.label}-${index}`}>
                <div className="gallery-placeholder">
                  {item.image ? (
                    <img src={item.image} alt={`${project.title} — ${item.label}`} />
                  ) : (
                    <>
                      <img src={project.coverImage} alt="" aria-hidden="true" />
                      <div className="gallery-overlay">Screenshot slot</div>
                    </>
                  )}
                </div>
                <figcaption>{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
