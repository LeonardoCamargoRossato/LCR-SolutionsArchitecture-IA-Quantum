import { useEffect, useRef, useState, type DragEvent } from 'react'
import { ImagePlus, UploadCloud, X } from 'lucide-react'
import { validateBackground, type AcceptedImage } from './image-validation'

type Props = { onApply: (image: AcceptedImage) => Promise<void>; onClose: () => void; initial?: File | null }
export function AddBackgroundDialog({ onApply, onClose, initial }: Props) {
  const [candidate, setCandidate] = useState<AcceptedImage | null>(null)
  const [message, setMessage] = useState('')
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const drop = useRef<HTMLDivElement>(null)
  const latest = useRef<AcceptedImage | null>(null)
  const processing = useRef(0)
  useEffect(() => {
    latest.current = candidate
  }, [candidate])
  useEffect(() => () => {
    processing.current++
    if (latest.current?.preview) URL.revokeObjectURL(latest.current.preview)
  }, [])

  const choose = async (file: File | undefined) => {
    if (!file) return
    const token = ++processing.current
    setMessage('Validating…')
    try {
      const image = await validateBackground(file)
      if (token !== processing.current) { URL.revokeObjectURL(image.preview); return }
      setCandidate(previous => { if (previous) URL.revokeObjectURL(previous.preview); return image })
      setMessage(`File Selected · ${file.name} · ${(file.size/1024/1024).toFixed(2)} MB`)
    } catch(e) { setMessage(e instanceof Error ? e.message : 'Imagem inválida.') }
  }
  useEffect(() => { if (initial) void choose(initial) }, [initial])
  useEffect(() => {
    const paste = (event: ClipboardEvent) => {
      if (!drop.current?.contains(document.activeElement) && !(event.target instanceof Element && event.target.closest('.lcr-v2-modal'))) return
      const image = [...(event.clipboardData?.items || [])].find(item => item.type.startsWith('image/'))
      if (image?.getAsFile()) {
        event.preventDefault()
        const raw = image.getAsFile()!
        const ext = raw.type === 'image/jpeg' ? 'jpg' : raw.type === 'image/webp' ? 'webp' : 'png'
        void choose(new File([raw], `screenshot-${Date.now()}.${ext}`, { type: raw.type }))
      } else setMessage('Nenhuma imagem válida encontrada na área de transferência.')
    }
    document.addEventListener('paste', paste)
    return () => document.removeEventListener('paste', paste)
  }, [])

  const dropped = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    void choose(event.dataTransfer.files[0])
  }
  return (
    <div className="lcr-v2-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="lcr-v2-modal" role="dialog" aria-modal="true" aria-labelledby="background-modal-title">
        <div className="lcr-v2-modal-heading">
          <div><h2 id="background-modal-title">Add Background</h2><p>Import a screenshot or image to use as your composition reference.</p></div>
          <button type="button" onClick={onClose} aria-label="Close Add Background"><X size={18}/></button>
        </div>
        <div ref={drop} tabIndex={0} className={`lcr-v2-dropzone ${dragging ? 'is-dragging' : ''}`}
          aria-label="Área para importar ou colar screenshot"
          onDragEnter={e=>{e.preventDefault(); setDragging(true)}} onDragOver={e=>e.preventDefault()}
          onDragLeave={e=>{e.preventDefault(); setDragging(false)}} onDrop={dropped}>
          <UploadCloud size={31} aria-hidden="true" />
          <strong>Drag &amp; drop your image here</strong>
          <span>or</span>
          <button type="button" className="lcr-lab-action" onClick={()=>input.current?.click()}><ImagePlus size={16}/> Browse Files</button>
          <span>Paste Screenshot — Ctrl+V</span>
          <small>PNG · JPG · JPEG · WebP · Até 12 MB</small>
          <input ref={input} type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" hidden
            onChange={e=>{void choose(e.target.files?.[0]); e.target.value=''}}/>
        </div>
        {candidate && <div className="lcr-v2-file-preview">
          <img src={candidate.preview} alt="Prévia do background selecionado"/>
          <div><strong>{candidate.file.name}</strong><span>{candidate.width} × {candidate.height} px</span></div>
          <button type="button" className="lcr-lab-action" onClick={()=>input.current?.click()}>Replace</button>
        </div>}
        <p role="status" aria-live="polite" className="lcr-v2-dialog-status">{message}</p>
        <div className="lcr-v2-modal-actions">
          <button className="lcr-lab-action" type="button" onClick={onClose}>Cancel</button>
          <button className="lcr-lab-action lcr-lab-action--primary" disabled={!candidate || busy} type="button" onClick={async()=>{
            if(!candidate)return
            setBusy(true)
            try {await onApply(candidate); onClose()} catch(e) {setMessage(e instanceof Error?e.message:'Falha ao aplicar background.')} finally {setBusy(false)}
          }}>Apply Background</button>
        </div>
      </section>
    </div>
  )
}
