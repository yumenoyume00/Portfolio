const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const mode = params.get('mode') || 'standalone';
const report = status => parent.postMessage({type:'room-book-status', status}, location.origin);
const closeReader = () => parent.postMessage({type:'room-book-close'}, location.origin);
addEventListener('unhandledrejection', () => report('error'));
const portfolioInfo = await fetch('./book-info.json?v=15').then(r => r.json());
const books = {
 portfolio:{title:'作品集 · 新版',aspect:portfolioInfo.aspect,base:'vendor',pages:'./pages.json?v=15'},
 landscape:{title:'ポートフォリオ・横',aspect:.5625,base:'vendor-landscape',pages:'./books/landscape/apps-only.json?v=20',single:true},
 life:{title:'Life',aspect:765.35/595.28,base:'vendor-life',pages:'./books/life/pages.json'},
 'life-supplement':{title:'Life · 付録',aspect:1.414,base:'vendor-life-supplement',pages:'./books/life-supplement/pages.json'},
 helvetica:{title:'Helvetica',aspect:1,base:'vendor-helvetica',pages:'./books/helvetica/pages.json'},
 hozzz:{title:'HOZZZ',aspect:907.087/663.307,base:'vendor-hozzz',pages:'./books/hozzz/pages.json'},
 aota:{title:'AOTA · 蛇腹折り',aspect:1,base:'vendor',pages:'./books/aota/pages.json'}
};
const requested = params.get('book');
const bookId = Object.hasOwn(books, requested) ? requested : 'portfolio';
const book = books[bookId];
document.title = `ZOU MENG — ${book.title}`;
$('bookSelect').value = bookId;
$('bookSelect').onchange = () => { location.href=`?v=18&book=${encodeURIComponent($('bookSelect').value)}`; };
if(mode !== 'standalone') {
 document.body.classList.add('embedded-reader');
 document.querySelector('.controls').append($('fullscreen'));
}
$('fullscreen').onclick = async () => {
 try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
 catch { parent.postMessage({type:'room-book-expand'},location.origin); }
};
if(bookId === 'aota') {
 $('book').remove(); $('status').remove();
 document.querySelector('footer').style.display='none';
 $('settingButton').style.display='none'; $('stage').style.bottom='0';
 if(mode!=='standalone'){document.body.append($('fullscreen'));Object.assign($('fullscreen').style,{position:'fixed',right:'12px',bottom:'8px',zIndex:'20'});}
 const frame=document.createElement('iframe');
 frame.src='./reference/aota/index.html?v=18'; frame.title='AOTA — 蛇腹折り';
 Object.assign(frame.style,{width:'100%',height:'100%',border:'0'});
 let resolveReady;
 const ready = new Promise(resolve => {resolveReady=resolve;});
 frame.onload=()=>{
  const loading=frame.contentDocument?.getElementById('loading');
  const check=()=>{
   if(!loading || loading.classList.contains('hidden')) {report('ready');resolveReady();observer?.disconnect();}
   else if(loading.classList.contains('error')) report('error');
  };
  const observer=loading?new MutationObserver(check):null;
  observer?.observe(loading,{attributes:true,attributeFilter:['class']}); check();
  frame.contentDocument?.addEventListener('keydown',e=>{if(e.key==='Escape')closeReader();});
 };
 $('stage').append(frame);
 window.openAotaBook=()=>ready.then(()=>frame.contentWindow.openAotaBook?.());
 window.closeAotaBook=()=>frame.contentWindow?.closeAotaBook?.();
 window.getAotaBookState=()=>frame.contentWindow?.getAotaBookState?.() || (frame.contentDocument?.body.classList.contains('book-open')?'open':'cover');
 addEventListener('keydown',e=>{if(e.key==='Escape')closeReader();});
} else {
 const version=bookId==='landscape'?'19':['hozzz','life-supplement'].includes(bookId)?'18':'15';
 const {MagazineEngine}=await import(`./${book.base}/MagazineEngine.js?v=${version}`);
 const {MobileMagazineEngine}=await import(`./${book.base}/mobile/MobileMagazineEngine.js?v=${version}`);
 const pages=await fetch(book.pages).then(r=>{if(!r.ok)throw Error('Pages unavailable');return r.json();});
 const narrow=matchMedia('(max-width:650px)');
 const storageKey=`paper-reader:${bookId}:${pages.length}`;
 let engine,single=false,left=null,right=1,current=0;
 if(mode==='room')try{const saved=Number(sessionStorage.getItem(storageKey));if(Number.isInteger(saved)&&saved>=1&&saved<=pages.length)right=saved;}catch{}
 if(mode==='room')try{
  const saved=JSON.parse(sessionStorage.getItem('portfolio-presentation-return')||'null');
  if(saved?.book===(bookId==='portfolio'?'portfolio-portrait':bookId==='landscape'?'portfolio-landscape':null)&&Number.isInteger(saved.page)&&saved.page>=1&&saved.page<=pages.length){right=saved.page;sessionStorage.removeItem('portfolio-presentation-return');}
 }catch{}
 function update(sheet,l,r) {
  current=sheet;left=l;right=r;
  $('count').textContent=`${[l,r].filter(Boolean).join(' – ')} / ${pages.length}`;
  $('prev').disabled=sheet===0;
  $('next').disabled=single?sheet>=pages.length-1:sheet>=Math.ceil(pages.length/2);
  $('book').dataset.page=String(r||l);
  document.documentElement.dataset.bookState=sheet===0?'cover':!r?'back':'open';
  if(['portfolio','hozzz','life-supplement'].includes(bookId))$('book').style.transform=single?'':sheet===0?'translateX(-25%)':sheet===Math.ceil(pages.length/2)?'translateX(25%)':'';
  try{sessionStorage.setItem(storageKey,String(r||l||1));}catch{}
 }
 function fallback() {
  engine?.dispose();engine=null;
  $('status').style.display='none';$('book').hidden=true;$('fallback').hidden=false;
  updateFallback();report('ready');
 }
 function updateFallback() {
  const n=right||left||1;
  const image=new Image();image.src=pages[n-1].imageUrl;image.alt=`${n} / ${pages.length}`;
  if(bookId==='life-supplement')image.style.clipPath=n%2?'polygon(0 1.4%,100% 32.2%,100% 100%,0 100%)':'polygon(0 32.2%,100% 1.4%,100% 100%,0 100%)';
  $('fallback').replaceChildren(image);update(n-1,null,n);
 }
 function create() {
  const page=Math.max(0,(right||left||1)-1);
  engine?.dispose();$('book').replaceChildren();
  single=book.single || narrow.matches || $('layout').value==='single';$('curl').disabled=single;
  if(book.single){$('layout').value='single';$('layout').disabled=true;}
  const ratio=(single?1:2)/book.aspect;
  $('book').style.aspectRatio=String(ratio);
  $('book').style.width=`min(88vw,calc((100dvh - ${mode==='standalone'?185:92}px)*${ratio}))`;
  try {
   const Engine=single?MobileMagazineEngine:MagazineEngine;
   engine=new Engine({container:$('book'),pageContents:pages,patternUrl:`./${book.base}/texture.webp`,renderOptions:{paperColor:'#ffffff'},initialIndex:page,initialSheet:page===0?0:Math.floor((page+1)/2),textureRadius:1,onPageChange:update,onReady:()=>{document.body.dataset.ready='true';$('status').style.display='none';report('ready');}});
   if(engine.S)engine.S.curlArc=Number($('curl').value);
   const n=engine.getCurrentSheet();
   update(n,single?null:(n===0?null:2*n),single?n+1:(n===Math.ceil(pages.length/2)?null:2*n+1));
  } catch(error) {console.error(error);fallback();}
 }
 $('next').onclick=()=>engine?engine.flipNext():(right=Math.min(pages.length,(right||1)+1),updateFallback());
 $('prev').onclick=()=>engine?engine.flipPrev():(right=Math.max(1,(right||1)-1),updateFallback());
 $('home').onclick=()=>engine?engine.jumpToPage(0):(right=1,updateFallback());
 $('settingButton').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingButton').setAttribute('aria-expanded',String(open));};
 $('layout').onchange=create;narrow.addEventListener('change',create);
 $('curl').oninput=()=>{if(engine?.S)engine.S.curlArc=Number($('curl').value);};
 $('enlarge').onclick=()=>{
  $('detailPages').replaceChildren(...[left,right].filter(n=>n&&n<=pages.length).map(n=>{
   const image=new Image();image.src=pages[n-1].imageUrl;image.alt=`${n} ページ`;
   if(bookId==='life-supplement')image.style.clipPath=n%2?'polygon(0 1.4%,100% 32.2%,100% 100%,0 100%)':'polygon(0 32.2%,100% 1.4%,100% 100%,0 100%)';
   return image;
  }));$('detail').showModal();
 };
 $('detail').querySelector('.close').onclick=()=>$('detail').close();
 addEventListener('keydown',event=>{
  if(event.target.matches('input,select')||$('detail').open)return;
  if(['ArrowRight','ArrowLeft','PageDown','PageUp','Home','End','Escape'].includes(event.key))event.preventDefault();
  if(['ArrowRight','PageDown'].includes(event.key))$('next').click();if(['ArrowLeft','PageUp'].includes(event.key))$('prev').click();
  if(event.key==='Home')$('home').click();if(event.key==='End')engine?.jumpToPage(pages.length-1);
  if(event.key==='Escape'&&!document.fullscreenElement)closeReader();
 });
 $('stage').addEventListener('click',event=>{if(event.target===$('stage')){if(mode==='room')closeReader();else if(mode==='inline')$('home').click();}});
 const open=()=>{if(current===0)$('next').click();};
 window.openLifeBook=open;window.closeLifeBook=()=>$('home').click();
 window.openHozzzBook=open;window.nextHozzzPage=()=>$('next').click();window.closeHozzzBook=()=>$('home').click();
 window.getHozzzPageLabel=()=>$('count').textContent;window.getHozzzBookState=()=>document.documentElement.dataset.bookState||'cover';
 window.openHelveticaBook=open;window.closeHelveticaBook=()=>$('home').click();
 create();
}
