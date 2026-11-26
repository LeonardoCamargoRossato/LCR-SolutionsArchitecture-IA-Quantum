import { createRoot } from 'react-dom/client'
import { ProjectsManager } from '../src/pages/admin/Admin'
import { ToastProvider } from '../src/providers/ToastProvider'
import { getSelectedWork } from '../src/data/selectedWork'
import { defaultProjects } from '../src/data/defaultProjects'
import '../src/styles/theme.css'
import '../src/styles/global.css'
const other = defaultProjects.find(p => p.slug === 'hamlet')!
createRoot(document.getElementById('root')!).render(<ToastProvider><ProjectsManager projects={[...getSelectedWork(), other]} onDirty={()=>{}} refresh={async()=>{}}/></ToastProvider>)
