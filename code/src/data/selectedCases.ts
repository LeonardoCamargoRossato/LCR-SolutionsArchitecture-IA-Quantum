import { selectedCaseSnapshot, selectedInstitutionSnapshot } from './selectedCaseSnapshot'
import { getSelectedWork } from './selectedWork'
import { enrichPublishedProject } from './projectEditorial'
import { animeFinderProject } from './animeFinderProject'
import { withAnimeFinderScreenshots } from './animeFinderGallery'
import type { Project } from '../domain/models/Project'

const base=import.meta.env.BASE_URL.replace(/\/?$/, '/')
const local=(path?:string)=>path?base+path:undefined

/** Same approved editorial enrichment used on main, with versioned media and
 * the approved Portuguese CMS wording and previously approved English correction. */
const cases: readonly Project[]=getSelectedWork().map(card=>{
  const raw=selectedCaseSnapshot.find(p=>p.id===card.id)
  if(!raw)throw new Error('Missing selected case snapshot '+card.id)
  const enriched=enrichPublishedProject({...raw,coverImage:card.coverImage,imageType:card.imageType})
  const project={...enriched,institutionLogoUrl:local(enriched.institutionLogoUrl),reportPdfUrl:local(enriched.reportPdfUrl)}
  if(project.slug!=='animefinder')return project
  return withAnimeFinderScreenshots({...project,description:animeFinderProject.description,
    translations:{...project.translations,'pt-BR':{...project.translations?.['pt-BR'],description:raw.translations?.['pt-BR']?.description}}})
})
export function getSelectedCases():Project[]{return [...cases]}
export function findSelectedCase(key?:string){return cases.find(p=>p.slug===key||p.id===key)}
export function getSelectedInstitutions(key:string){
  const project=findSelectedCase(key)
  return selectedInstitutionSnapshot.filter(row=>row.projectId===project?.id)
    .map(row=>({...row,institutionLogoUrl:local(row.institutionLogoUrl)}))
}
export function isSelectedInstitution(id:string){return selectedInstitutionSnapshot.some(row=>row.id===id)}
