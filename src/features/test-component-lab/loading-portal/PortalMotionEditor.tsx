import { useEffect, useRef, useState } from 'react'
import { PORTAL_ASSET_BASE, PORTAL_GEOMETRY, PORTAL_VARIANTS, type PortalVariant } from '../../../components/loading-portal/v2/portalGeometry'
import { usePortalVariant } from '../../../components/loading-portal/v2/usePortalVariant'
import { PortalMotionPreview } from './PortalMotionPreview'
import { PORTAL_MOTION_DEFAULTS, clamp, ease, type PortalMotionSettings } from './portal-motion-settings'

type Phase='idle'|'load'|'activate'|'open'|'hold'|'close'
type State={phase:Phase;elapsed:number;position:number;progress:number;start:number;full:boolean}
const initial=():State=>({phase:'idle',elapsed:0,position:0,progress:0,start:0,full:false})
const FIELDS:{key:'openMs'|'closeMs'|'lightSpeed'|'lightIntensity'|'activationMs'|'loadMs'|'holdMs';label:string;min:number;max:number;step:number;unit:string}[]=[
  {key:'openMs',label:'Duração da abertura',min:250,max:8000,step:50,unit:'ms'},
  {key:'closeMs',label:'Duração do fechamento',min:250,max:8000,step:50,unit:'ms'},
  {key:'lightSpeed',label:'Velocidade das luzes',min:.25,max:3,step:.25,unit:'×'},
  {key:'lightIntensity',label:'Intensidade das luzes',min:0,max:1,step:.05,unit:'%'},
  {key:'activationMs',label:'Pulso de ativação',min:0,max:1500,step:50,unit:'ms'},
  {key:'loadMs',label:'Carregamento simulado',min:500,max:12000,step:100,unit:'ms'},
  {key:'holdMs',label:'Tempo aberta no ciclo',min:0,max:5000,step:100,unit:'ms'},
]
/** Trusted, locally compiled Lab only. Reversible mechanical preview, independent of Home boot. */
export function PortalMotionEditor(){
  const [settings,setSettings]=useState<PortalMotionSettings>({...PORTAL_MOTION_DEFAULTS})
  const [variant,setVariant]=useState<PortalVariant>('16x9')
  const [state,setState]=useState<State>(initial)
  const [paused,setPaused]=useState(false)
  const [lights,setLights]=useState(true)
  const [systemReduced,setSystemReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [notice,setNotice]=useState('')
  const [hits,setHits]=useState(0)
  const stage=useRef<HTMLDivElement>(null)
  const prepared=usePortalVariant(stage,variant,false)
  const assetsReady=prepared?.status==='ready'&&prepared.variant===variant
  const reduced=systemReduced||settings.reducedMotion
  const clock=useRef<State>(initial())
  const current=useRef({settings,reduced})
  current.current={settings,reduced}
  const commit=(next:State)=>{clock.current=next;setState(next)}
  useEffect(()=>{const m=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setSystemReduced(m.matches);m.addEventListener('change',update);return()=>m.removeEventListener('change',update)},[])
  useEffect(()=>{
    if(paused||!assetsReady||state.phase==='idle')return
    let frame=0,last=0
    const tick=(now:number)=>{
      if(document.hidden){last=0;frame=requestAnimationFrame(tick);return}
      const dt=last?Math.min(50,now-last):0;last=now
      const s=clock.current, cfg=current.current.settings, reduce=current.current.reduced
      const elapsed=s.elapsed+dt
      let next={...s,elapsed}
      switch(s.phase){
        case 'load': {const progress=Math.min(100,elapsed/cfg.loadMs*100);next={...next,progress};if(progress>=100)next={...next,phase:'activate',elapsed:0};break}
        case 'activate': if(reduce||elapsed>=cfg.activationMs)next={...next,phase:'open',elapsed:0,start:s.position,progress:100};break
        case 'open': {const t=reduce?1:clamp(elapsed/(cfg.openMs*Math.max(.01,1-s.start)),0,1);next={...next,position:s.start+(1-s.start)*ease(t)};if(t===1)next={...next,position:1,phase:s.full?'hold':'idle',elapsed:0};break}
        case 'hold': if(elapsed>=cfg.holdMs)next={...next,phase:'close',elapsed:0,start:1};break
        case 'close': {const t=reduce?1:clamp(elapsed/(cfg.closeMs*Math.max(.01,s.start)),0,1);next={...next,position:s.start*(1-ease(t))};if(t===1)next={...initial(),phase:s.full&&cfg.loop?'load':'idle',full:s.full&&cfg.loop};break}
        default:return
      }
      clock.current=next;setState(next)
      if(next.phase!=='idle')frame=requestAnimationFrame(tick)
    }
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)
  },[paused,assetsReady,state.phase])
  const setField=<K extends keyof PortalMotionSettings>(key:K,value:PortalMotionSettings[K])=>setSettings(s=>({...s,[key]:value}))
  const full=()=>{setPaused(false);commit({...initial(),phase:'load',full:true})}
  const open=()=>{setPaused(false);const s=clock.current;commit({...s,phase:s.position===0?'activate':'open',elapsed:0,start:s.position,progress:100,full:false})}
  const close=()=>{setPaused(false);const s=clock.current;commit({...s,phase:'close',elapsed:0,start:s.position,full:false})}
  const reset=()=>{setPaused(false);commit(initial())}
  const exportSettings=()=>{const data=JSON.stringify({schemaVersion:1,component:'loading-portal-v2',variant,settings},null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='loading-portal-motion-preset.json';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Configuração exportada.')}
  const g=PORTAL_GEOMETRY[variant]
  return <section className="lcr-portal-lab" data-testid="portal-motion-editor" aria-label="Editor da porta de entrada">
    <div className="lcr-portal-lab-top"><div><h2>Porta de entrada · Editor V2</h2><p>Arte original, luz SVG e movimento mecânico. O carregamento é apenas simulado neste laboratório.</p></div>
      <label>Formato <select aria-label="Formato do portão" value={variant} onChange={e=>{reset();setVariant(e.target.value as PortalVariant)}}>{PORTAL_VARIANTS.map(v=><option key={v} value={v}>{v.replace('x',':').replace('_',',')}</option>)}</select></label></div>
    <div className="pme-layout"><div className="pme-main">
      <div className="pme-stage" ref={stage} style={{aspectRatio:g.width+' / '+g.height}} data-portrait={g.height>g.width}>
        <div className="pme-underlay" inert={state.position<1}><small>LCR · LIVE REACT PREVIEW</small><strong>Engenharia de IA e Software</strong><p>Conteúdo real montado atrás da porta.</p><button type="button" onClick={()=>setHits(x=>x+1)}>Testar interação ({hits})</button></div>
        {assetsReady?<PortalMotionPreview variant={variant} position={state.position} progress={state.progress} settings={settings} playing={lights&&!paused} activated={state.phase==='activate'} assetsReady reduced={reduced}/>:<div className="pme-portal"><img className="pme-reference" alt="Porta fechada" src={PORTAL_ASSET_BASE+g.reference}/></div>}
      </div>
      <div className="pme-buttons">
        <button type="button" data-testid="portal-editor-run" disabled={!assetsReady} onClick={full}>Ciclo completo / Replay</button>
        <button type="button" data-testid="portal-editor-open" disabled={!assetsReady} onClick={open}>Abrir</button>
        <button type="button" data-testid="portal-editor-close" disabled={!assetsReady} onClick={close}>Fechar</button>
        <button type="button" data-testid="portal-editor-pause" aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?'Retomar':'Pausar'}</button>
        <button type="button" onClick={reset}>Reset</button>
      </div>
      <label className="lcr-portal-lab-range">Posição das folhas — {Math.round(state.position*100)}%<input data-testid="portal-editor-position" type="range" min="0" max="100" step="1" value={Math.round(state.position*100)} disabled={!assetsReady} onChange={e=>{const p=Number(e.target.value)/100;setPaused(true);commit({...clock.current,position:p,phase:'idle',full:false})}}/></label>
      <p role="status" className="pme-note">{prepared?.status==='failed'?'Falha ao carregar os recursos.':!assetsReady?'Preparando imagens…':paused?'Pausado':state.phase==='idle'?(state.position===1?'Aberta':state.position===0?'Fechada':'Posição manual'):state.phase==='load'?'Carregamento simulado':state.phase==='activate'?'Energizando núcleo':state.phase==='open'?'Abrindo':state.phase==='hold'?'Aberta':'Fechando'} · {Math.floor(state.progress)}%</p>
    </div><aside className="pme-panel" aria-label="Parâmetros da porta"><h3>Movimento e iluminação</h3>
      {FIELDS.map(f=><label key={f.key} className="pme-field"><span>{f.label}<strong>{f.unit==='%'?Math.round(settings[f.key]*100):settings[f.key]}{f.unit}</strong></span><input aria-label={f.label} type="range" min={f.min} max={f.max} step={f.step} value={settings[f.key]} onChange={e=>setField(f.key,Number(e.target.value))}/></label>)}
      <label><input type="checkbox" checked={lights} onChange={e=>setLights(e.target.checked)}/> Animar luzes</label>
      <label><input type="checkbox" checked={settings.showCounter} onChange={e=>setField('showCounter',e.target.checked)}/> Mostrar contador</label>
      <label><input type="checkbox" checked={settings.loop} onChange={e=>setField('loop',e.target.checked)}/> Repetir ciclo</label>
      <label><input type="checkbox" checked={settings.reducedMotion} onChange={e=>setField('reducedMotion',e.target.checked)}/> Movimento reduzido</label>
      <button type="button" onClick={()=>{setSettings({...PORTAL_MOTION_DEFAULTS});setLights(true);reset();setNotice('Padrões restaurados.')}}>Restaurar padrão</button>
      <button type="button" onClick={exportSettings}>Exportar configuração JSON</button>
      <a href={PORTAL_ASSET_BASE+PORTAL_GEOMETRY['16x9'].reference} download="loading-portal-base-16x9.webp">Baixar porta original 16:9</a>
      <p className="pme-note" role="status">{notice}</p>
    </aside></div>
  </section>
}
