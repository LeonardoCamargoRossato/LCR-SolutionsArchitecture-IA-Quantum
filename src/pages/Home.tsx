import { FileText, Mail } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AboutGallery } from '../components/AboutGallery'
import { AboutCompact } from '../components/AboutCompact'
import { CapabilitiesSection } from '../components/CapabilitiesSection'
import { ContactForm } from '../components/ContactForm'
import { CvViewer } from '../components/CvViewer'
import { ExperienceSection } from '../components/ExperienceSection'
import { HeroTypeTitle } from '../components/HeroTypeTitle'
import { InteractiveAiVisual } from '../components/hero/InteractiveAiVisual'
import { MoreProjectCard } from '../components/MoreProjectCard'
import { ProjectCard } from '../components/ProjectCard'
import { SectionTitle } from '../components/SectionTitle'
import { SocialLinkList } from '../components/SocialLinks'
import { WorkProcessSection } from '../components/WorkProcessSection'
import { externalLinks } from '../config/externalLinks'
import { RETIRED_PROJECT_SLUGS } from '../config/retiredProjects'
import { PORTFOLIO_HERO_TITLE, PORTFOLIO_HERO_SUBTITLE, PORTFOLIO_HERO_DESCRIPTION, PORTFOLIO_HERO_TAGS, PROFESSIONAL_POSITIONING } from '../config/portfolioPositioning'
import { localizedAbout, localizedHome, localizedSiteSettings } from '../i18n/content'
import { useI18n } from '../i18n/I18nProvider'
import { useSiteContent } from '../providers/SiteContentProvider'
import { useHomeEntrance } from '../hooks/useHomeEntrance'

