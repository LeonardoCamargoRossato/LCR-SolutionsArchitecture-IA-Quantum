import { createContext,useCallback,useContext,useMemo,useState,type ReactNode } from 'react'
type Toast={id:string;type:'success'|'error'|'info';title:string;message?:string}
type ToastApi={success:(title:string,message?:string)=>void;error:(title:string,message?:string)=>void;info:(title:string,message?:string)=>void}
const C=createContext<ToastApi|undefined>(undefined)
export function ToastProvider({children}:{children:ReactNode}){
  const[items,setItems]=useState<Toast[]>([])
  const push=useCallback((type:Toast['type'],title:string,message?:string)=>{const id=crypto.randomUUID();setItems(v=>[...v,{id,type,title,message}]);window.setTimeout(()=>setItems(v=>v.filter(x=>x.id!==id)),4200)},[])
  const api=useMemo(()=>({success:(t:string,m?:string)=>push('success',t,m),error:(t:string,m?:string)=>push('error',t,m),info:(t:string,m?:string)=>push('info',t,m)}),[push])
  return <C.Provider value={api}>{children}<div className="toast-stack" aria-live="polite">{items.map(t=><div key={t.id} className={`toast toast-${t.type}`}><strong>{t.title}</strong>{t.message&&<span>{t.message}</span>}<button onClick={()=>setItems(v=>v.filter(x=>x.id!==t.id))} aria-label="Close notification">×</button></div>)}</div></C.Provider>
}
export function useToast(){const v=useContext(C);if(!v)throw new Error('ToastProvider missing');return v}
