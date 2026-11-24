import { DemandImage } from '../DemandImage'
import type { ProjectInstitution } from '../../domain/models/ProjectInstitution'
import { resolveInstitutionLogo } from '../../data/institutionLogoAssets'

export function CaseInstitutionLogos({
  institutions,
}: {
  institutions: ProjectInstitution[]
}) {
  const visible = institutions.filter((institution) => institution.visible)
  if (!visible.length) return null

  return (
    <div className="case-institution-logos" aria-label="Project institutions">
      {visible.map((institution) => {
        const logo = resolveInstitutionLogo(institution.institutionLogoUrl)
        const content = logo.src ? (
          <DemandImage
            src={logo.src}
            alt={institution.institutionName}
            title={institution.institutionName}
            loading="lazy"
            decoding="async"
            fallbackSrc={logo.fallback}
          />
        ) : (
          <span title={institution.institutionName}>
            {institution.institutionName}
          </span>
        )
        const className = `case-institution-logo case-institution-logo--${logo.layout}`

        return institution.institutionUrl ? (
          <a
            key={institution.id}
            className={className}
            href={institution.institutionUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={institution.institutionName}
          >
            {content}
          </a>
        ) : (
          <div
            key={institution.id}
            className={className}
            title={institution.institutionName}
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
