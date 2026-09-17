import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="not-found">
      <div className="container">
        <div className="eyebrow">404</div>
        <h1>Page not found.</h1>
        <p>The page you tried to open is not part of this portfolio version.</p>
        <Link className="button" to="/">Back home</Link>
      </div>
    </main>
  )
}
