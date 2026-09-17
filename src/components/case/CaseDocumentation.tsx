import { Download, FileText, Maximize2 } from 'lucide-react'
import { useState } from 'react'
import { ProjectPdfViewer } from '../ProjectPdfViewer'

type Props = {
  url: string
  title: string
  sectionLabel: string
  viewLabel: string
  downloadLabel: string
}

export function CaseDocumentation({
  url,
  title,
  sectionLabel,
  viewLabel,
  downloadLabel,
}: Props) {
  const [open, setOpen] = useState(false)

  if (!url) return null

  return (
    <>
      <section className="case-story-section case-documentation-section">
        <div className="case-content-column">
          <div className="case-story-label">{sectionLabel}</div>
          <div className="case-documentation-card">
            <div className="case-documentation-icon" aria-hidden="true">
              <FileText size={24} />
            </div>
            <div className="case-documentation-copy">
              <strong>{title}</strong>
              <span>PDF</span>
            </div>
            <div className="case-documentation-actions">
              <button
                type="button"
                className="button"
                onClick={() => setOpen(true)}
              >
                <Maximize2 size={16} />
                {viewLabel}
              </button>
              <a
                className="button button-secondary"
                href={url}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={16} />
                {downloadLabel}
              </a>
            </div>
          </div>
        </div>
      </section>

      <ProjectPdfViewer
        open={open}
        url={url}
        title={title}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
