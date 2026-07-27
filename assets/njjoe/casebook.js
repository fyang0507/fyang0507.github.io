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

  // Clicking the sticker anywhere outside peel.grabWidth of an edge (i.e. most of
  // the middle) makes sticker-forge play an "interaction hint": it tints the
  // grabbable band and draws a dashed boundary around it, showing where you can
  // actually grab. Useful, but its colour is hardcoded to rgb(36,126,245) and is
  // not exposed through setOptions, so a bright blue flashed across the sticker
  // on every mis-click. Repaint the uniform in --paper instead, which matches the
  // cream dashed inner border the CSS fallback already uses.
  // Reach-through to sticker.instance is deliberate: it is the only handle on the
  // uniform. Re-read it on every hint, because setSource and outline changes
  // rebuild the material and would otherwise restore the blue.
  // To drop the hint entirely instead, replace the body below with:
  //   engine.startInteractionHint=function(){};
  function recolourInteractionHint(sticker){
    var engine=sticker.instance;
    if(!engine||typeof engine.startInteractionHint!=='function')return;
    var paper=getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()||'#fbf6ec';
    function paintHint(){
      var uniform=engine.uniforms&&engine.uniforms.uInteractionHintColor;
      if(uniform&&uniform.value&&typeof uniform.value.set==='function')uniform.value.set(paper);
    }
    paintHint();
    var showHint=engine.startInteractionHint.bind(engine);
    engine.startInteractionHint=function(){paintHint();return showHint();};
  }

  // ---- sticker sharpness -------------------------------------------------
  // sticker-forge rasterizes any source to a fixed 1740px long side plus 144px
  // of padding per side, so there is no way to ask it for a bigger texture and
  // no amount of redrawing changes the artwork's resolution. What we can do is
  // stop discarding the resolution it already hands us. Two things were doing
  // that, both measured by reading the WebGL framebuffer directly (screenshots
  // are too lossy to show the difference):
  //
  //   1. uMap ships with trilinear mipmapping. The artwork spans 2028px of
  //      texture but only ~1446px of buffer, so every frame blended mip 0 with
  //      the half-resolution mip 1. Glyph edges measured 2.76 device px.
  //   2. .wip-sticker-engine paints the buffer through transform:scale(1.08),
  //      stretching it a further 8% after the fact.
  //
  // Supersampling until the texture samples 1:1 takes edges to 1.79px - 35%
  // crisper (mean over 215 edges across 15 scanlines). Beyond the 1:1 point the
  // texture is merely magnified: 1.7x and 2x supersampling both measured *worse*
  // than 1:1 while costing 1.5-2x the pixels. Anisotropy made no difference at
  // all (the sticker is viewed near head-on).
  var LINEAR_FILTER=1006,LINEAR_MIPMAP_LINEAR_FILTER=1008; // THREE constants, inlined
  // Cap on supersampling. A small sticker (phone) would need an enormous buffer to
  // reach 1:1, and past 1:1 the texture is only magnified, so there is nothing to
  // win. Measured: 1.7x and 2x both came out worse than the 1:1 point.
  var MAX_SUPERSAMPLE=1.6;

  // How many buffer pixels the artwork currently spans.
  function artworkSpanPx(inst){
    var canvas=inst&&inst.renderer&&inst.renderer.domElement;
    if(!inst||!inst.artwork||!canvas||!inst.viewWidth)return 0;
    return (inst.meshWidth/inst.viewWidth)*canvas.width;
  }

  // Derived from the element's live geometry, so this adapts to any window size,
  // breakpoint or device pixel ratio rather than assuming desktop.
  function syncRenderScale(sticker){
    if(typeof sticker.setRenderScale!=='function')return;
    var layoutWidth=sticker.offsetWidth;
    if(!layoutWidth)return;
    // Below the mobile breakpoint transform is none, so this is 1 and costs nothing.
    var cssScale=sticker.getBoundingClientRect().width/layoutWidth;
    var inst=sticker.instance;
    var spanPx=artworkSpanPx(inst);
    var target=cssScale;
    if(spanPx>0){
      var ideal=inst.renderScale*(inst.artwork.width/spanPx);
      target=Math.max(cssScale,Math.min(ideal,cssScale*MAX_SUPERSAMPLE));
    }
    sticker.setRenderScale(target); // engine clamps to [1, 2.6]
  }

  // Run this after syncRenderScale - setRenderScale resizes synchronously, so the
  // ratio measured here is the one we actually ended up with.
  function syncTextureFiltering(sticker){
    var inst=sticker.instance;
    var uniforms=inst&&inst.stickerMaterial&&inst.stickerMaterial.uniforms;
    if(!uniforms)return;
    var spanPx=artworkSpanPx(inst);
    var minification=spanPx>0?inst.artwork.width/spanPx:1;
    // Once sampling is ~1:1 mipmaps are pure loss - mip 0 is already the correct
    // level and trilinear only blends blur in. If the cap above left the texture
    // genuinely minified, keep them: that is the case they exist for, and without
    // them the print would alias instead of merely soften.
    var wantMipmaps=minification>1.15;
    var filter=wantMipmaps?LINEAR_MIPMAP_LINEAR_FILTER:LINEAR_FILTER;
    ['uMap','uPreparedMap'].forEach(function(key){
      var texture=uniforms[key]&&uniforms[key].value;
      if(!texture||!texture.isTexture)return;
      if(texture.minFilter===filter&&texture.generateMipmaps===wantMipmaps)return;
      texture.minFilter=filter;
      texture.generateMipmaps=wantMipmaps;
      // dispose() forces a full re-upload; needsUpdate alone keeps the old mip chain.
      texture.dispose();
      texture.needsUpdate=true;
    });
    if(typeof inst.requestRender==='function')inst.requestRender();
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
      recolourInteractionHint(sticker);
      syncRenderScale(sticker);
      syncTextureFiltering(sticker);
      // Breakpoints and window size change both the CSS scale and how many buffer
      // pixels the artwork spans, so re-derive both on resize.
      var sharpnessTimer=null;
      window.addEventListener('resize',function(){
        window.clearTimeout(sharpnessTimer);
        sharpnessTimer=window.setTimeout(function(){
          syncRenderScale(sticker);
          syncTextureFiltering(sticker);
        },150);
      });
      var canvas=sticker.shadowRoot&&sticker.shadowRoot.querySelector('canvas');
      if(canvas){
        var baseLabel=shell.getAttribute('aria-label')||'Work in progress. Drag an edge to peel the sticker; it resets when released.';
        canvas.setAttribute('aria-label',baseLabel+' Use arrow keys to adjust and Space to reset.');
        var ink=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#33302b';
        // sticker-forge calls canvas.focus() itself on pointerdown whenever the
        // press lands on a grabbable edge, and Chrome reports programmatic focus
        // as :focus-visible. Testing :focus-visible alone therefore painted this
        // ring on ordinary mouse grabs - a persistent dark rectangle around the
        // whole peel canvas until you clicked elsewhere. Track the real input
        // modality instead, so the ring is reserved for keyboard navigation.
        var keyboardNav=false;
        function hideFocusRing(){canvas.style.outline='none';}
        function showFocusRing(){
          canvas.style.outline='2px solid '+ink;
          canvas.style.outlineOffset='6px';
          canvas.style.borderRadius='8px';
        }
        hideFocusRing();
        // Capture phase: these must settle before the engine's own pointerdown
        // handler runs and moves focus.
        document.addEventListener('keydown',function(){keyboardNav=true;},true);
        document.addEventListener('pointerdown',function(){keyboardNav=false;hideFocusRing();},true);
        canvas.addEventListener('focus',function(){
          if(keyboardNav&&canvas.matches(':focus-visible'))showFocusRing();
        });
        canvas.addEventListener('blur',hideFocusRing);
      }
      shell.classList.add('is-live');
    }catch(error){
      // The fallback is hidden by default so it never flashes during the engine's
      // load; this is the only thing that reveals it in a scripted browser.
      shell.classList.add('is-failed');
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
