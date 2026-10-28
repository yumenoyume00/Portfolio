// Local wrapper bridge. The study34 baseline and its motion code remain untouched.
(() => {
let requestedSection = 'projects';
let requestedProject = null;
const destinations = fetch('/Portfolio/room-content/project-destinations.json').then(response => {
  if (!response.ok) throw Error('Project destinations unavailable');
  return response.json();
});
const navigate = async (section, showIndex = false, project = null) => {
  if (section !== 'about' && section !== 'projects' && section !== 'contact') return;
  requestedSection = section;
  requestedProject = project;
  const records = await destinations;
  // Cancel an older asynchronous destination if a new user choice arrived.
  if (section !== requestedSection || project !== requestedProject) return;
  let target = document.getElementById(section);
  if (section === 'projects' && Object.hasOwn(records, project)) {
    const title = records[project].title;
    target = [...document.querySelectorAll('article.project')].find(article => {
      const head = article.querySelector('.project-title');
      if (!head) return false;
      const copy = head.cloneNode(true);
      copy.querySelectorAll('small').forEach(small => small.remove());
      return copy.textContent.trim() === title;
    }) || target;
    if (target) target.dataset.portfolioProject = project;
  }
  document.querySelector('.project-index')?.classList.toggle('open', showIndex);
  target?.scrollIntoView({ behavior: 'instant', block: 'start' });
  // A direct navigation is not an in-progress scroll entrance. Finish only the
  // first title's mask so a jump cannot leave half-cut lines frozen on screen.
  document.querySelectorAll('.integration-arrived').forEach(head=>head.classList.remove('integration-arrived'));
  if(section==='projects') (project ? target?.querySelector('.project-head') : document.querySelector('#uiux .project-head'))?.classList.add('integration-arrived');
  window.dispatchEvent(new Event('scroll'));
};
const style=document.createElement('style');
style.textContent='.integration-arrived{visibility:visible!important}.integration-arrived .e19-project-ink,.integration-arrived .e27-copy-mask>*{transform:none!important;opacity:1!important}.integration-arrived .e27-app-mask{overflow:visible!important}';
document.head.append(style);
const resumeScroll=()=>document.querySelectorAll('.integration-arrived').forEach(head=>head.classList.remove('integration-arrived'));
addEventListener('wheel',resumeScroll,{passive:true});addEventListener('touchstart',resumeScroll,{passive:true});
addEventListener('message', event => {
  if (event.origin === location.origin && event.source === parent && event.data?.type === 'portfolio-navigate') navigate(event.data.section, event.data.index, event.data.project ?? null);
});
document.querySelector('a[href="#room"]')?.addEventListener('click', event => { event.preventDefault(); parent.postMessage({ type: 'portfolio-room' }, location.origin); });
document.body.classList.remove('is-landing', 'about-intro-pending', 'e04-boards-waiting');
document.body.classList.add('e03-nav-ready', 'e03-copy-ready');
document.body.tabIndex = 0;
window.dispatchEvent(new Event('e04-home-ready'));
// The original document resets its starting scroll during pageshow. Restore the
// requested integration destination after that handler, and handshake before
// videos/embedded readers have finished loading.
const ready=()=>{navigate(requestedSection,false,requestedProject);parent.postMessage({type:'portfolio-ready'},location.origin);};
addEventListener('DOMContentLoaded',ready,{once:true});
addEventListener('pageshow',ready);
})();
