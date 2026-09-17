import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <div className="site-container">
            <h1>Portfolio temporarily unavailable.</h1>
            <p>An unexpected interface error occurred. Reload the page to try again.</p>
            <button className="button" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
