import type { ComponentType } from 'react'
import { ParticleWave } from '../../../components/test-component-lab/particle-wave/ParticleWave'
import {
  WAVE_PRESETS,
  type ParticleWaveProps,
  type WaveSettings,
} from '../../../components/test-component-lab/particle-wave/particle-wave-types'

export type LabComponentDefinition = {
  id: string
  name: string
  description: string
  category: string
  Component: ComponentType<ParticleWaveProps>
  defaultSettings: WaveSettings
}

/** Single source of truth; only add a future component when actually implemented. */
export const COMPONENT_REGISTRY: LabComponentDefinition[] = [
  {
    id: 'particle-wave',
    name: 'Particle Wave',
    description: 'Campo de partículas com ondas senoidais e perspectiva espacial.',
    category: 'Motion / Generative',
    Component: ParticleWave,
    defaultSettings: WAVE_PRESETS['lcr-dark'],
  },
]
