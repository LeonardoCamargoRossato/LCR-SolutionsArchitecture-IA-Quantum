import { useEffect, useRef, useState, type DragEvent, type PointerEvent } from 'react'
import { Move, RotateCw } from 'lucide-react'
import { ParticleWave } from '../../../components/test-component-lab/particle-wave/ParticleWave'
import { angleFromPoint, fromVirtual, gridCounts, relativeDelta, resizeTransform } from './coordinates'
import type { CompositionDocument, Layer, TextOverlay, Transform } from './document-model'

export type SelectedLayer = string | null
type Props = {
  document: CompositionDocument
  setDocument: (next: (current: CompositionDocument) => CompositionDocument) => void
  selected: SelectedLayer
  select: (id: SelectedLayer) => void
  imageUrl: string | null
  onDroppedImage: (file: File) => void
  onPasteImage: (file: File) => void
  editing: boolean
  enterEditing: () => void
  zoom: number | null
  onZoom: (value: number | null) => void
  onFitScale: (value: number) => void
}
const HANDLES = ['nw','n','ne','e','se','s','sw','w']
const fontFamily = { sans: 'Inter,system-ui,sans-serif', serif: 'Georgia,serif', mono: 'ui-monospace,monospace' }
const order = (layers: Layer[]) => [...layers].sort((a,b)=>a.order-b.order)

