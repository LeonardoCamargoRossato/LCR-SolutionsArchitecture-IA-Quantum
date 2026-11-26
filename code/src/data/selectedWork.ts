import type { Project } from '../domain/models/Project'
import { citiesComparingContent } from './citiesComparing'
import { RETIRED_PROJECT_SLUGS } from '../config/retiredProjects'

/** Public card snapshot: read-only export of the three visible projects on
 * 2026-11-26, with the published Cities Comparing editorial override and
 * the approved AnimeFinder landing-page screenshot. No CMS hydration.
 * Case sections remain owned by the existing case implementation. */
type Entry = Pick<Project, 'id' | 'slug' | 'title' | 'subtitle' | 'category' | 'status' | 'description' | 'technologies' | 'links' | 'featured' | 'badge' | 'translations'> & {
  media: { webp: string; png: string }
}
export const selectedWorkCatalog: ReadonlyArray<Entry> = [
{
  "id": "foton-hub",
  "slug": "foton-hub",
  "title": "Foton Hub",
  "subtitle": "End-to-End Enterprise Platform",
  "category": "Enterprise Software / Microsoft Ecosystem",
  "status": "Private Platform",
  "description": "End-to-end enterprise platform for organizational governance, data and analytics, developed with React/TypeScript, SharePoint Framework (SPFx), SharePoint CLI, SharePoint data repositories, APIs and automated workflows.",
  "technologies": [
    "React",
    "TypeScript",
    "SPFx",
    "SharePoint Framework",
    "SharePoint CLI",
    "Microsoft 365",
    "SharePoint",
    "SharePoint Lists / Libraries",
    "APIs",
    "Automated Workflows",
    "GPT Integrations"
  ],
  "links": {
    "institutionUrl": "https://institutofoton.com.br/"
  },
  "featured": true,
  "badge": "FEATURED",
  "translations": {
    "pt-BR": {
      "title": "Foton Hub",
      "subtitle": "Plataforma Corporativa End-to-End",
      "category": "Software Corporativo / Ecossistema Microsoft",
      "status": "Private Platform",
      "description": "Plataforma corporativa end-to-end para governança organizacional, dados e analytics, desenvolvida com React/TypeScript, SharePoint Framework (SPFx), SharePoint CLI, repositórios de dados SharePoint, APIs e fluxos automatizados."
    }
  },
  "media": {
    "webp": "assets/projects/foton-hub/WebP/1789395184532-2e274ccc-e2ad-4c41-b7b8-a795f181f84b-FotonHub_CapaCard.webp",
    "png": "assets/projects/foton-hub/PNG/1789395184532-2e274ccc-e2ad-4c41-b7b8-a795f181f84b-FotonHub_CapaCard.png"
  }
},
{
  ...{
  "id": "city-comparing",
  "slug": "cities-comparing",
  "title": "Cities Comparing",
  "status": "Research Software",
  "featured": false,
  "media": {
    "webp": "assets/projects/cities-comparing/WebP/1789395964303-3c1f29cc-c8bd-42d7-8a7d-752b81756026-CitiesComparing_CapaCard.webp",
    "png": "assets/projects/cities-comparing/PNG/1789395964303-3c1f29cc-c8bd-42d7-8a7d-752b81756026-CitiesComparing_CapaCard.png"
  }
},
  subtitle: citiesComparingContent.subtitle,
  category: citiesComparingContent.category,
  description: citiesComparingContent.description,
  technologies: citiesComparingContent.technologies,
  links: citiesComparingContent.links,
  translations: { 'pt-BR': {
    title: 'Cities Comparing', status: 'Research Software',
    subtitle: citiesComparingContent.translations['pt-BR'].subtitle,
    category: citiesComparingContent.translations['pt-BR'].category,
    description: citiesComparingContent.translations['pt-BR'].description,
    technologies: citiesComparingContent.translations['pt-BR'].technologies,
  } },
},
{
  "id": "animefinder",
  "slug": "animefinder",
  "title": "AnimeFinder",
  "subtitle": "AI-Powered Discovery & Hybrid Retrieval Platform",
  "category": "AI Engineering / RAG / Intelligent Search Systems",
  "status": "Live",
  "description": "An AI-powered discovery and personal knowledge platform combining LLMs, semantic retrieval, structured database queries, statistical analysis, and hybrid query routing. Built around Gemini-based reasoning, Supabase/PostgreSQL, pgvector embeddings and evidence-grounded responses.",
  "technologies": [
    "LLMs",
    "RAG",
    "Hybrid Retrieval",
    "pgvector",
    "Gemini API",
    "React",
    "TypeScript",
    "Supabase",
    "PostgreSQL",
    "Edge Functions"
  ],
  "links": {
    "liveUrl": "https://leonardocamargorossato.github.io/AnimeFinder/",
    "githubUrl": "https://github.com/LeonardoCamargoRossato/AnimeFinder"
  },
  "featured": true,
  "translations": {
    "pt-BR": {
      "title": "AnimeFinder",
      "subtitle": "Plataforma de Descoberta com IA e Recuperação Híbrida",
      "category": "Engenharia de IA / RAG / Sistemas de Busca Inteligente",
      "status": "Live",
      "description": "Plataforma inteligente de descoberta e conhecimento pessoal que combina LLMs, recuperação semântica, consultas estruturadas em bancos de dados, análise estatística e roteamento híbrido de consultas. Sua arquitetura integra Gemini, Supabase/PostgreSQL, embeddings com pgvector e respostas fundamentadas em evidências."
    }
  },
  "media": {
    "webp": "assets/projects/animefinder/WebP/animefinder-01-landing-page.webp",
    "png": "assets/projects/animefinder/PNG/animefinder-01-landing-page.png"
  }
},
]
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
export function isSelectedWork(value: string | Pick<Project,'id'|'slug'>) {
  const keys = typeof value === 'string' ? [value] : [value.id,value.slug]
  return selectedWorkCatalog.some(p => keys.includes(p.id) || keys.includes(p.slug))
}
export function getSelectedWork(): Project[] {
  return selectedWorkCatalog.filter(p => !RETIRED_PROJECT_SLUGS.has(p.slug)).map((entry,index) => {
    const { media, ...p } = entry
    const url = base + media.webp
    return {
      ...p, order:index+1, sortOrder:index+1, visible:true, source:'main', placement:'main',
      caseStudy:true, caseEnabled:true, theme:'default', imageType:'real-screenshot',
      sections:{}, gallery:[],
      coverImage:{ id:p.id+'-official-cover', name:p.title+' cover', path:media.png,
        url, cardUrl:url, thumbnailUrl:url, fullUrl:base+media.png,
        mimeType:'image/webp', category:'Projects', imageType:'real-screenshot' },
    }
  })
}
