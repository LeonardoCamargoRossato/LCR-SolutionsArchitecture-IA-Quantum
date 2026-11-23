import { ChevronDown, Menu, Moon, Sun, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { externalLinks } from '../config/externalLinks'
import { useI18n } from '../i18n/I18nProvider'
import type { Locale } from '../i18n/types'
import { useSiteContent } from '../providers/SiteContentProvider'
import { useTheme } from '../providers/ThemeProvider'
import './header/header-controls.css'

const LANGUAGES: ReadonlyArray<{ locale: Locale; flag: string; label: string }> = [
  { locale: 'en-US', flag: '🇺🇸', label: 'EN USA' },
  { locale: 'pt-BR', flag: '🇧🇷', label: 'PT BR' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const pickerButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { content } = useSiteContent()
  const { locale, setLocale, t } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const selectedLanguage = LANGUAGES.find(option => option.locale === locale) ?? LANGUAGES[0]

  useEffect(() => {
    setOpen(false)
    setLanguageOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!languageOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !pickerRef.current?.contains(event.target)) setLanguageOpen(false)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLanguageOpen(false)
        pickerButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [languageOpen])

  const chooseLanguage = (selected: Locale) => {
    setLocale(selected)
    setLanguageOpen(false)
    pickerButtonRef.current?.focus()
  }

  const goToSection = (sectionId: string) => {
    const scroll = () => {
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 60)
    }

    if (location.pathname !== '/') {
      navigate('/')
      scroll()
    } else {
      scroll()
    }
    setOpen(false)
  }

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link to="/" className="brand" aria-label="Leonardo Rossato home">
          <span className="brand-avatar">
            {content.about.profileImage?.url ? (
              <img src={content.about.profileImage.url} alt="" aria-hidden="true" />
            ) : (
              <UserRound size={17} aria-hidden="true" />
            )}
          </span>
          <span className="brand-name">Leonardo Rossato</span>
        </Link>

        <nav className={`nav ${open ? 'nav-open' : ''}`} aria-label="Primary navigation">
          <button type="button" onClick={() => goToSection('projects')}>{t('projects')}</button>
          <button type="button" onClick={() => goToSection('experience')}>{t('experienceNav')}</button>
          <button type="button" onClick={() => goToSection('about')}>{t('about')}</button>
          <a href={externalLinks.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={externalLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <button type="button" onClick={() => goToSection('contact')}>{t('contact')}</button>
        </nav>

        {/* Always visible on desktop and mobile, even when navigation is collapsed. */}
        <div className="header-controls">
          <div className="language-picker" ref={pickerRef}>
            <button
              ref={pickerButtonRef}
              type="button"
              className="language-picker-trigger"
              aria-label={`Language: ${selectedLanguage.label}. Select language`}
              aria-haspopup="true"
              aria-expanded={languageOpen}
              aria-controls="portfolio-language-options"
              onClick={() => setLanguageOpen(value => !value)}
            >
              <span className="language-flag" aria-hidden="true">{selectedLanguage.flag}</span>
              <span className="language-picker-label">{selectedLanguage.label}</span>
              <ChevronDown size={13} aria-hidden="true" />
            </button>
            {languageOpen && (
              <div className="language-picker-options" id="portfolio-language-options" aria-label="Choose language">
                {LANGUAGES.map(option => (
                  <button
                    type="button"
                    key={option.locale}
                    className="language-picker-option"
                    aria-pressed={locale === option.locale}
                    onClick={() => chooseLanguage(option.locale)}
                  >
                    <span className="language-flag" aria-hidden="true">{option.flag}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            className="menu-button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => { setLanguageOpen(false); setOpen(value => !value) }}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
    </header>
  )
}
