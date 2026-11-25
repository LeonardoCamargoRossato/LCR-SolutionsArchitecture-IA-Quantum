
import { AtSign, Building2, Github, Globe, Linkedin, Mail } from 'lucide-react'
import type { SocialLink } from '../domain/models/SiteContent'

function SocialIcon({ name, size = 19 }: { name: string; size?: number }) {
  const normalized = name.toLowerCase()
  if (normalized.includes('github')) return <Github size={size} />
  if (normalized.includes('linkedin')) return <Linkedin size={size} />
  if (normalized.includes('instagram')) return <AtSign size={size} />
  if (normalized.includes('mail')) return <Mail size={size} />
  if (normalized.includes('building')) return <Building2 size={size} />
  return <Globe size={size} />
}


export function SocialLinkList({ links }: { links: SocialLink[] }) {
  return (
    <div className="about-social-list">
      {[...links]
        .filter((link) => link.visible)
        .sort((a, b) => a.order - b.order)
        .map((link) => {
          const external = link.url.startsWith('http')
          return (
            <a
              key={link.id}
              href={link.url}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="about-social-link"
            >
              <span className="about-social-link-icon" aria-hidden="true">
                <SocialIcon name={link.icon || link.platform} size={17} />
              </span>
              <span>{link.label || link.platform}</span>
            </a>
          )
        })}
    </div>
  )
}

export function SocialIconRow({ links }: { links: SocialLink[] }) {
  return (
    <div className="social-icon-row">
      {[...links]
        .filter((link) => link.visible)
        .sort((a, b) => a.order - b.order)
        .map((link) => (
          <a
            key={link.id}
            href={link.url}
            target={link.url.startsWith('http') ? '_blank' : undefined}
            rel={link.url.startsWith('http') ? 'noreferrer' : undefined}
            aria-label={link.platform}
            title={link.platform}
          >
            <SocialIcon name={link.icon || link.platform} />
          </a>
        ))}
    </div>
  )
}

export function SocialLinks({ links }: { links: SocialLink[] }) {
  return (
    <div className="social-grid">
      {[...links]
        .filter((link) => link.visible)
        .sort((a, b) => a.order - b.order)
        .map((link) => (
          <a
            key={link.id}
            href={link.url}
            target={link.url.startsWith('http') ? '_blank' : undefined}
            rel={link.url.startsWith('http') ? 'noreferrer' : undefined}
          >
            <SocialIcon name={link.icon || link.platform} />
            <div>
              <strong>{link.platform}</strong>
              <span>{link.label}</span>
            </div>
          </a>
        ))}
    </div>
  )
}
