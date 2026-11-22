import { useEffect, useState } from 'react'
import { animeFinderAssetRoot, animeFinderScreenshots } from '../data/animeFinderGallery'

/**
 * Check for a *complete*, atomic asset deployment once per page load.
 * Vite may return its HTML SPA fallback with HTTP 200 for missing files;
 * therefore a 200 response alone never counts as an installed gallery.
 * Until a validated manifest exists, keep the existing cover and skip the
 * screenshot gallery entirely (no broken image requests).
 */
let available: boolean | null = null
let pending: Promise<boolean> | null = null

async function checkAvailable() {
  try {
    const response = await fetch(`${animeFinderAssetRoot}/assets-index.json`)
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false
    const manifest: unknown = await response.json()
    if (!manifest || typeof manifest !== 'object' || !('assets' in manifest)) return false
    const assets = (manifest as { assets?: unknown }).assets
    if (!Array.isArray(assets) || assets.length !== animeFinderScreenshots.length) return false
    const actual = new Set(
      assets.map((asset) => asset && typeof asset === 'object' && 'asset_id' in asset
        ? String((asset as { asset_id: unknown }).asset_id)
        : ''),
    )
    return animeFinderScreenshots.every((screenshot) => actual.has(`animefinder-${screenshot.id}`))
  } catch {
    return false
  }
}

export function useAnimeFinderAssetsReady(enabled = true) {
  const [ready, setReady] = useState(available === true)

  useEffect(() => {
    if (!enabled) return
    let active = true
    if (!pending) {
      pending = checkAvailable().then((result) => {
        available = result
        return result
      })
    }
    void pending.then((result) => { if (active) setReady(result) })
    return () => { active = false }
  }, [enabled])

  return ready
}
