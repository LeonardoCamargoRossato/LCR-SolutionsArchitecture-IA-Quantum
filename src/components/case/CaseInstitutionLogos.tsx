import type { ProjectInstitution } from '../../domain/models/ProjectInstitution'

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
        const content = (
          <>
            {institution.institutionLogoUrl ? (
              <img
                src={institution.institutionLogoUrl}
                alt={institution.institutionName}
                title={institution.institutionName}
                loading="lazy"
              />
            ) : (
              <span title={institution.institutionName}>
                {institution.institutionName}
              </span>
            )}
          </>
        )

        return institution.institutionUrl ? (
          <a
            key={institution.id}
            className="case-institution-logo"
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
            className="case-institution-logo"
            title={institution.institutionName}
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
