import { useLayoutEffect, useState, type RefObject } from 'react'

type Subscriber = { reveal: () => void; allowPortalReveal: boolean }
const pending = new Map<Element, Subscriber>()
let observer: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
let mutations: MutationObserver | undefined
let scheduled = 0

/** Positive intersection with viewport AND clipping ancestors. The inert Home
 * behind the portal is not visible. Decorative aria-hidden is not a visual hide.
 * No dependency on native lazy-load lookahead or an unbounded polling loop. */
export function imageIsVisible(node: Element, allowPortalReveal = false): boolean {
  if (!node.isConnected || document.hidden) return false
  const r = node.getBoundingClientRect()
  let left = Math.max(0, r.left), top = Math.max(0, r.top)
  let right = Math.min(document.documentElement.clientWidth, r.right)
  let bottom = Math.min(document.documentElement.clientHeight, r.bottom)
  if (right <= left || bottom <= top) return false
  for (let el: Element | null = node; el; el = el.parentElement) {
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' ||
        style.visibility === 'collapse' || style.contentVisibility === 'hidden' ||
        el.hasAttribute('hidden')) return false
    if (el.hasAttribute('inert')) {
      if (!(allowPortalReveal && el.matches('.home-boot-app[data-home-reveal="revealing"]'))) return false
    }
    // Ignore opacity on the image itself: its pending placeholder may be transparent.
    // A reveal transition is intentional visible presentation, not a closed tab.
    if (el !== node && Number(style.opacity) === 0 &&
        el.getAttribute('data-reveal-state') !== 'visible' &&
        !(allowPortalReveal && el.closest('.home-boot-app[data-home-reveal="revealing"]'))) return false
    if (el !== node && el !== document.documentElement && el !== document.body) {
      const clipX = /hidden|clip|auto|scroll/.test(style.overflowX)
      const clipY = /hidden|clip|auto|scroll/.test(style.overflowY)
      if (clipX || clipY) {
        const b = el.getBoundingClientRect()
        const x = b.left + el.clientLeft, y = b.top + el.clientTop
        if (clipX) { left = Math.max(left,x); right = Math.min(right,x+el.clientWidth) }
        if (clipY) { top = Math.max(top,y); bottom = Math.min(bottom,y+el.clientHeight) }
      }
    }
    if (right <= left || bottom <= top) return false
  }
  return true
}

function stopIfEmpty() {
  if (pending.size) return
  observer?.disconnect(); observer = undefined
  resizeObserver?.disconnect(); resizeObserver = undefined
  mutations?.disconnect(); mutations = undefined
  if (scheduled) cancelAnimationFrame(scheduled)
  scheduled = 0
  window.removeEventListener('scroll', schedule, true)
  window.removeEventListener('resize', schedule)
  document.removeEventListener('visibilitychange', schedule)
  document.removeEventListener('transitionend', schedule, true)
  document.removeEventListener('animationend', schedule, true)
}
function remove(node: Element) {
  pending.delete(node); observer?.unobserve(node); resizeObserver?.unobserve(node)
  stopIfEmpty()
}
function check(node: Element) {
  const sub = pending.get(node)
  if (sub && imageIsVisible(node, sub.allowPortalReveal)) {
    remove(node); sub.reveal()
  }
}
function schedule() {
  if (!pending.size || scheduled) return
  scheduled = requestAnimationFrame(() => {
    scheduled = 0
    for (const node of [...pending.keys()]) check(node)
  })
}
function subscribe(node: Element, sub: Subscriber) {
  if (imageIsVisible(node, sub.allowPortalReveal)) { sub.reveal(); return () => {} }
  if (!pending.size) {
    if (typeof IntersectionObserver !== 'undefined') observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting && entry.intersectionRatio > 0) check(entry.target)
    }, { rootMargin: '0px', threshold: 0 })
    if (typeof ResizeObserver !== 'undefined') resizeObserver = new ResizeObserver(schedule)
    mutations = new MutationObserver(records => {
      // Only visibility-affecting mutations of pending elements or ancestors.
      // Canvas/HUD updates elsewhere must not cause layout reads.
      if (records.some(record => [...pending.keys()].some(node => (record.target as Element).contains(node)))) schedule()
    })
    mutations.observe(document.documentElement, { subtree: true, attributes: true,
      attributeFilter: ['hidden','inert','aria-hidden','class','style','data-home-reveal','data-reveal-state','data-phase'] })
    window.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)
    document.addEventListener('visibilitychange', schedule)
    document.addEventListener('transitionend', schedule, true)
    document.addEventListener('animationend', schedule, true)
  }
  pending.set(node, sub)
  observer?.observe(node); resizeObserver?.observe(node)
  return () => remove(node)
}

/** Once admitted, keep the same URL for this mounted asset. A changed URL needs
 * a new admission; disabled scenes never start a new image request. */
export function useImageDemand(ref: RefObject<Element | null>, asset: string | undefined,
  enabled = true, allowPortalReveal = false): boolean {
  const [admitted, setAdmitted] = useState<string>()
  const ready = Boolean(asset && admitted === asset)
  useLayoutEffect(() => {
    if (!asset || !enabled || ready || !ref.current) return
    return subscribe(ref.current, { allowPortalReveal, reveal: () => setAdmitted(asset) })
  }, [ref, asset, enabled, ready, allowPortalReveal])
  return ready
}
