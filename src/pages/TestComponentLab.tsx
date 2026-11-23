import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FlaskConical, SlidersHorizontal } from 'lucide-react'
import { LabControls } from '../features/test-component-lab/components/LabControls'
import { LabPreview } from '../features/test-component-lab/components/LabPreview'
import { COMPONENT_REGISTRY } from '../features/test-component-lab/config/component-registry'
import {
  WAVE_PRESETS,
  clampWaveSettings,
  type PreviewSurface,
  type WavePresetId,
  type WaveSettings,
} from '../components/test-component-lab/particle-wave/particle-wave-types'
import '../features/test-component-lab/styles/test-component-lab.css'

const PRIMARY_COMPONENT = COMPONENT_REGISTRY[0]
const initialPreset: WavePresetId = 'lcr-dark'

export function TestComponentLab() {
  const [componentId, setComponentId] = useState(PRIMARY_COMPONENT.id)
  const component = COMPONENT_REGISTRY.find((entry) => entry.id === componentId) ?? PRIMARY_COMPONENT
  const [preset, setPreset] = useState<WavePresetId>(initialPreset)
  const [settings, setSettings] = useState<WaveSettings>({ ...component.defaultSettings })
  const [displayedCount, setDisplayedCount] = useState(settings.particleCount)
  const [surface, setSurface] = useState<PreviewSurface>('dark')
  const [running, setRunning] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    const previous = document.title
    document.title = 'LCR Test Component Lab | Particle Wave'
    return () => { document.title = previous }
  }, [])

  // Particle count is the expensive setting; debounce reconstruction of the field.
  useEffect(() => {
    if (displayedCount === settings.particleCount) return
    const timer = window.setTimeout(() => {
      setSettings((current) => clampWaveSettings({ ...current, particleCount: displayedCount }))
    }, 170)
    return () => window.clearTimeout(timer)
  }, [displayedCount, settings.particleCount])

  function updateSetting<K extends keyof WaveSettings>(key: K, value: WaveSettings[K]) {
    setCopyStatus('')
    setSettings((current) => clampWaveSettings({ ...current, [key]: value }))
  }

  const choosePreset = (next: WavePresetId) => {
    const values = { ...WAVE_PRESETS[next] }
    setPreset(next)
    setSettings(values)
    setDisplayedCount(values.particleCount)
    setSurface(next === 'lcr-dark' ? 'dark' : 'light')
    setCopyStatus('')
  }

  const reset = () => {
    const values = { ...WAVE_PRESETS[preset] }
    setSettings(values)
    setDisplayedCount(values.particleCount)
    setSurface(preset === 'lcr-dark' ? 'dark' : 'light')
    setCopyStatus('Parâmetros originais restaurados.')
  }

  const setPreviewSurface = (next: PreviewSurface) => {
    setSurface(next)
    if (next !== 'transparent') {
      updateSetting('background', next === 'light' ? '#f6f9ff' : '#080f1e')
    }
  }

  const copyConfiguration = async () => {
    const payload = JSON.stringify({
      componentId: component.id,
      preset,
      surface,
      settings,
    }, null, 2)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(payload)
      setCopyStatus('Configuração copiada.')
    } catch {
      // Clipboard API requires a secure context. Never report success on denial.
      setCopyStatus('Não foi possível copiar. Permita o acesso à área de transferência e tente novamente.')
    }
  }

  return (
    <main className="lcr-lab" data-testid="test-component-lab">
      <a className="lcr-lab-skip-link" href="#lab-preview-title">Pular para visualização</a>
      <div className="lcr-lab-shell">
        <header className="lcr-lab-header">
          <div className="lcr-lab-brand">
            <div className="lcr-lab-mark" aria-hidden="true"><FlaskConical size={24} strokeWidth={1.8} /></div>
            <div>
              <h1>LCR Test Component Lab</h1>
              <p>Interactive Component Development &amp; Testing</p>
            </div>
          </div>
          <Link to="/" className="lcr-lab-back"><ArrowLeft size={16} aria-hidden="true" /> Retornar ao LCR Portfolio</Link>
        </header>

        <div className="lcr-lab-title-row">
          <div>
            <p className="lcr-lab-intro">Teste componentes reais de forma independente, ajuste parâmetros e valide o comportamento antes de integrar ao portfólio.</p>
          </div>
          <span className="lcr-lab-status-pill"><span aria-hidden="true" /> Ambiente experimental público</span>
        </div>

        <div className="lcr-lab-workspace">
          <LabPreview component={component} settings={settings} running={running}
            surface={surface} copyStatus={copyStatus}
            onRunning={() => { setCopyStatus(''); setRunning((value) => !value) }}
            onReset={reset} onCopy={() => { void copyConfiguration() }}
            onSurface={setPreviewSurface} />

          <aside className="lcr-lab-sidebar" aria-label="Painel de parâmetros">
            <details className="lcr-lab-controls-details" open>
              <summary><SlidersHorizontal size={19} aria-hidden="true" /> Component Controls <span className="lcr-lab-details-hint">Mostrar / ocultar</span></summary>
              <div className="lcr-lab-sidebar-content">
                <label className="lcr-lab-selector-label" htmlFor="lab-component">Component</label>
                <select id="lab-component" value={component.id} onChange={(event) => setComponentId(event.target.value)}
                  data-testid="lab-component-select">
                  {COMPONENT_REGISTRY.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                </select>
                <div className="lcr-lab-component-info">
                  <span>{component.category}</span>
                  <p>{component.description}</p>
                </div>
                <LabControls settings={settings} preset={preset} displayedCount={displayedCount}
                  onPreset={choosePreset} onSetting={updateSetting}
                  onParticleCount={(value) => { setCopyStatus(''); setDisplayedCount(value) }} />
              </div>
            </details>
          </aside>
        </div>
        <footer className="lcr-lab-footer">
          <span>Local rendering · No authentication · No external APIs</span>
          <span>V1 / Particle Wave · LCR Workflow</span>
        </footer>
      </div>
    </main>
  )
}
