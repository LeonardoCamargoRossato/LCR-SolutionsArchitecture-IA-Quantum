// CI-only instrumentation. Do not run against a production checkout used for deployment.
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
const root=process.argv[2]
if(!root)throw Error('Specify isolated benchmark worktree')
const points=[
 ['src/components/loading-portal/v2/LoadingPortalV2.tsx','  const root = useRef','scene'],
 ['src/components/loading-portal/v2/PortalProgressCounter.tsx','  const g = PORTAL_GEOMETRY','counter'],
 ['src/components/loading-portal/v2/PortalCircuitLights.tsx','  const geo = PORTAL_GEOMETRY','lights'],
 ['src/components/loading-portal/v2/PortalDoorOpening.tsx','  const { stage, variant, open, paused','leaves'],
 ['src/components/loading-portal/v2/PortalStaticBackground.tsx','  return <img','background'],
 ['src/features/home-loading/HomeBootCoordinator.tsx','  const location=useLocation()','coordinator'],
]
for(const [path,anchor,key] of points){
 const file=resolve(root,path),s=readFileSync(file,'utf8')
 if(s.split(anchor).length!==2)throw Error('Missing/ambiguous instrumentation point '+path)
 writeFileSync(file,s.replace(anchor,`  { const counts = (globalThis as typeof globalThis & {__portalRenderCounts?:Record<string,number>}).__portalRenderCounts; if(counts) counts['${key}']=(counts['${key}']??0)+1 }\n`+anchor))
}
