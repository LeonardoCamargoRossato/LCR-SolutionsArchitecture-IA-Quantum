import { useEffect, useState } from 'react'
import { Copy, Download, Pencil, Plus, Trash2, X } from 'lucide-react'
import { id, parseConfiguration, type CompositionDocument, type StoredPreset } from '../editor/document-model'
import { localStore } from './local-store'
type Props={ doc:CompositionDocument; onLoad:(doc:CompositionDocument)=>void; onClose:()=>void }
export function PresetManager({doc,onLoad,onClose}:Props){
  const [presets,setPresets]=useState<StoredPreset[]>([])
  const [name,setName]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const refresh=async()=>setPresets(await localStore.listPresets())
  useEffect(()=>{void refresh().catch(e=>setMessage(String(e)))},[])
  const store=async(preset:StoredPreset)=>{
    setBusy(true)
    try{await localStore.putPreset(preset);await refresh();setMessage('Preset salvo no armazenamento local.') }
    catch(e){setMessage('Não foi possível salvar: '+String(e))}
    finally{setBusy(false)}
  }
  return <div className="lcr-v2-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section role="dialog" aria-modal="true" aria-labelledby="presets-title" className="lcr-v2-modal">
      <div className="lcr-v2-modal-heading"><div><h2 id="presets-title">Save Preset</h2><p>Salve e recupere composições no seu navegador (IndexedDB).</p></div>
        <button type="button" aria-label="Close Presets" onClick={onClose}><X size={18}/></button>
      </div>
      <div className="lcr-v2-preset-save">
        <label htmlFor="composition-preset-name">Preset Name</label>
        <input id="composition-preset-name" autoComplete="off" value={name} maxLength={80} onChange={e=>setName(e.target.value)}/>
        <button className="lcr-lab-action lcr-lab-action--primary" type="button" disabled={!name.trim()||busy}
          onClick={()=>{void store({id:id(),name:name.trim(),savedAt:new Date().toISOString(),document:structuredClone(doc)}).then(()=>setName(''))}}>
          <Plus size={15}/> Save
        </button>
      </div>
      <div className="lcr-v2-preset-items" aria-label="Saved Presets">
        {presets.length===0&&<p className="lcr-lab-hint">Nenhum preset salvo ainda.</p>}
        {presets.map(p=><div key={p.id} className="lcr-v2-preset-item">
          <div><strong>{p.name}</strong><small>{new Date(p.savedAt).toLocaleString('pt-BR')} · {p.document.canvas.width} × {p.document.canvas.height}</small></div>
          <div className="lcr-v2-inline-buttons">
            <button className="lcr-lab-action" type="button" onClick={()=>{try{onLoad(parseConfiguration(p.document));onClose()}catch(e){setMessage(String(e))}}}><Download size={14}/> Load</button>
            <button type="button" title="Rename" aria-label={`Rename ${p.name}`} onClick={()=>{
              const next=window.prompt('Novo nome do preset',p.name)
              if(next?.trim())void store({...p,name:next.trim().slice(0,80),savedAt:new Date().toISOString()})
            }}><Pencil size={14}/></button>
            <button type="button" title="Duplicate" aria-label={`Duplicate ${p.name}`} onClick={()=>{void store({...p,id:id(),name:p.name+' (copy)',savedAt:new Date().toISOString()})}}><Copy size={14}/></button>
            <button type="button" title="Delete" aria-label={`Delete ${p.name}`} onClick={()=>{
              if(window.confirm(`Excluir preset "${p.name}"? Esta ação não pode ser desfeita.`)) {
                setBusy(true)
                void localStore.removePreset(p.id).then(refresh).then(()=>setMessage('Preset excluído.')).catch(e=>setMessage(String(e))).finally(()=>setBusy(false))
              }
            }}><Trash2 size={14}/></button>
          </div>
        </div>)}
      </div>
      <p role="status" className="lcr-v2-dialog-status">{message}</p>
      <div className="lcr-v2-modal-actions"><button className="lcr-lab-action" type="button" onClick={onClose}>Close</button></div>
    </section>
  </div>
}
