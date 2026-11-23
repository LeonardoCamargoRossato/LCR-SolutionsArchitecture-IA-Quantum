import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, FileInput, FileOutput, FileArchive, FlaskConical, ImagePlus, Maximize, Minus, Plus, Save, Type, UploadCloud, ZoomIn, ZoomOut } from 'lucide-react'
import { EditorProperties } from '../features/test-component-lab/editor/EditorProperties'
import { LabPreview } from '../features/test-component-lab/components/LabPreview'
import { LoadingPortalLab } from '../features/test-component-lab/loading-portal/LoadingPortalLab'
import { AddBackgroundDialog } from '../features/test-component-lab/background/AddBackgroundDialog'
import { ImportAnimationDialog, type ImportedFiles } from '../features/test-component-lab/import/ImportAnimationDialog'
import { PresetManager } from '../features/test-component-lab/presets/PresetManager'
import { localStore } from '../features/test-component-lab/presets/local-store'
import { download, } from '../features/test-component-lab/export/zip-store'
import { downloadJson, downloadPackage, previewPng } from '../features/test-component-lab/export/composition-export'
import { CANVAS_SIZES, defaultDocument, heroPreset, id, parseConfiguration, type CanvasRatio, type CompositionDocument, type TextKind, type TextOverlay } from '../features/test-component-lab/editor/document-model'
import { clampWaveSettings, WAVE_PRESETS, type PreviewSurface, type WavePresetId, type WaveSettings } from '../components/test-component-lab/particle-wave/particle-wave-types'
import '../features/test-component-lab/styles/test-component-lab.css'
import '../features/test-component-lab/styles/editor-v2.css'

