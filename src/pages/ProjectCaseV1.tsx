import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectInstitutionService, projectService } from '../bootstrap/services'
import { CaseArchitecture } from '../components/case/CaseArchitecture'
import { CaseFacts, type CaseFact } from '../components/case/CaseFacts'
import { CaseFeatureGrid } from '../components/case/CaseFeatureGrid'
import { CaseGithubRepository } from '../components/case/CaseGithubRepository'
import { CaseDocumentation } from '../components/case/CaseDocumentation'
import { CaseHero } from '../components/case/CaseHero'
import { CaseResults } from '../components/case/CaseResults'
import { CaseSection } from '../components/case/CaseSection'
import { CaseSystemFlow } from '../components/case/CaseSystemFlow'
import { CaseTags } from '../components/case/CaseTags'
import type { Project } from '../domain/models/Project'
import type { ProjectInstitution } from '../domain/models/ProjectInstitution'
import { localizedProject } from '../i18n/content'
import { useI18n } from '../i18n/I18nProvider'
import { useAuth } from '../providers/AuthProvider'
import { useSiteContent } from '../providers/SiteContentProvider'
import { hasCaseSection, normalizeCaseSections } from '../utils/caseSections'

export function ProjectCaseV1() {
  const { slug } = useParams()
  const { projects } = useSiteContent()
  const { locale, t } = useI18n()
  const { isAdmin, loading: authLoading } = useAuth()
  const [adminProject, setAdminProject] = useState<Project>()
  const [adminLookupDone, setAdminLookupDone] = useState(false)
  const [institutions, setInstitutions] = useState<ProjectInstitution[]>([])

  const publicSource = projects.find((project) =>
    project.slug === slug ||
    (slug === 'cities-comparing' && (project.slug === 'city-comparing' || project.id === 'city-comparing')),
  )

  useEffect(() => {
    let active = true
    setAdminProject(undefined)
    setAdminLookupDone(false)

    if (!slug || publicSource || !isAdmin) {
      setAdminLookupDone(true)
      return () => { active = false }
    }

    void projectService.getBySlug(slug, true).then((project) => {
      if (active && project) setAdminProject(project)
    }).finally(() => {
      if (active) setAdminLookupDone(true)
    })

    return () => { active = false }
  }, [slug, publicSource, isAdmin])

  const source = publicSource ?? adminProject
  const project = source ? localizedProject(source, locale) : undefined

  useEffect(() => {
    let active = true
    if (!source) {
      setInstitutions([])
      return () => { active = false }
    }

    const projectSource = source.source === 'more' ? 'more_projects' : 'projects'
    void projectInstitutionService
      .getPublic(source.id, projectSource)
      .then((values) => {
        if (active) setInstitutions(values)
      })
      .catch((error) => {
        console.error('Could not load project institutions.', error)
        if (active) setInstitutions([])
      })

    return () => { active = false }
  }, [source?.id, source?.source])


  const labels = locale === 'pt-BR'
    ? {
        type:'TIPO', context:'CONTEXTO', status:'STATUS', stack:'STACK',
        overview:'VISÃO GERAL', challenge:'DESAFIO', solution:'SOLUÇÃO',
        approach:'ABORDAGEM E IMPLEMENTAÇÃO', architecture:'ARQUITETURA E ESCOPO',
        results:'VALOR ENTREGUE', experience:'EXPERIÊNCIA DO USUÁRIO',
        features:'PRINCIPAIS FUNCIONALIDADES', technologies:'TECNOLOGIAS UTILIZADAS',
        role:'MEU PAPEL', future:'PRÓXIMA EVOLUÇÃO',
        hardware:'HARDWARE', embedded:'LÓGICA EMBARCADA',
        software:'CAMADA DE SOFTWARE', web:'INTERFACE WEB',
        integration:'INTEGRAÇÃO', systemFlow:'ARQUITETURA END-TO-END',
        documentation:'DOCUMENTAÇÃO DO PROJETO', viewPdf:'Visualizar PDF',
        downloadPdf:'Baixar PDF', github:'REPOSITÓRIO NO GITHUB',
        githubMeta:'GitHub', reportMeta:'Baixar Relatório do Case (PDF)',
        academicProject:'PROJETO ACADÊMICO',
        academicContext:'CONTEXTO ACADÊMICO', scope:'ESCOPO',
        platform:'PLATAFORMA', systemType:'TIPO DE SISTEMA',
        back:'Voltar aos Projetos', explore:'Explorar outras soluções'
      }
    : {
        type:'TYPE', context:'CONTEXT', status:'STATUS', stack:'STACK',
        overview:'OVERVIEW', challenge:'CHALLENGE', solution:'SOLUTION',
        approach:'APPROACH & IMPLEMENTATION', architecture:'ARCHITECTURE & SCOPE',
        results:'DELIVERED VALUE', experience:'USER EXPERIENCE',
        features:'KEY FEATURES', technologies:'TECHNOLOGY STACK',
        role:'MY ROLE', future:'NEXT EVOLUTION',
        hardware:'HARDWARE', embedded:'EMBEDDED LOGIC',
        software:'SOFTWARE LAYER', web:'WEB INTERFACE',
        integration:'INTEGRATION', systemFlow:'END-TO-END ARCHITECTURE',
        documentation:'PROJECT DOCUMENTATION', viewPdf:'View PDF',
        downloadPdf:'Download PDF', github:'GITHUB REPOSITORY',
        githubMeta:'GitHub', reportMeta:'Download Case Report (PDF)',
        academicProject:'ACADEMIC PROJECT',
        academicContext:'ACADEMIC CONTEXT', scope:'SCOPE',
        platform:'PLATFORM', systemType:'SYSTEM TYPE',
        back:'Back to Projects', explore:'Explore other solutions'
      }

  if (!project && (authLoading || (isAdmin && !adminLookupDone))) {
    return <main className="loading-page"><div className="site-container">Loading…</div></main>
  }

  if (!project || project.caseEnabled === false) {
    return <main className="not-found"><div className="site-container"><div className="eyebrow">404</div><h1>Case study not found.</h1><Link className="button" to="/">{t('backProjects')}</Link></div></main>
  }

  const narrative = normalizeCaseSections(project.sections)
  const technologies = Array.isArray(project.technologies) ? project.technologies : []
  const sourceGroup = project.source ?? (project.caseStudy ? 'main' : 'more')
  const primaryLabel = sourceGroup === 'more' && project.links.liveUrl
    ? t('openApplication')
    : project.slug === 'hamlet'
      ? t('explore')
      : project.slug === 'speaker-portfolio'
        ? t('visitWebsite')
        : t('live')

  const isEmbeddedControl = project.id === 'embedded-control-platform' || project.slug === 'embedded-control-platform'

  const facts: CaseFact[] = isEmbeddedControl
    ? [
        {
          label: labels.academicContext,
          icon: 'academic',
          value: locale === 'pt-BR' ? 'Disciplina do Doutorado — ITA' : 'Doctoral coursework — ITA',
        },
        {
          label: labels.scope,
          icon: 'architecture',
          value: locale === 'pt-BR'
            ? 'Hardware → Lógica Embarcada → Software → Interface Web'
            : 'Hardware → Embedded Logic → Software → Web Interface',
        },
        { label: labels.platform, value: 'ESP32 + WebServer', icon: 'hardware' },
        {
          label: labels.systemType,
          icon: 'integration',
          value: locale === 'pt-BR' ? 'Sistema de Controle Embarcado' : 'Embedded Control System',
        },
      ]
    : [
        { label: labels.type, value: project.category ?? '', icon: 'overview' },
        { label: labels.context, value: project.subtitle ?? '', icon: 'academic' },
        { label: labels.status, value: project.status === 'Private Platform' ? t('privatePlatform') : (project.status ?? ''), icon: 'status' },
        { label: labels.stack, value: technologies.slice(0, 3).join(' · '), icon: 'technologies' },
      ]

  return <main className="case-story-page">
    <CaseHero
      project={project}
      backLabel={labels.back}
      statusLabel={t('status')}
      privatePlatformLabel={t('privatePlatform')}
      primaryLabel={primaryLabel}
      researchLabel={t('research')}
      githubLabel={labels.githubMeta}
      reportDownloadLabel={labels.reportMeta}
      institutions={institutions}
    />
    <CaseFacts facts={facts}/>
    <div className="case-story-content">
      {hasCaseSection(narrative.overview)&&<CaseSection id="overview" label={labels.overview} section={narrative.overview}/>}
      {hasCaseSection(narrative.challenge)&&<CaseSection id="challenge" label={labels.challenge} section={narrative.challenge}/>} 
      {hasCaseSection(narrative.context)&&<CaseSection id="context" label={labels.context} section={narrative.context}/>} 
      {hasCaseSection(narrative.solution)&&<CaseSection id="solution" label={labels.solution} section={narrative.solution} accent/>} 
      {hasCaseSection(narrative.approach)&&<CaseSection id="approach" label={labels.approach} section={narrative.approach}/>} 
      {hasCaseSection(narrative.architecture)&&<CaseArchitecture label={labels.architecture} section={narrative.architecture}/>} 

      {isEmbeddedControl ? (
        <CaseSystemFlow
          label={labels.architecture}
          flowLabel={labels.systemFlow}
          stages={[
            { id: 'hardware', label: labels.hardware, section: narrative.hardware },
            { id: 'embedded-logic', label: labels.embedded, section: narrative.embeddedLogic },
            { id: 'integration', label: labels.integration, section: narrative.integration },
            { id: 'web-interface', label: labels.web, section: narrative.webInterface },
          ]}
        />
      ) : (
        <>
          {hasCaseSection(narrative.hardware)&&<CaseSection id="hardware" label={labels.hardware} section={narrative.hardware}/>}
          {hasCaseSection(narrative.embeddedLogic)&&<CaseSection id="embedded-logic" label={labels.embedded} section={narrative.embeddedLogic}/>}
          {hasCaseSection(narrative.webInterface)&&<CaseSection id="web-interface" label={labels.web} section={narrative.webInterface}/>}
          {hasCaseSection(narrative.integration)&&<CaseSection id="integration" label={labels.integration} section={narrative.integration}/>}
        </>
      )}

      {hasCaseSection(narrative.features)&&<CaseFeatureGrid label={labels.features} section={narrative.features}/>} 
      {hasCaseSection(narrative.role)&&<CaseTags id="role" label={labels.role} section={narrative.role}/>} 
      {hasCaseSection(narrative.results)&&<CaseResults label={labels.results} section={narrative.results}/>} 
      {(hasCaseSection(narrative.technologies)||technologies.length>0)&&<CaseTags id="technologies" label={labels.technologies} section={narrative.technologies} fallbackItems={technologies}/>} 

      {!isEmbeddedControl && hasCaseSection(narrative.experience)&&<CaseSection id="experience" label={labels.experience} section={narrative.experience}/>} 
      {hasCaseSection(narrative.future)&&<CaseSection id="future" label={labels.future} section={narrative.future}/>} 

      {project.reportPdfUrl && (
        <CaseDocumentation
          url={project.reportPdfUrl}
          title={project.reportTitle || labels.documentation}
          sectionLabel={labels.documentation}
          viewLabel={labels.viewPdf}
          downloadLabel={labels.downloadPdf}
        />
      )}

      {project.links.githubUrl && (
        <CaseGithubRepository
          url={project.links.githubUrl}
          label={labels.github}
        />
      )}
    </div>
    <section className="case-story-closing"><div className="case-content-column"><Link className="case-closing-link" to="/">← {labels.back}</Link><Link className="case-closing-link case-closing-link-primary" to="/#projects">{labels.explore} →</Link></div></section>
  </main>
}
