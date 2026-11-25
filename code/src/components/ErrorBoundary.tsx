import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      const pt = document.documentElement.lang === 'pt-BR'
      return (
        <main className="error-boundary">
          <div className="site-container">
            <h1>{pt ? 'Portfólio temporariamente indisponível.' : 'Portfolio temporarily unavailable.'}</h1>
            <p>{pt ? 'Ocorreu um erro inesperado. Recarregue a página para tentar novamente.' : 'An unexpected interface error occurred. Reload the page to try again.'}</p>
            <button className="button" onClick={() => window.location.reload()}>{pt ? 'Recarregar' : 'Reload'}</button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
