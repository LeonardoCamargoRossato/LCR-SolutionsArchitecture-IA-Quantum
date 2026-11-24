import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from './isolation/Browser.mjs'

const BASE='http://127.0.0.1:5195/LCR-SolutionsArchitecture-IA-Quantum/'
const geometry=JSON.parse(await readFile('src/components/loading-portal/v2/portal-door-geometry.json','utf8'))
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5195','--strictPort'],{stdio:'ignore',detached:true})
const report={scenarios:[],errors:[]}
let browser
const pause=ms=>new Promise(r=>setTimeout(r,ms))
const near=(a,b,tol,message)=>assert(Math.abs(a-b)<=tol,message+': '+a+' vs '+b)

async function readyServer(){
  for(let i=0;i<100;i++){try{if((await fetch(BASE)).ok)return}catch{}await pause(250)}
  throw Error('Vite failed to start')
}
async function openLab(context){
  const page=await context.newPage()
  const errors=[],broken=[],remote=[]
  page.on('pageerror',e=>errors.push(String(e)))
  page.on('request',r=>{if(/supabase[.]co/.test(r.url()))remote.push(r.url())})
  page.on('response',r=>{if(/loading-portal\//.test(r.url())&&r.status()>=400)broken.push(r.url())})
  await page.goto(BASE+'#/test-component-lab',{waitUntil:'domcontentloaded'})
  await page.getByTestId('lab-component-switch').getByRole('button',{name:'Loading Portal',exact:true}).click()
  await page.getByTestId('portal-v2-preview').click()
  await page.getByTestId('loading-portal-v2-lab').waitFor()
  return {page,errors,broken,remote}
}
async function seek(page,value){
  await page.getByTestId('portal-v2-progress').evaluate((input,n)=>{
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,String(n))
    input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))
  },value)
}
async function scenario(variant, reduced){
  const mobile=geometry.variants[variant].width<geometry.variants[variant].height
  const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1600,height:900},reducedMotion:reduced?'reduce':'no-preference'})
  const {page,errors,broken,remote}=await openLab(ctx)
  await page.getByTestId('portal-v2-variant').selectOption(variant)
  const portal=page.getByTestId('loading-portal-v2')
  await page.locator('[data-testid="loading-portal-v2"][data-assets="ready"][data-variant="'+variant+'"]').waitFor({timeout:18000})
  await page.waitForFunction(()=>[...document.querySelectorAll('.portal-v2-plane img')].every(i=>i.complete&&i.naturalWidth>0))
  assert.equal(await portal.locator('.pcl-strand').count(),19)
  assert.equal(await portal.locator('.pdo-reference').count(),1)
  assert.equal(await portal.locator('.pdo-leaf').count(),2)
  assert.equal(await portal.locator('.pdo-left [data-testid="portal-v2-core"]').count(),1)
  const before=await portal.locator('.pdo-reference').getAttribute('src')
  const info=await page.evaluate(()=>{
    const plane=document.querySelector('.portal-v2-plane')
    const r=plane.getBoundingClientRect(), bg=plane.querySelector('.pdo-reference').getBoundingClientRect()
    const c=plane.querySelector('.portal-v2-counter').getBoundingClientRect()
    return {w:r.width,h:r.height,x:(c.left+c.width/2-r.left)/r.width,y:(c.top+c.height/2-r.top)/r.height,
      bw:bg.width,bh:bg.height,overflow:document.documentElement.scrollWidth-innerWidth,
      src:plane.querySelector('.pdo-reference').getAttribute('src')}
  })
  const g=geometry.variants[variant]
  near(info.w/info.h,g.width/g.height,.005,'uniform cover')
  near(info.bw,info.w,1,'background width')
  near(info.bh,info.h,1,'background height')
  near(info.x,g.coreCenter[0]/g.width,.005,'counter visual center x')
  near(info.y,g.coreCenter[1]/g.height,.005,'counter visual center y')
  assert(info.overflow<=2,'horizontal overflow')
  assert(info.src.endsWith(g.reference))
  await seek(page,100)
  await page.getByTestId('portal-v2-counter').getAttribute('aria-valuenow')
  await page.waitForFunction(()=>document.querySelector('[data-testid="portal-v2-counter"]')?.getAttribute('aria-valuenow')==='99')
  await page.waitForTimeout(250)
  assert.equal(await portal.getAttribute('data-phase'),'loading','100 alone must not open')
  assert.equal(await portal.locator('.pdo-reference').getAttribute('src'),before,'static background stays identical')
  await mkdir('test-results',{recursive:true})
  await page.screenshot({path:'test-results/portal-v2-closed-'+variant+'.png'})
  await page.getByTestId('portal-v2-ready').check()
  if(!reduced){
    await page.locator('[data-testid="loading-portal-v2"][data-phase="opening"]').waitFor({timeout:7000})
    await page.waitForTimeout(900)
    const movement=await page.evaluate(()=>{
      const left=document.querySelector('.pdo-left'),right=document.querySelector('.pdo-right')
      return {left:getComputedStyle(left).transform,right:getComputedStyle(right).transform,
        attached:!!left.querySelector('[data-testid="portal-v2-core"]')}
    })
    assert(movement.left!=='none'&&movement.right!=='none'&&movement.attached)
    await page.screenshot({path:'test-results/portal-v2-opening-'+variant+'.png'})
  }
  await portal.waitFor({state:'detached',timeout:10000})
  await page.getByTestId('portal-v2-underlay').getByRole('button').click()
  assert.deepEqual(errors,[]);assert.deepEqual(broken,[]);assert.deepEqual(remote,[])
  report.scenarios.push({variant,reduced,info})
  console.log('PASS V2 Lab',variant,reduced?'reduced':'motion')
  await ctx.close()
}
async function blockedAndFailure(){
  const ctx=await browser.newContext({viewport:{width:1440,height:900}})
  const {page}=await openLab(ctx)
  await page.locator('[data-testid="loading-portal-v2"][data-assets="ready"]').waitFor()
  await page.getByLabel('Tarefa bloqueada').check()
  await page.getByTestId('portal-v2-play-pause').click()
  await page.waitForTimeout(400)
  assert.equal(await page.getByTestId('portal-v2-progress').inputValue(),'0')
  await page.getByLabel('Tarefa bloqueada').uncheck()
  await page.getByRole('button',{name:'Simular falha',exact:true}).click()
  assert.equal(await page.getByTestId('portal-v2-ready').isDisabled(),true)
  await page.getByTestId('portal-v2-reset').click()
  assert.equal(await page.getByTestId('portal-v2-progress').inputValue(),'0')
  await ctx.close()
}
try{
  await readyServer()
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  for(const v of Object.keys(geometry.variants))await scenario(v,v==='9x19_5')
  await blockedAndFailure()
  console.log('PASS V2 Lab geometry, readiness, opening and failure simulation')
}catch(e){report.errors.push(String(e?.stack||e));console.error(e);process.exitCode=1}
finally{
  await browser?.close()
  try{process.kill(-server.pid,'SIGTERM')}catch{server.kill('SIGTERM')}
  await mkdir('test-results',{recursive:true})
  await writeFile('test-results/portal-v2-lab-results.json',JSON.stringify(report,null,2))
}
