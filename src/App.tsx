
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { SeoSync } from './components/SeoSync'
import { Home } from './pages/Home'
import { AboutRedirect } from './pages/AboutRedirect'
import { NotFound } from './pages/NotFound'
import { useI18n } from './i18n/I18nProvider'

const ProjectCase = lazy(() =>
  import('./pages/ProjectCaseV1').then((module) => ({ default: module.ProjectCaseV1 })),
)

const Admin = lazy(() =>
  import('./pages/admin/Admin').then((module) => ({ default: module.Admin })),
)

const Workflow = lazy(() =>
  import('./pages/Workflow').then((module) => ({ default: module.Workflow })),
)

export default function App() {
  const { locale } = useI18n()
  return (
    <>
      <SeoSync />
      <Header />
      <Suspense fallback={<main className="loading-page"><div className="site-container">{locale === 'pt-BR' ? 'Carregando…' : 'Loading…'}</div></main>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutRedirect />} />
          <Route path="/projects/:slug" element={<ProjectCase />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}
