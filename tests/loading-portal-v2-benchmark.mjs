import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from './isolation/Browser.mjs'
import assert from 'node:assert/strict'
const BASE='/LCR-SolutionsArchitecture-IA-Quantum/'
const baseline=process.env.LCR_V1_BASELINE
if(!baseline)throw Error('Set LCR_V1_BASELINE to the audited V1 worktree')
const servers=[{port:5201,cwd:process.cwd()},{port:5202,cwd:baseline}].map(s=>({...s,proc:spawn('npm',['run','preview','--','--host','127.0.0.1','--port',String(s.port),'--strictPort'],{cwd:s.cwd,stdio:'ignore',detached:true})}))
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
async function waitServer(port){for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:'+port+BASE)).ok)return}catch{}await sleep(250)}throw Error('Preview unavailable '+port)}
const scenarios=[{id:'desktop-fast',viewport:{width:1440,height:900},throttle:false},{id:'mobile-fast',viewport:{width:390,height:844},throttle:false},{id:'mobile-constrained',viewport:{width:390,height:844},throttle:true}]
const modes=[{id:'bypass',port:5201,query:'skip'},{id:'v1',port:5202,query:'replay'},{id:'v2',port:5201,query:'replay'}]
const result={baseline:'e092227db021a2a9e1ddadf7d5f76440aa36b67a',conditions:{constrained:'4x CPU slowdown, 100ms latency, 1.5Mbps down, 750kbps up'},notes:['Chromium headless Linux; FCP/LCP include portal when present, not time to actual Home.','Cache warmed in same context with explicit replay. CDP task duration and heap are browser-process proxies, not device CPU or total memory.','No FPS guarantee. Frame interval sampling is observational.'],rows:[]}
let browser
try{
  await Promise.all(servers.map(s=>waitServer(s.port)))
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  for(const scenario of scenarios)for(const mode of modes){
    const ctx=await browser.newContext({viewport:scenario.viewport,colorScheme:'dark',reducedMotion:'no-preference'})
    await ctx.addInitScript(()=>{
      const metrics={lcp:null,cls:0,longTasks:0,longTaskMs:0,frames:[]}
      window.__lcrBench=metrics
      for(const type of ['largest-contentful-paint','layout-shift','longtask'])try{
        new PerformanceObserver(list=>{for(const entry of list.getEntries()){
          if(type==='largest-contentful-paint')metrics.lcp=entry.startTime
          if(type==='layout-shift'&&!entry.hadRecentInput)metrics.cls+=entry.value
          if(type==='longtask'){metrics.longTasks++;metrics.longTaskMs+=entry.duration}
        }}).observe({type,buffered:true})
      }catch{}
      let last=0
      const frame=now=>{if(last&&metrics.frames.length<1200)metrics.frames.push(now-last);last=now
        if(metrics.frames.length<1200)requestAnimationFrame(frame)}
      requestAnimationFrame(frame)
    })
    const page=await ctx.newPage()
    const cdp=await ctx.newCDPSession(page)
    await cdp.send('Performance.enable')
    if(scenario.throttle){
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:4})
      await cdp.send('Network.enable')
      await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:100,downloadThroughput:187500,uploadThroughput:93750})
    }
    for(const cache of ['cold','warm']){
      const initial=await cdp.send('Performance.getMetrics')
      if(cache==='warm')await page.reload({waitUntil:'domcontentloaded',timeout:60000})
      else await page.goto('http://127.0.0.1:'+mode.port+BASE+'#/?portal='+mode.query,{waitUntil:'domcontentloaded',timeout:60000})
      await page.locator('main.portfolio-home .hero-v3').waitFor({timeout:40000})
      if(mode.id!=='bypass')await page.locator('[data-testid="home-boot-app"][data-boot-state="opened"]').waitFor({timeout:40000})
      await page.waitForFunction(()=>document.querySelector('main.portfolio-home')?.getAttribute('data-home-motion')==='running',null,{timeout:15000})
      const data=await page.evaluate(()=>{
        const t=performance.now()
        const marks=performance.getEntriesByType('mark')
        const last=name=>marks.filter(m=>m.name===name).at(-1)?.startTime??null
        const rs=performance.getEntriesByType('resource')
        const portal=rs.filter(r=>r.name.includes('/assets/home/loading-portal/')&&r.name.endsWith('.webp'))
        const m=window.__lcrBench
        const frames=m.frames.slice().sort((a,b)=>a-b)
        return {fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime??null,lcp:m.lcp,cls:m.cls,longTasks:m.longTasks,longTaskMs:m.longTaskMs,
          homeReady:last('home-critical-resources-ready'),homeVisible:last('portal-opened')??last('portal-fallback')??t,
          homeInteractive:last('home-interactive')??last('home-animation-started')??t,
          openingMs:last('portal-opened')!==null&&last('portal-opening')!==null?last('portal-opened')-last('portal-opening'):null,
          totalTransferBytes:rs.reduce((s,r)=>s+r.transferSize,0),portalTransferBytes:portal.reduce((s,r)=>s+r.transferSize,0),
          portalAssets:[...new Set(portal.map(r=>r.name.split('/loading-portal/')[1]))],
          frameP95Ms:frames.length?frames[Math.floor((frames.length-1)*.95)]:null,
          bootOutcome:document.querySelector('[data-testid="home-boot-app"]')?.getAttribute('data-boot-outcome')}
      })
      const ending=await cdp.send('Performance.getMetrics')
      const map=x=>Object.fromEntries(x.metrics.map(m=>[m.name,m.value]))
      const a=map(initial),b=map(ending)
      result.rows.push({scenario:scenario.id,mode:mode.id,cache,...data,taskDurationMs:Math.max(0,(b.TaskDuration-a.TaskDuration)*1000),jsHeapBytes:b.JSHeapUsedSize})
      if(mode.id==='v2'&&data.bootOutcome==='mechanical'){
        const variants=data.portalAssets.filter(x=>x.startsWith('mechanical/')).map(x=>x.split('/')[1])
        assert.equal(new Set(variants).size,1,'one variant per stable viewport')
        assert(!data.portalAssets.some(x=>/^portal-0\d\d\.webp$|^door-open-base|^lock-core/.test(x)),'no V1 frame requests')
      }
      console.log('BENCH',scenario.id,mode.id,cache,JSON.stringify(data))
    }
    await ctx.close()
  }
}finally{
  await browser?.close()
  for(const s of servers){try{process.kill(-s.proc.pid,'SIGTERM')}catch{s.proc.kill('SIGTERM')}}
  await mkdir('test-results',{recursive:true})
  await writeFile('test-results/loading-portal-v2-benchmark.json',JSON.stringify(result,null,2))
}
