(function(){
  'use strict';

  var reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  var scriptBase=document.currentScript&&document.currentScript.src
    ?new URL('.',document.currentScript.src)
    :new URL('./',window.location.href);

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

  function wipStickerSvg(){
    var mark=getComputedStyle(document.documentElement).getPropertyValue('--mark').trim()||'#d9695a';
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 310">',
      '<rect x="18" y="18" width="1164" height="274" rx="42" fill="'+mark+'"/>',
      '<text x="82" y="198" fill="#fffaf0" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="142" font-weight="700" letter-spacing="-10">WIP</text>',
      '<line x1="405" y1="82" x2="405" y2="228" stroke="#fffaf0" stroke-width="3" stroke-dasharray="7 10" opacity=".55"/>',
      '<text x="458" y="174" fill="#fffaf0" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="37" font-weight="700" letter-spacing="3">COLLECTING CAMPAIGN RESULTS</text>',
      '</svg>'
    ].join('');
  }

  async function initWipSticker(){
    var shell=document.querySelector('[data-wip-sticker-shell]');
    var sticker=document.querySelector('#wip-sticker');
    if(!shell||!sticker)return;

    try{
      await import(new URL('./vendor/sticker-forge/sticker-forge.es.js',scriptBase).href);
      await customElements.whenDefined('sticker-forge');
      sticker.addEventListener('error',function(event){
        console.warn('WIP sticker:',event.detail&&event.detail.message?event.detail.message:'rendering error');
      });
      sticker.setOptions({
        outline:{width:18,color:'#fffdf6'},
        shadow:{color:'#2e2822',opacity:.22,blur:22,distance:16,angle:42},
        peel:{radius:.12,stiffness:.72,grabWidth:26,maxAngle:3.1,release:'reset'},
        sound:{enabled:false,volume:0},
        back:{color:'#f7f5f2',gloss:.7,roughness:.3},
        tilt:-3,
        wind:0,
        quality:'medium'
      });
      await sticker.setSource({type:'svg',svg:wipStickerSvg()});
      var canvas=sticker.shadowRoot&&sticker.shadowRoot.querySelector('canvas');
      if(canvas){
        canvas.setAttribute('aria-label','Work in progress. Collecting campaign results. Drag an edge to peel; use arrow keys to adjust and Space to reset.');
      }
      shell.classList.add('is-live');
    }catch(error){
      console.warn('Interactive WIP sticker unavailable; using the static fallback.',error);
    }
  }

  function initPage(){
    initReveals();
    initWipSticker();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initPage,{once:true});
  }else{
    initPage();
  }
})();
