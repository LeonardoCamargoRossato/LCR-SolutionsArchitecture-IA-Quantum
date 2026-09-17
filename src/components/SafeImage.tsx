import { useEffect, useState } from 'react'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackLabel?: string
}

export function SafeImage({ fallbackLabel = 'Image unavailable', onError, ...props }: Props) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [props.src])

  if (failed || !props.src) {
    return (
      <div className="image-fallback" role="img" aria-label={fallbackLabel}>
        {fallbackLabel}
      </div>
    )
  }

  return (
    <img
      {...props}
      onError={(event) => {
        setFailed(true)
        onError?.(event)
      }}
    />
  )
}
