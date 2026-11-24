import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { LoadingPortalV2 } from '../../components/loading-portal/v2/LoadingPortalV2'
import type { PortalAssetState } from '../../components/loading-portal/v2/usePortalVariant'
import type { PortalVariant } from '../../components/loading-portal/v2/portalGeometry'
import { HomeMotionProvider } from './HomeMotionContext'
import {
  BOOT_TASKS, createBootTasks, confirmedBootProgress, isUsableTask, isHomeDomReady,
  markHomeBoot, measureHomeBoot, waitForHomeDom, waitForHeroMedia, waitForCanvas, waitForFonts,
  type BootOutcome, type BootTaskRecord, type HomeBootTask,
} from './preloadCriticalResources'
import './home-boot.css'

type BootState = 'initializing'|'loading'|'ready'|'activating'|'opening'|'opened'|'degraded'|'error'|'cancelled'
type Release = 'mechanical'|'fallback'
type Run = { route: string; serial: number; gate: boolean; phase: BootState; slow: boolean;
  tasks: Record<HomeBootTask,BootTaskRecord>; release?: Release }
const SESSION_KEY='lcr-loading-portal-v2-opened'
function readSession(){try{return sessionStorage.getItem(SESSION_KEY)==='1'}catch{return false}}
function recordSession(){try{sessionStorage.setItem(SESSION_KEY,'1')}catch{/* private mode */}}
function makeRun(route:string,serial:number,gate:boolean):Run{
  return {route,serial,gate,phase:gate?'initializing':'opened',slow:false,tasks:createBootTasks()}
}

/** Real Home stays mounted behind the one shared V2 composition.
 * The counter only advances on verified task outcomes. No RAF progress loop.
 * The isolated Lab owns its own simulation, never imported here. */
