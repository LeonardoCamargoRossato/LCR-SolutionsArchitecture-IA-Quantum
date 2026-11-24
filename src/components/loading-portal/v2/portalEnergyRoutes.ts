// Coordinates use the approved 1672x941 Drawer master. These are luminous
// travelling accents, NOT new permanent lines or edits to the canonical art.
// Existing circuit/fissure segments are joined by short transfer segments
// into the central orbit. Portrait variants clip the incoming route to their
// own visible edge instead of spending most of the charge off-screen.
export type EnergyPoint = readonly [number,number]
const CENTER: EnergyPoint = [839.5,445.5]
export const ENERGY_ORBIT_CENTER = CENTER
export const ENERGY_ORBIT_RADIUS = 95
export const ENERGY_ROUTES: readonly {id:string; points:readonly EnergyPoint[]}[] = [
  {id:'north-west',points:[[245,49],[176,49],[99,125],[99,300],[144,344],[242,359],[397,359],[454,417],[608,417],[744.5,445.5]]},
  {id:'south-west',points:[[145,779],[103,737],[103,591],[145,546],[243,518],[483,518],[541,459],[600,459],[744.5,445.5]]},
  {id:'north-east',points:[[1407,49],[1475,49],[1552,125],[1552,300],[1507,344],[1427,359],[1254,359],[1198,417],[1051,417],[934.5,445.5]]},
  {id:'south-east',points:[[1507,780],[1547,736],[1547,591],[1508,546],[1428,518],[1170,518],[1110,459],[1054,459],[934.5,445.5]]},
  {id:'upper-left',points:[[471,175],[572,175],[710,296],[772.325,378.325]]},
  {id:'upper-right',points:[[1180,175],[1075,175],[943,296],[906.675,378.325]]},
  {id:'lower-left',points:[[475,713],[568,713],[688,594],[772.325,512.675]]},
  {id:'lower-right',points:[[1180,713],[1094,713],[974,594],[906.675,512.675]]},
]
/** First visible entry into the rectangle along a segment. */
export function clipEntry(a:EnergyPoint,b:EnergyPoint,w:number,h:number):EnergyPoint|null {
  let t0=0,t1=1
  const dx=b[0]-a[0],dy=b[1]-a[1]
  for(const [p,q] of [[-dx,a[0]],[dx,w-a[0]],[-dy,a[1]],[dy,h-a[1]]]){
    if(p===0){if(q<0)return null;continue}
    const r=q/p
    if(p<0)t0=Math.max(t0,r);else t1=Math.min(t1,r)
    if(t0>t1)return null
  }
  return [a[0]+dx*t0,a[1]+dy*t0]
}
export function visibleRoute(points:EnergyPoint[],w:number,h:number):EnergyPoint[]{
  for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1]
    if(a[0]>=0&&a[0]<=w&&a[1]>=0&&a[1]<=h)return points.slice(i)
    const entry=clipEntry(a,b,w,h)
    if(entry)return [entry,...points.slice(i+1)]
  }
  return points.slice(-2)
}
