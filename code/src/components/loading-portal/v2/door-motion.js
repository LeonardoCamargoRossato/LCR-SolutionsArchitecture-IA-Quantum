/** Adapted from the shared ChatDrawer V2 WAAPI controller.
 * Desktop/Lab retain the native compositor clock. Portrait production uses
 * one bounded frame clock so a blocked main thread cannot skip half a door.
 */
export function createDoorMotion(root, options = {}) {
  const {duration=3000,cinematic=false,mobile=false,reducedMotion=false,onOpening=()=>{},onOpened=()=>{},onFallback=()=>{}}=options;
  const total=Number.isFinite(duration)?Math.max(250,Math.min(12000,duration)):3000;
  const left=root.querySelector('.pdo-left'),right=root.querySelector('.pdo-right'),ref=root.querySelector('.pdo-reference'),glow=root.querySelector('.pdo-glow'),seam=root.querySelector('.pdo-seam');
  if(!left||!right||!ref||!glow||!seam)throw Error('Missing portal layers');
  const decoration=root.querySelector('.portal-v2-decoration'),flare=root.querySelector('.pdo-activation-flare');
  const bounded=cinematic&&mobile;
  let cancelled=false,finished=false,animations=[],frame=0,last=null,elapsed=0,paused=false,decorationStopped=false;
  const stopDecoration=()=>{if(!cancelled&&decoration&&!decorationStopped){decorationStopped=true;decoration.dataset.inactive='true';}};
  const restore=()=>{cancelAnimationFrame(frame);animations.forEach(({animation})=>animation.cancel());animations=[];ref.hidden=false;root.dataset.state='closed';if(decoration)delete decoration.dataset.inactive;};
  const finish=()=>{if(cancelled||finished)return;finished=true;root.dataset.state='opened';onOpened();};
  const fallback=()=>{if(cancelled||finished)return;finished=true;root.dataset.state='opened';onFallback();};
  root.dataset.state='opening';onOpening();
  if(reducedMotion||typeof left.animate!=='function'){
    if(reducedMotion)finish();else fallback();
    return {pause(){},play(){},cancel(){cancelled=true;restore();}};
  }
  ref.hidden=false;
  const anim=(el,frames,ms=total)=>{const animation=el.animate(frames,{duration:ms,fill:'both',easing:'linear'});
    if(bounded){animation.pause();animation.currentTime=0;}
    animations.push({animation,ms});return animation;};
  const distanceLeft=root.style.getPropertyValue('--pdo-exit-left')||'-102%';
  const distanceRight=root.style.getPropertyValue('--pdo-exit-right')||'102%';
  const startTravel=bounded?.16:.12;
  const fadeEnd=bounded?.17:.13;
  if(decoration){
    const fade=anim(decoration,[{opacity:1,offset:0},{opacity:1,offset:.025/fadeEnd},{opacity:0,offset:1}],total*fadeEnd);
    if(!bounded)fade.finished.then(stopDecoration,()=>{});
  }
  anim(ref,[{visibility:'visible',offset:0},{visibility:'visible',offset:startTravel-.02,easing:'steps(1,end)'},{visibility:'hidden',offset:startTravel},{visibility:'hidden',offset:1}]);
  const travel=(el,distance)=>anim(el,[{transform:'translateX(0)',offset:0},{transform:'translateX(0)',offset:startTravel,easing:bounded?'cubic-bezier(.55,0,.58,1)':'cubic-bezier(.42,0,.58,1)'},{transform:'translateX('+distance+')',offset:1}]);
  const lead=travel(left,distanceLeft);travel(right,distanceRight);
  anim(glow,cinematic?[{opacity:.2,offset:0},{opacity:1,offset:.07},{opacity:.6,offset:startTravel},{opacity:0,offset:.24},{opacity:0,offset:1}]:[{opacity:0,offset:0},{opacity:.55,offset:.075},{opacity:.15,offset:.12},{opacity:0,offset:.22},{opacity:0,offset:1}]);
  anim(seam,cinematic?[{opacity:0,offset:0},{opacity:.15,offset:.06},{opacity:1,offset:startTravel},{opacity:.52,offset:startTravel+.07},{opacity:0,offset:.33},{opacity:0,offset:1}]:[{opacity:0,offset:0},{opacity:0,offset:.06},{opacity:.7,offset:.12},{opacity:0,offset:.30},{opacity:0,offset:1}]);
  if(flare&&cinematic)anim(flare,[{opacity:.25,offset:0},{opacity:1,offset:.065},{opacity:.9,offset:startTravel},{opacity:0,offset:.25},{opacity:0,offset:1}]);
  // Use a single frame clock for all effects and both leaves. At 60Hz the
  // timing is unchanged; after a stall advance at most 34ms, rather than
  // catching up to elapsed wall time. No React state or layout reads here.
  const tick=now=>{
    frame=0;if(cancelled||finished||paused)return;
    const previous=elapsed;
    if(last!==null)elapsed=Math.min(total,elapsed+Math.min(34,Math.max(0,now-last)));
    last=now;
    for(const {animation,ms} of animations)if(previous<ms)animation.currentTime=Math.min(ms,elapsed);
    if(elapsed>=total*fadeEnd)stopDecoration();
    if(elapsed>=total)finish();else frame=requestAnimationFrame(tick);
  };
  if(bounded)frame=requestAnimationFrame(tick);else lead.finished.then(finish,()=>{});
  return {
    pause(){paused=true;cancelAnimationFrame(frame);frame=0;last=null;if(!bounded)animations.forEach(({animation:a})=>{if(a.playState!=='finished')a.pause();});},
    play(){if(cancelled||finished)return;paused=false;if(bounded){if(!frame){last=null;frame=requestAnimationFrame(tick);}}else animations.forEach(({animation:a})=>{if(a.playState!=='finished')a.play();});},
    cancel(){cancelled=true;restore();}
  };
}
