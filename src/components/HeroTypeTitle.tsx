import { useEffect, useState } from 'react'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export function HeroTypeTitle({ text }: { text: string }) {
  const [typed, setTyped] = useState(() => window.matchMedia(reducedMotionQuery).matches ? text : '')

  useEffect(() => {
    const motion = window.matchMedia(reducedMotionQuery)
    const letters = Array.from(text)
    let timer = 0
    let index = motion.matches ? letters.length : 0
    setTyped(motion.matches ? text : '')
    const type = () => {
      if (index >= letters.length) return
      index += 1
      setTyped(letters.slice(0, index).join(''))
      timer = window.setTimeout(type, 34)
    }
    if (!motion.matches) timer = window.setTimeout(type, 180)
    const update = () => {
      window.clearTimeout(timer)
      if (motion.matches) setTyped(text)
    }
    motion.addEventListener('change', update)
    return () => { window.clearTimeout(timer); motion.removeEventListener('change', update) }
  }, [text])

  return (
    <h1 className="hero-type-title" aria-label={text} data-typing-complete={typed === text}>
      <span className="hero-type-reserve" aria-hidden="true">{text}</span>
      <span className="hero-type-text" aria-hidden="true">{typed}<span className="hero-type-caret" /></span>
    </h1>
  )
}
