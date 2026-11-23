import { useRef, useState, type DragEvent } from 'react'
import { Code2, FileCode2, Info, UploadCloud, X } from 'lucide-react'
export type ImportFileKind = 'tsx' | 'css' | 'ts'
export type ImportedFiles = Partial<Record<ImportFileKind, File>>
const TYPES: { id:ImportFileKind; title:string; required:boolean; explanation:string }[] = [
  { id:'tsx',title:'Component File',required:true,explanation:'Componente React responsável pela renderização e pelo comportamento.' },
  { id:'css',title:'Style File',required:false,explanation:'Estilos visuais associados.' },
  { id:'ts',title:'Types / Preset File',required:false,explanation:'Tipos, contratos e parâmetros auxiliares.' },
]
const maxSize=1024*1024
const extension=(name:string):ImportFileKind|null=> {
  const ext=name.split('.').pop()?.toLowerCase()
  return ext==='tsx'||ext==='css'||ext==='ts'?ext:null
}
type Props={ files:ImportedFiles; onFiles:(files:ImportedFiles)=>void; onClose:()=>void }
export function ImportAnimationDialog({files,onFiles,onClose}:Props){
  const [status,setStatus]=useState('Awaiting Review')
  const [error,setError]=useState('')
  const [info,setInfo]=useState(false)
  const [active,setActive]=useState<ImportFileKind|null>(null)
  const [duplicates,setDuplicates]=useState<File[]>([])
  const refs=useRef<Partial<Record<ImportFileKind,HTMLInputElement|null>>>({})
  function accept(file:File,expected?:ImportFileKind) {
    const kind=extension(file.name)
    if(!kind || (expected && expected!==kind)) {setError(expected?`Formato incorreto: o campo requer .${expected}.`:'Aceitos apenas .tsx, .css e .ts.');return}
    if(file.size===0||file.size>maxSize) {setError('Cada arquivo precisa ter até 1 MB.');return}
    setStatus('Validating')
    onFiles({...files,[kind]:file})
    setStatus('File Selected · Awaiting Review')
    setError('')
  }
  function routeDropped(event:DragEvent,expected?:ImportFileKind){
    event.preventDefault();event.stopPropagation()
    setActive(null)
    const incoming=[...event.dataTransfer.files]
    if(expected){if(incoming.length!==1){setError('Solte um arquivo de cada vez neste campo.');return} accept(incoming[0],expected);return}
    const selected:ImportedFiles={...files}
    const clashes:File[]=[]
    for(const file of incoming){
      const kind=extension(file.name)
      if(!kind||file.size===0||file.size>maxSize){setError('Arraste arquivos .tsx, .css e .ts com até 1 MB.');return}
      if(selected[kind])clashes.push(file)
      else selected[kind]=file
    }
    onFiles(selected)
    setStatus('File Selected · Awaiting Review')
    setDuplicates(clashes)
    if(clashes.length)setError('Há mais de um arquivo do mesmo tipo. Escolha o arquivo desejado abaixo.')
    else setError('')
  }
  return <div className="lcr-v2-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="lcr-v2-modal lcr-v2-import-modal" role="dialog" aria-modal="true" aria-labelledby="animation-modal-title"
      onDragOver={e=>{e.preventDefault()}} onDrop={e=>routeDropped(e)}>
      <div className="lcr-v2-modal-heading">
        <div><h2 id="animation-modal-title">Import Animation</h2><p>Add a React animation component and its supporting files.</p></div>
        <div className="lcr-v2-inline-buttons"><button aria-label="Info about import formats" type="button" onClick={()=>setInfo(true)}><Info size={18}/></button>
          <button aria-label="Close Import Animation" onClick={onClose} type="button"><X size={18}/></button></div>
      </div>
      <p className="lcr-v2-import-warning"><Code2 size={15}/> Arquivos enviados são preservados para inspeção/exportação. Código não confiável nunca é executado aqui.</p>
      <div className="lcr-v2-import-slots">
        {TYPES.map(type=><div key={type.id} className={`lcr-v2-import-slot ${active===type.id?'is-dragging':''}`}
          onDragEnter={e=>{e.preventDefault();setActive(type.id)}} onDragLeave={e=>{e.preventDefault();setActive(null)}}
          onDragOver={e=>{e.preventDefault();e.stopPropagation()}} onDrop={e=>routeDropped(e,type.id)}>
          <div><strong>{type.title}{type.required?' — Required':' — Optional'}</strong><span>Drag &amp; drop .{type.id} file here</span></div>
          <FileCode2 size={21} aria-hidden="true"/>
          <input type="file" hidden accept={'.'+type.id} ref={node=>{refs.current[type.id]=node}}
            onChange={e=>{if(e.target.files?.[0])accept(e.target.files[0],type.id);e.target.value=''}}/>
          <div className="lcr-v2-slot-actions">
            <button className="lcr-lab-action" onClick={()=>refs.current[type.id]?.click()} type="button"><UploadCloud size={14}/> Browse Files</button>
            {files[type.id]&&<button type="button" className="lcr-lab-action" onClick={()=>{const next={...files};delete next[type.id];onFiles(next);setStatus('Awaiting Review')}}>Remove</button>}
          </div>
          {files[type.id]&&<small className="lcr-v2-import-selected">File Selected · {files[type.id]!.name} ({(files[type.id]!.size/1024).toFixed(1)} KB)</small>}
        </div>)}
      </div>
      {duplicates.length>0&&<div className="lcr-v2-duplicate-picker"><strong>Escolha qual arquivo utilizar:</strong>
        {duplicates.map((file,i)=><button className="lcr-lab-action" type="button" key={i} onClick={()=>{accept(file);setDuplicates(ds=>ds.filter((_,index)=>index!==i))}}>
          Usar {file.name} em vez do arquivo atual</button>)}
      </div>}
      <p className="lcr-v2-dialog-status" role="status">{error||status}</p>
      <div className="lcr-v2-modal-actions"><button type="button" className="lcr-lab-action" onClick={onClose}>Close</button>
        <button className="lcr-lab-action lcr-lab-action--primary" type="button" disabled={!files.tsx} onClick={()=>{setStatus('Imported · Awaiting Review');onClose()}}>
          Save Files for Review
        </button>
      </div>
      {info&&<div className="lcr-v2-info-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setInfo(false)}}>
        <div className="lcr-v2-format-info" role="dialog" aria-modal="true" aria-labelledby="import-info-title">
          <h3 id="import-info-title">File Formats &amp; Safety</h3>
          {TYPES.map(t=><p key={t.id}><strong>{t.id.toUpperCase()}:</strong> {t.explanation}</p>)}
          <p>Componentes podem exigir dependências, imagens e outros arquivos. Anexar não significa que podem ser executados: uma revisão do Builder é necessária.</p>
          <button className="lcr-lab-action" type="button" onClick={()=>setInfo(false)}>Close Info</button>
        </div>
      </div>}
    </section>
  </div>
}
