import {spawn} from 'node:child_process'
import {mkdir,writeFile} from 'node:fs/promises'
import {chromium} from 'playwright'
import assert from 'node:assert/strict'
const BASE='/LCR-SolutionsArchitecture-IA-Quantum/'
const baseline=process.env.LCR_BEFORE
const candidate=process.env.LCR_AFTER
if(!baseline||!candidate)throw Error('Set two isolated production-build worktrees')
const modes=[{id:'before',port:5211,cwd:baseline},{id:'after',port:5212,cwd:candidate}]
const servers=modes.map(s=>({...s,proc:spawn('npm',['run','preview','--','--host','127.0.0.1','--port',String(s.port),'--strictPort'],{cwd:s.cwd,stdio:'ignore',detached:true})}))
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
async function waitServer(port){for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:'+port+BASE)).ok)return}catch{}await sleep(250)}throw Error('Preview unavailable '+port)}
const scenarios=[{id:'desktop',viewport:{width:1440,height:900},slow:false},{id:'mobile',viewport:{width:390,height:844},slow:false},{id:'mobile-constrained',viewport:{width:390,height:844},slow:true}]
const result={baseline:'67b4ad471c1ced8790286f6f87d2647bcd9163e0',notes:['Chromium headless Linux, one paired cold/warm sample per condition; not a physical-device GPU or FPS guarantee.','Identical lightweight render-function counters inserted in isolated benchmark worktrees only; calls include discarded renders, not React commits.','CDP TaskDuration is main-thread task time proxy for CPU; frame intervals are requestAnimationFrame observations, not compositor presentation timestamps. Trace timings sum main-thread Paint/Layout/UpdateLayoutTree events during opening; trace collection itself has overhead.','Mobile constrained: 4x CPU, 100ms latency, 1.5Mbps down, 750kbps up.'],rows:[]}
let browser
try{
 await Promise.all(servers.map(s=>waitServer(s.port)))
 browser=await chromium.launch({headless:true,args:['--no-sandbox']})
 for(const scenario of scenarios)for(const mode of modes){
  const ctx=await browser.newContext({viewport:scenario.viewport,colorScheme:'dark',reducedMotion:'no-preference'})
  await ctx.addInitScript(()=>{
   window.__portalRenderCounts={}
   const m=window.__hotfix={frames:[],longTasks:[],firstCount:null,lastCount:null,countsAtOpening:null}
   try{new PerformanceObserver(list=>{for(const e of list.getEntries())m.longTasks.push({start:e.startTime,duration:e.duration})}).observe({type:'longtask',buffered:true})}catch{}
   let last=0
   const frame=now=>{
    const node=document.querySelector('[data-testid="portal-v2-counter"]')
    if(node&&m.firstCount===null)m.firstCount=now
    if(node?.getAttribute('aria-valuenow')==='100'&&m.lastCount===null)m.lastCount=now
    const opening=performance.getEntriesByName('portal-opening').at(-1)
    if(opening&&!m.countsAtOpening)m.countsAtOpening={...window.__portalRenderCounts}
    if(last)m.frames.push({time:now,delta:now-last})
    last=now
    if(!performance.getEntriesByName('portal-opened').length&&!performance.getEntriesByName('portal-fallback').length&&now<60000)requestAnimationFrame(frame)
   }
   requestAnimationFrame(frame)
  })
  const page=await ctx.newPage(),cdp=await ctx.newCDPSession(page)
  await cdp.send('Performance.enable')
  if(scenario.slow){await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:100,downloadThroughput:187500,uploadThroughput:93750})}
  for(const cache of ['cold','warm']){
   const trace=[]
   const collect=e=>trace.push(...e.value)
   cdp.on('Tracing.dataCollected',collect)
   await cdp.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing',transferMode:'ReportEvents'})
   const start=await cdp.send('Performance.getMetrics')
   if(cache==='warm')await page.reload({waitUntil:'domcontentloaded',timeout:60000})
   else await page.goto('http://127.0.0.1:'+mode.port+BASE+'#/?portal=replay',{waitUntil:'domcontentloaded',timeout:60000})
   await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({timeout:45000})
   const data=await page.evaluate(()=>{
    const m=window.__hotfix,last=name=>performance.getEntriesByName(name).at(-1)?.startTime??null
    const opening=last('portal-opening'),opened=last('portal-opened'),ready=last('home-critical-resources-ready')
    const summarize=xs=>{const a=xs.map(x=>x.delta).sort((a,b)=>a-b);return {samples:a.length,p95Ms:a.length?a[Math.floor((a.length-1)*.95)]:null,meanFps:a.length?1000*a.length/a.reduce((s,v)=>s+v,0):null,over33ms:a.filter(x=>x>33.4).length}}
    const during=m.frames.filter(x=>x.time>=opening&&x.time<=opened)
    const tasks=m.longTasks.filter(x=>x.start>=opening&&x.start<=opened)
    const rs=performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/home/loading-portal/')&&r.name.endsWith('.webp'))
    return {outcome:document.querySelector('[data-testid="home-boot-app"]').dataset.bootOutcome,readyMs:ready,chargeMs:m.firstCount!==null&&m.lastCount!==null?m.lastCount-m.firstCount:null,totalMs:opened,openingMs:opened-opening,
     frames:summarize(m.frames),openingFrames:summarize(during),longTasks:m.longTasks.length,longTaskMs:m.longTasks.reduce((s,x)=>s+x.duration,0),openingLongTasks:tasks.length,openingLongTaskMs:tasks.reduce((s,x)=>s+x.duration,0),
     renderCalls:{...window.__portalRenderCounts},rendersAtOpening:m.countsAtOpening,portalTransferBytes:rs.reduce((s,r)=>s+r.transferSize,0)}
   })
   const end=await cdp.send('Performance.getMetrics')
   const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve))
   await cdp.send('Tracing.end');await complete;cdp.off('Tracing.dataCollected',collect)
   const a=Object.fromEntries(start.metrics.map(m=>[m.name,m.value])),b=Object.fromEntries(end.metrics.map(m=>[m.name,m.value]))
   const opening=trace.find(e=>e.name==='portal-opening'&&e.cat?.includes('blink.user_timing')),opened=trace.find(e=>e.name==='portal-opened'&&e.cat?.includes('blink.user_timing'))
   const paint={}
   if(opening&&opened)for(const name of ['Paint','Layout','UpdateLayoutTree']){
    const events=trace.filter(e=>e.name===name&&e.ph==='X'&&e.pid===opening.pid&&e.tid===opening.tid&&e.ts>=opening.ts&&e.ts<=opened.ts)
    paint[name]={count:events.length,ms:events.reduce((s,e)=>s+(e.dur??0),0)/1000}
   }
   const row={scenario:scenario.id,mode:mode.id,cache,...data,taskDurationMs:Math.max(0,(b.TaskDuration-a.TaskDuration)*1000),scriptDurationMs:Math.max(0,(b.ScriptDuration-a.ScriptDuration)*1000),openingTrace:opening&&opened?paint:null}
   result.rows.push(row);console.log('HOTFIX',JSON.stringify(row))
   assert.equal(data.outcome,'mechanical','Benchmark must exercise actual mechanical opening')
   assert(data.openingMs>=(mode.id==='after'&&scenario.id!=='desktop'?3500:2900),'Preserve desktop travel and slower mobile profile')
   if(mode.id==='after'){
    assert(data.renderCalls.counter>=101,'Retain continuous integer counter')
    assert(data.renderCalls.scene<35&&data.renderCalls.lights<15&&data.renderCalls.leaves<15&&data.renderCalls.background<15,'Counter must not re-render scene or static layers')
   }
  }
  await ctx.close()
 }
}finally{
 await browser?.close()
 for(const s of servers){try{process.kill(-s.proc.pid,'SIGTERM')}catch{s.proc.kill('SIGTERM')}}
 await mkdir('test-results',{recursive:true});await writeFile('test-results/portal-performance-hotfix.json',JSON.stringify(result,null,2))
}
