(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const desktop=matchMedia('(min-width:681px)').matches;
 const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);},lerp=(a,b,t)=>a+(b-a)*t;
 const asset='assets/motion-study-27/';
 const projects=[...document.querySelectorAll('#branding>article,#editorial>article,#graphic>article,#illustration>article,#portfolio2026')];
 const kinds=['vegetaria','hozzz','aota','wp','book','book','paper','bloom','signature'];
 projects.forEach((p,i)=>p.dataset.e25Theme=kinds[i]);
 const stages=[];
 function img(src,alt){const e=document.createElement('img');e.src=src;e.alt=alt||'';e.decoding='async';return e;}
 function video(src,alt,poster){const v=document.createElement('video');v.src=src;v.muted=true;v.loop=true;v.playsInline=true;v.preload='metadata';v.setAttribute('aria-label',alt);if(poster)v.poster=poster;return v;}
 function copy(el){if(el.tagName==='VIDEO')el.pause();const c=el.cloneNode(true);c.removeAttribute('id');if(c.tagName==='VIDEO'){c.removeAttribute('autoplay');c.muted=true;c.loop=true;c.playsInline=true;}return c;}
 function frame(items,kind='single',duration=1.25){const el=document.createElement('div');el.className='e27-panel e27-'+kind;items.forEach(item=>{const f=document.createElement('figure');f.append(item);el.append(f);});return {el,kind,duration};}
 function install(project,panels,book=-1){
  const head=project.querySelector('.project-head,.portfolio-head');const board=document.createElement('div');board.className='e27-board';
  const floor=document.createElement('div');floor.className='e27-floor';let time=0;
  panels.forEach(p=>{p.start=time;p.end=time+p.duration;time=p.end;p.el.style.visibility='hidden';floor.append(p.el);});
  board.append(head,floor);[...project.children].forEach(e=>e.remove());project.append(board);project.classList.add('e27-stage');
  project.style.setProperty('--e27-screens',time+1.65);
  const st={project,head,board,floor,panels,book,end:time+.65,value:0,opened:new WeakSet()};stages.push(st);return st;
 }
 const hotel=projects[1];if(hotel){
  const old=hotel.querySelector('.hozzz-v96-visuals');const check=old.querySelector('video');const book=old.querySelector('.hozzz-reader-shell-v96');
  const montage=frame([copy(check),video('assets/videos/video-0003.mp4','Follow me'),video('assets/videos/video-0006.mp4','This way'),video('assets/videos/video-0005.mp4','Elevator'),video(asset+'cafe.mp4','Café'),video(asset+'check-out.mp4','Check out')],'hotel-world',2.8);
  const typography=frame([video(asset+'type-overview-a.mov','Hotel motion typography, services'),video(asset+'type-overview-b.mov','Hotel motion typography, rooms')],'type-world',1.8);
  const design=frame([...old.querySelectorAll('.hozzz-carousel-v99 img')].map(copy),'design-strip',3.3);
  install(hotel,[montage,typography,design,frame([book],'reader',1.85)],3);
 }
 const aota=projects[2];if(aota){const book=aota.querySelector('.aota-reader-shell-v96');install(aota,[frame([img('assets/images/aota-showcase-01.png','AOTA complete packaging and pattern collection')],'aota-wide',1.4),frame([img('assets/images/aota-showcase-02.png','Open tart box'),img('assets/images/aota-showcase-03.png','Shopping bag and packaging')],'aota-pair',1.7),frame([book],'reader',1.85)],2);}
 const wp=projects[3];if(wp){
  install(wp,[frame([img('assets/images/image-0075.jpg','Walter Porstmann modular alphabet')],'wp-type',1.35),frame([img(asset+'wp-badges.png','Circular badge design collection'),video(asset+'wp-badge.mp4','Rotating physical badge','assets/motion-study-27/W05-1.jpg')],'wp-badge',1.65),frame([76,77,78,79].map(n=>img('assets/images/image-'+String(n).padStart(4,'0')+'.jpg','WP printed applications')),'wp-objects',2.8),frame([video(asset+'wp-outdoor.mp4','Printed cloth in the wind','assets/motion-study-27/W02-0.jpg'),video(asset+'wp-worn.mp4','Badges worn on clothing','assets/motion-study-27/W03-0.jpg')],'wp-live',1.5)]);
 }
 for(const i of [4,5]){const p=projects[i];if(p){const frames=[...p.querySelectorAll('iframe')];install(p,[frame(frames,frames.length===2?'books':'reader',2.25)],0);}}
 const print=projects[6];if(print){const ims=[...print.querySelectorAll('.e25-print-wall img')];const order=[ims[0],ims[2],ims[4],ims[1],ims[3]];const f=frame(order,'paper-stack',4.6);f.el.querySelectorAll('figure').forEach((e,i)=>e.classList.add(i===1||i===3?'portrait':'landscape'));install(print,[f]);}
 // Retain the existing stack → scatter → grid illustration interaction and DOM.
 const bloom=projects[7];if(bloom){bloom.classList.add('e27-authored');}
 const po=projects[8];if(po){install(po,[frame([po.querySelector('.portfolio-final-image-v99 img')],'portfolio',1.6)]);}
 const signatures=document.querySelector('.e25-signatures');if(signatures)document.querySelector('.ending').prepend(signatures);
 const veg=projects[0];if(veg){
  veg.classList.add('e27-vegetaria');const items=[...veg.querySelectorAll('.veg-item-v78')];
  items.forEach((el,i)=>{el.style.setProperty('--veg-delay',`${i%4*75}ms`);el.style.setProperty('--veg-x',`${i%2===0?-1:1}`);el.style.setProperty('--veg-y',`${i%3===0?-1:1}`);el.style.setProperty('--veg-angle',`${(i%3-1)*6}deg`);el.classList.add('e27-veg-wait');});
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){veg.classList.add('e27-veg-entered');observer.disconnect();}},{threshold:.18});observer.observe(veg.querySelector('.vegetaria-stage-v78')||veg);
 }
 // Rehydrate the existing same-origin readers after moving them. Never replace their internals.
 document.querySelectorAll('iframe[data-e26-srcdoc],iframe[data-e26-src]').forEach(f=>{if(f.dataset.e26Srcdoc)f.srcdoc=f.dataset.e26Srcdoc;else f.src=f.dataset.e26Src;f.removeAttribute('data-e26-srcdoc');f.removeAttribute('data-e26-src');});
 function prepareHead(head){if(head.dataset.e27Copy)return;head.dataset.e27Copy='true';
  head.querySelectorAll('.project-title,.jp,.en,.portfolio-title,.portfolio-copy-v99').forEach(field=>{
   const walker=document.createTreeWalker(field,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())if(walker.currentNode.textContent.trim())nodes.push(walker.currentNode);
   for(const node of nodes){const frag=document.createDocumentFragment();const tokens=node.textContent.match(/\s+|[\u3000-\u9fff\uff00-\uffef]|[^\s\u3000-\u9fff\uff00-\uffef]+/g)||[];
    for(const t of tokens){if(/^\s+$/.test(t)){frag.append(document.createTextNode(t));continue;}const mask=document.createElement('span');mask.className='e27-copy-mask';const ink=document.createElement('span');ink.className='e27-copy-ink';ink.textContent=t;mask.append(ink);frag.append(mask);}node.replaceWith(frag);
   }
  });
  measureHead(head);
 }
 function measureHead(head){const masks=[...head.querySelectorAll('.e27-copy-mask')];const topRows=[];for(const mask of masks){const y=mask.offsetTop;let row=topRows.findIndex(v=>Math.abs(y-v)<4);if(row<0){row=topRows.length;topRows.push(y);}mask.dataset.row=String(row);}
  // Measure each column by its own line positions; both columns start together.
  for(const col of head.children){const rows=[];col.querySelectorAll('.e27-copy-mask').forEach(mask=>{const y=mask.getBoundingClientRect().top;let i=rows.findIndex(v=>Math.abs(y-v)<4);if(i<0){i=rows.length;rows.push(y);}mask.dataset.row=String(i);});}
 }
 function paintHead(head,entry,exit){head.style.setProperty('opacity','1','important');head.style.setProperty('transform','none','important');head.style.setProperty('translate','none','important');head.style.visibility=entry<0||exit>=1?'hidden':'visible';
  head.querySelectorAll('.e27-copy-mask').forEach(mask=>{const delay=Math.min(Number(mask.dataset.row),8)*.025;const t=reduced?1:ease((entry-delay)/.38);mask.firstChild.style.transform=`translateY(${-112*(1-t)-112*exit}%)`;});
 }
 function measure(){for(const st of stages){measureHead(st.head);st.floor.style.setProperty('--head-space',`${Math.ceil(st.head.offsetHeight+46)}px`);}schedule();}
 const passiveHeads=[veg,bloom].filter(Boolean).map(project=>({project,head:project.querySelector('.project-head')}));
 document.fonts.ready.then(()=>{stages.forEach(st=>prepareHead(st.head));passiveHeads.forEach(st=>prepareHead(st.head));measure();});
 // Only the first opening is automatic; subsequent scrolling remains page navigation.
 const bound=new WeakSet();function bindReader(f){if(bound.has(f))return;bound.add(f);
  const enhance=()=>{let d;try{d=f.contentDocument;}catch(_){return;}if(!d?.head)return;let style=d.getElementById('e27-reader-style');if(!style){style=d.createElement('style');style.id='e27-reader-style';style.textContent='html,body,body *{cursor:default!important}#hint,.hint{display:none!important}';d.head.append(style);}if(!f.closest('.e27-reader,.e27-books')||d.documentElement.dataset.e27Wheel)return;d.documentElement.dataset.e27Wheel='true';d.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)<Math.abs(e.deltaX))return;e.preventDefault();window.scrollBy({top:e.deltaY*(e.deltaMode===1?16:1),behavior:'instant'});},{passive:false});};f.addEventListener('load',()=>{enhance();schedule();});enhance();}
 document.querySelectorAll('iframe').forEach(bindReader);
 function openReader(st,f){if(st.opened.has(f))return;try{const win=f.contentWindow,d=f.contentDocument;if(!d||d.querySelector('.loading:not(.done):not(.hidden),#loading:not(.done):not(.hidden)'))return;
  if(typeof win.nextHozzzPage==='function')win.nextHozzzPage();else if(typeof win.openAotaBook==='function')win.openAotaBook();else{const next=d.getElementById('next');if(!next||!d.querySelector('.page img,.page canvas'))return;next.click();}st.opened.add(f);
 }catch(_){}}
 let raf=0,last=0;
 function schedule(){if(!raf)raf=requestAnimationFrame(render);}
 function render(now){raf=0;const dt=Math.min(48,last?now-last:16);last=now;let moving=false;
  for(const st of stages){const rect=st.project.getBoundingClientRect(),h=st.board.clientHeight;const target=Math.max(-1,Math.min(st.end,(60-rect.top)/innerHeight));
   if(rect.bottom<0||rect.top>innerHeight){st.value=target;st.panels.forEach(p=>p.el.querySelectorAll('video').forEach(v=>{if(!v.paused)v.pause();}));st.head.style.visibility='hidden';continue;}
   if(reduced||Math.abs(target-st.value)>2.2)st.value=target;const delta=target-st.value;st.value+=Math.sign(delta)*Math.min(Math.abs(delta)*(1-Math.exp(-dt/110)),dt*.0030);if(Math.abs(delta)>.0005)moving=true;
   const q=st.value;let textExit=ease((q-(st.end-.55))/.42);if(st.book>=0)textExit=Math.max(textExit,ease((q-st.panels[st.book].start-.2)/.46));
   st.head.style.setProperty('top','24px','important');paintHead(st.head,q,textExit);st.floor.style.setProperty('--clip-head',`${lerp(st.head.offsetHeight+46,20,textExit)}px`);
   st.panels.forEach((p,i)=>{const u=q-p.start;const enter=i===0?ease((u-.12)/.48):ease((u+.1)/.45);const exit=i===st.panels.length-1?ease((q-st.end+.52)/.52):ease((q-p.end+.35)/.45);
    const visible=enter>0&&exit<1;p.el.style.visibility=visible?'visible':'hidden';p.el.style.pointerEvents=visible&&enter>.98&&exit<.05?'auto':'none';p.el.style.transform=`translateY(${h*((1-enter)-exit)}px)`;
    if(p.kind==='hotel-world')paintHotel(p,u);
    if(p.kind==='type-world'){const t=ease((u-.66)/.42);const figs=[...p.el.children];figs.forEach((f,n)=>{f.style.transform=`translateX(${(n-t)*110}%)`;f.style.visibility=n===0?t>.999?'hidden':'visible':t===0?'hidden':'visible';});}
    if(p.kind==='design-strip'){const figs=[...p.el.children];const progress=clamp((u-.2)/(p.duration-.65))*(figs.length-1);const step=Math.floor(progress),fraction=progress-step;const index=step+ease((fraction-.28)/.52);figs.forEach((f,n)=>{f.style.transform=`translateX(${(n-index)*112}%)`;f.style.opacity=Math.abs(n-index)<.65?'1':'.45';});}
    if(p.kind==='wp-objects'||p.kind==='paper-stack')paintStack(p,u);
    if(p.kind==='aota-pair')p.el.querySelectorAll('figure').forEach((f,n)=>{f.style.transform=`translateY(${(1-ease((u+.08-n*.1)/.55))*(h*.25)}px)`;});
    if(p.kind==='reader'||p.kind==='books'){const growth=ease((u-.28)/.52);p.el.style.setProperty('--book-growth',growth);p.el.style.setProperty('--book-lift',`${(st.head.offsetHeight/2)*(1-growth)}px`);if(visible&&u>.88)p.el.querySelectorAll('iframe').forEach(f=>{openReader(st,f);if(!st.opened.has(f)&&!st.retry)st.retry=setTimeout(()=>{st.retry=0;schedule();},250);});}
    p.el.querySelectorAll('video').forEach((v,n)=>{let play=visible&&enter>.95&&exit<.1;if(p.kind==='hotel-world'&&n>0)play=play&&u>1.3;if(p.kind==='type-world')play=play&&((n===0&&u<1.06)||(n===1&&u>.66));if(p.kind==='hotel-world'&&p.focus!==undefined&&p.focus!==null)play=play&&n===p.focus;
     if(play&&v.paused)v.play().catch(()=>{});else if(!play&&!v.paused)v.pause();});
   });
  }
  for(const st of passiveHeads){const rect=st.project.getBoundingClientRect();const entry=(60-rect.top)/innerHeight;const exit=ease((innerHeight*.52-rect.bottom)/(innerHeight*.38));st.head.style.setProperty('top','84px','important');paintHead(st.head,entry,exit);const visuals=st.project.querySelector('.vegetaria-v78-visuals');if(visuals)visuals.style.clipPath=`inset(${Math.max(0,st.head.getBoundingClientRect().bottom+16-visuals.getBoundingClientRect().top)}px 0 0 0)`;}
  if(moving)schedule();else last=0;
 }
 function paintHotel(p,u){const w=p.el.clientWidth,h=p.el.clientHeight;const zoom=ease((u-.76)/.9);const rects=[[.5,.33,.56],[.115,.23,.18],[.885,.23,.18],[.18,.76,.23],[.5,.76,.23],[.82,.76,.23]];
  [...p.el.children].forEach((f,i)=>{const [cx,cy,width]=rects[i];const ratio=i===0?16/9:1;let fw=w*width,fh=fw/ratio;const limit=h*(i===0?.52:.45);if(fh>limit){fh=limit;fw=fh*ratio;}if(i===0){const heroW=Math.min(w,h*16/9);fw=lerp(heroW,fw,zoom);fh=fw/ratio;f.style.left=`${w*.5-fw/2}px`;f.style.top=`${lerp(h*.5,h*cy,zoom)-fh/2}px`;}
   else{const reveal=ease((u-1.03-i*.045)/.64);f.style.left=`${w*cx-fw/2+(1-reveal)*(cx<.5?-w*.55:w*.55)}px`;f.style.top=`${h*cy-fh/2+(1-reveal)*h*.25}px`;f.style.visibility=reveal===0?'hidden':'visible';}
   f.style.width=fw+'px';f.style.height=fh+'px';f.style.zIndex=i===0?'2':'1';});
 }
 function paintStack(p,u){const figs=[...p.el.children],n=figs.length;const progress=clamp((u-.25)/(p.duration-.65))*(n-1);const index=Math.floor(progress);const advance=ease((progress-index-.28)/.56);const amount=index+advance;const h=p.el.clientHeight;
  figs.forEach((f,i)=>{const rel=i-amount,front=i===index||i===index+1;f.style.zIndex=String(n-i);f.style.visibility=rel<-1?'hidden':'visible';f.style.pointerEvents=Math.abs(rel)<.1?'auto':'none';f.style.opacity=rel<-.98?'0':'1';f.style.transform=`translate(${Math.max(0,rel)*13}px,${rel<0?rel*(h+100):Math.min(rel,4)*18}px) rotate(${rel>=0?Math.min(rel,3)*(i%2?-.9:.9):0}deg) scale(${rel>0?Math.max(.94,1-rel*.015):1})`;});
 }
 for(const st of stages){for(const p of st.panels)if(p.kind==='hotel-world'){[...p.el.children].forEach((f,i)=>{f.addEventListener('pointerenter',()=>{if(st.value>1.7){p.focus=i;schedule();}});f.addEventListener('pointerleave',()=>{p.focus=null;schedule();});});}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});document.querySelectorAll('.e27-panel img').forEach(im=>im.addEventListener('load',measure,{once:true}));measure();
 document.querySelectorAll('.project-index button[data-target]').forEach(button=>{button.onclick=()=>{document.getElementById(button.dataset.target)?.scrollIntoView({behavior:'instant',block:'start'});document.querySelector('.project-index')?.classList.remove('open');};});
 // One stable native arrow, with a subordinate brand-specific trace.
 if(!matchMedia('(pointer:fine)').matches||reduced)return;
 const layer=document.createElement('div');layer.className='e27-trail';layer.setAttribute('aria-hidden','true');document.body.append(layer);
 const word=document.createElement('div');word.className='e27-hozzz';layer.append(word);let wordCount=-1;
 function hotelWord(z){if(wordCount===z)return;wordCount=z;word.replaceChildren();for(const c of ['h','o',...Array(z).fill('z')])word.append(img(asset+'hozzz-'+c+'.png',''));}
 const colors=['#DB515C','#438E5B','#4F8EC7','#F2C050'];let serial=0,lastPoint=null,lastStamp=0,theme='',rest;
 const svg=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>`;
 function mark(e,k){const m=document.createElement('span');m.className='e27-mark';const n=serial++;let size=30;
  if(k==='vegetaria'){size=26+(n%4)*7;m.append(img(asset+'veg-ring-'+['pink','orange','yellow','green'][n%4]+'.png',''));}
  if(k==='aota'){m.append(img('assets/motion-study-26/aota-pattern-'+(n%9+1)+'.png',''));}
  if(k==='wp'){m.innerHTML=svg(['<rect x="4" y="4" width="56" height="56"/>','<path d="M4 60V32A28 28 0 0 1 60 32V60Z"/>','<path d="M4 60V4A56 56 0 0 1 60 60Z"/>','<rect x="4" y="17" width="56" height="30"/>'][n%4]);m.style.color=['#F080E0','#109030','#4040E0','#F0D020'][n%4];}
  if(k==='book'||k==='paper'){size=22;m.innerHTML=svg('<path d="M14 6H43L53 17V58H14Z M43 6V17H53 M21 30H43 M21 38H43" fill="none" stroke="#888" stroke-width="2"/>');}
  if(k==='bloom'){size=42;const url='assets/images/illustration/type-forms/type-'+String(n%36+1).padStart(2,'0')+'.png';m.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><filter id="ink${n}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.333 -.333 -.333 0 1" result="inkAlpha"/><feFlood flood-color="${colors[n%4]}"/><feComposite in2="inkAlpha" operator="in"/></filter></defs><image href="${url}" width="64" height="64" filter="url(#ink${n})"/></svg>`;}

  if(k==='signature'){size=48;m.append(img('assets/images/image-000'+(n%3+1)+'.png',''));}
  Object.assign(m.style,{left:e.clientX+10+'px',top:e.clientY+12+'px',width:size+'px',height:size+'px'});layer.append(m);while(layer.querySelectorAll('.e27-mark').length>5)layer.querySelector('.e27-mark').remove();m.animate([{transform:'translate(-50%,-50%) scale(.92)',opacity:.78},{transform:'translate(-50%,-70%) scale(.98)',opacity:0}],{duration:600,easing:'ease-out'}).onfinish=()=>m.remove();
 }
 document.addEventListener('pointermove',e=>{const next=e.target.closest('[data-e25-theme]')?.dataset.e25Theme||'';if(next!==theme){theme=next;lastPoint=null;word.style.opacity='0';layer.querySelectorAll('.e27-mark').forEach(m=>m.remove());}
  if(!theme||e.target.closest('iframe,.topnav,.project-head,.portfolio-head,button,a,input')){word.style.opacity='0';lastPoint=null;return;}const dx=lastPoint?e.clientX-lastPoint.x:0,dy=lastPoint?e.clientY-lastPoint.y:0;
  if(theme==='hozzz'){hotelWord(2+Math.min(6,Math.floor(Math.hypot(dx,dy)/6)));word.style.opacity='1';word.style.left=e.clientX+16+'px';word.style.top=e.clientY+12+'px';clearTimeout(rest);rest=setTimeout(()=>hotelWord(2),170);lastPoint={x:e.clientX,y:e.clientY};return;}
  word.style.opacity='0';if(!lastPoint){lastPoint={x:e.clientX,y:e.clientY};return;}if(Math.hypot(dx,dy)<36||performance.now()-lastStamp<70)return;lastPoint={x:e.clientX,y:e.clientY};lastStamp=performance.now();mark(e,theme);
 },{passive:true});
 const clear=()=>{word.style.opacity='0';lastPoint=null;layer.querySelectorAll('.e27-mark').forEach(m=>m.remove());};document.addEventListener('pointerleave',clear);addEventListener('blur',clear);addEventListener('scroll',clear,{passive:true});
})();
