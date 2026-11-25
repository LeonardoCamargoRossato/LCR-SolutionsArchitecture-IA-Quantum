import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'

export function NotFound() {
  const { locale } = useI18n()
  const pt = locale === 'pt-BR'
  return (
    <main className="not-found">
      <div className="container">
        <div className="eyebrow">404</div>
        <h1>{pt ? 'Página não encontrada.' : 'Page not found.'}</h1>
        <p>{pt ? 'A página solicitada não faz parte desta versão do portfólio.' : 'The page you tried to open is not part of this portfolio version.'}</p>
        <Link className="button" to="/">{pt ? 'Voltar ao início' : 'Back home'}</Link>
      </div>
    </main>
  )
}
