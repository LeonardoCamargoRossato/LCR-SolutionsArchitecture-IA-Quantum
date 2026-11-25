import { memo, type CSSProperties } from 'react'
import { PortalCircuitLights } from '../../../components/loading-portal/v2/PortalCircuitLights'
import { PortalProgressCounter } from '../../../components/loading-portal/v2/PortalProgressCounter'
import { PORTAL_ASSET_BASE, PORTAL_GEOMETRY, type PortalVariant } from '../../../components/loading-portal/v2/portalGeometry'
import { clamp, type PortalMotionSettings } from './portal-motion-settings'
import './portal-motion-editor.css'

const Lights = memo(PortalCircuitLights)
type Props = {variant: PortalVariant; position:number; progress:number; settings:PortalMotionSettings; playing:boolean; activated:boolean; assetsReady:boolean; reduced:boolean}
const sprite = (b:number[],w:number,h:number):CSSProperties => ({left:b[0]/w*100+'%',top:b[1]/h*100+'%',width:(b[2]-b[0])/w*100+'%',height:(b[3]-b[1])/h*100+'%'})

/** Pure controlled composition. No loading timer, no global state, no Home mutation. */
export function PortalMotionPreview({variant,position,progress,settings,playing,activated,assetsReady,reduced}:Props) {
  const g=PORTAL_GEOMETRY[variant], w=g.width, h=g.height, p=clamp(position,0,1)
  const leftExit=(Math.max(g.left.contentBbox[2],g.core.contentBbox[2])/w*100+2)
  const rightExit=((w-g.right.contentBbox[0])/w*100+2)
  const [cx,cy]=g.coreCenter
  const style={ '--pme-left':-p*leftExit+'%', '--pme-right':p*rightExit+'%',
    '--pme-overlay-opacity':Math.max(0,1-p*18), '--pme-activation':activated&&!reduced?settings.lightIntensity:0,
    '--pme-light-intensity':settings.lightIntensity, '--pme-seam-x':g.splitX/w*100+'%',
  } as CSSProperties
  return <div className="pme-portal" data-testid="portal-editor-preview" data-position={p.toFixed(4)} data-ready={assetsReady} style={style}>
    <div className="pme-leaf pme-right" data-testid="portal-editor-right">
      <img alt="" draggable={false} src={PORTAL_ASSET_BASE+g.right.path} style={sprite(g.right.bbox,w,h)}/>
    </div>
    <div className="pme-leaf pme-left" data-testid="portal-editor-left">
      <img alt="" draggable={false} src={PORTAL_ASSET_BASE+g.left.path} style={sprite(g.left.bbox,w,h)}/>
      <img alt="" draggable={false} data-testid="portal-editor-core" src={PORTAL_ASSET_BASE+g.core.path} style={sprite(g.core.bbox,w,h)}/>
    </div>
    {p===0 && <img className="pme-reference" data-testid="portal-editor-background" alt="" draggable={false} src={PORTAL_ASSET_BASE+g.reference}/>}
    <div className="pme-decoration">
      <Lights variant={variant} playing={playing&&p===0} speed={settings.lightSpeed} intensity={settings.lightIntensity} ready={activated} reducedMotion={reduced}/>
      {settings.showCounter&&<PortalProgressCounter variant={variant} progress={progress} ready={progress>=100}/>}
    </div>
    <div className="pme-activation" style={sprite([cx-95*g.transform.scale_x,cy-95*g.transform.scale_y,cx+95*g.transform.scale_x,cy+95*g.transform.scale_y],w,h)}/>
    <div className="pme-seam"/>
  </div>
}
