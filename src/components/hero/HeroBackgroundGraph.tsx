/**
 * Persistent, decorative background for all four Home Hero scenes.
 *
 * The approved SVG is a genuine transparent vector asset with internal
 * CSS/SMIL animations and prefers-reduced-motion support. It loads as an
 * image, keeping 3,000+ glyphs out of the React component tree.
 *
 * V5's original SVG remains in Git as a recoverable fallback.
 */
const base = import.meta.env.BASE_URL
const animated = `${base}assets/home/hero/lcr-hero-blue-code-v1.svg`
const fallback = `${base}assets/home/hero/lcr-data-network-background.svg`

export function HeroBackgroundGraph() {
  return (
    <div className="hero-v5-background hero-v6-background" data-testid="hero-v5-background" aria-hidden="true">
      <div className="hero-v5-backdrop-fabric hero-v6-backdrop-fabric">
        <img
          className="hero-v5-backdrop-svg hero-v6-backdrop-svg"
          data-testid="hero-v6-blue-code"
          src={animated}
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
      </div>
      <span className="hero-v5-backdrop-vignette" />
    </div>
  )
}
