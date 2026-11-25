import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir,writeFile } from 'node:fs/promises'
import { chromium } from './Browser.mjs'
const base='/LCR-SolutionsArchitecture-IA-Quantum/'
const before=process.env.LCR_BEFORE
assert(before)
const targets=[{name:'base',cwd:before,port:5191},{name:'candidate',cwd:process.cwd(),port:5192}]
const servers=targets.map(t=>spawn('npm',['run','preview','--','--host','127.0.0.1','--port',String(t.port),'--strictPort'],{cwd:t.cwd,stdio:'ignore',detached:true}))
let browser
const reports=[]
try{
  for(const t of targets)for(let i=0;i<100;i++){
    try{if((await fetch('http://127.0.0.1:'+t.port+base)).ok)break}catch{}
    if(i===99)throw Error('Preview unavailable '+t.name)
    await new Promise(r=>setTimeout(r,250))
  }
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  await mkdir('test-results/isolation/baseline',{recursive:true})
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    for(const slug of ['animefinder','ce235-real-time-systems']){
      const rows=[]
      for(const t of targets){
        const page=await browser.newPage({viewport,reducedMotion:'reduce'})
        await page.goto('http://127.0.0.1:'+t.port+base+'#/projects/'+slug)
        await page.locator('.case-story-cover').waitFor({timeout:30000})
        await page.locator('.case-story-cover').scrollIntoViewIfNeeded()
        await page.waitForFunction(()=>{const img=document.querySelector('.case-story-cover .progressive-image-main');return img?.complete&&img?.naturalWidth>0},null,{timeout:15000})
        const data=await page.evaluate(()=>({heading:document.querySelector('h1')?.textContent,cover:document.querySelector('.case-story-cover img')?.getAttribute('src'),docWidth:document.documentElement.scrollWidth,viewport:innerWidth,text:document.querySelector('main')?.innerText}))
        assert(data.heading&&data.cover)
        assert(data.docWidth<=data.viewport+2)
        await page.screenshot({path:'test-results/isolation/baseline/'+t.name+'-'+slug+'-'+viewport.width+'.png',animations:'disabled'})
        rows.push(data)
        await page.close()
      }
      assert.equal(rows[0].heading,rows[1].heading)
      assert.equal(rows[0].cover,rows[1].cover)
      assert.equal(rows[0].text,rows[1].text)
      reports.push({slug,viewport,contentEqual:true,coverEqual:true,overflow:false})
    }
  }
  await writeFile('test-results/isolation/baseline/comparison.json',JSON.stringify(reports,null,2))
  console.log('PASS immutable baseline/candidate comparisons: '+reports.length)
}finally{
  if(browser)await browser.close()
  for(const server of servers)try{process.kill(-server.pid,'SIGTERM')}catch{}
}
