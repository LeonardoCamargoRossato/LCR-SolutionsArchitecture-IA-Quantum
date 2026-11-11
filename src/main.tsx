
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './providers/ThemeProvider'
import { I18nProvider } from './i18n/I18nProvider'
import { AuthProvider } from './providers/AuthProvider'
import { SiteContentProvider } from './providers/SiteContentProvider'
import { ToastProvider } from './providers/ToastProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/theme.css'
import './styles/global.css'
import './styles/visual-refresh.css'
import './styles/home-motion.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
if (supabaseUrl) {
  try {
    const origin = new URL(supabaseUrl).origin
    for (const rel of ['preconnect', 'dns-prefetch']) {
      const link = document.createElement('link')
      link.rel = rel
      link.href = origin
      if (rel === 'preconnect') link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    }
  } catch {
    // Invalid optional configuration is handled by the repository layer.
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <SiteContentProvider>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </SiteContentProvider>
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)
