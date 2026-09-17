
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ui } from './translations'
import type { Locale } from './types'

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof typeof ui['en-US']) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function initialLocale(): Locale {
  const stored = localStorage.getItem('portfolio-locale')
  if (stored === 'pt-BR' || stored === 'en-US') return stored
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en-US'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    localStorage.setItem('portfolio-locale', next)
  }

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key) => ui[locale][key],
  }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('I18nProvider missing')
  return context
}
