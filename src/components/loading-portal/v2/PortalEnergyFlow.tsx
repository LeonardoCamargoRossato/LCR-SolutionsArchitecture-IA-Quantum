import { memo, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { PORTAL_GEOMETRY, type PortalVariant } from './portalGeometry'
import { ENERGY_ROUTES, ENERGY_ORBIT_CENTER, ENERGY_ORBIT_RADIUS, visibleRoute, type EnergyPoint } from './portalEnergyRoutes'
import './portal-energy-flow.css'

const ORBS=5
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n))
const pointTransform=(p:EnergyPoint)=>'translate3d('+p[0].toFixed(2)+'px,'+p[1].toFixed(2)+'px,0)'
function routeFrames(points:EnergyPoint[]):Keyframe[]{
  const distance=[0]
  for(let i=1;i<points.length;i++)distance.push(distance[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]))
  const total=distance.at(-1)||1
  // Continuous position at constant distance speed. Fade only at source and
  // destination; avoid bright teleportation at the repeated-cycle boundary.
  return points.flatMap((p,i)=>{
    const offset=distance[i]/total
    if(i===0)return [{transform:pointTransform(p),offset:0,opacity:0},{transform:pointTransform([p[0]+(points[1][0]-p[0])*.08,p[1]+(points[1][1]-p[1])*.08]),offset:distance[1]/total*.08,opacity:1}]
    if(i===points.length-1)return [{transform:pointTransform([p[0]+(points[i-1][0]-p[0])*.08,p[1]+(points[i-1][1]-p[1])*.08]),offset:1-(total-distance[i-1])/total*.08,opacity:1},{transform:pointTransform(p),offset:1,opacity:0}]
    return [{transform:pointTransform(p),offset,opacity:1}]
  })
}
type Props={variant:PortalVariant; level:number; paused:boolean; reducedMotion:boolean; speed:number; intensity:number}
/** Lightweight HTML sprite transforms; no per-frame JS, SVG dash-offset
 * repaint, canvas redraw, external assets or updates to the portal parent.
 * The only clock adjustment is on each 10% charge band. */
export const PortalEnergyFlow=memo(function PortalEnergyFlow({variant,level,paused,reducedMotion,speed,intensity}:Props){
  const root=useRef<HTMLDivElement>(null)
  const animations=useRef<{animation:Animation;orbit:boolean}[]>([])
  const current=useRef({level,paused,reducedMotion,speed})
  current.current={level,paused,reducedMotion,speed}
  const apply=()=>{
    const el=root.current
    if(!el)return
    const c=current.current,p=clamp(c.level,0,10)/10
    const inactive=el.parentElement?.dataset.inactive==='true'
    for(const {animation,orbit} of animations.current){
      const rate=(orbit?.55+1.75*p:.65+1.5*p)*clamp(c.speed,.25,3)
      if(Math.abs(animation.playbackRate-rate)>.001)animation.updatePlaybackRate(rate)
      if(inactive||c.paused||c.reducedMotion||(orbit&&p<.2))animation.pause()
      else if(animation.playState==='paused'||animation.playState==='idle')animation.play()
    }
    el.dataset.energyActive=String(!inactive&&!c.paused&&!c.reducedMotion)
  }
  useLayoutEffect(()=>{
    const el=root.current
    if(!el||reducedMotion||typeof el.animate!=='function')return
    const g=PORTAL_GEOMETRY[variant],t=g.transform
    let lastWidth=0,lastHeight=0
    const build=()=>{
      const w=el.clientWidth,h=el.clientHeight
      if(!w||!h||(lastWidth===w&&lastHeight===h))return
      lastWidth=w;lastHeight=h
      animations.current.forEach(x=>x.animation.cancel())
      animations.current=[]
      const project=([x,y]:EnergyPoint):EnergyPoint=>[(x*t.scale_x+t.translate_x)/g.width*w,(y*t.scale_y+t.translate_y)/g.height*h]
      ENERGY_ROUTES.forEach((route,i)=>{
        const node=el.querySelector<HTMLElement>('[data-energy-route="'+route.id+'"]')
        if(!node)return
        const points=visibleRoute(route.points.map(project),w,h).filter((p,j,a)=>j===0||Math.hypot(p[0]-a[j-1][0],p[1]-a[j-1][1])>.01)
        if(points.length<2)return
        const animation=node.animate(routeFrames(points),{duration:1350,iterations:Infinity,delay:i%4*80,fill:'both',easing:'linear'})
        animations.current.push({animation,orbit:false})
      })
      for(let i=0;i<ORBS;i++){
        const node=el.querySelector<HTMLElement>('[data-energy-orbit="'+i+'"]')
        if(!node)continue
        const frames=Array.from({length:49},(_,j)=>{
          const a=2*Math.PI*(j/48+i/ORBS)-Math.PI/2
          return {offset:j/48,transform:pointTransform(project([ENERGY_ORBIT_CENTER[0]+ENERGY_ORBIT_RADIUS*Math.cos(a),ENERGY_ORBIT_CENTER[1]+ENERGY_ORBIT_RADIUS*Math.sin(a)]))}
        })
        const animation=node.animate(frames,{duration:1100,iterations:Infinity,fill:'both',easing:'linear'})
        animations.current.push({animation,orbit:true})
      }
      apply()
    }
    build()
    const resize=new ResizeObserver(build);resize.observe(el)
    // The existing WAAPI door controller sets inactive at the exact end of
    // the original fade, including when opening has been paused/resumed.
    const inactive=new MutationObserver(apply)
    if(el.parentElement)inactive.observe(el.parentElement,{attributes:true,attributeFilter:['data-inactive']})
    return ()=>{resize.disconnect();inactive.disconnect();animations.current.forEach(x=>x.animation.cancel());animations.current=[]}
  },[variant,reducedMotion])
  useLayoutEffect(apply,[level,paused,reducedMotion,speed])
  const g=PORTAL_GEOMETRY[variant],p=clamp(level,0,10)/10
  const power=clamp(intensity,0,1)
  const style={'--pe-incoming':(.34+.66*p)*power,'--pe-orbit':Math.max(0,(p-.15)/.85)*power,
    '--pe-core':Math.max(0,(p-.2)/.8)*power,'--pe-spark':clamp(3+3*p,3,6)+'px',
    '--pe-core-x':g.coreCenter[0]/g.width*100+'%','--pe-core-y':g.coreCenter[1]/g.height*100+'%',
    '--pe-core-w':190*g.transform.scale_x/g.width*100+'%','--pe-core-h':190*g.transform.scale_y/g.height*100+'%',
  } as CSSProperties
  return <div ref={root} className="portal-energy-flow" data-testid="portal-energy-flow"
    data-energy-level={level} data-energy-reduced={String(reducedMotion)} style={style} aria-hidden="true">
    <div className="pe-core-glow"/>
    {ENERGY_ROUTES.map(r=><span key={r.id} className="pe-sprite pe-incoming" data-energy-route={r.id}><i/></span>)}
    {Array.from({length:ORBS},(_,i)=><span key={i} className="pe-sprite pe-orbit" data-energy-orbit={i}><i/></span>)}
  </div>
})
