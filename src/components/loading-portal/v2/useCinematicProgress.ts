import { useEffect, useState } from 'react'

export const PORTAL_CHARGE_MS = 2000
export const PORTAL_OPENING_MS = 3000
const STEP_MS = PORTAL_CHARGE_MS / 100
const COMPLETE_HOLD_MS = 180

type Options = { enabled: boolean; visible: boolean; ready: boolean; paused: boolean; reducedMotion: boolean }

/** Presentation clock, deliberately separate from verified resource readiness.
 * One committed integer per tick; no catch-up jumps after a stalled frame.
 * Begin only when the counter is visible. Hold at 99 until real readiness.
 * No timer remains running after the sequence, on unmount or in a hidden tab.
 */
export function useCinematicProgress({enabled, visible, ready, paused, reducedMotion}:Options) {
  const [percent,setPercent] = useState(0)
  const [held,setHeld] = useState(false)
  useEffect(() => {
    if (!enabled || !visible || paused || reducedMotion || held) return
    if (percent >= 99 && !ready) return
    const timer = window.setTimeout(() => {
      if (percent === 100) setHeld(true)
      else setPercent(p => Math.min(100,p+1))
    }, percent === 100 ? COMPLETE_HOLD_MS : STEP_MS)
    return () => window.clearTimeout(timer)
  }, [enabled,visible,ready,paused,reducedMotion,percent,held])
  // Reduced motion bypasses the purely decorative delay, not real readiness.
  if (reducedMotion) return {percent: ready ? 100 : 0, complete: ready}
  return {percent, complete: held && ready}
}
