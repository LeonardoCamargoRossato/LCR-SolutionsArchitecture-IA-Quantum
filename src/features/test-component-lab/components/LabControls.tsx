import type { WaveSettings, WavePresetId } from '../../../components/test-component-lab/particle-wave/particle-wave-types'
import { WAVE_LIMITS } from '../../../components/test-component-lab/particle-wave/particle-wave-types'

type NumericSetting = keyof typeof WAVE_LIMITS
const NUMERIC_FIELDS: { key: NumericSetting; label: string; unit?: string }[] = [
  { key: 'particleCount', label: 'Particle Count' },
  { key: 'amplitude', label: 'Wave Amplitude' },
  { key: 'frequency', label: 'Wave Frequency' },
  { key: 'speed', label: 'Animation Speed' },
  { key: 'size', label: 'Particle Size', unit: 'px' },
  { key: 'depth', label: 'Depth' },
]
const PRESETS: { id: WavePresetId; title: string; details: string }[] = [
  { id: 'codarox', title: 'Codarox Inspired', details: 'Mono / White' },
  { id: 'lcr-light', title: 'LCR Light', details: 'Azure / Light' },
  { id: 'lcr-dark', title: 'LCR Dark', details: 'Cyan / Navy' },
]

type Props = {
  settings: WaveSettings
  preset: WavePresetId
  displayedCount: number
  onPreset: (id: WavePresetId) => void
  onSetting: <K extends keyof WaveSettings>(key: K, value: WaveSettings[K]) => void
  onParticleCount: (count: number) => void
}

export function LabControls({ settings, preset, displayedCount, onPreset, onSetting, onParticleCount }: Props) {
  return (
    <div className="lcr-lab-control-body">
      <fieldset className="lcr-lab-fieldset">
        <legend>Visual Presets</legend>
        <div className="lcr-lab-preset-list">
          {PRESETS.map(({ id, title, details }) => (
            <button key={id} type="button" className="lcr-lab-preset"
              aria-pressed={preset === id} onClick={() => onPreset(id)}>
              <span className={`lcr-lab-preset-swatch lcr-lab-preset-swatch--${id}`} aria-hidden="true" />
              <span><strong>{title}</strong><small>{details}</small></span>
              <span className="lcr-lab-choice-marker" aria-hidden="true">{preset === id ? '●' : '○'}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="lcr-lab-fieldset">
        <legend>Motion Parameters</legend>
        <div className="lcr-lab-range-list">
          {NUMERIC_FIELDS.map(({ key, label, unit }) => {
            const bounds = WAVE_LIMITS[key]
            const value = key === 'particleCount' ? displayedCount : settings[key]
            return (
              <div className="lcr-lab-range-field" key={key}>
                <div className="lcr-lab-range-heading">
                  <label htmlFor={`lab-${key}`}>{label}</label>
                  <output htmlFor={`lab-${key}`} data-testid={`value-${key}`}>
                    {value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}{unit ? ` ${unit}` : ''}
                  </output>
                </div>
                <input id={`lab-${key}`} type="range" min={bounds.min} max={bounds.max}
                  step={bounds.step} value={value}
                  onChange={(e) => {
                    const number = Number(e.target.value)
                    if (key === 'particleCount') onParticleCount(number)
                    else onSetting(key, number)
                  }} />
              </div>
            )
          })}
        </div>
        <p className="lcr-lab-hint">As alterações de quantidade são aplicadas com breve debounce. Em telas menores, o renderizador limita automaticamente a densidade.</p>
      </fieldset>

      <fieldset className="lcr-lab-fieldset">
        <legend>Appearance & Interaction</legend>
        <div className="lcr-lab-color-row">
          <label htmlFor="lab-particle-color">Particle Color</label>
          <div className="lcr-lab-color-input">
            <input id="lab-particle-color" type="color" value={settings.color}
              onChange={(e) => onSetting('color', e.target.value)} />
            <code>{settings.color.toUpperCase()}</code>
          </div>
        </div>
        <div className="lcr-lab-color-row">
          <label htmlFor="lab-background-color">Background</label>
          <div className="lcr-lab-color-input">
            <input id="lab-background-color" type="color" value={settings.background}
              onChange={(e) => onSetting('background', e.target.value)} />
            <code>{settings.background.toUpperCase()}</code>
          </div>
        </div>
        <label className="lcr-lab-toggle-row" htmlFor="lab-mouse">
          <span><strong>Mouse Interaction</strong><small>Resposta suave ao movimento do cursor</small></span>
          <input id="lab-mouse" type="checkbox" checked={settings.mouseInteraction}
            onChange={(e) => onSetting('mouseInteraction', e.target.checked)} />
        </label>
      </fieldset>
    </div>
  )
}
