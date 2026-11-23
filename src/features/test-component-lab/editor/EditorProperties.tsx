import { ArrowDown, ArrowUp, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react'
import { LabControls } from '../components/LabControls'
import { fromVirtual, toVirtual } from './coordinates'
import type { CompositionDocument, TextOverlay, Transform } from './document-model'
import { WAVE_PRESETS, type WavePresetId, type WaveSettings } from '../../../components/test-component-lab/particle-wave/particle-wave-types'
type Props = {
  doc: CompositionDocument
  update: (next: (current:CompositionDocument)=>CompositionDocument) => void
  selected: string | null
  select: (id:string|null)=>void
  displayedCount: number
  setDisplayedCount: (count:number)=>void
  onPreset: (id:WavePresetId)=>void
  onSetting: <K extends keyof WaveSettings>(key:K,value:WaveSettings[K])=>void
  onRemoveBackground: ()=>void
}
const num = (value:number)=>Number(value.toFixed(2))
export function EditorProperties({ doc, update, selected, select, displayedCount, setDisplayedCount, onPreset, onSetting, onRemoveBackground }:Props) {
  const text = doc.texts.find(t=>t.id===selected)
  const target = selected==='wave' ? doc.transform : text?.transform
  const patch = (transform:Transform) => update(current => selected==='wave'
    ? {...current,transform}
    : {...current,texts:current.texts.map(t=>t.id===selected?{...t,transform}:t)})
  const setField=(name:'x'|'y'|'width'|'height'|'rotation',value:number)=>{
    if(!target)return
    let result={...target}
    const axis=name==='y'||name==='height'?'y':'x'
    const pixel=name==='rotation'?value:toVirtual(value,axis,doc.canvas.width,doc.canvas.height,doc.units)
    if(name==='x'&&!target.lockX)result.x=pixel
    if(name==='y'&&!target.lockY)result.y=pixel
    if(name==='width'){
      result.width=Math.max(24,pixel)
      if(target.lockAspectRatio)result.height=result.width*target.height/target.width
    }
    if(name==='height'){
      result.height=Math.max(24,pixel)
      if(target.lockAspectRatio)result.width=result.height*target.width/target.height
    }
    if(name==='rotation')result.rotation=value
    patch(result)
  }
  const setText=(changes:Partial<TextOverlay>)=>update(current=>({...current,texts:current.texts.map(t=>t.id===selected?{...t,...changes}:t)}))
  const patchLayer=(id:string,changes:{visible?:boolean;locked?:boolean})=>update(current=>({...current,layers:current.layers.map(layer=>layer.id===id?{...layer,...changes}:layer)}))
  const reorder=(id:string,delta:number)=>update(current=>{
    const list=[...current.layers].filter(l=>l.id!=='guides'&&l.id!=='background').sort((a,b)=>a.order-b.order)
    const index=list.findIndex(l=>l.id===id)
    const newIndex=index+delta
    if(index<0||newIndex<0||newIndex>=list.length)return current
    const [chosen]=list.splice(index,1);list.splice(newIndex,0,chosen)
    return {...current,layers:current.layers.map(l=>{
      const i=list.findIndex(item=>item.id===l.id)
      return i<0?l:{...l,order:1+i}
    })}
  })
  const removeText=(id:string)=>update(current=>({
    ...current,texts:current.texts.filter(t=>t.id!==id),layers:current.layers.filter(l=>l.id!==id),
  }))
  return <aside className="lcr-lab-sidebar lcr-v2-properties" aria-label="Properties">
    <div className="lcr-v2-properties-title"><h2>Properties</h2><small>{selected ? 'Selected: '+(text?.kind||selected) : 'Select a layer'}</small></div>
    <div className="lcr-v2-properties-scroll">
      <details className="lcr-v2-property-group" open>
        <summary>Position &amp; Size</summary>
        <div className="lcr-v2-property-body">
          {target ? <>
            <div className="lcr-v2-numeric-grid">
              {(['x','y','width','height'] as const).map(key=>{
                const axis=key==='y'||key==='height'?'y':'x'
                const value=fromVirtual(target[key],axis,doc.canvas.width,doc.canvas.height,doc.units)
                return <label key={key}>{key.toUpperCase()} <input type="number" step=".1"
                  aria-label={`Object ${key}`} value={num(value)}
                  onChange={e=>setField(key,Number(e.target.value))} /></label>
              })}
              <label>Rotation (°)<input type="number" aria-label="Rotation (degrees)" value={num(target.rotation)} step="1"
                onChange={e=>setField('rotation',Number(e.target.value))} /></label>
            </div>
            <div className="lcr-v2-toggle-stack">
              {(['lockX','lockY','lockAspectRatio'] as const).map(key=>
                <label key={key}><input type="checkbox" checked={target[key]} onChange={e=>patch({...target,[key]:e.target.checked})}/>
                  {key==='lockX'?'Lock X':key==='lockY'?'Lock Y':'Lock Proportions'}</label>)}
            </div>
            <div className="lcr-v2-small-actions">
              <button type="button" className="lcr-lab-action" onClick={()=>patch({...target,flipX:!target.flipX})}
                aria-pressed={target.flipX}>Flip Horizontal</button>
              <button type="button" className="lcr-lab-action" onClick={()=>patch({...target,flipY:!target.flipY})}
                aria-pressed={target.flipY}>Flip Vertical</button>
            </div>
            <p className="lcr-lab-hint">Valores em {doc.units === 'grid'?'Grid Units':doc.units==='percent'?'%':'px'}. Dê dois cliques na onda para ativar as alças.</p>
          </>:<p className="lcr-lab-hint">Selecione Particle Wave ou um texto para editar.</p>}
        </div>
      </details>
      <details className="lcr-v2-property-group" open>
        <summary>Animation</summary>
        <div className="lcr-v2-property-body">
          <label className="lcr-v2-field">Wave Direction<select aria-label="Wave Direction" value={doc.animation.direction}
            onChange={e=>update(current=>({...current,animation:{...current.animation,direction:e.target.value==='reverse'?'reverse':'forward'}}))}>
            <option value="forward">Forward</option><option value="reverse">Reverse</option>
          </select></label>
          <p className="lcr-lab-hint">Reverse inverte o tempo, sem espelhar a imagem.</p>
        </div>
      </details>
      {text&&<details className="lcr-v2-property-group" open>
        <summary>Text Overlay</summary>
        <div className="lcr-v2-property-body">
          <label className="lcr-v2-field">Content<textarea aria-label="Text Content" rows={3} value={text.content}
            onChange={e=>setText({content:e.target.value.slice(0,500)})}/></label>
          <div className="lcr-v2-numeric-grid">
            <label>Font<select aria-label="Text Font" value={text.font} onChange={e=>setText({font:e.target.value as TextOverlay['font']})}>
              <option value="sans">Sans</option><option value="serif">Serif</option><option value="mono">Monospace</option>
            </select></label>
            <label>Font Size<input aria-label="Text Font Size" type="number" min="10" max="180" value={text.fontSize}
              onChange={e=>setText({fontSize:Math.max(10,Math.min(180,Number(e.target.value)||10))})}/></label>
            <label>Color<input aria-label="Text Color" type="color" value={text.color}
              onChange={e=>setText({color:e.target.value})}/></label>
            <label>Align<select aria-label="Text Align" value={text.align} onChange={e=>setText({align:e.target.value as TextOverlay['align']})}>
              <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
            </select></label>
          </div>
          <button type="button" className="lcr-lab-action" onClick={()=>{removeText(text.id);select(null)}}><Trash2 size={15}/> Remove Text</button>
        </div>
      </details>}
      <details className="lcr-v2-property-group" open>
        <summary>Appearance</summary>
        <div className="lcr-v2-property-body">
          {doc.background ? <>
            <p className="lcr-lab-hint">{doc.background.name}</p>
            <label className="lcr-v2-field">Background Fit<select aria-label="Background Fit" value={doc.background.fit} onChange={e=>update(c=>c.background?{...c,background:{...c.background,fit:e.target.value as 'contain'|'cover'|'original'}}:c)}>
              <option value="contain">Fit</option><option value="cover">Fill</option><option value="original">Original Ratio</option>
            </select></label>
            <label className="lcr-v2-field">Background Opacity <span>{Math.round(doc.background.opacity*100)}%</span>
              <input type="range" aria-label="Background Opacity" min="0" max="1" step=".05" value={doc.background.opacity}
                onChange={e=>update(c=>c.background?{...c,background:{...c.background,opacity:Number(e.target.value)}}:c)}/></label>
            <button className="lcr-lab-action" onClick={onRemoveBackground}>Remove Background</button>
          </>:<p className="lcr-lab-hint">Use Add Background para importar uma imagem.</p>}
        </div>
      </details>
      <details className="lcr-v2-property-group" open>
        <summary>Layers</summary>
        <div className="lcr-v2-property-body lcr-v2-layer-list">
          {[...doc.layers].sort((a,b)=>b.order-a.order).map(layer=>
            <div className={`lcr-v2-layer ${selected===layer.id?'is-active':''}`} key={layer.id}>
              <button type="button" className="lcr-v2-layer-name" onClick={()=>select(layer.id)}
                aria-pressed={selected===layer.id}>{layer.name}</button>
              <button type="button" title={layer.visible?'Hide layer':'Show layer'} aria-label={`${layer.visible?'Hide':'Show'} ${layer.name}`}
                onClick={()=>patchLayer(layer.id,{visible:!layer.visible})}>{layer.visible?<Eye size={14}/>:<EyeOff size={14}/>}</button>
              <button type="button" title={layer.locked?'Unlock':'Lock'} aria-label={`${layer.locked?'Unlock':'Lock'} ${layer.name}`}
                disabled={layer.kind==='background'||layer.kind==='guides'}
                onClick={()=>patchLayer(layer.id,{locked:!layer.locked})}>{layer.locked?<Lock size={14}/>:<Unlock size={14}/>}</button>
              <button type="button" aria-label={`Move forward ${layer.name}`} disabled={layer.kind==='background'||layer.kind==='guides'}
                onClick={()=>reorder(layer.id,1)}><ArrowUp size={13}/></button>
              <button type="button" aria-label={`Move backward ${layer.name}`} disabled={layer.kind==='background'||layer.kind==='guides'}
                onClick={()=>reorder(layer.id,-1)}><ArrowDown size={13}/></button>
            </div>)}
        </div>
      </details>
      <details className="lcr-lab-controls-details lcr-v2-property-group" open>
        <summary>Particle Wave · V1 Controls</summary>
        <div className="lcr-v2-property-body">
          <LabControls settings={doc.settings} preset={doc.preset} displayedCount={displayedCount}
            onPreset={onPreset} onSetting={onSetting} onParticleCount={setDisplayedCount}/>
        </div>
      </details>
    </div>
  </aside>
}
