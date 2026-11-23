import { Pause, Play, RotateCcw, Copy, Check, Layers3, Sun, Moon } from 'lucide-react'
import type { LabComponentDefinition } from '../config/component-registry'
import type { PreviewSurface, WaveSettings } from '../../../components/test-component-lab/particle-wave/particle-wave-types'

type Props = {
  component: LabComponentDefinition
  settings: WaveSettings
  running: boolean
  surface: PreviewSurface
  copyStatus: string
  onRunning: () => void
  onReset: () => void
  onCopy: () => void
  onSurface: (surface: PreviewSurface) => void
}

export function LabPreview({ component, settings, running, surface, copyStatus, onRunning, onReset, onCopy, onSurface }: Props) {
  const Component = component.Component
  return (
    <section className="lcr-lab-preview-pane" aria-labelledby="lab-preview-title">
      <div className="lcr-lab-pane-heading">
        <div>
          <h2 id="lab-preview-title">Live Preview</h2>
          <p>Renderização em tempo real · {component.name}</p>
        </div>
        <span className="lcr-lab-renderer-pill">Canvas 2D · Adaptive FPS</span>
      </div>
      <div className="lcr-lab-preview-topbar">
        <div className="lcr-lab-segmented" role="group" aria-label="Modo de fundo">
          <button type="button" aria-pressed={surface === 'light'} onClick={() => onSurface('light')}><Sun size={15} aria-hidden="true" /> Claro</button>
          <button type="button" aria-pressed={surface === 'dark'} onClick={() => onSurface('dark')}><Moon size={15} aria-hidden="true" /> Escuro</button>
          <button type="button" aria-pressed={surface === 'transparent'} onClick={() => onSurface('transparent')}><Layers3 size={15} aria-hidden="true" /> Transparência</button>
        </div>
      </div>
      <div className={`lcr-lab-canvas-stage lcr-lab-canvas-stage--${surface}`}
        data-testid="lab-preview-stage"
        style={surface === 'transparent' ? undefined : { backgroundColor: settings.background }}>
        <Component settings={settings} running={running} />
        <div className="lcr-lab-canvas-caption" aria-hidden="true">
          <span>Particle Wave / V1</span><span>Procedural field</span>
        </div>
      </div>
      <div className="lcr-lab-preview-footer">
        <div className="lcr-lab-action-group">
          <button type="button" className="lcr-lab-action lcr-lab-action--primary"
            aria-label={running ? 'Pausar animação' : 'Reproduzir animação'}
            onClick={onRunning} data-testid="wave-play-pause">
            {running ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
            {running ? 'Pause' : 'Play'}
          </button>
          <button type="button" className="lcr-lab-action" onClick={onReset}
            data-testid="wave-reset"><RotateCcw size={16} aria-hidden="true" /> Reset</button>
          <button type="button" className="lcr-lab-action" onClick={onCopy}
            data-testid="wave-copy">
            {copyStatus === 'Configuração copiada.' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            Copy Configuration
          </button>
        </div>
        <p className="lcr-lab-inline-status" role="status" aria-live="polite">{copyStatus || (running ? 'Animação ativa' : 'Animação pausada')}</p>
      </div>
    </section>
  )
}
