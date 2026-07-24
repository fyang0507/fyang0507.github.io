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

  // "WIP" is the fixed label. statusText is per-page custom content (e.g. "collecting campaign
  // results") - omit it for a plain WIP sticker with no subtitle.
  function wipStickerSvg(statusText){
    var mark=getComputedStyle(document.documentElement).getPropertyValue('--mark').trim()||'#d9695a';
    var parts=[
      // Explicit width/height (2x the viewBox) forces a high-res rasterization -
      // a viewBox-only <svg> with no width/height decodes at the CSS default
      // replaced-element size (300x150) regardless of its coordinate space,
      // which is why the sticker texture read as soft/low-res without this.
      '<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="620" viewBox="0 0 1200 310">',
      '<rect x="18" y="18" width="1164" height="274" rx="42" fill="'+mark+'"/>'
    ];
    if(statusText){
      parts.push(
        '<text x="82" y="198" fill="#fffaf0" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="142" font-weight="700" letter-spacing="-10">WIP</text>',
        '<line x1="405" y1="82" x2="405" y2="228" stroke="#fffaf0" stroke-width="3" stroke-dasharray="7 10" opacity=".55"/>',
        '<text x="458" y="174" fill="#fffaf0" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="37" font-weight="700" letter-spacing="3">'+statusText.toUpperCase()+'</text>'
      );
    }else{
      parts.push('<text x="600" y="198" text-anchor="middle" fill="#fffaf0" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="152" font-weight="700" letter-spacing="-8">WIP</text>');
    }
    parts.push('</svg>');
    return parts.join('');
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
      await sticker.setSource({type:'svg',svg:wipStickerSvg(shell.dataset.wipStatus)});
      var canvas=sticker.shadowRoot&&sticker.shadowRoot.querySelector('canvas');
      if(canvas){
        var baseLabel=shell.getAttribute('aria-label')||'Work in progress. Drag an edge to peel the sticker; it resets when released.';
        canvas.setAttribute('aria-label',baseLabel+' Use arrow keys to adjust and Space to reset.');
        var ink=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#33302b';
        canvas.style.outline='none';
        canvas.addEventListener('focus',function(){
          if(canvas.matches(':focus-visible')){
            canvas.style.outline='2px solid '+ink;
            canvas.style.outlineOffset='6px';
            canvas.style.borderRadius='8px';
          }
        });
        canvas.addEventListener('blur',function(){
          canvas.style.outline='none';
        });
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
