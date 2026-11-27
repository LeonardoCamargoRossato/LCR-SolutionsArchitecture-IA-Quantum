import type { Project, ProjectGalleryItem } from '../domain/models/Project'
import type { MediaAsset } from '../domain/models/MediaAsset'
import type { ProjectInstitution } from '../domain/models/ProjectInstitution'
import { additionalWorkSnapshot, additionalInstitutionSnapshot } from './additionalWorkSnapshot'
import { enrichPublishedProject } from './projectEditorial'
import { ce235Project } from './ce235Project'
import { metCompBProject } from './metCompBProject'
import { RETIRED_PROJECT_SLUGS } from '../config/retiredProjects'

/** Fixed public composition, matching main's priority and final-project rules.
 * Remote records are provenance, not a source of runtime visibility. */
export const additionalWorkOrder = ["hamlet","webseer","metcompb-landing-page","speaker-portfolio","quantum-education-apps","ce235-real-time-systems","embedded-control-platform"] as const
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
function local(value?: string) {
  if (!value) return undefined
  if (value.startsWith(base)) return value
  if (/^(?:https?:|\/\/|data:|blob:)/i.test(value)) throw new Error('Unexpected remote public asset')
  return base + value.replace(/^\.\//, '').replace(/^\//, '')
}
function localMedia(image: MediaAsset): MediaAsset {
  return { ...image, url: local(image.url)!, path:local(image.path)!,
    cardUrl:local(image.cardUrl), fullUrl:local(image.fullUrl),
    thumbnailUrl:local(image.thumbnailUrl), previewUrl:local(image.previewUrl) }
}
function localGallery(item: ProjectGalleryItem): ProjectGalleryItem {
  const fullUrl=local(item.fullUrl || item.image?.fullUrl || item.image?.url)
  return { ...item, image:item.image?localMedia(item.image):undefined,
    cardUrl:local(item.cardUrl),thumbnailUrl:local(item.thumbnailUrl),previewUrl:local(item.previewUrl),fullUrl,
    downloadName:item.downloadName ?? (fullUrl?.endsWith('.webp')?item.id+'.webp':undefined) }
}
const sources = [...additionalWorkSnapshot.map(enrichPublishedProject), ce235Project, metCompBProject]
/** Only approved rows; no hidden/retired defaults can enter this catalogue. */
export const additionalWorkCatalog: readonly Project[] = additionalWorkOrder.map(slug=>{
  const p=sources.find(item=>item.slug===slug)
  if (!p || RETIRED_PROJECT_SLUGS.has(slug) || p.visible===false) throw new Error('Missing approved project: '+slug)
  return {...p,visible:true,placement:'more',coverImage:p.coverImage?localMedia(p.coverImage):undefined,
    gallery:p.gallery.filter(item=>item.visible!==false).map(localGallery),
    institutionLogoUrl:local(p.institutionLogoUrl),reportPdfUrl:local(p.reportPdfUrl)}
})
export function getAdditionalWork(): Project[] { return [...additionalWorkCatalog] }
export function findAdditionalWork(key?: string) {
  return additionalWorkCatalog.find(p=>p.slug===key||p.id===key)
}
export function isAdditionalWork(value: string | Pick<Project,'id'|'slug'>) {
  return typeof value==='string'?Boolean(findAdditionalWork(value)):Boolean(findAdditionalWork(value.id)||findAdditionalWork(value.slug))
}
export function getAdditionalInstitutions(projectId:string): ProjectInstitution[] {
  const sourceId=projectId==='metcompb-landing-page'?'city-comparing':projectId
  return additionalInstitutionSnapshot.filter(row=>row.projectId===sourceId)
    .map(row=>({...row,institutionLogoUrl:local(row.institutionLogoUrl)}))
}
export function isAdditionalInstitution(id:string) {
  return additionalInstitutionSnapshot.some(row=>row.id===id&&row.projectId!=='city-comparing')
}
