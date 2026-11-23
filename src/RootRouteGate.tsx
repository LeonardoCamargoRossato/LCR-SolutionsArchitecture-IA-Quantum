import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HomeBootCoordinator } from './features/home-loading/HomeBootCoordinator'

// The Lab never imports the portfolio's Auth, CMS or Supabase providers.
// Both experiences are route-split and load only when visited.
const PortfolioExperience = lazy(() => import('./PortfolioExperience'))
const TestComponentLab = lazy(() =>
  import('./pages/TestComponentLab').then((module) => ({ default: module.TestComponentLab })),
)

export function RootRouteGate() {
  const location = useLocation()
  if (location.pathname === '/test-component-lab') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<main className="loading-page">Carregando laboratório…</main>}>
          <TestComponentLab />
        </Suspense>
      </ErrorBoundary>
    )
  }
  return (
    <HomeBootCoordinator>
      <Suspense fallback={<main className="loading-page"><div className="site-container">Loading…</div></main>}>
        <PortfolioExperience />
      </Suspense>
    </HomeBootCoordinator>
  )
}
