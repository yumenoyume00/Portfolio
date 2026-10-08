(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const fine=matchMedia('(pointer:fine)').matches;
 const clamp=v=>Math.max(0,Math.min(1,v));
 // Keep the native pointer identical across white space, media, and same-origin readers.
 const pointerCSS='html,body,body *{cursor:default!important}';
 function framePointer(frame){try{const d=frame.contentDocument;if(!d?.head)return;
  let style=d.getElementById('portfolio-stable-pointer');if(!style){style=d.createElement('style');style.id='portfolio-stable-pointer';d.head.append(style);}style.textContent=pointerCSS;
  d.querySelectorAll('iframe').forEach(bindFrame);
 }catch(_){}}
 const bound=new WeakSet();function bindFrame(f){if(bound.has(f))return;bound.add(f);f.addEventListener('load',()=>framePointer(f));framePointer(f);}
 document.querySelectorAll('iframe').forEach(bindFrame);
 const frameObserver=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes){if(n.nodeType!==1)continue;if(n.matches('iframe'))bindFrame(n);n.querySelectorAll?.('iframe').forEach(bindFrame);}});
 frameObserver.observe(document.body,{childList:true,subtree:true});
 // A direct index jump cannot be interrupted by the one-time About runway release.
 document.querySelectorAll('.project-index button[data-target]').forEach(button=>{
  button.onclick=()=>{const target=document.getElementById(button.dataset.target);if(!target)return;
   target.scrollIntoView({behavior:'instant',block:'start'});
   document.querySelector('.project-index').classList.remove('open');
   document.querySelector('[data-project-index-trigger]')?.setAttribute('aria-expanded','false');
  };
 });
 const projects=[...document.querySelectorAll('#branding>article,#editorial>article,#graphic>article,#illustration>article,#portfolio2026')];
 const kinds=['vegetaria','hozzz','aota','wp','book','book','paper','bloom','signature'];
 projects.forEach((p,i)=>p.dataset.e25Theme=kinds[i]);
 // The description stays on one white stage while related compositions change below it.
 const stages=[];
 function image(src,alt=''){const im=document.createElement('img');im.src=src;im.alt=alt;im.decoding='async';return im;}
 function mediaCopy(el){if(el.tagName==='VIDEO')el.pause();const c=el.cloneNode(true);c.removeAttribute('id');if(c.tagName==='VIDEO'){c.muted=true;c.autoplay=true;c.loop=true;}return c;}
 function panel(items,layout='pair'){const el=document.createElement('div');el.className='e26-panel e26-'+layout;for(const item of items){const f=document.createElement('figure');f.append(item);el.append(f);}return el;}
 function install(project,panels,bookIndex=-1){if(!project)return;const head=project.querySelector('.project-head,.portfolio-head');
  const board=document.createElement('div');board.className='e26-board';board.append(head);const floor=document.createElement('div');floor.className='e26-floor';panels.forEach((x,i)=>{x.style.visibility=i?'hidden':'visible';x.style.transform=i?'translateY(110%)':'translateY(0%)';floor.append(x);});board.append(floor);
  [...project.children].forEach(x=>{if(x!==head)x.remove();});project.append(board);project.classList.add('e26-stage');
  project.style.setProperty('--screens',panels.length+1.2);stages.push({project,board,head,floor,panels,bookIndex,value:0});
 }
 const hotel=projects[1];if(hotel){const old=hotel.querySelector('.hozzz-v96-visuals');const vids=[...old.querySelectorAll('video')];const imgs=[...old.querySelectorAll('.hozzz-carousel-v99 img')];const book=old.querySelector('.hozzz-reader-shell-v96');
  install(hotel,[panel([mediaCopy(vids[0]),mediaCopy(imgs[0])],'pair'),panel([mediaCopy(imgs[1]),...vids.slice(1).map(mediaCopy)],'guides'),panel(imgs.slice(2).map(mediaCopy),'applications'),panel([book],'reader')],3);
 }
 const aota=projects[2];if(aota){const old=aota.querySelector('.aota-v96-visuals');const book=old.querySelector('.aota-reader-shell-v96');install(aota,[panel([image('assets/images/aota-showcase-01.png','AOTA packaging system')],'single'),panel([image('assets/images/aota-showcase-02.png','Tart packaging'),image('assets/images/aota-showcase-03.png','Bag and packaging')],'portraits'),panel([image('assets/images/aota-showcase-04.png','AOTA menu in use')],'single'),panel([book],'reader')],3);}
 const wp=projects[3];if(wp){const img=n=>image('assets/images/image-'+String(n).padStart(4,'0')+'.jpg','Walter Porstmann');install(wp,[panel([img(75),img(76)],'pair'),panel([img(77),img(78),img(79)],'portraits'),panel([img(82),img(83)],'portraits')]);}
 for(const i of [4,5]){const pr=projects[i];if(!pr)continue;const frames=[...pr.querySelectorAll('iframe')];install(pr,[panel(frames,frames.length===2?'books':'reader')],0);}
 const print=projects[6];if(print){const imgs=[...print.querySelectorAll('.e25-print-wall img')];install(print,[panel([imgs[0],imgs[1]],'pair'),panel([imgs[2],imgs[3],imgs[4]],'print')]);}
 const bloomProject=projects[7];if(bloomProject){const groups=[...bloomProject.querySelectorAll('.bloom-cycle-group-v99')];install(bloomProject,groups.map(g=>panel([...g.querySelectorAll('img')].map(mediaCopy),'specimen')));}
 // Preserve the authored Vegetaria composition as a whole, with its original lightbox.
 const veg=projects[0];if(veg){veg.classList.add('e26-vegetaria');if(!reduced){const entry=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('e26-veg-wait');entry.unobserve(e.target);}}),{threshold:.12});veg.querySelectorAll('.veg-item-v78').forEach((el,i)=>{el.classList.add('e26-veg-wait');el.style.setProperty('--entry-delay',(i%3)*65+'ms');entry.observe(el);});}}

 const signatures=document.querySelector('.e25-signatures');if(signatures)document.querySelector('.ending').prepend(signatures);
 const po=projects[8];if(po){install(po,[panel([po.querySelector('.portfolio-final-image-v99 img')],'single')]);}
 document.querySelectorAll('iframe[data-e26-srcdoc],iframe[data-e26-src]').forEach(f=>{if(f.dataset.e26Srcdoc)f.srcdoc=f.dataset.e26Srcdoc;else f.src=f.dataset.e26Src;f.removeAttribute('data-e26-srcdoc');f.removeAttribute('data-e26-src');});
 // Reveals use the same masked line rhythm as the front of the portfolio.
 const observer=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;e.target.classList.remove('e25-copy-wait');observer.unobserve(e.target);}},{threshold:0,rootMargin:'0px 0px -15% 0px'});
 document.fonts.ready.then(()=>{projects.forEach(pr=>{const head=pr.querySelector('.project-head,.portfolio-head');if(!head)return;head.querySelectorAll('.jp,.en').forEach(block=>{if(block.children.length)return;const tokens=block.textContent.match(/[\u3000-\u9fff\uff00-\uffef]|[^\s\u3000-\u9fff\uff00-\uffef]+|\s+/g)||[];const frag=document.createDocumentFragment();for(const t of tokens){if(/^\s+$/.test(t)){frag.append(document.createTextNode(t));continue;}const mask=document.createElement('span');mask.className='e25-word-mask';const word=document.createElement('span');word.className='e25-word';word.textContent=t;mask.append(word);frag.append(mask);}block.replaceChildren(frag);let row=-1,y=-999;block.querySelectorAll('.e25-word-mask').forEach(m=>{if(Math.abs(m.offsetTop-y)>3){row++;y=m.offsetTop;}m.firstChild.style.setProperty('--delay',Math.min(row,6)*65+'ms');});});if(!reduced){head.classList.add('e25-copy-wait');observer.observe(head);}});measure();});
 function measure(){for(const st of stages){st.floor.style.setProperty('--head-space',Math.ceil(st.head.scrollHeight+38)+'px');}requestTick();}
 let raf=0,previous=0;
 function requestTick(){if(!raf)raf=requestAnimationFrame(render);}
 function render(now){raf=0;const dt=Math.min(40,now-(previous||now));previous=now;let active=false;
  for(const st of stages){const rect=st.project.getBoundingClientRect();const unit=(rect.height-st.board.offsetHeight)/(st.panels.length+.2);const target=Math.max(0,Math.min(st.panels.length+.2,(60-rect.top)/unit));
   if(rect.bottom<0||rect.top>innerHeight){st.value=target;continue;}
   if(reduced||Math.abs(target-st.value)>1.6)st.value=target;const delta=target-st.value;st.value+=Math.sign(delta)*Math.min(Math.abs(delta)*(1-Math.exp(-dt/130)),dt/700);if(Math.abs(delta)>.002)active=true;
   const q=st.value;const entrance=clamp((60-rect.top+190)/190);let textExit=0;
   if(st.bookIndex>=0)textExit=clamp((q-st.bookIndex-.45)/.45);
   st.head.style.setProperty('opacity','1','important');st.head.style.setProperty('transform',`translateY(${(1-entrance)*-75-textExit*(st.head.scrollHeight+70)}px)`,'important');st.head.style.setProperty('clip-path',`inset(0 0 ${textExit*100}% 0)`,'important');
   st.panels.forEach((p,i)=>{const incoming=i===0?1:clamp((q-i+.15)/.5);const outgoing=i===st.panels.length-1?0:clamp((q-i-.8)/.5);const y=(1-incoming)*110-outgoing*110;p.style.transform=`translateY(${y}%)`;p.style.visibility=incoming===0||outgoing===1?'hidden':'visible';p.style.pointerEvents=incoming>.95&&outgoing<.05?'auto':'none';const playing=incoming>.9&&outgoing<.1;if(p.dataset.playing!==String(playing)){p.dataset.playing=String(playing);p.querySelectorAll('video').forEach(v=>{if(playing)v.play().catch(()=>{});else v.pause();});}});
  }
  if(active)requestTick();else previous=0;
 }
 addEventListener('scroll',requestTick,{passive:true});addEventListener('resize',measure);measure();
 if(!fine||reduced)return;
 const layer=document.createElement('div');layer.className='e25-trail';layer.setAttribute('aria-hidden','true');document.body.append(layer);
 const h=document.createElement('img');h.src='assets/motion-study-25/hozzz-h.png';h.className='e25-h';h.alt='';layer.append(h);
 const palette=['#DB515C','#438E5B','#4F8EC7','#F2C050'];
 const ringColors=[['#FFD928','#ED782A','#FFF7D4'],['#178B57','#F8D922','#DC494F'],['#EB7FA4','#F5BDD0','#DC494F']];
 let serial=0,last=null,stamp=0,theme='',hx=0,hy=0,hHeight=52,hTarget=52,hFrame=0,hTime=0;
 const svg=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`;
 function bloom(n,color){const id='b'+serial;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2481 3508"><defs><filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1 0 0 0 1"/><feFlood flood-color="${color}"/><feComposite in2="SourceGraphic" operator="in" result="unused"/></filter><filter id="${id}ink" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1 0 0 0 1" result="ink"/><feFlood flood-color="${color}"/><feComposite in2="ink" operator="in"/></filter></defs><image href="assets/images/illustration/type-forms/type-${String(n).padStart(2,'0')}.png" width="2481" height="3508" filter="url(#${id}ink)"/></svg>`;}
 function mark(x,y,k,angle){const el=document.createElement('span');el.className='e25-mark';const n=serial++;let size=36;
  if(k==='vegetaria'){size=34+(n%3)*8;el.innerHTML='<img src="assets/motion-study-26/vegetaria-logo.png" alt="">';}
  if(k==='aota'){size=34;el.innerHTML=`<img src="assets/motion-study-26/aota-pattern-${n%9+1}.png" alt="">`;}
  if(k==='wp'){size=25;el.innerHTML=svg(['<rect x="4" y="4" width="56" height="56"/>','<path d="M4 60V32A28 28 0 0 1 60 32V60Z"/>','<path d="M4 60V4A56 56 0 0 1 60 60Z"/>','<rect x="4" y="17" width="56" height="30"/>'][n%4]);}
  if(k==='book'||k==='paper'){size=24;el.innerHTML=svg('<path d="M12 5H42L54 18V59H12Z" fill="white" stroke="#777" stroke-width="2"/><path d="M42 5V18H54M20 30H44M20 38H40" fill="none" stroke="#999" stroke-width="2"/>');}
  if(k==='bloom'){size=72;el.innerHTML=bloom(n%36+1,palette[n%4]);}
  if(k==='signature'){size=62;el.innerHTML=`<img src="assets/images/image-000${n%3+1}.png" alt="">`;}
  Object.assign(el.style,{left:`${x+12}px`,top:`${y+12}px`,width:`${size}px`,height:`${size}px`});layer.append(el);
  while(layer.querySelectorAll('.e25-mark').length>6)layer.querySelector('.e25-mark').remove();
  const rot=k==='aota'||k==='wp'?0:Math.max(-15,Math.min(15,angle*.15));
  el.animate([{transform:`translate(-50%,-50%) rotate(${rot}deg) scale(.85)`,opacity:.95},{transform:`translate(-50%,-55%) rotate(${rot}deg) scale(1)`,opacity:.9,offset:.3},{transform:`translate(-50%,-65%) rotate(${rot}deg) scale(.85)`,opacity:0}],{duration:650,easing:'ease-out'}).onfinish=()=>el.remove();
 }
 function animateH(t){hFrame=0;const dt=Math.min(40,t-(hTime||t));hTime=t;hHeight+=(hTarget-hHeight)*(1-Math.exp(-dt/110));h.style.height=`${hHeight}px`;h.style.left=`${hx+18}px`;h.style.top=`${hy+12}px`;if(Math.abs(hHeight-hTarget)>.1)hFrame=requestAnimationFrame(animateH);}
 let rest;
 document.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  const project=e.target.closest('[data-e25-theme]');const next=project?.dataset.e25Theme||'';
  if(next!==theme){theme=next;last=null;layer.querySelectorAll('.e25-mark').forEach(el=>el.remove());}
  if(!theme||e.target.closest('.topnav,.project-head,.portfolio-head,iframe,.vegetaria-lightbox-v78')){h.style.opacity='0';last=null;return;}
  const now=performance.now();const dx=last?e.clientX-last.x:0,dy=last?e.clientY-last.y:0;
  if(theme==='hozzz'){h.style.opacity='1';hx=e.clientX;hy=e.clientY;hTarget=52+Math.min(70,Math.hypot(dx,dy)*1.2);if(!hFrame){hTime=0;hFrame=requestAnimationFrame(animateH);}clearTimeout(rest);rest=setTimeout(()=>{hTarget=52;if(!hFrame){hTime=0;hFrame=requestAnimationFrame(animateH);}},90);last={x:e.clientX,y:e.clientY};return;}
  h.style.opacity='0';if(!last){last={x:e.clientX,y:e.clientY};return;}
  if(Math.hypot(dx,dy)<32||now-stamp<65)return;stamp=now;last={x:e.clientX,y:e.clientY};mark(e.clientX,e.clientY,theme,Math.atan2(dy,dx)*180/Math.PI);
 },{passive:true});
 const clear=()=>{h.style.opacity='0';last=null;layer.querySelectorAll('.e25-mark').forEach(el=>el.remove());};
 document.addEventListener('pointerleave',clear);addEventListener('blur',clear);addEventListener('scroll',clear,{passive:true});
})();
