import { resolvePublicAsset, resolveAssetFallback } from '../assets/public/resolvePublicAsset'
import { useRef, useState, type ImgHTMLAttributes } from 'react'
import { useImageDemand } from '../hooks/useImageDemand'

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  enabled?: boolean
  allowPortalReveal?: boolean
  fallbackSrc?: string
}

/** Native image markup for existing layouts (no wrapper). No src/srcset until
 * admission. The fallback is opt-in for a visible legacy asset, at most once. */
export function DemandImage({ src, srcSet, enabled = true, allowPortalReveal = false,
  fallbackSrc, onError, ...props }: Props) {
  fallbackSrc = resolveAssetFallback(src, fallbackSrc)
  src = resolvePublicAsset(src)
  const ref = useRef<HTMLImageElement>(null)
  const ready = useImageDemand(ref, src || srcSet, enabled, allowPortalReveal)
  const [failedSource, setFailedSource] = useState<string>()
  const useFallback = failedSource === src && Boolean(fallbackSrc && fallbackSrc !== src)
  const activeSrc = useFallback ? fallbackSrc : src
  return <img {...props} ref={ref} src={ready ? activeSrc : undefined}
    srcSet={ready && !useFallback ? srcSet : undefined}
    loading="eager" decoding={props.decoding ?? 'async'}
    data-demand-pending={ready ? undefined : 'true'}
    data-fallback={useFallback ? 'true' : undefined}
    onError={event => {
      if (ready && fallbackSrc && fallbackSrc !== src && !useFallback) setFailedSource(src)
      else onError?.(event)
    }} />
}
