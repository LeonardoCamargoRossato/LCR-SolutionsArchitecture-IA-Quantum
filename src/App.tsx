
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { SeoSync } from './components/SeoSync'
import { Home } from './pages/Home'
import { AboutRedirect } from './pages/AboutRedirect'
import { NotFound } from './pages/NotFound'

const ProjectCase = lazy(() =>
  import('./pages/ProjectCaseV1').then((module) => ({ default: module.ProjectCaseV1 })),
)

const Admin = lazy(() =>
  import('./pages/admin/Admin').then((module) => ({ default: module.Admin })),
)

export default function App() {
  return (
    <>
      <SeoSync />
      <Header />
      <Suspense fallback={<main className="loading-page"><div className="site-container">Loading…</div></main>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutRedirect />} />
          <Route path="/projects/:slug" element={<ProjectCase />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}
