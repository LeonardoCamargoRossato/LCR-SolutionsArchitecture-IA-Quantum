import { useLayoutEffect, type RefObject } from 'react'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export function useHomeEntrance(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const motion = window.matchMedia(reducedMotionQuery)
    const observed = new Set<HTMLElement>()
    const selector = '[data-reveal]'
    let observer: IntersectionObserver | null = null

    const reveal = (element: HTMLElement) => element.setAttribute('data-reveal-state', 'visible')
    const hide = (element: HTMLElement) => element.setAttribute('data-reveal-state', 'hidden')

    const register = (element: HTMLElement) => {
      if (observed.has(element)) return
      observed.add(element)
      if (motion.matches || typeof IntersectionObserver === 'undefined') reveal(element)
      else {
        hide(element)
        observer?.observe(element)
      }
    }

    observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement
        if (entry.isIntersecting) reveal(element)
        else if (entry.boundingClientRect.bottom < 0 || entry.boundingClientRect.top > window.innerHeight) hide(element)
      })
    }, { threshold: .1, rootMargin: '0px 0px -6% 0px' })

    root.querySelectorAll<HTMLElement>(selector).forEach(register)
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return
        if (node.matches(selector)) register(node)
        node.querySelectorAll<HTMLElement>(selector).forEach(register)
      }))
    })
    mutations.observe(root, { childList: true, subtree: true })

    const showFocused = (event: FocusEvent) => {
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>(selector)
      if (element) reveal(element)
    }
    root.addEventListener('focusin', showFocused)

    const updateMotion = () => observed.forEach((element) => motion.matches ? reveal(element) : hide(element))
    motion.addEventListener('change', updateMotion)
    return () => {
      observer?.disconnect()
      mutations.disconnect()
      root.removeEventListener('focusin', showFocused)
      motion.removeEventListener('change', updateMotion)
      observed.forEach((element) => element.removeAttribute('data-reveal-state'))
    }
  }, [rootRef])
}
