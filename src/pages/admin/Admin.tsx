import { useEffect,useMemo,useState } from 'react'
import { ExternalLink,FileText,LogOut,Save,Trash2,Upload } from 'lucide-react'
import { contentService,cvService,mediaService,projectService,runtimeInfo } from '../../bootstrap/services'
import { useSiteContent } from '../../providers/SiteContentProvider'
import { useToast } from '../../providers/ToastProvider'
import { RichTextEditor } from '../../components/admin/RichTextEditor'
import { ImageUploader } from '../../components/admin/ImageUploader'
import { ProjectInstitutionsAdmin } from '../../components/admin/ProjectInstitutionsAdmin'
import { AboutAdminEditor } from '../../components/admin/AboutAdminEditor'
import { DirtyGuard } from '../../components/admin/DirtyGuard'
import { CvViewer } from '../../components/CvViewer'
import { humanizeError } from '../../utils/errors'
import { useAuth } from '../../providers/AuthProvider'
import type { Project } from '../../domain/models/Project'
import type { HomeContent,SeoContent,SiteSettingsContent,SocialLink } from '../../domain/models/SiteContent'

const sections=['Overview','Home','About','Projects','More Projects','Social Links','Media Library','CV','SEO','Settings'] as const
type Section=typeof sections[number]
type EditLocale='en-US'|'pt-BR'
function LanguageTabs({value,onChange}:{value:EditLocale;onChange:(v:EditLocale)=>void}){return <div className="admin-language-tabs"><button className={value==='en-US'?'active':''} onClick={()=>onChange('en-US')} type="button">EN-US</button><button className={value==='pt-BR'?'active':''} onClick={()=>onChange('pt-BR')} type="button">PT-BR</button></div>}

