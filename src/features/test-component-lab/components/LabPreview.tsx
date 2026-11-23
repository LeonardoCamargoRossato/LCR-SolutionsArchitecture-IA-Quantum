import { Pause, Play, RotateCcw, Copy, Check, Layers3, Sun, Moon } from 'lucide-react'
import { VisualEditor } from '../editor/VisualEditor'
import type { CompositionDocument } from '../editor/document-model'
type Props = {
  doc:CompositionDocument
  setDoc:(change:(current:CompositionDocument)=>CompositionDocument)=>void
  selected:string|null
  select:(selected:string|null)=>void
  imageUrl:string|null
  editing:boolean
  enterEditing:()=>void
  zoom:number|null
  onZoom:(value:number|null)=>void
  onFitScale:(value:number)=>void
  onDroppedImage:(file:File)=>void
  onPasteImage:(file:File)=>void
  copyStatus:string
  onRunning:()=>void
  onReset:()=>void
  onCopy:()=>void
  onSurface:(surface:'light'|'dark'|'transparent')=>void
}
export function LabPreview({
  doc,setDoc,selected,select,imageUrl,editing,enterEditing,zoom,onZoom,onFitScale,
  onDroppedImage,onPasteImage,copyStatus,onRunning,onReset,onCopy,onSurface,
}:Props){
  return <section className="lcr-lab-preview-pane" aria-labelledby="lab-preview-title">
    <div className="lcr-lab-pane-heading">
      <div><h2 id="lab-preview-title">Visual Composition Editor</h2><p>Particle Wave · Live Preview · 2D Canvas</p></div>
      <span className="lcr-lab-renderer-pill">Virtual {doc.canvas.width} × {doc.canvas.height}</span>
    </div>
    <div className="lcr-lab-preview-topbar">
      <div className="lcr-lab-segmented" role="group" aria-label="Modo de fundo">
        <button type="button" aria-pressed={doc.surface==='light'} onClick={()=>onSurface('light')}><Sun size={15} aria-hidden="true"/> Claro</button>
        <button type="button" aria-pressed={doc.surface==='dark'} onClick={()=>onSurface('dark')}><Moon size={15} aria-hidden="true"/> Escuro</button>
        <button type="button" aria-pressed={doc.surface==='transparent'} onClick={()=>onSurface('transparent')}><Layers3 size={15} aria-hidden="true"/> Transparência</button>
      </div>
      <span className="lcr-v2-mode-label">{editing?'EDIT MODE · FRAME PAUSED':'PREVIEW MODE · DOUBLE CLICK TO EDIT'}</span>
    </div>
    <VisualEditor document={doc} setDocument={setDoc} selected={selected} select={select}
      imageUrl={imageUrl} onDroppedImage={onDroppedImage} onPasteImage={onPasteImage}
      editing={editing} enterEditing={enterEditing} zoom={zoom} onZoom={onZoom} onFitScale={onFitScale}/>
    <div className="lcr-lab-preview-footer">
      <div className="lcr-lab-action-group">
        <button className="lcr-lab-action lcr-lab-action--primary" type="button" data-testid="wave-play-pause"
          aria-label={doc.animation.running?'Pausar animação':'Reproduzir animação'} onClick={onRunning}>
          {doc.animation.running?<Pause size={16} aria-hidden="true"/>:<Play size={16} aria-hidden="true"/>}
          {doc.animation.running?'Pause':'Play'}
        </button>
        <button className="lcr-lab-action" type="button" data-testid="wave-reset" onClick={onReset}><RotateCcw size={15}/> Reset</button>
        <button className="lcr-lab-action" type="button" data-testid="wave-copy" onClick={onCopy}>
          {copyStatus==='Configuração copiada.'?<Check size={15}/>:<Copy size={15}/>} Copy Configuration
        </button>
      </div>
      <p className="lcr-lab-inline-status" role="status" aria-live="polite">{copyStatus|| (editing?'Edição ativa — animação pausada':doc.animation.running?'Animação ativa':'Animação pausada')}</p>
    </div>
  </section>
}
