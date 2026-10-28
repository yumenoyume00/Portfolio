// Fit the existing fixed-size prototypes into the real phone's HTML screen.
const kind = document.currentScript.dataset.app;
const style = document.createElement('style');
style.textContent = `html,body{width:100%!important;height:100%!important;min-height:0!important;overflow:hidden!important;display:block!important;background:white!important;margin:0!important;padding:0!important}
body>div:first-of-type{position:absolute!important;left:50%!important;top:50%!important;margin:0!important;transform-origin:center!important;border:0!important;border-radius:0!important;box-shadow:none!important;min-height:0!important}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;
document.head.appendChild(style);
function fit() {
  const element=document.body.firstElementChild;
  const width=kind==='kuwasawa'?375:390, height=kind==='kuwasawa'?812:844;
  const scale=Math.min(innerWidth/width,innerHeight/height);
  element.style.setProperty('width',width+'px','important');
  element.style.setProperty('height',height+'px','important');
  element.style.setProperty('transform',`translate(-50%,-50%) scale(${scale})`,'important');
}
document.querySelectorAll('main').forEach(element=>element.tabIndex=0);
fit(); addEventListener('resize',fit);
