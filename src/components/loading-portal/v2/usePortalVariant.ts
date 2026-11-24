import { useEffect, useRef, useState, type RefObject } from 'react'
import { portalAssetUrls, selectPortalVariant, type PortalVariant } from './portalGeometry'

export type PortalAssetState = 'loading' | 'ready' | 'failed'
type Prepared = { variant: PortalVariant; status: PortalAssetState }
const cache = new Map<string, HTMLImageElement>()

// All layers use the same candidate. Cache decoded resources only for this
// document and never load unrelated sizes on a stable viewport.
function decode(url: string, signal: AbortSignal): Promise<HTMLImageElement> {
  const existing = cache.get(url)
  if (existing?.complete && existing.naturalWidth) return Promise.resolve(existing)
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error('cancelled')); return }
    const img = new Image()
    let done = false
    const finish = (error?: unknown) => {
      if (done) return
      done = true
      window.clearTimeout(timer)
      signal.removeEventListener('abort', abort)
      if (error) reject(error)
      else { cache.set(url, img); resolve(img) }
    }
    const abort = () => finish(new Error('cancelled'))
    const timer = window.setTimeout(() => finish(new Error('asset timeout')), 12000)
    signal.addEventListener('abort', abort, { once: true })
    img.decoding = 'async'
    img.src = url
    void img.decode().then(() => {
      if (!img.naturalWidth) throw new Error('empty image')
      finish()
    }).catch(finish)
  })
}

export function usePortalVariant(
  container: RefObject<HTMLDivElement | null>, forced: PortalVariant | undefined, locked: boolean,
) {
  const [desired, setDesired] = useState<PortalVariant | undefined>(forced)
  const [prepared, setPrepared] = useState<Prepared>()
  const lockRef = useRef(locked)
  lockRef.current = locked
  const selectedRef = useRef(prepared)
  selectedRef.current = prepared
  useEffect(() => {
    const el = container.current
    if (!el || locked) return
    if (forced) { setDesired(forced); return }
    const update = () => {
      if (!lockRef.current) {
        const r = el.getBoundingClientRect()
        if (r.width > 0 && r.height > 0) setDesired(selectPortalVariant(r.width, r.height))
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [container, forced, locked])

  useEffect(() => {
    if (!desired || locked || (selectedRef.current?.variant === desired && selectedRef.current.status === 'ready')) return
    const controller = new AbortController()
    const { signal } = controller
    const [background, ...mechanical] = portalAssetUrls(desired)
    // Background first. Initial visit can show the static art as soon as it
    // is decoded; a subsequent resize keeps the old complete plane until
    // the replacement set is fully available.
    void (async () => {
      try {
        await decode(background, signal)
        if (signal.aborted || lockRef.current) return
        setPrepared(previous => previous?.status === 'ready' ? previous : { variant: desired, status: 'loading' })
        await Promise.all(mechanical.map(url => decode(url, signal)))
        if (!signal.aborted && !lockRef.current) setPrepared({ variant: desired, status: 'ready' })
      } catch {
        if (!signal.aborted && !lockRef.current) {
          setPrepared(previous => previous?.status === 'ready' ? previous : { variant: desired, status: 'failed' })
        }
      }
    })()
    return () => controller.abort()
  }, [desired, locked])

  return prepared
}
