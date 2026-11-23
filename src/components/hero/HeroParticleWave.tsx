import type { CSSProperties } from 'react'
import { ParticleWave } from '../test-component-lab/particle-wave/ParticleWave'
import { HERO_PARTICLE_COMPOSITION } from '../../config/heroParticleWave'

const { canvas, transform, settings, direction } = HERO_PARTICLE_COMPOSITION

// The Lab editor stores its transform in 1600×900 virtual pixels.
// Convert to percentages so Home preserves the composition at every viewport.
const waveStyle: CSSProperties = {
  left: `${(transform.x / canvas.width) * 100}%`,
  top: `${(transform.y / canvas.height) * 100}%`,
  width: `${(transform.width / canvas.width) * 100}%`,
  height: `${(transform.height / canvas.height) * 100}%`,
  transform: `rotate(${transform.rotation}deg) scale(${transform.flipX ? -1 : 1}, ${transform.flipY ? -1 : 1})`,
  transformOrigin: 'center',
}

/**
 * Live, transparent Canvas 2D effect from the existing LCR Test Component Lab.
 * The static approved Hero SVG remains behind it. The actual React content,
 * scene controls and project actions remain above it; no screenshot overlay.
 */
export function HeroParticleWave({ playing }: { playing: boolean }) {
  return (
    <div
      className="hero-v13-particle-wave"
      data-testid="hero-v13-particle-wave"
      data-preset="lcr-dark"
      data-component-source="lcr-test-component-lab-v2"
      aria-hidden="true"
      style={waveStyle}
    >
      <ParticleWave
        settings={settings}
        running={playing}
        direction={direction}
      />
    </div>
  )
}
