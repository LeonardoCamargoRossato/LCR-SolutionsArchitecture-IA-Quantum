import { Maximize2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Locale } from '../i18n/types'
import { localizedWorkflowDiagram, workflowDiagrams } from '../data/workflowResources'
import { ImageLightbox } from './ImageLightbox'

export function WorkflowDocuments({ locale }: { locale: Locale }) {
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
    <section className="workflow-documents-section workflow-documents-first" aria-labelledby="workflow-documents-title">
      <div className="site-container workflow-page-resources">
        <header className="workflow-documents-heading">
          <div className="eyebrow">{pt ? 'Visão geral' : 'Overview'}</div>
          <h2 id="workflow-documents-title">
            {pt ? 'Diagrama do LCR Framework' : 'LCR Framework diagram'}
          </h2>
          <p>
            {pt
              ? 'O diagrama resume a estrutura do método: objetivo, papéis especializados, integrações, organização do repositório, documentação e registros de decisão.'
              : 'The diagram summarizes the method structure: objective, specialized roles, integrations, repository organization, documentation and decision records.'}
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
                  alt={text.title}
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
                <p>
                  {pt
                    ? 'Mostra, em uma única visão, quem participa do fluxo, como as ferramentas se conectam e como o projeto é organizado para planejamento, desenvolvimento, auditoria e evolução.'
                    : 'Shows in one view who participates in the flow, how the tools connect, and how the project is organized for planning, development, audit and evolution.'}
                </p>

                <div className="workflow-diagram-actions">
                  <button type="button" className="button" onClick={() => setOpenIndex(index)}>
                    {pt ? 'Abrir diagrama' : 'Open diagram'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <ImageLightbox
        items={lightboxItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
        allowDownload={false}
        ariaLabel={pt ? 'Visualizador do diagrama do LCR Workflow' : 'LCR Workflow diagram viewer'}
      />
    </section>
  )
}
