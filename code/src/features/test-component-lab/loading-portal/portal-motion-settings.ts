export const PORTAL_MOTION_DEFAULTS = {
  openMs: 1800, closeMs: 1800, lightSpeed: 1, lightIntensity: .72, activationMs: 450,
  loadMs: 5000, holdMs: 900, showCounter: true, reducedMotion: false, loop: false,
}
export type PortalMotionSettings = typeof PORTAL_MOTION_DEFAULTS
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min))
export const ease = (t: number) => t*t*(3-2*t)
