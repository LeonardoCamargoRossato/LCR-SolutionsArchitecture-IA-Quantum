/** Adapted from the shared ChatDrawer V2 WAAPI controller.
 * The enclosing shared plane owns the static reference and mechanical sprites.
 */
export function createDoorMotion(root, options = {}) {
  const {duration=3000,reducedMotion=false,onOpening=()=>{},onOpened=()=>{},onFallback=()=>{}}=options;
  const total=Number.isFinite(duration)?Math.max(250,Math.min(12000,duration)):3000;
  const left=root.querySelector('.pdo-left'),right=root.querySelector('.pdo-right'),ref=root.querySelector('.pdo-reference'),glow=root.querySelector('.pdo-glow'),seam=root.querySelector('.pdo-seam');
  if(!left||!right||!ref||!glow||!seam)throw Error('Missing portal layers');
  const decoration=root.querySelector('.portal-v2-decoration');
  let cancelled=false,finished=false,animations=[];
  const restore=()=>{animations.forEach(a=>a.cancel());animations=[];ref.hidden=false;root.dataset.state='closed';if(decoration)delete decoration.dataset.inactive;};
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
  // Fade the readout during activation; reference switches only while the
  // two lossless leaves are still perfectly aligned. Then ease both leaves
  // over almost the entire three-second mechanical interval.
  if(decoration){
    // Same opacity curve, truncated at its original zero-opacity boundary.
    // A completed WAAPI effect (also paused/resumed with the leaves) stops
    // all 38 animated strokes as soon as they cannot contribute pixels.
    const fade=decoration.animate([{opacity:1,offset:0},{opacity:1,offset:.025/.13},{opacity:0,offset:1}],
      {duration:total*.13,fill:'both',easing:'linear'});
    animations.push(fade);
    fade.finished.then(()=>{if(!cancelled)decoration.dataset.inactive='true';},()=>{});
  }
  anim(ref,[{visibility:'visible',offset:0},{visibility:'visible',offset:.10,easing:'steps(1,end)'},{visibility:'hidden',offset:.12},{visibility:'hidden',offset:1}]);
  const travel=(el,distance)=>anim(el,[{transform:'translateX(0)',offset:0},{transform:'translateX(0)',offset:.12,easing:'cubic-bezier(.42,0,.58,1)'},{transform:'translateX('+distance+')',offset:1}]);
  const lead=travel(left,distanceLeft);travel(right,distanceRight);
  anim(glow,[{opacity:0,offset:0},{opacity:.55,offset:.075},{opacity:.15,offset:.12},{opacity:0,offset:.22},{opacity:0,offset:1}]);
  anim(seam,[{opacity:0,offset:0},{opacity:0,offset:.06},{opacity:.7,offset:.12},{opacity:0,offset:.30},{opacity:0,offset:1}]);
  lead.finished.then(finish,()=>{});
  return {pause(){animations.forEach(a=>{if(a.playState!=='finished')a.pause();});},play(){animations.forEach(a=>{if(a.playState!=='finished')a.play();});},cancel(){cancelled=true;restore();}};
}
