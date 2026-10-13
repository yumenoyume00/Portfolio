(()=>{
 const deferred='img[data-perf-src],video[data-perf-src],source[data-perf-src],iframe[data-perf-src],iframe[data-perf-srcdoc],iframe[data-e26-src],iframe[data-e26-srcdoc]';
 let refresh=0;
 const relayout=()=>{clearTimeout(refresh);refresh=setTimeout(()=>dispatchEvent(new Event('resize')),100);};
 function activate(el){
  if(el.matches('img'))el.addEventListener('load',relayout,{once:true});
  if(el.matches('iframe')){
   const doc=el.dataset.perfSrcdoc||el.dataset.e26Srcdoc,src=el.dataset.perfSrc||el.dataset.e26Src;
   if(doc)el.srcdoc=doc;else if(src)el.src=src;
   ['data-perf-srcdoc','data-e26-srcdoc','data-perf-src','data-e26-src'].forEach(a=>el.removeAttribute(a));return;
  }
  const src=el.dataset.perfSrc;if(src){el.src=src;el.removeAttribute('data-perf-src');}
  const v=el.matches('video')?el:el.closest('video');if(v){v.preload='metadata';v.load();v.addEventListener('loadeddata',relayout,{once:true});}
 }
 const zoneFor=el=>el.closest('.e27-stage,article.project,.app-scroll-stage-v100,.about,#illustration,.ending')||el;
 const prepared=new WeakSet();const buckets=new Map();
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const items=buckets.get(e.target)||[];items.forEach(activate);buckets.delete(e.target);observer.unobserve(e.target);}},{rootMargin:'100% 0px',threshold:0});
 function scan(){document.querySelectorAll(deferred).forEach(el=>{if(prepared.has(el))return;prepared.add(el);const zone=zoneFor(el);if(el.closest('.e27-mark,.e27-trail,.about-image-lightbox-v96')){activate(el);return;}if(!buckets.has(zone)){buckets.set(zone,[]);observer.observe(zone);}buckets.get(zone).push(el);});}
 scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();