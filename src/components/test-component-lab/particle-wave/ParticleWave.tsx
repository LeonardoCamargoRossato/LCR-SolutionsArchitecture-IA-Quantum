import { useEffect, useRef, useState } from 'react'
import {
  clampWaveSettings,
  type ParticleWaveProps,
} from './particle-wave-types'
import './particle-wave.css'

/**
 * Standalone Canvas 2D renderer. No WebGL context, Three.js, remote library,
 * timers tied to React state, or React updates on animation frames.
 *
 * The particle field is deterministic and uses a perspective projection of
 * two continuous sinusoidal waves. All resources are released on unmount.
 */
export function ParticleWave({ settings, running }: ParticleWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const phaseRef = useRef(0)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!context) {
      setSupported(false)
      return
    }

    const safe = clampWaveSettings(settings)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isMobile = window.matchMedia('(max-width: 700px)').matches
    const count = Math.min(safe.particleCount, isMobile ? 1700 : 4200)
    const columns = Math.ceil(Math.sqrt(count * 1.7))
    const rows = Math.ceil(count / columns)
    const particles = new Float32Array(count * 3)
    const jitter = (seed: number) => {
      const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453
      return value - Math.floor(value)
    }

    for (let i = 0; i < count; i++) {
      const col = i % columns
      const row = Math.floor(i / columns)
      particles[i * 3] = ((col + (jitter(i + 13) - .5) * .55) / Math.max(1, columns - 1)) * 2 - 1
      particles[i * 3 + 1] = ((row + (jitter(i + 37) - .5) * .5) / Math.max(1, rows - 1)) * 2 - 1
      particles[i * 3 + 2] = jitter(i + 103)
    }

    let frame = 0
    let lastFrame = 0
    let raf = 0
    let visible = true
    let disposed = false
    let width = 1
    let height = 1
    let motionReduced = reduced.matches
    const targetInterval = 1000 / (isMobile ? 24 : count > 3000 ? 28 : 36)

    const paint = () => {
      if (disposed || width <= 0 || height <= 0) return
      context.clearRect(0, 0, width, height)
      context.fillStyle = safe.color
      const cursor = safe.mouseInteraction ? pointerRef.current : { x: 0, y: 0 }
      const time = phaseRef.current
      // Draw distant points first; perspective creates visual depth.
      for (let i = 0; i < count; i++) {
        const x = particles[i * 3]
        const z = particles[i * 3 + 1]
        const seed = particles[i * 3 + 2]
        const radial = Math.hypot(x * 1.25, z * .85)
        const wave =
          Math.sin(x * safe.frequency * 3.5 + time - z * 1.4) *
          Math.cos(z * safe.frequency * 2.5 - time * .74) +
          .38 * Math.sin(radial * safe.frequency * 7 - time * 1.2)
        const pointerDistance = Math.hypot(x - cursor.x, z - cursor.y)
        const pointerLift = safe.mouseInteraction ? Math.exp(-pointerDistance * 6) * .50 : 0
        const rise = (wave * .6 + pointerLift) * safe.amplitude
        const perspective = 1 + z * safe.depth * .20
        const screenX = width * (.5 + x * .43 * perspective + cursor.x * .025 * (1 - z))
        const screenY = height * (.57 + z * safe.depth * .22 - rise * .095)
        if (screenX < -8 || screenX > width + 8 || screenY < -8 || screenY > height + 8) continue
        const dotSize = Math.max(.65, safe.size * (.64 + seed * .83) * (1 + z * .27))
        // Three opacity bands reduce state changes versus per-point gradients.
        const band = (i + Math.floor(seed * 5)) % 4
        context.globalAlpha = band === 0 ? .34 : band === 1 ? .52 : band === 2 ? .72 : .92
        if (dotSize < 2.25) context.fillRect(screenX, screenY, dotSize, dotSize)
        else {
          context.beginPath()
          context.arc(screenX, screenY, dotSize * .5, 0, Math.PI * 2)
          context.fill()
        }
      }
      context.globalAlpha = 1
      frame++
      if (frame === 1 || frame % 18 === 0) {
        canvas.dataset.renderedFrames = String(frame)
      }
      canvas.dataset.ready = 'true'
    }

    const setSize = () => {
      if (disposed) return
      const bounds = canvas.getBoundingClientRect()
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5)
      const pixelWidth = Math.max(1, Math.round(width * dpr))
      const pixelHeight = Math.max(1, Math.round(height * dpr))
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      paint()
    }

    const allowed = () => running && visible && !document.hidden && !motionReduced
    const tick = (now: number) => {
      raf = 0
      if (disposed || !allowed()) return
      if (now - lastFrame >= targetInterval) {
        const dt = lastFrame ? Math.min(now - lastFrame, 80) : targetInterval
        phaseRef.current += dt * .001 * safe.speed * 2.3
        lastFrame = now
        paint()
      }
      raf = requestAnimationFrame(tick)
    }
    const refresh = () => {
      canvas.dataset.motion = motionReduced ? 'reduced' : running ? 'playing' : 'paused'
      if (!allowed()) {
        if (raf) cancelAnimationFrame(raf)
        raf = 0
        lastFrame = 0
        paint()
      } else if (!raf) {
        lastFrame = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const onReduced = () => {
      motionReduced = reduced.matches
      refresh()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      refresh()
    }, { threshold: .01 })
    const resize = new ResizeObserver(setSize)

    resize.observe(canvas)
    observer.observe(canvas)
    document.addEventListener('visibilitychange', refresh)
    reduced.addEventListener('change', onReduced)
    setSize()
    refresh()
    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      resize.disconnect()
      observer.disconnect()
      document.removeEventListener('visibilitychange', refresh)
      reduced.removeEventListener('change', onReduced)
      canvas.dataset.ready = 'false'
    }
  }, [settings, running])

  if (!supported) {
    return (
      <div className="lcr-wave-fallback" role="status" data-testid="wave-static-fallback">
        <strong>Prévia estática</strong>
        <p>Canvas não está disponível neste navegador. Tente outro navegador para ativar a onda de partículas.</p>
        <div className="lcr-wave-static-arc" aria-hidden="true" />
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="lcr-wave-canvas"
      data-testid="particle-wave-canvas"
      role="img"
      aria-label="Onda tridimensional de partículas com movimentos senoidais, perspectiva e reação opcional ao cursor."
      onPointerMove={(event) => {
        if (!settings.mouseInteraction) return
        const rect = event.currentTarget.getBoundingClientRect()
        pointerRef.current.x = ((event.clientX - rect.left) / rect.width - .5) * 2
        pointerRef.current.y = ((event.clientY - rect.top) / rect.height - .5) * 2
      }}
      onPointerLeave={() => { pointerRef.current = { x: 0, y: 0 } }}
    />
  )
}
