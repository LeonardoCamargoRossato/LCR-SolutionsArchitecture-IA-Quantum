import type { Project } from '../types/project'
import { useI18n } from '../i18n/I18nProvider'

export function ProjectGallery({ project }: { project: Project }) {
  const { locale } = useI18n()
  if (!project.gallery?.length) return null

  return (
    <section className="case-section">
      <div className="container">
        <div className="case-section-label">07</div>
        <div className="case-section-content">
          <h2>{locale === 'pt-BR' ? 'Galeria' : 'Gallery'}</h2>
          <div className="gallery-grid">
            {project.gallery.map((item, index) => (
              <figure className="gallery-item" key={`${item.label}-${index}`}>
                <div className="gallery-placeholder">
                  {item.image ? (
                    <img src={item.image} alt={`${project.title} — ${item.label}`} />
                  ) : (
                    <>
                      <img src={project.coverImage} alt="" aria-hidden="true" />
                      <div className="gallery-overlay">{locale === 'pt-BR' ? 'Espaço para captura de tela' : 'Screenshot slot'}</div>
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
