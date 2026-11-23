/** Independent public Particle Wave contract — no lab or site dependencies. */
export type WaveSettings = {
  particleCount: number
  amplitude: number
  frequency: number
  speed: number
  size: number
  depth: number
  color: string
  background: string
  mouseInteraction: boolean
}

export type WavePresetId = 'codarox' | 'lcr-light' | 'lcr-dark'
export type PreviewSurface = 'light' | 'dark' | 'transparent'

export type ParticleWaveProps = {
  settings: WaveSettings
  running: boolean
}

export const WAVE_LIMITS = {
  particleCount: { min: 200, max: 4200, step: 100 },
  amplitude: { min: 0, max: 2.5, step: 0.05 },
  frequency: { min: 0.2, max: 5, step: 0.1 },
  speed: { min: 0, max: 2.5, step: 0.05 },
  size: { min: 0.5, max: 3.6, step: 0.1 },
  depth: { min: 0.3, max: 2.5, step: 0.1 },
} as const

/** Invalid or extreme values must never reach the drawing loop. */
export function clampWaveSettings(input: WaveSettings): WaveSettings {
  const numeric = (key: keyof typeof WAVE_LIMITS) => {
    const bounds = WAVE_LIMITS[key]
    const raw = input[key]
    return Number.isFinite(raw) ? Math.min(bounds.max, Math.max(bounds.min, raw)) : bounds.min
  }
  const validHex = (value: string, fallback: string) =>
    /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback
  return {
    particleCount: Math.round(numeric('particleCount') / 100) * 100,
    amplitude: numeric('amplitude'),
    frequency: numeric('frequency'),
    speed: numeric('speed'),
    size: numeric('size'),
    depth: numeric('depth'),
    color: validHex(input.color, '#35b5ff'),
    background: validHex(input.background, '#080f1e'),
    mouseInteraction: Boolean(input.mouseInteraction),
  }
}

export const WAVE_PRESETS: Record<WavePresetId, WaveSettings> = {
  codarox: {
    particleCount: 2600, amplitude: 1.75, frequency: 2.0, speed: 0.58,
    size: 1.35, depth: 1.5, color: '#5b6572', background: '#ffffff', mouseInteraction: true,
  },
  'lcr-light': {
    particleCount: 2400, amplitude: 1.45, frequency: 2.3, speed: 0.65,
    size: 1.45, depth: 1.6, color: '#205cbe', background: '#f6f9ff', mouseInteraction: true,
  },
  'lcr-dark': {
    particleCount: 2700, amplitude: 1.65, frequency: 2.35, speed: 0.72,
    size: 1.45, depth: 1.8, color: '#45bfff', background: '#080f1e', mouseInteraction: true,
  },
}
