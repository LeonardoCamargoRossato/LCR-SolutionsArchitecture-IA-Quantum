import { useEffect,useRef } from 'react'
type Props={label:string;value:string;onChange:(value:string)=>void;minHeight?:number}
export function RichTextEditor({label,value,onChange,minHeight=150}:Props){
 const ref=useRef<HTMLDivElement>(null)
 useEffect(()=>{if(ref.current&&ref.current.innerHTML!==value)ref.current.innerHTML=value||''},[value])
 const cmd=(name:string,arg?:string)=>{document.execCommand(name,false,arg);ref.current?.focus();onChange(ref.current?.innerHTML??'')}
 return <label className="rich-field"><span>{label}</span><div className="rich-toolbar">
   <button type="button" onClick={()=>cmd('bold')}><b>B</b></button><button type="button" onClick={()=>cmd('italic')}><i>I</i></button><button type="button" onClick={()=>cmd('underline')}><u>U</u></button>
   <button type="button" onClick={()=>cmd('formatBlock','h3')}>H</button><button type="button" onClick={()=>cmd('formatBlock','p')}>P</button>
   <button type="button" onClick={()=>cmd('insertUnorderedList')}>• List</button><button type="button" onClick={()=>cmd('insertOrderedList')}>1. List</button>
   <button type="button" onClick={()=>{const u=window.prompt('Link URL');if(u)cmd('createLink',u)}}>Link</button>
   <select aria-label="Font family" onChange={e=>cmd('fontName',e.target.value)} defaultValue=""><option value="" disabled>Font</option><option value="Inter">Default</option><option value="Arial">Sans Serif</option><option value="Georgia">Serif</option><option value="monospace">Monospace</option></select>
 </div><div ref={ref} className="rich-editor" style={{minHeight}} contentEditable suppressContentEditableWarning onInput={e=>onChange(e.currentTarget.innerHTML)}/></label>
}
