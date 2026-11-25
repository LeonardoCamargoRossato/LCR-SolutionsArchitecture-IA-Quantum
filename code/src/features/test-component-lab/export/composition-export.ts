import type { CompositionDocument, TextOverlay, Transform } from '../editor/document-model'
import type { ImportedFiles } from '../import/ImportAnimationDialog'
import { download,makeZip } from './zip-store'

type Inputs={doc:CompositionDocument;imageUrl:string|null;sourceCanvas:HTMLCanvasElement|null;backgroundBlob?:Blob|null}
function drawBackground(context:CanvasRenderingContext2D,image:HTMLImageElement,doc:CompositionDocument) {
  const bw=doc.canvas.width,bh=doc.canvas.height
  const sourceW=image.naturalWidth,sourceH=image.naturalHeight
  const fit=doc.background?.fit||'contain'
  if(fit==='original') {
    context.drawImage(image,(bw-sourceW)/2,(bh-sourceH)/2)
  } else {
    const ratio=fit==='cover'?Math.max(bw/sourceW,bh/sourceH):Math.min(bw/sourceW,bh/sourceH)
    const drawW=sourceW*ratio,drawH=sourceH*ratio
    context.drawImage(image,(bw-drawW)/2,(bh-drawH)/2,drawW,drawH)
  }
}
function withTransform(ctx:CanvasRenderingContext2D,t:Transform,draw:()=>void) {
  ctx.save()
  ctx.translate(t.x+t.width/2,t.y+t.height/2)
  ctx.rotate(t.rotation*Math.PI/180)
  ctx.scale(t.flipX?-1:1,t.flipY?-1:1)
  ctx.translate(-t.width/2,-t.height/2)
  draw()
  ctx.restore()
}
function paintText(ctx:CanvasRenderingContext2D,t:TextOverlay) {
  withTransform(ctx,t.transform,()=>{
    const rect=t.transform
    ctx.beginPath();ctx.rect(0,0,rect.width,rect.height);ctx.clip()
    const font=t.font==='mono'?'ui-monospace,monospace':t.font==='serif'?'Georgia,serif':'Inter,Arial,sans-serif'
    ctx.font=`${t.fontSize}px ${font}`
    ctx.textBaseline='top';ctx.fillStyle=t.color;ctx.textAlign=t.align
    const x=t.align==='center'?rect.width/2:t.align==='right'?rect.width:0
    let y=0
    for(const paragraph of t.content.split('\n')){
      let line=''
      for(const word of paragraph.split(' ')) {
        const proposed=line?line+' '+word:word
        if(ctx.measureText(proposed).width>rect.width&&line){
          ctx.fillText(line,x,y);y+=t.fontSize*1.22;line=word
        }else line=proposed
      }
      ctx.fillText(line,x,y);y+=t.fontSize*1.22
    }
  })
}
export async function previewPng({doc,imageUrl,sourceCanvas}:Inputs):Promise<Blob>{
  if(doc.canvas.width*doc.canvas.height>16_800_000)throw Error('Resolução excessiva para PNG.')
  const target=document.createElement('canvas')
  target.width=doc.canvas.width;target.height=doc.canvas.height
  const ctx=target.getContext('2d')
  if(!ctx)throw Error('Exportação Canvas indisponível.')
  if(doc.surface!=='transparent'){
    ctx.fillStyle=doc.settings.background;ctx.fillRect(0,0,target.width,target.height)
  }
  const layers=[...doc.layers].sort((a,b)=>a.order-b.order)
  if(doc.background&&layers.find(l=>l.id==='background')?.visible!==false) {
    if(!imageUrl)throw Error('A referência da imagem não está disponível neste navegador.')
    const image=new Image();image.src=imageUrl;await image.decode()
    ctx.save();ctx.globalAlpha=doc.background.opacity;drawBackground(ctx,image,doc);ctx.restore()
  }
  for(const layer of layers) {
    if(!layer.visible)continue
    if(layer.kind==='wave'&&sourceCanvas)withTransform(ctx,doc.transform,()=>{
      ctx.drawImage(sourceCanvas,0,0,doc.transform.width,doc.transform.height)
    })
    if(layer.kind==='text') {
      const overlay=doc.texts.find(t=>t.id===layer.id)
      if(overlay)paintText(ctx,overlay)
    }
  }
  // Editor rulers/grid/handles never reach this raster.
  return new Promise((resolve,reject)=>target.toBlob(blob=>blob?resolve(blob):reject(Error('Não foi possível criar o PNG.')),'image/png'))
}
export async function downloadPackage(doc:CompositionDocument,files:ImportedFiles,backgroundBlob?:Blob|null) {
  const parts: {name:string;content:string|Blob}[]=[]
  const componentCode=(await import('../../../components/test-component-lab/particle-wave/ParticleWave.tsx?raw')).default as string
  const componentStyle=(await import('../../../components/test-component-lab/particle-wave/particle-wave.css?raw')).default as string
  const componentTypes=(await import('../../../components/test-component-lab/particle-wave/particle-wave-types.ts?raw')).default as string
  parts.push(
    {name:'ParticleWave.tsx',content:componentCode},
    {name:'particle-wave.css',content:componentStyle},
    {name:'particle-wave-types.ts',content:componentTypes},
    {name:'composition.json',content:JSON.stringify(doc,null,2)},
    {name:'README.md',content:`# LCR Particle Wave — Exported Component Package

This package includes the **original, unmodified registered source files** and a validated V2 composition.json.
Install React and import ParticleWave.tsx with the accompanying style/types.
The transforms, overlays and background are **not baked into ParticleWave.tsx**.
Use composition.json in a host wrapper to reproduce the visual composition.
Background files, if present, remain the user's original local upload and are included below.
The Lab's untrusted user-imported TSX/CSS/TS are **not executed**.
Downloaded from LCR Test Component Lab V2.\n`},
  )
  if(backgroundBlob&&doc.background) {
    const ext=doc.background.mime==='image/jpeg'?'jpg':doc.background.mime==='image/webp'?'webp':'png'
    parts.push({name:`assets/background-original.${ext}`,content:backgroundBlob})
  }
  for(const [kind,file] of Object.entries(files)) if(file) parts.push({name:`imported-original/${kind}/${file.name.replace(/[^a-zA-Z0-9_.-]/g,'_')}`,content:file})
  const zip=await makeZip(parts)
  download(zip,'lcr-particle-wave-component-v2.zip')
}
export function downloadJson(doc:CompositionDocument){
  download(new Blob([JSON.stringify(doc,null,2)],{type:'application/json'}),'lcr-composition-v2.json')
}