export function HomeBootCoordinator({children}:{children:ReactNode}){
  const location=useLocation(), home=location.pathname==='/'
  const force=new URLSearchParams(location.search).get('portal')
  const route=home?location.key+':'+location.search:'outside-home'
  const gate=()=>home&&force!=='skip'&&(force==='replay'||!readSession())
  const [run,setRun]=useState(()=>makeRun(route,1,gate()))
  // Reset only boot state, never remount the real application subtree.
  if(run.route!==route) setRun(makeRun(route,run.serial+1,gate()))
  const serial=run.serial
  const active=home&&force!=='skip'&&run.gate&&run.route===route
  const showPortal=active&&run.phase!=='opened'
  const homeSafe=run.tasks['home-render'].state==='completed'
  const assetsReady=run.tasks['door-art'].state==='completed'
  const homePrepared=homeSafe&&(['hero-media','canvas','fonts'] as HomeBootTask[]).every(t=>isUsableTask(run.tasks[t]))
  const ready=homePrepared&&assetsReady&&run.phase!=='error'
  const progress=ready?100:Math.min(99,confirmedBootProgress(run.tasks))
  const current=useRef(run);current.current=run
  const activeRef=useRef(showPortal);activeRef.current=showPortal
  const finished=useRef(0), opening=useRef(0), mounted=useRef(0), released=useRef(0)
  const priorFocus=useRef<HTMLElement|null>(null)

  const report=useCallback((task:HomeBootTask,outcome:BootOutcome)=>{
    if(outcome==='cancelled'||!activeRef.current||current.current.serial!==serial||finished.current===serial)return
    const state=outcome==='ok'?'completed':outcome==='fallback'?'fallback':'failed'
    markHomeBoot('home-boot:'+task+':'+outcome)
    if(task==='home-render'&&outcome==='ok')markHomeBoot('home-render-ready')
    if(task==='door-art'&&outcome==='ok')markHomeBoot('portal-mechanical-assets-ready')
    setRun(previous=>{
      if(previous.serial!==serial||previous.phase==='opened')return previous
      const old=previous.tasks[task]
      if(old.state===state)return previous
      return {...previous,phase:task==='home-render'&&state==='completed'&&previous.phase==='error'?'loading':previous.phase,
        tasks:{...previous.tasks,[task]:{...old,state,durationMs:Math.round(performance.now()-old.startedAt)}}}
    })
  },[serial])

  useEffect(()=>{
    if(!showPortal)return
    const controller=new AbortController(), signal=controller.signal
    if(mounted.current!==serial){mounted.current=serial;markHomeBoot('portal-mounted')}
    setRun(previous=>previous.serial===serial?{...previous,phase:previous.phase==='initializing'?'loading':previous.phase,
      tasks:Object.fromEntries(BOOT_TASKS.map(t=>[t,previous.tasks[t].state==='pending'?{...previous.tasks[t],state:'running',startedAt:performance.now()}:previous.tasks[t]])) as Run['tasks']}:previous)
    void waitForFonts(signal).then(result=>report('fonts',result))
    void (async()=>{
      let result=await waitForHomeDom(signal)
      if(signal.aborted)return
      report('home-render',result)
      if(result==='failed'){
        report('hero-media','failed');report('canvas','failed')
        // Keep observing for a bounded second chance on genuinely slow loads.
        // Recovery is still driven by the actual DOM, never the timeout.
        result=await waitForHomeDom(signal,18000)
        if(signal.aborted)return
        report('home-render',result)
      }
      if(result==='ok'){
        void waitForHeroMedia(signal).then(outcome=>report('hero-media',outcome))
        void waitForCanvas(signal).then(outcome=>report('canvas',outcome))
      }
    })()
    const timer=window.setTimeout(()=>{if(!signal.aborted)setRun(p=>p.serial===serial?{...p,slow:true}:p)},7000)
    return ()=>{controller.abort();window.clearTimeout(timer)}
  },[serial,showPortal,report])

  useEffect(()=>{
    if(!showPortal||run.phase==='opening'||run.phase==='activating')return
    if(run.tasks['home-render'].state==='failed') {
      if(run.phase!=='error')setRun(p=>({...p,phase:'error'}))
      return
    }
    if(ready&&run.phase!=='ready'&&run.phase!=='degraded'){
      markHomeBoot('home-critical-resources-ready');markHomeBoot('portal-progress-complete')
      const degraded=BOOT_TASKS.some(t=>run.tasks[t].state==='fallback')
      setRun(p=>({...p,phase:degraded?'degraded':'ready'}))
    }
  },[showPortal,ready,run.phase,run.tasks])

  useEffect(()=>{
    if(!showPortal||(run.phase!=='ready'&&run.phase!=='degraded'))return
    setRun(p=>p.phase==='ready'||p.phase==='degraded'?{...p,phase:'activating'}:p)
  },[showPortal,run.phase])

  const finish=useCallback((release:Release)=>{
    if(!activeRef.current||current.current.serial!==serial||finished.current===serial)return
    // Even a manual fallback must never expose an unmounted/skeleton Home.
    if(!isHomeDomReady()){
      setRun(p=>p.serial===serial?{...p,phase:'error'}:p);return
    }
    finished.current=serial
    recordSession()
    if(release==='mechanical'){
      markHomeBoot('portal-opened');measureHomeBoot('portal-total','portal-mounted','portal-opened')
    }else markHomeBoot('portal-fallback')
    setRun(p=>p.serial===serial?{...p,phase:'opened',release}:p)
  },[serial])

  useEffect(()=>{
    if(showPortal&&homePrepared&&run.tasks['door-art'].state==='failed')finish('fallback')
  },[showPortal,homePrepared,run.tasks,finish])
  useEffect(()=>{
    if(run.phase!=='opened'||!run.release||released.current===serial)return
    released.current=serial;markHomeBoot('home-animation-started');markHomeBoot('home-interactive')
  },[run.phase,run.release,serial])

  useEffect(()=>{
    if(!showPortal)return
    const previous=document.body.style.overflow
    priorFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null
    document.body.style.overflow='hidden'
    return ()=>{
      document.body.style.overflow=previous
      const focus=priorFocus.current
      if(focus?.isConnected&&focus!==document.body)focus.focus({preventScroll:true})
      priorFocus.current=null
    }
  },[showPortal,serial])

  const onAssetState=useCallback((state:PortalAssetState,variant?:PortalVariant)=>{
    if(!activeRef.current||current.current.serial!==serial)return
    if(variant)markHomeBoot('portal-variant-selected:'+variant)
    if(variant&&(state==='loading'||state==='ready'))markHomeBoot('portal-background-decoded')
    if(state==='ready')report('door-art','ok')
    else if(state==='failed')report('door-art','failed')
  },[report,serial])
  const onOpening=useCallback(()=>{
    if(!activeRef.current||current.current.serial!==serial||opening.current===serial||finished.current===serial)return
    opening.current=serial;markHomeBoot('portal-opening')
    setRun(p=>p.serial===serial?{...p,phase:'opening'}:p)
  },[serial])

  return <HomeMotionProvider enabled={!showPortal}>
    <div className="home-boot-app" data-testid="home-boot-app"
      data-boot-state={active?run.phase:'bypassed'} data-home-ready={homeSafe?'true':'false'}
      data-boot-outcome={run.release}
      data-boot-tasks={JSON.stringify(run.tasks)}
      aria-hidden={showPortal?'true':undefined}
      ref={node=>{if(node){if(showPortal)node.setAttribute('inert','');else node.removeAttribute('inert')}}}>
      {children}
    </div>
    {showPortal&&<div className="home-boot-overlay" data-testid="home-boot-overlay" data-boot-state={run.phase}>
      <LoadingPortalV2 key={serial} progress={progress}
        ready={ready&&(run.phase==='ready'||run.phase==='degraded'||run.phase==='activating'||run.phase==='opening')}
        allowFallback={homeSafe} onAssetState={onAssetState} onOpening={onOpening}
        onOpened={()=>finish('mechanical')} onFallback={()=>finish('fallback')}/>
      {(run.slow||run.phase==='error'||run.tasks['door-art'].state==='failed')&&run.phase!=='opening'&&
        <div className="home-boot-recovery" role="status" aria-live="polite">
          <p>{run.phase==='error'?'Não foi possível preparar a capa automaticamente.':run.tasks['door-art'].state==='failed'?
            'A animação da porta não pôde ser carregada.':'O carregamento está demorando mais que o esperado.'}</p>
          {homeSafe&&<button type="button" data-testid="home-boot-continue" onClick={()=>finish('fallback')}>Abrir portfólio</button>}
          <button type="button" onClick={()=>window.location.reload()}>Tentar novamente</button>
        </div>}
    </div>}
  </HomeMotionProvider>
}
