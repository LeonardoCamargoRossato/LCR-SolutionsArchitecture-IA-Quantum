import assert from 'node:assert/strict'
import {mkdir,writeFile,readFile} from 'node:fs/promises'
import {spawn} from 'node:child_process'
import {chromium} from './isolation/Browser.mjs'

const BASE='http://127.0.0.1:5188/LCR-SolutionsArchitecture-IA-Quantum/'
const LAB=BASE+'#/test-component-lab'
const srv=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5188','--strictPort'],{stdio:'ignore',detached:true,env:process.env})
let browser
const checks=[]
const errors=[]
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
async function ready(){for(let i=0;i<120;i++){try{if((await fetch(BASE)).ok)return}catch{}await sleep(250)}throw Error('Vite did not start')}
const downloaded=(page,button)=>Promise.all([page.waitForEvent('download'),button.click()]).then(r=>r[0])
const testFile=(buffer,name='lab-screenshot.png')=>({name,mimeType:'image/png',buffer})
async function run(name,viewport,reduced=false){
  const context=await browser.newContext({viewport,acceptDownloads:true,reducedMotion:reduced?'reduce':'no-preference',permissions:['clipboard-read','clipboard-write']})
  const page=await context.newPage()
  page.on('pageerror',e=>errors.push('['+name+'] '+String(e)))
  const remote=[]
  page.on('request',r=>{if(/supabase\.co/.test(r.url()))remote.push(r.url())})
  await page.goto(LAB,{waitUntil:'domcontentloaded'})
  const lab=page.getByTestId('test-component-lab')
  await lab.waitFor()
  const stage=page.getByTestId('lab-preview-stage')
  await stage.waitFor()
  const wave=page.getByTestId('particle-wave-canvas')
  await page.waitForFunction(()=>document.querySelector('[data-testid="particle-wave-canvas"]')?.dataset.ready==='true')
  assert.equal(await page.locator('h1').textContent(),'LCR Test Component Lab')
  assert.equal(remote.length,0)
  assert.equal(await page.locator('header.site-header').count(),0)
  await page.screenshot({path:`test-results/v2-${name}-initial.png`,fullPage:true})

  assert.equal(await page.getByLabel('Canvas Width').inputValue(),'1600')
  assert.equal(await page.getByLabel('Canvas Height').inputValue(),'900')
  const before=await page.locator('[data-layer-id="wave"]').evaluate(e=>e.style.left)
  await page.getByRole('button',{name:'Zoom In'}).click()
  assert.equal(await page.locator('[data-layer-id="wave"]').evaluate(e=>e.style.left)===before,false,'Zoom should affect display scale')
  await page.getByRole('button',{name:'Fit to Screen'}).click()
  await page.getByLabel('Canvas Size').selectOption('1:1')
  assert.equal(await page.getByLabel('Canvas Width').inputValue(),'1000')
  assert.equal(await page.getByLabel('Canvas Height').inputValue(),'1000')
  await page.getByLabel('Canvas Size').selectOption('16:9')
  await page.getByLabel('Ruler Units').selectOption('percent')
  assert.equal(await page.getByLabel('Ruler Units').inputValue(),'percent')
  await page.getByLabel('Ruler Units').selectOption('grid')
  const outside=await page.evaluate(()=>{
    const r=document.querySelector('.lcr-v2-ruler--x').getBoundingClientRect()
    const s=document.querySelector('[data-testid="lab-preview-stage"]').getBoundingClientRect()
    return r.bottom<=s.top+1
  })
  assert(outside,'Horizontal ruler must be outside the canvas')
  await page.getByLabel('Grid',{exact:true}).uncheck()
  assert.equal(await page.locator('.lcr-v2-grid').count(),0)
  await page.getByLabel('Grid',{exact:true}).check()

  const png=await page.screenshot({type:'png'})
  await page.getByRole('button',{name:'Add Background',exact:true}).click()
  await page.getByRole('dialog',{name:'Add Background'}).waitFor()
  const chooser=page.waitForEvent('filechooser')
  await page.getByRole('button',{name:'Browse Files'}).click()
  await (await chooser).setFiles(testFile(png))
  await page.getByText('File Selected', {exact:false}).first().waitFor()
  assert.equal(await page.getByRole('button',{name:'Apply Background'}).isEnabled(),true)
  await page.getByRole('button',{name:'Apply Background'}).click()
  await page.locator('img.lcr-v2-background').waitFor()
  await page.getByLabel('Background Fit').selectOption('cover')
  await page.getByLabel('Background Opacity').fill('0.5')
  assert.equal(await page.getByLabel('Background Opacity').inputValue(),'0.5')
  const stagePng=await stage.screenshot()
  assert(stagePng.byteLength>3000)

  // Wave must enter edit mode only on double click; selection pauses frame.
  await page.locator('[data-layer-id="wave"]').dblclick({position:{x:70,y:60}})
  await page.locator('.lcr-v2-selection-border').waitFor()
  assert.equal(await wave.getAttribute('data-motion'),'paused')
  assert.equal(await page.locator('[data-handle]').count(),9)
  await page.getByLabel('Object x').fill('4')
  await page.getByLabel('Object x').press('Tab')
  assert.equal(await page.getByLabel('Object x').inputValue(),'4')
  await page.getByLabel('Wave Direction').selectOption('reverse')
  assert.equal(await page.getByLabel('Wave Direction').inputValue(),'reverse')
  await page.getByRole('button',{name:'Flip Horizontal'}).click()
  await page.getByRole('button',{name:'Flip Vertical'}).click()
  assert.equal(await page.getByRole('button',{name:'Flip Horizontal'}).getAttribute('aria-pressed'),'true')
  // The property controls may scroll the document (particularly on shorter
  // desktops). Playwright's raw mouse does not scroll or check hit targets.
  const waveLayer=page.locator('[data-layer-id="wave"]')
  await waveLayer.scrollIntoViewIfNeeded()
  const point=await waveLayer.evaluate(el=>{
    const r=el.getBoundingClientRect(),s=el.closest('[data-testid="lab-preview-stage"]').getBoundingClientRect()
    const left=Math.max(r.left,s.left,0),right=Math.min(r.right,s.right,innerWidth)
    const top=Math.max(r.top,s.top,0),bottom=Math.min(r.bottom,s.bottom,innerHeight)
    for(const fx of [.5,.35,.65,.2,.8])for(const fy of [.5,.35,.65,.2,.8]){
      const x=left+(right-left)*fx,y=top+(bottom-top)*fy
      const hit=document.elementFromPoint(x,y)
      if(hit&&(hit===el||el.contains(hit))&&!hit.closest('[data-handle]')&&x+16<innerWidth&&y+12<innerHeight)return {x,y}
    }
    throw Error('No visible interior hit target for selected Wave: '+JSON.stringify({left,right,top,bottom}))
  })
  await page.mouse.move(point.x,point.y)
  await page.mouse.down();await page.mouse.move(point.x+16,point.y+12,{steps:3});await page.mouse.up()
  await page.waitForFunction(()=>Number(document.querySelector('input[aria-label="Object x"]')?.value)>4 ||
    [...document.querySelectorAll('label')].some(label=>label.textContent.trim()==='Object x'&&Number(label.querySelector('input')?.value)>4),null,{timeout:4000}).catch(async error=>{
      const actual=await page.getByLabel('Object x').inputValue()
      if(Number(actual)<=4)throw error
    })
  const x2=Number(await page.getByLabel('Object x').inputValue())
  assert(x2>4,'Move must update virtual X')
  const cornerHandle=page.locator('[data-handle="se"]')
  await cornerHandle.scrollIntoViewIfNeeded()
  const corner=await cornerHandle.boundingBox()
  await page.mouse.move(corner.x+corner.width/2,corner.y+corner.height/2);await page.mouse.down();await page.mouse.move(corner.x+32,corner.y+25);await page.mouse.up()
  assert.equal(await page.locator('[data-handle="se"]').count(),1)
  const rotateHandle=page.locator('[data-handle="rotate"]')
  await rotateHandle.scrollIntoViewIfNeeded()
  const rot=await rotateHandle.boundingBox()
  await page.mouse.move(rot.x+rot.width/2,rot.y+rot.height/2);await page.mouse.down()
  await page.mouse.move(rot.x+rot.width/2+28,rot.y+rot.height/2+18);await page.mouse.up()
  assert.notEqual(await page.getByLabel('Rotation (degrees)').inputValue(),'0')
  await page.getByTestId('wave-play-pause').click()
  assert.equal(await wave.getAttribute('data-motion'),reduced?'reduced':'playing')
  await page.getByTestId('wave-play-pause').click()

  await page.getByRole('button',{name:'LCR Hero'}).click()
  await page.getByRole('button',{name:'Add Text'}).click()
  const text=page.locator('.lcr-v2-text-content').first()
  assert(await text.count()>0,'Text overlay must render')
  await page.getByLabel('Text Content').fill('Text composition test')
  await page.getByLabel('Text Font Size').fill('38')
  await page.getByLabel('Text Align').selectOption('center')
  assert(await page.getByText('Text composition test').count()>0)
  await page.getByRole('button',{name:/Hide Particle Wave/}).click()
  assert.equal(await page.locator('[data-layer-id="wave"]').count(),0)
  await page.getByRole('button',{name:/Show Particle Wave/}).click()

  const config=await downloaded(page,page.getByRole('button',{name:'Download Configuration'}))
  assert(config.suggestedFilename().endsWith('.json'))
  const preview=await downloaded(page,page.getByRole('button',{name:'Export Preview PNG'}))
  assert(preview.suggestedFilename().endsWith('.png'))
  const zip=await downloaded(page,page.getByRole('button',{name:'Download Component Package'}))
  assert(zip.suggestedFilename().endsWith('.zip'))

  await page.getByRole('button',{name:'Save Preset'}).click()
  await page.getByLabel('Preset Name').fill('V2 Browser Test')
  await page.getByRole('dialog',{name:'Save Preset'}).getByRole('button',{name:'Save',exact:true}).click()
  await page.getByText('V2 Browser Test').waitFor()
  await page.getByRole('button',{name:'Load',exact:true}).click()
  await page.getByRole('button',{name:'Save Preset'}).click()
  await page.getByRole('button',{name:'Duplicate V2 Browser Test'}).click()
  await page.getByText('V2 Browser Test (copy)').waitFor()
  await page.getByRole('button',{name:'Close',exact:true}).click()

  await page.getByRole('button',{name:'Import Animation'}).click()
  await page.getByRole('dialog',{name:'Import Animation'}).waitFor()
  // Wrong file extension in the TSX dropzone must yield a clear rejection.
  await page.evaluate(()=>{
    const file=new File(['.incorrect{}'],'wrong.css',{type:'text/css'})
    const transfer=new DataTransfer();transfer.items.add(file)
    document.querySelectorAll('.lcr-v2-import-slot')[0].dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer}))
  })
  await page.getByText('Formato incorreto: o campo requer .tsx.').waitFor()
  await page.getByRole('button',{name:'Info about import formats'}).click()
  await page.getByRole('dialog',{name:'File Formats & Safety'}).waitFor()
  await page.getByRole('button',{name:'Close Info'}).click()
  await page.locator('input[accept=".tsx"]').setInputFiles({name:'ImportedComponent.tsx',mimeType:'text/plain',buffer:Buffer.from('export function ImportedComponent(){return null}')})
  await page.locator('input[accept=".css"]').setInputFiles({name:'imported.css',mimeType:'text/css',buffer:Buffer.from('.imported{}')})
  await page.locator('input[accept=".ts"]').setInputFiles({name:'types.ts',mimeType:'text/plain',buffer:Buffer.from('export type X=number')})
  assert(await page.getByText('ImportedComponent.tsx',{exact:false}).count()>0)
  await page.getByRole('button',{name:'Save Files for Review'}).click()

  // Imported code stays inert, but original files must appear in the ZIP.
  const originalZip=await downloaded(page,page.getByRole('button',{name:'Download Component Package'}))
  const zipBytes=await readFile(await originalZip.path())
  assert.equal(zipBytes.subarray(0,4).toString('hex'),'504b0304','Invalid ZIP header')
  for(const name of ['ParticleWave.tsx','particle-wave.css','particle-wave-types.ts','composition.json',
    'imported-original/tsx/ImportedComponent.tsx','imported-original/css/imported.css','imported-original/ts/types.ts']){
    assert(zipBytes.includes(Buffer.from(name)), 'ZIP is missing '+name)
  }
  // Paste a screenshot directly on the stage; browser provides it via clipboardData.
  const screenshotB64=png.toString('base64')
  const pasted=async(target,type)=>{
    return page.evaluate(({b64,target,type})=>{
      const raw=Uint8Array.from(atob(b64),c=>c.charCodeAt(0))
      const image=new File([raw],type+'.png',{type:'image/png'})
      const transfer=new DataTransfer()
      transfer.items.add(image)
      const element=document.querySelector(target)
      if(!element)throw Error('No target '+target)
      const event=type==='paste'
        ? new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:transfer})
        : new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer})
      element.dispatchEvent(event)
    },{b64:screenshotB64,target,type})
  }
  // LCR Hero preset starts with no background; first paste needs no replacement confirmation.
  await pasted('[data-testid="visual-editor"]','paste')
  await page.getByRole('dialog',{name:'Add Background'}).waitFor()
  await page.getByRole('button',{name:'Apply Background'}).click()
  await page.locator('img.lcr-v2-background').waitFor()
  page.once('dialog',d=>d.accept())
  await pasted('[data-testid="visual-editor"]','drop')
  await page.getByRole('dialog',{name:'Add Background'}).waitFor()
  await page.getByRole('button',{name:'Apply Background'}).click()
  // Direct modal drag-and-drop is equivalent to Browse Files.
  page.once('dialog',d=>d.accept())
  await page.getByRole('button',{name:'Add Background',exact:true}).click()
  await page.getByRole('dialog',{name:'Add Background'}).waitFor()
  await pasted('.lcr-v2-dropzone','drop')
  await page.getByRole('button',{name:'Apply Background'}).click()
  await page.getByRole('dialog',{name:'Add Background'}).waitFor({state:'hidden'})
  // Loading a preset clears selection; create a new text layer before testing text-field paste.
  await page.getByRole('button',{name:'Add Text'}).click()
  // Pasting while a text editor has focus must never open background import.
  await page.evaluate((b64)=>{
    const raw=Uint8Array.from(atob(b64),c=>c.charCodeAt(0))
    const transfer=new DataTransfer()
    transfer.items.add(new File([raw],'clipboard.png',{type:'image/png'}))
    const input=document.querySelector('textarea[aria-label="Text Content"]')
    if(!input)throw Error('Text editor not available')
    input.focus()
    input.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:transfer}))
  },screenshotB64)
  assert.equal(await page.getByRole('dialog',{name:'Add Background'}).count(),0)
  // Invalid clipboard (no image) yields feedback, never auto-opens a modal.
  await page.evaluate(()=>{
    const data=new DataTransfer()
    document.querySelector('[data-testid="visual-editor"]').dispatchEvent(
      new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}))
  })
  await page.getByText('Nenhuma imagem encontrada no Ctrl+V.').waitFor()
  await page.screenshot({path:`test-results/v2-${name}-final.png`,fullPage:true})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2),false,'Horizontal page overflow')
  assert.equal(errors.length,0,'Browser errors: '+errors.join('; '))
  checks.push(name)
  await context.close()
}
try{
  await mkdir('test-results',{recursive:true})
  await ready();browser=await chromium.launch({headless:true})
  await run('desktop',{width:1440,height:900})
  // Tablet/mobile open, sizing, reduced motion and preview tests without full transform suite.
  for(const [name,viewport,reduced] of [['tablet',{width:820,height:1000},false],['mobile-reduced',{width:390,height:844},true]]){
    const context=await browser.newContext({viewport,reducedMotion:reduced?'reduce':'no-preference'})
    const page=await context.newPage()
    page.on('pageerror',e=>errors.push(name+':'+String(e)))
    await page.goto(LAB);await page.getByTestId('visual-editor').waitFor()
    await page.waitForFunction(()=>document.querySelector('[data-testid="particle-wave-canvas"]')?.dataset.ready==='true')
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2),false,'Mobile overflow')
    assert.equal(await page.locator('[data-testid="particle-wave-canvas"]').getAttribute('data-motion'),reduced?'reduced':'playing')
    await page.screenshot({path:`test-results/v2-${name}.png`,fullPage:true})
    checks.push(name);await context.close()
  }
  const page=await browser.newPage()
  await page.goto(BASE+'#/');await page.locator('.hero-v3').waitFor()
  assert.equal(await page.locator('[data-testid="test-component-lab"]').count(),0)
  checks.push('Home regression')
  console.log('PASS Test Component Lab V2:',checks.join(', '))
}catch(e){errors.push(String(e?.stack||e));console.error('FAIL Test Component Lab V2',e);process.exitCode=1}
finally{await writeFile('test-results/lab-v2-ci-results.json',JSON.stringify({checks,errors},null,2));await browser?.close();try{process.kill(-srv.pid,'SIGTERM')}catch{srv.kill('SIGTERM')}}
