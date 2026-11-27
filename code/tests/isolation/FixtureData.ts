// Synthetic CMS contract rows built from the repository's public editorial defaults.
import { defaultProjects, defaultMoreProjects } from '../../src/data/defaultProjects'
import type { Project } from '../../src/domain/models/Project'
const root = 'http://127.0.0.1:54321/storage/v1/object/public/portfolio-media/'
const remoteCovers = new Set(['foton-hub','cities-comparing','hamlet','speaker-portfolio','embedded-control-platform','quantum-education-apps','webseer'])
const quantum: Project = {
  id:'quantum-education-apps', slug:'quantum-education-apps', title:'Quantum Education Apps',
  category:'Educational Software', status:'Live', description:'Synthetic educational project fixture.',
  technologies:['React','Quantum Computing'], sections:{overview:'Local test contract.'}, links:{},
  gallery:[], order:8, placement:'more', source:'more', visible:true, caseStudy:true, caseEnabled:true,
}
const projects = [...defaultProjects, ...defaultMoreProjects, quantum]
const order: Record<string, number> = { hamlet:1, webseer:2, 'metcompb-landing-page':3, 'speaker-portfolio':4, 'ce235-real-time-systems':5, 'embedded-control-platform':6, 'quantum-education-apps':8 }
function row(p: Project) {
  const pt = p.translations?.['pt-BR']
  const cover = remoteCovers.has(p.slug) ? root + 'projects/' + p.slug + '/PNG/' + p.slug + '-cover.png' : p.coverImage?.url
  return {
    id:p.id,slug:p.slug,title_en:p.title,title_pt:pt?.title??p.title,subtitle_en:p.subtitle,subtitle_pt:pt?.subtitle??p.subtitle,
    category_en:p.category,category_pt:pt?.category??p.category,status:p.status,status_en:p.status,status_pt:pt?.status??p.status,
    short_description_en:p.description,short_description_pt:pt?.description??p.description,description_en:p.description,description_pt:pt?.description??p.description,
    technologies:p.technologies,cover_url:cover,image_url:cover,sections_en:p.sections,sections_pt:pt?.sections??p.sections,
    external_url:p.links.liveUrl,project_url:p.links.liveUrl,github_url:p.links.githubUrl,research_url:p.links.researchUrl,institution_url:p.links.institutionUrl,
    sort_order:order[p.slug]??p.sortOrder??p.order,placement:p.placement,visible:p.visible!==false,case_enabled:p.caseEnabled!==false,
    featured:p.featured,badge:p.badge,year:p.year,gallery:p.gallery,is_academic:p.isAcademic,institution_name:p.institutionName,
    report_pdf_url:p.reportPdfUrl,report_title_en:p.reportTitle,report_title_pt:pt?.reportTitle??p.reportTitle,
    academic_context_en:p.academicContext,academic_context_pt:pt?.academicContext??p.academicContext,
  }
}
const logos: Record<string,[string,string]> = {
  pense:['Instituto Pense+','LogoInstitutoPense-1000-X-200-Px-1.png'],
  if:['Instituto de Física UFRGS','IF-UFRGS_-logo.png'],
  ufrgs:['UFRGS','Logo_UFRGS.png'],
  ita:['ITA','ITA_logo.png'],
  foton:['Instituto Foton','Logo-Foton-Azul.png'],
}
const affiliations: Record<string,string[]> = {
  'cities-comparing':['pense','if','ufrgs'], 'foton-hub':['foton'], 'quantum-education-apps':['pense','foton'],
  'embedded-control-platform':['ita'],webseer:['ita','foton'],
}
const institutions = projects.flatMap(p => (affiliations[p.slug]??[]).map((key,i)=>({
  id:'fixture-'+p.slug+'-'+key,project_id:p.id,project_source:p.source==='more'?'more_projects':'projects',
  institution_name:logos[key][0],institution_logo_url:root+'institutions/'+logos[key][1],visible:true,sort_order:i+1,
})))
const gallery=Array.from({length:12},(_,i)=>{
  const stem='fixture-photo-'+String(i+1).padStart(2,'0')
  return {id:stem,storage_path:'about/gallery/'+stem+'.jpg',image_url:root+'about/gallery/'+stem+'.jpg',
    title_en:i===0?'LACQ (Liga Acadêmica de Computação Quântica)':'Fixture event '+(i+1),
    title_pt:i===0?'LACQ (Liga Acadêmica de Computação Quântica)':'Evento de teste '+(i+1),
    caption_en:'Local synthetic gallery record',caption_pt:'Registro sintético local',
    link_type:'none',visible:i!==6&&i!==9,sort_order:i+1}
})
// Leave code-managed cases absent from the REST fixture to exercise their documented fallback.
const rows=projects.filter(p=>!['animefinder','ce235-real-time-systems'].includes(p.slug))
export const tables: Record<string,unknown[]> = {
  projects:rows.filter(p=>p.source!=='more').map(row),
  more_projects:rows.filter(p=>p.source==='more').map(row),
  project_institutions:institutions,about_gallery:gallery,
  site_settings:[],about:[],social_links:[],seo:[],
}
