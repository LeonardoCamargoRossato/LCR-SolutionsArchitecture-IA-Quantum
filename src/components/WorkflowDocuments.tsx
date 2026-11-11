import { ExternalLink, Maximize2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Locale } from '../i18n/types'
import { localizedWorkflowDiagram, workflowDiagrams } from '../data/workflowResources'
import { ImageLightbox } from './ImageLightbox'
import { WorkflowManual } from './WorkflowManual'

export function WorkflowDocuments({ markdown, locale }: { markdown: string; locale: Locale }) {
  const pt = locale === 'pt-BR'
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const localized = useMemo(
    () => workflowDiagrams.map((item) => ({ item, text: localizedWorkflowDiagram(item, locale) })),
    [locale],
  )

  const lightboxItems = localized.map(({ item, text }) => ({
    src: `${import.meta.env.BASE_URL}${item.publicPath}`,
    alt: text.title,
    downloadName: item.originalName,
  }))

  return (
    <section className="workflow-documents-section" aria-labelledby="workflow-documents-title">
      <div className="site-container workflow-page-resources">
        <header className="workflow-documents-heading">
          <div className="eyebrow">{pt ? 'Documentação visual' : 'Visual documentation'}</div>
          <h2 id="workflow-documents-title">
            {pt ? 'Documentos e diagramas do LCR Framework' : 'LCR Framework documents and diagrams'}
          </h2>
          <p>
            {pt
              ? 'Estes materiais documentam como o método organiza papéis, agentes, orquestração, decisões, verificação e publicação.'
              : 'These materials document how the method organizes roles, agents, orchestration, decisions, verification and publication.'}
          </p>
        </header>

        <div className="workflow-diagram-grid">
          {localized.map(({ item, text }, index) => (
            <article className="workflow-diagram-card" key={item.id}>
              <button
                className="workflow-diagram-preview"
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={pt ? `Abrir diagrama: ${text.title}` : `Open diagram: ${text.title}`}
              >
                <img
                  src={`${import.meta.env.BASE_URL}${item.publicPath}`}
                  alt=""
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  decoding="async"
                />
                <span><Maximize2 size={18} /> {pt ? 'Ampliar' : 'Enlarge'}</span>
              </button>
              <div className="workflow-diagram-copy">
                <span>{text.category}</span>
                <h3>{text.title}</h3>
                <p>{text.description}</p>
                <div className="workflow-diagram-actions">
                  <button type="button" className="button" onClick={() => setOpenIndex(index)}>
                    {pt ? 'Abrir diagrama' : 'Open diagram'}
                  </button>
                  <a
                    className="button button-secondary"
                    href={`${import.meta.env.BASE_URL}${item.publicPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pt ? 'Abrir original' : 'Open original'} <ExternalLink size={14} />
                  </a>
                </div>
                <small>{item.originalName} · {(item.sizeBytes / 1024 / 1024).toFixed(2)} MB</small>
              </div>
            </article>
          ))}
        </div>

        <div className="workflow-documents-manual">
          <WorkflowManual markdown={markdown} locale={locale} />
        </div>
      </div>

      <ImageLightbox
        items={lightboxItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
        allowDownload
        ariaLabel={pt ? 'Visualizador de diagramas do LCR Workflow' : 'LCR Workflow diagram viewer'}
      />
    </section>
  )
}
