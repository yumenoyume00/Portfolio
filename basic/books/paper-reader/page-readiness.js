/** Never turn an unloaded artwork placeholder into the visible spread. */
export function installPageReadiness(engine,pages,{single,images,onLoading}) {
 let intent=0;
 const bounded=indices=>[...new Set(indices)].filter(i=>i>=0&&i<pages.length);
 const spread=sheet=>bounded([sheet*2-1,sheet*2]);
 const loaded=indices=>indices.every(i=>!pages[i].imageUrl||images.getCachedPageImage(pages[i].imageUrl));
 const run=(indices,action)=>{
  const revision=++intent;
  if(loaded(indices)){onLoading(false);action();return true;}
  onLoading(true);
  let timer;
  const requests=Promise.all(indices.map(i=>pages[i].imageUrl?images.loadPageImage(pages[i].imageUrl,'high'):true));
  return Promise.race([requests,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Page image timeout')),30000);})])
   .then(results=>{
    if(revision!==intent||engine.isDisposed)return false;
    if(results.some(result=>!result))throw Error('Page image unavailable');
    onLoading(false);action();return true;
   }).catch(()=>{if(revision===intent&&!engine.isDisposed)onLoading(true,true);return false;})
   .finally(()=>clearTimeout(timer));
 };
 const next=engine.flipNext.bind(engine),prev=engine.flipPrev.bind(engine),jump=engine.jumpToPage.bind(engine);
 const target=forward=>single?bounded([engine.getCurrentSheet()+(forward?1:-1)]):spread(engine.getCurrentSheet()+(forward?1:-1));
 engine.flipNext=()=>run(target(true),next);
 engine.flipPrev=()=>run(target(false),prev);
 engine.jumpToPage=index=>run(single?bounded([index]):index===0?[0]:spread(Math.floor((index+1)/2)),()=>jump(index));
 if(single){
  const start=engine.startFlip.bind(engine);
  engine.startFlip=(sheet,forward,progress,...rest)=>run(target(forward),()=>start(sheet,forward,progress,...rest));
 }else{
  const start=engine.triggerSheetFlip.bind(engine);
  engine.triggerSheetFlip=(sheet,forward,progress,...rest)=>run(spread(progress===1?sheet+1:sheet),()=>start(sheet,forward,progress,...rest));
 }
 const area=engine.getHitArea();
 const pointer=event=>{
  if(event.button!==0)return;
  let forward,indices;
  if(single){const rect=area.getBoundingClientRect();forward=event.clientX-rect.left>=rect.width*.5;indices=target(forward);}
  else{const hit=engine.getSheetTargetUnderPointer(event.clientX);if(!hit)return;forward=hit.forward;indices=spread(hit.sheetIndex+(forward?1:0));}
  if(loaded(indices))return;
  event.preventDefault();event.stopImmediatePropagation();
  run(indices,forward?next:prev);
 };
 area.addEventListener('pointerdown',pointer,true);
 const dispose=engine.dispose.bind(engine);
 engine.dispose=()=>{intent++;area.removeEventListener('pointerdown',pointer,true);dispose();};
}
