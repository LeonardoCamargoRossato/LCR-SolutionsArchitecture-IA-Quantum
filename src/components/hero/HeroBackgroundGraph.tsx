/**
 * Persistent, decorative background for all four Home Hero scenes.
 *
 * V7 uses a static, transparent SVG derivative: all perspective lines and
 * curves remain, while thousands of individually animated glyphs no longer
 * trigger full-image repaints every frame. One small compositor-only CSS
 * accent supplies subtle movement. The approved V6 SVG is retained intact.
 *
 * V8 selects a recolored static variant only for the light theme via ThemeProvider;
 * the V7 dark SVG is untouched and only one image is loaded per theme.
 * The legacy V5 SVG remains the load-error fallback.
 */
import { useTheme } from '../../providers/ThemeProvider'

const base = import.meta.env.BASE_URL
const optimized = `${base}assets/home/hero/lcr-hero-blue-code-v7-lite.svg`
const lightOptimized = `${base}assets/home/hero/lcr-hero-blue-code-v8-light-navy.svg`
const fallback = `${base}assets/home/hero/lcr-data-network-background.svg`

export function HeroBackgroundGraph() {
  const { theme } = useTheme()
  const source = theme === 'light' ? lightOptimized : optimized
  return (
    <div className="hero-v5-background hero-v6-background hero-v7-background" data-testid="hero-v5-background" aria-hidden="true">
      <div className="hero-v5-backdrop-fabric hero-v6-backdrop-fabric hero-v7-backdrop-fabric">
        <img
          className="hero-v5-backdrop-svg hero-v6-backdrop-svg"
          data-testid="hero-v6-blue-code"
          key={theme}
          src={source}
          alt=""
          width="1440"
          height="800"
          decoding="async"
          fetchPriority="high"
          onError={(event) => {
            const image = event.currentTarget
            if (!image.dataset.fallback) {
              image.dataset.fallback = 'true'
              image.src = fallback
            }
          }}
        />
        <span className="hero-v7-light-trace" aria-hidden="true" />
      </div>
      <span className="hero-v5-backdrop-vignette" />
    </div>
  )
}