type Dialog = 'background' | 'import' | 'preset' | null
export function TestComponentLab() {
  const [activeComponent,setActiveComponent] = useState<'particle-wave' | 'loading-portal'>('particle-wave')
  const [doc,setDoc] = useState<CompositionDocument>(()=>structuredClone(defaultDocument))
  const [displayedCount,setDisplayedCount] = useState(doc.settings.particleCount)
  const [selected,setSelected] = useState<string|null>(null)
  const [editing,setEditing] = useState(false)
  const [dialog,setDialog] = useState<Dialog>(null)
  const [fileCandidate,setFileCandidate] = useState<File|null>(null)
  const [imported,setImported] = useState<ImportedFiles>({})
  const [imageUrl,setImageUrl] = useState<string|null>(null)
  const [imageBlob,setImageBlob] = useState<Blob|null>(null)
  const imageUrlRef=useRef<string|null>(null)
  const imageIdRef=useRef<string|null>(null)
  const [zoom,setZoom] = useState<number|null>(null)
  const [fitScale,setFitScale] = useState(.5)
  const [copyStatus,setCopyStatus] = useState('')
  const [busy,setBusy] = useState(false)
  const inputJson=useRef<HTMLInputElement>(null)
  const [textKind,setTextKind] = useState<TextKind>('title')
  const setImage=useCallback((url:string|null,blob:Blob|null,key:string|null)=>{
    if(imageUrlRef.current)URL.revokeObjectURL(imageUrlRef.current)
    imageUrlRef.current=url;imageIdRef.current=key
    setImageUrl(url);setImageBlob(blob)
  },[])
  useEffect(()=>()=>{if(imageUrlRef.current)URL.revokeObjectURL(imageUrlRef.current)},[])
  useEffect(()=>{
    const previous=document.title
    document.title='LCR Test Component Lab V2 | Visual Editor'
    return()=>{document.title=previous}
  },[])
  useEffect(()=>{
    if(displayedCount===doc.settings.particleCount)return
    const timeout=window.setTimeout(()=>setDoc(current=>({...current,settings:clampWaveSettings({...current.settings,particleCount:displayedCount})})),170)
    return()=>window.clearTimeout(timeout)
  },[displayedCount,doc.settings.particleCount])
  useEffect(()=>{
    const key=doc.background?.id||null
    if(key===imageIdRef.current)return
    let alive=true
    if(!key){setImage(null,null,null);return}
    void localStore.getImage(key).then(blob=>{
      if(!alive)return
      if(!blob){setImage(null,null,key);setCopyStatus('Background não encontrado neste navegador. Importe novamente a imagem.');return}
      setImage(URL.createObjectURL(blob),blob,key)
    }).catch(()=>{if(alive)setCopyStatus('IndexedDB indisponível: não foi possível recuperar o background.')})
    return()=>{alive=false}
  },[doc.background?.id,setImage])

  const applyBackground=async(image:{file:File;width:number;height:number})=>{
    const key=id()
    await localStore.putImage(key,image.file)
    setImage(URL.createObjectURL(image.file),image.file,key)
    setDoc(current=>({...current,background:{
      id:key,name:image.file.name,mime:image.file.type,width:image.width,height:image.height,
      fit:'contain',opacity:1,
    }}))
    setCopyStatus('Background aplicado e preservado no armazenamento local.')
  }
  const requestBackground=(file?:File)=>{
    if(doc.background && !window.confirm('Substituir o background existente? O arquivo original continuará preservado no armazenamento local.'))return
    setFileCandidate(file||null)
    setDialog('background')
  }
  const removeBackground=()=>{setDoc(current=>({...current,background:null}));setImage(null,null,null);setCopyStatus('Background removido da composição. O original não foi apagado.')}

  const loadDocument=(next:CompositionDocument)=>{
    setDoc(next);setDisplayedCount(next.settings.particleCount);setEditing(false);setSelected(null);setZoom(null)
    setCopyStatus('Configuração V2 carregada. Confira os recursos locais antes de exportar.')
  }
  const choosePreset=(preset:WavePresetId)=>{
    const settings={...WAVE_PRESETS[preset]}
    setDoc(current=>({...current,preset,settings,surface:preset==='lcr-dark'?'dark':'light'}))
    setDisplayedCount(settings.particleCount)
    setCopyStatus('')
  }
  function updateSetting<K extends keyof WaveSettings>(key:K,value:WaveSettings[K]){
    setDoc(current=>({...current,settings:clampWaveSettings({...current.settings,[key]:value})}))
    setCopyStatus('')
  }
  const reset=()=>{
    const base={...WAVE_PRESETS[doc.preset]}
    setDoc(current=>({...current,settings:base,surface:current.preset==='lcr-dark'?'dark':'light'}))
    setDisplayedCount(base.particleCount)
    setCopyStatus('Parâmetros originais restaurados.')
  }
  const setSurface=(surface:PreviewSurface)=>{
    setDoc(current=>({...current,surface,settings:surface==='transparent'?current.settings:{...current.settings,background:surface==='dark'?'#080f1e':'#f6f9ff'}}))
  }
  const togglePlaying=()=>{
    setEditing(false)
    setDoc(current=>({...current,animation:{...current.animation,running:editing?true:!current.animation.running}}))
    setCopyStatus('')
  }
  const enterEditing=()=>{
    setEditing(true)
    setDoc(current=>({...current,animation:{...current.animation,running:false}}))
  }
  const copyConfig=async()=>{
    try{
      await navigator.clipboard.writeText(JSON.stringify(doc,null,2))
      setCopyStatus('Configuração copiada.')
    }catch{setCopyStatus('Não foi possível copiar. Permita a área de transferência e tente novamente.')}
  }
  const loadConfig=async(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0]
    event.target.value=''
    if(!file)return
    try{
      if(file.size>2_000_000)throw Error('JSON excede 2 MB.')
      loadDocument(parseConfiguration(JSON.parse(await file.text())))
    }catch(e){setCopyStatus(e instanceof Error?e.message:'Configuração inválida.')}
  }
  const sizePreset=(ratio:CanvasRatio)=>{
    setDoc(current=>{
      if(ratio==='custom')return {...current,canvas:{...current.canvas,aspectRatio:ratio,lockAspectRatio:false}}
      const size=CANVAS_SIZES[ratio]
      return {...current,canvas:{...size,aspectRatio:ratio,lockAspectRatio:true}}
    })
    setZoom(null)
  }
  const dimension=(axis:'width'|'height',value:number)=>{
    const next=Math.round(Math.max(axis==='width'?240:160,Math.min(4096,value||1)))
    setDoc(current=>{
      const canvas={...current.canvas,[axis]:next,aspectRatio:'custom' as const}
      if(current.canvas.lockAspectRatio){
        const ratio=current.canvas.width/current.canvas.height
        if(axis==='width')canvas.height=Math.round(next/ratio)
        else canvas.width=Math.round(next*ratio)
      }
      return {...current,canvas}
    })
  }
  const addText=()=>{
    const texts=doc.texts
    if(texts.length>=20){setCopyStatus('Limite de 20 textos por composição.');return}
    const label=textKind==='title'?'Título editável':textKind==='subtitle'?'Subtítulo editável':'Seu texto'
    const next:TextOverlay={id:id(),kind:textKind,content:label,
      transform:{x:100,y:100+texts.length*75,width:Math.min(800,doc.canvas.width-120),height:90,
        rotation:0,flipX:false,flipY:false,lockX:false,lockY:false,lockAspectRatio:false},
      font:'sans',fontSize:textKind==='title'?52:textKind==='subtitle'?32:22,
      color:doc.surface==='light'?'#123d76':'#ffffff',align:'left'}
    setDoc(current=>({...current,texts:[...current.texts,next],layers:[...current.layers,{
      id:next.id,kind:'text',name:`Text: ${textKind}`,visible:true,locked:false,
      order:Math.max(1,...current.layers.filter(l=>l.kind!=='guides').map(l=>l.order))+1,
    }]}))
    setSelected(next.id);enterEditing()
  }
  const exportAction=async(kind:'png'|'zip')=>{
    setBusy(true)
    try{
      if(kind==='png') {
        const canvas=document.querySelector<HTMLCanvasElement>('[data-testid="particle-wave-canvas"]')
        download(await previewPng({doc,imageUrl,sourceCanvas:canvas,backgroundBlob:imageBlob}),'lcr-composition-preview-v2.png')
      }else await downloadPackage(doc,imported,imageBlob)
      setCopyStatus(kind==='png'?'PNG exportado sem guias e alças.':'ZIP exportado com fontes originais e configuração.')
    }catch(e){setCopyStatus('Exportação falhou: '+(e instanceof Error?e.message:String(e)))}
    finally{setBusy(false)}
  }
  return <main className="lcr-lab lcr-v2" data-testid="test-component-lab">
    <a className="lcr-lab-skip-link" href="#lab-preview-title">Pular para visualização</a>
    <div className="lcr-lab-shell">
      <header className="lcr-lab-header">
        <div className="lcr-lab-brand"><div className="lcr-lab-mark" aria-hidden="true"><FlaskConical size={24}/></div>
          <div><h1>LCR Test Component Lab</h1><p>Visual Composition &amp; Animation Editor · V2</p></div></div>
        <Link to="/" className="lcr-lab-back"><ArrowLeft size={16}/> Retornar ao LCR Portfolio</Link>
      </header>
      <div className="lcr-lab-component-switch" role="group" aria-label="Componente do laboratório" data-testid="lab-component-switch">
        <button type="button" aria-pressed={activeComponent==='particle-wave'}
          onClick={()=>{setActiveComponent('particle-wave');setDialog(null)}}>Particle Wave</button>
        <button type="button" aria-pressed={activeComponent==='loading-portal'}
          onClick={()=>{setActiveComponent('loading-portal');setDialog(null)}}>Loading Portal</button>
      </div>
      {activeComponent==='particle-wave' ? <>
      <div className="lcr-v2-toolbar" aria-label="Editor toolbar">
        <div className="lcr-v2-toolbar-row">
          <label>Canvas Size<select aria-label="Canvas Size" value={doc.canvas.aspectRatio}
            onChange={e=>sizePreset(e.target.value as CanvasRatio)}>
            <option value="16:9">Desktop 16:9 · 1600×900</option>
            <option value="16:4">Wide 16:4 · 1600×400</option>
            <option value="4:3">Standard 4:3 · 1200×900</option>
            <option value="1:1">Square 1:1 · 1000×1000</option>
            <option value="custom">Custom</option>
          </select></label>
          <label>Width <input aria-label="Canvas Width" type="number" min="240" max="4096" value={doc.canvas.width}
            onChange={e=>dimension('width',Number(e.target.value))}/></label>
          <label>Height <input aria-label="Canvas Height" type="number" min="160" max="4096" value={doc.canvas.height}
            onChange={e=>dimension('height',Number(e.target.value))}/></label>
          <label className="lcr-v2-inline-check"><input type="checkbox" checked={doc.canvas.lockAspectRatio}
            onChange={e=>setDoc(c=>({...c,canvas:{...c.canvas,lockAspectRatio:e.target.checked}}))}/>Lock Aspect Ratio</label>
          <label>Units<select aria-label="Ruler Units" value={doc.units} onChange={e=>setDoc(c=>({...c,units:e.target.value as CompositionDocument['units']}))}>
            <option value="grid">Grid Units</option><option value="px">Pixels</option><option value="percent">Percentual</option>
          </select></label>
          <label className="lcr-v2-inline-check"><input type="checkbox" checked={doc.gridVisible}
            onChange={e=>setDoc(c=>({...c,gridVisible:e.target.checked}))}/>Grid</label>
          <label className="lcr-v2-inline-check"><input type="checkbox" checked={doc.rulersVisible}
            onChange={e=>setDoc(c=>({...c,rulersVisible:e.target.checked}))}/>Rulers</label>
          <div className="lcr-v2-zoom-tools">
            <button type="button" className="lcr-lab-action" onClick={()=>setZoom(null)}><Maximize size={14}/> Fit to Screen</button>
            <button type="button" className="lcr-lab-action" aria-label="Zoom Out" onClick={()=>setZoom(Math.max(.08,(zoom??fitScale)/1.25))}><ZoomOut size={15}/></button>
            <button type="button" className="lcr-lab-action" aria-label="Zoom In" onClick={()=>setZoom(Math.min(3,(zoom??fitScale)*1.25))}><ZoomIn size={15}/></button>
            <button type="button" className="lcr-lab-action" onClick={()=>setZoom(null)}>Reset Zoom</button>
          </div>
        </div>
        <div className="lcr-v2-toolbar-row lcr-v2-toolbar-row--actions">
          <button type="button" className="lcr-lab-action lcr-lab-action--primary" onClick={()=>requestBackground()}><ImagePlus size={16}/> Add Background</button>
          <button type="button" className="lcr-lab-action" onClick={()=>setDialog('import')}><UploadCloud size={16}/> Import Animation</button>
          <label className="lcr-v2-add-text">Text<select aria-label="Text Type" value={textKind} onChange={e=>setTextKind(e.target.value as TextKind)}>
            <option value="title">Title</option><option value="subtitle">Subtitle</option><option value="free">Free Text</option>
          </select></label>
          <button className="lcr-lab-action" type="button" onClick={addText}><Type size={16}/> Add Text</button>
          <button className="lcr-lab-action" type="button" onClick={()=>{loadDocument(heroPreset());setCopyStatus('Preset LCR Hero carregado.')}}>LCR Hero</button>
          <button className="lcr-lab-action" type="button" onClick={()=>setDialog('preset')}><Save size={16}/> Save Preset</button>
          <button className="lcr-lab-action" type="button" onClick={()=>inputJson.current?.click()}><FileInput size={16}/> Import Configuration</button>
          <input ref={inputJson} hidden type="file" accept=".json,application/json" onChange={e=>{void loadConfig(e)}} />
          <button className="lcr-lab-action" type="button" onClick={()=>downloadJson(doc)}><Download size={16}/> Download Configuration</button>
          <button className="lcr-lab-action" type="button" disabled={busy} onClick={()=>{void exportAction('zip')}}><FileArchive size={16}/> Download Component Package</button>
          <button className="lcr-lab-action" type="button" disabled={busy} onClick={()=>{void exportAction('png')}}><FileOutput size={16}/> Export Preview PNG</button>
        </div>
      </div>
      <div className="lcr-v2-intro"><span>Visual Editor · <strong>Particle Wave</strong></span><span>Double-click to select · Drag to move · Handles to resize/rotate</span></div>
      <div className="lcr-lab-workspace">
        <LabPreview doc={doc} setDoc={setDoc} selected={selected} select={setSelected}
          imageUrl={imageUrl} editing={editing} enterEditing={enterEditing}
          zoom={zoom} onZoom={setZoom} onFitScale={setFitScale}
          onDroppedImage={requestBackground} onPasteImage={requestBackground}
          copyStatus={copyStatus} onRunning={togglePlaying} onReset={reset} onCopy={()=>{void copyConfig()}} onSurface={setSurface}/>
        <EditorProperties doc={doc} update={setDoc} selected={selected} select={setSelected}
          displayedCount={displayedCount} setDisplayedCount={setDisplayedCount}
          onPreset={choosePreset} onSetting={updateSetting} onRemoveBackground={removeBackground} onEdit={enterEditing}/>
      </div>
      </> : <LoadingPortalLab />}
      <footer className="lcr-lab-footer"><span>Local rendering · IndexedDB · No authentication · Imported code never executes</span><span>V2 / LCR Workflow</span></footer>
    </div>
    {dialog==='background'&&<AddBackgroundDialog initial={fileCandidate} onClose={()=>{setDialog(null);setFileCandidate(null)}} onApply={applyBackground}/>}
    {dialog==='import'&&<ImportAnimationDialog files={imported} onFiles={setImported} onClose={()=>{setDialog(null);setCopyStatus('Imported · Awaiting Review: arquivos preservados sem execução.')}}/>}
    {dialog==='preset'&&<PresetManager doc={doc} onLoad={loadDocument} onClose={()=>setDialog(null)}/>}
  </main>
}
