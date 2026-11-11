import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackLabel?: string
  previewSrc?: string
  eager?: boolean
}

export function SafeImage({
  fallbackLabel = 'Image unavailable',
  previewSrc,
  eager = false,
  onError,
  className,
  alt = '',
  ...props
}: Props) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [visible, setVisible] = useState(eager)
  const [attempt, setAttempt] = useState(0)
  const rootRef = useRef<HTMLSpanElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const previousSrc = useRef(props.src)

  useEffect(() => {
    if (previousSrc.current === props.src) return
    previousSrc.current = props.src
    setFailed(false)
    setLoaded(false)
    setAttempt(0)
  }, [props.src])

  useLayoutEffect(() => {
    const image = imageRef.current
    if (image?.complete && image.naturalWidth > 0) setLoaded(true)
  }, [props.src, attempt, visible])

  useEffect(() => {
    if (eager || visible || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const node = rootRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '240px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [eager, visible])

  if (failed || !props.src) {
    return (
      <span className={`image-fallback ${className ?? ''}`} role="img" aria-label={fallbackLabel}>
        {fallbackLabel}
      </span>
    )
  }

  return (
    <span ref={rootRef} className={`progressive-image ${loaded ? 'is-loaded' : ''} ${className ?? ''}`}>
      {previewSrc && <img className="progressive-image-preview" src={previewSrc} alt="" aria-hidden="true" />}
      {visible && (
        <img
          ref={imageRef}
          key={`${props.src}-${attempt}`}
          {...props}
          className="progressive-image-main"
          alt={alt}
          loading={eager ? 'eager' : (props.loading ?? 'lazy')}
          decoding={props.decoding ?? 'async'}
          fetchPriority={eager ? 'high' : props.fetchPriority}
          onLoad={() => setLoaded(true)}
          onError={(event) => {
            if (attempt === 0) {
              setAttempt(1)
              return
            }
            setFailed(true)
            onError?.(event)
          }}
        />
      )}
      {!previewSrc && !loaded && <span className="progressive-image-skeleton" aria-hidden="true" />}
    </span>
  )
}
