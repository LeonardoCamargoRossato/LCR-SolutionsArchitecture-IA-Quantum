import type { Locale } from '../../i18n/types'

/** Tiny inline vector flags; no emoji-font dependency, image request or third-party asset. */
export function FlagIcon({ locale }: { locale: Locale }) {
  if (locale === 'en-US') {
    return (
      <svg className="language-flag-icon" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-flag="US">
        <rect width="24" height="16" rx="1.8" fill="#fff" />
        {[0, 2, 4, 6, 8, 10, 12].map(stripe => (
          <rect key={stripe} y={stripe * 16 / 13} width="24" height={16 / 13} fill="#C63B44" />
        ))}
        <path d="M0 1.8Q0 0 1.8 0H10V8.62H0Z" fill="#27457E" />
        {Array.from({ length: 4 }, (_, row) => Array.from({ length: 5 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={1 + col * 1.9} cy={1.1 + row * 2} r=".39" fill="#fff" />
        )))}
        <rect x=".45" y=".45" width="23.1" height="15.1" rx="1.35" fill="none" stroke="#142239" strokeOpacity=".22" strokeWidth=".9" />
      </svg>
    )
  }

  return (
    <svg className="language-flag-icon" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-flag="BR">
      <rect width="24" height="16" rx="1.8" fill="#159447" />
      <path d="M12 1.6 22 8 12 14.4 2 8Z" fill="#FFDD19" />
      <circle cx="12" cy="8" r="4.15" fill="#234E9D" />
      <path d="M8.2 6.8Q12.1 6.15 15.88 9.25" fill="none" stroke="#fff" strokeWidth="1" />
      <circle cx="11" cy="9.4" r=".34" fill="#fff" />
      <circle cx="14" cy="6.7" r=".31" fill="#fff" />
      <circle cx="12.9" cy="10" r=".24" fill="#fff" />
      <rect x=".45" y=".45" width="23.1" height="15.1" rx="1.35" fill="none" stroke="#142239" strokeOpacity=".22" strokeWidth=".9" />
    </svg>
  )
}
