/** First-view readiness is measured, not a byte-count or a demo timer. */
export type HomeBootTask = 'home-render' | 'hero-media' | 'canvas' | 'fonts' | 'door-art'
export type BootOutcome = 'ok' | 'fallback' | 'failed' | 'cancelled'
export type BootTaskState = 'pending' | 'running' | 'completed' | 'fallback' | 'failed'
export type BootTaskRecord = { state: BootTaskState; critical: boolean; startedAt: number; durationMs?: number }
export const BOOT_WEIGHTS: Record<HomeBootTask, number> = {
  'home-render': 40, 'hero-media': 15, canvas: 15, fonts: 10, 'door-art': 20,
}
export const BOOT_TASKS = Object.keys(BOOT_WEIGHTS) as HomeBootTask[]
export function createBootTasks(): Record<HomeBootTask, BootTaskRecord> {
  return Object.fromEntries(BOOT_TASKS.map(task => [task, {
    state: 'pending', critical: task === 'home-render' || task === 'door-art', startedAt: performance.now(),
  }])) as Record<HomeBootTask, BootTaskRecord>
}
export const isUsableTask = (task: BootTaskRecord) => task.state === 'completed' || task.state === 'fallback'
export function confirmedBootProgress(tasks: Record<HomeBootTask,BootTaskRecord>): number {
  return BOOT_TASKS.reduce((sum,task)=>sum+(isUsableTask(tasks[task])?BOOT_WEIGHTS[task]:0),0)
}
export function markHomeBoot(name: string) {
  try { performance.mark(name) } catch { /* performance API unavailable */ }
}
export function measureHomeBoot(name: string, start: string, end: string) {
  try { performance.measure(name, start, end) } catch { /* no measurement */ }
}
export function isHomeDomReady(): boolean {
  return Boolean(document.querySelector('header.site-header') &&
    document.querySelector('main.portfolio-home .hero-v3 h1') &&
    document.querySelector('[data-testid="interactive-ai-visual"]') &&
    document.querySelector('.hero-v3-actions .hero-actions .button'))
}

/** Observe real DOM state and clean up on timeout, route change or cancellation. */
function observeReady(predicate: ()=>boolean, signal:AbortSignal, ms:number): Promise<BootOutcome> {
  if (signal.aborted) return Promise.resolve('cancelled')
  if (predicate()) return Promise.resolve('ok')
  return new Promise(resolve=>{
    let done=false
    const finish=(result:BootOutcome)=>{
      if(done)return
      done=true; observer.disconnect();window.clearTimeout(timer)
      signal.removeEventListener('abort',abort);resolve(result)
    }
    const abort=()=>finish('cancelled')
    const check=()=>{if(predicate())finish('ok')}
    const observer=new MutationObserver(check)
    const timer=window.setTimeout(()=>finish('failed'),ms)
    observer.observe(document.getElementById('root')??document.body,{childList:true,subtree:true,attributes:true})
    signal.addEventListener('abort',abort,{once:true})
    check()
  })
}
function bounded(promise:Promise<boolean>,signal:AbortSignal,ms:number):Promise<BootOutcome>{
  if(signal.aborted)return Promise.resolve('cancelled')
  return new Promise(resolve=>{
    let done=false
    const finish=(result:BootOutcome)=>{
      if(done)return
      done=true;window.clearTimeout(timer);signal.removeEventListener('abort',abort);resolve(result)
    }
    const abort=()=>finish('cancelled')
    const timer=window.setTimeout(()=>finish('failed'),ms)
    signal.addEventListener('abort',abort,{once:true})
    void promise.then(ok=>finish(ok?'ok':'failed'),()=>finish('failed'))
  })
}
export function waitForHomeDom(signal:AbortSignal):Promise<BootOutcome>{
  return observeReady(isHomeDomReady,signal,12000)
}
export async function waitForHeroMedia(signal:AbortSignal):Promise<BootOutcome>{
  const image=document.querySelector<HTMLImageElement>('[data-testid="hero-v6-blue-code"]')
  const result=image?await bounded(image.decode().then(()=>image.naturalWidth>0),signal,3200):'failed'
  // Hero's CSS base and graph remain usable if the decorative SVG fails.
  return result==='failed'&&isHomeDomReady()?'fallback':result
}
export async function waitForCanvas(signal:AbortSignal):Promise<BootOutcome>{
  const result=await observeReady(()=>Boolean(document.querySelector('.hero-v13-particle-wave canvas[data-ready="true"]') ||
    document.querySelector('.hero-v13-particle-wave [data-testid="wave-static-fallback"]')),signal,3200)
  if(result==='cancelled')return result
  if(result==='ok'&&document.querySelector('.hero-v13-particle-wave canvas[data-ready="true"]'))return 'ok'
  return isHomeDomReady()?'fallback':'failed'
}
export async function waitForFonts(signal:AbortSignal):Promise<BootOutcome>{
  if(!('fonts' in document))return 'fallback'
  const result=await bounded(document.fonts.ready.then(()=>true),signal,2200)
  // System font fallback is already available; it is not a successful webfont decode.
  return result==='failed'?'fallback':result
}
