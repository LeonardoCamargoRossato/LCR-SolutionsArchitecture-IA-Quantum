import { useState } from 'react'
import type { WorkProcessStep } from '../domain/models/SiteContent'
import type { Locale } from '../i18n/types'

export function WorkflowProcessBrowser({
  steps,
  locale,
}: {
  steps: WorkProcessStep[]
  locale: Locale
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = steps[selectedIndex]
  const pt = locale === 'pt-BR'

  if (!selected) return null

  return (
    <section className="workflow-process-browser-section" aria-labelledby="workflow-process-browser-title">
      <div className="site-container">
        <header className="workflow-process-browser-heading">
          <div className="eyebrow">{pt ? 'Processo de engenharia' : 'Engineering process'}</div>
          <h2 id="workflow-process-browser-title">LCR Workflow</h2>
          <p>
            {pt
              ? 'Selecione uma etapa à esquerda para ver responsabilidades, entradas, entregas, verificação e condição de avanço.'
              : 'Select a stage on the left to inspect responsibilities, inputs, outputs, verification and advancement conditions.'}
          </p>
        </header>

        <div className="workflow-process-browser">
          <div className="workflow-process-tabs" role="tablist" aria-label={pt ? 'Etapas do LCR Workflow' : 'LCR Workflow stages'}>
            {steps.map((step, index) => (
              <button
                key={step.step}
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                className={index === selectedIndex ? 'is-active' : ''}
                onClick={() => setSelectedIndex(index)}
              >
                <span>{step.step}</span>
                <strong>{step.title}</strong>
                <small>{step.description}</small>
              </button>
            ))}
          </div>

          <article className="workflow-process-detail" role="tabpanel" aria-live="polite">
            <div className="workflow-process-detail-kicker">
              {pt ? 'Etapa' : 'Stage'} {selected.step}
            </div>
            <h3>{selected.title}</h3>
            <p className="workflow-process-detail-lead">{selected.description}</p>

            <dl className="workflow-process-detail-grid">
              {selected.owner && (
                <div>
                  <dt>{pt ? 'Responsável' : 'Owner'}</dt>
                  <dd>{selected.owner}</dd>
                </div>
              )}
              {selected.inputs && (
                <div>
                  <dt>{pt ? 'Entradas' : 'Inputs'}</dt>
                  <dd>{selected.inputs}</dd>
                </div>
              )}
              {selected.outputs && (
                <div>
                  <dt>{pt ? 'Artefatos produzidos' : 'Outputs'}</dt>
                  <dd>{selected.outputs}</dd>
                </div>
              )}
              {selected.verification && (
                <div>
                  <dt>{pt ? 'Verificação' : 'Verification'}</dt>
                  <dd>{selected.verification}</dd>
                </div>
              )}
              {selected.transition && (
                <div className="is-wide">
                  <dt>{pt ? 'Avançar ou retornar' : 'Advance or return'}</dt>
                  <dd>{selected.transition}</dd>
                </div>
              )}
            </dl>
          </article>
        </div>
      </div>
    </section>
  )
}
