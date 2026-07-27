(function(){
  'use strict';

  var chapterFiles=new Set([
    'Building-FredAgent.dc.html',
    'Building-FredAgent-System.dc.html',
    'Building-FredAgent-Principles.dc.html',
    'Building-FredAgent-Components.dc.html',
    'Building-FredAgent-Demos.dc.html'
  ]);
  var pageCache=new Map();
  var activeRequest=null;
  var reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  var revealObserver=null;
  var evidenceScopeObserver=window.ResizeObserver?new ResizeObserver(function(entries){
    entries.forEach(function(entry){layoutEvidenceScopeImage(entry.target)});
  }):null;

  function initReveals(){
    if(reducedMotion.matches||!window.IntersectionObserver)return;
    document.documentElement.classList.add('reveal-ready');
    if(!revealObserver){
      revealObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting)return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },{rootMargin:'0px 0px -6% 0px',threshold:0.1});
    }
    Array.prototype.forEach.call(document.querySelectorAll('#dc-root .fa-reveal:not([data-reveal-bound])'),function(el){
      el.setAttribute('data-reveal-bound','');
      revealObserver.observe(el);
    });
  }

  function layoutEvidenceScopeImage(image){
    var wrap=image.closest('.fa-evidence-shot-wrap');
    if(!wrap||!image.clientWidth||!image.clientHeight)return;
    Array.prototype.forEach.call(wrap.querySelectorAll('.fa-evidence-loupe[data-scope-target-x]'),function(scope){
      var annotation=scope.closest('.fa-evidence-annotation');
      var zoom=parseFloat(getComputedStyle(annotation).getPropertyValue('--scope-zoom'))||1;
      var targetX=parseFloat(scope.getAttribute('data-scope-target-x'))/100;
      var targetY=parseFloat(scope.getAttribute('data-scope-target-y'))/100;
      var backgroundWidth=image.clientWidth*zoom;
      var backgroundHeight=image.clientHeight*zoom;
      var offsetX=scope.offsetWidth/2-targetX*backgroundWidth;
      var offsetY=scope.offsetHeight/2-targetY*backgroundHeight;
      scope.style.backgroundSize=backgroundWidth+'px '+backgroundHeight+'px';
      scope.style.backgroundPosition=offsetX+'px '+offsetY+'px';
    });
  }

  function initEvidenceScopes(){
    Array.prototype.forEach.call(document.querySelectorAll('#dc-root .fa-evidence-shot-wrap img:not([data-scope-image-bound])'),function(image){
      image.setAttribute('data-scope-image-bound','');
      image.fredAgentScopeLoad=function(){layoutEvidenceScopeImage(image)};
      image.addEventListener('load',image.fredAgentScopeLoad);
      if(evidenceScopeObserver)evidenceScopeObserver.observe(image);
      if(image.complete)layoutEvidenceScopeImage(image);
    });
  }

  function destroyEvidenceScopes(root){
    Array.prototype.forEach.call(root.querySelectorAll('.fa-evidence-shot-wrap img[data-scope-image-bound]'),function(image){
      if(evidenceScopeObserver)evidenceScopeObserver.unobserve(image);
      if(image.fredAgentScopeLoad)image.removeEventListener('load',image.fredAgentScopeLoad);
      delete image.fredAgentScopeLoad;
    });
  }

  function setEvidenceFocusMode(wrap,isActive){
    var group=wrap.closest('[data-evidence-focus-group]');
    var wraps=group?group.querySelectorAll('.fa-evidence-shot-wrap'):[wrap];
    Array.prototype.forEach.call(wraps,function(targetWrap){
      targetWrap.classList.toggle('is-focus-mode',isActive);
      Array.prototype.forEach.call(targetWrap.querySelectorAll('.fa-evidence-loupe'),function(trigger){
        trigger.setAttribute('aria-expanded',isActive?'true':'false');
      });
    });
  }

  function initEvidenceAnnotations(){
    Array.prototype.forEach.call(document.querySelectorAll('#dc-root .fa-evidence-shot-wrap:not([data-evidence-bound])'),function(wrap){
      var triggers=wrap.querySelectorAll('.fa-evidence-loupe');
      if(!triggers.length)return;
      wrap.setAttribute('data-evidence-bound','');
      setEvidenceFocusMode(wrap,false);
      Array.prototype.forEach.call(triggers,function(trigger){
        trigger.addEventListener('click',function(event){
          event.preventDefault();
          event.stopPropagation();
          var willFocus=!wrap.classList.contains('is-focus-mode');
          setEvidenceFocusMode(wrap,willFocus);
          if(!willFocus)trigger.blur();
        });
      });
      wrap.addEventListener('click',function(event){
        if(!wrap.classList.contains('is-focus-mode'))return;
        event.preventDefault();
        setEvidenceFocusMode(wrap,false);
      });
      wrap.addEventListener('keydown',function(event){
        if(event.key!=='Escape'||!wrap.classList.contains('is-focus-mode'))return;
        setEvidenceFocusMode(wrap,false);
        if(event.target&&event.target.classList.contains('fa-evidence-loupe'))event.target.focus();
      });
    });
  }

  function chapterFile(url){
    var parts=url.pathname.split('/');
    return parts[parts.length-1];
  }

  function isChapterUrl(url){
    return url.origin===window.location.origin&&chapterFiles.has(chapterFile(url));
  }

  function renderedPage(){
    return document.querySelector('#dc-root .fa-page');
  }

  function parsedPage(doc){
    return doc.querySelector('x-dc .fa-page')||doc.querySelector('.fa-page');
  }

  function parsedStage(doc){
    var page=parsedPage(doc);
    return page&&page.querySelector('#main-content.fa-stage');
  }

  function updateMetadata(doc){
    document.title=doc.title;
    var currentDescription=document.querySelector('meta[name="description"]');
    var nextDescription=doc.querySelector('meta[name="description"]');
    if(currentDescription&&nextDescription){
      currentDescription.setAttribute('content',nextDescription.getAttribute('content')||'');
    }
  }

  function updateShell(doc,url){
    var currentPage=renderedPage();
    var nextPage=parsedPage(doc);
    if(!currentPage||!nextPage)return;

    currentPage.dataset.screenLabel=nextPage.dataset.screenLabel||'';

    var currentStatus=currentPage.querySelector('.site-header-status');
    var nextStatus=nextPage.querySelector('.site-header-status');
    if(currentStatus&&nextStatus)currentStatus.textContent=nextStatus.textContent;

    var activeFile=chapterFile(url);
    Array.prototype.forEach.call(currentPage.querySelectorAll('.fa-project-nav a'),function(link){
      var linkFile=chapterFile(new URL(link.href,window.location.href));
      if(linkFile===activeFile)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  }

  function scrollToStage(stage,hash){
    if(hash){
      var target=stage.querySelector(hash);
      if(target){
        target.scrollIntoView();
        return;
      }
    }

    var strip=document.querySelector('#dc-root .fa-project-strip');
    var stripIsPinned=strip&&Math.abs(strip.getBoundingClientRect().top)<2&&window.scrollY>strip.offsetTop;
    var top=stripIsPinned?stage.offsetTop-strip.offsetHeight-8:0;
    window.scrollTo({top:Math.max(0,top),left:0,behavior:'instant'});
  }

  function setBusy(isBusy){
    var page=renderedPage();
    if(!page)return;
    if(isBusy)page.setAttribute('aria-busy','true');
    else page.removeAttribute('aria-busy');
  }

  function fetchChapter(url,signal){
    var key=url.pathname+url.search;
    if(pageCache.has(key))return Promise.resolve(pageCache.get(key));
    return fetch(url.href,{signal:signal,headers:{'X-Requested-With':'Fred-Agent-Navigation'}})
      .then(function(response){
        if(!response.ok)throw new Error('Chapter request failed with '+response.status);
        return response.text();
      })
      .then(function(html){
        pageCache.set(key,html);
        return html;
      });
  }

  function navigate(url,options){
    options=options||{};
    if(activeRequest)activeRequest.abort();
    var controller=new AbortController();
    activeRequest=controller;
    setBusy(true);

    return fetchChapter(url,controller.signal)
      .then(function(html){
        var doc=new DOMParser().parseFromString(html,'text/html');
        var nextStage=parsedStage(doc);
        var currentStage=document.querySelector('#dc-root #main-content.fa-stage');
        if(!nextStage||!currentStage)throw new Error('Chapter content was not found');

        function performSwap(){
          var importedStage=document.importNode(nextStage,true);
          destroySystemMaps(currentStage);
          destroyEvidenceScopes(currentStage);
          currentStage.replaceWith(importedStage);
          updateMetadata(doc);
          updateShell(doc,url);

          if(options.history!=='pop')history.pushState({fredAgentChapter:true},'',url.href);
          scrollToStage(importedStage,url.hash);
          initSystemMaps();
          initEvidenceScopes();
          initEvidenceAnnotations();
          initReveals();
        }

        var canAnimate=!reducedMotion.matches&&typeof document.startViewTransition==='function';
        if(canAnimate){
          var transition=document.startViewTransition(performSwap);
          transition.ready.catch(function(){});
          transition.finished.catch(function(){});
        }else performSwap();
      })
      .catch(function(error){
        if(error.name==='AbortError')return;
        window.location.assign(url.href);
      })
      .finally(function(){
        if(activeRequest===controller){
          setBusy(false);
          activeRequest=null;
        }
      });
  }

  function shouldHandleClick(event,link,url){
    return event.button===0&&
      !event.defaultPrevented&&
      !event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&
      !link.hasAttribute('download')&&
      (!link.target||link.target==='_self')&&
      isChapterUrl(url);
  }

  document.addEventListener('click',function(event){
    var link=event.target.closest&&event.target.closest('.fa-project-nav a');
    if(!link)return;
    var url=new URL(link.href,window.location.href);
    if(!shouldHandleClick(event,link,url))return;
    event.preventDefault();
    if(url.pathname===window.location.pathname&&url.search===window.location.search){
      scrollToStage(document.querySelector('#dc-root #main-content.fa-stage'),url.hash);
      return;
    }
    navigate(url);
  });

  window.addEventListener('popstate',function(){
    var url=new URL(window.location.href);
    if(isChapterUrl(url))navigate(url,{history:'pop'});
  });

  function initSystemMap(shell){
    if(!shell||shell.dataset.mapReady==='true')return;
    shell.dataset.mapReady='true';
    var map=shell.querySelector('.system-map');
    var nodes=Array.prototype.slice.call(shell.querySelectorAll('[data-node-id]'));
    var edges=Array.prototype.slice.call(shell.querySelectorAll('.map-edge'));
    var rails=Array.prototype.slice.call(shell.querySelectorAll('[data-rail-id]'));
    var clearButton=shell.querySelector('[data-map-clear]');
    var detail=shell.querySelector('.map-detail');
    var detailLabel=shell.querySelector('[data-detail-label]');
    var detailTitle=shell.querySelector('[data-detail-title]');
    var detailSummary=shell.querySelector('[data-detail-summary]');
    var detailMeta=shell.querySelector('[data-detail-meta]');
    var nodeById={};
    var lockedId=null;
    var resizeObserver=null;
    if(!map||!clearButton||!detail)return;

    nodes.forEach(function(node){
      nodeById[node.dataset.nodeId]=node;
      node.setAttribute('aria-controls','map-detail');
      node.setAttribute('aria-expanded','false');
    });

    function incoming(id){return edges.filter(function(edge){return edge.dataset.to===id})}
    function outgoing(id){return edges.filter(function(edge){return edge.dataset.from===id})}

    function buildPath(id){
      var selected=nodeById[id];
      var ids=new Set([id]);
      if(!selected)return ids;
      var layer=selected.dataset.layer;
      if(layer==='use-case'){
        incoming(id).forEach(function(edge){
          ids.add(edge.dataset.from);
          incoming(edge.dataset.from).forEach(function(dependency){ids.add(dependency.dataset.from)});
        });
      }else if(layer==='workflow'){
        incoming(id).forEach(function(edge){ids.add(edge.dataset.from)});
        outgoing(id).forEach(function(edge){ids.add(edge.dataset.to)});
      }else{
        outgoing(id).forEach(function(edge){
          ids.add(edge.dataset.to);
          outgoing(edge.dataset.to).forEach(function(outcome){ids.add(outcome.dataset.to)});
        });
      }
      return ids;
    }

    function activeRails(ids){
      var result=new Set();
      ids.forEach(function(id){
        var node=nodeById[id];
        if(!node||!node.dataset.rails)return;
        node.dataset.rails.split(/\s+/).forEach(function(rail){if(rail)result.add(rail)});
      });
      return result;
    }

    function render(id,isLocked){
      if(!id){
        map.classList.remove('is-tracing');
        nodes.forEach(function(node){
          node.classList.remove('is-path','is-selected');
          node.setAttribute('aria-pressed','false');
          node.setAttribute('aria-expanded','false');
        });
        edges.forEach(function(edge){edge.classList.remove('is-path')});
        rails.forEach(function(rail){rail.classList.remove('is-path')});
        detail.classList.remove('is-open');
        detailLabel.textContent='Module explainer';
        detailTitle.textContent='Click any module';
        detailSummary.textContent='A locked selection explains what the module owns and where it participates.';
        detailMeta.textContent='Click or tap toggles · Escape clears';
        return;
      }
      var selected=nodeById[id];
      if(!selected)return;
      var path=buildPath(id);
      var railIds=activeRails(path);
      map.classList.add('is-tracing');
      nodes.forEach(function(node){
        var inPath=path.has(node.dataset.nodeId);
        node.classList.toggle('is-path',inPath);
        node.classList.toggle('is-selected',node.dataset.nodeId===id);
        node.setAttribute('aria-pressed',isLocked&&node.dataset.nodeId===id?'true':'false');
        node.setAttribute('aria-expanded',isLocked&&node.dataset.nodeId===id?'true':'false');
      });
      edges.forEach(function(edge){edge.classList.remove('is-path')});
      void map.offsetWidth;
      edges.forEach(function(edge){edge.classList.toggle('is-path',path.has(edge.dataset.from)&&path.has(edge.dataset.to))});
      rails.forEach(function(rail){rail.classList.toggle('is-path',railIds.has(rail.dataset.railId))});
      if(isLocked){
        detail.classList.add('is-open');
        detailLabel.textContent=selected.dataset.layerLabel;
        detailTitle.textContent=selected.dataset.title;
        detailSummary.textContent=selected.dataset.summary;
        detailMeta.textContent=selected.dataset.uses;
      }else{
        detail.classList.remove('is-open');
      }
    }

    function clear(){lockedId=null;render(null,false)}

    function layoutEdges(){
      var mapRect=map.getBoundingClientRect();
      edges.forEach(function(edge){
        var from=nodeById[edge.dataset.from];
        var to=nodeById[edge.dataset.to];
        if(!from||!to)return;
        var fromRect=from.getBoundingClientRect();
        var toRect=to.getBoundingClientRect();
        var startX=fromRect.left-mapRect.left+fromRect.width/2;
        var startY=fromRect.top-mapRect.top;
        var endX=toRect.left-mapRect.left+toRect.width/2;
        var endY=toRect.bottom-mapRect.top;
        var dx=endX-startX;
        var dy=endY-startY;
        var length=Math.sqrt(dx*dx+dy*dy);
        var angle=Math.atan2(dy,dx)*180/Math.PI;
        edge.style.left=startX+'px';
        edge.style.top=startY+'px';
        edge.style.width=length+'px';
        edge.style.transform='rotate('+angle+'deg)';
      });
    }

    nodes.forEach(function(node){
      var id=node.dataset.nodeId;
      node.addEventListener('mouseenter',function(){if(!lockedId)render(id,false)});
      node.addEventListener('mouseleave',function(){if(!lockedId)render(null,false)});
      node.addEventListener('focus',function(){if(!lockedId)render(id,false)});
      node.addEventListener('blur',function(){if(!lockedId)render(null,false)});
      node.addEventListener('click',function(){
        if(lockedId===id){clear();return}
        lockedId=id;
        render(id,true);
      });
    });
    function handleEscape(event){
      if(event.key==='Escape'&&lockedId){clear();clearButton.focus()}
    }

    clearButton.addEventListener('click',clear);
    document.addEventListener('keydown',handleEscape);
    map.addEventListener('click',function(event){if(event.target===map&&lockedId)clear()});
    if(window.ResizeObserver){
      resizeObserver=new ResizeObserver(layoutEdges);
      resizeObserver.observe(map);
    }
    shell.fredAgentMapCleanup=function(){
      document.removeEventListener('keydown',handleEscape);
      if(resizeObserver)resizeObserver.disconnect();
      delete shell.fredAgentMapCleanup;
    };
    requestAnimationFrame(function(){layoutEdges();requestAnimationFrame(layoutEdges)});
  }

  function destroySystemMaps(root){
    Array.prototype.forEach.call(root.querySelectorAll('[data-system-map]'),function(shell){
      if(shell.fredAgentMapCleanup)shell.fredAgentMapCleanup();
    });
  }

  function initSystemMaps(){
    Array.prototype.forEach.call(document.querySelectorAll('#dc-root [data-system-map]'),initSystemMap);
  }

  function observeRenderedPage(){
    initSystemMaps();
    initEvidenceScopes();
    initEvidenceAnnotations();
    initReveals();
    new MutationObserver(function(){initSystemMaps();initEvidenceScopes();initEvidenceAnnotations();initReveals();}).observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeRenderedPage);
  else observeRenderedPage();
})();
