import { lazy, Suspense } from 'react'
import { AuthProvider } from './providers/AuthProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { I18nProvider } from './i18n/I18nProvider'
import { SiteContentProvider } from './providers/SiteContentProvider'
import { ToastProvider } from './providers/ToastProvider'

const PortfolioApp = lazy(() => import('./App'))

/** Legacy portfolio runtime; providers are never imported by the public Lab. */
export default function PortfolioExperience() {
  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <SiteContentProvider>
            <ErrorBoundary>
              <Suspense fallback={<main className="loading-page"><div className="site-container">Loading…</div></main>}>
                <PortfolioApp />
              </Suspense>
            </ErrorBoundary>
          </SiteContentProvider>
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
