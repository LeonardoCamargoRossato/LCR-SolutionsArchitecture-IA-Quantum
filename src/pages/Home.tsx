import { FileText, Mail } from 'lucide-react'
import { useRef, useState, type CSSProperties } from 'react'
import { AboutGallery } from '../components/AboutGallery'
import { CapabilitiesSection } from '../components/CapabilitiesSection'
import { ContactForm } from '../components/ContactForm'
import { CvViewer } from '../components/CvViewer'
import { ExperienceSection } from '../components/ExperienceSection'
import { HeroTypeTitle } from '../components/HeroTypeTitle'
import { MoreProjectCard } from '../components/MoreProjectCard'
import { ProjectCard } from '../components/ProjectCard'
import { SectionTitle } from '../components/SectionTitle'
import { SocialLinkList } from '../components/SocialLinks'
import { WorkProcessSection } from '../components/WorkProcessSection'
import { externalLinks } from '../config/externalLinks'
import { localizedAbout, localizedHome, localizedSiteSettings } from '../i18n/content'
import { useI18n } from '../i18n/I18nProvider'
import { useSiteContent } from '../providers/SiteContentProvider'
import { useHomeEntrance } from '../hooks/useHomeEntrance'

export function Home() {
  const { content, projects } = useSiteContent()
  const { locale, t } = useI18n()
  const [cvOpen, setCvOpen] = useState(false)
  const homeRef = useRef<HTMLElement>(null)
  useHomeEntrance(homeRef)

  const home = localizedHome(content.home, locale)
  const about = localizedAbout(content.about, locale)
  const settings = localizedSiteSettings(content.siteSettings, locale)
  const mainCardScale = Math.min(130, Math.max(70, settings.mainCardScale ?? 100))
  const moreCardScale = Math.min(130, Math.max(70, settings.moreCardScale ?? 100))
  const portfolioScaleStyle = {
    '--main-card-scale': String(mainCardScale / 100),
    '--more-card-scale': String(moreCardScale / 100),
  } as CSSProperties

  const featuredSlugs = ['foton-hub', 'cities-comparing', 'hamlet']
  const visibleProjects = projects.filter((project) => project.visible !== false)
  const projectOrder = (project: typeof projects[number]) =>
    project.sortOrder ?? project.order ?? 999

  const mainProjects = visibleProjects
    .filter((project) => featuredSlugs.includes(project.slug))
    .sort((a, b) => featuredSlugs.indexOf(a.slug) - featuredSlugs.indexOf(b.slug))

  const moreProjects = visibleProjects
    .filter((project) => !featuredSlugs.includes(project.slug) && project.slug !== 'power-platform')
    .sort((a, b) => {
      if (a.slug === 'speaker-portfolio') return -1
      if (b.slug === 'speaker-portfolio') return 1
      return projectOrder(a) - projectOrder(b)
    })

  const professionalTitle =
    about.professionalTitle ||
    about.headline ||
    (locale === 'pt-BR'
      ? 'Soluções em IA, Dados e Computação Quantitativa | Desenvolvimento de Software & IA Aplicada'
      : 'AI, Data & Quantitative Solutions | Software Development & Applied AI')

  return (
    <main className="portfolio-home" style={portfolioScaleStyle} ref={homeRef}>
      <section className="hero hero-positioning">
        <div className="site-container hero-main">
          <div className="eyebrow" data-reveal="down">{home.eyebrow || 'LEONARDO CAMARGO ROSSATO'}</div>
          <div data-reveal="down" style={{ '--reveal-delay': '80ms' } as CSSProperties}><HeroTypeTitle text={home.title || t('heroPrimaryTitle')} /></div>
          {home.focus && <p className="hero-statement" data-reveal="left" style={{ '--reveal-delay': '140ms' } as CSSProperties}>{home.focus}</p>}
          {home.description && <p className="hero-description" data-reveal="left" style={{ '--reveal-delay': '200ms' } as CSSProperties}>{home.description}</p>}
          <div className="hero-actions" data-reveal="left" style={{ '--reveal-delay': '260ms' } as CSSProperties}>
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
        </div>
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

      <WorkProcessSection steps={settings.workProcess} />

      <section className="section home-about" id="about">
        <div className="site-container home-about-grid">
          <div className="about-media" data-reveal="right">
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

          <div className="about-mini-copy" data-reveal="right" style={{ '--reveal-delay': '100ms' } as CSSProperties}>
            <div className="eyebrow">06 / {t('about')}</div>
            <h2>Leonardo Rossato</h2>
            <p className="about-headline">{professionalTitle}</p>
            {about.intro && <p className="about-intro">{about.intro}</p>}
            <div className="about-bio-paragraphs">
              {(about.bio ?? []).map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} dangerouslySetInnerHTML={{ __html: paragraph }} />
              ))}
            </div>
            {about.valueProposition && (
              <div className="about-value-proposition">{about.valueProposition}</div>
            )}
          </div>

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
