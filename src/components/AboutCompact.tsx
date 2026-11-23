import { BookOpenText, X } from 'lucide-react'
import { useRef, type CSSProperties } from 'react'
import type { Experience } from '../domain/models/About'
import { useI18n } from '../i18n/I18nProvider'
import { AboutHighlights, UniversityFooter } from './AboutHighlights'

type Props = {
  professionalTitle: string
  intro?: string
  bio: string[]
  valueProposition?: string
  experiences: Experience[]
  matchingHeight: number | null
}

/**
 * Compact, responsive version of section 06.
 *
 * Desktop: the left profile/contact column is the sole height reference.
 * The biography preview uses the remaining space; all details remain
 * accessible in a native modal instead of stretching the section.
 * Mobile: natural height, with a short preview and the same "Read more".
 */
export function AboutCompact({
  professionalTitle,
  intro,
  bio,
  valueProposition,
  experiences,
  matchingHeight,
}: Props) {
  const { locale, t } = useI18n()
  const pt = locale === 'pt-BR'
  const detailsRef = useRef<HTMLDialogElement>(null)
  const titleId = 'about-complete-title'
  const openDetails = () => {
    const dialog = detailsRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }

  return (
    <div
      className="about-mini-copy about-mini-copy--compact"
      data-reveal="right"
      data-about-compact
      style={matchingHeight === null ? undefined : { '--about-column-height': `${matchingHeight}px` } as CSSProperties}
    >
      <div className="eyebrow">06 / {t('about')}</div>
      <h2>Leonardo Rossato</h2>
      <p className="about-headline">{professionalTitle}</p>
      <div className="about-copy-preview" aria-label={pt ? 'Resumo profissional' : 'Professional summary'}>
        {intro && <p className="about-intro">{intro}</p>}
        <div className="about-bio-paragraphs">
          {bio.map((paragraph, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
          ))}
        </div>
        {valueProposition && <p className="about-value-proposition">{valueProposition}</p>}
      </div>

      <div className="about-mini-footer">
        <button type="button" className="about-read-more" onClick={openDetails}>
          <BookOpenText size={15} aria-hidden="true" />
          {pt ? 'Leia mais sobre minha trajetória' : 'Read more about my background'}
        </button>
        <UniversityFooter />
      </div>

      <dialog
        ref={detailsRef}
        className="about-details-dialog"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === detailsRef.current) detailsRef.current?.close()
        }}
      >
        <div className="about-details-dialog-header">
          <div>
            <div className="eyebrow">06 / {t('about')}</div>
            <h2 id={titleId}>{pt ? 'Trajetória e formação' : 'Background and Education'}</h2>
          </div>
          <button
            className="about-details-close"
            type="button"
            aria-label={pt ? 'Fechar detalhes' : 'Close details'}
            onClick={() => detailsRef.current?.close()}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        <div className="about-details-dialog-body">
          <p className="about-headline">{professionalTitle}</p>
          {intro && <p className="about-intro">{intro}</p>}
          <div className="about-bio-paragraphs">
            {bio.map((paragraph, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
            ))}
          </div>
          {valueProposition && <p className="about-value-proposition">{valueProposition}</p>}
          <AboutHighlights experiences={experiences} />
        </div>
      </dialog>
    </div>
  )
}
