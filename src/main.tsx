
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
