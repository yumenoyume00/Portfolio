(()=>{
 'use strict';
 if(!matchMedia('(any-pointer:fine)').matches)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const root=document.createElement('div');root.className='s34-pointer-layer';root.setAttribute('aria-hidden','true');
 const ink=document.createElement('div');ink.className='s34-pointer';root.append(ink);document.body.append(root);
 const colors=['#DB515C','#438E5B','#4F8EC7','#F2C050'];
 const base='assets/motion-study-27/';
 const abs=s=>new URL(s,document.baseURI).href;
 const svg=s=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${s}</svg>`;
 const image=s=>`<img src="${abs(s)}" alt="">`;
 let theme='',serial=0,last=null,stamp=null,wordCount=-1,pressed=false;
 function themeFor(target){
  if(target.closest?.('.topnav,.project-index,.about,#room'))return 'home';
  const stage=target.closest?.('.app-scroll-stage-v100');
  if(stage)return ['app-0','app-1','app-2','app-3','app-4'][Number(stage.dataset.e23Cursor)]||'home';
  const app=target.closest?.('#uiux>article');
  if(app)return 'app-'+[...document.querySelectorAll('#uiux>article')].indexOf(app);
  if(target.closest?.('.ending'))return 'signature';
  return target.closest?.('[data-e25-theme]')?.dataset.e25Theme||'home';
 }
 function graphic(kind,n=0){
  if(kind==='app-0')return svg(`<ellipse cx="16" cy="16" rx="14" ry="5" fill="${colors[n%4]}" transform="rotate(-25 16 16)"/>`);
  if(kind==='app-2')return svg('<path d="M3 22Q6 7 15 15T29 9" stroke="#28B846" stroke-width="3" fill="none" stroke-linecap="round"/>');
  if(kind==='app-3')return `<span class="s34-letter" style="--ink:${['#F35358','#63C346','#F4CE48','#508CEE'][n%4]};--side:${['#B42B35','#318F31','#C19427','#315CA9'][n%4]}">${'FesColle!'[n%9]}</span>`;
  if(kind==='vegetaria')return image(base+'veg-ring-'+['pink','orange','yellow','green'][n%4]+'.png');
  if(kind==='aota')return image('assets/motion-study-26/aota-pattern-'+(n%9+1)+'.png');
  if(kind==='wp'){const colors=['#F080E0','#109030','#4040E0','#F0D020'];return svg([`<rect x="3" y="3" width="26" height="26" fill="${colors[n%4]}"/>`,`<path d="M3 29V16A13 13 0 0 1 29 16V29Z" fill="${colors[n%4]}"/>`,`<path d="M3 29V3A26 26 0 0 1 29 29Z" fill="${colors[n%4]}"/>`,`<rect x="3" y="8" width="26" height="16" fill="${colors[n%4]}"/>`][n%4]);}
  if(kind==='book'||kind==='paper')return svg('<path d="M7 3H22L27 9V29H7Z M22 3V9H27 M11 15H22 M11 20H22" fill="none" stroke="#888" stroke-width="1.5"/>');
  if(kind==='bloom')return image('assets/local-study-34/cursors/bloom.png');
  if(kind==='signature')return image('assets/images/image-000'+(n%3+1)+'.png');
  return '<span class="s34-fluid"></span>';
 }
 function sizeFor(kind){return kind==='vegetaria'?30:kind==='aota'?30:kind==='wp'?24:kind==='bloom'?30:kind==='signature'?38:kind==='book'||kind==='paper'?24:kind==='app-0'?30:kind==='app-3'?28:kind==='hozzz'?0:36;}
 function setTheme(next){
  if(next===theme)return;theme=next;last=null;stamp=null;wordCount=-1;
  root.querySelectorAll('.s34-pointer-trace').forEach(e=>e.remove());
  ink.innerHTML=next==='hozzz'?'':graphic(next);ink.style.width=ink.style.height=sizeFor(next)+'px';
 }
 function hotelWord(count){
  if(wordCount===count)return;wordCount=count;
  ink.innerHTML='<span class="s34-hotel-word">'+['h','o',...Array(count).fill('z')].map(c=>image(base+'hozzz-'+c+'.png')).join('')+'</span>';
  ink.style.width='auto';ink.style.height='23px';
 }
 function trace(x,y,kind,n,angle){
  if(reduced)return;
  const mark=document.createElement('div');mark.className='s34-pointer-trace';
  let size=sizeFor(kind);mark.innerHTML=graphic(kind,n);
  if(kind==='app-1'||kind==='app-4'||kind==='home'){
   size=70;mark.innerHTML='<span class="s34-fluid"></span>';const glow=mark.firstChild;glow.style.width=glow.style.height='70px';glow.style.background=kind==='app-4'?'radial-gradient(circle,#42e4f555,#94b7ff33,transparent 72%)':'radial-gradient(circle,'+['#94b7ff77','#ffcfff77','#a9ecd877','#fff38e77'][n%4]+',transparent 72%)';
  }
  Object.assign(mark.style,{width:size+'px',height:size+'px',left:x+'px',top:y+'px'});root.prepend(mark);
  const transform=`translate(-50%,-50%) rotate(${kind==='app-0'?angle:0}deg)`;
  const fluid=['app-1','app-4','home'].includes(kind);
  mark.animate([{transform:transform+' scale(1)',opacity:fluid?.9:1},{transform:transform+` scale(${fluid?1.4:.7})`,opacity:0}],{duration:fluid?950:650,easing:'ease-out'}).onfinish=()=>mark.remove();
  while(root.querySelectorAll('.s34-pointer-trace').length>14)root.querySelector('.s34-pointer-trace').remove();
 }
 function move(x,y,target){
  setTheme(themeFor(target));root.style.opacity='1';
  const now=performance.now(),dx=last?x-last.x:0,dy=last?y-last.y:0,dt=last?Math.max(8,now-last.time):16,speed=Math.hypot(dx,dy)/dt,angle=Math.atan2(dy,dx)*180/Math.PI;
  if(theme==='hozzz')hotelWord(2+Math.min(6,Math.floor(speed*2)));
  ink.style.left=x+'px';ink.style.top=y+'px';
  ink.style.transform=theme==='hozzz'?`translate(0,-50%) scale(${pressed?.9:1})`:`translate(-50%,-50%) rotate(${theme==='app-0'?angle:0}deg) scale(${pressed?.86:1})`;
  if(theme==='app-4')ink.querySelector('.s34-fluid').style.background='radial-gradient(circle,#42e4f588,#94b7ff55,transparent 75%)';
  const distance=stamp?Math.hypot(x-stamp.x,y-stamp.y):0;
  if(theme==='app-2'&&stamp&&distance>4&&!reduced){
   const line=document.createElement('div');line.className='s34-pointer-trace';const length=distance;
   Object.assign(line.style,{left:stamp.x+'px',top:stamp.y+'px',width:length+'px',height:'3px',background:'#28B846',borderRadius:'3px',transformOrigin:'0 50%',transform:`rotate(${Math.atan2(y-stamp.y,x-stamp.x)*180/Math.PI}deg)`});root.prepend(line);line.animate([{opacity:.8},{opacity:0}],{duration:700}).onfinish=()=>line.remove();stamp={x,y,time:now};
  }else if(theme!=='hozzz'&&(!stamp||(distance>18&&now-stamp.time>24))){trace(x,y,theme,serial++,angle);stamp={x,y,time:now};}
  last={x,y,time:now};
 }
 const bound=new WeakSet(),blank='url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGklEQVR4nO3BAQEAAACCIP+vbkhAAQAAAO8GECAAARlDNO4AAAAASUVORK5CYII=") 0 0, none',none='html:root:root,body:not(#s34-native-a):not(#s34-native-b),html body *:not(#s34-native-a):not(#s34-native-b){cursor:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGklEQVR4nO3BAQEAAACCIP+vbkhAAQAAAO8GECAAARlDNO4AAAAASUVORK5CYII=") 0 0, none!important}';
 function bindFrame(frame,outer=frame){
  if(bound.has(frame))return;bound.add(frame);
  function enhance(){
   let d;try{d=frame.contentDocument;}catch(_){return;}if(!d?.head)return;
   let style=d.getElementById('s34-pointer-bridge');if(!style){style=d.createElement('style');style.id='s34-pointer-bridge';style.textContent=none;d.head.append(style);}
   d.documentElement.style.setProperty('cursor',blank,'important');d.querySelectorAll('*').forEach(el=>el.style?.setProperty('cursor',blank,'important'));d.addEventListener('pointerover',e=>e.target.style?.setProperty('cursor',blank,'important'),{capture:true,passive:true});
   if(d.documentElement.dataset.s34PointerBound)return;d.documentElement.dataset.s34PointerBound='true';
   const locate=e=>{const r=frame.getBoundingClientRect(),win=frame.contentWindow,sx=r.width/Math.max(1,win.innerWidth),sy=r.height/Math.max(1,win.innerHeight);let x=r.left+e.clientX*sx,y=r.top+e.clientY*sy;if(frame!==outer){const o=outer.getBoundingClientRect();x+=o.left;y+=o.top;}move(x,y,outer);};
   d.addEventListener('pointermove',locate,{passive:true});d.addEventListener('pointerover',locate,{passive:true});d.addEventListener('pointerdown',e=>{pressed=true;locate(e);},{passive:true});d.addEventListener('pointerup',e=>{pressed=false;locate(e);},{passive:true});
   d.querySelectorAll('iframe').forEach(f=>bindFrame(f,outer));
  }
  frame.addEventListener('load',enhance);enhance();
 }
 document.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')move(e.clientX,e.clientY,e.target);},{passive:true});
 document.addEventListener('pointerdown',e=>{pressed=true;move(e.clientX,e.clientY,e.target);},{passive:true});document.addEventListener('pointerup',e=>{pressed=false;move(e.clientX,e.clientY,e.target);},{passive:true});
 addEventListener('blur',()=>root.style.opacity='0');document.addEventListener('pointerleave',e=>{if(e.clientX<=0||e.clientY<=0||e.clientX>=innerWidth||e.clientY>=innerHeight)root.style.opacity='0';});
 function lock(node){if(node?.style)node.style.setProperty('cursor',blank,'important');}
 function lockTree(node){lock(node);node.querySelectorAll?.('*').forEach(lock);}
 lock(document.documentElement);lockTree(document.body);
 document.addEventListener('pointerover',e=>lock(e.target),{capture:true,passive:true});
 const scan=()=>document.querySelectorAll('iframe').forEach(f=>bindFrame(f));scan();new MutationObserver(records=>{for(const record of records)record.addedNodes.forEach(n=>{if(n.nodeType===1)lockTree(n);});scan();}).observe(document.body,{childList:true,subtree:true});
 let rest=0;document.addEventListener('pointermove',()=>{clearTimeout(rest);if(theme==='hozzz')rest=setTimeout(()=>hotelWord(2),160);},{passive:true});
 // Re-evaluate the motif after scrolling under a stationary pointer.
 addEventListener('scroll',()=>{if(!last)return;const hit=document.elementFromPoint(last.x,last.y);if(hit)move(last.x,last.y,hit);},{passive:true});
})();
