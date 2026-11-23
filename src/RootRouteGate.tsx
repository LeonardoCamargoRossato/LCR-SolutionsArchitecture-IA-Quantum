import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { I18nProvider } from './i18n/I18nProvider'
import { SiteContentProvider } from './providers/SiteContentProvider'
import { ToastProvider } from './providers/ToastProvider'

// These chunks are only requested for the matching hash route.
const PortfolioApp = lazy(() => import('./App'))
const TestComponentLab = lazy(() =>
  import('./pages/TestComponentLab').then((module) => ({ default: module.TestComponentLab })),
)

export function RootRouteGate() {
  const location = useLocation()
  if (location.pathname === '/test-component-lab') {
    // Intentionally no Header, Footer, AuthProvider, SiteContentProvider or
    // Supabase requests. The Lab is a public, independent development surface.
    return (
      <ErrorBoundary>
        <Suspense fallback={<main className="loading-page">Carregando laboratório…</main>}>
          <TestComponentLab />
        </Suspense>
      </ErrorBoundary>
    )
  }

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
