
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { RootRouteGate } from './RootRouteGate'
import { ThemeProvider } from './providers/ThemeProvider'
import './styles/theme.css'
import './styles/global.css'
import './styles/visual-refresh.css'
import './styles/home-motion.css'
import './estruturas-padroes/carrossel-projetos/carrossel-projetos.css'
import './components/hero/hero-visual.css'
import './components/hero/hero-responsive-v11.css'
import './components/hero/hero-responsive-v12.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
if (supabaseUrl && !window.location.hash.startsWith('#/test-component-lab')) {
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
        <RootRouteGate />
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)
