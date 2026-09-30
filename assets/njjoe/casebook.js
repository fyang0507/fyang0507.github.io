(function(){
  'use strict';

  // The Building board links this folder; name its index.html, as the page's own links do, so its skip link stays on it.
  if(/\/$/.test(window.location.pathname))history.replaceState(history.state,'',window.location.pathname+'index.html'+window.location.search+window.location.hash);
  var reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

  function initReveals(){
    var reveals=Array.prototype.slice.call(document.querySelectorAll('#main-content .case-reveal:not([data-reveal-bound])'));
    if(!reveals.length)return;

    if(reducedMotion.matches||!('IntersectionObserver' in window)){
      reveals.forEach(function(element){
        element.dataset.revealBound='true';
        element.classList.add('is-visible');
      });
      return;
    }

    document.documentElement.classList.add('reveal-ready');
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting)return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },{rootMargin:'0px 0px -6% 0px',threshold:.1});

    reveals.forEach(function(element){
      element.dataset.revealBound='true';
      observer.observe(element);
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initReveals,{once:true});
  }else{
    initReveals();
  }
})();
