import type { WaveSettings } from '../components/test-component-lab/particle-wave/particle-wave-types'

/**
 * Approved LCR Test Component Lab V2 export (2026-11-23).
 *
 * The 1600×900 editor coordinates are normalized by HeroParticleWave to
 * percentage-based layout; only the wave is mirrored. The screenshot in the
 * exported ZIP was an editing reference, NOT a site image or production asset.
 * Keep this configuration alongside the Home feature, separate from Lab state.
 */
export const HERO_PARTICLE_COMPOSITION: {
  canvas: { width: number; height: number }
  transform: {
    x: number; y: number; width: number; height: number
    rotation: number; flipX: boolean; flipY: boolean
  }
  settings: WaveSettings
  direction: 'forward' | 'reverse'
} = {
  canvas: { width: 1600, height: 900 },
  transform: {
    x: -25.15489467162331,
    y: -100.24783147459728,
    width: 1773.2342007434943,
    height: 997.2242874845106,
    rotation: 0,
    flipX: true,
    flipY: false,
  },
  settings: {
    particleCount: 900,
    amplitude: 1.65,
    frequency: 2.35,
    speed: 0.72,
    size: 0.6,
    depth: 1.8,
    color: '#45bfff',
    background: '#f6f9ff',
    mouseInteraction: true,
  },
  direction: 'forward',
}
