import { createRoot } from 'react-dom/client'
import { ProjectsManager } from '../src/pages/admin/Admin'
import { ToastProvider } from '../src/providers/ToastProvider'
import { getSelectedWork } from '../src/data/selectedWork'
import { defaultProjects } from '../src/data/defaultProjects'
import { getAdditionalWork } from '../src/data/additionalWork'
import '../src/styles/theme.css'
import '../src/styles/global.css'
const other = { ...defaultProjects.find(p => p.slug === 'hamlet')!, id:'unmanaged-fixture',slug:'unmanaged-fixture',title:'Fixture unmanaged',visible:false }
createRoot(document.getElementById('root')!).render(<ToastProvider><ProjectsManager projects={[...getSelectedWork(), ...getAdditionalWork(), other]} onDirty={()=>{}} refresh={async()=>{}}/></ToastProvider>)
