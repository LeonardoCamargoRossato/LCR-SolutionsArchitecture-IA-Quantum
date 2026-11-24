/** Adapted from the shared ChatDrawer V2 WAAPI controller.
 * The enclosing shared plane owns the static reference and mechanical sprites.
 */
export function createDoorMotion(root, options = {}) {
  const {duration=1800,reducedMotion=false,onOpening=()=>{},onOpened=()=>{},onFallback=()=>{}}=options;
  const total=Number.isFinite(duration)?Math.max(250,Math.min(12000,duration)):1800;
  const left=root.querySelector('.pdo-left'),right=root.querySelector('.pdo-right'),ref=root.querySelector('.pdo-reference'),glow=root.querySelector('.pdo-glow'),seam=root.querySelector('.pdo-seam');
  if(!left||!right||!ref||!glow||!seam)throw Error('Missing portal layers');
  let cancelled=false,finished=false,animations=[];
  const restore=()=>{animations.forEach(a=>a.cancel());animations=[];ref.hidden=false;root.dataset.state='closed';};
  const finish=()=>{if(cancelled||finished)return;finished=true;root.dataset.state='opened';onOpened();};
  const fallback=()=>{if(cancelled||finished)return;finished=true;root.dataset.state='opened';onFallback();};
  root.dataset.state='opening';onOpening();
  if(reducedMotion||typeof left.animate!=='function'){
    if(reducedMotion)finish();else fallback();
    return {pause(){},play(){},cancel(){cancelled=true;restore();}};
  }
  ref.hidden=false;
  const anim=(el,frames)=>{const a=el.animate(frames,{duration:total,fill:'both',easing:'linear'});animations.push(a);return a;};
  const distanceLeft=root.style.getPropertyValue('--pdo-exit-left')||'-102%';
  const distanceRight=root.style.getPropertyValue('--pdo-exit-right')||'102%';
  // Exact closed reference until the activation pulse ends.
  anim(ref,[{visibility:'visible',offset:0},{visibility:'visible',offset:.19,easing:'steps(1,end)'},{visibility:'hidden',offset:.20},{visibility:'hidden',offset:1}]);
  const travel=(el,distance)=>anim(el,[{transform:'translateX(0)',offset:0},{transform:'translateX(0)',offset:.20,easing:'cubic-bezier(.34,0,.23,1)'},{transform:'translateX('+distance+')',offset:1}]);
  const lead=travel(left,distanceLeft);travel(right,distanceRight);
  anim(glow,[{opacity:0,offset:0},{opacity:.7,offset:.10},{opacity:.15,offset:.19},{opacity:0,offset:.22},{opacity:0,offset:1}]);
  anim(seam,[{opacity:0,offset:0},{opacity:0,offset:.10},{opacity:.8,offset:.19},{opacity:0,offset:.37},{opacity:0,offset:1}]);
  lead.finished.then(finish,()=>{});
  return {pause(){animations.forEach(a=>a.pause());},play(){animations.forEach(a=>a.play());},cancel(){cancelled=true;restore();}};
}
