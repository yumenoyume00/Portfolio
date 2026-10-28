// Room-owned chrome only: original artwork and App/book interiors stay intact.
document.body.classList.add('desktop-open','room-desktop');
const css=document.createElement('style');
css.textContent=`
html,body{background:transparent!important}.global-ui,.home,.background-click{display:none!important}
.computer-screen,body.desktop-open .computer-screen{inset:0!important;transform:none!important;width:100%!important;height:100%!important;aspect-ratio:auto!important;border:0!important;box-shadow:none!important;transition:none!important}
.desktop{background:url('/Portfolio/textures/room/computer-desktop-green.png') center/cover!important;display:flex!important;flex-direction:column!important;padding:0!important;overflow:hidden!important;font-family:"IBM Plex Mono","SFMono-Regular",Menlo,Consolas,monospace!important}
.desktop>*{box-sizing:border-box}.desktop-noise,.hill-back,.hill-front,.flower,.desktop-item,.window{display:none!important}
.desktop-catalogue-top{height:38px;min-height:38px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;color:white;font-size:10px;letter-spacing:.08em;text-shadow:0 1px 5px #0003}
.project-folders{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:14px 12px;flex:1;min-height:0;align-content:center;overflow:auto;padding:12px 18px 24px;scrollbar-width:thin;scrollbar-color:#ffffff50 transparent}
.project-folder{grid-column:span 2}.project-folder:nth-child(5){grid-column:2/span 2}
.project-folder{display:flex;flex-direction:column;align-items:center;gap:7px;min-width:0;border:0;padding:5px 4px;background:none;color:white;font:10px/1.35 "IBM Plex Mono","SFMono-Regular",Menlo,Consolas,monospace;text-align:center;cursor:pointer;text-shadow:0 1px 5px #0005}
.project-folder:focus-visible{outline:1px solid #b5b5b5;outline-offset:2px}.folder-object{position:relative;display:block;width:76px;height:54px;perspective:400px;transition:transform .3s cubic-bezier(.22,.61,.36,1)}
.folder-back{position:absolute;inset:8px 0 0;background:#f6f6f6;border:1px solid #dedede;border-radius:2px}.folder-back:before{content:'';position:absolute;left:-1px;top:-7px;width:29px;height:8px;background:#f6f6f6;border:1px solid #dedede;border-bottom:0;border-radius:2px 3px 0 0}
.folder-peek{position:absolute;left:8px;top:2px;width:60px;height:44px;object-fit:cover;background:white;border:3px solid white;box-shadow:0 1px 3px #0001;transform:rotate(-5deg);transition:transform .3s cubic-bezier(.22,.61,.36,1)}
.folder-front{position:absolute;inset:24px 0 0;background:#fffffff0;border:1px solid #e8e8e8;border-radius:1px 1px 2px 2px;transform-origin:50% 100%;transition:transform .3s cubic-bezier(.22,.61,.36,1)}
.folder-number{position:absolute;right:6px;bottom:4px;color:#b5b5b5;font-size:7px;line-height:1;text-shadow:none;letter-spacing:.06em}
.folder-title{max-width:100%;min-height:27px;display:flex;align-items:flex-start;justify-content:center;white-space:normal;overflow-wrap:normal}
.project-folder:hover .folder-object,.project-folder:focus-visible .folder-object{transform:translateY(-4px)}.project-folder:hover .folder-peek,.project-folder:focus-visible .folder-peek{transform:translateY(-6px) rotate(2deg)}.project-folder:hover .folder-front,.project-folder:focus-visible .folder-front{transform:rotateX(-20deg)}
.project-folder.is-opening .folder-front{transform:rotateX(-65deg)}.project-folder.is-opening .folder-peek{transform:translateY(-15px) rotate(0deg)}
#room-standby{position:absolute;z-index:1000;inset:0;border:0;background:url('/Portfolio/textures/room/computer-desktop-green.png') center/cover;cursor:pointer;transition:opacity .6s ease}#room-standby.awake{opacity:0;pointer-events:none}
@media(min-width:900px){.project-folders{padding:38px 10vw 60px;gap:36px 20px}.folder-object{width:112px;height:80px}.folder-peek{left:12px;width:88px;height:66px}.folder-front{top:35px}.project-folder{font-size:12px;gap:12px}.folder-title{min-height:34px}.folder-number{font-size:9px;right:9px;bottom:7px}.desktop-catalogue-top{height:52px;min-height:52px;padding:0 32px;font-size:12px}}
@media(min-width:451px) and (max-width:899px){.project-folders{gap:10px 12px;padding:10px 18px}.project-folder{padding:2px 4px;gap:5px}.folder-object{width:68px;height:46px}.folder-peek{left:7px;width:54px;height:38px}.folder-front{top:21px}.folder-title{min-height:24px;font-size:9px}}
@media(max-width:450px){.project-folders{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px 8px;padding:16px 12px}.project-folder,.project-folder:nth-child(5){grid-column:auto}.folder-title{font-size:9px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;
document.head.append(css);
const desktop=document.getElementById('desktop');
// Remove old nodes/listeners instead of stacking a duplicate click system.
desktop.replaceChildren();
const topBar=document.createElement('header');topBar.className='desktop-catalogue-top';
const title=document.createElement('span');title.textContent='ZOU MENG / WORKS';
topBar.append(title);
const folders=document.createElement('div');folders.className='project-folders';folders.setAttribute('aria-label','作品フォルダ');
desktop.append(topBar,folders);
let opening=null,selected=null;
fetch('/Portfolio/room-content/desktop-projects.json').then(response=>{if(!response.ok)throw new Error('Project catalogue unavailable');return response.json()}).then(projects=>{
 Object.entries(projects).forEach(([id,project],index)=>{
  const button=document.createElement('button');button.className='project-folder';button.dataset.project=id;button.setAttribute('aria-label',`${project.label} — ${project.category}`);button.title=`${project.category} / ${project.images.length} images`;
  const object=document.createElement('span');object.className='folder-object';object.setAttribute('aria-hidden','true');
  const back=document.createElement('span');back.className='folder-back';const peek=document.createElement('img');peek.className='folder-peek';peek.src=project.images[0].src;peek.alt='';peek.draggable=false;
  const front=document.createElement('span');front.className='folder-front';const number=document.createElement('span');number.className='folder-number';number.textContent=String(index+1).padStart(2,'0');front.append(number);object.append(back,peek,front);
  const label=document.createElement('span');label.className='folder-title';label.textContent=project.label;button.append(object,label);
  button.onclick=()=>{
   clearTimeout(opening);selected?.classList.remove('is-opening');selected=button;button.classList.add('is-opening');
   opening=setTimeout(()=>{parent.postMessage({type:'room-desktop-project',project:id},location.origin);button.classList.remove('is-opening');opening=null},matchMedia('(prefers-reduced-motion:reduce)').matches?0:130);
  };
  folders.append(button);
 });
}).catch(()=>{folders.textContent='読み込めませんでした。再読み込みしてください。'});
addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent)return;
 if(event.data?.type==='room-desktop-return'){
  // A delayed return acknowledgement must not cancel a newer folder choice.
  if(opening!==null)return;
  selected?.classList.remove('is-opening');
  const button=[...folders.querySelectorAll('button')].find(button=>button.dataset.project===event.data.project);button?.focus({preventScroll:true});
 }
});
addEventListener('pagehide',()=>clearTimeout(opening));
const standby=document.createElement('button');standby.id='room-standby';standby.setAttribute('aria-label','画面を起こす');document.body.append(standby);
const wake=()=>{standby.classList.add('awake');standby.tabIndex=-1;standby.setAttribute('aria-hidden','true')};standby.onclick=wake;setTimeout(wake,matchMedia('(prefers-reduced-motion:reduce)').matches?0:1100);