export function Home() {
  const { content, projects } = useSiteContent()
  const { locale, t } = useI18n()
  const [cvOpen, setCvOpen] = useState(false)
  const homeRef = useRef<HTMLElement>(null)
  const aboutMediaRef = useRef<HTMLDivElement>(null)
  const [aboutReferenceHeight, setAboutReferenceHeight] = useState<number | null>(null)
  useHomeEntrance(homeRef)

  // The photo + last contact line is the desktop height reference for About.
  // The right column never grows the section; its details open on demand.
  useEffect(() => {
    const media = aboutMediaRef.current
    if (!media) return
    const update = () => {
      const height = window.matchMedia('(min-width: 721px)').matches
        ? Math.ceil(media.getBoundingClientRect().height)
        : null
      setAboutReferenceHeight((previous) => previous === height ? previous : height)
    }
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    observer?.observe(media)
    window.addEventListener('resize', update)
    update()
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  const home = localizedHome(content.home, locale)
  const about = localizedAbout(content.about, locale)
  const settings = localizedSiteSettings(content.siteSettings, locale)
  const mainCardScale = Math.min(130, Math.max(70, settings.mainCardScale ?? 100))
  const moreCardScale = Math.min(130, Math.max(70, settings.moreCardScale ?? 100))
  const portfolioScaleStyle = {
    '--main-card-scale': String(mainCardScale / 100),
    '--more-card-scale': String(moreCardScale / 100),
  } as CSSProperties

  const featuredSlugs = ['foton-hub', 'cities-comparing', 'animefinder']
  const visibleProjects = projects.filter((project) => project.visible !== false && !RETIRED_PROJECT_SLUGS.has(project.slug))
  const projectOrder = (project: typeof projects[number]) =>
    project.sortOrder ?? project.order ?? 999

  const mainProjects = visibleProjects
    .filter((project) => featuredSlugs.includes(project.slug))
    .sort((a, b) => featuredSlugs.indexOf(a.slug) - featuredSlugs.indexOf(b.slug))

  const moreProjects = visibleProjects
    .filter((project) => !featuredSlugs.includes(project.slug))
    .sort((a, b) => {
      const priority = ['hamlet', 'webseer', 'metcompb-landing-page']
      const priorityA = priority.indexOf(a.slug)
      const priorityB = priority.indexOf(b.slug)
      if (priorityA !== -1 || priorityB !== -1) {
        if (priorityA === -1) return 1
        if (priorityB === -1) return -1
        return priorityA - priorityB
      }
      const finalProjects = ['ce235-real-time-systems', 'embedded-control-platform', 'esp32-control']
      const finalA = finalProjects.indexOf(a.slug)
      const finalB = finalProjects.indexOf(b.slug)
      if (finalA !== -1 || finalB !== -1) {
        if (finalA === -1) return -1
        if (finalB === -1) return 1
        return finalA - finalB
      }
      return projectOrder(a) - projectOrder(b)
    })

  const professionalTitle = PROFESSIONAL_POSITIONING

  return (
    <main className="portfolio-home" style={portfolioScaleStyle} ref={homeRef}>
      <section className="hero hero-positioning hero-v3" aria-label={locale === 'pt-BR' ? 'Apresentação profissional' : 'Professional introduction'}>
        <div className="site-container hero-main hero-v3-layout">
          <div className="hero-v3-content">
            <div className="hero-v3-copy">
              <div className="eyebrow" data-reveal="down">LEONARDO CAMARGO ROSSATO</div>
              <div className="hero-title-block" data-reveal="down" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
                <HeroTypeTitle text={PORTFOLIO_HERO_TITLE} />
                <p className="hero-identity-subtitle">{PORTFOLIO_HERO_SUBTITLE}</p>
              </div>
              <p className="hero-description" data-reveal="left" style={{ '--reveal-delay': '170ms' } as CSSProperties}>
                {PORTFOLIO_HERO_DESCRIPTION}
              </p>
            </div>

            <div className="hero-v3-actions">
              <div className="hero-actions" data-reveal="left" style={{ '--reveal-delay': '220ms' } as CSSProperties}>
                <a
                  className="button"
                  href="#projects"
                  onClick={(event) => {
                    event.preventDefault()
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  {t('heroViewWork')}
                </a>
                <a
                  className="button button-secondary"
                  href="#contact"
                  onClick={(event) => {
                    event.preventDefault()
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  {t('heroContact')}
                </a>
              </div>
              <div className="hero-specializations tech-list" aria-label={locale === 'pt-BR' ? 'Especializações profissionais' : 'Professional specializations'} data-reveal="left" style={{ '--reveal-delay': '270ms' } as CSSProperties}>
                {PORTFOLIO_HERO_TAGS.map((skill) => <span key={skill}>{skill}</span>)}
              </div>
            </div>
          </div>
        </div>
        <InteractiveAiVisual locale={locale} />
      </section>

      <section className="section selected-section" id="projects">
        <div className="site-container">
          <SectionTitle
            eyebrow="01 / Portfolio"
            title={t('selectedWork')}
            description={settings.projectsIntro || t('selectedDescription')}
            reveal="right"
          />
          {settings.architectureStatement && (
            <p className="architecture-statement">{settings.architectureStatement}</p>
          )}
          <div className="selected-grid">
            {mainProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} reveal="right" revealDelay={index * 80} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft additional-work-section">
        <div className="site-container">
          <SectionTitle
            eyebrow="02 / Portfolio"
            title={t('moreProjects')}
            description={t('moreDescription')}
            reveal="left"
          />
          <div className="more-projects-grid">
            {moreProjects.map((project, index) => (
              <MoreProjectCard key={project.id} project={project} revealDelay={Math.min(index * 45, 225)} />
            ))}
          </div>
        </div>
      </section>

      <CapabilitiesSection capabilities={settings.capabilities} projects={projects} />

      <ExperienceSection experiences={about.experiences} />

      <WorkProcessSection steps={settings.workProcess} compact />

      <section className="section home-about" id="about">
        <div className="site-container home-about-grid">
          <div className="about-media" data-reveal="right" ref={aboutMediaRef}>
            <div className="profile-frame">
              {about.profileImage?.url ? (
                <img src={about.profileImage.url} alt="Leonardo Rossato" />
              ) : (
                <div className="profile-placeholder" aria-label="Profile image placeholder">LR</div>
              )}
            </div>

            {content.cvUrl && (
              <button
                className="button about-cv-button"
                type="button"
                onClick={() => setCvOpen(true)}
                aria-label={t('viewCv')}
              >
                <FileText size={16} />
                {t('viewCv')}
              </button>
            )}

            <SocialLinkList links={content.socialLinks} />
          </div>

          <AboutCompact
            professionalTitle={professionalTitle}
            intro={about.intro}
            bio={about.bio ?? []}
            valueProposition={about.valueProposition}
            experiences={about.experiences ?? []}
            matchingHeight={aboutReferenceHeight}
          />
          <div className="about-section-closing" aria-hidden="true" />

          <AboutGallery />
        </div>
      </section>


      <section className="section contact-section" id="contact">
        <div className="site-container contact-grid">
          <div className="contact-copy" data-reveal="left">
            <div className="eyebrow">07 / {t('contactEyebrow')}</div>
            <h2>{t('contactTitle')}</h2>
            <p>{settings.contactIntro || t('contactDescription')}</p>
            <div className="contact-contexts" aria-label={t('contactContextsLabel')}>
              <span>{t('contactCareer')}</span>
              <span>{t('contactProject')}</span>
              <span>{t('contactResearch')}</span>
              <span>{t('contactSpeaking')}</span>
            </div>
            <a className="contact-email" href={externalLinks.email}>
              <Mail size={17} />
              leo.c.rossato@gmail.com
            </a>
          </div>
          <div data-reveal="left" style={{ '--reveal-delay': '120ms' } as CSSProperties}><ContactForm /></div>
        </div>
      </section>

      {content.cvUrl && (
        <CvViewer open={cvOpen} url={content.cvUrl} onClose={() => setCvOpen(false)} />
      )}
    </main>
  )
}
