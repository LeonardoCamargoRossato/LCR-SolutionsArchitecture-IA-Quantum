import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE='http://127.0.0.1:5193/LCR-SolutionsArchitecture-IA-Quantum/'
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5193','--strictPort'],{env:process.env,stdio:'ignore',detached:true})
const report={checks:[],errors:[]}
let browser
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
async function ready(){
 for(let i=0;i<100;i++){
  try{if((await fetch(BASE)).ok)return}catch{}
  await sleep(300)
 }
 throw Error('Vite did not start')
}
const rect=locator=>locator.evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}})
async function check(width,height,locale){
 const ctx=await browser.newContext({viewport:{width,height},locale:'pt-BR',colorScheme:'light',reducedMotion:'reduce'})
 const page=await ctx.newPage()
 const errors=[]
 page.on('pageerror',e=>errors.push(String(e)))
 if(locale==='pt-BR'){
  await page.addInitScript(()=>localStorage.setItem('portfolio-locale','pt-BR'))
 }
 await page.goto(BASE + '#/?portal=skip',{waitUntil:'domcontentloaded'})
 await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor({timeout:20000})
 await page.evaluate(()=>document.fonts.ready)
 const pt=locale==='pt-BR'
 assert.equal(await page.locator('html').getAttribute('lang'),locale)
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark')
 assert.equal(await page.locator('.hero-type-title').getAttribute('aria-label'),pt?'Engenheiro de IA e Desenvolvimento de Software':'AI Engineering & Software Development')
 assert.equal(await page.locator('.hero-identity-subtitle').innerText(),pt?'Construindo Soluções Inteligentes.':'Building Intelligent Solutions.')
 const desc=await page.locator('.hero-description').innerText()
 assert(desc.includes(pt?'RAG híbrido':'hybrid RAG'),width+' '+locale+' summary must include hybrid RAG')
 const tags=page.locator('.hero-specializations > .hero-skill-tag')
 assert.equal(await tags.count(),4)
 const pills=await tags.evaluateAll(elements=>elements.map(x=>{
   const r=x.getBoundingClientRect()
   return {top:Math.round(r.top),left:r.left,right:r.right,full:x.getAttribute('aria-label'),short:x.querySelector('.hero-tag-short')?.textContent.trim(),fullHidden:getComputedStyle(x.querySelector('.hero-tag-full')).display==='none'}
 }))
 assert(pills.every(x=>x.top===pills[0].top),width+' '+locale+' all four tags should be one line '+JSON.stringify(pills))
 assert(pills[0].left>=-1&&pills[3].right<=width+1,width+' '+locale+' tags must not overflow screen')
 assert(pills.every(x=>!!x.full),'All technical labels remain available to assistive technology')
 const stage=page.getByTestId('interactive-ai-visual')
 const stageRect=await rect(stage)
 const tabs=page.getByTestId('hero-v5-stage-selector')
 const tabRect=await rect(tabs)
 const motion=page.locator('.hero-graph-motion-control')
 const playRect=await rect(motion)
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)
 assert(overflow<=2,width+' '+locale+' horizontal overflow '+overflow)
 if(width<=900){
  assert(pills.every(x=>x.short&&x.short.length>0),width+' '+locale+' shortened mobile chips should remain readable')
  assert(pills.every(x=>x.fullHidden),width+' '+locale+' full desktop chip text should not appear on phone')
  assert(tabRect.height<=49,width+' stage selector must be compact: '+tabRect.height)
  assert(playRect.right+4<=tabRect.left,width+' play control must be LEFT of tabs: '+JSON.stringify({playRect,tabRect}))
  assert(Math.abs(playRect.top-tabRect.top)<10,width+' play must align with stage selector')
  assert(tabRect.top-stageRect.top<=8,width+' selector must be near stage top')
  assert(stageRect.top-pills[0].top<115,width+' scene should rise after compact chips')
  await tabs.locator('button').nth(0).click()
  const neurons=await page.locator('.hero-v4-mobile .hero-v4-neuron-core').evaluateAll(xs=>xs.map(x=>x.getBoundingClientRect()))
  const graphCenter=(Math.min(...neurons.map(r=>r.top))+Math.max(...neurons.map(r=>r.bottom)))/2
  assert(graphCenter>stageRect.top+stageRect.height*.25&&graphCenter<stageRect.top+stageRect.height*.8,width+' network must remain vertically centered: '+JSON.stringify({graphCenter,stageRect}))
  await tabs.locator('button').nth(1).click()
  const code=page.getByTestId('hero-v4-code-scene')
  const codeRect=await rect(code)
  const codeTransform=await code.evaluate(el=>getComputedStyle(el).transform)
  assert(codeRect.top>=tabRect.bottom+5,width+' code must be below compact selector')
  assert(codeRect.width<stageRect.width*.93,width+' code card must be smaller than stage')
  assert(codeTransform.startsWith('matrix3d('),width+' code must retain perspective 3D')
  assert((await code.innerText()).includes(pt?'CÓDIGO GERADO':'GENERATED CODE'),width+' '+locale+' code caption must translate')
  await tabs.locator('button').nth(2).click()
  const assistant=page.getByTestId('hero-v4-hamnet-scene')
  const assistantRect=await rect(assistant)
  const assistantTransform=await assistant.evaluate(el=>getComputedStyle(el).transform)
  assert(assistantRect.top>=tabRect.bottom+5,width+' assistant must remain below tabs')
  assert(assistantTransform.startsWith('matrix3d('),width+' Hamlet card must retain 3D perspective')
  const greeting=await page.getByTestId('hero-v5-user-message').innerText()
  assert.equal(greeting,pt?'Olá, Hamlet AI.':'Hello, Hamlet AI.')
  assert((await page.getByTestId('hero-v5-assistant-answer').innerText()).includes(pt?'Olá!':'Hello!'))
 }else{
  const front=page.locator('.hero-v4-desktop .hero-v4-neural-depth').first()
  await tabs.locator('button').nth(0).click()
  const transform=await front.evaluate(el=>getComputedStyle(el).transform)
  const frameSize=await front.boundingBox()
  assert(transform!=='none'&&transform!=='matrix(1, 0, 0, 1, 0, 0)',width+' neural network must be visually scaled down')
  assert(frameSize?.width>0,'Desktop neural view must remain visible')
 }
 await page.screenshot({path:`test-results/hero-v11-${width}-${locale}.png`,fullPage:false})
 assert.deepEqual(errors,[],width+' '+locale+' page errors')
 report.checks.push({width,locale,pills,stage:stageRect,selector:tabRect,play:playRect})
 console.log('PASS V11 layout',width,locale,'row:',new Set(pills.map(x=>x.top)).size)
 await ctx.close()
}
async function languageAudit(locale){
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
 const page=await ctx.newPage()
 if(locale==='pt-BR')await page.addInitScript(()=>localStorage.setItem('portfolio-locale','pt-BR'))
 await page.goto(BASE + '#/?portal=skip',{waitUntil:'domcontentloaded'})
 await page.locator('.hero-type-title[data-typing-complete="true"]').waitFor()
 const pt=locale==='pt-BR'
 const headline=await page.locator('.about-headline').first().innerText()
 assert(headline.includes(pt?'Engenheiro de IA':'AI Engineer'),locale+' About role is not localized '+headline)
 assert(!(await page.locator('.hero-description').innerText()).includes(pt?'I design and build':'Projeto e desenvolvo'),locale+' mixed Hero language')
 const seo=await page.title()
 assert(seo.includes(pt?'Engenheiro de IA':'AI Engineering'),locale+' SEO title language mismatch')
 const footer=await page.locator('.footer-tagline').innerText()
 assert(footer.includes(pt?'Engenharia de IA':'AI Engineering'),locale+' footer language mismatch')
 const stage=page.getByTestId('hero-v5-stage-selector')
 await stage.locator('button').nth(1).click()
 assert((await page.getByTestId('hero-v4-code-scene').innerText()).includes(pt?'VISUALIZAÇÃO CONCEITUAL':'CONCEPT VISUALIZATION'))
 await page.goto(BASE+'#/workflow',{waitUntil:'domcontentloaded'})
 // Hash route renders asynchronously through React.lazy; wait for the new view
 // rather than accidentally asserting against the previous Home headline.
 await page.locator('.workflow-page h1').waitFor({timeout:16000})
 assert((await page.locator('.workflow-page h1').innerText()).includes(pt?'Como eu estruturo':'How I structure'),'Workflow not localized')
 await page.goto(BASE+'#/this-path-does-not-exist',{waitUntil:'domcontentloaded'})
 assert.equal(await page.locator('.not-found h1').innerText(),pt?'Página não encontrada.':'Page not found.')
 await page.goto(BASE+'#/projects/foton-hub',{waitUntil:'domcontentloaded'})
 await page.locator('.case-story-hero h1').waitFor({timeout:16000})
 assert((await page.locator('.case-story-status strong').innerText()).includes(pt?'Plataforma Privada':'Private Platform'),'Case status not localized')
 report.checks.push({languageAudit:locale,about:headline,seo,footer})
 console.log('PASS V11 bilingual public surfaces',locale)
 await ctx.close()
}
try{
 await mkdir('test-results',{recursive:true})
 await ready()
 browser=await chromium.launch({headless:true,args:['--no-sandbox']})
 for(const [w,h] of [[320,780],[360,800],[390,844],[430,932],[600,940],[768,1024],[900,900],[1024,768],[1440,900]]){
  await check(w,h,'en-US')
 }
 for(const [w,h] of [[320,780],[390,844],[600,940],[1440,900]]){
  await check(w,h,'pt-BR')
 }
 await languageAudit('en-US')
 await languageAudit('pt-BR')
 console.log('PASS LCR Hero V11: compact single-row bilingual tags, 3D scenes, persistent locales, public route audit')
}catch(e){
 report.errors.push(String(e?.stack||e))
 console.error('FAIL Hero V11',e)
 process.exitCode=1
}finally{
 if(browser)await browser.close()
 try{process.kill(-server.pid,'SIGTERM')}catch{server.kill('SIGTERM')}
 await writeFile('test-results/hero-v11-results.json',JSON.stringify(report,null,2))
}