export function Admin(){
 const{user,loading,isAdmin,signIn,signOut}=useAuth()
 const[active,setActive]=useState<Section>('Overview')
 const[dirty,setDirty]=useState(false)
 const[pending,setPending]=useState<Section>()
 const[email,setEmail]=useState('leo.c.rossato@gmail.com')
 const[password,setPassword]=useState('')
 const[signingIn,setSigningIn]=useState(false)
 const toast=useToast()
 const{content,projects,refreshContent,refreshProjects}=useSiteContent()
 const[adminProjects,setAdminProjects]=useState<Project[]>([])
 const[adminProjectsLoading,setAdminProjectsLoading]=useState(false)

 const refreshAdminProjects=async()=>{
  setAdminProjectsLoading(true)
  try{
   const all=await projectService.getAllForAdmin()
   setAdminProjects(all)
   await refreshProjects()
  }catch(error){
   toast.error('Could not load project manager.',humanizeError(error))
  }finally{
   setAdminProjectsLoading(false)
  }
 }

 useEffect(()=>{if(isAdmin)void refreshAdminProjects()},[isAdmin])

 useEffect(()=>{const f=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',f);return()=>window.removeEventListener('beforeunload',f)},[dirty])

 const login=async(e:React.FormEvent)=>{
  e.preventDefault()
  setSigningIn(true)
  try{
   await signIn(email,password)
   setPassword('')
  }catch(error){
   toast.error('Não foi possível entrar.',humanizeError(error))
  }finally{
   setSigningIn(false)
  }
 }

 const changeSection=(next:Section)=>{if(dirty){setPending(next);return}setActive(next)}

 if(loading)return <main className="admin-login"><div className="admin-login-card"><div className="eyebrow">Portfolio Administration</div><h1>Loading...</h1><p className="admin-note">Recovering your Supabase session.</p></div></main>

 if(!user)return <main className="admin-login"><div className="admin-login-card"><div className="eyebrow">Portfolio Administration</div><h1>This area is restricted.</h1><p>Only authorized administrators can access this area.</p><form onSubmit={login} className="admin-auth-form"><label className="form-field"><span>Email</span><input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label className="form-field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="button" type="submit" disabled={signingIn}>{signingIn?'Signing in...':'Sign In'}</button></form>{!runtimeInfo.supabaseConfigured&&<p className="admin-note">Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.</p>}</div></main>

 if(!isAdmin)return <main className="admin-login"><div className="admin-login-card"><h1>Access denied.</h1><p>This account is not authorized to access the administration area.</p><button className="button" onClick={()=>void signOut()}>Sign Out</button></div></main>

 return <main className="admin-shell"><aside><div><strong>Portfolio Admin</strong><small>{user.email}</small></div><nav>{sections.map(x=><button className={active===x?'active':''} key={x} onClick={()=>changeSection(x)}>{x}</button>)}</nav><button onClick={()=>void signOut()}><LogOut size={16}/> Sign Out</button></aside><section className="admin-content"><header><div><div className="eyebrow">ADMIN</div><h1>{active}</h1></div>{dirty&&<span className="dirty-pill">Unsaved changes</span>}</header>
 {active==='Overview'&&<Overview projects={adminProjects.length?adminProjects:projects}/>} 
 {active==='Home'&&<HomeEditor initial={content.home} onDirty={setDirty} done={async v=>{await contentService.saveHome(v);await refreshContent()}}/>}
 {active==='About'&&<AboutAdminEditor initial={content.about} socials={content.socialLinks} cvUrl={content.cvUrl} onDirty={setDirty} refresh={refreshContent}/>} 
 {active==='Projects'&&<ProjectsManager projects={adminProjects} loading={adminProjectsLoading} onDirty={setDirty} refresh={refreshAdminProjects}/>} 
 {active==='More Projects'&&<ProjectsManager projects={adminProjects} loading={adminProjectsLoading} initialPlacement="more" onDirty={setDirty} refresh={refreshAdminProjects}/>} 
 {active==='Social Links'&&<SocialEditor initial={content.socialLinks} onDirty={setDirty} done={async v=>{await contentService.saveSocialLinks(v);await refreshContent()}}/>}
 {active==='Media Library'&&<MediaLibrary/>}
 {active==='CV'&&<CvAdmin url={content.cvUrl} done={refreshContent}/>} 
 {active==='SEO'&&<SeoEditor initial={content.seo} onDirty={setDirty} done={async v=>{await contentService.saveSeo(v);await refreshContent()}}/>}
 {active==='Settings'&&<SettingsEditor initial={content.siteSettings} done={async v=>{await contentService.saveSiteSettings(v);await refreshContent()}}/>}
 </section><DirtyGuard open={!!pending} onCancel={()=>setPending(undefined)} onDiscard={()=>{setDirty(false);if(pending)setActive(pending);setPending(undefined)}}/></main>
}
function Overview({projects}:{projects:Project[]}){
 const visible=projects.filter(project=>project.visible!==false).length
 const hidden=projects.length-visible
 const main=projects.filter(project=>(project.placement??(project.caseStudy?'main':'more'))==='main').length
 const more=projects.length-main
 return <div className="admin-stats"><div><span>Projects</span><strong>{projects.length}</strong></div><div><span>Visible / Hidden</span><strong>{visible} / {hidden}</strong></div><div><span>Main / More</span><strong>{main} / {more}</strong></div></div>
}


function projectSectionEditorValue(value: Project['sections'][keyof Project['sections']]): string {
 if(typeof value==='string')return value
 if(Array.isArray(value))return value.filter((item):item is string=>typeof item==='string').join('\n\n')
 if(value&&typeof value==='object'){
  const candidate=value.body??value.content??value.description??value.text
  if(typeof candidate==='string')return candidate
  if(Array.isArray(candidate))return candidate.filter((item):item is string=>typeof item==='string').join('\n\n')
 }
 return ''
}

function SaveButton({busy,onClick}:{busy:boolean;onClick:()=>Promise<void>}){return <button className="button admin-save" disabled={busy} onClick={onClick}><Save size={16}/>{busy?'Salvando...':'Salvar alterações'}</button>}
function Field({label,value,onChange,type='text'}:{label:string;value:string;onChange:(v:string)=>void;type?:string}){return <label className="form-field"><span>{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)}/></label>}
function TextArea({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="form-field"><span>{label}</span><textarea value={value} onChange={e=>onChange(e.target.value)}/></label>}
function TagsEditor({label,items,onChange}:{label:string;items:string[];onChange:(v:string[])=>void}){const[value,setValue]=useState('');return <div className="tags-editor"><span className="field-label">{label}</span><div className="editable-tags">{items.map((x,i)=><span key={`${x}-${i}`}>{x}<button onClick={()=>onChange(items.filter((_,j)=>j!==i))}>×</button></span>)}</div><div className="tag-add"><input value={value} placeholder="Add item" onChange={e=>setValue(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&value.trim()){e.preventDefault();onChange([...items,value.trim()]);setValue('')}}}/><button className="button button-secondary" onClick={()=>{if(value.trim()){onChange([...items,value.trim()]);setValue('')}}}>+ Add</button></div></div>}

function HomeEditor({initial,onDirty,done}:{initial:HomeContent;onDirty:(v:boolean)=>void;done:(v:HomeContent)=>Promise<void>}){
 const[v,setV]=useState(initial);const[busy,setBusy]=useState(false);const[lang,setLang]=useState<EditLocale>('en-US');const toast=useToast();useEffect(()=>setV(initial),[initial]);
 const current=lang==='en-US'?v:{...v,...(v.translations?.['pt-BR']||{})}
 const changeFields=(patch:Partial<HomeContent>)=>{if(lang==='en-US')setV({...v,...patch});else setV({...v,translations:{...v.translations,'pt-BR':{...(v.translations?.['pt-BR']||{}),...patch}}});onDirty(true)}
 return <div className="admin-form cms-form"><LanguageTabs value={lang} onChange={setLang}/><Field label="Hero eyebrow" value={current.eyebrow||''} onChange={x=>changeFields({eyebrow:x})}/><Field label="Hero title" value={current.title||''} onChange={x=>changeFields({title:x})}/><Field label="Highlighted text" value={current.highlightedWords||''} onChange={x=>changeFields({highlightedWords:x})}/><TextArea label="Description" value={current.description||''} onChange={x=>changeFields({description:x})}/><TagsEditor label="Skills" items={current.skills||[]} onChange={x=>changeFields({skills:x})}/><SaveButton busy={busy} onClick={async()=>{setBusy(true);try{await done(v);onDirty(false);toast.success('Alterações salvas com sucesso.')}catch(e){toast.error('Erro ao salvar alterações.',humanizeError(e))}finally{setBusy(false)}}}/></div>
}

function ProjectsManager({projects,loading,initialPlacement='all',onDirty,refresh}:{projects:Project[];loading?:boolean;initialPlacement?:'all'|'main'|'more';onDirty:(v:boolean)=>void;refresh:()=>Promise<void>}){
 const[selected,setSelected]=useState<Project>()
 const[visibilityFilter,setVisibilityFilter]=useState<'all'|'visible'|'hidden'>('all')
 const[placementFilter,setPlacementFilter]=useState<'all'|'main'|'more'>(initialPlacement)
 const[busyId,setBusyId]=useState<string>()
 const toast=useToast()
 useEffect(()=>setPlacementFilter(initialPlacement),[initialPlacement])
 const placementOf=(project:Project)=>(project.placement??(project.caseStudy?'main':'more')) as 'main'|'more'
 const orderOf=(project:Project)=>project.sortOrder??project.order??999
 const withOrder=(project:Project,sortOrder:number):Project=>({...project,sortOrder,order:sortOrder})
 const normalize=(items:Project[],placement:'main'|'more')=>{const section=items.filter(project=>placementOf(project)===placement).sort((a,b)=>orderOf(a)-orderOf(b));const normalized=new Map(section.map((project,index)=>[project.id,index+1]));return items.map(project=>normalized.has(project.id)?withOrder(project,normalized.get(project.id)!):project)}
 const persistChanged=async(next:Project[],previous:Project[],message:string)=>{const previousById=new Map(previous.map(project=>[project.id,project]));const changed=next.filter(project=>{const old=previousById.get(project.id);return !old||old.visible!==project.visible||placementOf(old)!==placementOf(project)||orderOf(old)!==orderOf(project)});if(!changed.length)return;setBusyId(changed[0].id);try{await Promise.all(changed.map(project=>projectService.update(project)));await refresh();toast.success(message)}catch(error){toast.error('Could not update project.',humanizeError(error))}finally{setBusyId(undefined)}}
 const setVisibility=async(project:Project,visible:boolean)=>{await persistChanged(projects.map(item=>item.id===project.id?{...item,visible}:item),projects,visible?'Project is now visible.':'Project is now hidden.')}
 const changePlacement=async(project:Project,target:'main'|'more')=>{const current=placementOf(project);if(current===target)return;const confirmation=target==='main'?'Move this project to Main Projects?\nMover este projeto para Projetos Principais?':'Move this project to More Projects?\nMover este projeto para Outros Projetos?';if(!window.confirm(confirmation))return;const maxTarget=Math.max(0,...projects.filter(item=>placementOf(item)===target).map(orderOf));let next=projects.map(item=>item.id===project.id?{...item,placement:target,sortOrder:maxTarget+1,order:maxTarget+1}:item);next=normalize(normalize(next,current),target);await persistChanged(next,projects,target==='main'?'Project moved to Main Projects.':'Project moved to More Projects.')}
 const move=async(project:Project,direction:-1|1)=>{const placement=placementOf(project);const section=projects.filter(item=>placementOf(item)===placement).sort((a,b)=>orderOf(a)-orderOf(b));const index=section.findIndex(item=>item.id===project.id);const targetIndex=index+direction;if(index<0||targetIndex<0||targetIndex>=section.length)return;const a=section[index];const b=section[targetIndex];let next=projects.map(item=>item.id===a.id?withOrder(item,orderOf(b)):item.id===b.id?withOrder(item,orderOf(a)):item);next=normalize(next,placement);await persistChanged(next,projects,'Project order updated.')}
 const setOrder=async(project:Project,value:number)=>{const placement=placementOf(project);const section=projects.filter(item=>placementOf(item)===placement).sort((a,b)=>orderOf(a)-orderOf(b));const currentIndex=section.findIndex(item=>item.id===project.id);if(currentIndex<0)return;const requested=Math.max(1,Math.min(section.length,Math.round(Number.isFinite(value)?value:currentIndex+1)));const reordered=[...section];const[moved]=reordered.splice(currentIndex,1);reordered.splice(requested-1,0,moved);const positions=new Map(reordered.map((item,index)=>[item.id,index+1]));const next=projects.map(item=>positions.has(item.id)?withOrder(item,positions.get(item.id)!):item);await persistChanged(next,projects,'Project order updated.')}
 const visibleCount=projects.filter(project=>project.visible!==false).length
 const hiddenCount=projects.length-visibleCount
 const mainCount=projects.filter(project=>placementOf(project)==='main').length
 const moreCount=projects.length-mainCount
 const filtered=projects.filter(project=>visibilityFilter==='all'||(visibilityFilter==='visible'?project.visible!==false:project.visible===false)).filter(project=>placementFilter==='all'||placementOf(project)===placementFilter).sort((a,b)=>{const pa=placementOf(a),pb=placementOf(b);if(pa!==pb)return pa==='main'?-1:1;return orderOf(a)-orderOf(b)})
 if(selected)return <ProjectForm key={selected.id} initial={selected} compact={false} onDirty={onDirty} refresh={refresh} close={()=>{onDirty(false);setSelected(undefined)}}/>
 return <div className="project-manager"><div className="project-manager-summary"><strong>{projects.length} Projects</strong><span>{visibleCount} Visible</span><span>{hiddenCount} Hidden</span><span>{mainCount} Main</span><span>{moreCount} More</span></div><div className="project-manager-filters"><div className="project-filter-group" aria-label="Visibility filter">{(['all','visible','hidden'] as const).map(value=><button key={value} type="button" className={visibilityFilter===value?'active':''} onClick={()=>setVisibilityFilter(value)}>{value==='all'?'All':value==='visible'?'Visible':'Hidden'}</button>)}</div><label className="form-field project-section-filter"><span>Section</span><select value={placementFilter} onChange={event=>setPlacementFilter(event.target.value as 'all'|'main'|'more')}><option value="all">All Sections</option><option value="main">Main Projects</option><option value="more">More Projects</option></select></label></div>{loading&&<p className="admin-note">Loading projects...</p>}<div className="project-admin-grid project-admin-grid-editorial">{filtered.map(project=>{const placement=placementOf(project);const hidden=project.visible===false;const busy=busyId===project.id;return <article key={project.id} className={`project-admin-card project-admin-editorial-card ${hidden?'is-hidden':''}`}><div className="project-admin-thumb">{project.coverImage?.url?<img src={project.coverImage.url} alt=""/>:<div className="project-admin-thumb-placeholder">{(project.title||'P').slice(0,1)}</div>}</div><div className="project-admin-info"><div className="project-admin-badges"><span>{project.category}</span>{hidden&&<strong>Hidden</strong>}</div><h3>{project.title}</h3><small>{project.status}</small></div><div className="project-admin-quick-controls"><label><span>Visibility</span><select disabled={busy} value={hidden?'hidden':'visible'} onChange={event=>void setVisibility(project,event.target.value==='visible')}><option value="visible">Visible</option><option value="hidden">Hidden</option></select></label><label><span>Section</span><select disabled={busy} value={placement} onChange={event=>void changePlacement(project,event.target.value as 'main'|'more')}><option value="main">Main Projects</option><option value="more">More Projects</option></select></label><label><span>Order</span><input type="number" min="1" step="1" defaultValue={orderOf(project)} disabled={busy} onBlur={event=>void setOrder(project,Number(event.target.value))}/></label><div className="project-admin-order-buttons"><button type="button" disabled={busy} onClick={()=>void move(project,-1)} aria-label={`Move ${project.title} up`}>↑</button><button type="button" disabled={busy} onClick={()=>void move(project,1)} aria-label={`Move ${project.title} down`}>↓</button></div></div><div className="project-admin-actions">{project.caseEnabled!==false&&<a className="button button-secondary" href={`#/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">Preview</a>}<button className="button button-secondary" disabled={busy} onClick={()=>setSelected(project)}>Edit</button></div></article>})}</div></div>
}

function ProjectForm({initial,compact,onDirty,refresh,close}:{initial:Project;compact?:boolean;onDirty:(v:boolean)=>void;refresh:()=>Promise<void>;close:()=>void}){
 const[v,setV]=useState(initial);const[busy,setBusy]=useState(false);const[localDirty,setLocalDirty]=useState(false);const[lang,setLang]=useState<EditLocale>('en-US');const toast=useToast()
 const mark=(next:Project)=>{setV(next);setLocalDirty(true);onDirty(true)}
 const current=lang==='en-US'?v:{...v,...(v.translations?.['pt-BR']||{}),sections:{...v.sections,...(v.translations?.['pt-BR']?.sections||{})}}
 const changeLocalized=(patch:any)=>{if(lang==='en-US')mark({...v,...patch});else mark({...v,translations:{...v.translations,'pt-BR':{...(v.translations?.['pt-BR']||{}),...patch}}})}
 const save=async()=>{setBusy(true);try{await projectService.update(v);await refresh();onDirty(false);setLocalDirty(false);toast.success('Alterações salvas com sucesso.')}catch(e){toast.error('Erro ao salvar alterações.',humanizeError(e))}finally{setBusy(false)}}
 const saveCover=async(file:File)=>{setBusy(true);let nextAsset;try{mediaService.validateImage(file);nextAsset=await mediaService.upload(file,'Projects',`projects/${v.slug}`);const old=v.coverImage;const next={...v,coverImage:nextAsset,imageType:'real-screenshot' as const};await projectService.update(next);setV(next);onDirty(false);setLocalDirty(false);await refresh();if(old)mediaService.delete(old).catch(error=>console.warn('Old media cleanup failed.',error));toast.success('Imagem salva com sucesso.')}catch(e){if(nextAsset)await mediaService.delete(nextAsset).catch(()=>{});toast.error('Não foi possível enviar a imagem.',humanizeError(e));throw e}finally{setBusy(false)}}
 const removeCover=async()=>{setBusy(true);try{const old=v.coverImage;const next={...v,coverImage:undefined};await projectService.update(next);setV(next);onDirty(false);setLocalDirty(false);await refresh();if(old)await mediaService.delete(old).catch(()=>{});toast.success('Imagem removida com sucesso.')}catch(e){toast.error('Erro ao salvar alterações.',humanizeError(e))}finally{setBusy(false)}}
 const section=(key:keyof Project['sections'],label:string)=>{const html=projectSectionEditorValue(current.sections[key]);return <RichTextEditor label={label} value={html} onChange={x=>{if(lang==='en-US')mark({...v,sections:{...v.sections,[key]:x?[x]:[]}});else mark({...v,translations:{...v.translations,'pt-BR':{...(v.translations?.['pt-BR']||{}),sections:{...(v.translations?.['pt-BR']?.sections||{}),[key]:x?[x]:[]}}}})}}/>}
 return <div className="admin-form cms-form project-editor"><div className="editor-top"><button className="button button-secondary" onClick={()=>{if(!localDirty||window.confirm('You have unsaved changes. Discard changes?')){onDirty(false);close()}}}>← Back to projects</button><span className="status-pill">{v.status}</span></div><ImageUploader label="Cover Image" currentUrl={v.coverImage?.url} busy={busy} onSave={saveCover} onRemove={v.coverImage?removeCover:undefined}/><LanguageTabs value={lang} onChange={setLang}/><div className="form-columns"><Field label="Title" value={current.title||''} onChange={x=>changeLocalized({title:x})}/><Field label="Subtitle" value={current.subtitle||''} onChange={x=>changeLocalized({subtitle:x})}/><Field label="Category" value={current.category||''} onChange={x=>changeLocalized({category:x})}/><label className="form-field"><span>Status</span><select value={current.status} onChange={e=>changeLocalized({status:e.target.value as Project['status']})}><option>Live</option><option>Private Platform</option><option>Case Study in Progress</option><option>Coming Soon</option></select></label></div><RichTextEditor label="Short description" value={current.description||''} onChange={x=>changeLocalized({description:x})}/><TagsEditor label="Technologies" items={current.technologies||[]} onChange={x=>changeLocalized({technologies:x})}/>{!compact&&<><h2>Case Study</h2>{section('overview','Overview / Visão geral')}{section('advantages','Key advantages / Principais vantagens')}{section('userExperience','User experience / Experiência do usuário')}{section('properties','Properties & features / Propriedades e funcionalidades')}{section('technologiesUsed','Technologies used / Tecnologias utilizadas')}<div className="form-columns"><Field label="Live URL" value={v.links.liveUrl||''} onChange={x=>mark({...v,links:{...v.links,liveUrl:x}})}/><Field label="GitHub URL" value={v.links.githubUrl||''} onChange={x=>mark({...v,links:{...v.links,githubUrl:x}})}/><Field label="Research URL" value={v.links.researchUrl||''} onChange={x=>mark({...v,links:{...v.links,researchUrl:x}})}/><Field label="Institution URL" value={v.links.institutionUrl||''} onChange={x=>mark({...v,links:{...v.links,institutionUrl:x}})}/></div></>}<SaveButton busy={busy} onClick={save}/>
  <ProjectInstitutionsAdmin
    projectId={v.id}
    projectSource={v.source === 'more' ? 'more_projects' : 'projects'}
  />
 </div>
}

function SettingsEditor({initial,done}:{initial:SiteSettingsContent;done:(v:SiteSettingsContent)=>Promise<void>}){
 const clamp=(value:number)=>Math.min(130,Math.max(70,Number.isFinite(value)?Math.round(value):100))
 const[v,setV]=useState(initial);const[busy,setBusy]=useState(false);const toast=useToast();useEffect(()=>setV(initial),[initial])
 const setScale=(key:'mainCardScale'|'moreCardScale',value:number)=>setV(current=>({...current,[key]:clamp(value)}))
 const save=async()=>{setBusy(true);try{await done({...v,mainCardScale:clamp(v.mainCardScale),moreCardScale:clamp(v.moreCardScale)});toast.success('Layout settings saved.')}catch(e){toast.error('Could not save layout settings.',humanizeError(e))}finally{setBusy(false)}}
 const control=(label:string,key:'mainCardScale'|'moreCardScale')=><div className="layout-scale-control"><label htmlFor={key}>{label}</label><div><input id={key} type="range" min="70" max="130" step="1" value={clamp(v[key])} onChange={e=>setScale(key,Number(e.target.value))}/><label className="layout-scale-number"><input type="number" min="70" max="130" step="1" value={clamp(v[key])} onChange={e=>setScale(key,Number(e.target.value))}/><span>%</span></label><button className="button button-secondary" type="button" onClick={()=>setScale(key,100)}>Reset to 100%</button></div></div>
 return <div className="admin-form cms-form settings-admin"><section className="admin-card"><h2>Portfolio Layout</h2><p className="admin-note">Adjust card size from 70% to 130%. Changes are saved to Supabase when you click Save Layout Settings.</p>{control('Main Projects Card Size','mainCardScale')}{control('More Projects Card Size','moreCardScale')}<button className="button admin-save" type="button" disabled={busy} onClick={()=>void save()}><Save size={16}/>{busy?'Saving...':'Save Layout Settings'}</button></section><section className="admin-card"><h2>Runtime</h2><p>Supabase configured: <strong>{String(runtimeInfo.supabaseConfigured)}</strong></p><p>Authentication: <strong>Supabase Email + Password</strong></p><p>Database: <strong>Supabase PostgreSQL</strong></p><p>Storage: <strong>Supabase Storage</strong></p><p>Admin account: leo.c.rossato@gmail.com</p></section></div>
}

function SocialEditor({initial,onDirty,done}:{initial:SocialLink[];onDirty:(v:boolean)=>void;done:(v:SocialLink[])=>Promise<void>}){const[v,setV]=useState(initial);const[busy,setBusy]=useState(false);const toast=useToast();useEffect(()=>setV(initial),[initial]);const change=(i:number,patch:Partial<SocialLink>)=>{setV(v.map((x,j)=>j===i?{...x,...patch}:x));onDirty(true)};return <div className="admin-form cms-form"><div className="social-editor-grid">{v.sort((a,b)=>a.order-b.order).map((x,i)=><article className="social-edit-card" key={x.id}><Field label="Platform" value={x.platform} onChange={y=>change(i,{platform:y})}/><Field label="Label" value={x.label} onChange={y=>change(i,{label:y})}/><Field label="URL" value={x.url} onChange={y=>change(i,{url:y})}/><label className="toggle-row"><input type="checkbox" checked={x.visible} onChange={e=>change(i,{visible:e.target.checked})}/> Visible</label></article>)}</div><SaveButton busy={busy} onClick={async()=>{setBusy(true);try{await done(v);onDirty(false);toast.success('Alterações salvas com sucesso.')}catch(e){toast.error('Erro ao salvar alterações.',humanizeError(e))}finally{setBusy(false)}}}/></div>}

function faviconStoragePath(url?:string){
 if(!url)return ''
 try{
  const marker='/storage/v1/object/public/'
  const markerIndex=url.indexOf(marker)
  if(markerIndex<0)return ''
  const suffix=url.slice(markerIndex+marker.length).split('?')[0]
  const parts=suffix.split('/')
  parts.shift()
  return decodeURIComponent(parts.join('/'))
 }catch{return ''}
}

function SeoEditor({initial,onDirty,done}:{initial:SeoContent;onDirty:(v:boolean)=>void;done:(v:SeoContent)=>Promise<void>}){
 const[v,setV]=useState(initial)
 const[busy,setBusy]=useState(false)
 const[iconBusy,setIconBusy]=useState(false)
 const toast=useToast()
 useEffect(()=>setV(initial),[initial])
 const change=(x:SeoContent)=>{setV(x);onDirty(true)}

 const defaultFavicon=`${import.meta.env.BASE_URL}projects/logo_LCR_PortifolioApps.png`
 const faviconUrl=v.faviconUrl?.trim()||''
 const faviconPreview=faviconUrl||defaultFavicon
 const storagePath=faviconStoragePath(faviconUrl)
 const storageDisplay=storagePath?`portfolio-media/${storagePath}`:'Local fallback: public/projects/logo_LCR_PortifolioApps.png'

 const removeOldStorageIcon=async(url?:string)=>{
  const path=faviconStoragePath(url)
  if(!path||!path.startsWith('site-assets/favicon/'))return
  await mediaService.delete({
   id:path,
   url:url||'',
   path,
   name:path.split('/').pop()||'favicon',
   mimeType:'image/*',
   category:'Icons',
  }).catch(error=>console.warn('Could not remove previous favicon from Storage.',error))
 }

 const uploadIcon=async(file?:File)=>{
  if(!file||iconBusy)return
  setIconBusy(true)
  let uploaded
  try{
   mediaService.validateImage(file)
   uploaded=await mediaService.upload(file,'Icons','site-assets/favicon')
   const previous=v.faviconUrl
   const next={...v,faviconUrl:uploaded.url}
   await done(next)
   setV(next)
   onDirty(false)
   if(previous&&previous!==uploaded.url)await removeOldStorageIcon(previous)
   toast.success('Favicon atualizado com sucesso.')
  }catch(error){
   if(uploaded)await mediaService.delete(uploaded).catch(()=>undefined)
   toast.error('Não foi possível atualizar o favicon.',humanizeError(error))
  }finally{
   setIconBusy(false)
  }
 }

 const useDefault=async()=>{
  if(iconBusy)return
  setIconBusy(true)
  try{
   const previous=v.faviconUrl
   const next={...v,faviconUrl:undefined}
   await done(next)
   setV(next)
   onDirty(false)
   if(previous)await removeOldStorageIcon(previous)
   toast.success('Favicon padrão restaurado.')
  }catch(error){
   toast.error('Não foi possível restaurar o favicon padrão.',humanizeError(error))
  }finally{
   setIconBusy(false)
  }
 }

 return <div className="admin-form cms-form">
  <Field label="Site Title" value={v.siteTitle} onChange={x=>change({...v,siteTitle:x})}/>
  <TextArea label="Meta Description" value={v.metaDescription} onChange={x=>change({...v,metaDescription:x})}/>
  <Field label="OpenGraph Title" value={v.ogTitle} onChange={x=>change({...v,ogTitle:x})}/>
  <TextArea label="OpenGraph Description" value={v.ogDescription} onChange={x=>change({...v,ogDescription:x})}/>
  <Field label="OpenGraph Image URL" value={v.ogImage||''} onChange={x=>change({...v,ogImage:x})}/>

  <section className="admin-card">
   <h2>Site Icon / Favicon</h2>
   <p className="admin-note">PNG, JPG/JPEG, WEBP or SVG. A square image is recommended.</p>

   <div className="upload-preview">
    <img src={faviconPreview} alt="Current favicon preview"/>
   </div>

   <label className="form-field">
    <span>Current favicon URL</span>
    <input readOnly value={faviconUrl||defaultFavicon}/>
   </label>

   <div className="form-field">
    <span>Storage path</span>
    <code>{storageDisplay}</code>
   </div>

   <div className="cv-admin-actions">
    <label className="button">
     <Upload size={16}/> {iconBusy?'Uploading...':faviconUrl?'Replace icon':'Upload icon'}
     <input
      hidden
      type="file"
      accept="image/png,image/jpeg,image/webp,image/svg+xml"
      disabled={iconBusy}
      onChange={event=>void uploadIcon(event.target.files?.[0])}
     />
    </label>

    {faviconUrl&&<a className="button button-secondary" href={faviconUrl} target="_blank" rel="noopener noreferrer">
     <ExternalLink size={15}/> Open image
    </a>}

    <button className="button button-secondary" type="button" disabled={iconBusy||!faviconUrl} onClick={()=>void useDefault()}>
     Use default icon
    </button>
   </div>
  </section>

  <SaveButton busy={busy} onClick={async()=>{
   setBusy(true)
   try{
    await done(v)
    onDirty(false)
    toast.success('Alterações salvas com sucesso.')
   }catch(e){
    toast.error('Erro ao salvar alterações.',humanizeError(e))
   }finally{
    setBusy(false)
   }
  }}/>
 </div>
}

function MediaLibrary(){const[items,setItems]=useState<any[]>([]);const[busy,setBusy]=useState(false);const toast=useToast();const load=()=>mediaService.getLibrary().then(setItems).catch(e=>toast.error('Não foi possível carregar a mídia.',humanizeError(e)));useEffect(()=>{load()},[]);const up=async(f:File)=>{setBusy(true);try{await mediaService.upload(f,'Other');await load();toast.success('Arquivo enviado com sucesso.')}catch(e){toast.error('Não foi possível enviar o arquivo.',humanizeError(e))}finally{setBusy(false)}};return <div className="admin-card"><label className="button"><Upload size={16}/> {busy?'Enviando...':'Upload'}<input hidden type="file" onChange={e=>e.target.files?.[0]&&up(e.target.files[0])}/></label><div className="media-library-grid">{items.map(x=><article key={x.id}>{x.mimeType?.startsWith('image/')&&<img src={x.url} alt=""/>}<strong>{x.name}</strong><small>{x.category}</small><div><button onClick={()=>navigator.clipboard.writeText(x.url)}>Copy URL</button><button onClick={async()=>{if(confirm('Delete this media? Referenced pages may break.')){try{await mediaService.delete(x);await load();toast.success('Mídia removida.')}catch(e){toast.error('Não foi possível remover.',humanizeError(e))}}}}><Trash2 size={13}/> Delete</button></div></article>)}</div></div>}

function CvAdmin({url,done}:{url?:string;done:()=>Promise<void>}){
 const[busy,setBusy]=useState(false)
 const[selected,setSelected]=useState<File>()
 const[viewerOpen,setViewerOpen]=useState(false)
 const[status,setStatus]=useState('')
 const toast=useToast()

 const choose=(file?:File)=>{
  setStatus('')
  if(!file){setSelected(undefined);return}
  if(file.type!=='application/pdf'){
   setSelected(undefined)
   setStatus('Erro ao salvar CV: envie apenas arquivos PDF.')
   return
  }
  setSelected(file)
 }

 const save=async()=>{
  if(!selected||busy)return
  setBusy(true)
  setStatus('Salvando...')
  try{
   await cvService.replaceCv(selected)
   await done()
   setSelected(undefined)
   setStatus('CV atualizado com sucesso')
   toast.success('CV atualizado com sucesso.')
  }catch(e){
   const reason=humanizeError(e)
   setStatus(`Erro ao salvar CV: ${reason}`)
   toast.error('Erro ao salvar CV.',reason)
  }finally{
   setBusy(false)
  }
 }

 const remove=async()=>{
  setBusy(true)
  setStatus('Salvando...')
  try{
   await cvService.removeCv()
   await done()
   setStatus('CV removido com sucesso')
   toast.success('CV removido com sucesso.')
  }catch(e){
   const reason=humanizeError(e)
   setStatus(`Erro ao salvar CV: ${reason}`)
   toast.error('Erro ao salvar CV.',reason)
  }finally{
   setBusy(false)
  }
 }

 return <div className="admin-card cv-admin">
  <h2>Curriculum PDF</h2>
  {url?<div className="current-file"><FileText/><div><strong>CV atual</strong><button className="admin-inline-link" type="button" onClick={()=>setViewerOpen(true)}>Visualizar CV</button></div></div>:<p>Nenhum CV enviado.</p>}
  {selected&&<div className="current-file"><FileText/><div><strong>Arquivo selecionado</strong><span>{selected.name}</span></div></div>}
  <div className="cv-admin-actions">
   <label className="button button-secondary"><Upload size={16}/> Selecionar PDF<input hidden type="file" accept="application/pdf" disabled={busy} onChange={e=>choose(e.target.files?.[0])}/></label>
   {selected&&<button className="button" type="button" disabled={busy} onClick={()=>void save()}>{busy?'Salvando...':'Salvar CV'}</button>}
   {url&&<button className="text-danger" type="button" onClick={()=>void remove()} disabled={busy}>Remover CV</button>}
  </div>
  {status&&<p className={status.startsWith('Erro')?'inline-error':'admin-note'}>{status}</p>}
  {url&&<CvViewer open={viewerOpen} url={url} onClose={()=>setViewerOpen(false)}/>} 
 </div>
}
