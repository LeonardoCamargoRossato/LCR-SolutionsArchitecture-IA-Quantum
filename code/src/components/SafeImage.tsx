import { resolvePublicAsset, resolveAssetFallback } from '../assets/public/resolvePublicAsset'
import { useLayoutEffect, useRef, useState } from 'react'
import { useImageDemand } from '../hooks/useImageDemand'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackLabel?: string
  previewSrc?: string
  fallbackSrc?: string
  /** Legacy priority hint; never bypasses visibility. */
  eager?: boolean
}

export function SafeImage(props: Props) {
  // Asset changes reset only the resource lifecycle, not on scroll/theme/locale.
  const src = resolvePublicAsset(props.src)
  return <SafeImageResource key={src ?? props.srcSet ?? ''} {...props} src={src}
    previewSrc={resolvePublicAsset(props.previewSrc)} fallbackSrc={resolveAssetFallback(props.src, props.fallbackSrc)} />
}

function SafeImageResource({
  fallbackLabel = 'Image unavailable', previewSrc, fallbackSrc, eager = false,
  onError, className, alt = '', src, srcSet, ...props
}: Props) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const rootRef = useRef<HTMLSpanElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const visible = useImageDemand(rootRef, src || srcSet)
  // A preview failure must not silently download a heavy PNG/JPEG original.
  // SVG / WebP / AVIF fallback remains available for legacy branded placeholders.
  const safeFallback = fallbackSrc && fallbackSrc !== src &&
    /\.(?:svg|webp|avif)(?:[?#]|$)/i.test(fallbackSrc) ? fallbackSrc : undefined

  useLayoutEffect(() => {
    const image = imageRef.current
    if (image?.complete && image.naturalWidth > 0) setLoaded(true)
  }, [src, attempt, visible])

  if (failed || (!src && !srcSet)) {
    return <span className={`image-fallback ${className ?? ''}`} role="img" aria-label={fallbackLabel}>{fallbackLabel}</span>
  }
  const preview = visible && previewSrc && previewSrc !== src &&
    !/\.(?:png|jpe?g)(?:[?#]|$)/i.test(previewSrc) ? previewSrc : undefined
  return (
    <span ref={rootRef} className={`progressive-image ${loaded ? 'is-loaded' : ''} ${className ?? ''}`}
      data-demand-pending={visible ? undefined : 'true'}>
      {preview && <img className="progressive-image-preview" src={preview} alt="" aria-hidden="true" />}
      {visible && <img ref={imageRef} key={attempt} {...props}
        src={attempt > 0 ? safeFallback : src}
        srcSet={attempt > 0 ? undefined : srcSet}
        className="progressive-image-main" alt={alt} loading="eager"
        decoding={props.decoding ?? 'async'} fetchPriority={eager ? 'high' : props.fetchPriority}
        onLoad={() => setLoaded(true)}
        onError={event => {
          if (attempt === 0 && safeFallback) { setAttempt(1); return }
          setFailed(true); onError?.(event)
        }} />}
      {!preview && !loaded && <span className="progressive-image-skeleton" aria-hidden="true" />}
    </span>
  )
}
