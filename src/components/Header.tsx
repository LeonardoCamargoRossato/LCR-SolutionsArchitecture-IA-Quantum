
import { LockKeyhole, Menu, Moon, Sun, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { externalLinks } from '../config/externalLinks'
import { useI18n } from '../i18n/I18nProvider'
import { useSiteContent } from '../providers/SiteContentProvider'
import { useTheme } from '../providers/ThemeProvider'

export function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { content } = useSiteContent()
  const { locale, setLocale, t } = useI18n()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => setOpen(false), [location.pathname])

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

        <button
          type="button"
          className="menu-button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>

        <nav className={`nav ${open ? 'nav-open' : ''}`} aria-label="Primary navigation">
          <button type="button" onClick={() => goToSection('projects')}>{t('projects')}</button>
          <button type="button" onClick={() => goToSection('about')}>{t('about')}</button>
          <a href={externalLinks.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={externalLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <button type="button" onClick={() => goToSection('contact')}>{t('contact')}</button>

          <label className="language-toggle" aria-label="Language">
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as 'en-US' | 'pt-BR')}
            >
              <option value="en-US">EN-US</option>
              <option value="pt-BR">PT-BR</option>
            </select>
          </label>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link to="/admin" className="admin-nav">
            <LockKeyhole size={13} />
            {t('admin')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