export function VisualEditor({
  document: doc, setDocument, selected, select, imageUrl, onDroppedImage, onPasteImage,
  editing, enterEditing, zoom, onZoom, onFitScale,
}: Props) {
  const container = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState({ width: 920, height: 570 })
  const [rotateMode, setRotateMode] = useState(false)
  const [dropping, setDropping] = useState(false)
  const [notice, setNotice] = useState('')
  useEffect(()=>{
    if(!container.current) return
    const resize = new ResizeObserver(entries=>{
      const box=entries[0].contentRect
      setFrame({ width:box.width, height:box.height })
    })
    resize.observe(container.current)
    return ()=>resize.disconnect()
  },[])
  useEffect(()=>{ if(!selected) setRotateMode(false) },[selected])

  const ruler = doc.rulersVisible ? 28 : 0
  const fit = Math.min((Math.max(frame.width-60-ruler,260))/doc.canvas.width,
    (Math.max(frame.height-60-ruler,220))/doc.canvas.height)
  useEffect(() => { onFitScale(fit) }, [fit, onFitScale])
  const scale = Math.min(3, Math.max(.08, zoom ?? fit))
  const width = doc.canvas.width * scale
  const height = doc.canvas.height * scale
  const [cols, rows] = gridCounts(doc.canvas.width,doc.canvas.height)
  const layers = order(doc.layers)
  const visible = (id: string) => doc.layers.find(layer=>layer.id===id)?.visible !== false
  const locked = (id: string) => doc.layers.find(layer=>layer.id===id)?.locked === true

  const changeTransform = (id: string, transform: Transform) => {
    setDocument(current => id === 'wave'
      ? { ...current, transform }
      : { ...current, texts: current.texts.map(text=>text.id===id?{...text,transform}:text) })
  }

  const begin = (event: PointerEvent<HTMLElement>, id: string, mode: 'move'|'resize'|'rotate', handle='') => {
    if(!editing || locked(id) || event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    const original = id==='wave' ? doc.transform : doc.texts.find(t=>t.id===id)?.transform
    if(!original) return
    select(id)
    const ox=event.clientX, oy=event.clientY
    const rect=stage.current?.getBoundingClientRect()
    if(!rect)return
    const centerX=rect.left+(original.x+original.width/2)*scale
    const centerY=rect.top+(original.y+original.height/2)*scale
    const initialAngle=angleFromPoint(ox,oy,centerX,centerY)
    const drag = (move: globalThis.PointerEvent) => {
      const dx=(move.clientX-ox)/scale,dy=(move.clientY-oy)/scale
      if(mode==='move')changeTransform(id,{
        ...original, x:original.lockX?original.x:original.x+dx,
        y:original.lockY?original.y:original.y+dy,
      })
      if(mode==='resize')changeTransform(id,resizeTransform(original,handle,dx,dy))
      if(mode==='rotate') {
        const nextAngle=angleFromPoint(move.clientX,move.clientY,centerX,centerY)
        changeTransform(id,{...original, rotation:Math.round((original.rotation+nextAngle-initialAngle)*10)/10})
      }
    }
    const stop = () => {
      window.removeEventListener('pointermove',drag)
      window.removeEventListener('pointerup',stop)
      window.removeEventListener('pointercancel',stop)
    }
    window.addEventListener('pointermove',drag)
    window.addEventListener('pointerup',stop,{once:true})
    window.addEventListener('pointercancel',stop,{once:true})
  }

  const drawLayer=(layer: Layer) => {
    if(!layer.visible || layer.kind==='guides' || layer.kind==='background')return null
    const text: TextOverlay|undefined = layer.kind==='text'?doc.texts.find(t=>t.id===layer.id):undefined
    if(layer.kind==='text'&&!text)return null
    const t=layer.kind==='wave'?doc.transform:text!.transform
    const active=editing&&selected===layer.id&&!layer.locked
    const style: React.CSSProperties={
      position:'absolute',left:t.x*scale,top:t.y*scale,width:t.width*scale,height:t.height*scale,
      transform:`rotate(${t.rotation}deg) scale(${t.flipX?-1:1},${t.flipY?-1:1})`,
      transformOrigin:'center',zIndex:layer.order+1,
      touchAction:active?'none':'auto', cursor:active?'move':'default',
    }
    return (
      <div key={layer.id} className={`lcr-v2-object ${active?'is-selected':''}`}
        data-layer-id={layer.id} data-testid={layer.kind==='wave'?'wave-transform-layer':undefined}
        style={style}
        onDoubleClick={event=>{event.stopPropagation();if(layer.kind==='wave'){enterEditing();select('wave')}else {enterEditing();select(layer.id)}}}
        onPointerDown={event=>{if(active)begin(event,layer.id,rotateMode?'rotate':'move')}}
      >
        {layer.kind==='wave'
          ? <ParticleWave settings={doc.settings} running={doc.animation.running&&!editing}
              direction={doc.animation.direction} />
          : <div className="lcr-v2-text-content" style={{
            fontFamily:fontFamily[text!.font],fontSize:Math.max(7,text!.fontSize*scale),color:text!.color,
            textAlign:text!.align,lineHeight:1.22,whiteSpace:'pre-wrap',overflow:'hidden',overflowWrap:'anywhere',
          }}>{text!.content}</div>}
        {active && <>
          <div className="lcr-v2-selection-border" aria-hidden="true"/>
          {HANDLES.map(handle=><button key={handle} type="button" aria-label={`Resize ${handle}`}
              data-handle={handle} className={`lcr-v2-handle lcr-v2-handle--${handle}`}
              onPointerDown={event=>begin(event,layer.id,'resize',handle)} />)}
          <button type="button" className="lcr-v2-handle lcr-v2-rotation-handle"
            aria-label="Rotation handle" data-handle="rotate"
            onPointerDown={event=>begin(event,layer.id,'rotate')}>↻</button>
        </>}
      </div>
    )
  }
  const importDrop=(event:DragEvent) => {
    event.preventDefault()
    setDropping(false)
    const file=event.dataTransfer.files[0]
    if(file && /image\/(png|jpeg|webp)/.test(file.type)) onDroppedImage(file)
    else setNotice('Solte uma imagem PNG, JPEG ou WebP.')
  }

  const paste=(event:React.ClipboardEvent<HTMLDivElement>)=>{
    if(event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable]'))return
    const entry=[...event.clipboardData.items].find(item=>item.kind==='file'&&item.type.startsWith('image/'))
    const file=entry?.getAsFile()
    if(file) {
      event.preventDefault()
      const ext=file.type==='image/jpeg'?'jpg':file.type==='image/webp'?'webp':'png'
      onPasteImage(new File([file],`screenshot-${Date.now()}.${ext}`,{type:file.type}))
    } else {setNotice('Nenhuma imagem encontrada no Ctrl+V.');window.setTimeout(()=>setNotice(''),3600)}
  }

  return (
    <div className="lcr-v2-editor-viewport" ref={container} data-testid="visual-editor"
      tabIndex={0} onPaste={paste} aria-label="Área de edição visual, clique para colar screenshot" onPointerDown={event=>{if(!(event.target instanceof HTMLElement && event.target.closest('button,input,textarea,select')))event.currentTarget.focus()}} 
      onDragOver={event=>{event.preventDefault();setDropping(true)}} onDragLeave={event=>{event.preventDefault();setDropping(false)}}
      onDrop={importDrop}>
      {notice && <div className="lcr-v2-editor-notice" role="status">{notice}</div>}
      {dropping && <div className="lcr-v2-drop-overlay" aria-hidden="true">Drop image to import</div>}
      <div className="lcr-v2-editor-surround" style={{width:width+ruler,height:height+ruler,margin:'auto'}}>
        {doc.rulersVisible&&<>
          <div className="lcr-v2-ruler-corner"/>
          <div className="lcr-v2-ruler lcr-v2-ruler--x" style={{left:ruler,top:0,width}}>
            {Array.from({length:cols+1},(_,i)=><span key={i} style={{left:i/cols*100+'%'}}>{fromVirtual(i*doc.canvas.width/cols,'x',doc.canvas.width,doc.canvas.height,doc.units)}</span>)}
          </div>
          <div className="lcr-v2-ruler lcr-v2-ruler--y" style={{left:0,top:ruler,height}}>
            {Array.from({length:rows+1},(_,i)=><span key={i} style={{top:i/rows*100+'%'}}>{fromVirtual(i*doc.canvas.height/rows,'y',doc.canvas.width,doc.canvas.height,doc.units)}</span>)}
          </div>
        </>}
        <div ref={stage} className={`lcr-lab-canvas-stage lcr-v2-stage lcr-lab-canvas-stage--${doc.surface}`}
          data-testid="lab-preview-stage" style={{position:'absolute',left:ruler,top:ruler,width,height,
          backgroundColor:doc.surface==='transparent'?'transparent':doc.settings.background}}
          onDoubleClick={e=>{if(e.target===e.currentTarget)select(null)}}
        >
          {doc.background&&imageUrl&&visible('background')&&
            <img src={imageUrl} alt="" draggable={false} className="lcr-v2-background"
              style={{opacity:doc.background.opacity,objectFit:doc.background.fit==='original'?'none':doc.background.fit}} />}
          {layers.map(drawLayer)}
          {doc.gridVisible&&visible('guides')&&<div className="lcr-v2-grid" aria-hidden="true"
            style={{backgroundSize:`${width/cols}px ${height/rows}px`}} />}
          {editing&&selected&&<div className="lcr-v2-edit-indicator"><Move size={12}/> Edit Mode · {rotateMode?'Rotate':'Move / Resize'}
            <button type="button" onClick={()=>setRotateMode(v=>!v)} aria-pressed={rotateMode}><RotateCw size={12}/> Rotate</button>
          </div>}
        </div>
      </div>
      <div className="lcr-v2-viewport-scale">Virtual: {doc.canvas.width} × {doc.canvas.height} · Zoom {Math.round(scale*100)}%
        {zoom!==null&&<button type="button" onClick={()=>onZoom(null)}>Fit to Screen</button>}
      </div>
    </div>
  )
}
