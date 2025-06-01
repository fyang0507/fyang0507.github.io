var pn=Object.defineProperty;var fn=(e,o,a)=>o in e?pn(e,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[o]=a;var Rt=(e,o,a)=>fn(e,typeof o!="symbol"?o+"":o,a);function _mergeNamespaces(e,o){for(var a=0;a<o.length;a++){const s=o[a];if(typeof s!="string"&&!Array.isArray(s)){for(const c in s)if(c!=="default"&&!(c in e)){const h=Object.getOwnPropertyDescriptor(s,c);h&&Object.defineProperty(e,c,h.get?h:{enumerable:!0,get:()=>s[c]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const c of document.querySelectorAll('link[rel="modulepreload"]'))s(c);new MutationObserver(c=>{for(const h of c)if(h.type==="childList")for(const d of h.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&s(d)}).observe(document,{childList:!0,subtree:!0});function a(c){const h={};return c.integrity&&(h.integrity=c.integrity),c.referrerPolicy&&(h.referrerPolicy=c.referrerPolicy),c.crossOrigin==="use-credentials"?h.credentials="include":c.crossOrigin==="anonymous"?h.credentials="omit":h.credentials="same-origin",h}function s(c){if(c.ep)return;c.ep=!0;const h=a(c);fetch(c.href,h)}})();function getDefaultExportFromCjs(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function getAugmentedNamespace(e){if(e.__esModule)return e;var o=e.default;if(typeof o=="function"){var a=function s(){return this instanceof s?Reflect.construct(o,arguments,this.constructor):o.apply(this,arguments)};a.prototype=o.prototype}else a={};return Object.defineProperty(a,"__esModule",{value:!0}),Object.keys(e).forEach(function(s){var c=Object.getOwnPropertyDescriptor(e,s);Object.defineProperty(a,s,c.get?c:{enumerable:!0,get:function(){return e[s]}})}),a}var jsxRuntime={exports:{}},reactJsxRuntime_production_min={},react={exports:{}},react_production_min={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var l$1=Symbol.for("react.element"),n$1=Symbol.for("react.portal"),p$2=Symbol.for("react.fragment"),q$1=Symbol.for("react.strict_mode"),r=Symbol.for("react.profiler"),t=Symbol.for("react.provider"),u=Symbol.for("react.context"),v$1=Symbol.for("react.forward_ref"),w=Symbol.for("react.suspense"),x=Symbol.for("react.memo"),y=Symbol.for("react.lazy"),z$1=Symbol.iterator;function A$1(e){return e===null||typeof e!="object"?null:(e=z$1&&e[z$1]||e["@@iterator"],typeof e=="function"?e:null)}var B$1={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},C$1=Object.assign,D$1={};function E$1(e,o,a){this.props=e,this.context=o,this.refs=D$1,this.updater=a||B$1}E$1.prototype.isReactComponent={};E$1.prototype.setState=function(e,o){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,o,"setState")};E$1.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function F(){}F.prototype=E$1.prototype;function G$1(e,o,a){this.props=e,this.context=o,this.refs=D$1,this.updater=a||B$1}var H$1=G$1.prototype=new F;H$1.constructor=G$1;C$1(H$1,E$1.prototype);H$1.isPureReactComponent=!0;var I$1=Array.isArray,J=Object.prototype.hasOwnProperty,K$1={current:null},L$1={key:!0,ref:!0,__self:!0,__source:!0};function M$1(e,o,a){var s,c={},h=null,d=null;if(o!=null)for(s in o.ref!==void 0&&(d=o.ref),o.key!==void 0&&(h=""+o.key),o)J.call(o,s)&&!L$1.hasOwnProperty(s)&&(c[s]=o[s]);var g=arguments.length-2;if(g===1)c.children=a;else if(1<g){for(var b=Array(g),j=0;j<g;j++)b[j]=arguments[j+2];c.children=b}if(e&&e.defaultProps)for(s in g=e.defaultProps,g)c[s]===void 0&&(c[s]=g[s]);return{$$typeof:l$1,type:e,key:h,ref:d,props:c,_owner:K$1.current}}function N$1(e,o){return{$$typeof:l$1,type:e.type,key:o,ref:e.ref,props:e.props,_owner:e._owner}}function O$1(e){return typeof e=="object"&&e!==null&&e.$$typeof===l$1}function escape$1(e){var o={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return o[a]})}var P$1=/\/+/g;function Q$1(e,o){return typeof e=="object"&&e!==null&&e.key!=null?escape$1(""+e.key):o.toString(36)}function R$1(e,o,a,s,c){var h=typeof e;(h==="undefined"||h==="boolean")&&(e=null);var d=!1;if(e===null)d=!0;else switch(h){case"string":case"number":d=!0;break;case"object":switch(e.$$typeof){case l$1:case n$1:d=!0}}if(d)return d=e,c=c(d),e=s===""?"."+Q$1(d,0):s,I$1(c)?(a="",e!=null&&(a=e.replace(P$1,"$&/")+"/"),R$1(c,o,a,"",function(j){return j})):c!=null&&(O$1(c)&&(c=N$1(c,a+(!c.key||d&&d.key===c.key?"":(""+c.key).replace(P$1,"$&/")+"/")+e)),o.push(c)),1;if(d=0,s=s===""?".":s+":",I$1(e))for(var g=0;g<e.length;g++){h=e[g];var b=s+Q$1(h,g);d+=R$1(h,o,a,b,c)}else if(b=A$1(e),typeof b=="function")for(e=b.call(e),g=0;!(h=e.next()).done;)h=h.value,b=s+Q$1(h,g++),d+=R$1(h,o,a,b,c);else if(h==="object")throw o=String(e),Error("Objects are not valid as a React child (found: "+(o==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":o)+"). If you meant to render a collection of children, use an array instead.");return d}function S$1(e,o,a){if(e==null)return e;var s=[],c=0;return R$1(e,s,"","",function(h){return o.call(a,h,c++)}),s}function T$1(e){if(e._status===-1){var o=e._result;o=o(),o.then(function(a){(e._status===0||e._status===-1)&&(e._status=1,e._result=a)},function(a){(e._status===0||e._status===-1)&&(e._status=2,e._result=a)}),e._status===-1&&(e._status=0,e._result=o)}if(e._status===1)return e._result.default;throw e._result}var U$1={current:null},V$1={transition:null},W$1={ReactCurrentDispatcher:U$1,ReactCurrentBatchConfig:V$1,ReactCurrentOwner:K$1};function X$2(){throw Error("act(...) is not supported in production builds of React.")}react_production_min.Children={map:S$1,forEach:function(e,o,a){S$1(e,function(){o.apply(this,arguments)},a)},count:function(e){var o=0;return S$1(e,function(){o++}),o},toArray:function(e){return S$1(e,function(o){return o})||[]},only:function(e){if(!O$1(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};react_production_min.Component=E$1;react_production_min.Fragment=p$2;react_production_min.Profiler=r;react_production_min.PureComponent=G$1;react_production_min.StrictMode=q$1;react_production_min.Suspense=w;react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=W$1;react_production_min.act=X$2;react_production_min.cloneElement=function(e,o,a){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var s=C$1({},e.props),c=e.key,h=e.ref,d=e._owner;if(o!=null){if(o.ref!==void 0&&(h=o.ref,d=K$1.current),o.key!==void 0&&(c=""+o.key),e.type&&e.type.defaultProps)var g=e.type.defaultProps;for(b in o)J.call(o,b)&&!L$1.hasOwnProperty(b)&&(s[b]=o[b]===void 0&&g!==void 0?g[b]:o[b])}var b=arguments.length-2;if(b===1)s.children=a;else if(1<b){g=Array(b);for(var j=0;j<b;j++)g[j]=arguments[j+2];s.children=g}return{$$typeof:l$1,type:e.type,key:c,ref:h,props:s,_owner:d}};react_production_min.createContext=function(e){return e={$$typeof:u,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:t,_context:e},e.Consumer=e};react_production_min.createElement=M$1;react_production_min.createFactory=function(e){var o=M$1.bind(null,e);return o.type=e,o};react_production_min.createRef=function(){return{current:null}};react_production_min.forwardRef=function(e){return{$$typeof:v$1,render:e}};react_production_min.isValidElement=O$1;react_production_min.lazy=function(e){return{$$typeof:y,_payload:{_status:-1,_result:e},_init:T$1}};react_production_min.memo=function(e,o){return{$$typeof:x,type:e,compare:o===void 0?null:o}};react_production_min.startTransition=function(e){var o=V$1.transition;V$1.transition={};try{e()}finally{V$1.transition=o}};react_production_min.unstable_act=X$2;react_production_min.useCallback=function(e,o){return U$1.current.useCallback(e,o)};react_production_min.useContext=function(e){return U$1.current.useContext(e)};react_production_min.useDebugValue=function(){};react_production_min.useDeferredValue=function(e){return U$1.current.useDeferredValue(e)};react_production_min.useEffect=function(e,o){return U$1.current.useEffect(e,o)};react_production_min.useId=function(){return U$1.current.useId()};react_production_min.useImperativeHandle=function(e,o,a){return U$1.current.useImperativeHandle(e,o,a)};react_production_min.useInsertionEffect=function(e,o){return U$1.current.useInsertionEffect(e,o)};react_production_min.useLayoutEffect=function(e,o){return U$1.current.useLayoutEffect(e,o)};react_production_min.useMemo=function(e,o){return U$1.current.useMemo(e,o)};react_production_min.useReducer=function(e,o,a){return U$1.current.useReducer(e,o,a)};react_production_min.useRef=function(e){return U$1.current.useRef(e)};react_production_min.useState=function(e){return U$1.current.useState(e)};react_production_min.useSyncExternalStore=function(e,o,a){return U$1.current.useSyncExternalStore(e,o,a)};react_production_min.useTransition=function(){return U$1.current.useTransition()};react_production_min.version="18.3.1";react.exports=react_production_min;var reactExports=react.exports;const React=getDefaultExportFromCjs(reactExports),React$1=_mergeNamespaces({__proto__:null,default:React},[reactExports]);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var f=reactExports,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m$1=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p$1={key:!0,ref:!0,__self:!0,__source:!0};function q(e,o,a){var s,c={},h=null,d=null;a!==void 0&&(h=""+a),o.key!==void 0&&(h=""+o.key),o.ref!==void 0&&(d=o.ref);for(s in o)m$1.call(o,s)&&!p$1.hasOwnProperty(s)&&(c[s]=o[s]);if(e&&e.defaultProps)for(s in o=e.defaultProps,o)c[s]===void 0&&(c[s]=o[s]);return{$$typeof:k,type:e,key:h,ref:d,props:c,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;jsxRuntime.exports=reactJsxRuntime_production_min;var jsxRuntimeExports=jsxRuntime.exports,reactDom={exports:{}},reactDom_production_min={},scheduler={exports:{}},scheduler_production_min={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(e){function o(vt,bt){var Et=vt.length;vt.push(bt);e:for(;0<Et;){var Ct=Et-1>>>1,jt=vt[Ct];if(0<c(jt,bt))vt[Ct]=bt,vt[Et]=jt,Et=Ct;else break e}}function a(vt){return vt.length===0?null:vt[0]}function s(vt){if(vt.length===0)return null;var bt=vt[0],Et=vt.pop();if(Et!==bt){vt[0]=Et;e:for(var Ct=0,jt=vt.length,Ut=jt>>>1;Ct<Ut;){var zt=2*(Ct+1)-1,Wt=vt[zt],Ft=zt+1,Ht=vt[Ft];if(0>c(Wt,Et))Ft<jt&&0>c(Ht,Wt)?(vt[Ct]=Ht,vt[Ft]=Et,Ct=Ft):(vt[Ct]=Wt,vt[zt]=Et,Ct=zt);else if(Ft<jt&&0>c(Ht,Et))vt[Ct]=Ht,vt[Ft]=Et,Ct=Ft;else break e}}return bt}function c(vt,bt){var Et=vt.sortIndex-bt.sortIndex;return Et!==0?Et:vt.id-bt.id}if(typeof performance=="object"&&typeof performance.now=="function"){var h=performance;e.unstable_now=function(){return h.now()}}else{var d=Date,g=d.now();e.unstable_now=function(){return d.now()-g}}var b=[],j=[],_=1,_e=null,tt=3,it=!1,st=!1,ut=!1,ct=typeof setTimeout=="function"?setTimeout:null,rt=typeof clearTimeout=="function"?clearTimeout:null,ot=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function lt(vt){for(var bt=a(j);bt!==null;){if(bt.callback===null)s(j);else if(bt.startTime<=vt)s(j),bt.sortIndex=bt.expirationTime,o(b,bt);else break;bt=a(j)}}function dt(vt){if(ut=!1,lt(vt),!st)if(a(b)!==null)st=!0,Dt(pt);else{var bt=a(j);bt!==null&&kt(dt,bt.startTime-vt)}}function pt(vt,bt){st=!1,ut&&(ut=!1,rt(yt),yt=-1),it=!0;var Et=tt;try{for(lt(bt),_e=a(b);_e!==null&&(!(_e.expirationTime>bt)||vt&&!Pt());){var Ct=_e.callback;if(typeof Ct=="function"){_e.callback=null,tt=_e.priorityLevel;var jt=Ct(_e.expirationTime<=bt);bt=e.unstable_now(),typeof jt=="function"?_e.callback=jt:_e===a(b)&&s(b),lt(bt)}else s(b);_e=a(b)}if(_e!==null)var Ut=!0;else{var zt=a(j);zt!==null&&kt(dt,zt.startTime-bt),Ut=!1}return Ut}finally{_e=null,tt=Et,it=!1}}var gt=!1,wt=null,yt=-1,St=5,xt=-1;function Pt(){return!(e.unstable_now()-xt<St)}function Bt(){if(wt!==null){var vt=e.unstable_now();xt=vt;var bt=!0;try{bt=wt(!0,vt)}finally{bt?Ot():(gt=!1,wt=null)}}else gt=!1}var Ot;if(typeof ot=="function")Ot=function(){ot(Bt)};else if(typeof MessageChannel<"u"){var Tt=new MessageChannel,Mt=Tt.port2;Tt.port1.onmessage=Bt,Ot=function(){Mt.postMessage(null)}}else Ot=function(){ct(Bt,0)};function Dt(vt){wt=vt,gt||(gt=!0,Ot())}function kt(vt,bt){yt=ct(function(){vt(e.unstable_now())},bt)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(vt){vt.callback=null},e.unstable_continueExecution=function(){st||it||(st=!0,Dt(pt))},e.unstable_forceFrameRate=function(vt){0>vt||125<vt?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):St=0<vt?Math.floor(1e3/vt):5},e.unstable_getCurrentPriorityLevel=function(){return tt},e.unstable_getFirstCallbackNode=function(){return a(b)},e.unstable_next=function(vt){switch(tt){case 1:case 2:case 3:var bt=3;break;default:bt=tt}var Et=tt;tt=bt;try{return vt()}finally{tt=Et}},e.unstable_pauseExecution=function(){},e.unstable_requestPaint=function(){},e.unstable_runWithPriority=function(vt,bt){switch(vt){case 1:case 2:case 3:case 4:case 5:break;default:vt=3}var Et=tt;tt=vt;try{return bt()}finally{tt=Et}},e.unstable_scheduleCallback=function(vt,bt,Et){var Ct=e.unstable_now();switch(typeof Et=="object"&&Et!==null?(Et=Et.delay,Et=typeof Et=="number"&&0<Et?Ct+Et:Ct):Et=Ct,vt){case 1:var jt=-1;break;case 2:jt=250;break;case 5:jt=1073741823;break;case 4:jt=1e4;break;default:jt=5e3}return jt=Et+jt,vt={id:_++,callback:bt,priorityLevel:vt,startTime:Et,expirationTime:jt,sortIndex:-1},Et>Ct?(vt.sortIndex=Et,o(j,vt),a(b)===null&&vt===a(j)&&(ut?(rt(yt),yt=-1):ut=!0,kt(dt,Et-Ct))):(vt.sortIndex=jt,o(b,vt),st||it||(st=!0,Dt(pt))),vt},e.unstable_shouldYield=Pt,e.unstable_wrapCallback=function(vt){var bt=tt;return function(){var Et=tt;tt=bt;try{return vt.apply(this,arguments)}finally{tt=Et}}}})(scheduler_production_min);scheduler.exports=scheduler_production_min;var schedulerExports=scheduler.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var aa=reactExports,ca=schedulerExports;function p(e){for(var o="https://reactjs.org/docs/error-decoder.html?invariant="+e,a=1;a<arguments.length;a++)o+="&args[]="+encodeURIComponent(arguments[a]);return"Minified React error #"+e+"; visit "+o+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var da=new Set,ea={};function fa(e,o){ha(e,o),ha(e+"Capture",o)}function ha(e,o){for(ea[e]=o,e=0;e<o.length;e++)da.add(o[e])}var ia=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),ja=Object.prototype.hasOwnProperty,ka=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,la={},ma={};function oa(e){return ja.call(ma,e)?!0:ja.call(la,e)?!1:ka.test(e)?ma[e]=!0:(la[e]=!0,!1)}function pa(e,o,a,s){if(a!==null&&a.type===0)return!1;switch(typeof o){case"function":case"symbol":return!0;case"boolean":return s?!1:a!==null?!a.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function qa(e,o,a,s){if(o===null||typeof o>"u"||pa(e,o,a,s))return!0;if(s)return!1;if(a!==null)switch(a.type){case 3:return!o;case 4:return o===!1;case 5:return isNaN(o);case 6:return isNaN(o)||1>o}return!1}function v(e,o,a,s,c,h,d){this.acceptsBooleans=o===2||o===3||o===4,this.attributeName=s,this.attributeNamespace=c,this.mustUseProperty=a,this.propertyName=e,this.type=o,this.sanitizeURL=h,this.removeEmptyString=d}var z={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){z[e]=new v(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var o=e[0];z[o]=new v(o,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){z[e]=new v(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){z[e]=new v(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){z[e]=new v(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){z[e]=new v(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){z[e]=new v(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){z[e]=new v(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){z[e]=new v(e,5,!1,e.toLowerCase(),null,!1,!1)});var ra=/[\-:]([a-z])/g;function sa(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var o=e.replace(ra,sa);z[o]=new v(o,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var o=e.replace(ra,sa);z[o]=new v(o,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var o=e.replace(ra,sa);z[o]=new v(o,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){z[e]=new v(e,1,!1,e.toLowerCase(),null,!1,!1)});z.xlinkHref=new v("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){z[e]=new v(e,1,!1,e.toLowerCase(),null,!0,!0)});function ta(e,o,a,s){var c=z.hasOwnProperty(o)?z[o]:null;(c!==null?c.type!==0:s||!(2<o.length)||o[0]!=="o"&&o[0]!=="O"||o[1]!=="n"&&o[1]!=="N")&&(qa(o,a,c,s)&&(a=null),s||c===null?oa(o)&&(a===null?e.removeAttribute(o):e.setAttribute(o,""+a)):c.mustUseProperty?e[c.propertyName]=a===null?c.type===3?!1:"":a:(o=c.attributeName,s=c.attributeNamespace,a===null?e.removeAttribute(o):(c=c.type,a=c===3||c===4&&a===!0?"":""+a,s?e.setAttributeNS(s,o,a):e.setAttribute(o,a))))}var ua=aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,va=Symbol.for("react.element"),wa=Symbol.for("react.portal"),ya=Symbol.for("react.fragment"),za=Symbol.for("react.strict_mode"),Aa=Symbol.for("react.profiler"),Ba=Symbol.for("react.provider"),Ca=Symbol.for("react.context"),Da=Symbol.for("react.forward_ref"),Ea=Symbol.for("react.suspense"),Fa=Symbol.for("react.suspense_list"),Ga=Symbol.for("react.memo"),Ha=Symbol.for("react.lazy"),Ia=Symbol.for("react.offscreen"),Ja=Symbol.iterator;function Ka(e){return e===null||typeof e!="object"?null:(e=Ja&&e[Ja]||e["@@iterator"],typeof e=="function"?e:null)}var A=Object.assign,La;function Ma(e){if(La===void 0)try{throw Error()}catch(a){var o=a.stack.trim().match(/\n( *(at )?)/);La=o&&o[1]||""}return`
`+La+e}var Na=!1;function Oa(e,o){if(!e||Na)return"";Na=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(o)if(o=function(){throw Error()},Object.defineProperty(o.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(o,[])}catch(j){var s=j}Reflect.construct(e,[],o)}else{try{o.call()}catch(j){s=j}e.call(o.prototype)}else{try{throw Error()}catch(j){s=j}e()}}catch(j){if(j&&s&&typeof j.stack=="string"){for(var c=j.stack.split(`
`),h=s.stack.split(`
`),d=c.length-1,g=h.length-1;1<=d&&0<=g&&c[d]!==h[g];)g--;for(;1<=d&&0<=g;d--,g--)if(c[d]!==h[g]){if(d!==1||g!==1)do if(d--,g--,0>g||c[d]!==h[g]){var b=`
`+c[d].replace(" at new "," at ");return e.displayName&&b.includes("<anonymous>")&&(b=b.replace("<anonymous>",e.displayName)),b}while(1<=d&&0<=g);break}}}finally{Na=!1,Error.prepareStackTrace=a}return(e=e?e.displayName||e.name:"")?Ma(e):""}function Pa(e){switch(e.tag){case 5:return Ma(e.type);case 16:return Ma("Lazy");case 13:return Ma("Suspense");case 19:return Ma("SuspenseList");case 0:case 2:case 15:return e=Oa(e.type,!1),e;case 11:return e=Oa(e.type.render,!1),e;case 1:return e=Oa(e.type,!0),e;default:return""}}function Qa(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case ya:return"Fragment";case wa:return"Portal";case Aa:return"Profiler";case za:return"StrictMode";case Ea:return"Suspense";case Fa:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case Ca:return(e.displayName||"Context")+".Consumer";case Ba:return(e._context.displayName||"Context")+".Provider";case Da:var o=e.render;return e=e.displayName,e||(e=o.displayName||o.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Ga:return o=e.displayName||null,o!==null?o:Qa(e.type)||"Memo";case Ha:o=e._payload,e=e._init;try{return Qa(e(o))}catch{}}return null}function Ra(e){var o=e.type;switch(e.tag){case 24:return"Cache";case 9:return(o.displayName||"Context")+".Consumer";case 10:return(o._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=o.render,e=e.displayName||e.name||"",o.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return o;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Qa(o);case 8:return o===za?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof o=="function")return o.displayName||o.name||null;if(typeof o=="string")return o}return null}function Sa(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Ta(e){var o=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(o==="checkbox"||o==="radio")}function Ua(e){var o=Ta(e)?"checked":"value",a=Object.getOwnPropertyDescriptor(e.constructor.prototype,o),s=""+e[o];if(!e.hasOwnProperty(o)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var c=a.get,h=a.set;return Object.defineProperty(e,o,{configurable:!0,get:function(){return c.call(this)},set:function(d){s=""+d,h.call(this,d)}}),Object.defineProperty(e,o,{enumerable:a.enumerable}),{getValue:function(){return s},setValue:function(d){s=""+d},stopTracking:function(){e._valueTracker=null,delete e[o]}}}}function Va(e){e._valueTracker||(e._valueTracker=Ua(e))}function Wa(e){if(!e)return!1;var o=e._valueTracker;if(!o)return!0;var a=o.getValue(),s="";return e&&(s=Ta(e)?e.checked?"true":"false":e.value),e=s,e!==a?(o.setValue(e),!0):!1}function Xa(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Ya(e,o){var a=o.checked;return A({},o,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:a??e._wrapperState.initialChecked})}function Za(e,o){var a=o.defaultValue==null?"":o.defaultValue,s=o.checked!=null?o.checked:o.defaultChecked;a=Sa(o.value!=null?o.value:a),e._wrapperState={initialChecked:s,initialValue:a,controlled:o.type==="checkbox"||o.type==="radio"?o.checked!=null:o.value!=null}}function ab(e,o){o=o.checked,o!=null&&ta(e,"checked",o,!1)}function bb(e,o){ab(e,o);var a=Sa(o.value),s=o.type;if(a!=null)s==="number"?(a===0&&e.value===""||e.value!=a)&&(e.value=""+a):e.value!==""+a&&(e.value=""+a);else if(s==="submit"||s==="reset"){e.removeAttribute("value");return}o.hasOwnProperty("value")?cb(e,o.type,a):o.hasOwnProperty("defaultValue")&&cb(e,o.type,Sa(o.defaultValue)),o.checked==null&&o.defaultChecked!=null&&(e.defaultChecked=!!o.defaultChecked)}function db(e,o,a){if(o.hasOwnProperty("value")||o.hasOwnProperty("defaultValue")){var s=o.type;if(!(s!=="submit"&&s!=="reset"||o.value!==void 0&&o.value!==null))return;o=""+e._wrapperState.initialValue,a||o===e.value||(e.value=o),e.defaultValue=o}a=e.name,a!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,a!==""&&(e.name=a)}function cb(e,o,a){(o!=="number"||Xa(e.ownerDocument)!==e)&&(a==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+a&&(e.defaultValue=""+a))}var eb=Array.isArray;function fb(e,o,a,s){if(e=e.options,o){o={};for(var c=0;c<a.length;c++)o["$"+a[c]]=!0;for(a=0;a<e.length;a++)c=o.hasOwnProperty("$"+e[a].value),e[a].selected!==c&&(e[a].selected=c),c&&s&&(e[a].defaultSelected=!0)}else{for(a=""+Sa(a),o=null,c=0;c<e.length;c++){if(e[c].value===a){e[c].selected=!0,s&&(e[c].defaultSelected=!0);return}o!==null||e[c].disabled||(o=e[c])}o!==null&&(o.selected=!0)}}function gb(e,o){if(o.dangerouslySetInnerHTML!=null)throw Error(p(91));return A({},o,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function hb(e,o){var a=o.value;if(a==null){if(a=o.children,o=o.defaultValue,a!=null){if(o!=null)throw Error(p(92));if(eb(a)){if(1<a.length)throw Error(p(93));a=a[0]}o=a}o==null&&(o=""),a=o}e._wrapperState={initialValue:Sa(a)}}function ib(e,o){var a=Sa(o.value),s=Sa(o.defaultValue);a!=null&&(a=""+a,a!==e.value&&(e.value=a),o.defaultValue==null&&e.defaultValue!==a&&(e.defaultValue=a)),s!=null&&(e.defaultValue=""+s)}function jb(e){var o=e.textContent;o===e._wrapperState.initialValue&&o!==""&&o!==null&&(e.value=o)}function kb(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function lb(e,o){return e==null||e==="http://www.w3.org/1999/xhtml"?kb(o):e==="http://www.w3.org/2000/svg"&&o==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var mb,nb=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(o,a,s,c){MSApp.execUnsafeLocalFunction(function(){return e(o,a,s,c)})}:e}(function(e,o){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=o;else{for(mb=mb||document.createElement("div"),mb.innerHTML="<svg>"+o.valueOf().toString()+"</svg>",o=mb.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;o.firstChild;)e.appendChild(o.firstChild)}});function ob(e,o){if(o){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=o;return}}e.textContent=o}var pb={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},qb=["Webkit","ms","Moz","O"];Object.keys(pb).forEach(function(e){qb.forEach(function(o){o=o+e.charAt(0).toUpperCase()+e.substring(1),pb[o]=pb[e]})});function rb(e,o,a){return o==null||typeof o=="boolean"||o===""?"":a||typeof o!="number"||o===0||pb.hasOwnProperty(e)&&pb[e]?(""+o).trim():o+"px"}function sb(e,o){e=e.style;for(var a in o)if(o.hasOwnProperty(a)){var s=a.indexOf("--")===0,c=rb(a,o[a],s);a==="float"&&(a="cssFloat"),s?e.setProperty(a,c):e[a]=c}}var tb=A({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function ub(e,o){if(o){if(tb[e]&&(o.children!=null||o.dangerouslySetInnerHTML!=null))throw Error(p(137,e));if(o.dangerouslySetInnerHTML!=null){if(o.children!=null)throw Error(p(60));if(typeof o.dangerouslySetInnerHTML!="object"||!("__html"in o.dangerouslySetInnerHTML))throw Error(p(61))}if(o.style!=null&&typeof o.style!="object")throw Error(p(62))}}function vb(e,o){if(e.indexOf("-")===-1)return typeof o.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var wb=null;function xb(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var yb=null,zb=null,Ab=null;function Bb(e){if(e=Cb(e)){if(typeof yb!="function")throw Error(p(280));var o=e.stateNode;o&&(o=Db(o),yb(e.stateNode,e.type,o))}}function Eb(e){zb?Ab?Ab.push(e):Ab=[e]:zb=e}function Fb(){if(zb){var e=zb,o=Ab;if(Ab=zb=null,Bb(e),o)for(e=0;e<o.length;e++)Bb(o[e])}}function Gb(e,o){return e(o)}function Hb(){}var Ib=!1;function Jb(e,o,a){if(Ib)return e(o,a);Ib=!0;try{return Gb(e,o,a)}finally{Ib=!1,(zb!==null||Ab!==null)&&(Hb(),Fb())}}function Kb(e,o){var a=e.stateNode;if(a===null)return null;var s=Db(a);if(s===null)return null;a=s[o];e:switch(o){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(s=!s.disabled)||(e=e.type,s=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!s;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(p(231,o,typeof a));return a}var Lb=!1;if(ia)try{var Mb={};Object.defineProperty(Mb,"passive",{get:function(){Lb=!0}}),window.addEventListener("test",Mb,Mb),window.removeEventListener("test",Mb,Mb)}catch{Lb=!1}function Nb(e,o,a,s,c,h,d,g,b){var j=Array.prototype.slice.call(arguments,3);try{o.apply(a,j)}catch(_){this.onError(_)}}var Ob=!1,Pb=null,Qb=!1,Rb=null,Sb={onError:function(e){Ob=!0,Pb=e}};function Tb(e,o,a,s,c,h,d,g,b){Ob=!1,Pb=null,Nb.apply(Sb,arguments)}function Ub(e,o,a,s,c,h,d,g,b){if(Tb.apply(this,arguments),Ob){if(Ob){var j=Pb;Ob=!1,Pb=null}else throw Error(p(198));Qb||(Qb=!0,Rb=j)}}function Vb(e){var o=e,a=e;if(e.alternate)for(;o.return;)o=o.return;else{e=o;do o=e,o.flags&4098&&(a=o.return),e=o.return;while(e)}return o.tag===3?a:null}function Wb(e){if(e.tag===13){var o=e.memoizedState;if(o===null&&(e=e.alternate,e!==null&&(o=e.memoizedState)),o!==null)return o.dehydrated}return null}function Xb(e){if(Vb(e)!==e)throw Error(p(188))}function Yb(e){var o=e.alternate;if(!o){if(o=Vb(e),o===null)throw Error(p(188));return o!==e?null:e}for(var a=e,s=o;;){var c=a.return;if(c===null)break;var h=c.alternate;if(h===null){if(s=c.return,s!==null){a=s;continue}break}if(c.child===h.child){for(h=c.child;h;){if(h===a)return Xb(c),e;if(h===s)return Xb(c),o;h=h.sibling}throw Error(p(188))}if(a.return!==s.return)a=c,s=h;else{for(var d=!1,g=c.child;g;){if(g===a){d=!0,a=c,s=h;break}if(g===s){d=!0,s=c,a=h;break}g=g.sibling}if(!d){for(g=h.child;g;){if(g===a){d=!0,a=h,s=c;break}if(g===s){d=!0,s=h,a=c;break}g=g.sibling}if(!d)throw Error(p(189))}}if(a.alternate!==s)throw Error(p(190))}if(a.tag!==3)throw Error(p(188));return a.stateNode.current===a?e:o}function Zb(e){return e=Yb(e),e!==null?$b(e):null}function $b(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var o=$b(e);if(o!==null)return o;e=e.sibling}return null}var ac=ca.unstable_scheduleCallback,bc=ca.unstable_cancelCallback,cc=ca.unstable_shouldYield,dc=ca.unstable_requestPaint,B=ca.unstable_now,ec=ca.unstable_getCurrentPriorityLevel,fc=ca.unstable_ImmediatePriority,gc=ca.unstable_UserBlockingPriority,hc=ca.unstable_NormalPriority,ic=ca.unstable_LowPriority,jc=ca.unstable_IdlePriority,kc=null,lc=null;function mc(e){if(lc&&typeof lc.onCommitFiberRoot=="function")try{lc.onCommitFiberRoot(kc,e,void 0,(e.current.flags&128)===128)}catch{}}var oc=Math.clz32?Math.clz32:nc,pc=Math.log,qc=Math.LN2;function nc(e){return e>>>=0,e===0?32:31-(pc(e)/qc|0)|0}var rc=64,sc=4194304;function tc(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function uc(e,o){var a=e.pendingLanes;if(a===0)return 0;var s=0,c=e.suspendedLanes,h=e.pingedLanes,d=a&268435455;if(d!==0){var g=d&~c;g!==0?s=tc(g):(h&=d,h!==0&&(s=tc(h)))}else d=a&~c,d!==0?s=tc(d):h!==0&&(s=tc(h));if(s===0)return 0;if(o!==0&&o!==s&&!(o&c)&&(c=s&-s,h=o&-o,c>=h||c===16&&(h&4194240)!==0))return o;if(s&4&&(s|=a&16),o=e.entangledLanes,o!==0)for(e=e.entanglements,o&=s;0<o;)a=31-oc(o),c=1<<a,s|=e[a],o&=~c;return s}function vc(e,o){switch(e){case 1:case 2:case 4:return o+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return o+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function wc(e,o){for(var a=e.suspendedLanes,s=e.pingedLanes,c=e.expirationTimes,h=e.pendingLanes;0<h;){var d=31-oc(h),g=1<<d,b=c[d];b===-1?(!(g&a)||g&s)&&(c[d]=vc(g,o)):b<=o&&(e.expiredLanes|=g),h&=~g}}function xc(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function yc(){var e=rc;return rc<<=1,!(rc&4194240)&&(rc=64),e}function zc(e){for(var o=[],a=0;31>a;a++)o.push(e);return o}function Ac(e,o,a){e.pendingLanes|=o,o!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,o=31-oc(o),e[o]=a}function Bc(e,o){var a=e.pendingLanes&~o;e.pendingLanes=o,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=o,e.mutableReadLanes&=o,e.entangledLanes&=o,o=e.entanglements;var s=e.eventTimes;for(e=e.expirationTimes;0<a;){var c=31-oc(a),h=1<<c;o[c]=0,s[c]=-1,e[c]=-1,a&=~h}}function Cc(e,o){var a=e.entangledLanes|=o;for(e=e.entanglements;a;){var s=31-oc(a),c=1<<s;c&o|e[s]&o&&(e[s]|=o),a&=~c}}var C=0;function Dc(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var Ec,Fc,Gc,Hc,Ic,Jc=!1,Kc=[],Lc=null,Mc=null,Nc=null,Oc=new Map,Pc=new Map,Qc=[],Rc="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Sc(e,o){switch(e){case"focusin":case"focusout":Lc=null;break;case"dragenter":case"dragleave":Mc=null;break;case"mouseover":case"mouseout":Nc=null;break;case"pointerover":case"pointerout":Oc.delete(o.pointerId);break;case"gotpointercapture":case"lostpointercapture":Pc.delete(o.pointerId)}}function Tc(e,o,a,s,c,h){return e===null||e.nativeEvent!==h?(e={blockedOn:o,domEventName:a,eventSystemFlags:s,nativeEvent:h,targetContainers:[c]},o!==null&&(o=Cb(o),o!==null&&Fc(o)),e):(e.eventSystemFlags|=s,o=e.targetContainers,c!==null&&o.indexOf(c)===-1&&o.push(c),e)}function Uc(e,o,a,s,c){switch(o){case"focusin":return Lc=Tc(Lc,e,o,a,s,c),!0;case"dragenter":return Mc=Tc(Mc,e,o,a,s,c),!0;case"mouseover":return Nc=Tc(Nc,e,o,a,s,c),!0;case"pointerover":var h=c.pointerId;return Oc.set(h,Tc(Oc.get(h)||null,e,o,a,s,c)),!0;case"gotpointercapture":return h=c.pointerId,Pc.set(h,Tc(Pc.get(h)||null,e,o,a,s,c)),!0}return!1}function Vc(e){var o=Wc(e.target);if(o!==null){var a=Vb(o);if(a!==null){if(o=a.tag,o===13){if(o=Wb(a),o!==null){e.blockedOn=o,Ic(e.priority,function(){Gc(a)});return}}else if(o===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Xc(e){if(e.blockedOn!==null)return!1;for(var o=e.targetContainers;0<o.length;){var a=Yc(e.domEventName,e.eventSystemFlags,o[0],e.nativeEvent);if(a===null){a=e.nativeEvent;var s=new a.constructor(a.type,a);wb=s,a.target.dispatchEvent(s),wb=null}else return o=Cb(a),o!==null&&Fc(o),e.blockedOn=a,!1;o.shift()}return!0}function Zc(e,o,a){Xc(e)&&a.delete(o)}function $c(){Jc=!1,Lc!==null&&Xc(Lc)&&(Lc=null),Mc!==null&&Xc(Mc)&&(Mc=null),Nc!==null&&Xc(Nc)&&(Nc=null),Oc.forEach(Zc),Pc.forEach(Zc)}function ad(e,o){e.blockedOn===o&&(e.blockedOn=null,Jc||(Jc=!0,ca.unstable_scheduleCallback(ca.unstable_NormalPriority,$c)))}function bd(e){function o(c){return ad(c,e)}if(0<Kc.length){ad(Kc[0],e);for(var a=1;a<Kc.length;a++){var s=Kc[a];s.blockedOn===e&&(s.blockedOn=null)}}for(Lc!==null&&ad(Lc,e),Mc!==null&&ad(Mc,e),Nc!==null&&ad(Nc,e),Oc.forEach(o),Pc.forEach(o),a=0;a<Qc.length;a++)s=Qc[a],s.blockedOn===e&&(s.blockedOn=null);for(;0<Qc.length&&(a=Qc[0],a.blockedOn===null);)Vc(a),a.blockedOn===null&&Qc.shift()}var cd=ua.ReactCurrentBatchConfig,dd=!0;function ed(e,o,a,s){var c=C,h=cd.transition;cd.transition=null;try{C=1,fd(e,o,a,s)}finally{C=c,cd.transition=h}}function gd(e,o,a,s){var c=C,h=cd.transition;cd.transition=null;try{C=4,fd(e,o,a,s)}finally{C=c,cd.transition=h}}function fd(e,o,a,s){if(dd){var c=Yc(e,o,a,s);if(c===null)hd(e,o,s,id$2,a),Sc(e,s);else if(Uc(c,e,o,a,s))s.stopPropagation();else if(Sc(e,s),o&4&&-1<Rc.indexOf(e)){for(;c!==null;){var h=Cb(c);if(h!==null&&Ec(h),h=Yc(e,o,a,s),h===null&&hd(e,o,s,id$2,a),h===c)break;c=h}c!==null&&s.stopPropagation()}else hd(e,o,s,null,a)}}var id$2=null;function Yc(e,o,a,s){if(id$2=null,e=xb(s),e=Wc(e),e!==null)if(o=Vb(e),o===null)e=null;else if(a=o.tag,a===13){if(e=Wb(o),e!==null)return e;e=null}else if(a===3){if(o.stateNode.current.memoizedState.isDehydrated)return o.tag===3?o.stateNode.containerInfo:null;e=null}else o!==e&&(e=null);return id$2=e,null}function jd(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(ec()){case fc:return 1;case gc:return 4;case hc:case ic:return 16;case jc:return 536870912;default:return 16}default:return 16}}var kd=null,ld=null,md=null;function nd(){if(md)return md;var e,o=ld,a=o.length,s,c="value"in kd?kd.value:kd.textContent,h=c.length;for(e=0;e<a&&o[e]===c[e];e++);var d=a-e;for(s=1;s<=d&&o[a-s]===c[h-s];s++);return md=c.slice(e,1<s?1-s:void 0)}function od(e){var o=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&o===13&&(e=13)):e=o,e===10&&(e=13),32<=e||e===13?e:0}function pd(){return!0}function qd(){return!1}function rd(e){function o(a,s,c,h,d){this._reactName=a,this._targetInst=c,this.type=s,this.nativeEvent=h,this.target=d,this.currentTarget=null;for(var g in e)e.hasOwnProperty(g)&&(a=e[g],this[g]=a?a(h):h[g]);return this.isDefaultPrevented=(h.defaultPrevented!=null?h.defaultPrevented:h.returnValue===!1)?pd:qd,this.isPropagationStopped=qd,this}return A(o.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=pd)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=pd)},persist:function(){},isPersistent:pd}),o}var sd={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},td=rd(sd),ud=A({},sd,{view:0,detail:0}),vd=rd(ud),wd,xd,yd,Ad=A({},ud,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:zd,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==yd&&(yd&&e.type==="mousemove"?(wd=e.screenX-yd.screenX,xd=e.screenY-yd.screenY):xd=wd=0,yd=e),wd)},movementY:function(e){return"movementY"in e?e.movementY:xd}}),Bd=rd(Ad),Cd=A({},Ad,{dataTransfer:0}),Dd=rd(Cd),Ed=A({},ud,{relatedTarget:0}),Fd=rd(Ed),Gd=A({},sd,{animationName:0,elapsedTime:0,pseudoElement:0}),Hd=rd(Gd),Id=A({},sd,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Jd=rd(Id),Kd=A({},sd,{data:0}),Ld=rd(Kd),Md={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Nd={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Od={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Pd(e){var o=this.nativeEvent;return o.getModifierState?o.getModifierState(e):(e=Od[e])?!!o[e]:!1}function zd(){return Pd}var Qd=A({},ud,{key:function(e){if(e.key){var o=Md[e.key]||e.key;if(o!=="Unidentified")return o}return e.type==="keypress"?(e=od(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Nd[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:zd,charCode:function(e){return e.type==="keypress"?od(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?od(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Rd=rd(Qd),Sd=A({},Ad,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Td=rd(Sd),Ud=A({},ud,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:zd}),Vd=rd(Ud),Wd=A({},sd,{propertyName:0,elapsedTime:0,pseudoElement:0}),Xd=rd(Wd),Yd=A({},Ad,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Zd=rd(Yd),$d=[9,13,27,32],ae=ia&&"CompositionEvent"in window,be=null;ia&&"documentMode"in document&&(be=document.documentMode);var ce=ia&&"TextEvent"in window&&!be,de=ia&&(!ae||be&&8<be&&11>=be),ee=" ",fe=!1;function ge(e,o){switch(e){case"keyup":return $d.indexOf(o.keyCode)!==-1;case"keydown":return o.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function he(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var ie=!1;function je(e,o){switch(e){case"compositionend":return he(o);case"keypress":return o.which!==32?null:(fe=!0,ee);case"textInput":return e=o.data,e===ee&&fe?null:e;default:return null}}function ke(e,o){if(ie)return e==="compositionend"||!ae&&ge(e,o)?(e=nd(),md=ld=kd=null,ie=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(o.ctrlKey||o.altKey||o.metaKey)||o.ctrlKey&&o.altKey){if(o.char&&1<o.char.length)return o.char;if(o.which)return String.fromCharCode(o.which)}return null;case"compositionend":return de&&o.locale!=="ko"?null:o.data;default:return null}}var le={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function me(e){var o=e&&e.nodeName&&e.nodeName.toLowerCase();return o==="input"?!!le[e.type]:o==="textarea"}function ne(e,o,a,s){Eb(s),o=oe(o,"onChange"),0<o.length&&(a=new td("onChange","change",null,a,s),e.push({event:a,listeners:o}))}var pe=null,qe=null;function re(e){se(e,0)}function te(e){var o=ue(e);if(Wa(o))return e}function ve(e,o){if(e==="change")return o}var we=!1;if(ia){var xe;if(ia){var ye="oninput"in document;if(!ye){var ze=document.createElement("div");ze.setAttribute("oninput","return;"),ye=typeof ze.oninput=="function"}xe=ye}else xe=!1;we=xe&&(!document.documentMode||9<document.documentMode)}function Ae(){pe&&(pe.detachEvent("onpropertychange",Be),qe=pe=null)}function Be(e){if(e.propertyName==="value"&&te(qe)){var o=[];ne(o,qe,e,xb(e)),Jb(re,o)}}function Ce(e,o,a){e==="focusin"?(Ae(),pe=o,qe=a,pe.attachEvent("onpropertychange",Be)):e==="focusout"&&Ae()}function De(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return te(qe)}function Ee(e,o){if(e==="click")return te(o)}function Fe(e,o){if(e==="input"||e==="change")return te(o)}function Ge(e,o){return e===o&&(e!==0||1/e===1/o)||e!==e&&o!==o}var He=typeof Object.is=="function"?Object.is:Ge;function Ie(e,o){if(He(e,o))return!0;if(typeof e!="object"||e===null||typeof o!="object"||o===null)return!1;var a=Object.keys(e),s=Object.keys(o);if(a.length!==s.length)return!1;for(s=0;s<a.length;s++){var c=a[s];if(!ja.call(o,c)||!He(e[c],o[c]))return!1}return!0}function Je(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Ke(e,o){var a=Je(e);e=0;for(var s;a;){if(a.nodeType===3){if(s=e+a.textContent.length,e<=o&&s>=o)return{node:a,offset:o-e};e=s}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Je(a)}}function Le(e,o){return e&&o?e===o?!0:e&&e.nodeType===3?!1:o&&o.nodeType===3?Le(e,o.parentNode):"contains"in e?e.contains(o):e.compareDocumentPosition?!!(e.compareDocumentPosition(o)&16):!1:!1}function Me(){for(var e=window,o=Xa();o instanceof e.HTMLIFrameElement;){try{var a=typeof o.contentWindow.location.href=="string"}catch{a=!1}if(a)e=o.contentWindow;else break;o=Xa(e.document)}return o}function Ne(e){var o=e&&e.nodeName&&e.nodeName.toLowerCase();return o&&(o==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||o==="textarea"||e.contentEditable==="true")}function Oe(e){var o=Me(),a=e.focusedElem,s=e.selectionRange;if(o!==a&&a&&a.ownerDocument&&Le(a.ownerDocument.documentElement,a)){if(s!==null&&Ne(a)){if(o=s.start,e=s.end,e===void 0&&(e=o),"selectionStart"in a)a.selectionStart=o,a.selectionEnd=Math.min(e,a.value.length);else if(e=(o=a.ownerDocument||document)&&o.defaultView||window,e.getSelection){e=e.getSelection();var c=a.textContent.length,h=Math.min(s.start,c);s=s.end===void 0?h:Math.min(s.end,c),!e.extend&&h>s&&(c=s,s=h,h=c),c=Ke(a,h);var d=Ke(a,s);c&&d&&(e.rangeCount!==1||e.anchorNode!==c.node||e.anchorOffset!==c.offset||e.focusNode!==d.node||e.focusOffset!==d.offset)&&(o=o.createRange(),o.setStart(c.node,c.offset),e.removeAllRanges(),h>s?(e.addRange(o),e.extend(d.node,d.offset)):(o.setEnd(d.node,d.offset),e.addRange(o)))}}for(o=[],e=a;e=e.parentNode;)e.nodeType===1&&o.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof a.focus=="function"&&a.focus(),a=0;a<o.length;a++)e=o[a],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var Pe=ia&&"documentMode"in document&&11>=document.documentMode,Qe=null,Re=null,Se=null,Te=!1;function Ue(e,o,a){var s=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Te||Qe==null||Qe!==Xa(s)||(s=Qe,"selectionStart"in s&&Ne(s)?s={start:s.selectionStart,end:s.selectionEnd}:(s=(s.ownerDocument&&s.ownerDocument.defaultView||window).getSelection(),s={anchorNode:s.anchorNode,anchorOffset:s.anchorOffset,focusNode:s.focusNode,focusOffset:s.focusOffset}),Se&&Ie(Se,s)||(Se=s,s=oe(Re,"onSelect"),0<s.length&&(o=new td("onSelect","select",null,o,a),e.push({event:o,listeners:s}),o.target=Qe)))}function Ve(e,o){var a={};return a[e.toLowerCase()]=o.toLowerCase(),a["Webkit"+e]="webkit"+o,a["Moz"+e]="moz"+o,a}var We={animationend:Ve("Animation","AnimationEnd"),animationiteration:Ve("Animation","AnimationIteration"),animationstart:Ve("Animation","AnimationStart"),transitionend:Ve("Transition","TransitionEnd")},Xe={},Ye={};ia&&(Ye=document.createElement("div").style,"AnimationEvent"in window||(delete We.animationend.animation,delete We.animationiteration.animation,delete We.animationstart.animation),"TransitionEvent"in window||delete We.transitionend.transition);function Ze(e){if(Xe[e])return Xe[e];if(!We[e])return e;var o=We[e],a;for(a in o)if(o.hasOwnProperty(a)&&a in Ye)return Xe[e]=o[a];return e}var $e=Ze("animationend"),af=Ze("animationiteration"),bf=Ze("animationstart"),cf=Ze("transitionend"),df=new Map,ef="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function ff(e,o){df.set(e,o),fa(o,[e])}for(var gf=0;gf<ef.length;gf++){var hf=ef[gf],jf=hf.toLowerCase(),kf=hf[0].toUpperCase()+hf.slice(1);ff(jf,"on"+kf)}ff($e,"onAnimationEnd");ff(af,"onAnimationIteration");ff(bf,"onAnimationStart");ff("dblclick","onDoubleClick");ff("focusin","onFocus");ff("focusout","onBlur");ff(cf,"onTransitionEnd");ha("onMouseEnter",["mouseout","mouseover"]);ha("onMouseLeave",["mouseout","mouseover"]);ha("onPointerEnter",["pointerout","pointerover"]);ha("onPointerLeave",["pointerout","pointerover"]);fa("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));fa("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));fa("onBeforeInput",["compositionend","keypress","textInput","paste"]);fa("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));fa("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));fa("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var lf="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),mf=new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));function nf(e,o,a){var s=e.type||"unknown-event";e.currentTarget=a,Ub(s,o,void 0,e),e.currentTarget=null}function se(e,o){o=(o&4)!==0;for(var a=0;a<e.length;a++){var s=e[a],c=s.event;s=s.listeners;e:{var h=void 0;if(o)for(var d=s.length-1;0<=d;d--){var g=s[d],b=g.instance,j=g.currentTarget;if(g=g.listener,b!==h&&c.isPropagationStopped())break e;nf(c,g,j),h=b}else for(d=0;d<s.length;d++){if(g=s[d],b=g.instance,j=g.currentTarget,g=g.listener,b!==h&&c.isPropagationStopped())break e;nf(c,g,j),h=b}}}if(Qb)throw e=Rb,Qb=!1,Rb=null,e}function D(e,o){var a=o[of];a===void 0&&(a=o[of]=new Set);var s=e+"__bubble";a.has(s)||(pf(o,e,2,!1),a.add(s))}function qf(e,o,a){var s=0;o&&(s|=4),pf(a,e,s,o)}var rf="_reactListening"+Math.random().toString(36).slice(2);function sf(e){if(!e[rf]){e[rf]=!0,da.forEach(function(a){a!=="selectionchange"&&(mf.has(a)||qf(a,!1,e),qf(a,!0,e))});var o=e.nodeType===9?e:e.ownerDocument;o===null||o[rf]||(o[rf]=!0,qf("selectionchange",!1,o))}}function pf(e,o,a,s){switch(jd(o)){case 1:var c=ed;break;case 4:c=gd;break;default:c=fd}a=c.bind(null,o,a,e),c=void 0,!Lb||o!=="touchstart"&&o!=="touchmove"&&o!=="wheel"||(c=!0),s?c!==void 0?e.addEventListener(o,a,{capture:!0,passive:c}):e.addEventListener(o,a,!0):c!==void 0?e.addEventListener(o,a,{passive:c}):e.addEventListener(o,a,!1)}function hd(e,o,a,s,c){var h=s;if(!(o&1)&&!(o&2)&&s!==null)e:for(;;){if(s===null)return;var d=s.tag;if(d===3||d===4){var g=s.stateNode.containerInfo;if(g===c||g.nodeType===8&&g.parentNode===c)break;if(d===4)for(d=s.return;d!==null;){var b=d.tag;if((b===3||b===4)&&(b=d.stateNode.containerInfo,b===c||b.nodeType===8&&b.parentNode===c))return;d=d.return}for(;g!==null;){if(d=Wc(g),d===null)return;if(b=d.tag,b===5||b===6){s=h=d;continue e}g=g.parentNode}}s=s.return}Jb(function(){var j=h,_=xb(a),_e=[];e:{var tt=df.get(e);if(tt!==void 0){var it=td,st=e;switch(e){case"keypress":if(od(a)===0)break e;case"keydown":case"keyup":it=Rd;break;case"focusin":st="focus",it=Fd;break;case"focusout":st="blur",it=Fd;break;case"beforeblur":case"afterblur":it=Fd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":it=Bd;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":it=Dd;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":it=Vd;break;case $e:case af:case bf:it=Hd;break;case cf:it=Xd;break;case"scroll":it=vd;break;case"wheel":it=Zd;break;case"copy":case"cut":case"paste":it=Jd;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":it=Td}var ut=(o&4)!==0,ct=!ut&&e==="scroll",rt=ut?tt!==null?tt+"Capture":null:tt;ut=[];for(var ot=j,lt;ot!==null;){lt=ot;var dt=lt.stateNode;if(lt.tag===5&&dt!==null&&(lt=dt,rt!==null&&(dt=Kb(ot,rt),dt!=null&&ut.push(tf(ot,dt,lt)))),ct)break;ot=ot.return}0<ut.length&&(tt=new it(tt,st,null,a,_),_e.push({event:tt,listeners:ut}))}}if(!(o&7)){e:{if(tt=e==="mouseover"||e==="pointerover",it=e==="mouseout"||e==="pointerout",tt&&a!==wb&&(st=a.relatedTarget||a.fromElement)&&(Wc(st)||st[uf]))break e;if((it||tt)&&(tt=_.window===_?_:(tt=_.ownerDocument)?tt.defaultView||tt.parentWindow:window,it?(st=a.relatedTarget||a.toElement,it=j,st=st?Wc(st):null,st!==null&&(ct=Vb(st),st!==ct||st.tag!==5&&st.tag!==6)&&(st=null)):(it=null,st=j),it!==st)){if(ut=Bd,dt="onMouseLeave",rt="onMouseEnter",ot="mouse",(e==="pointerout"||e==="pointerover")&&(ut=Td,dt="onPointerLeave",rt="onPointerEnter",ot="pointer"),ct=it==null?tt:ue(it),lt=st==null?tt:ue(st),tt=new ut(dt,ot+"leave",it,a,_),tt.target=ct,tt.relatedTarget=lt,dt=null,Wc(_)===j&&(ut=new ut(rt,ot+"enter",st,a,_),ut.target=lt,ut.relatedTarget=ct,dt=ut),ct=dt,it&&st)t:{for(ut=it,rt=st,ot=0,lt=ut;lt;lt=vf(lt))ot++;for(lt=0,dt=rt;dt;dt=vf(dt))lt++;for(;0<ot-lt;)ut=vf(ut),ot--;for(;0<lt-ot;)rt=vf(rt),lt--;for(;ot--;){if(ut===rt||rt!==null&&ut===rt.alternate)break t;ut=vf(ut),rt=vf(rt)}ut=null}else ut=null;it!==null&&wf(_e,tt,it,ut,!1),st!==null&&ct!==null&&wf(_e,ct,st,ut,!0)}}e:{if(tt=j?ue(j):window,it=tt.nodeName&&tt.nodeName.toLowerCase(),it==="select"||it==="input"&&tt.type==="file")var pt=ve;else if(me(tt))if(we)pt=Fe;else{pt=De;var gt=Ce}else(it=tt.nodeName)&&it.toLowerCase()==="input"&&(tt.type==="checkbox"||tt.type==="radio")&&(pt=Ee);if(pt&&(pt=pt(e,j))){ne(_e,pt,a,_);break e}gt&&gt(e,tt,j),e==="focusout"&&(gt=tt._wrapperState)&&gt.controlled&&tt.type==="number"&&cb(tt,"number",tt.value)}switch(gt=j?ue(j):window,e){case"focusin":(me(gt)||gt.contentEditable==="true")&&(Qe=gt,Re=j,Se=null);break;case"focusout":Se=Re=Qe=null;break;case"mousedown":Te=!0;break;case"contextmenu":case"mouseup":case"dragend":Te=!1,Ue(_e,a,_);break;case"selectionchange":if(Pe)break;case"keydown":case"keyup":Ue(_e,a,_)}var wt;if(ae)e:{switch(e){case"compositionstart":var yt="onCompositionStart";break e;case"compositionend":yt="onCompositionEnd";break e;case"compositionupdate":yt="onCompositionUpdate";break e}yt=void 0}else ie?ge(e,a)&&(yt="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(yt="onCompositionStart");yt&&(de&&a.locale!=="ko"&&(ie||yt!=="onCompositionStart"?yt==="onCompositionEnd"&&ie&&(wt=nd()):(kd=_,ld="value"in kd?kd.value:kd.textContent,ie=!0)),gt=oe(j,yt),0<gt.length&&(yt=new Ld(yt,e,null,a,_),_e.push({event:yt,listeners:gt}),wt?yt.data=wt:(wt=he(a),wt!==null&&(yt.data=wt)))),(wt=ce?je(e,a):ke(e,a))&&(j=oe(j,"onBeforeInput"),0<j.length&&(_=new Ld("onBeforeInput","beforeinput",null,a,_),_e.push({event:_,listeners:j}),_.data=wt))}se(_e,o)})}function tf(e,o,a){return{instance:e,listener:o,currentTarget:a}}function oe(e,o){for(var a=o+"Capture",s=[];e!==null;){var c=e,h=c.stateNode;c.tag===5&&h!==null&&(c=h,h=Kb(e,a),h!=null&&s.unshift(tf(e,h,c)),h=Kb(e,o),h!=null&&s.push(tf(e,h,c))),e=e.return}return s}function vf(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function wf(e,o,a,s,c){for(var h=o._reactName,d=[];a!==null&&a!==s;){var g=a,b=g.alternate,j=g.stateNode;if(b!==null&&b===s)break;g.tag===5&&j!==null&&(g=j,c?(b=Kb(a,h),b!=null&&d.unshift(tf(a,b,g))):c||(b=Kb(a,h),b!=null&&d.push(tf(a,b,g)))),a=a.return}d.length!==0&&e.push({event:o,listeners:d})}var xf=/\r\n?/g,yf=/\u0000|\uFFFD/g;function zf(e){return(typeof e=="string"?e:""+e).replace(xf,`
`).replace(yf,"")}function Af(e,o,a){if(o=zf(o),zf(e)!==o&&a)throw Error(p(425))}function Bf(){}var Cf=null,Df=null;function Ef(e,o){return e==="textarea"||e==="noscript"||typeof o.children=="string"||typeof o.children=="number"||typeof o.dangerouslySetInnerHTML=="object"&&o.dangerouslySetInnerHTML!==null&&o.dangerouslySetInnerHTML.__html!=null}var Ff=typeof setTimeout=="function"?setTimeout:void 0,Gf=typeof clearTimeout=="function"?clearTimeout:void 0,Hf=typeof Promise=="function"?Promise:void 0,Jf=typeof queueMicrotask=="function"?queueMicrotask:typeof Hf<"u"?function(e){return Hf.resolve(null).then(e).catch(If)}:Ff;function If(e){setTimeout(function(){throw e})}function Kf(e,o){var a=o,s=0;do{var c=a.nextSibling;if(e.removeChild(a),c&&c.nodeType===8)if(a=c.data,a==="/$"){if(s===0){e.removeChild(c),bd(o);return}s--}else a!=="$"&&a!=="$?"&&a!=="$!"||s++;a=c}while(a);bd(o)}function Lf(e){for(;e!=null;e=e.nextSibling){var o=e.nodeType;if(o===1||o===3)break;if(o===8){if(o=e.data,o==="$"||o==="$!"||o==="$?")break;if(o==="/$")return null}}return e}function Mf(e){e=e.previousSibling;for(var o=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"){if(o===0)return e;o--}else a==="/$"&&o++}e=e.previousSibling}return null}var Nf=Math.random().toString(36).slice(2),Of="__reactFiber$"+Nf,Pf="__reactProps$"+Nf,uf="__reactContainer$"+Nf,of="__reactEvents$"+Nf,Qf="__reactListeners$"+Nf,Rf="__reactHandles$"+Nf;function Wc(e){var o=e[Of];if(o)return o;for(var a=e.parentNode;a;){if(o=a[uf]||a[Of]){if(a=o.alternate,o.child!==null||a!==null&&a.child!==null)for(e=Mf(e);e!==null;){if(a=e[Of])return a;e=Mf(e)}return o}e=a,a=e.parentNode}return null}function Cb(e){return e=e[Of]||e[uf],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function ue(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(p(33))}function Db(e){return e[Pf]||null}var Sf=[],Tf=-1;function Uf(e){return{current:e}}function E(e){0>Tf||(e.current=Sf[Tf],Sf[Tf]=null,Tf--)}function G(e,o){Tf++,Sf[Tf]=e.current,e.current=o}var Vf={},H=Uf(Vf),Wf=Uf(!1),Xf=Vf;function Yf(e,o){var a=e.type.contextTypes;if(!a)return Vf;var s=e.stateNode;if(s&&s.__reactInternalMemoizedUnmaskedChildContext===o)return s.__reactInternalMemoizedMaskedChildContext;var c={},h;for(h in a)c[h]=o[h];return s&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=o,e.__reactInternalMemoizedMaskedChildContext=c),c}function Zf(e){return e=e.childContextTypes,e!=null}function $f(){E(Wf),E(H)}function ag(e,o,a){if(H.current!==Vf)throw Error(p(168));G(H,o),G(Wf,a)}function bg(e,o,a){var s=e.stateNode;if(o=o.childContextTypes,typeof s.getChildContext!="function")return a;s=s.getChildContext();for(var c in s)if(!(c in o))throw Error(p(108,Ra(e)||"Unknown",c));return A({},a,s)}function cg(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Vf,Xf=H.current,G(H,e),G(Wf,Wf.current),!0}function dg(e,o,a){var s=e.stateNode;if(!s)throw Error(p(169));a?(e=bg(e,o,Xf),s.__reactInternalMemoizedMergedChildContext=e,E(Wf),E(H),G(H,e)):E(Wf),G(Wf,a)}var eg=null,fg=!1,gg=!1;function hg(e){eg===null?eg=[e]:eg.push(e)}function ig(e){fg=!0,hg(e)}function jg(){if(!gg&&eg!==null){gg=!0;var e=0,o=C;try{var a=eg;for(C=1;e<a.length;e++){var s=a[e];do s=s(!0);while(s!==null)}eg=null,fg=!1}catch(c){throw eg!==null&&(eg=eg.slice(e+1)),ac(fc,jg),c}finally{C=o,gg=!1}}return null}var kg=[],lg=0,mg=null,ng=0,og=[],pg=0,qg=null,rg=1,sg="";function tg(e,o){kg[lg++]=ng,kg[lg++]=mg,mg=e,ng=o}function ug(e,o,a){og[pg++]=rg,og[pg++]=sg,og[pg++]=qg,qg=e;var s=rg;e=sg;var c=32-oc(s)-1;s&=~(1<<c),a+=1;var h=32-oc(o)+c;if(30<h){var d=c-c%5;h=(s&(1<<d)-1).toString(32),s>>=d,c-=d,rg=1<<32-oc(o)+c|a<<c|s,sg=h+e}else rg=1<<h|a<<c|s,sg=e}function vg(e){e.return!==null&&(tg(e,1),ug(e,1,0))}function wg(e){for(;e===mg;)mg=kg[--lg],kg[lg]=null,ng=kg[--lg],kg[lg]=null;for(;e===qg;)qg=og[--pg],og[pg]=null,sg=og[--pg],og[pg]=null,rg=og[--pg],og[pg]=null}var xg=null,yg=null,I=!1,zg=null;function Ag(e,o){var a=Bg(5,null,null,0);a.elementType="DELETED",a.stateNode=o,a.return=e,o=e.deletions,o===null?(e.deletions=[a],e.flags|=16):o.push(a)}function Cg(e,o){switch(e.tag){case 5:var a=e.type;return o=o.nodeType!==1||a.toLowerCase()!==o.nodeName.toLowerCase()?null:o,o!==null?(e.stateNode=o,xg=e,yg=Lf(o.firstChild),!0):!1;case 6:return o=e.pendingProps===""||o.nodeType!==3?null:o,o!==null?(e.stateNode=o,xg=e,yg=null,!0):!1;case 13:return o=o.nodeType!==8?null:o,o!==null?(a=qg!==null?{id:rg,overflow:sg}:null,e.memoizedState={dehydrated:o,treeContext:a,retryLane:1073741824},a=Bg(18,null,null,0),a.stateNode=o,a.return=e,e.child=a,xg=e,yg=null,!0):!1;default:return!1}}function Dg(e){return(e.mode&1)!==0&&(e.flags&128)===0}function Eg(e){if(I){var o=yg;if(o){var a=o;if(!Cg(e,o)){if(Dg(e))throw Error(p(418));o=Lf(a.nextSibling);var s=xg;o&&Cg(e,o)?Ag(s,a):(e.flags=e.flags&-4097|2,I=!1,xg=e)}}else{if(Dg(e))throw Error(p(418));e.flags=e.flags&-4097|2,I=!1,xg=e}}}function Fg(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;xg=e}function Gg(e){if(e!==xg)return!1;if(!I)return Fg(e),I=!0,!1;var o;if((o=e.tag!==3)&&!(o=e.tag!==5)&&(o=e.type,o=o!=="head"&&o!=="body"&&!Ef(e.type,e.memoizedProps)),o&&(o=yg)){if(Dg(e))throw Hg(),Error(p(418));for(;o;)Ag(e,o),o=Lf(o.nextSibling)}if(Fg(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(p(317));e:{for(e=e.nextSibling,o=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"){if(o===0){yg=Lf(e.nextSibling);break e}o--}else a!=="$"&&a!=="$!"&&a!=="$?"||o++}e=e.nextSibling}yg=null}}else yg=xg?Lf(e.stateNode.nextSibling):null;return!0}function Hg(){for(var e=yg;e;)e=Lf(e.nextSibling)}function Ig(){yg=xg=null,I=!1}function Jg(e){zg===null?zg=[e]:zg.push(e)}var Kg=ua.ReactCurrentBatchConfig;function Lg(e,o,a){if(e=a.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(a._owner){if(a=a._owner,a){if(a.tag!==1)throw Error(p(309));var s=a.stateNode}if(!s)throw Error(p(147,e));var c=s,h=""+e;return o!==null&&o.ref!==null&&typeof o.ref=="function"&&o.ref._stringRef===h?o.ref:(o=function(d){var g=c.refs;d===null?delete g[h]:g[h]=d},o._stringRef=h,o)}if(typeof e!="string")throw Error(p(284));if(!a._owner)throw Error(p(290,e))}return e}function Mg(e,o){throw e=Object.prototype.toString.call(o),Error(p(31,e==="[object Object]"?"object with keys {"+Object.keys(o).join(", ")+"}":e))}function Ng(e){var o=e._init;return o(e._payload)}function Og(e){function o(rt,ot){if(e){var lt=rt.deletions;lt===null?(rt.deletions=[ot],rt.flags|=16):lt.push(ot)}}function a(rt,ot){if(!e)return null;for(;ot!==null;)o(rt,ot),ot=ot.sibling;return null}function s(rt,ot){for(rt=new Map;ot!==null;)ot.key!==null?rt.set(ot.key,ot):rt.set(ot.index,ot),ot=ot.sibling;return rt}function c(rt,ot){return rt=Pg(rt,ot),rt.index=0,rt.sibling=null,rt}function h(rt,ot,lt){return rt.index=lt,e?(lt=rt.alternate,lt!==null?(lt=lt.index,lt<ot?(rt.flags|=2,ot):lt):(rt.flags|=2,ot)):(rt.flags|=1048576,ot)}function d(rt){return e&&rt.alternate===null&&(rt.flags|=2),rt}function g(rt,ot,lt,dt){return ot===null||ot.tag!==6?(ot=Qg(lt,rt.mode,dt),ot.return=rt,ot):(ot=c(ot,lt),ot.return=rt,ot)}function b(rt,ot,lt,dt){var pt=lt.type;return pt===ya?_(rt,ot,lt.props.children,dt,lt.key):ot!==null&&(ot.elementType===pt||typeof pt=="object"&&pt!==null&&pt.$$typeof===Ha&&Ng(pt)===ot.type)?(dt=c(ot,lt.props),dt.ref=Lg(rt,ot,lt),dt.return=rt,dt):(dt=Rg(lt.type,lt.key,lt.props,null,rt.mode,dt),dt.ref=Lg(rt,ot,lt),dt.return=rt,dt)}function j(rt,ot,lt,dt){return ot===null||ot.tag!==4||ot.stateNode.containerInfo!==lt.containerInfo||ot.stateNode.implementation!==lt.implementation?(ot=Sg(lt,rt.mode,dt),ot.return=rt,ot):(ot=c(ot,lt.children||[]),ot.return=rt,ot)}function _(rt,ot,lt,dt,pt){return ot===null||ot.tag!==7?(ot=Tg(lt,rt.mode,dt,pt),ot.return=rt,ot):(ot=c(ot,lt),ot.return=rt,ot)}function _e(rt,ot,lt){if(typeof ot=="string"&&ot!==""||typeof ot=="number")return ot=Qg(""+ot,rt.mode,lt),ot.return=rt,ot;if(typeof ot=="object"&&ot!==null){switch(ot.$$typeof){case va:return lt=Rg(ot.type,ot.key,ot.props,null,rt.mode,lt),lt.ref=Lg(rt,null,ot),lt.return=rt,lt;case wa:return ot=Sg(ot,rt.mode,lt),ot.return=rt,ot;case Ha:var dt=ot._init;return _e(rt,dt(ot._payload),lt)}if(eb(ot)||Ka(ot))return ot=Tg(ot,rt.mode,lt,null),ot.return=rt,ot;Mg(rt,ot)}return null}function tt(rt,ot,lt,dt){var pt=ot!==null?ot.key:null;if(typeof lt=="string"&&lt!==""||typeof lt=="number")return pt!==null?null:g(rt,ot,""+lt,dt);if(typeof lt=="object"&&lt!==null){switch(lt.$$typeof){case va:return lt.key===pt?b(rt,ot,lt,dt):null;case wa:return lt.key===pt?j(rt,ot,lt,dt):null;case Ha:return pt=lt._init,tt(rt,ot,pt(lt._payload),dt)}if(eb(lt)||Ka(lt))return pt!==null?null:_(rt,ot,lt,dt,null);Mg(rt,lt)}return null}function it(rt,ot,lt,dt,pt){if(typeof dt=="string"&&dt!==""||typeof dt=="number")return rt=rt.get(lt)||null,g(ot,rt,""+dt,pt);if(typeof dt=="object"&&dt!==null){switch(dt.$$typeof){case va:return rt=rt.get(dt.key===null?lt:dt.key)||null,b(ot,rt,dt,pt);case wa:return rt=rt.get(dt.key===null?lt:dt.key)||null,j(ot,rt,dt,pt);case Ha:var gt=dt._init;return it(rt,ot,lt,gt(dt._payload),pt)}if(eb(dt)||Ka(dt))return rt=rt.get(lt)||null,_(ot,rt,dt,pt,null);Mg(ot,dt)}return null}function st(rt,ot,lt,dt){for(var pt=null,gt=null,wt=ot,yt=ot=0,St=null;wt!==null&&yt<lt.length;yt++){wt.index>yt?(St=wt,wt=null):St=wt.sibling;var xt=tt(rt,wt,lt[yt],dt);if(xt===null){wt===null&&(wt=St);break}e&&wt&&xt.alternate===null&&o(rt,wt),ot=h(xt,ot,yt),gt===null?pt=xt:gt.sibling=xt,gt=xt,wt=St}if(yt===lt.length)return a(rt,wt),I&&tg(rt,yt),pt;if(wt===null){for(;yt<lt.length;yt++)wt=_e(rt,lt[yt],dt),wt!==null&&(ot=h(wt,ot,yt),gt===null?pt=wt:gt.sibling=wt,gt=wt);return I&&tg(rt,yt),pt}for(wt=s(rt,wt);yt<lt.length;yt++)St=it(wt,rt,yt,lt[yt],dt),St!==null&&(e&&St.alternate!==null&&wt.delete(St.key===null?yt:St.key),ot=h(St,ot,yt),gt===null?pt=St:gt.sibling=St,gt=St);return e&&wt.forEach(function(Pt){return o(rt,Pt)}),I&&tg(rt,yt),pt}function ut(rt,ot,lt,dt){var pt=Ka(lt);if(typeof pt!="function")throw Error(p(150));if(lt=pt.call(lt),lt==null)throw Error(p(151));for(var gt=pt=null,wt=ot,yt=ot=0,St=null,xt=lt.next();wt!==null&&!xt.done;yt++,xt=lt.next()){wt.index>yt?(St=wt,wt=null):St=wt.sibling;var Pt=tt(rt,wt,xt.value,dt);if(Pt===null){wt===null&&(wt=St);break}e&&wt&&Pt.alternate===null&&o(rt,wt),ot=h(Pt,ot,yt),gt===null?pt=Pt:gt.sibling=Pt,gt=Pt,wt=St}if(xt.done)return a(rt,wt),I&&tg(rt,yt),pt;if(wt===null){for(;!xt.done;yt++,xt=lt.next())xt=_e(rt,xt.value,dt),xt!==null&&(ot=h(xt,ot,yt),gt===null?pt=xt:gt.sibling=xt,gt=xt);return I&&tg(rt,yt),pt}for(wt=s(rt,wt);!xt.done;yt++,xt=lt.next())xt=it(wt,rt,yt,xt.value,dt),xt!==null&&(e&&xt.alternate!==null&&wt.delete(xt.key===null?yt:xt.key),ot=h(xt,ot,yt),gt===null?pt=xt:gt.sibling=xt,gt=xt);return e&&wt.forEach(function(Bt){return o(rt,Bt)}),I&&tg(rt,yt),pt}function ct(rt,ot,lt,dt){if(typeof lt=="object"&&lt!==null&&lt.type===ya&&lt.key===null&&(lt=lt.props.children),typeof lt=="object"&&lt!==null){switch(lt.$$typeof){case va:e:{for(var pt=lt.key,gt=ot;gt!==null;){if(gt.key===pt){if(pt=lt.type,pt===ya){if(gt.tag===7){a(rt,gt.sibling),ot=c(gt,lt.props.children),ot.return=rt,rt=ot;break e}}else if(gt.elementType===pt||typeof pt=="object"&&pt!==null&&pt.$$typeof===Ha&&Ng(pt)===gt.type){a(rt,gt.sibling),ot=c(gt,lt.props),ot.ref=Lg(rt,gt,lt),ot.return=rt,rt=ot;break e}a(rt,gt);break}else o(rt,gt);gt=gt.sibling}lt.type===ya?(ot=Tg(lt.props.children,rt.mode,dt,lt.key),ot.return=rt,rt=ot):(dt=Rg(lt.type,lt.key,lt.props,null,rt.mode,dt),dt.ref=Lg(rt,ot,lt),dt.return=rt,rt=dt)}return d(rt);case wa:e:{for(gt=lt.key;ot!==null;){if(ot.key===gt)if(ot.tag===4&&ot.stateNode.containerInfo===lt.containerInfo&&ot.stateNode.implementation===lt.implementation){a(rt,ot.sibling),ot=c(ot,lt.children||[]),ot.return=rt,rt=ot;break e}else{a(rt,ot);break}else o(rt,ot);ot=ot.sibling}ot=Sg(lt,rt.mode,dt),ot.return=rt,rt=ot}return d(rt);case Ha:return gt=lt._init,ct(rt,ot,gt(lt._payload),dt)}if(eb(lt))return st(rt,ot,lt,dt);if(Ka(lt))return ut(rt,ot,lt,dt);Mg(rt,lt)}return typeof lt=="string"&&lt!==""||typeof lt=="number"?(lt=""+lt,ot!==null&&ot.tag===6?(a(rt,ot.sibling),ot=c(ot,lt),ot.return=rt,rt=ot):(a(rt,ot),ot=Qg(lt,rt.mode,dt),ot.return=rt,rt=ot),d(rt)):a(rt,ot)}return ct}var Ug=Og(!0),Vg=Og(!1),Wg=Uf(null),Xg=null,Yg=null,Zg=null;function $g(){Zg=Yg=Xg=null}function ah(e){var o=Wg.current;E(Wg),e._currentValue=o}function bh(e,o,a){for(;e!==null;){var s=e.alternate;if((e.childLanes&o)!==o?(e.childLanes|=o,s!==null&&(s.childLanes|=o)):s!==null&&(s.childLanes&o)!==o&&(s.childLanes|=o),e===a)break;e=e.return}}function ch(e,o){Xg=e,Zg=Yg=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.lanes&o&&(dh=!0),e.firstContext=null)}function eh(e){var o=e._currentValue;if(Zg!==e)if(e={context:e,memoizedValue:o,next:null},Yg===null){if(Xg===null)throw Error(p(308));Yg=e,Xg.dependencies={lanes:0,firstContext:e}}else Yg=Yg.next=e;return o}var fh=null;function gh(e){fh===null?fh=[e]:fh.push(e)}function hh(e,o,a,s){var c=o.interleaved;return c===null?(a.next=a,gh(o)):(a.next=c.next,c.next=a),o.interleaved=a,ih(e,s)}function ih(e,o){e.lanes|=o;var a=e.alternate;for(a!==null&&(a.lanes|=o),a=e,e=e.return;e!==null;)e.childLanes|=o,a=e.alternate,a!==null&&(a.childLanes|=o),a=e,e=e.return;return a.tag===3?a.stateNode:null}var jh=!1;function kh(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function lh(e,o){e=e.updateQueue,o.updateQueue===e&&(o.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function mh(e,o){return{eventTime:e,lane:o,tag:0,payload:null,callback:null,next:null}}function nh(e,o,a){var s=e.updateQueue;if(s===null)return null;if(s=s.shared,K&2){var c=s.pending;return c===null?o.next=o:(o.next=c.next,c.next=o),s.pending=o,ih(e,a)}return c=s.interleaved,c===null?(o.next=o,gh(s)):(o.next=c.next,c.next=o),s.interleaved=o,ih(e,a)}function oh(e,o,a){if(o=o.updateQueue,o!==null&&(o=o.shared,(a&4194240)!==0)){var s=o.lanes;s&=e.pendingLanes,a|=s,o.lanes=a,Cc(e,a)}}function ph(e,o){var a=e.updateQueue,s=e.alternate;if(s!==null&&(s=s.updateQueue,a===s)){var c=null,h=null;if(a=a.firstBaseUpdate,a!==null){do{var d={eventTime:a.eventTime,lane:a.lane,tag:a.tag,payload:a.payload,callback:a.callback,next:null};h===null?c=h=d:h=h.next=d,a=a.next}while(a!==null);h===null?c=h=o:h=h.next=o}else c=h=o;a={baseState:s.baseState,firstBaseUpdate:c,lastBaseUpdate:h,shared:s.shared,effects:s.effects},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=o:e.next=o,a.lastBaseUpdate=o}function qh(e,o,a,s){var c=e.updateQueue;jh=!1;var h=c.firstBaseUpdate,d=c.lastBaseUpdate,g=c.shared.pending;if(g!==null){c.shared.pending=null;var b=g,j=b.next;b.next=null,d===null?h=j:d.next=j,d=b;var _=e.alternate;_!==null&&(_=_.updateQueue,g=_.lastBaseUpdate,g!==d&&(g===null?_.firstBaseUpdate=j:g.next=j,_.lastBaseUpdate=b))}if(h!==null){var _e=c.baseState;d=0,_=j=b=null,g=h;do{var tt=g.lane,it=g.eventTime;if((s&tt)===tt){_!==null&&(_=_.next={eventTime:it,lane:0,tag:g.tag,payload:g.payload,callback:g.callback,next:null});e:{var st=e,ut=g;switch(tt=o,it=a,ut.tag){case 1:if(st=ut.payload,typeof st=="function"){_e=st.call(it,_e,tt);break e}_e=st;break e;case 3:st.flags=st.flags&-65537|128;case 0:if(st=ut.payload,tt=typeof st=="function"?st.call(it,_e,tt):st,tt==null)break e;_e=A({},_e,tt);break e;case 2:jh=!0}}g.callback!==null&&g.lane!==0&&(e.flags|=64,tt=c.effects,tt===null?c.effects=[g]:tt.push(g))}else it={eventTime:it,lane:tt,tag:g.tag,payload:g.payload,callback:g.callback,next:null},_===null?(j=_=it,b=_e):_=_.next=it,d|=tt;if(g=g.next,g===null){if(g=c.shared.pending,g===null)break;tt=g,g=tt.next,tt.next=null,c.lastBaseUpdate=tt,c.shared.pending=null}}while(!0);if(_===null&&(b=_e),c.baseState=b,c.firstBaseUpdate=j,c.lastBaseUpdate=_,o=c.shared.interleaved,o!==null){c=o;do d|=c.lane,c=c.next;while(c!==o)}else h===null&&(c.shared.lanes=0);rh|=d,e.lanes=d,e.memoizedState=_e}}function sh(e,o,a){if(e=o.effects,o.effects=null,e!==null)for(o=0;o<e.length;o++){var s=e[o],c=s.callback;if(c!==null){if(s.callback=null,s=a,typeof c!="function")throw Error(p(191,c));c.call(s)}}}var th={},uh=Uf(th),vh$1=Uf(th),wh=Uf(th);function xh(e){if(e===th)throw Error(p(174));return e}function yh(e,o){switch(G(wh,o),G(vh$1,e),G(uh,th),e=o.nodeType,e){case 9:case 11:o=(o=o.documentElement)?o.namespaceURI:lb(null,"");break;default:e=e===8?o.parentNode:o,o=e.namespaceURI||null,e=e.tagName,o=lb(o,e)}E(uh),G(uh,o)}function zh(){E(uh),E(vh$1),E(wh)}function Ah(e){xh(wh.current);var o=xh(uh.current),a=lb(o,e.type);o!==a&&(G(vh$1,e),G(uh,a))}function Bh(e){vh$1.current===e&&(E(uh),E(vh$1))}var L=Uf(0);function Ch(e){for(var o=e;o!==null;){if(o.tag===13){var a=o.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||a.data==="$?"||a.data==="$!"))return o}else if(o.tag===19&&o.memoizedProps.revealOrder!==void 0){if(o.flags&128)return o}else if(o.child!==null){o.child.return=o,o=o.child;continue}if(o===e)break;for(;o.sibling===null;){if(o.return===null||o.return===e)return null;o=o.return}o.sibling.return=o.return,o=o.sibling}return null}var Dh=[];function Eh(){for(var e=0;e<Dh.length;e++)Dh[e]._workInProgressVersionPrimary=null;Dh.length=0}var Fh=ua.ReactCurrentDispatcher,Gh=ua.ReactCurrentBatchConfig,Hh=0,M=null,N=null,O=null,Ih=!1,Jh=!1,Kh=0,Lh=0;function P(){throw Error(p(321))}function Mh(e,o){if(o===null)return!1;for(var a=0;a<o.length&&a<e.length;a++)if(!He(e[a],o[a]))return!1;return!0}function Nh(e,o,a,s,c,h){if(Hh=h,M=o,o.memoizedState=null,o.updateQueue=null,o.lanes=0,Fh.current=e===null||e.memoizedState===null?Oh:Ph,e=a(s,c),Jh){h=0;do{if(Jh=!1,Kh=0,25<=h)throw Error(p(301));h+=1,O=N=null,o.updateQueue=null,Fh.current=Qh,e=a(s,c)}while(Jh)}if(Fh.current=Rh,o=N!==null&&N.next!==null,Hh=0,O=N=M=null,Ih=!1,o)throw Error(p(300));return e}function Sh(){var e=Kh!==0;return Kh=0,e}function Th(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return O===null?M.memoizedState=O=e:O=O.next=e,O}function Uh(){if(N===null){var e=M.alternate;e=e!==null?e.memoizedState:null}else e=N.next;var o=O===null?M.memoizedState:O.next;if(o!==null)O=o,N=e;else{if(e===null)throw Error(p(310));N=e,e={memoizedState:N.memoizedState,baseState:N.baseState,baseQueue:N.baseQueue,queue:N.queue,next:null},O===null?M.memoizedState=O=e:O=O.next=e}return O}function Vh(e,o){return typeof o=="function"?o(e):o}function Wh(e){var o=Uh(),a=o.queue;if(a===null)throw Error(p(311));a.lastRenderedReducer=e;var s=N,c=s.baseQueue,h=a.pending;if(h!==null){if(c!==null){var d=c.next;c.next=h.next,h.next=d}s.baseQueue=c=h,a.pending=null}if(c!==null){h=c.next,s=s.baseState;var g=d=null,b=null,j=h;do{var _=j.lane;if((Hh&_)===_)b!==null&&(b=b.next={lane:0,action:j.action,hasEagerState:j.hasEagerState,eagerState:j.eagerState,next:null}),s=j.hasEagerState?j.eagerState:e(s,j.action);else{var _e={lane:_,action:j.action,hasEagerState:j.hasEagerState,eagerState:j.eagerState,next:null};b===null?(g=b=_e,d=s):b=b.next=_e,M.lanes|=_,rh|=_}j=j.next}while(j!==null&&j!==h);b===null?d=s:b.next=g,He(s,o.memoizedState)||(dh=!0),o.memoizedState=s,o.baseState=d,o.baseQueue=b,a.lastRenderedState=s}if(e=a.interleaved,e!==null){c=e;do h=c.lane,M.lanes|=h,rh|=h,c=c.next;while(c!==e)}else c===null&&(a.lanes=0);return[o.memoizedState,a.dispatch]}function Xh(e){var o=Uh(),a=o.queue;if(a===null)throw Error(p(311));a.lastRenderedReducer=e;var s=a.dispatch,c=a.pending,h=o.memoizedState;if(c!==null){a.pending=null;var d=c=c.next;do h=e(h,d.action),d=d.next;while(d!==c);He(h,o.memoizedState)||(dh=!0),o.memoizedState=h,o.baseQueue===null&&(o.baseState=h),a.lastRenderedState=h}return[h,s]}function Yh(){}function Zh(e,o){var a=M,s=Uh(),c=o(),h=!He(s.memoizedState,c);if(h&&(s.memoizedState=c,dh=!0),s=s.queue,$h(ai.bind(null,a,s,e),[e]),s.getSnapshot!==o||h||O!==null&&O.memoizedState.tag&1){if(a.flags|=2048,bi(9,ci.bind(null,a,s,c,o),void 0,null),Q===null)throw Error(p(349));Hh&30||di(a,o,c)}return c}function di(e,o,a){e.flags|=16384,e={getSnapshot:o,value:a},o=M.updateQueue,o===null?(o={lastEffect:null,stores:null},M.updateQueue=o,o.stores=[e]):(a=o.stores,a===null?o.stores=[e]:a.push(e))}function ci(e,o,a,s){o.value=a,o.getSnapshot=s,ei(o)&&fi(e)}function ai(e,o,a){return a(function(){ei(o)&&fi(e)})}function ei(e){var o=e.getSnapshot;e=e.value;try{var a=o();return!He(e,a)}catch{return!0}}function fi(e){var o=ih(e,1);o!==null&&gi(o,e,1,-1)}function hi(e){var o=Th();return typeof e=="function"&&(e=e()),o.memoizedState=o.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Vh,lastRenderedState:e},o.queue=e,e=e.dispatch=ii.bind(null,M,e),[o.memoizedState,e]}function bi(e,o,a,s){return e={tag:e,create:o,destroy:a,deps:s,next:null},o=M.updateQueue,o===null?(o={lastEffect:null,stores:null},M.updateQueue=o,o.lastEffect=e.next=e):(a=o.lastEffect,a===null?o.lastEffect=e.next=e:(s=a.next,a.next=e,e.next=s,o.lastEffect=e)),e}function ji(){return Uh().memoizedState}function ki(e,o,a,s){var c=Th();M.flags|=e,c.memoizedState=bi(1|o,a,void 0,s===void 0?null:s)}function li(e,o,a,s){var c=Uh();s=s===void 0?null:s;var h=void 0;if(N!==null){var d=N.memoizedState;if(h=d.destroy,s!==null&&Mh(s,d.deps)){c.memoizedState=bi(o,a,h,s);return}}M.flags|=e,c.memoizedState=bi(1|o,a,h,s)}function mi(e,o){return ki(8390656,8,e,o)}function $h(e,o){return li(2048,8,e,o)}function ni(e,o){return li(4,2,e,o)}function oi(e,o){return li(4,4,e,o)}function pi(e,o){if(typeof o=="function")return e=e(),o(e),function(){o(null)};if(o!=null)return e=e(),o.current=e,function(){o.current=null}}function qi(e,o,a){return a=a!=null?a.concat([e]):null,li(4,4,pi.bind(null,o,e),a)}function ri(){}function si(e,o){var a=Uh();o=o===void 0?null:o;var s=a.memoizedState;return s!==null&&o!==null&&Mh(o,s[1])?s[0]:(a.memoizedState=[e,o],e)}function ti(e,o){var a=Uh();o=o===void 0?null:o;var s=a.memoizedState;return s!==null&&o!==null&&Mh(o,s[1])?s[0]:(e=e(),a.memoizedState=[e,o],e)}function ui(e,o,a){return Hh&21?(He(a,o)||(a=yc(),M.lanes|=a,rh|=a,e.baseState=!0),o):(e.baseState&&(e.baseState=!1,dh=!0),e.memoizedState=a)}function vi(e,o){var a=C;C=a!==0&&4>a?a:4,e(!0);var s=Gh.transition;Gh.transition={};try{e(!1),o()}finally{C=a,Gh.transition=s}}function wi(){return Uh().memoizedState}function xi(e,o,a){var s=yi(e);if(a={lane:s,action:a,hasEagerState:!1,eagerState:null,next:null},zi(e))Ai(o,a);else if(a=hh(e,o,a,s),a!==null){var c=R();gi(a,e,s,c),Bi(a,o,s)}}function ii(e,o,a){var s=yi(e),c={lane:s,action:a,hasEagerState:!1,eagerState:null,next:null};if(zi(e))Ai(o,c);else{var h=e.alternate;if(e.lanes===0&&(h===null||h.lanes===0)&&(h=o.lastRenderedReducer,h!==null))try{var d=o.lastRenderedState,g=h(d,a);if(c.hasEagerState=!0,c.eagerState=g,He(g,d)){var b=o.interleaved;b===null?(c.next=c,gh(o)):(c.next=b.next,b.next=c),o.interleaved=c;return}}catch{}finally{}a=hh(e,o,c,s),a!==null&&(c=R(),gi(a,e,s,c),Bi(a,o,s))}}function zi(e){var o=e.alternate;return e===M||o!==null&&o===M}function Ai(e,o){Jh=Ih=!0;var a=e.pending;a===null?o.next=o:(o.next=a.next,a.next=o),e.pending=o}function Bi(e,o,a){if(a&4194240){var s=o.lanes;s&=e.pendingLanes,a|=s,o.lanes=a,Cc(e,a)}}var Rh={readContext:eh,useCallback:P,useContext:P,useEffect:P,useImperativeHandle:P,useInsertionEffect:P,useLayoutEffect:P,useMemo:P,useReducer:P,useRef:P,useState:P,useDebugValue:P,useDeferredValue:P,useTransition:P,useMutableSource:P,useSyncExternalStore:P,useId:P,unstable_isNewReconciler:!1},Oh={readContext:eh,useCallback:function(e,o){return Th().memoizedState=[e,o===void 0?null:o],e},useContext:eh,useEffect:mi,useImperativeHandle:function(e,o,a){return a=a!=null?a.concat([e]):null,ki(4194308,4,pi.bind(null,o,e),a)},useLayoutEffect:function(e,o){return ki(4194308,4,e,o)},useInsertionEffect:function(e,o){return ki(4,2,e,o)},useMemo:function(e,o){var a=Th();return o=o===void 0?null:o,e=e(),a.memoizedState=[e,o],e},useReducer:function(e,o,a){var s=Th();return o=a!==void 0?a(o):o,s.memoizedState=s.baseState=o,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},s.queue=e,e=e.dispatch=xi.bind(null,M,e),[s.memoizedState,e]},useRef:function(e){var o=Th();return e={current:e},o.memoizedState=e},useState:hi,useDebugValue:ri,useDeferredValue:function(e){return Th().memoizedState=e},useTransition:function(){var e=hi(!1),o=e[0];return e=vi.bind(null,e[1]),Th().memoizedState=e,[o,e]},useMutableSource:function(){},useSyncExternalStore:function(e,o,a){var s=M,c=Th();if(I){if(a===void 0)throw Error(p(407));a=a()}else{if(a=o(),Q===null)throw Error(p(349));Hh&30||di(s,o,a)}c.memoizedState=a;var h={value:a,getSnapshot:o};return c.queue=h,mi(ai.bind(null,s,h,e),[e]),s.flags|=2048,bi(9,ci.bind(null,s,h,a,o),void 0,null),a},useId:function(){var e=Th(),o=Q.identifierPrefix;if(I){var a=sg,s=rg;a=(s&~(1<<32-oc(s)-1)).toString(32)+a,o=":"+o+"R"+a,a=Kh++,0<a&&(o+="H"+a.toString(32)),o+=":"}else a=Lh++,o=":"+o+"r"+a.toString(32)+":";return e.memoizedState=o},unstable_isNewReconciler:!1},Ph={readContext:eh,useCallback:si,useContext:eh,useEffect:$h,useImperativeHandle:qi,useInsertionEffect:ni,useLayoutEffect:oi,useMemo:ti,useReducer:Wh,useRef:ji,useState:function(){return Wh(Vh)},useDebugValue:ri,useDeferredValue:function(e){var o=Uh();return ui(o,N.memoizedState,e)},useTransition:function(){var e=Wh(Vh)[0],o=Uh().memoizedState;return[e,o]},useMutableSource:Yh,useSyncExternalStore:Zh,useId:wi,unstable_isNewReconciler:!1},Qh={readContext:eh,useCallback:si,useContext:eh,useEffect:$h,useImperativeHandle:qi,useInsertionEffect:ni,useLayoutEffect:oi,useMemo:ti,useReducer:Xh,useRef:ji,useState:function(){return Xh(Vh)},useDebugValue:ri,useDeferredValue:function(e){var o=Uh();return N===null?o.memoizedState=e:ui(o,N.memoizedState,e)},useTransition:function(){var e=Xh(Vh)[0],o=Uh().memoizedState;return[e,o]},useMutableSource:Yh,useSyncExternalStore:Zh,useId:wi,unstable_isNewReconciler:!1};function Ci(e,o){if(e&&e.defaultProps){o=A({},o),e=e.defaultProps;for(var a in e)o[a]===void 0&&(o[a]=e[a]);return o}return o}function Di(e,o,a,s){o=e.memoizedState,a=a(s,o),a=a==null?o:A({},o,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Ei={isMounted:function(e){return(e=e._reactInternals)?Vb(e)===e:!1},enqueueSetState:function(e,o,a){e=e._reactInternals;var s=R(),c=yi(e),h=mh(s,c);h.payload=o,a!=null&&(h.callback=a),o=nh(e,h,c),o!==null&&(gi(o,e,c,s),oh(o,e,c))},enqueueReplaceState:function(e,o,a){e=e._reactInternals;var s=R(),c=yi(e),h=mh(s,c);h.tag=1,h.payload=o,a!=null&&(h.callback=a),o=nh(e,h,c),o!==null&&(gi(o,e,c,s),oh(o,e,c))},enqueueForceUpdate:function(e,o){e=e._reactInternals;var a=R(),s=yi(e),c=mh(a,s);c.tag=2,o!=null&&(c.callback=o),o=nh(e,c,s),o!==null&&(gi(o,e,s,a),oh(o,e,s))}};function Fi(e,o,a,s,c,h,d){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(s,h,d):o.prototype&&o.prototype.isPureReactComponent?!Ie(a,s)||!Ie(c,h):!0}function Gi(e,o,a){var s=!1,c=Vf,h=o.contextType;return typeof h=="object"&&h!==null?h=eh(h):(c=Zf(o)?Xf:H.current,s=o.contextTypes,h=(s=s!=null)?Yf(e,c):Vf),o=new o(a,h),e.memoizedState=o.state!==null&&o.state!==void 0?o.state:null,o.updater=Ei,e.stateNode=o,o._reactInternals=e,s&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=c,e.__reactInternalMemoizedMaskedChildContext=h),o}function Hi(e,o,a,s){e=o.state,typeof o.componentWillReceiveProps=="function"&&o.componentWillReceiveProps(a,s),typeof o.UNSAFE_componentWillReceiveProps=="function"&&o.UNSAFE_componentWillReceiveProps(a,s),o.state!==e&&Ei.enqueueReplaceState(o,o.state,null)}function Ii(e,o,a,s){var c=e.stateNode;c.props=a,c.state=e.memoizedState,c.refs={},kh(e);var h=o.contextType;typeof h=="object"&&h!==null?c.context=eh(h):(h=Zf(o)?Xf:H.current,c.context=Yf(e,h)),c.state=e.memoizedState,h=o.getDerivedStateFromProps,typeof h=="function"&&(Di(e,o,h,a),c.state=e.memoizedState),typeof o.getDerivedStateFromProps=="function"||typeof c.getSnapshotBeforeUpdate=="function"||typeof c.UNSAFE_componentWillMount!="function"&&typeof c.componentWillMount!="function"||(o=c.state,typeof c.componentWillMount=="function"&&c.componentWillMount(),typeof c.UNSAFE_componentWillMount=="function"&&c.UNSAFE_componentWillMount(),o!==c.state&&Ei.enqueueReplaceState(c,c.state,null),qh(e,a,c,s),c.state=e.memoizedState),typeof c.componentDidMount=="function"&&(e.flags|=4194308)}function Ji(e,o){try{var a="",s=o;do a+=Pa(s),s=s.return;while(s);var c=a}catch(h){c=`
Error generating stack: `+h.message+`
`+h.stack}return{value:e,source:o,stack:c,digest:null}}function Ki(e,o,a){return{value:e,source:null,stack:a??null,digest:o??null}}function Li(e,o){try{console.error(o.value)}catch(a){setTimeout(function(){throw a})}}var Mi=typeof WeakMap=="function"?WeakMap:Map;function Ni(e,o,a){a=mh(-1,a),a.tag=3,a.payload={element:null};var s=o.value;return a.callback=function(){Oi||(Oi=!0,Pi=s),Li(e,o)},a}function Qi(e,o,a){a=mh(-1,a),a.tag=3;var s=e.type.getDerivedStateFromError;if(typeof s=="function"){var c=o.value;a.payload=function(){return s(c)},a.callback=function(){Li(e,o)}}var h=e.stateNode;return h!==null&&typeof h.componentDidCatch=="function"&&(a.callback=function(){Li(e,o),typeof s!="function"&&(Ri===null?Ri=new Set([this]):Ri.add(this));var d=o.stack;this.componentDidCatch(o.value,{componentStack:d!==null?d:""})}),a}function Si(e,o,a){var s=e.pingCache;if(s===null){s=e.pingCache=new Mi;var c=new Set;s.set(o,c)}else c=s.get(o),c===void 0&&(c=new Set,s.set(o,c));c.has(a)||(c.add(a),e=Ti.bind(null,e,o,a),o.then(e,e))}function Ui(e){do{var o;if((o=e.tag===13)&&(o=e.memoizedState,o=o!==null?o.dehydrated!==null:!0),o)return e;e=e.return}while(e!==null);return null}function Vi(e,o,a,s,c){return e.mode&1?(e.flags|=65536,e.lanes=c,e):(e===o?e.flags|=65536:(e.flags|=128,a.flags|=131072,a.flags&=-52805,a.tag===1&&(a.alternate===null?a.tag=17:(o=mh(-1,1),o.tag=2,nh(a,o,1))),a.lanes|=1),e)}var Wi=ua.ReactCurrentOwner,dh=!1;function Xi(e,o,a,s){o.child=e===null?Vg(o,null,a,s):Ug(o,e.child,a,s)}function Yi(e,o,a,s,c){a=a.render;var h=o.ref;return ch(o,c),s=Nh(e,o,a,s,h,c),a=Sh(),e!==null&&!dh?(o.updateQueue=e.updateQueue,o.flags&=-2053,e.lanes&=~c,Zi(e,o,c)):(I&&a&&vg(o),o.flags|=1,Xi(e,o,s,c),o.child)}function $i(e,o,a,s,c){if(e===null){var h=a.type;return typeof h=="function"&&!aj(h)&&h.defaultProps===void 0&&a.compare===null&&a.defaultProps===void 0?(o.tag=15,o.type=h,bj(e,o,h,s,c)):(e=Rg(a.type,null,s,o,o.mode,c),e.ref=o.ref,e.return=o,o.child=e)}if(h=e.child,!(e.lanes&c)){var d=h.memoizedProps;if(a=a.compare,a=a!==null?a:Ie,a(d,s)&&e.ref===o.ref)return Zi(e,o,c)}return o.flags|=1,e=Pg(h,s),e.ref=o.ref,e.return=o,o.child=e}function bj(e,o,a,s,c){if(e!==null){var h=e.memoizedProps;if(Ie(h,s)&&e.ref===o.ref)if(dh=!1,o.pendingProps=s=h,(e.lanes&c)!==0)e.flags&131072&&(dh=!0);else return o.lanes=e.lanes,Zi(e,o,c)}return cj(e,o,a,s,c)}function dj(e,o,a){var s=o.pendingProps,c=s.children,h=e!==null?e.memoizedState:null;if(s.mode==="hidden")if(!(o.mode&1))o.memoizedState={baseLanes:0,cachePool:null,transitions:null},G(ej,fj),fj|=a;else{if(!(a&1073741824))return e=h!==null?h.baseLanes|a:a,o.lanes=o.childLanes=1073741824,o.memoizedState={baseLanes:e,cachePool:null,transitions:null},o.updateQueue=null,G(ej,fj),fj|=e,null;o.memoizedState={baseLanes:0,cachePool:null,transitions:null},s=h!==null?h.baseLanes:a,G(ej,fj),fj|=s}else h!==null?(s=h.baseLanes|a,o.memoizedState=null):s=a,G(ej,fj),fj|=s;return Xi(e,o,c,a),o.child}function gj(e,o){var a=o.ref;(e===null&&a!==null||e!==null&&e.ref!==a)&&(o.flags|=512,o.flags|=2097152)}function cj(e,o,a,s,c){var h=Zf(a)?Xf:H.current;return h=Yf(o,h),ch(o,c),a=Nh(e,o,a,s,h,c),s=Sh(),e!==null&&!dh?(o.updateQueue=e.updateQueue,o.flags&=-2053,e.lanes&=~c,Zi(e,o,c)):(I&&s&&vg(o),o.flags|=1,Xi(e,o,a,c),o.child)}function hj(e,o,a,s,c){if(Zf(a)){var h=!0;cg(o)}else h=!1;if(ch(o,c),o.stateNode===null)ij(e,o),Gi(o,a,s),Ii(o,a,s,c),s=!0;else if(e===null){var d=o.stateNode,g=o.memoizedProps;d.props=g;var b=d.context,j=a.contextType;typeof j=="object"&&j!==null?j=eh(j):(j=Zf(a)?Xf:H.current,j=Yf(o,j));var _=a.getDerivedStateFromProps,_e=typeof _=="function"||typeof d.getSnapshotBeforeUpdate=="function";_e||typeof d.UNSAFE_componentWillReceiveProps!="function"&&typeof d.componentWillReceiveProps!="function"||(g!==s||b!==j)&&Hi(o,d,s,j),jh=!1;var tt=o.memoizedState;d.state=tt,qh(o,s,d,c),b=o.memoizedState,g!==s||tt!==b||Wf.current||jh?(typeof _=="function"&&(Di(o,a,_,s),b=o.memoizedState),(g=jh||Fi(o,a,g,s,tt,b,j))?(_e||typeof d.UNSAFE_componentWillMount!="function"&&typeof d.componentWillMount!="function"||(typeof d.componentWillMount=="function"&&d.componentWillMount(),typeof d.UNSAFE_componentWillMount=="function"&&d.UNSAFE_componentWillMount()),typeof d.componentDidMount=="function"&&(o.flags|=4194308)):(typeof d.componentDidMount=="function"&&(o.flags|=4194308),o.memoizedProps=s,o.memoizedState=b),d.props=s,d.state=b,d.context=j,s=g):(typeof d.componentDidMount=="function"&&(o.flags|=4194308),s=!1)}else{d=o.stateNode,lh(e,o),g=o.memoizedProps,j=o.type===o.elementType?g:Ci(o.type,g),d.props=j,_e=o.pendingProps,tt=d.context,b=a.contextType,typeof b=="object"&&b!==null?b=eh(b):(b=Zf(a)?Xf:H.current,b=Yf(o,b));var it=a.getDerivedStateFromProps;(_=typeof it=="function"||typeof d.getSnapshotBeforeUpdate=="function")||typeof d.UNSAFE_componentWillReceiveProps!="function"&&typeof d.componentWillReceiveProps!="function"||(g!==_e||tt!==b)&&Hi(o,d,s,b),jh=!1,tt=o.memoizedState,d.state=tt,qh(o,s,d,c);var st=o.memoizedState;g!==_e||tt!==st||Wf.current||jh?(typeof it=="function"&&(Di(o,a,it,s),st=o.memoizedState),(j=jh||Fi(o,a,j,s,tt,st,b)||!1)?(_||typeof d.UNSAFE_componentWillUpdate!="function"&&typeof d.componentWillUpdate!="function"||(typeof d.componentWillUpdate=="function"&&d.componentWillUpdate(s,st,b),typeof d.UNSAFE_componentWillUpdate=="function"&&d.UNSAFE_componentWillUpdate(s,st,b)),typeof d.componentDidUpdate=="function"&&(o.flags|=4),typeof d.getSnapshotBeforeUpdate=="function"&&(o.flags|=1024)):(typeof d.componentDidUpdate!="function"||g===e.memoizedProps&&tt===e.memoizedState||(o.flags|=4),typeof d.getSnapshotBeforeUpdate!="function"||g===e.memoizedProps&&tt===e.memoizedState||(o.flags|=1024),o.memoizedProps=s,o.memoizedState=st),d.props=s,d.state=st,d.context=b,s=j):(typeof d.componentDidUpdate!="function"||g===e.memoizedProps&&tt===e.memoizedState||(o.flags|=4),typeof d.getSnapshotBeforeUpdate!="function"||g===e.memoizedProps&&tt===e.memoizedState||(o.flags|=1024),s=!1)}return jj(e,o,a,s,h,c)}function jj(e,o,a,s,c,h){gj(e,o);var d=(o.flags&128)!==0;if(!s&&!d)return c&&dg(o,a,!1),Zi(e,o,h);s=o.stateNode,Wi.current=o;var g=d&&typeof a.getDerivedStateFromError!="function"?null:s.render();return o.flags|=1,e!==null&&d?(o.child=Ug(o,e.child,null,h),o.child=Ug(o,null,g,h)):Xi(e,o,g,h),o.memoizedState=s.state,c&&dg(o,a,!0),o.child}function kj(e){var o=e.stateNode;o.pendingContext?ag(e,o.pendingContext,o.pendingContext!==o.context):o.context&&ag(e,o.context,!1),yh(e,o.containerInfo)}function lj(e,o,a,s,c){return Ig(),Jg(c),o.flags|=256,Xi(e,o,a,s),o.child}var mj={dehydrated:null,treeContext:null,retryLane:0};function nj(e){return{baseLanes:e,cachePool:null,transitions:null}}function oj(e,o,a){var s=o.pendingProps,c=L.current,h=!1,d=(o.flags&128)!==0,g;if((g=d)||(g=e!==null&&e.memoizedState===null?!1:(c&2)!==0),g?(h=!0,o.flags&=-129):(e===null||e.memoizedState!==null)&&(c|=1),G(L,c&1),e===null)return Eg(o),e=o.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(o.mode&1?e.data==="$!"?o.lanes=8:o.lanes=1073741824:o.lanes=1,null):(d=s.children,e=s.fallback,h?(s=o.mode,h=o.child,d={mode:"hidden",children:d},!(s&1)&&h!==null?(h.childLanes=0,h.pendingProps=d):h=pj(d,s,0,null),e=Tg(e,s,a,null),h.return=o,e.return=o,h.sibling=e,o.child=h,o.child.memoizedState=nj(a),o.memoizedState=mj,e):qj(o,d));if(c=e.memoizedState,c!==null&&(g=c.dehydrated,g!==null))return rj(e,o,d,s,g,c,a);if(h){h=s.fallback,d=o.mode,c=e.child,g=c.sibling;var b={mode:"hidden",children:s.children};return!(d&1)&&o.child!==c?(s=o.child,s.childLanes=0,s.pendingProps=b,o.deletions=null):(s=Pg(c,b),s.subtreeFlags=c.subtreeFlags&14680064),g!==null?h=Pg(g,h):(h=Tg(h,d,a,null),h.flags|=2),h.return=o,s.return=o,s.sibling=h,o.child=s,s=h,h=o.child,d=e.child.memoizedState,d=d===null?nj(a):{baseLanes:d.baseLanes|a,cachePool:null,transitions:d.transitions},h.memoizedState=d,h.childLanes=e.childLanes&~a,o.memoizedState=mj,s}return h=e.child,e=h.sibling,s=Pg(h,{mode:"visible",children:s.children}),!(o.mode&1)&&(s.lanes=a),s.return=o,s.sibling=null,e!==null&&(a=o.deletions,a===null?(o.deletions=[e],o.flags|=16):a.push(e)),o.child=s,o.memoizedState=null,s}function qj(e,o){return o=pj({mode:"visible",children:o},e.mode,0,null),o.return=e,e.child=o}function sj(e,o,a,s){return s!==null&&Jg(s),Ug(o,e.child,null,a),e=qj(o,o.pendingProps.children),e.flags|=2,o.memoizedState=null,e}function rj(e,o,a,s,c,h,d){if(a)return o.flags&256?(o.flags&=-257,s=Ki(Error(p(422))),sj(e,o,d,s)):o.memoizedState!==null?(o.child=e.child,o.flags|=128,null):(h=s.fallback,c=o.mode,s=pj({mode:"visible",children:s.children},c,0,null),h=Tg(h,c,d,null),h.flags|=2,s.return=o,h.return=o,s.sibling=h,o.child=s,o.mode&1&&Ug(o,e.child,null,d),o.child.memoizedState=nj(d),o.memoizedState=mj,h);if(!(o.mode&1))return sj(e,o,d,null);if(c.data==="$!"){if(s=c.nextSibling&&c.nextSibling.dataset,s)var g=s.dgst;return s=g,h=Error(p(419)),s=Ki(h,s,void 0),sj(e,o,d,s)}if(g=(d&e.childLanes)!==0,dh||g){if(s=Q,s!==null){switch(d&-d){case 4:c=2;break;case 16:c=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:c=32;break;case 536870912:c=268435456;break;default:c=0}c=c&(s.suspendedLanes|d)?0:c,c!==0&&c!==h.retryLane&&(h.retryLane=c,ih(e,c),gi(s,e,c,-1))}return tj(),s=Ki(Error(p(421))),sj(e,o,d,s)}return c.data==="$?"?(o.flags|=128,o.child=e.child,o=uj.bind(null,e),c._reactRetry=o,null):(e=h.treeContext,yg=Lf(c.nextSibling),xg=o,I=!0,zg=null,e!==null&&(og[pg++]=rg,og[pg++]=sg,og[pg++]=qg,rg=e.id,sg=e.overflow,qg=o),o=qj(o,s.children),o.flags|=4096,o)}function vj(e,o,a){e.lanes|=o;var s=e.alternate;s!==null&&(s.lanes|=o),bh(e.return,o,a)}function wj(e,o,a,s,c){var h=e.memoizedState;h===null?e.memoizedState={isBackwards:o,rendering:null,renderingStartTime:0,last:s,tail:a,tailMode:c}:(h.isBackwards=o,h.rendering=null,h.renderingStartTime=0,h.last=s,h.tail=a,h.tailMode=c)}function xj(e,o,a){var s=o.pendingProps,c=s.revealOrder,h=s.tail;if(Xi(e,o,s.children,a),s=L.current,s&2)s=s&1|2,o.flags|=128;else{if(e!==null&&e.flags&128)e:for(e=o.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&vj(e,a,o);else if(e.tag===19)vj(e,a,o);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===o)break e;for(;e.sibling===null;){if(e.return===null||e.return===o)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}s&=1}if(G(L,s),!(o.mode&1))o.memoizedState=null;else switch(c){case"forwards":for(a=o.child,c=null;a!==null;)e=a.alternate,e!==null&&Ch(e)===null&&(c=a),a=a.sibling;a=c,a===null?(c=o.child,o.child=null):(c=a.sibling,a.sibling=null),wj(o,!1,c,a,h);break;case"backwards":for(a=null,c=o.child,o.child=null;c!==null;){if(e=c.alternate,e!==null&&Ch(e)===null){o.child=c;break}e=c.sibling,c.sibling=a,a=c,c=e}wj(o,!0,a,null,h);break;case"together":wj(o,!1,null,null,void 0);break;default:o.memoizedState=null}return o.child}function ij(e,o){!(o.mode&1)&&e!==null&&(e.alternate=null,o.alternate=null,o.flags|=2)}function Zi(e,o,a){if(e!==null&&(o.dependencies=e.dependencies),rh|=o.lanes,!(a&o.childLanes))return null;if(e!==null&&o.child!==e.child)throw Error(p(153));if(o.child!==null){for(e=o.child,a=Pg(e,e.pendingProps),o.child=a,a.return=o;e.sibling!==null;)e=e.sibling,a=a.sibling=Pg(e,e.pendingProps),a.return=o;a.sibling=null}return o.child}function yj(e,o,a){switch(o.tag){case 3:kj(o),Ig();break;case 5:Ah(o);break;case 1:Zf(o.type)&&cg(o);break;case 4:yh(o,o.stateNode.containerInfo);break;case 10:var s=o.type._context,c=o.memoizedProps.value;G(Wg,s._currentValue),s._currentValue=c;break;case 13:if(s=o.memoizedState,s!==null)return s.dehydrated!==null?(G(L,L.current&1),o.flags|=128,null):a&o.child.childLanes?oj(e,o,a):(G(L,L.current&1),e=Zi(e,o,a),e!==null?e.sibling:null);G(L,L.current&1);break;case 19:if(s=(a&o.childLanes)!==0,e.flags&128){if(s)return xj(e,o,a);o.flags|=128}if(c=o.memoizedState,c!==null&&(c.rendering=null,c.tail=null,c.lastEffect=null),G(L,L.current),s)break;return null;case 22:case 23:return o.lanes=0,dj(e,o,a)}return Zi(e,o,a)}var zj,Aj,Bj,Cj;zj=function(e,o){for(var a=o.child;a!==null;){if(a.tag===5||a.tag===6)e.appendChild(a.stateNode);else if(a.tag!==4&&a.child!==null){a.child.return=a,a=a.child;continue}if(a===o)break;for(;a.sibling===null;){if(a.return===null||a.return===o)return;a=a.return}a.sibling.return=a.return,a=a.sibling}};Aj=function(){};Bj=function(e,o,a,s){var c=e.memoizedProps;if(c!==s){e=o.stateNode,xh(uh.current);var h=null;switch(a){case"input":c=Ya(e,c),s=Ya(e,s),h=[];break;case"select":c=A({},c,{value:void 0}),s=A({},s,{value:void 0}),h=[];break;case"textarea":c=gb(e,c),s=gb(e,s),h=[];break;default:typeof c.onClick!="function"&&typeof s.onClick=="function"&&(e.onclick=Bf)}ub(a,s);var d;a=null;for(j in c)if(!s.hasOwnProperty(j)&&c.hasOwnProperty(j)&&c[j]!=null)if(j==="style"){var g=c[j];for(d in g)g.hasOwnProperty(d)&&(a||(a={}),a[d]="")}else j!=="dangerouslySetInnerHTML"&&j!=="children"&&j!=="suppressContentEditableWarning"&&j!=="suppressHydrationWarning"&&j!=="autoFocus"&&(ea.hasOwnProperty(j)?h||(h=[]):(h=h||[]).push(j,null));for(j in s){var b=s[j];if(g=c!=null?c[j]:void 0,s.hasOwnProperty(j)&&b!==g&&(b!=null||g!=null))if(j==="style")if(g){for(d in g)!g.hasOwnProperty(d)||b&&b.hasOwnProperty(d)||(a||(a={}),a[d]="");for(d in b)b.hasOwnProperty(d)&&g[d]!==b[d]&&(a||(a={}),a[d]=b[d])}else a||(h||(h=[]),h.push(j,a)),a=b;else j==="dangerouslySetInnerHTML"?(b=b?b.__html:void 0,g=g?g.__html:void 0,b!=null&&g!==b&&(h=h||[]).push(j,b)):j==="children"?typeof b!="string"&&typeof b!="number"||(h=h||[]).push(j,""+b):j!=="suppressContentEditableWarning"&&j!=="suppressHydrationWarning"&&(ea.hasOwnProperty(j)?(b!=null&&j==="onScroll"&&D("scroll",e),h||g===b||(h=[])):(h=h||[]).push(j,b))}a&&(h=h||[]).push("style",a);var j=h;(o.updateQueue=j)&&(o.flags|=4)}};Cj=function(e,o,a,s){a!==s&&(o.flags|=4)};function Dj(e,o){if(!I)switch(e.tailMode){case"hidden":o=e.tail;for(var a=null;o!==null;)o.alternate!==null&&(a=o),o=o.sibling;a===null?e.tail=null:a.sibling=null;break;case"collapsed":a=e.tail;for(var s=null;a!==null;)a.alternate!==null&&(s=a),a=a.sibling;s===null?o||e.tail===null?e.tail=null:e.tail.sibling=null:s.sibling=null}}function S(e){var o=e.alternate!==null&&e.alternate.child===e.child,a=0,s=0;if(o)for(var c=e.child;c!==null;)a|=c.lanes|c.childLanes,s|=c.subtreeFlags&14680064,s|=c.flags&14680064,c.return=e,c=c.sibling;else for(c=e.child;c!==null;)a|=c.lanes|c.childLanes,s|=c.subtreeFlags,s|=c.flags,c.return=e,c=c.sibling;return e.subtreeFlags|=s,e.childLanes=a,o}function Ej(e,o,a){var s=o.pendingProps;switch(wg(o),o.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return S(o),null;case 1:return Zf(o.type)&&$f(),S(o),null;case 3:return s=o.stateNode,zh(),E(Wf),E(H),Eh(),s.pendingContext&&(s.context=s.pendingContext,s.pendingContext=null),(e===null||e.child===null)&&(Gg(o)?o.flags|=4:e===null||e.memoizedState.isDehydrated&&!(o.flags&256)||(o.flags|=1024,zg!==null&&(Fj(zg),zg=null))),Aj(e,o),S(o),null;case 5:Bh(o);var c=xh(wh.current);if(a=o.type,e!==null&&o.stateNode!=null)Bj(e,o,a,s,c),e.ref!==o.ref&&(o.flags|=512,o.flags|=2097152);else{if(!s){if(o.stateNode===null)throw Error(p(166));return S(o),null}if(e=xh(uh.current),Gg(o)){s=o.stateNode,a=o.type;var h=o.memoizedProps;switch(s[Of]=o,s[Pf]=h,e=(o.mode&1)!==0,a){case"dialog":D("cancel",s),D("close",s);break;case"iframe":case"object":case"embed":D("load",s);break;case"video":case"audio":for(c=0;c<lf.length;c++)D(lf[c],s);break;case"source":D("error",s);break;case"img":case"image":case"link":D("error",s),D("load",s);break;case"details":D("toggle",s);break;case"input":Za(s,h),D("invalid",s);break;case"select":s._wrapperState={wasMultiple:!!h.multiple},D("invalid",s);break;case"textarea":hb(s,h),D("invalid",s)}ub(a,h),c=null;for(var d in h)if(h.hasOwnProperty(d)){var g=h[d];d==="children"?typeof g=="string"?s.textContent!==g&&(h.suppressHydrationWarning!==!0&&Af(s.textContent,g,e),c=["children",g]):typeof g=="number"&&s.textContent!==""+g&&(h.suppressHydrationWarning!==!0&&Af(s.textContent,g,e),c=["children",""+g]):ea.hasOwnProperty(d)&&g!=null&&d==="onScroll"&&D("scroll",s)}switch(a){case"input":Va(s),db(s,h,!0);break;case"textarea":Va(s),jb(s);break;case"select":case"option":break;default:typeof h.onClick=="function"&&(s.onclick=Bf)}s=c,o.updateQueue=s,s!==null&&(o.flags|=4)}else{d=c.nodeType===9?c:c.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=kb(a)),e==="http://www.w3.org/1999/xhtml"?a==="script"?(e=d.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof s.is=="string"?e=d.createElement(a,{is:s.is}):(e=d.createElement(a),a==="select"&&(d=e,s.multiple?d.multiple=!0:s.size&&(d.size=s.size))):e=d.createElementNS(e,a),e[Of]=o,e[Pf]=s,zj(e,o,!1,!1),o.stateNode=e;e:{switch(d=vb(a,s),a){case"dialog":D("cancel",e),D("close",e),c=s;break;case"iframe":case"object":case"embed":D("load",e),c=s;break;case"video":case"audio":for(c=0;c<lf.length;c++)D(lf[c],e);c=s;break;case"source":D("error",e),c=s;break;case"img":case"image":case"link":D("error",e),D("load",e),c=s;break;case"details":D("toggle",e),c=s;break;case"input":Za(e,s),c=Ya(e,s),D("invalid",e);break;case"option":c=s;break;case"select":e._wrapperState={wasMultiple:!!s.multiple},c=A({},s,{value:void 0}),D("invalid",e);break;case"textarea":hb(e,s),c=gb(e,s),D("invalid",e);break;default:c=s}ub(a,c),g=c;for(h in g)if(g.hasOwnProperty(h)){var b=g[h];h==="style"?sb(e,b):h==="dangerouslySetInnerHTML"?(b=b?b.__html:void 0,b!=null&&nb(e,b)):h==="children"?typeof b=="string"?(a!=="textarea"||b!=="")&&ob(e,b):typeof b=="number"&&ob(e,""+b):h!=="suppressContentEditableWarning"&&h!=="suppressHydrationWarning"&&h!=="autoFocus"&&(ea.hasOwnProperty(h)?b!=null&&h==="onScroll"&&D("scroll",e):b!=null&&ta(e,h,b,d))}switch(a){case"input":Va(e),db(e,s,!1);break;case"textarea":Va(e),jb(e);break;case"option":s.value!=null&&e.setAttribute("value",""+Sa(s.value));break;case"select":e.multiple=!!s.multiple,h=s.value,h!=null?fb(e,!!s.multiple,h,!1):s.defaultValue!=null&&fb(e,!!s.multiple,s.defaultValue,!0);break;default:typeof c.onClick=="function"&&(e.onclick=Bf)}switch(a){case"button":case"input":case"select":case"textarea":s=!!s.autoFocus;break e;case"img":s=!0;break e;default:s=!1}}s&&(o.flags|=4)}o.ref!==null&&(o.flags|=512,o.flags|=2097152)}return S(o),null;case 6:if(e&&o.stateNode!=null)Cj(e,o,e.memoizedProps,s);else{if(typeof s!="string"&&o.stateNode===null)throw Error(p(166));if(a=xh(wh.current),xh(uh.current),Gg(o)){if(s=o.stateNode,a=o.memoizedProps,s[Of]=o,(h=s.nodeValue!==a)&&(e=xg,e!==null))switch(e.tag){case 3:Af(s.nodeValue,a,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Af(s.nodeValue,a,(e.mode&1)!==0)}h&&(o.flags|=4)}else s=(a.nodeType===9?a:a.ownerDocument).createTextNode(s),s[Of]=o,o.stateNode=s}return S(o),null;case 13:if(E(L),s=o.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(I&&yg!==null&&o.mode&1&&!(o.flags&128))Hg(),Ig(),o.flags|=98560,h=!1;else if(h=Gg(o),s!==null&&s.dehydrated!==null){if(e===null){if(!h)throw Error(p(318));if(h=o.memoizedState,h=h!==null?h.dehydrated:null,!h)throw Error(p(317));h[Of]=o}else Ig(),!(o.flags&128)&&(o.memoizedState=null),o.flags|=4;S(o),h=!1}else zg!==null&&(Fj(zg),zg=null),h=!0;if(!h)return o.flags&65536?o:null}return o.flags&128?(o.lanes=a,o):(s=s!==null,s!==(e!==null&&e.memoizedState!==null)&&s&&(o.child.flags|=8192,o.mode&1&&(e===null||L.current&1?T===0&&(T=3):tj())),o.updateQueue!==null&&(o.flags|=4),S(o),null);case 4:return zh(),Aj(e,o),e===null&&sf(o.stateNode.containerInfo),S(o),null;case 10:return ah(o.type._context),S(o),null;case 17:return Zf(o.type)&&$f(),S(o),null;case 19:if(E(L),h=o.memoizedState,h===null)return S(o),null;if(s=(o.flags&128)!==0,d=h.rendering,d===null)if(s)Dj(h,!1);else{if(T!==0||e!==null&&e.flags&128)for(e=o.child;e!==null;){if(d=Ch(e),d!==null){for(o.flags|=128,Dj(h,!1),s=d.updateQueue,s!==null&&(o.updateQueue=s,o.flags|=4),o.subtreeFlags=0,s=a,a=o.child;a!==null;)h=a,e=s,h.flags&=14680066,d=h.alternate,d===null?(h.childLanes=0,h.lanes=e,h.child=null,h.subtreeFlags=0,h.memoizedProps=null,h.memoizedState=null,h.updateQueue=null,h.dependencies=null,h.stateNode=null):(h.childLanes=d.childLanes,h.lanes=d.lanes,h.child=d.child,h.subtreeFlags=0,h.deletions=null,h.memoizedProps=d.memoizedProps,h.memoizedState=d.memoizedState,h.updateQueue=d.updateQueue,h.type=d.type,e=d.dependencies,h.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),a=a.sibling;return G(L,L.current&1|2),o.child}e=e.sibling}h.tail!==null&&B()>Gj&&(o.flags|=128,s=!0,Dj(h,!1),o.lanes=4194304)}else{if(!s)if(e=Ch(d),e!==null){if(o.flags|=128,s=!0,a=e.updateQueue,a!==null&&(o.updateQueue=a,o.flags|=4),Dj(h,!0),h.tail===null&&h.tailMode==="hidden"&&!d.alternate&&!I)return S(o),null}else 2*B()-h.renderingStartTime>Gj&&a!==1073741824&&(o.flags|=128,s=!0,Dj(h,!1),o.lanes=4194304);h.isBackwards?(d.sibling=o.child,o.child=d):(a=h.last,a!==null?a.sibling=d:o.child=d,h.last=d)}return h.tail!==null?(o=h.tail,h.rendering=o,h.tail=o.sibling,h.renderingStartTime=B(),o.sibling=null,a=L.current,G(L,s?a&1|2:a&1),o):(S(o),null);case 22:case 23:return Hj(),s=o.memoizedState!==null,e!==null&&e.memoizedState!==null!==s&&(o.flags|=8192),s&&o.mode&1?fj&1073741824&&(S(o),o.subtreeFlags&6&&(o.flags|=8192)):S(o),null;case 24:return null;case 25:return null}throw Error(p(156,o.tag))}function Ij(e,o){switch(wg(o),o.tag){case 1:return Zf(o.type)&&$f(),e=o.flags,e&65536?(o.flags=e&-65537|128,o):null;case 3:return zh(),E(Wf),E(H),Eh(),e=o.flags,e&65536&&!(e&128)?(o.flags=e&-65537|128,o):null;case 5:return Bh(o),null;case 13:if(E(L),e=o.memoizedState,e!==null&&e.dehydrated!==null){if(o.alternate===null)throw Error(p(340));Ig()}return e=o.flags,e&65536?(o.flags=e&-65537|128,o):null;case 19:return E(L),null;case 4:return zh(),null;case 10:return ah(o.type._context),null;case 22:case 23:return Hj(),null;case 24:return null;default:return null}}var Jj=!1,U=!1,Kj=typeof WeakSet=="function"?WeakSet:Set,V=null;function Lj(e,o){var a=e.ref;if(a!==null)if(typeof a=="function")try{a(null)}catch(s){W(e,o,s)}else a.current=null}function Mj(e,o,a){try{a()}catch(s){W(e,o,s)}}var Nj=!1;function Oj(e,o){if(Cf=dd,e=Me(),Ne(e)){if("selectionStart"in e)var a={start:e.selectionStart,end:e.selectionEnd};else e:{a=(a=e.ownerDocument)&&a.defaultView||window;var s=a.getSelection&&a.getSelection();if(s&&s.rangeCount!==0){a=s.anchorNode;var c=s.anchorOffset,h=s.focusNode;s=s.focusOffset;try{a.nodeType,h.nodeType}catch{a=null;break e}var d=0,g=-1,b=-1,j=0,_=0,_e=e,tt=null;t:for(;;){for(var it;_e!==a||c!==0&&_e.nodeType!==3||(g=d+c),_e!==h||s!==0&&_e.nodeType!==3||(b=d+s),_e.nodeType===3&&(d+=_e.nodeValue.length),(it=_e.firstChild)!==null;)tt=_e,_e=it;for(;;){if(_e===e)break t;if(tt===a&&++j===c&&(g=d),tt===h&&++_===s&&(b=d),(it=_e.nextSibling)!==null)break;_e=tt,tt=_e.parentNode}_e=it}a=g===-1||b===-1?null:{start:g,end:b}}else a=null}a=a||{start:0,end:0}}else a=null;for(Df={focusedElem:e,selectionRange:a},dd=!1,V=o;V!==null;)if(o=V,e=o.child,(o.subtreeFlags&1028)!==0&&e!==null)e.return=o,V=e;else for(;V!==null;){o=V;try{var st=o.alternate;if(o.flags&1024)switch(o.tag){case 0:case 11:case 15:break;case 1:if(st!==null){var ut=st.memoizedProps,ct=st.memoizedState,rt=o.stateNode,ot=rt.getSnapshotBeforeUpdate(o.elementType===o.type?ut:Ci(o.type,ut),ct);rt.__reactInternalSnapshotBeforeUpdate=ot}break;case 3:var lt=o.stateNode.containerInfo;lt.nodeType===1?lt.textContent="":lt.nodeType===9&&lt.documentElement&&lt.removeChild(lt.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(p(163))}}catch(dt){W(o,o.return,dt)}if(e=o.sibling,e!==null){e.return=o.return,V=e;break}V=o.return}return st=Nj,Nj=!1,st}function Pj(e,o,a){var s=o.updateQueue;if(s=s!==null?s.lastEffect:null,s!==null){var c=s=s.next;do{if((c.tag&e)===e){var h=c.destroy;c.destroy=void 0,h!==void 0&&Mj(o,a,h)}c=c.next}while(c!==s)}}function Qj(e,o){if(o=o.updateQueue,o=o!==null?o.lastEffect:null,o!==null){var a=o=o.next;do{if((a.tag&e)===e){var s=a.create;a.destroy=s()}a=a.next}while(a!==o)}}function Rj(e){var o=e.ref;if(o!==null){var a=e.stateNode;switch(e.tag){case 5:e=a;break;default:e=a}typeof o=="function"?o(e):o.current=e}}function Sj(e){var o=e.alternate;o!==null&&(e.alternate=null,Sj(o)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(o=e.stateNode,o!==null&&(delete o[Of],delete o[Pf],delete o[of],delete o[Qf],delete o[Rf])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Tj(e){return e.tag===5||e.tag===3||e.tag===4}function Uj(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Tj(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Vj(e,o,a){var s=e.tag;if(s===5||s===6)e=e.stateNode,o?a.nodeType===8?a.parentNode.insertBefore(e,o):a.insertBefore(e,o):(a.nodeType===8?(o=a.parentNode,o.insertBefore(e,a)):(o=a,o.appendChild(e)),a=a._reactRootContainer,a!=null||o.onclick!==null||(o.onclick=Bf));else if(s!==4&&(e=e.child,e!==null))for(Vj(e,o,a),e=e.sibling;e!==null;)Vj(e,o,a),e=e.sibling}function Wj(e,o,a){var s=e.tag;if(s===5||s===6)e=e.stateNode,o?a.insertBefore(e,o):a.appendChild(e);else if(s!==4&&(e=e.child,e!==null))for(Wj(e,o,a),e=e.sibling;e!==null;)Wj(e,o,a),e=e.sibling}var X$1=null,Xj=!1;function Yj(e,o,a){for(a=a.child;a!==null;)Zj(e,o,a),a=a.sibling}function Zj(e,o,a){if(lc&&typeof lc.onCommitFiberUnmount=="function")try{lc.onCommitFiberUnmount(kc,a)}catch{}switch(a.tag){case 5:U||Lj(a,o);case 6:var s=X$1,c=Xj;X$1=null,Yj(e,o,a),X$1=s,Xj=c,X$1!==null&&(Xj?(e=X$1,a=a.stateNode,e.nodeType===8?e.parentNode.removeChild(a):e.removeChild(a)):X$1.removeChild(a.stateNode));break;case 18:X$1!==null&&(Xj?(e=X$1,a=a.stateNode,e.nodeType===8?Kf(e.parentNode,a):e.nodeType===1&&Kf(e,a),bd(e)):Kf(X$1,a.stateNode));break;case 4:s=X$1,c=Xj,X$1=a.stateNode.containerInfo,Xj=!0,Yj(e,o,a),X$1=s,Xj=c;break;case 0:case 11:case 14:case 15:if(!U&&(s=a.updateQueue,s!==null&&(s=s.lastEffect,s!==null))){c=s=s.next;do{var h=c,d=h.destroy;h=h.tag,d!==void 0&&(h&2||h&4)&&Mj(a,o,d),c=c.next}while(c!==s)}Yj(e,o,a);break;case 1:if(!U&&(Lj(a,o),s=a.stateNode,typeof s.componentWillUnmount=="function"))try{s.props=a.memoizedProps,s.state=a.memoizedState,s.componentWillUnmount()}catch(g){W(a,o,g)}Yj(e,o,a);break;case 21:Yj(e,o,a);break;case 22:a.mode&1?(U=(s=U)||a.memoizedState!==null,Yj(e,o,a),U=s):Yj(e,o,a);break;default:Yj(e,o,a)}}function ak(e){var o=e.updateQueue;if(o!==null){e.updateQueue=null;var a=e.stateNode;a===null&&(a=e.stateNode=new Kj),o.forEach(function(s){var c=bk.bind(null,e,s);a.has(s)||(a.add(s),s.then(c,c))})}}function ck(e,o){var a=o.deletions;if(a!==null)for(var s=0;s<a.length;s++){var c=a[s];try{var h=e,d=o,g=d;e:for(;g!==null;){switch(g.tag){case 5:X$1=g.stateNode,Xj=!1;break e;case 3:X$1=g.stateNode.containerInfo,Xj=!0;break e;case 4:X$1=g.stateNode.containerInfo,Xj=!0;break e}g=g.return}if(X$1===null)throw Error(p(160));Zj(h,d,c),X$1=null,Xj=!1;var b=c.alternate;b!==null&&(b.return=null),c.return=null}catch(j){W(c,o,j)}}if(o.subtreeFlags&12854)for(o=o.child;o!==null;)dk(o,e),o=o.sibling}function dk(e,o){var a=e.alternate,s=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(ck(o,e),ek(e),s&4){try{Pj(3,e,e.return),Qj(3,e)}catch(ut){W(e,e.return,ut)}try{Pj(5,e,e.return)}catch(ut){W(e,e.return,ut)}}break;case 1:ck(o,e),ek(e),s&512&&a!==null&&Lj(a,a.return);break;case 5:if(ck(o,e),ek(e),s&512&&a!==null&&Lj(a,a.return),e.flags&32){var c=e.stateNode;try{ob(c,"")}catch(ut){W(e,e.return,ut)}}if(s&4&&(c=e.stateNode,c!=null)){var h=e.memoizedProps,d=a!==null?a.memoizedProps:h,g=e.type,b=e.updateQueue;if(e.updateQueue=null,b!==null)try{g==="input"&&h.type==="radio"&&h.name!=null&&ab(c,h),vb(g,d);var j=vb(g,h);for(d=0;d<b.length;d+=2){var _=b[d],_e=b[d+1];_==="style"?sb(c,_e):_==="dangerouslySetInnerHTML"?nb(c,_e):_==="children"?ob(c,_e):ta(c,_,_e,j)}switch(g){case"input":bb(c,h);break;case"textarea":ib(c,h);break;case"select":var tt=c._wrapperState.wasMultiple;c._wrapperState.wasMultiple=!!h.multiple;var it=h.value;it!=null?fb(c,!!h.multiple,it,!1):tt!==!!h.multiple&&(h.defaultValue!=null?fb(c,!!h.multiple,h.defaultValue,!0):fb(c,!!h.multiple,h.multiple?[]:"",!1))}c[Pf]=h}catch(ut){W(e,e.return,ut)}}break;case 6:if(ck(o,e),ek(e),s&4){if(e.stateNode===null)throw Error(p(162));c=e.stateNode,h=e.memoizedProps;try{c.nodeValue=h}catch(ut){W(e,e.return,ut)}}break;case 3:if(ck(o,e),ek(e),s&4&&a!==null&&a.memoizedState.isDehydrated)try{bd(o.containerInfo)}catch(ut){W(e,e.return,ut)}break;case 4:ck(o,e),ek(e);break;case 13:ck(o,e),ek(e),c=e.child,c.flags&8192&&(h=c.memoizedState!==null,c.stateNode.isHidden=h,!h||c.alternate!==null&&c.alternate.memoizedState!==null||(fk=B())),s&4&&ak(e);break;case 22:if(_=a!==null&&a.memoizedState!==null,e.mode&1?(U=(j=U)||_,ck(o,e),U=j):ck(o,e),ek(e),s&8192){if(j=e.memoizedState!==null,(e.stateNode.isHidden=j)&&!_&&e.mode&1)for(V=e,_=e.child;_!==null;){for(_e=V=_;V!==null;){switch(tt=V,it=tt.child,tt.tag){case 0:case 11:case 14:case 15:Pj(4,tt,tt.return);break;case 1:Lj(tt,tt.return);var st=tt.stateNode;if(typeof st.componentWillUnmount=="function"){s=tt,a=tt.return;try{o=s,st.props=o.memoizedProps,st.state=o.memoizedState,st.componentWillUnmount()}catch(ut){W(s,a,ut)}}break;case 5:Lj(tt,tt.return);break;case 22:if(tt.memoizedState!==null){gk(_e);continue}}it!==null?(it.return=tt,V=it):gk(_e)}_=_.sibling}e:for(_=null,_e=e;;){if(_e.tag===5){if(_===null){_=_e;try{c=_e.stateNode,j?(h=c.style,typeof h.setProperty=="function"?h.setProperty("display","none","important"):h.display="none"):(g=_e.stateNode,b=_e.memoizedProps.style,d=b!=null&&b.hasOwnProperty("display")?b.display:null,g.style.display=rb("display",d))}catch(ut){W(e,e.return,ut)}}}else if(_e.tag===6){if(_===null)try{_e.stateNode.nodeValue=j?"":_e.memoizedProps}catch(ut){W(e,e.return,ut)}}else if((_e.tag!==22&&_e.tag!==23||_e.memoizedState===null||_e===e)&&_e.child!==null){_e.child.return=_e,_e=_e.child;continue}if(_e===e)break e;for(;_e.sibling===null;){if(_e.return===null||_e.return===e)break e;_===_e&&(_=null),_e=_e.return}_===_e&&(_=null),_e.sibling.return=_e.return,_e=_e.sibling}}break;case 19:ck(o,e),ek(e),s&4&&ak(e);break;case 21:break;default:ck(o,e),ek(e)}}function ek(e){var o=e.flags;if(o&2){try{e:{for(var a=e.return;a!==null;){if(Tj(a)){var s=a;break e}a=a.return}throw Error(p(160))}switch(s.tag){case 5:var c=s.stateNode;s.flags&32&&(ob(c,""),s.flags&=-33);var h=Uj(e);Wj(e,h,c);break;case 3:case 4:var d=s.stateNode.containerInfo,g=Uj(e);Vj(e,g,d);break;default:throw Error(p(161))}}catch(b){W(e,e.return,b)}e.flags&=-3}o&4096&&(e.flags&=-4097)}function hk(e,o,a){V=e,ik(e)}function ik(e,o,a){for(var s=(e.mode&1)!==0;V!==null;){var c=V,h=c.child;if(c.tag===22&&s){var d=c.memoizedState!==null||Jj;if(!d){var g=c.alternate,b=g!==null&&g.memoizedState!==null||U;g=Jj;var j=U;if(Jj=d,(U=b)&&!j)for(V=c;V!==null;)d=V,b=d.child,d.tag===22&&d.memoizedState!==null?jk(c):b!==null?(b.return=d,V=b):jk(c);for(;h!==null;)V=h,ik(h),h=h.sibling;V=c,Jj=g,U=j}kk(e)}else c.subtreeFlags&8772&&h!==null?(h.return=c,V=h):kk(e)}}function kk(e){for(;V!==null;){var o=V;if(o.flags&8772){var a=o.alternate;try{if(o.flags&8772)switch(o.tag){case 0:case 11:case 15:U||Qj(5,o);break;case 1:var s=o.stateNode;if(o.flags&4&&!U)if(a===null)s.componentDidMount();else{var c=o.elementType===o.type?a.memoizedProps:Ci(o.type,a.memoizedProps);s.componentDidUpdate(c,a.memoizedState,s.__reactInternalSnapshotBeforeUpdate)}var h=o.updateQueue;h!==null&&sh(o,h,s);break;case 3:var d=o.updateQueue;if(d!==null){if(a=null,o.child!==null)switch(o.child.tag){case 5:a=o.child.stateNode;break;case 1:a=o.child.stateNode}sh(o,d,a)}break;case 5:var g=o.stateNode;if(a===null&&o.flags&4){a=g;var b=o.memoizedProps;switch(o.type){case"button":case"input":case"select":case"textarea":b.autoFocus&&a.focus();break;case"img":b.src&&(a.src=b.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(o.memoizedState===null){var j=o.alternate;if(j!==null){var _=j.memoizedState;if(_!==null){var _e=_.dehydrated;_e!==null&&bd(_e)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(p(163))}U||o.flags&512&&Rj(o)}catch(tt){W(o,o.return,tt)}}if(o===e){V=null;break}if(a=o.sibling,a!==null){a.return=o.return,V=a;break}V=o.return}}function gk(e){for(;V!==null;){var o=V;if(o===e){V=null;break}var a=o.sibling;if(a!==null){a.return=o.return,V=a;break}V=o.return}}function jk(e){for(;V!==null;){var o=V;try{switch(o.tag){case 0:case 11:case 15:var a=o.return;try{Qj(4,o)}catch(b){W(o,a,b)}break;case 1:var s=o.stateNode;if(typeof s.componentDidMount=="function"){var c=o.return;try{s.componentDidMount()}catch(b){W(o,c,b)}}var h=o.return;try{Rj(o)}catch(b){W(o,h,b)}break;case 5:var d=o.return;try{Rj(o)}catch(b){W(o,d,b)}}}catch(b){W(o,o.return,b)}if(o===e){V=null;break}var g=o.sibling;if(g!==null){g.return=o.return,V=g;break}V=o.return}}var lk=Math.ceil,mk=ua.ReactCurrentDispatcher,nk=ua.ReactCurrentOwner,ok=ua.ReactCurrentBatchConfig,K=0,Q=null,Y=null,Z=0,fj=0,ej=Uf(0),T=0,pk=null,rh=0,qk=0,rk=0,sk=null,tk=null,fk=0,Gj=1/0,uk=null,Oi=!1,Pi=null,Ri=null,vk=!1,wk=null,xk=0,yk=0,zk=null,Ak=-1,Bk=0;function R(){return K&6?B():Ak!==-1?Ak:Ak=B()}function yi(e){return e.mode&1?K&2&&Z!==0?Z&-Z:Kg.transition!==null?(Bk===0&&(Bk=yc()),Bk):(e=C,e!==0||(e=window.event,e=e===void 0?16:jd(e.type)),e):1}function gi(e,o,a,s){if(50<yk)throw yk=0,zk=null,Error(p(185));Ac(e,a,s),(!(K&2)||e!==Q)&&(e===Q&&(!(K&2)&&(qk|=a),T===4&&Ck(e,Z)),Dk(e,s),a===1&&K===0&&!(o.mode&1)&&(Gj=B()+500,fg&&jg()))}function Dk(e,o){var a=e.callbackNode;wc(e,o);var s=uc(e,e===Q?Z:0);if(s===0)a!==null&&bc(a),e.callbackNode=null,e.callbackPriority=0;else if(o=s&-s,e.callbackPriority!==o){if(a!=null&&bc(a),o===1)e.tag===0?ig(Ek.bind(null,e)):hg(Ek.bind(null,e)),Jf(function(){!(K&6)&&jg()}),a=null;else{switch(Dc(s)){case 1:a=fc;break;case 4:a=gc;break;case 16:a=hc;break;case 536870912:a=jc;break;default:a=hc}a=Fk(a,Gk.bind(null,e))}e.callbackPriority=o,e.callbackNode=a}}function Gk(e,o){if(Ak=-1,Bk=0,K&6)throw Error(p(327));var a=e.callbackNode;if(Hk()&&e.callbackNode!==a)return null;var s=uc(e,e===Q?Z:0);if(s===0)return null;if(s&30||s&e.expiredLanes||o)o=Ik(e,s);else{o=s;var c=K;K|=2;var h=Jk();(Q!==e||Z!==o)&&(uk=null,Gj=B()+500,Kk(e,o));do try{Lk();break}catch(g){Mk(e,g)}while(!0);$g(),mk.current=h,K=c,Y!==null?o=0:(Q=null,Z=0,o=T)}if(o!==0){if(o===2&&(c=xc(e),c!==0&&(s=c,o=Nk(e,c))),o===1)throw a=pk,Kk(e,0),Ck(e,s),Dk(e,B()),a;if(o===6)Ck(e,s);else{if(c=e.current.alternate,!(s&30)&&!Ok(c)&&(o=Ik(e,s),o===2&&(h=xc(e),h!==0&&(s=h,o=Nk(e,h))),o===1))throw a=pk,Kk(e,0),Ck(e,s),Dk(e,B()),a;switch(e.finishedWork=c,e.finishedLanes=s,o){case 0:case 1:throw Error(p(345));case 2:Pk(e,tk,uk);break;case 3:if(Ck(e,s),(s&130023424)===s&&(o=fk+500-B(),10<o)){if(uc(e,0)!==0)break;if(c=e.suspendedLanes,(c&s)!==s){R(),e.pingedLanes|=e.suspendedLanes&c;break}e.timeoutHandle=Ff(Pk.bind(null,e,tk,uk),o);break}Pk(e,tk,uk);break;case 4:if(Ck(e,s),(s&4194240)===s)break;for(o=e.eventTimes,c=-1;0<s;){var d=31-oc(s);h=1<<d,d=o[d],d>c&&(c=d),s&=~h}if(s=c,s=B()-s,s=(120>s?120:480>s?480:1080>s?1080:1920>s?1920:3e3>s?3e3:4320>s?4320:1960*lk(s/1960))-s,10<s){e.timeoutHandle=Ff(Pk.bind(null,e,tk,uk),s);break}Pk(e,tk,uk);break;case 5:Pk(e,tk,uk);break;default:throw Error(p(329))}}}return Dk(e,B()),e.callbackNode===a?Gk.bind(null,e):null}function Nk(e,o){var a=sk;return e.current.memoizedState.isDehydrated&&(Kk(e,o).flags|=256),e=Ik(e,o),e!==2&&(o=tk,tk=a,o!==null&&Fj(o)),e}function Fj(e){tk===null?tk=e:tk.push.apply(tk,e)}function Ok(e){for(var o=e;;){if(o.flags&16384){var a=o.updateQueue;if(a!==null&&(a=a.stores,a!==null))for(var s=0;s<a.length;s++){var c=a[s],h=c.getSnapshot;c=c.value;try{if(!He(h(),c))return!1}catch{return!1}}}if(a=o.child,o.subtreeFlags&16384&&a!==null)a.return=o,o=a;else{if(o===e)break;for(;o.sibling===null;){if(o.return===null||o.return===e)return!0;o=o.return}o.sibling.return=o.return,o=o.sibling}}return!0}function Ck(e,o){for(o&=~rk,o&=~qk,e.suspendedLanes|=o,e.pingedLanes&=~o,e=e.expirationTimes;0<o;){var a=31-oc(o),s=1<<a;e[a]=-1,o&=~s}}function Ek(e){if(K&6)throw Error(p(327));Hk();var o=uc(e,0);if(!(o&1))return Dk(e,B()),null;var a=Ik(e,o);if(e.tag!==0&&a===2){var s=xc(e);s!==0&&(o=s,a=Nk(e,s))}if(a===1)throw a=pk,Kk(e,0),Ck(e,o),Dk(e,B()),a;if(a===6)throw Error(p(345));return e.finishedWork=e.current.alternate,e.finishedLanes=o,Pk(e,tk,uk),Dk(e,B()),null}function Qk(e,o){var a=K;K|=1;try{return e(o)}finally{K=a,K===0&&(Gj=B()+500,fg&&jg())}}function Rk(e){wk!==null&&wk.tag===0&&!(K&6)&&Hk();var o=K;K|=1;var a=ok.transition,s=C;try{if(ok.transition=null,C=1,e)return e()}finally{C=s,ok.transition=a,K=o,!(K&6)&&jg()}}function Hj(){fj=ej.current,E(ej)}function Kk(e,o){e.finishedWork=null,e.finishedLanes=0;var a=e.timeoutHandle;if(a!==-1&&(e.timeoutHandle=-1,Gf(a)),Y!==null)for(a=Y.return;a!==null;){var s=a;switch(wg(s),s.tag){case 1:s=s.type.childContextTypes,s!=null&&$f();break;case 3:zh(),E(Wf),E(H),Eh();break;case 5:Bh(s);break;case 4:zh();break;case 13:E(L);break;case 19:E(L);break;case 10:ah(s.type._context);break;case 22:case 23:Hj()}a=a.return}if(Q=e,Y=e=Pg(e.current,null),Z=fj=o,T=0,pk=null,rk=qk=rh=0,tk=sk=null,fh!==null){for(o=0;o<fh.length;o++)if(a=fh[o],s=a.interleaved,s!==null){a.interleaved=null;var c=s.next,h=a.pending;if(h!==null){var d=h.next;h.next=c,s.next=d}a.pending=s}fh=null}return e}function Mk(e,o){do{var a=Y;try{if($g(),Fh.current=Rh,Ih){for(var s=M.memoizedState;s!==null;){var c=s.queue;c!==null&&(c.pending=null),s=s.next}Ih=!1}if(Hh=0,O=N=M=null,Jh=!1,Kh=0,nk.current=null,a===null||a.return===null){T=1,pk=o,Y=null;break}e:{var h=e,d=a.return,g=a,b=o;if(o=Z,g.flags|=32768,b!==null&&typeof b=="object"&&typeof b.then=="function"){var j=b,_=g,_e=_.tag;if(!(_.mode&1)&&(_e===0||_e===11||_e===15)){var tt=_.alternate;tt?(_.updateQueue=tt.updateQueue,_.memoizedState=tt.memoizedState,_.lanes=tt.lanes):(_.updateQueue=null,_.memoizedState=null)}var it=Ui(d);if(it!==null){it.flags&=-257,Vi(it,d,g,h,o),it.mode&1&&Si(h,j,o),o=it,b=j;var st=o.updateQueue;if(st===null){var ut=new Set;ut.add(b),o.updateQueue=ut}else st.add(b);break e}else{if(!(o&1)){Si(h,j,o),tj();break e}b=Error(p(426))}}else if(I&&g.mode&1){var ct=Ui(d);if(ct!==null){!(ct.flags&65536)&&(ct.flags|=256),Vi(ct,d,g,h,o),Jg(Ji(b,g));break e}}h=b=Ji(b,g),T!==4&&(T=2),sk===null?sk=[h]:sk.push(h),h=d;do{switch(h.tag){case 3:h.flags|=65536,o&=-o,h.lanes|=o;var rt=Ni(h,b,o);ph(h,rt);break e;case 1:g=b;var ot=h.type,lt=h.stateNode;if(!(h.flags&128)&&(typeof ot.getDerivedStateFromError=="function"||lt!==null&&typeof lt.componentDidCatch=="function"&&(Ri===null||!Ri.has(lt)))){h.flags|=65536,o&=-o,h.lanes|=o;var dt=Qi(h,g,o);ph(h,dt);break e}}h=h.return}while(h!==null)}Sk(a)}catch(pt){o=pt,Y===a&&a!==null&&(Y=a=a.return);continue}break}while(!0)}function Jk(){var e=mk.current;return mk.current=Rh,e===null?Rh:e}function tj(){(T===0||T===3||T===2)&&(T=4),Q===null||!(rh&268435455)&&!(qk&268435455)||Ck(Q,Z)}function Ik(e,o){var a=K;K|=2;var s=Jk();(Q!==e||Z!==o)&&(uk=null,Kk(e,o));do try{Tk();break}catch(c){Mk(e,c)}while(!0);if($g(),K=a,mk.current=s,Y!==null)throw Error(p(261));return Q=null,Z=0,T}function Tk(){for(;Y!==null;)Uk(Y)}function Lk(){for(;Y!==null&&!cc();)Uk(Y)}function Uk(e){var o=Vk(e.alternate,e,fj);e.memoizedProps=e.pendingProps,o===null?Sk(e):Y=o,nk.current=null}function Sk(e){var o=e;do{var a=o.alternate;if(e=o.return,o.flags&32768){if(a=Ij(a,o),a!==null){a.flags&=32767,Y=a;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{T=6,Y=null;return}}else if(a=Ej(a,o,fj),a!==null){Y=a;return}if(o=o.sibling,o!==null){Y=o;return}Y=o=e}while(o!==null);T===0&&(T=5)}function Pk(e,o,a){var s=C,c=ok.transition;try{ok.transition=null,C=1,Wk(e,o,a,s)}finally{ok.transition=c,C=s}return null}function Wk(e,o,a,s){do Hk();while(wk!==null);if(K&6)throw Error(p(327));a=e.finishedWork;var c=e.finishedLanes;if(a===null)return null;if(e.finishedWork=null,e.finishedLanes=0,a===e.current)throw Error(p(177));e.callbackNode=null,e.callbackPriority=0;var h=a.lanes|a.childLanes;if(Bc(e,h),e===Q&&(Y=Q=null,Z=0),!(a.subtreeFlags&2064)&&!(a.flags&2064)||vk||(vk=!0,Fk(hc,function(){return Hk(),null})),h=(a.flags&15990)!==0,a.subtreeFlags&15990||h){h=ok.transition,ok.transition=null;var d=C;C=1;var g=K;K|=4,nk.current=null,Oj(e,a),dk(a,e),Oe(Df),dd=!!Cf,Df=Cf=null,e.current=a,hk(a),dc(),K=g,C=d,ok.transition=h}else e.current=a;if(vk&&(vk=!1,wk=e,xk=c),h=e.pendingLanes,h===0&&(Ri=null),mc(a.stateNode),Dk(e,B()),o!==null)for(s=e.onRecoverableError,a=0;a<o.length;a++)c=o[a],s(c.value,{componentStack:c.stack,digest:c.digest});if(Oi)throw Oi=!1,e=Pi,Pi=null,e;return xk&1&&e.tag!==0&&Hk(),h=e.pendingLanes,h&1?e===zk?yk++:(yk=0,zk=e):yk=0,jg(),null}function Hk(){if(wk!==null){var e=Dc(xk),o=ok.transition,a=C;try{if(ok.transition=null,C=16>e?16:e,wk===null)var s=!1;else{if(e=wk,wk=null,xk=0,K&6)throw Error(p(331));var c=K;for(K|=4,V=e.current;V!==null;){var h=V,d=h.child;if(V.flags&16){var g=h.deletions;if(g!==null){for(var b=0;b<g.length;b++){var j=g[b];for(V=j;V!==null;){var _=V;switch(_.tag){case 0:case 11:case 15:Pj(8,_,h)}var _e=_.child;if(_e!==null)_e.return=_,V=_e;else for(;V!==null;){_=V;var tt=_.sibling,it=_.return;if(Sj(_),_===j){V=null;break}if(tt!==null){tt.return=it,V=tt;break}V=it}}}var st=h.alternate;if(st!==null){var ut=st.child;if(ut!==null){st.child=null;do{var ct=ut.sibling;ut.sibling=null,ut=ct}while(ut!==null)}}V=h}}if(h.subtreeFlags&2064&&d!==null)d.return=h,V=d;else e:for(;V!==null;){if(h=V,h.flags&2048)switch(h.tag){case 0:case 11:case 15:Pj(9,h,h.return)}var rt=h.sibling;if(rt!==null){rt.return=h.return,V=rt;break e}V=h.return}}var ot=e.current;for(V=ot;V!==null;){d=V;var lt=d.child;if(d.subtreeFlags&2064&&lt!==null)lt.return=d,V=lt;else e:for(d=ot;V!==null;){if(g=V,g.flags&2048)try{switch(g.tag){case 0:case 11:case 15:Qj(9,g)}}catch(pt){W(g,g.return,pt)}if(g===d){V=null;break e}var dt=g.sibling;if(dt!==null){dt.return=g.return,V=dt;break e}V=g.return}}if(K=c,jg(),lc&&typeof lc.onPostCommitFiberRoot=="function")try{lc.onPostCommitFiberRoot(kc,e)}catch{}s=!0}return s}finally{C=a,ok.transition=o}}return!1}function Xk(e,o,a){o=Ji(a,o),o=Ni(e,o,1),e=nh(e,o,1),o=R(),e!==null&&(Ac(e,1,o),Dk(e,o))}function W(e,o,a){if(e.tag===3)Xk(e,e,a);else for(;o!==null;){if(o.tag===3){Xk(o,e,a);break}else if(o.tag===1){var s=o.stateNode;if(typeof o.type.getDerivedStateFromError=="function"||typeof s.componentDidCatch=="function"&&(Ri===null||!Ri.has(s))){e=Ji(a,e),e=Qi(o,e,1),o=nh(o,e,1),e=R(),o!==null&&(Ac(o,1,e),Dk(o,e));break}}o=o.return}}function Ti(e,o,a){var s=e.pingCache;s!==null&&s.delete(o),o=R(),e.pingedLanes|=e.suspendedLanes&a,Q===e&&(Z&a)===a&&(T===4||T===3&&(Z&130023424)===Z&&500>B()-fk?Kk(e,0):rk|=a),Dk(e,o)}function Yk(e,o){o===0&&(e.mode&1?(o=sc,sc<<=1,!(sc&130023424)&&(sc=4194304)):o=1);var a=R();e=ih(e,o),e!==null&&(Ac(e,o,a),Dk(e,a))}function uj(e){var o=e.memoizedState,a=0;o!==null&&(a=o.retryLane),Yk(e,a)}function bk(e,o){var a=0;switch(e.tag){case 13:var s=e.stateNode,c=e.memoizedState;c!==null&&(a=c.retryLane);break;case 19:s=e.stateNode;break;default:throw Error(p(314))}s!==null&&s.delete(o),Yk(e,a)}var Vk;Vk=function(e,o,a){if(e!==null)if(e.memoizedProps!==o.pendingProps||Wf.current)dh=!0;else{if(!(e.lanes&a)&&!(o.flags&128))return dh=!1,yj(e,o,a);dh=!!(e.flags&131072)}else dh=!1,I&&o.flags&1048576&&ug(o,ng,o.index);switch(o.lanes=0,o.tag){case 2:var s=o.type;ij(e,o),e=o.pendingProps;var c=Yf(o,H.current);ch(o,a),c=Nh(null,o,s,e,c,a);var h=Sh();return o.flags|=1,typeof c=="object"&&c!==null&&typeof c.render=="function"&&c.$$typeof===void 0?(o.tag=1,o.memoizedState=null,o.updateQueue=null,Zf(s)?(h=!0,cg(o)):h=!1,o.memoizedState=c.state!==null&&c.state!==void 0?c.state:null,kh(o),c.updater=Ei,o.stateNode=c,c._reactInternals=o,Ii(o,s,e,a),o=jj(null,o,s,!0,h,a)):(o.tag=0,I&&h&&vg(o),Xi(null,o,c,a),o=o.child),o;case 16:s=o.elementType;e:{switch(ij(e,o),e=o.pendingProps,c=s._init,s=c(s._payload),o.type=s,c=o.tag=Zk(s),e=Ci(s,e),c){case 0:o=cj(null,o,s,e,a);break e;case 1:o=hj(null,o,s,e,a);break e;case 11:o=Yi(null,o,s,e,a);break e;case 14:o=$i(null,o,s,Ci(s.type,e),a);break e}throw Error(p(306,s,""))}return o;case 0:return s=o.type,c=o.pendingProps,c=o.elementType===s?c:Ci(s,c),cj(e,o,s,c,a);case 1:return s=o.type,c=o.pendingProps,c=o.elementType===s?c:Ci(s,c),hj(e,o,s,c,a);case 3:e:{if(kj(o),e===null)throw Error(p(387));s=o.pendingProps,h=o.memoizedState,c=h.element,lh(e,o),qh(o,s,null,a);var d=o.memoizedState;if(s=d.element,h.isDehydrated)if(h={element:s,isDehydrated:!1,cache:d.cache,pendingSuspenseBoundaries:d.pendingSuspenseBoundaries,transitions:d.transitions},o.updateQueue.baseState=h,o.memoizedState=h,o.flags&256){c=Ji(Error(p(423)),o),o=lj(e,o,s,a,c);break e}else if(s!==c){c=Ji(Error(p(424)),o),o=lj(e,o,s,a,c);break e}else for(yg=Lf(o.stateNode.containerInfo.firstChild),xg=o,I=!0,zg=null,a=Vg(o,null,s,a),o.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(Ig(),s===c){o=Zi(e,o,a);break e}Xi(e,o,s,a)}o=o.child}return o;case 5:return Ah(o),e===null&&Eg(o),s=o.type,c=o.pendingProps,h=e!==null?e.memoizedProps:null,d=c.children,Ef(s,c)?d=null:h!==null&&Ef(s,h)&&(o.flags|=32),gj(e,o),Xi(e,o,d,a),o.child;case 6:return e===null&&Eg(o),null;case 13:return oj(e,o,a);case 4:return yh(o,o.stateNode.containerInfo),s=o.pendingProps,e===null?o.child=Ug(o,null,s,a):Xi(e,o,s,a),o.child;case 11:return s=o.type,c=o.pendingProps,c=o.elementType===s?c:Ci(s,c),Yi(e,o,s,c,a);case 7:return Xi(e,o,o.pendingProps,a),o.child;case 8:return Xi(e,o,o.pendingProps.children,a),o.child;case 12:return Xi(e,o,o.pendingProps.children,a),o.child;case 10:e:{if(s=o.type._context,c=o.pendingProps,h=o.memoizedProps,d=c.value,G(Wg,s._currentValue),s._currentValue=d,h!==null)if(He(h.value,d)){if(h.children===c.children&&!Wf.current){o=Zi(e,o,a);break e}}else for(h=o.child,h!==null&&(h.return=o);h!==null;){var g=h.dependencies;if(g!==null){d=h.child;for(var b=g.firstContext;b!==null;){if(b.context===s){if(h.tag===1){b=mh(-1,a&-a),b.tag=2;var j=h.updateQueue;if(j!==null){j=j.shared;var _=j.pending;_===null?b.next=b:(b.next=_.next,_.next=b),j.pending=b}}h.lanes|=a,b=h.alternate,b!==null&&(b.lanes|=a),bh(h.return,a,o),g.lanes|=a;break}b=b.next}}else if(h.tag===10)d=h.type===o.type?null:h.child;else if(h.tag===18){if(d=h.return,d===null)throw Error(p(341));d.lanes|=a,g=d.alternate,g!==null&&(g.lanes|=a),bh(d,a,o),d=h.sibling}else d=h.child;if(d!==null)d.return=h;else for(d=h;d!==null;){if(d===o){d=null;break}if(h=d.sibling,h!==null){h.return=d.return,d=h;break}d=d.return}h=d}Xi(e,o,c.children,a),o=o.child}return o;case 9:return c=o.type,s=o.pendingProps.children,ch(o,a),c=eh(c),s=s(c),o.flags|=1,Xi(e,o,s,a),o.child;case 14:return s=o.type,c=Ci(s,o.pendingProps),c=Ci(s.type,c),$i(e,o,s,c,a);case 15:return bj(e,o,o.type,o.pendingProps,a);case 17:return s=o.type,c=o.pendingProps,c=o.elementType===s?c:Ci(s,c),ij(e,o),o.tag=1,Zf(s)?(e=!0,cg(o)):e=!1,ch(o,a),Gi(o,s,c),Ii(o,s,c,a),jj(null,o,s,!0,e,a);case 19:return xj(e,o,a);case 22:return dj(e,o,a)}throw Error(p(156,o.tag))};function Fk(e,o){return ac(e,o)}function $k(e,o,a,s){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=o,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=s,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Bg(e,o,a,s){return new $k(e,o,a,s)}function aj(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Zk(e){if(typeof e=="function")return aj(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Da)return 11;if(e===Ga)return 14}return 2}function Pg(e,o){var a=e.alternate;return a===null?(a=Bg(e.tag,o,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=o,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&14680064,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,o=e.dependencies,a.dependencies=o===null?null:{lanes:o.lanes,firstContext:o.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a}function Rg(e,o,a,s,c,h){var d=2;if(s=e,typeof e=="function")aj(e)&&(d=1);else if(typeof e=="string")d=5;else e:switch(e){case ya:return Tg(a.children,c,h,o);case za:d=8,c|=8;break;case Aa:return e=Bg(12,a,o,c|2),e.elementType=Aa,e.lanes=h,e;case Ea:return e=Bg(13,a,o,c),e.elementType=Ea,e.lanes=h,e;case Fa:return e=Bg(19,a,o,c),e.elementType=Fa,e.lanes=h,e;case Ia:return pj(a,c,h,o);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Ba:d=10;break e;case Ca:d=9;break e;case Da:d=11;break e;case Ga:d=14;break e;case Ha:d=16,s=null;break e}throw Error(p(130,e==null?e:typeof e,""))}return o=Bg(d,a,o,c),o.elementType=e,o.type=s,o.lanes=h,o}function Tg(e,o,a,s){return e=Bg(7,e,s,o),e.lanes=a,e}function pj(e,o,a,s){return e=Bg(22,e,s,o),e.elementType=Ia,e.lanes=a,e.stateNode={isHidden:!1},e}function Qg(e,o,a){return e=Bg(6,e,null,o),e.lanes=a,e}function Sg(e,o,a){return o=Bg(4,e.children!==null?e.children:[],e.key,o),o.lanes=a,o.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},o}function al(e,o,a,s,c){this.tag=o,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=zc(0),this.expirationTimes=zc(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=zc(0),this.identifierPrefix=s,this.onRecoverableError=c,this.mutableSourceEagerHydrationData=null}function bl(e,o,a,s,c,h,d,g,b){return e=new al(e,o,a,g,b),o===1?(o=1,h===!0&&(o|=8)):o=0,h=Bg(3,null,null,o),e.current=h,h.stateNode=e,h.memoizedState={element:s,isDehydrated:a,cache:null,transitions:null,pendingSuspenseBoundaries:null},kh(h),e}function cl(e,o,a){var s=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:wa,key:s==null?null:""+s,children:e,containerInfo:o,implementation:a}}function dl(e){if(!e)return Vf;e=e._reactInternals;e:{if(Vb(e)!==e||e.tag!==1)throw Error(p(170));var o=e;do{switch(o.tag){case 3:o=o.stateNode.context;break e;case 1:if(Zf(o.type)){o=o.stateNode.__reactInternalMemoizedMergedChildContext;break e}}o=o.return}while(o!==null);throw Error(p(171))}if(e.tag===1){var a=e.type;if(Zf(a))return bg(e,a,o)}return o}function el(e,o,a,s,c,h,d,g,b){return e=bl(a,s,!0,e,c,h,d,g,b),e.context=dl(null),a=e.current,s=R(),c=yi(a),h=mh(s,c),h.callback=o??null,nh(a,h,c),e.current.lanes=c,Ac(e,c,s),Dk(e,s),e}function fl(e,o,a,s){var c=o.current,h=R(),d=yi(c);return a=dl(a),o.context===null?o.context=a:o.pendingContext=a,o=mh(h,d),o.payload={element:e},s=s===void 0?null:s,s!==null&&(o.callback=s),e=nh(c,o,d),e!==null&&(gi(e,c,d,h),oh(e,c,d)),d}function gl(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function hl(e,o){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<o?a:o}}function il(e,o){hl(e,o),(e=e.alternate)&&hl(e,o)}function jl(){return null}var kl=typeof reportError=="function"?reportError:function(e){console.error(e)};function ll(e){this._internalRoot=e}ml.prototype.render=ll.prototype.render=function(e){var o=this._internalRoot;if(o===null)throw Error(p(409));fl(e,o,null,null)};ml.prototype.unmount=ll.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var o=e.containerInfo;Rk(function(){fl(null,e,null,null)}),o[uf]=null}};function ml(e){this._internalRoot=e}ml.prototype.unstable_scheduleHydration=function(e){if(e){var o=Hc();e={blockedOn:null,target:e,priority:o};for(var a=0;a<Qc.length&&o!==0&&o<Qc[a].priority;a++);Qc.splice(a,0,e),a===0&&Vc(e)}};function nl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function ol(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function pl(){}function ql(e,o,a,s,c){if(c){if(typeof s=="function"){var h=s;s=function(){var j=gl(d);h.call(j)}}var d=el(o,s,e,0,null,!1,!1,"",pl);return e._reactRootContainer=d,e[uf]=d.current,sf(e.nodeType===8?e.parentNode:e),Rk(),d}for(;c=e.lastChild;)e.removeChild(c);if(typeof s=="function"){var g=s;s=function(){var j=gl(b);g.call(j)}}var b=bl(e,0,!1,null,null,!1,!1,"",pl);return e._reactRootContainer=b,e[uf]=b.current,sf(e.nodeType===8?e.parentNode:e),Rk(function(){fl(o,b,a,s)}),b}function rl(e,o,a,s,c){var h=a._reactRootContainer;if(h){var d=h;if(typeof c=="function"){var g=c;c=function(){var b=gl(d);g.call(b)}}fl(o,d,e,c)}else d=ql(a,o,e,c,s);return gl(d)}Ec=function(e){switch(e.tag){case 3:var o=e.stateNode;if(o.current.memoizedState.isDehydrated){var a=tc(o.pendingLanes);a!==0&&(Cc(o,a|1),Dk(o,B()),!(K&6)&&(Gj=B()+500,jg()))}break;case 13:Rk(function(){var s=ih(e,1);if(s!==null){var c=R();gi(s,e,1,c)}}),il(e,1)}};Fc=function(e){if(e.tag===13){var o=ih(e,134217728);if(o!==null){var a=R();gi(o,e,134217728,a)}il(e,134217728)}};Gc=function(e){if(e.tag===13){var o=yi(e),a=ih(e,o);if(a!==null){var s=R();gi(a,e,o,s)}il(e,o)}};Hc=function(){return C};Ic=function(e,o){var a=C;try{return C=e,o()}finally{C=a}};yb=function(e,o,a){switch(o){case"input":if(bb(e,a),o=a.name,a.type==="radio"&&o!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll("input[name="+JSON.stringify(""+o)+'][type="radio"]'),o=0;o<a.length;o++){var s=a[o];if(s!==e&&s.form===e.form){var c=Db(s);if(!c)throw Error(p(90));Wa(s),bb(s,c)}}}break;case"textarea":ib(e,a);break;case"select":o=a.value,o!=null&&fb(e,!!a.multiple,o,!1)}};Gb=Qk;Hb=Rk;var sl={usingClientEntryPoint:!1,Events:[Cb,ue,Db,Eb,Fb,Qk]},tl={findFiberByHostInstance:Wc,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},ul={bundleType:tl.bundleType,version:tl.version,rendererPackageName:tl.rendererPackageName,rendererConfig:tl.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:ua.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Zb(e),e===null?null:e.stateNode},findFiberByHostInstance:tl.findFiberByHostInstance||jl,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var vl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!vl.isDisabled&&vl.supportsFiber)try{kc=vl.inject(ul),lc=vl}catch{}}reactDom_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=sl;reactDom_production_min.createPortal=function(e,o){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!nl(o))throw Error(p(200));return cl(e,o,null,a)};reactDom_production_min.createRoot=function(e,o){if(!nl(e))throw Error(p(299));var a=!1,s="",c=kl;return o!=null&&(o.unstable_strictMode===!0&&(a=!0),o.identifierPrefix!==void 0&&(s=o.identifierPrefix),o.onRecoverableError!==void 0&&(c=o.onRecoverableError)),o=bl(e,1,!1,null,null,a,!1,s,c),e[uf]=o.current,sf(e.nodeType===8?e.parentNode:e),new ll(o)};reactDom_production_min.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var o=e._reactInternals;if(o===void 0)throw typeof e.render=="function"?Error(p(188)):(e=Object.keys(e).join(","),Error(p(268,e)));return e=Zb(o),e=e===null?null:e.stateNode,e};reactDom_production_min.flushSync=function(e){return Rk(e)};reactDom_production_min.hydrate=function(e,o,a){if(!ol(o))throw Error(p(200));return rl(null,e,o,!0,a)};reactDom_production_min.hydrateRoot=function(e,o,a){if(!nl(e))throw Error(p(405));var s=a!=null&&a.hydratedSources||null,c=!1,h="",d=kl;if(a!=null&&(a.unstable_strictMode===!0&&(c=!0),a.identifierPrefix!==void 0&&(h=a.identifierPrefix),a.onRecoverableError!==void 0&&(d=a.onRecoverableError)),o=el(o,null,e,1,a??null,c,!1,h,d),e[uf]=o.current,sf(e),s)for(e=0;e<s.length;e++)a=s[e],c=a._getVersion,c=c(a._source),o.mutableSourceEagerHydrationData==null?o.mutableSourceEagerHydrationData=[a,c]:o.mutableSourceEagerHydrationData.push(a,c);return new ml(o)};reactDom_production_min.render=function(e,o,a){if(!ol(o))throw Error(p(200));return rl(null,e,o,!1,a)};reactDom_production_min.unmountComponentAtNode=function(e){if(!ol(e))throw Error(p(40));return e._reactRootContainer?(Rk(function(){rl(null,null,e,!1,function(){e._reactRootContainer=null,e[uf]=null})}),!0):!1};reactDom_production_min.unstable_batchedUpdates=Qk;reactDom_production_min.unstable_renderSubtreeIntoContainer=function(e,o,a,s){if(!ol(a))throw Error(p(200));if(e==null||e._reactInternals===void 0)throw Error(p(38));return rl(e,o,a,!1,s)};reactDom_production_min.version="18.3.1-next-f1338f8080-20240426";function checkDCE(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE)}catch(e){console.error(e)}}checkDCE(),reactDom.exports=reactDom_production_min;var reactDomExports=reactDom.exports,createRoot,m=reactDomExports;createRoot=m.createRoot,m.hydrateRoot;/**
 * @remix-run/router v1.23.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function _extends$3(){return _extends$3=Object.assign?Object.assign.bind():function(e){for(var o=1;o<arguments.length;o++){var a=arguments[o];for(var s in a)Object.prototype.hasOwnProperty.call(a,s)&&(e[s]=a[s])}return e},_extends$3.apply(this,arguments)}var Action;(function(e){e.Pop="POP",e.Push="PUSH",e.Replace="REPLACE"})(Action||(Action={}));const PopStateEventType="popstate";function createBrowserHistory(e){e===void 0&&(e={});function o(s,c){let{pathname:h,search:d,hash:g}=s.location;return createLocation("",{pathname:h,search:d,hash:g},c.state&&c.state.usr||null,c.state&&c.state.key||"default")}function a(s,c){return typeof c=="string"?c:createPath(c)}return getUrlBasedHistory(o,a,null,e)}function invariant$1(e,o){if(e===!1||e===null||typeof e>"u")throw new Error(o)}function warning(e,o){if(!e){typeof console<"u"&&console.warn(o);try{throw new Error(o)}catch{}}}function createKey(){return Math.random().toString(36).substr(2,8)}function getHistoryState(e,o){return{usr:e.state,key:e.key,idx:o}}function createLocation(e,o,a,s){return a===void 0&&(a=null),_extends$3({pathname:typeof e=="string"?e:e.pathname,search:"",hash:""},typeof o=="string"?parsePath(o):o,{state:a,key:o&&o.key||s||createKey()})}function createPath(e){let{pathname:o="/",search:a="",hash:s=""}=e;return a&&a!=="?"&&(o+=a.charAt(0)==="?"?a:"?"+a),s&&s!=="#"&&(o+=s.charAt(0)==="#"?s:"#"+s),o}function parsePath(e){let o={};if(e){let a=e.indexOf("#");a>=0&&(o.hash=e.substr(a),e=e.substr(0,a));let s=e.indexOf("?");s>=0&&(o.search=e.substr(s),e=e.substr(0,s)),e&&(o.pathname=e)}return o}function getUrlBasedHistory(e,o,a,s){s===void 0&&(s={});let{window:c=document.defaultView,v5Compat:h=!1}=s,d=c.history,g=Action.Pop,b=null,j=_();j==null&&(j=0,d.replaceState(_extends$3({},d.state,{idx:j}),""));function _(){return(d.state||{idx:null}).idx}function _e(){g=Action.Pop;let ct=_(),rt=ct==null?null:ct-j;j=ct,b&&b({action:g,location:ut.location,delta:rt})}function tt(ct,rt){g=Action.Push;let ot=createLocation(ut.location,ct,rt);j=_()+1;let lt=getHistoryState(ot,j),dt=ut.createHref(ot);try{d.pushState(lt,"",dt)}catch(pt){if(pt instanceof DOMException&&pt.name==="DataCloneError")throw pt;c.location.assign(dt)}h&&b&&b({action:g,location:ut.location,delta:1})}function it(ct,rt){g=Action.Replace;let ot=createLocation(ut.location,ct,rt);j=_();let lt=getHistoryState(ot,j),dt=ut.createHref(ot);d.replaceState(lt,"",dt),h&&b&&b({action:g,location:ut.location,delta:0})}function st(ct){let rt=c.location.origin!=="null"?c.location.origin:c.location.href,ot=typeof ct=="string"?ct:createPath(ct);return ot=ot.replace(/ $/,"%20"),invariant$1(rt,"No window.location.(origin|href) available to create URL for href: "+ot),new URL(ot,rt)}let ut={get action(){return g},get location(){return e(c,d)},listen(ct){if(b)throw new Error("A history only accepts one active listener");return c.addEventListener(PopStateEventType,_e),b=ct,()=>{c.removeEventListener(PopStateEventType,_e),b=null}},createHref(ct){return o(c,ct)},createURL:st,encodeLocation(ct){let rt=st(ct);return{pathname:rt.pathname,search:rt.search,hash:rt.hash}},push:tt,replace:it,go(ct){return d.go(ct)}};return ut}var ResultType;(function(e){e.data="data",e.deferred="deferred",e.redirect="redirect",e.error="error"})(ResultType||(ResultType={}));function matchRoutes(e,o,a){return a===void 0&&(a="/"),matchRoutesImpl(e,o,a,!1)}function matchRoutesImpl(e,o,a,s){let c=typeof o=="string"?parsePath(o):o,h=stripBasename(c.pathname||"/",a);if(h==null)return null;let d=flattenRoutes(e);rankRouteBranches(d);let g=null;for(let b=0;g==null&&b<d.length;++b){let j=decodePath(h);g=matchRouteBranch(d[b],j,s)}return g}function flattenRoutes(e,o,a,s){o===void 0&&(o=[]),a===void 0&&(a=[]),s===void 0&&(s="");let c=(h,d,g)=>{let b={relativePath:g===void 0?h.path||"":g,caseSensitive:h.caseSensitive===!0,childrenIndex:d,route:h};b.relativePath.startsWith("/")&&(invariant$1(b.relativePath.startsWith(s),'Absolute route path "'+b.relativePath+'" nested under path '+('"'+s+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),b.relativePath=b.relativePath.slice(s.length));let j=joinPaths([s,b.relativePath]),_=a.concat(b);h.children&&h.children.length>0&&(invariant$1(h.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+j+'".')),flattenRoutes(h.children,o,_,j)),!(h.path==null&&!h.index)&&o.push({path:j,score:computeScore(j,h.index),routesMeta:_})};return e.forEach((h,d)=>{var g;if(h.path===""||!((g=h.path)!=null&&g.includes("?")))c(h,d);else for(let b of explodeOptionalSegments(h.path))c(h,d,b)}),o}function explodeOptionalSegments(e){let o=e.split("/");if(o.length===0)return[];let[a,...s]=o,c=a.endsWith("?"),h=a.replace(/\?$/,"");if(s.length===0)return c?[h,""]:[h];let d=explodeOptionalSegments(s.join("/")),g=[];return g.push(...d.map(b=>b===""?h:[h,b].join("/"))),c&&g.push(...d),g.map(b=>e.startsWith("/")&&b===""?"/":b)}function rankRouteBranches(e){e.sort((o,a)=>o.score!==a.score?a.score-o.score:compareIndexes(o.routesMeta.map(s=>s.childrenIndex),a.routesMeta.map(s=>s.childrenIndex)))}const paramRe=/^:[\w-]+$/,dynamicSegmentValue=3,indexRouteValue=2,emptySegmentValue=1,staticSegmentValue=10,splatPenalty=-2,isSplat=e=>e==="*";function computeScore(e,o){let a=e.split("/"),s=a.length;return a.some(isSplat)&&(s+=splatPenalty),o&&(s+=indexRouteValue),a.filter(c=>!isSplat(c)).reduce((c,h)=>c+(paramRe.test(h)?dynamicSegmentValue:h===""?emptySegmentValue:staticSegmentValue),s)}function compareIndexes(e,o){return e.length===o.length&&e.slice(0,-1).every((s,c)=>s===o[c])?e[e.length-1]-o[o.length-1]:0}function matchRouteBranch(e,o,a){let{routesMeta:s}=e,c={},h="/",d=[];for(let g=0;g<s.length;++g){let b=s[g],j=g===s.length-1,_=h==="/"?o:o.slice(h.length)||"/",_e=matchPath({path:b.relativePath,caseSensitive:b.caseSensitive,end:j},_),tt=b.route;if(!_e&&j&&a&&!s[s.length-1].route.index&&(_e=matchPath({path:b.relativePath,caseSensitive:b.caseSensitive,end:!1},_)),!_e)return null;Object.assign(c,_e.params),d.push({params:c,pathname:joinPaths([h,_e.pathname]),pathnameBase:normalizePathname(joinPaths([h,_e.pathnameBase])),route:tt}),_e.pathnameBase!=="/"&&(h=joinPaths([h,_e.pathnameBase]))}return d}function matchPath(e,o){typeof e=="string"&&(e={path:e,caseSensitive:!1,end:!0});let[a,s]=compilePath(e.path,e.caseSensitive,e.end),c=o.match(a);if(!c)return null;let h=c[0],d=h.replace(/(.)\/+$/,"$1"),g=c.slice(1);return{params:s.reduce((j,_,_e)=>{let{paramName:tt,isOptional:it}=_;if(tt==="*"){let ut=g[_e]||"";d=h.slice(0,h.length-ut.length).replace(/(.)\/+$/,"$1")}const st=g[_e];return it&&!st?j[tt]=void 0:j[tt]=(st||"").replace(/%2F/g,"/"),j},{}),pathname:h,pathnameBase:d,pattern:e}}function compilePath(e,o,a){o===void 0&&(o=!1),a===void 0&&(a=!0),warning(e==="*"||!e.endsWith("*")||e.endsWith("/*"),'Route path "'+e+'" will be treated as if it were '+('"'+e.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+e.replace(/\*$/,"/*")+'".'));let s=[],c="^"+e.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(d,g,b)=>(s.push({paramName:g,isOptional:b!=null}),b?"/?([^\\/]+)?":"/([^\\/]+)"));return e.endsWith("*")?(s.push({paramName:"*"}),c+=e==="*"||e==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):a?c+="\\/*$":e!==""&&e!=="/"&&(c+="(?:(?=\\/|$))"),[new RegExp(c,o?void 0:"i"),s]}function decodePath(e){try{return e.split("/").map(o=>decodeURIComponent(o).replace(/\//g,"%2F")).join("/")}catch(o){return warning(!1,'The URL path "'+e+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+o+").")),e}}function stripBasename(e,o){if(o==="/")return e;if(!e.toLowerCase().startsWith(o.toLowerCase()))return null;let a=o.endsWith("/")?o.length-1:o.length,s=e.charAt(a);return s&&s!=="/"?null:e.slice(a)||"/"}function resolvePath(e,o){o===void 0&&(o="/");let{pathname:a,search:s="",hash:c=""}=typeof e=="string"?parsePath(e):e;return{pathname:a?a.startsWith("/")?a:resolvePathname(a,o):o,search:normalizeSearch(s),hash:normalizeHash(c)}}function resolvePathname(e,o){let a=o.replace(/\/+$/,"").split("/");return e.split("/").forEach(c=>{c===".."?a.length>1&&a.pop():c!=="."&&a.push(c)}),a.length>1?a.join("/"):"/"}function getInvalidPathError(e,o,a,s){return"Cannot include a '"+e+"' character in a manually specified "+("`to."+o+"` field ["+JSON.stringify(s)+"].  Please separate it out to the ")+("`to."+a+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function getPathContributingMatches(e){return e.filter((o,a)=>a===0||o.route.path&&o.route.path.length>0)}function getResolveToMatches(e,o){let a=getPathContributingMatches(e);return o?a.map((s,c)=>c===a.length-1?s.pathname:s.pathnameBase):a.map(s=>s.pathnameBase)}function resolveTo(e,o,a,s){s===void 0&&(s=!1);let c;typeof e=="string"?c=parsePath(e):(c=_extends$3({},e),invariant$1(!c.pathname||!c.pathname.includes("?"),getInvalidPathError("?","pathname","search",c)),invariant$1(!c.pathname||!c.pathname.includes("#"),getInvalidPathError("#","pathname","hash",c)),invariant$1(!c.search||!c.search.includes("#"),getInvalidPathError("#","search","hash",c)));let h=e===""||c.pathname==="",d=h?"/":c.pathname,g;if(d==null)g=a;else{let _e=o.length-1;if(!s&&d.startsWith("..")){let tt=d.split("/");for(;tt[0]==="..";)tt.shift(),_e-=1;c.pathname=tt.join("/")}g=_e>=0?o[_e]:"/"}let b=resolvePath(c,g),j=d&&d!=="/"&&d.endsWith("/"),_=(h||d===".")&&a.endsWith("/");return!b.pathname.endsWith("/")&&(j||_)&&(b.pathname+="/"),b}const joinPaths=e=>e.join("/").replace(/\/\/+/g,"/"),normalizePathname=e=>e.replace(/\/+$/,"").replace(/^\/*/,"/"),normalizeSearch=e=>!e||e==="?"?"":e.startsWith("?")?e:"?"+e,normalizeHash=e=>!e||e==="#"?"":e.startsWith("#")?e:"#"+e;function isRouteErrorResponse(e){return e!=null&&typeof e.status=="number"&&typeof e.statusText=="string"&&typeof e.internal=="boolean"&&"data"in e}const validMutationMethodsArr=["post","put","patch","delete"];new Set(validMutationMethodsArr);const validRequestMethodsArr=["get",...validMutationMethodsArr];new Set(validRequestMethodsArr);/**
 * React Router v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function _extends$2(){return _extends$2=Object.assign?Object.assign.bind():function(e){for(var o=1;o<arguments.length;o++){var a=arguments[o];for(var s in a)Object.prototype.hasOwnProperty.call(a,s)&&(e[s]=a[s])}return e},_extends$2.apply(this,arguments)}const DataRouterContext=reactExports.createContext(null),DataRouterStateContext=reactExports.createContext(null),NavigationContext=reactExports.createContext(null),LocationContext=reactExports.createContext(null),RouteContext=reactExports.createContext({outlet:null,matches:[],isDataRoute:!1}),RouteErrorContext=reactExports.createContext(null);function useHref(e,o){let{relative:a}=o===void 0?{}:o;useInRouterContext()||invariant$1(!1);let{basename:s,navigator:c}=reactExports.useContext(NavigationContext),{hash:h,pathname:d,search:g}=useResolvedPath(e,{relative:a}),b=d;return s!=="/"&&(b=d==="/"?s:joinPaths([s,d])),c.createHref({pathname:b,search:g,hash:h})}function useInRouterContext(){return reactExports.useContext(LocationContext)!=null}function useLocation(){return useInRouterContext()||invariant$1(!1),reactExports.useContext(LocationContext).location}function useIsomorphicLayoutEffect$1(e){reactExports.useContext(NavigationContext).static||reactExports.useLayoutEffect(e)}function useNavigate(){let{isDataRoute:e}=reactExports.useContext(RouteContext);return e?useNavigateStable():useNavigateUnstable()}function useNavigateUnstable(){useInRouterContext()||invariant$1(!1);let e=reactExports.useContext(DataRouterContext),{basename:o,future:a,navigator:s}=reactExports.useContext(NavigationContext),{matches:c}=reactExports.useContext(RouteContext),{pathname:h}=useLocation(),d=JSON.stringify(getResolveToMatches(c,a.v7_relativeSplatPath)),g=reactExports.useRef(!1);return useIsomorphicLayoutEffect$1(()=>{g.current=!0}),reactExports.useCallback(function(j,_){if(_===void 0&&(_={}),!g.current)return;if(typeof j=="number"){s.go(j);return}let _e=resolveTo(j,JSON.parse(d),h,_.relative==="path");e==null&&o!=="/"&&(_e.pathname=_e.pathname==="/"?o:joinPaths([o,_e.pathname])),(_.replace?s.replace:s.push)(_e,_.state,_)},[o,s,d,h,e])}function useParams(){let{matches:e}=reactExports.useContext(RouteContext),o=e[e.length-1];return o?o.params:{}}function useResolvedPath(e,o){let{relative:a}=o===void 0?{}:o,{future:s}=reactExports.useContext(NavigationContext),{matches:c}=reactExports.useContext(RouteContext),{pathname:h}=useLocation(),d=JSON.stringify(getResolveToMatches(c,s.v7_relativeSplatPath));return reactExports.useMemo(()=>resolveTo(e,JSON.parse(d),h,a==="path"),[e,d,h,a])}function useRoutes(e,o){return useRoutesImpl(e,o)}function useRoutesImpl(e,o,a,s){useInRouterContext()||invariant$1(!1);let{navigator:c}=reactExports.useContext(NavigationContext),{matches:h}=reactExports.useContext(RouteContext),d=h[h.length-1],g=d?d.params:{};d&&d.pathname;let b=d?d.pathnameBase:"/";d&&d.route;let j=useLocation(),_;if(o){var _e;let ct=typeof o=="string"?parsePath(o):o;b==="/"||(_e=ct.pathname)!=null&&_e.startsWith(b)||invariant$1(!1),_=ct}else _=j;let tt=_.pathname||"/",it=tt;if(b!=="/"){let ct=b.replace(/^\//,"").split("/");it="/"+tt.replace(/^\//,"").split("/").slice(ct.length).join("/")}let st=matchRoutes(e,{pathname:it}),ut=_renderMatches(st&&st.map(ct=>Object.assign({},ct,{params:Object.assign({},g,ct.params),pathname:joinPaths([b,c.encodeLocation?c.encodeLocation(ct.pathname).pathname:ct.pathname]),pathnameBase:ct.pathnameBase==="/"?b:joinPaths([b,c.encodeLocation?c.encodeLocation(ct.pathnameBase).pathname:ct.pathnameBase])})),h,a,s);return o&&ut?reactExports.createElement(LocationContext.Provider,{value:{location:_extends$2({pathname:"/",search:"",hash:"",state:null,key:"default"},_),navigationType:Action.Pop}},ut):ut}function DefaultErrorComponent(){let e=useRouteError(),o=isRouteErrorResponse(e)?e.status+" "+e.statusText:e instanceof Error?e.message:JSON.stringify(e),a=e instanceof Error?e.stack:null,c={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"};return reactExports.createElement(reactExports.Fragment,null,reactExports.createElement("h2",null,"Unexpected Application Error!"),reactExports.createElement("h3",{style:{fontStyle:"italic"}},o),a?reactExports.createElement("pre",{style:c},a):null,null)}const defaultErrorElement=reactExports.createElement(DefaultErrorComponent,null);class RenderErrorBoundary extends reactExports.Component{constructor(o){super(o),this.state={location:o.location,revalidation:o.revalidation,error:o.error}}static getDerivedStateFromError(o){return{error:o}}static getDerivedStateFromProps(o,a){return a.location!==o.location||a.revalidation!=="idle"&&o.revalidation==="idle"?{error:o.error,location:o.location,revalidation:o.revalidation}:{error:o.error!==void 0?o.error:a.error,location:a.location,revalidation:o.revalidation||a.revalidation}}componentDidCatch(o,a){console.error("React Router caught the following error during render",o,a)}render(){return this.state.error!==void 0?reactExports.createElement(RouteContext.Provider,{value:this.props.routeContext},reactExports.createElement(RouteErrorContext.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function RenderedRoute(e){let{routeContext:o,match:a,children:s}=e,c=reactExports.useContext(DataRouterContext);return c&&c.static&&c.staticContext&&(a.route.errorElement||a.route.ErrorBoundary)&&(c.staticContext._deepestRenderedBoundaryId=a.route.id),reactExports.createElement(RouteContext.Provider,{value:o},s)}function _renderMatches(e,o,a,s){var c;if(o===void 0&&(o=[]),a===void 0&&(a=null),s===void 0&&(s=null),e==null){var h;if(!a)return null;if(a.errors)e=a.matches;else if((h=s)!=null&&h.v7_partialHydration&&o.length===0&&!a.initialized&&a.matches.length>0)e=a.matches;else return null}let d=e,g=(c=a)==null?void 0:c.errors;if(g!=null){let _=d.findIndex(_e=>_e.route.id&&(g==null?void 0:g[_e.route.id])!==void 0);_>=0||invariant$1(!1),d=d.slice(0,Math.min(d.length,_+1))}let b=!1,j=-1;if(a&&s&&s.v7_partialHydration)for(let _=0;_<d.length;_++){let _e=d[_];if((_e.route.HydrateFallback||_e.route.hydrateFallbackElement)&&(j=_),_e.route.id){let{loaderData:tt,errors:it}=a,st=_e.route.loader&&tt[_e.route.id]===void 0&&(!it||it[_e.route.id]===void 0);if(_e.route.lazy||st){b=!0,j>=0?d=d.slice(0,j+1):d=[d[0]];break}}}return d.reduceRight((_,_e,tt)=>{let it,st=!1,ut=null,ct=null;a&&(it=g&&_e.route.id?g[_e.route.id]:void 0,ut=_e.route.errorElement||defaultErrorElement,b&&(j<0&&tt===0?(st=!0,ct=null):j===tt&&(st=!0,ct=_e.route.hydrateFallbackElement||null)));let rt=o.concat(d.slice(0,tt+1)),ot=()=>{let lt;return it?lt=ut:st?lt=ct:_e.route.Component?lt=reactExports.createElement(_e.route.Component,null):_e.route.element?lt=_e.route.element:lt=_,reactExports.createElement(RenderedRoute,{match:_e,routeContext:{outlet:_,matches:rt,isDataRoute:a!=null},children:lt})};return a&&(_e.route.ErrorBoundary||_e.route.errorElement||tt===0)?reactExports.createElement(RenderErrorBoundary,{location:a.location,revalidation:a.revalidation,component:ut,error:it,children:ot(),routeContext:{outlet:null,matches:rt,isDataRoute:!0}}):ot()},null)}var DataRouterHook$1=function(e){return e.UseBlocker="useBlocker",e.UseRevalidator="useRevalidator",e.UseNavigateStable="useNavigate",e}(DataRouterHook$1||{}),DataRouterStateHook$1=function(e){return e.UseBlocker="useBlocker",e.UseLoaderData="useLoaderData",e.UseActionData="useActionData",e.UseRouteError="useRouteError",e.UseNavigation="useNavigation",e.UseRouteLoaderData="useRouteLoaderData",e.UseMatches="useMatches",e.UseRevalidator="useRevalidator",e.UseNavigateStable="useNavigate",e.UseRouteId="useRouteId",e}(DataRouterStateHook$1||{});function useDataRouterContext(e){let o=reactExports.useContext(DataRouterContext);return o||invariant$1(!1),o}function useDataRouterState(e){let o=reactExports.useContext(DataRouterStateContext);return o||invariant$1(!1),o}function useRouteContext(e){let o=reactExports.useContext(RouteContext);return o||invariant$1(!1),o}function useCurrentRouteId(e){let o=useRouteContext(),a=o.matches[o.matches.length-1];return a.route.id||invariant$1(!1),a.route.id}function useRouteError(){var e;let o=reactExports.useContext(RouteErrorContext),a=useDataRouterState(DataRouterStateHook$1.UseRouteError),s=useCurrentRouteId(DataRouterStateHook$1.UseRouteError);return o!==void 0?o:(e=a.errors)==null?void 0:e[s]}function useNavigateStable(){let{router:e}=useDataRouterContext(DataRouterHook$1.UseNavigateStable),o=useCurrentRouteId(DataRouterStateHook$1.UseNavigateStable),a=reactExports.useRef(!1);return useIsomorphicLayoutEffect$1(()=>{a.current=!0}),reactExports.useCallback(function(c,h){h===void 0&&(h={}),a.current&&(typeof c=="number"?e.navigate(c):e.navigate(c,_extends$2({fromRouteId:o},h)))},[e,o])}function logV6DeprecationWarnings(e,o){e==null||e.v7_startTransition,e==null||e.v7_relativeSplatPath}function Route(e){invariant$1(!1)}function Router(e){let{basename:o="/",children:a=null,location:s,navigationType:c=Action.Pop,navigator:h,static:d=!1,future:g}=e;useInRouterContext()&&invariant$1(!1);let b=o.replace(/^\/*/,"/"),j=reactExports.useMemo(()=>({basename:b,navigator:h,static:d,future:_extends$2({v7_relativeSplatPath:!1},g)}),[b,g,h,d]);typeof s=="string"&&(s=parsePath(s));let{pathname:_="/",search:_e="",hash:tt="",state:it=null,key:st="default"}=s,ut=reactExports.useMemo(()=>{let ct=stripBasename(_,b);return ct==null?null:{location:{pathname:ct,search:_e,hash:tt,state:it,key:st},navigationType:c}},[b,_,_e,tt,it,st,c]);return ut==null?null:reactExports.createElement(NavigationContext.Provider,{value:j},reactExports.createElement(LocationContext.Provider,{children:a,value:ut}))}function Routes(e){let{children:o,location:a}=e;return useRoutes(createRoutesFromChildren(o),a)}new Promise(()=>{});function createRoutesFromChildren(e,o){o===void 0&&(o=[]);let a=[];return reactExports.Children.forEach(e,(s,c)=>{if(!reactExports.isValidElement(s))return;let h=[...o,c];if(s.type===reactExports.Fragment){a.push.apply(a,createRoutesFromChildren(s.props.children,h));return}s.type!==Route&&invariant$1(!1),!s.props.index||!s.props.children||invariant$1(!1);let d={id:s.props.id||h.join("-"),caseSensitive:s.props.caseSensitive,element:s.props.element,Component:s.props.Component,index:s.props.index,path:s.props.path,loader:s.props.loader,action:s.props.action,errorElement:s.props.errorElement,ErrorBoundary:s.props.ErrorBoundary,hasErrorBoundary:s.props.ErrorBoundary!=null||s.props.errorElement!=null,shouldRevalidate:s.props.shouldRevalidate,handle:s.props.handle,lazy:s.props.lazy};s.props.children&&(d.children=createRoutesFromChildren(s.props.children,h)),a.push(d)}),a}/**
 * React Router DOM v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function _extends$1(){return _extends$1=Object.assign?Object.assign.bind():function(e){for(var o=1;o<arguments.length;o++){var a=arguments[o];for(var s in a)Object.prototype.hasOwnProperty.call(a,s)&&(e[s]=a[s])}return e},_extends$1.apply(this,arguments)}function _objectWithoutPropertiesLoose$1(e,o){if(e==null)return{};var a={},s=Object.keys(e),c,h;for(h=0;h<s.length;h++)c=s[h],!(o.indexOf(c)>=0)&&(a[c]=e[c]);return a}function isModifiedEvent(e){return!!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)}function shouldProcessLinkClick(e,o){return e.button===0&&(!o||o==="_self")&&!isModifiedEvent(e)}function createSearchParams(e){return e===void 0&&(e=""),new URLSearchParams(typeof e=="string"||Array.isArray(e)||e instanceof URLSearchParams?e:Object.keys(e).reduce((o,a)=>{let s=e[a];return o.concat(Array.isArray(s)?s.map(c=>[a,c]):[[a,s]])},[]))}function getSearchParamsForLocation(e,o){let a=createSearchParams(e);return o&&o.forEach((s,c)=>{a.has(c)||o.getAll(c).forEach(h=>{a.append(c,h)})}),a}const _excluded=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],REACT_ROUTER_VERSION="6";try{window.__reactRouterVersion=REACT_ROUTER_VERSION}catch{}const START_TRANSITION="startTransition",startTransitionImpl=React$1[START_TRANSITION];function BrowserRouter(e){let{basename:o,children:a,future:s,window:c}=e,h=reactExports.useRef();h.current==null&&(h.current=createBrowserHistory({window:c,v5Compat:!0}));let d=h.current,[g,b]=reactExports.useState({action:d.action,location:d.location}),{v7_startTransition:j}=s||{},_=reactExports.useCallback(_e=>{j&&startTransitionImpl?startTransitionImpl(()=>b(_e)):b(_e)},[b,j]);return reactExports.useLayoutEffect(()=>d.listen(_),[d,_]),reactExports.useEffect(()=>logV6DeprecationWarnings(s),[s]),reactExports.createElement(Router,{basename:o,children:a,location:g.location,navigationType:g.action,navigator:d,future:s})}const isBrowser$1=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",ABSOLUTE_URL_REGEX=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Link=reactExports.forwardRef(function(o,a){let{onClick:s,relative:c,reloadDocument:h,replace:d,state:g,target:b,to:j,preventScrollReset:_,viewTransition:_e}=o,tt=_objectWithoutPropertiesLoose$1(o,_excluded),{basename:it}=reactExports.useContext(NavigationContext),st,ut=!1;if(typeof j=="string"&&ABSOLUTE_URL_REGEX.test(j)&&(st=j,isBrowser$1))try{let lt=new URL(window.location.href),dt=j.startsWith("//")?new URL(lt.protocol+j):new URL(j),pt=stripBasename(dt.pathname,it);dt.origin===lt.origin&&pt!=null?j=pt+dt.search+dt.hash:ut=!0}catch{}let ct=useHref(j,{relative:c}),rt=useLinkClickHandler(j,{replace:d,state:g,target:b,preventScrollReset:_,relative:c,viewTransition:_e});function ot(lt){s&&s(lt),lt.defaultPrevented||rt(lt)}return reactExports.createElement("a",_extends$1({},tt,{href:st||ct,onClick:ut||h?s:ot,ref:a,target:b}))});var DataRouterHook;(function(e){e.UseScrollRestoration="useScrollRestoration",e.UseSubmit="useSubmit",e.UseSubmitFetcher="useSubmitFetcher",e.UseFetcher="useFetcher",e.useViewTransitionState="useViewTransitionState"})(DataRouterHook||(DataRouterHook={}));var DataRouterStateHook;(function(e){e.UseFetcher="useFetcher",e.UseFetchers="useFetchers",e.UseScrollRestoration="useScrollRestoration"})(DataRouterStateHook||(DataRouterStateHook={}));function useLinkClickHandler(e,o){let{target:a,replace:s,state:c,preventScrollReset:h,relative:d,viewTransition:g}=o===void 0?{}:o,b=useNavigate(),j=useLocation(),_=useResolvedPath(e,{relative:d});return reactExports.useCallback(_e=>{if(shouldProcessLinkClick(_e,a)){_e.preventDefault();let tt=s!==void 0?s:createPath(j)===createPath(_);b(e,{replace:tt,state:c,preventScrollReset:h,relative:d,viewTransition:g})}},[j,b,_,s,c,a,e,h,d,g])}function useSearchParams(e){let o=reactExports.useRef(createSearchParams(e)),a=reactExports.useRef(!1),s=useLocation(),c=reactExports.useMemo(()=>getSearchParamsForLocation(s.search,a.current?null:o.current),[s.search]),h=useNavigate(),d=reactExports.useCallback((g,b)=>{const j=createSearchParams(typeof g=="function"?g(c):g);a.current=!0,h("?"+j,b)},[h,c]);return[c,d]}const ThemeContext=reactExports.createContext(void 0),ThemeProvider=({children:e})=>{const o=()=>{if(typeof window<"u"){const h=localStorage.getItem("theme");if(h)return h;if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)return"dark"}return"light"},[a,s]=reactExports.useState(o);reactExports.useEffect(()=>{localStorage.setItem("theme",a),a==="dark"?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")},[a]);const c=()=>{s(h=>h==="light"?"dark":"light")};return jsxRuntimeExports.jsx(ThemeContext.Provider,{value:{theme:a,toggleTheme:c},children:e})},useTheme=()=>{const e=reactExports.useContext(ThemeContext);if(e===void 0)throw new Error("useTheme must be used within a ThemeProvider");return e},ScrollToTop=()=>{const{pathname:e}=useLocation();return reactExports.useEffect(()=>{window.scrollTo(0,0)},[e]),null};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var defaultAttributes={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const toKebabCase=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),createLucideIcon=(e,o)=>{const a=reactExports.forwardRef(({color:s="currentColor",size:c=24,strokeWidth:h=2,absoluteStrokeWidth:d,className:g="",children:b,...j},_)=>reactExports.createElement("svg",{ref:_,...defaultAttributes,width:c,height:c,stroke:s,strokeWidth:d?Number(h)*24/Number(c):h,className:["lucide",`lucide-${toKebabCase(e)}`,g].join(" "),...j},[...o.map(([_e,tt])=>reactExports.createElement(_e,tt)),...Array.isArray(b)?b:[b]]));return a.displayName=`${e}`,a};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ArrowLeft=createLucideIcon("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ArrowRight=createLucideIcon("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bot=createLucideIcon("Bot",[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Calendar=createLucideIcon("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ChevronLeft=createLucideIcon("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ChevronRight=createLucideIcon("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Clock=createLucideIcon("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Facebook=createLucideIcon("Facebook",[["path",{d:"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",key:"1jg4f8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Github=createLucideIcon("Github",[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",key:"tonef"}],["path",{d:"M9 18c-4.51 2-5-2-7-2",key:"9comsn"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Instagram=createLucideIcon("Instagram",[["rect",{width:"20",height:"20",x:"2",y:"2",rx:"5",ry:"5",key:"2e1cvw"}],["path",{d:"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",key:"9exkf1"}],["line",{x1:"17.5",x2:"17.51",y1:"6.5",y2:"6.5",key:"r4j83e"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Languages=createLucideIcon("Languages",[["path",{d:"m5 8 6 6",key:"1wu5hv"}],["path",{d:"m4 14 6-6 2-3",key:"1k1g8d"}],["path",{d:"M2 5h12",key:"or177f"}],["path",{d:"M7 2h1",key:"1t2jsx"}],["path",{d:"m22 22-5-10-5 10",key:"don7ne"}],["path",{d:"M14 18h6",key:"1m8k6r"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Link2=createLucideIcon("Link2",[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Linkedin=createLucideIcon("Linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mail=createLucideIcon("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Maximize2=createLucideIcon("Maximize2",[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Menu=createLucideIcon("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Moon=createLucideIcon("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Send=createLucideIcon("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Shuffle=createLucideIcon("Shuffle",[["path",{d:"M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22",key:"1wmou1"}],["path",{d:"m18 2 4 4-4 4",key:"pucp1d"}],["path",{d:"M2 6h1.9c1.5 0 2.9.9 3.6 2.2",key:"10bdb2"}],["path",{d:"M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8",key:"vgxac0"}],["path",{d:"m18 14 4 4-4 4",key:"10pe0f"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sparkles=createLucideIcon("Sparkles",[["path",{d:"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",key:"17u4zn"}],["path",{d:"M5 3v4",key:"bklmnn"}],["path",{d:"M19 17v4",key:"iiml17"}],["path",{d:"M3 5h4",key:"nem4j1"}],["path",{d:"M17 19h4",key:"lbex7p"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sun=createLucideIcon("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Twitter=createLucideIcon("Twitter",[["path",{d:"M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",key:"pff0z6"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const User=createLucideIcon("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=createLucideIcon("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),Navbar=()=>{const[e,o]=reactExports.useState(!1),[a,s]=reactExports.useState(!1),{theme:c,toggleTheme:h}=useTheme(),d=useLocation(),g=b=>d.pathname===b;return reactExports.useEffect(()=>{const b=()=>{const j=window.scrollY;s(j>20)};return window.addEventListener("scroll",b),()=>{window.removeEventListener("scroll",b)}},[]),reactExports.useEffect(()=>{o(!1)},[d]),jsxRuntimeExports.jsxs("nav",{className:`fixed w-full z-50 transition-all duration-300 ${a?"bg-white/95 dark:bg-dark/95 backdrop-blur-sm shadow-sm py-3":"bg-transparent py-5"}`,children:[jsxRuntimeExports.jsxs("div",{className:"container-custom flex justify-between items-center",children:[jsxRuntimeExports.jsx(Link,{to:"/",className:"flex items-center no-underline hover:no-underline",children:jsxRuntimeExports.jsx("img",{src:"/favicon.png",alt:"Fred Yang",className:"h-10 w-10 md:h-12 md:w-12 object-contain"})}),jsxRuntimeExports.jsxs("div",{className:"hidden md:flex items-center space-x-8",children:[jsxRuntimeExports.jsx(Link,{to:"/",className:`no-underline text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:no-underline transition-colors ${g("/")?"text-primary-600 dark:text-primary-300 font-medium":""}`,children:"Home"}),jsxRuntimeExports.jsx(Link,{to:"/gallery",className:`no-underline text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:no-underline transition-colors ${g("/gallery")?"text-primary-600 dark:text-primary-300 font-medium":""}`,children:"Gallery"}),jsxRuntimeExports.jsx(Link,{to:"/blog",className:`no-underline text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:no-underline transition-colors ${g("/blog")?"text-primary-600 dark:text-primary-300 font-medium":""}`,children:"Blog"}),jsxRuntimeExports.jsx("button",{onClick:h,className:"text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors","aria-label":"Toggle theme",children:c==="dark"?jsxRuntimeExports.jsx(Sun,{size:20}):jsxRuntimeExports.jsx(Moon,{size:20})})]}),jsxRuntimeExports.jsxs("div",{className:"flex items-center md:hidden space-x-4",children:[jsxRuntimeExports.jsx("button",{onClick:h,className:"text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors","aria-label":"Toggle theme",children:c==="dark"?jsxRuntimeExports.jsx(Sun,{size:20}):jsxRuntimeExports.jsx(Moon,{size:20})}),jsxRuntimeExports.jsx("button",{onClick:()=>o(!e),className:"text-slate-700 dark:text-slate-300 p-2","aria-label":"Toggle menu",children:e?jsxRuntimeExports.jsx(X,{size:24}):jsxRuntimeExports.jsx(Menu,{size:24})})]})]}),e&&jsxRuntimeExports.jsxs("div",{className:"md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-800 shadow-lg py-4 px-4 flex flex-col space-y-4 animate-fade-in",children:[jsxRuntimeExports.jsx(Link,{to:"/",className:`py-2 px-4 rounded-md no-underline hover:no-underline ${g("/")?"text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 font-medium":"text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`,children:"Home"}),jsxRuntimeExports.jsx(Link,{to:"/gallery",className:`py-2 px-4 rounded-md no-underline hover:no-underline ${g("/gallery")?"text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 font-medium":"text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`,children:"Gallery"}),jsxRuntimeExports.jsx(Link,{to:"/blog",className:`py-2 px-4 rounded-md no-underline hover:no-underline ${g("/blog")?"text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 font-medium":"text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`,children:"Blog"})]})]})},LayoutGroupContext=reactExports.createContext({});function useConstant(e){const o=reactExports.useRef(null);return o.current===null&&(o.current=e()),o.current}const PresenceContext=reactExports.createContext(null),MotionConfigContext=reactExports.createContext({transformPagePoint:e=>e,isStatic:!1,reducedMotion:"never"});class PopChildMeasure extends reactExports.Component{getSnapshotBeforeUpdate(o){const a=this.props.childRef.current;if(a&&o.isPresent&&!this.props.isPresent){const s=this.props.sizeRef.current;s.height=a.offsetHeight||0,s.width=a.offsetWidth||0,s.top=a.offsetTop,s.left=a.offsetLeft}return null}componentDidUpdate(){}render(){return this.props.children}}function PopChild({children:e,isPresent:o}){const a=reactExports.useId(),s=reactExports.useRef(null),c=reactExports.useRef({width:0,height:0,top:0,left:0}),{nonce:h}=reactExports.useContext(MotionConfigContext);return reactExports.useInsertionEffect(()=>{const{width:d,height:g,top:b,left:j}=c.current;if(o||!s.current||!d||!g)return;s.current.dataset.motionPopId=a;const _=document.createElement("style");return h&&(_.nonce=h),document.head.appendChild(_),_.sheet&&_.sheet.insertRule(`
          [data-motion-pop-id="${a}"] {
            position: absolute !important;
            width: ${d}px !important;
            height: ${g}px !important;
            top: ${b}px !important;
            left: ${j}px !important;
          }
        `),()=>{document.head.removeChild(_)}},[o]),jsxRuntimeExports.jsx(PopChildMeasure,{isPresent:o,childRef:s,sizeRef:c,children:reactExports.cloneElement(e,{ref:s})})}const PresenceChild=({children:e,initial:o,isPresent:a,onExitComplete:s,custom:c,presenceAffectsLayout:h,mode:d})=>{const g=useConstant(newChildrenMap),b=reactExports.useId(),j=reactExports.useCallback(_e=>{g.set(_e,!0);for(const tt of g.values())if(!tt)return;s&&s()},[g,s]),_=reactExports.useMemo(()=>({id:b,initial:o,isPresent:a,custom:c,onExitComplete:j,register:_e=>(g.set(_e,!1),()=>g.delete(_e))}),h?[Math.random(),j]:[a,j]);return reactExports.useMemo(()=>{g.forEach((_e,tt)=>g.set(tt,!1))},[a]),reactExports.useEffect(()=>{!a&&!g.size&&s&&s()},[a]),d==="popLayout"&&(e=jsxRuntimeExports.jsx(PopChild,{isPresent:a,children:e})),jsxRuntimeExports.jsx(PresenceContext.Provider,{value:_,children:e})};function newChildrenMap(){return new Map}function usePresence(e=!0){const o=reactExports.useContext(PresenceContext);if(o===null)return[!0,null];const{isPresent:a,onExitComplete:s,register:c}=o,h=reactExports.useId();reactExports.useEffect(()=>{e&&c(h)},[e]);const d=reactExports.useCallback(()=>e&&s&&s(h),[h,s,e]);return!a&&s?[!1,d]:[!0]}const getChildKey=e=>e.key||"";function onlyElements(e){const o=[];return reactExports.Children.forEach(e,a=>{reactExports.isValidElement(a)&&o.push(a)}),o}const isBrowser=typeof window<"u",useIsomorphicLayoutEffect=isBrowser?reactExports.useLayoutEffect:reactExports.useEffect,AnimatePresence=({children:e,custom:o,initial:a=!0,onExitComplete:s,presenceAffectsLayout:c=!0,mode:h="sync",propagate:d=!1})=>{const[g,b]=usePresence(d),j=reactExports.useMemo(()=>onlyElements(e),[e]),_=d&&!g?[]:j.map(getChildKey),_e=reactExports.useRef(!0),tt=reactExports.useRef(j),it=useConstant(()=>new Map),[st,ut]=reactExports.useState(j),[ct,rt]=reactExports.useState(j);useIsomorphicLayoutEffect(()=>{_e.current=!1,tt.current=j;for(let dt=0;dt<ct.length;dt++){const pt=getChildKey(ct[dt]);_.includes(pt)?it.delete(pt):it.get(pt)!==!0&&it.set(pt,!1)}},[ct,_.length,_.join("-")]);const ot=[];if(j!==st){let dt=[...j];for(let pt=0;pt<ct.length;pt++){const gt=ct[pt],wt=getChildKey(gt);_.includes(wt)||(dt.splice(pt,0,gt),ot.push(gt))}h==="wait"&&ot.length&&(dt=ot),rt(onlyElements(dt)),ut(j);return}const{forceRender:lt}=reactExports.useContext(LayoutGroupContext);return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment,{children:ct.map(dt=>{const pt=getChildKey(dt),gt=d&&!g?!1:j===ct||_.includes(pt),wt=()=>{if(it.has(pt))it.set(pt,!0);else return;let yt=!0;it.forEach(St=>{St||(yt=!1)}),yt&&(lt==null||lt(),rt(tt.current),d&&(b==null||b()),s&&s())};return jsxRuntimeExports.jsx(PresenceChild,{isPresent:gt,initial:!_e.current||a?void 0:!1,custom:gt?void 0:o,presenceAffectsLayout:c,mode:h,onExitComplete:gt?void 0:wt,children:dt},pt)})})},noop=e=>e;let invariant=noop;function memo(e){let o;return()=>(o===void 0&&(o=e()),o)}const progress=(e,o,a)=>{const s=o-e;return s===0?1:(a-e)/s},secondsToMilliseconds=e=>e*1e3,millisecondsToSeconds=e=>e/1e3,MotionGlobalConfig={skipAnimations:!1,useManualTiming:!1};function createRenderStep(e){let o=new Set,a=new Set,s=!1,c=!1;const h=new WeakSet;let d={delta:0,timestamp:0,isProcessing:!1};function g(j){h.has(j)&&(b.schedule(j),e()),j(d)}const b={schedule:(j,_=!1,_e=!1)=>{const it=_e&&s?o:a;return _&&h.add(j),it.has(j)||it.add(j),j},cancel:j=>{a.delete(j),h.delete(j)},process:j=>{if(d=j,s){c=!0;return}s=!0,[o,a]=[a,o],o.forEach(g),o.clear(),s=!1,c&&(c=!1,b.process(j))}};return b}const stepsOrder=["read","resolveKeyframes","update","preRender","render","postRender"],maxElapsed=40;function createRenderBatcher(e,o){let a=!1,s=!0;const c={delta:0,timestamp:0,isProcessing:!1},h=()=>a=!0,d=stepsOrder.reduce((rt,ot)=>(rt[ot]=createRenderStep(h),rt),{}),{read:g,resolveKeyframes:b,update:j,preRender:_,render:_e,postRender:tt}=d,it=()=>{const rt=performance.now();a=!1,c.delta=s?1e3/60:Math.max(Math.min(rt-c.timestamp,maxElapsed),1),c.timestamp=rt,c.isProcessing=!0,g.process(c),b.process(c),j.process(c),_.process(c),_e.process(c),tt.process(c),c.isProcessing=!1,a&&o&&(s=!1,e(it))},st=()=>{a=!0,s=!0,c.isProcessing||e(it)};return{schedule:stepsOrder.reduce((rt,ot)=>{const lt=d[ot];return rt[ot]=(dt,pt=!1,gt=!1)=>(a||st(),lt.schedule(dt,pt,gt)),rt},{}),cancel:rt=>{for(let ot=0;ot<stepsOrder.length;ot++)d[stepsOrder[ot]].cancel(rt)},state:c,steps:d}}const{schedule:frame,cancel:cancelFrame,state:frameData,steps:frameSteps}=createRenderBatcher(typeof requestAnimationFrame<"u"?requestAnimationFrame:noop,!0),LazyContext=reactExports.createContext({strict:!1}),featureProps={animation:["animate","variants","whileHover","whileTap","exit","whileInView","whileFocus","whileDrag"],exit:["exit"],drag:["drag","dragControls"],focus:["whileFocus"],hover:["whileHover","onHoverStart","onHoverEnd"],tap:["whileTap","onTap","onTapStart","onTapCancel"],pan:["onPan","onPanStart","onPanSessionStart","onPanEnd"],inView:["whileInView","onViewportEnter","onViewportLeave"],layout:["layout","layoutId"]},featureDefinitions={};for(const e in featureProps)featureDefinitions[e]={isEnabled:o=>featureProps[e].some(a=>!!o[a])};function loadFeatures(e){for(const o in e)featureDefinitions[o]={...featureDefinitions[o],...e[o]}}const validMotionProps=new Set(["animate","exit","variants","initial","style","values","variants","transition","transformTemplate","custom","inherit","onBeforeLayoutMeasure","onAnimationStart","onAnimationComplete","onUpdate","onDragStart","onDrag","onDragEnd","onMeasureDragConstraints","onDirectionLock","onDragTransitionEnd","_dragX","_dragY","onHoverStart","onHoverEnd","onViewportEnter","onViewportLeave","globalTapTarget","ignoreStrict","viewport"]);function isValidMotionProp(e){return e.startsWith("while")||e.startsWith("drag")&&e!=="draggable"||e.startsWith("layout")||e.startsWith("onTap")||e.startsWith("onPan")||e.startsWith("onLayout")||validMotionProps.has(e)}let shouldForward=e=>!isValidMotionProp(e);function loadExternalIsValidProp(e){e&&(shouldForward=o=>o.startsWith("on")?!isValidMotionProp(o):e(o))}try{loadExternalIsValidProp(require("@emotion/is-prop-valid").default)}catch{}function filterProps(e,o,a){const s={};for(const c in e)c==="values"&&typeof e.values=="object"||(shouldForward(c)||a===!0&&isValidMotionProp(c)||!o&&!isValidMotionProp(c)||e.draggable&&c.startsWith("onDrag"))&&(s[c]=e[c]);return s}function createDOMMotionComponentProxy(e){if(typeof Proxy>"u")return e;const o=new Map,a=(...s)=>e(...s);return new Proxy(a,{get:(s,c)=>c==="create"?e:(o.has(c)||o.set(c,e(c)),o.get(c))})}const MotionContext=reactExports.createContext({});function isVariantLabel(e){return typeof e=="string"||Array.isArray(e)}function isAnimationControls(e){return e!==null&&typeof e=="object"&&typeof e.start=="function"}const variantPriorityOrder=["animate","whileInView","whileFocus","whileHover","whileTap","whileDrag","exit"],variantProps=["initial",...variantPriorityOrder];function isControllingVariants(e){return isAnimationControls(e.animate)||variantProps.some(o=>isVariantLabel(e[o]))}function isVariantNode(e){return!!(isControllingVariants(e)||e.variants)}function getCurrentTreeVariants(e,o){if(isControllingVariants(e)){const{initial:a,animate:s}=e;return{initial:a===!1||isVariantLabel(a)?a:void 0,animate:isVariantLabel(s)?s:void 0}}return e.inherit!==!1?o:{}}function useCreateMotionContext(e){const{initial:o,animate:a}=getCurrentTreeVariants(e,reactExports.useContext(MotionContext));return reactExports.useMemo(()=>({initial:o,animate:a}),[variantLabelsAsDependency(o),variantLabelsAsDependency(a)])}function variantLabelsAsDependency(e){return Array.isArray(e)?e.join(" "):e}const motionComponentSymbol=Symbol.for("motionComponentSymbol");function isRefObject(e){return e&&typeof e=="object"&&Object.prototype.hasOwnProperty.call(e,"current")}function useMotionRef(e,o,a){return reactExports.useCallback(s=>{s&&e.onMount&&e.onMount(s),o&&(s?o.mount(s):o.unmount()),a&&(typeof a=="function"?a(s):isRefObject(a)&&(a.current=s))},[o])}const camelToDash=e=>e.replace(/([a-z])([A-Z])/gu,"$1-$2").toLowerCase(),optimizedAppearDataId="framerAppearId",optimizedAppearDataAttribute="data-"+camelToDash(optimizedAppearDataId),{schedule:microtask,cancel:cancelMicrotask}=createRenderBatcher(queueMicrotask,!1),SwitchLayoutGroupContext=reactExports.createContext({});function useVisualElement(e,o,a,s,c){var h,d;const{visualElement:g}=reactExports.useContext(MotionContext),b=reactExports.useContext(LazyContext),j=reactExports.useContext(PresenceContext),_=reactExports.useContext(MotionConfigContext).reducedMotion,_e=reactExports.useRef(null);s=s||b.renderer,!_e.current&&s&&(_e.current=s(e,{visualState:o,parent:g,props:a,presenceContext:j,blockInitialAnimation:j?j.initial===!1:!1,reducedMotionConfig:_}));const tt=_e.current,it=reactExports.useContext(SwitchLayoutGroupContext);tt&&!tt.projection&&c&&(tt.type==="html"||tt.type==="svg")&&createProjectionNode$1(_e.current,a,c,it);const st=reactExports.useRef(!1);reactExports.useInsertionEffect(()=>{tt&&st.current&&tt.update(a,j)});const ut=a[optimizedAppearDataAttribute],ct=reactExports.useRef(!!ut&&!(!((h=window.MotionHandoffIsComplete)===null||h===void 0)&&h.call(window,ut))&&((d=window.MotionHasOptimisedAnimation)===null||d===void 0?void 0:d.call(window,ut)));return useIsomorphicLayoutEffect(()=>{tt&&(st.current=!0,window.MotionIsMounted=!0,tt.updateFeatures(),microtask.render(tt.render),ct.current&&tt.animationState&&tt.animationState.animateChanges())}),reactExports.useEffect(()=>{tt&&(!ct.current&&tt.animationState&&tt.animationState.animateChanges(),ct.current&&(queueMicrotask(()=>{var rt;(rt=window.MotionHandoffMarkAsComplete)===null||rt===void 0||rt.call(window,ut)}),ct.current=!1))}),tt}function createProjectionNode$1(e,o,a,s){const{layoutId:c,layout:h,drag:d,dragConstraints:g,layoutScroll:b,layoutRoot:j}=o;e.projection=new a(e.latestValues,o["data-framer-portal-id"]?void 0:getClosestProjectingNode(e.parent)),e.projection.setOptions({layoutId:c,layout:h,alwaysMeasureLayout:!!d||g&&isRefObject(g),visualElement:e,animationType:typeof h=="string"?h:"both",initialPromotionConfig:s,layoutScroll:b,layoutRoot:j})}function getClosestProjectingNode(e){if(e)return e.options.allowProjection!==!1?e.projection:getClosestProjectingNode(e.parent)}function createRendererMotionComponent({preloadedFeatures:e,createVisualElement:o,useRender:a,useVisualState:s,Component:c}){var h,d;e&&loadFeatures(e);function g(j,_){let _e;const tt={...reactExports.useContext(MotionConfigContext),...j,layoutId:useLayoutId(j)},{isStatic:it}=tt,st=useCreateMotionContext(j),ut=s(j,it);if(!it&&isBrowser){useStrictMode();const ct=getProjectionFunctionality(tt);_e=ct.MeasureLayout,st.visualElement=useVisualElement(c,ut,tt,o,ct.ProjectionNode)}return jsxRuntimeExports.jsxs(MotionContext.Provider,{value:st,children:[_e&&st.visualElement?jsxRuntimeExports.jsx(_e,{visualElement:st.visualElement,...tt}):null,a(c,j,useMotionRef(ut,st.visualElement,_),ut,it,st.visualElement)]})}g.displayName=`motion.${typeof c=="string"?c:`create(${(d=(h=c.displayName)!==null&&h!==void 0?h:c.name)!==null&&d!==void 0?d:""})`}`;const b=reactExports.forwardRef(g);return b[motionComponentSymbol]=c,b}function useLayoutId({layoutId:e}){const o=reactExports.useContext(LayoutGroupContext).id;return o&&e!==void 0?o+"-"+e:e}function useStrictMode(e,o){reactExports.useContext(LazyContext).strict}function getProjectionFunctionality(e){const{drag:o,layout:a}=featureDefinitions;if(!o&&!a)return{};const s={...o,...a};return{MeasureLayout:o!=null&&o.isEnabled(e)||a!=null&&a.isEnabled(e)?s.MeasureLayout:void 0,ProjectionNode:s.ProjectionNode}}const lowercaseSVGElements=["animate","circle","defs","desc","ellipse","g","image","line","filter","marker","mask","metadata","path","pattern","polygon","polyline","rect","stop","switch","symbol","svg","text","tspan","use","view"];function isSVGComponent(e){return typeof e!="string"||e.includes("-")?!1:!!(lowercaseSVGElements.indexOf(e)>-1||/[A-Z]/u.test(e))}function getValueState(e){const o=[{},{}];return e==null||e.values.forEach((a,s)=>{o[0][s]=a.get(),o[1][s]=a.getVelocity()}),o}function resolveVariantFromProps(e,o,a,s){if(typeof o=="function"){const[c,h]=getValueState(s);o=o(a!==void 0?a:e.custom,c,h)}if(typeof o=="string"&&(o=e.variants&&e.variants[o]),typeof o=="function"){const[c,h]=getValueState(s);o=o(a!==void 0?a:e.custom,c,h)}return o}const isKeyframesTarget=e=>Array.isArray(e),isCustomValue=e=>!!(e&&typeof e=="object"&&e.mix&&e.toValue),resolveFinalValueInKeyframes=e=>isKeyframesTarget(e)?e[e.length-1]||0:e,isMotionValue=e=>!!(e&&e.getVelocity);function resolveMotionValue(e){const o=isMotionValue(e)?e.get():e;return isCustomValue(o)?o.toValue():o}function makeState({scrapeMotionValuesFromProps:e,createRenderState:o,onUpdate:a},s,c,h){const d={latestValues:makeLatestValues(s,c,h,e),renderState:o()};return a&&(d.onMount=g=>a({props:s,current:g,...d}),d.onUpdate=g=>a(g)),d}const makeUseVisualState=e=>(o,a)=>{const s=reactExports.useContext(MotionContext),c=reactExports.useContext(PresenceContext),h=()=>makeState(e,o,s,c);return a?h():useConstant(h)};function makeLatestValues(e,o,a,s){const c={},h=s(e,{});for(const tt in h)c[tt]=resolveMotionValue(h[tt]);let{initial:d,animate:g}=e;const b=isControllingVariants(e),j=isVariantNode(e);o&&j&&!b&&e.inherit!==!1&&(d===void 0&&(d=o.initial),g===void 0&&(g=o.animate));let _=a?a.initial===!1:!1;_=_||d===!1;const _e=_?g:d;if(_e&&typeof _e!="boolean"&&!isAnimationControls(_e)){const tt=Array.isArray(_e)?_e:[_e];for(let it=0;it<tt.length;it++){const st=resolveVariantFromProps(e,tt[it]);if(st){const{transitionEnd:ut,transition:ct,...rt}=st;for(const ot in rt){let lt=rt[ot];if(Array.isArray(lt)){const dt=_?lt.length-1:0;lt=lt[dt]}lt!==null&&(c[ot]=lt)}for(const ot in ut)c[ot]=ut[ot]}}}return c}const transformPropOrder=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY"],transformProps=new Set(transformPropOrder),checkStringStartsWith=e=>o=>typeof o=="string"&&o.startsWith(e),isCSSVariableName=checkStringStartsWith("--"),startsAsVariableToken=checkStringStartsWith("var(--"),isCSSVariableToken=e=>startsAsVariableToken(e)?singleCssVariableRegex.test(e.split("/*")[0].trim()):!1,singleCssVariableRegex=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu,getValueAsType=(e,o)=>o&&typeof e=="number"?o.transform(e):e,clamp=(e,o,a)=>a>o?o:a<e?e:a,number={test:e=>typeof e=="number",parse:parseFloat,transform:e=>e},alpha={...number,transform:e=>clamp(0,1,e)},scale={...number,default:1},createUnitType=e=>({test:o=>typeof o=="string"&&o.endsWith(e)&&o.split(" ").length===1,parse:parseFloat,transform:o=>`${o}${e}`}),degrees=createUnitType("deg"),percent=createUnitType("%"),px=createUnitType("px"),vh=createUnitType("vh"),vw=createUnitType("vw"),progressPercentage={...percent,parse:e=>percent.parse(e)/100,transform:e=>percent.transform(e*100)},browserNumberValueTypes={borderWidth:px,borderTopWidth:px,borderRightWidth:px,borderBottomWidth:px,borderLeftWidth:px,borderRadius:px,radius:px,borderTopLeftRadius:px,borderTopRightRadius:px,borderBottomRightRadius:px,borderBottomLeftRadius:px,width:px,maxWidth:px,height:px,maxHeight:px,top:px,right:px,bottom:px,left:px,padding:px,paddingTop:px,paddingRight:px,paddingBottom:px,paddingLeft:px,margin:px,marginTop:px,marginRight:px,marginBottom:px,marginLeft:px,backgroundPositionX:px,backgroundPositionY:px},transformValueTypes={rotate:degrees,rotateX:degrees,rotateY:degrees,rotateZ:degrees,scale,scaleX:scale,scaleY:scale,scaleZ:scale,skew:degrees,skewX:degrees,skewY:degrees,distance:px,translateX:px,translateY:px,translateZ:px,x:px,y:px,z:px,perspective:px,transformPerspective:px,opacity:alpha,originX:progressPercentage,originY:progressPercentage,originZ:px},int$1={...number,transform:Math.round},numberValueTypes={...browserNumberValueTypes,...transformValueTypes,zIndex:int$1,size:px,fillOpacity:alpha,strokeOpacity:alpha,numOctaves:int$1},translateAlias={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective"},numTransforms=transformPropOrder.length;function buildTransform(e,o,a){let s="",c=!0;for(let h=0;h<numTransforms;h++){const d=transformPropOrder[h],g=e[d];if(g===void 0)continue;let b=!0;if(typeof g=="number"?b=g===(d.startsWith("scale")?1:0):b=parseFloat(g)===0,!b||a){const j=getValueAsType(g,numberValueTypes[d]);if(!b){c=!1;const _=translateAlias[d]||d;s+=`${_}(${j}) `}a&&(o[d]=j)}}return s=s.trim(),a?s=a(o,c?"":s):c&&(s="none"),s}function buildHTMLStyles(e,o,a){const{style:s,vars:c,transformOrigin:h}=e;let d=!1,g=!1;for(const b in o){const j=o[b];if(transformProps.has(b)){d=!0;continue}else if(isCSSVariableName(b)){c[b]=j;continue}else{const _=getValueAsType(j,numberValueTypes[b]);b.startsWith("origin")?(g=!0,h[b]=_):s[b]=_}}if(o.transform||(d||a?s.transform=buildTransform(o,e.transform,a):s.transform&&(s.transform="none")),g){const{originX:b="50%",originY:j="50%",originZ:_=0}=h;s.transformOrigin=`${b} ${j} ${_}`}}const dashKeys={offset:"stroke-dashoffset",array:"stroke-dasharray"},camelKeys={offset:"strokeDashoffset",array:"strokeDasharray"};function buildSVGPath(e,o,a=1,s=0,c=!0){e.pathLength=1;const h=c?dashKeys:camelKeys;e[h.offset]=px.transform(-s);const d=px.transform(o),g=px.transform(a);e[h.array]=`${d} ${g}`}function calcOrigin$1(e,o,a){return typeof e=="string"?e:px.transform(o+a*e)}function calcSVGTransformOrigin(e,o,a){const s=calcOrigin$1(o,e.x,e.width),c=calcOrigin$1(a,e.y,e.height);return`${s} ${c}`}function buildSVGAttrs(e,{attrX:o,attrY:a,attrScale:s,originX:c,originY:h,pathLength:d,pathSpacing:g=1,pathOffset:b=0,...j},_,_e){if(buildHTMLStyles(e,j,_e),_){e.style.viewBox&&(e.attrs.viewBox=e.style.viewBox);return}e.attrs=e.style,e.style={};const{attrs:tt,style:it,dimensions:st}=e;tt.transform&&(st&&(it.transform=tt.transform),delete tt.transform),st&&(c!==void 0||h!==void 0||it.transform)&&(it.transformOrigin=calcSVGTransformOrigin(st,c!==void 0?c:.5,h!==void 0?h:.5)),o!==void 0&&(tt.x=o),a!==void 0&&(tt.y=a),s!==void 0&&(tt.scale=s),d!==void 0&&buildSVGPath(tt,d,g,b,!1)}const createHtmlRenderState=()=>({style:{},transform:{},transformOrigin:{},vars:{}}),createSvgRenderState=()=>({...createHtmlRenderState(),attrs:{}}),isSVGTag=e=>typeof e=="string"&&e.toLowerCase()==="svg";function renderHTML(e,{style:o,vars:a},s,c){Object.assign(e.style,o,c&&c.getProjectionStyles(s));for(const h in a)e.style.setProperty(h,a[h])}const camelCaseAttributes=new Set(["baseFrequency","diffuseConstant","kernelMatrix","kernelUnitLength","keySplines","keyTimes","limitingConeAngle","markerHeight","markerWidth","numOctaves","targetX","targetY","surfaceScale","specularConstant","specularExponent","stdDeviation","tableValues","viewBox","gradientTransform","pathLength","startOffset","textLength","lengthAdjust"]);function renderSVG(e,o,a,s){renderHTML(e,o,void 0,s);for(const c in o.attrs)e.setAttribute(camelCaseAttributes.has(c)?c:camelToDash(c),o.attrs[c])}const scaleCorrectors={};function addScaleCorrector(e){Object.assign(scaleCorrectors,e)}function isForcedMotionValue(e,{layout:o,layoutId:a}){return transformProps.has(e)||e.startsWith("origin")||(o||a!==void 0)&&(!!scaleCorrectors[e]||e==="opacity")}function scrapeMotionValuesFromProps$1(e,o,a){var s;const{style:c}=e,h={};for(const d in c)(isMotionValue(c[d])||o.style&&isMotionValue(o.style[d])||isForcedMotionValue(d,e)||((s=a==null?void 0:a.getValue(d))===null||s===void 0?void 0:s.liveStyle)!==void 0)&&(h[d]=c[d]);return h}function scrapeMotionValuesFromProps(e,o,a){const s=scrapeMotionValuesFromProps$1(e,o,a);for(const c in e)if(isMotionValue(e[c])||isMotionValue(o[c])){const h=transformPropOrder.indexOf(c)!==-1?"attr"+c.charAt(0).toUpperCase()+c.substring(1):c;s[h]=e[c]}return s}function updateSVGDimensions(e,o){try{o.dimensions=typeof e.getBBox=="function"?e.getBBox():e.getBoundingClientRect()}catch{o.dimensions={x:0,y:0,width:0,height:0}}}const layoutProps=["x","y","width","height","cx","cy","r"],svgMotionConfig={useVisualState:makeUseVisualState({scrapeMotionValuesFromProps,createRenderState:createSvgRenderState,onUpdate:({props:e,prevProps:o,current:a,renderState:s,latestValues:c})=>{if(!a)return;let h=!!e.drag;if(!h){for(const g in c)if(transformProps.has(g)){h=!0;break}}if(!h)return;let d=!o;if(o)for(let g=0;g<layoutProps.length;g++){const b=layoutProps[g];e[b]!==o[b]&&(d=!0)}d&&frame.read(()=>{updateSVGDimensions(a,s),frame.render(()=>{buildSVGAttrs(s,c,isSVGTag(a.tagName),e.transformTemplate),renderSVG(a,s)})})}})},htmlMotionConfig={useVisualState:makeUseVisualState({scrapeMotionValuesFromProps:scrapeMotionValuesFromProps$1,createRenderState:createHtmlRenderState})};function copyRawValuesOnly(e,o,a){for(const s in o)!isMotionValue(o[s])&&!isForcedMotionValue(s,a)&&(e[s]=o[s])}function useInitialMotionValues({transformTemplate:e},o){return reactExports.useMemo(()=>{const a=createHtmlRenderState();return buildHTMLStyles(a,o,e),Object.assign({},a.vars,a.style)},[o])}function useStyle(e,o){const a=e.style||{},s={};return copyRawValuesOnly(s,a,e),Object.assign(s,useInitialMotionValues(e,o)),s}function useHTMLProps(e,o){const a={},s=useStyle(e,o);return e.drag&&e.dragListener!==!1&&(a.draggable=!1,s.userSelect=s.WebkitUserSelect=s.WebkitTouchCallout="none",s.touchAction=e.drag===!0?"none":`pan-${e.drag==="x"?"y":"x"}`),e.tabIndex===void 0&&(e.onTap||e.onTapStart||e.whileTap)&&(a.tabIndex=0),a.style=s,a}function useSVGProps(e,o,a,s){const c=reactExports.useMemo(()=>{const h=createSvgRenderState();return buildSVGAttrs(h,o,isSVGTag(s),e.transformTemplate),{...h.attrs,style:{...h.style}}},[o]);if(e.style){const h={};copyRawValuesOnly(h,e.style,e),c.style={...h,...c.style}}return c}function createUseRender(e=!1){return(a,s,c,{latestValues:h},d)=>{const b=(isSVGComponent(a)?useSVGProps:useHTMLProps)(s,h,d,a),j=filterProps(s,typeof a=="string",e),_=a!==reactExports.Fragment?{...j,...b,ref:c}:{},{children:_e}=s,tt=reactExports.useMemo(()=>isMotionValue(_e)?_e.get():_e,[_e]);return reactExports.createElement(a,{..._,children:tt})}}function createMotionComponentFactory(e,o){return function(s,{forwardMotionProps:c}={forwardMotionProps:!1}){const d={...isSVGComponent(s)?svgMotionConfig:htmlMotionConfig,preloadedFeatures:e,useRender:createUseRender(c),createVisualElement:o,Component:s};return createRendererMotionComponent(d)}}function shallowCompare(e,o){if(!Array.isArray(o))return!1;const a=o.length;if(a!==e.length)return!1;for(let s=0;s<a;s++)if(o[s]!==e[s])return!1;return!0}function resolveVariant(e,o,a){const s=e.getProps();return resolveVariantFromProps(s,o,a!==void 0?a:s.custom,e)}const supportsScrollTimeline=memo(()=>window.ScrollTimeline!==void 0);class BaseGroupPlaybackControls{constructor(o){this.stop=()=>this.runAll("stop"),this.animations=o.filter(Boolean)}get finished(){return Promise.all(this.animations.map(o=>"finished"in o?o.finished:o))}getAll(o){return this.animations[0][o]}setAll(o,a){for(let s=0;s<this.animations.length;s++)this.animations[s][o]=a}attachTimeline(o,a){const s=this.animations.map(c=>{if(supportsScrollTimeline()&&c.attachTimeline)return c.attachTimeline(o);if(typeof a=="function")return a(c)});return()=>{s.forEach((c,h)=>{c&&c(),this.animations[h].stop()})}}get time(){return this.getAll("time")}set time(o){this.setAll("time",o)}get speed(){return this.getAll("speed")}set speed(o){this.setAll("speed",o)}get startTime(){return this.getAll("startTime")}get duration(){let o=0;for(let a=0;a<this.animations.length;a++)o=Math.max(o,this.animations[a].duration);return o}runAll(o){this.animations.forEach(a=>a[o]())}flatten(){this.runAll("flatten")}play(){this.runAll("play")}pause(){this.runAll("pause")}cancel(){this.runAll("cancel")}complete(){this.runAll("complete")}}class GroupPlaybackControls extends BaseGroupPlaybackControls{then(o,a){return Promise.all(this.animations).then(o).catch(a)}}function getValueTransition(e,o){return e?e[o]||e.default||e:void 0}const maxGeneratorDuration=2e4;function calcGeneratorDuration(e){let o=0;const a=50;let s=e.next(o);for(;!s.done&&o<maxGeneratorDuration;)o+=a,s=e.next(o);return o>=maxGeneratorDuration?1/0:o}function isGenerator(e){return typeof e=="function"}function attachTimeline(e,o){e.timeline=o,e.onfinish=null}const isBezierDefinition=e=>Array.isArray(e)&&typeof e[0]=="number",supportsFlags={linearEasing:void 0};function memoSupports(e,o){const a=memo(e);return()=>{var s;return(s=supportsFlags[o])!==null&&s!==void 0?s:a()}}const supportsLinearEasing=memoSupports(()=>{try{document.createElement("div").animate({opacity:0},{easing:"linear(0, 1)"})}catch{return!1}return!0},"linearEasing"),generateLinearEasing=(e,o,a=10)=>{let s="";const c=Math.max(Math.round(o/a),2);for(let h=0;h<c;h++)s+=e(progress(0,c-1,h))+", ";return`linear(${s.substring(0,s.length-2)})`};function isWaapiSupportedEasing(e){return!!(typeof e=="function"&&supportsLinearEasing()||!e||typeof e=="string"&&(e in supportedWaapiEasing||supportsLinearEasing())||isBezierDefinition(e)||Array.isArray(e)&&e.every(isWaapiSupportedEasing))}const cubicBezierAsString=([e,o,a,s])=>`cubic-bezier(${e}, ${o}, ${a}, ${s})`,supportedWaapiEasing={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",circIn:cubicBezierAsString([0,.65,.55,1]),circOut:cubicBezierAsString([.55,0,1,.45]),backIn:cubicBezierAsString([.31,.01,.66,-.59]),backOut:cubicBezierAsString([.33,1.53,.69,.99])};function mapEasingToNativeEasing(e,o){if(e)return typeof e=="function"&&supportsLinearEasing()?generateLinearEasing(e,o):isBezierDefinition(e)?cubicBezierAsString(e):Array.isArray(e)?e.map(a=>mapEasingToNativeEasing(a,o)||supportedWaapiEasing.easeOut):supportedWaapiEasing[e]}const isDragging={x:!1,y:!1};function isDragActive(){return isDragging.x||isDragging.y}function resolveElements(e,o,a){var s;if(e instanceof Element)return[e];if(typeof e=="string"){let c=document;const h=(s=void 0)!==null&&s!==void 0?s:c.querySelectorAll(e);return h?Array.from(h):[]}return Array.from(e)}function setupGesture(e,o){const a=resolveElements(e),s=new AbortController,c={passive:!0,...o,signal:s.signal};return[a,c,()=>s.abort()]}function filterEvents$1(e){return o=>{o.pointerType==="touch"||isDragActive()||e(o)}}function hover(e,o,a={}){const[s,c,h]=setupGesture(e,a),d=filterEvents$1(g=>{const{target:b}=g,j=o(g);if(typeof j!="function"||!b)return;const _=filterEvents$1(_e=>{j(_e),b.removeEventListener("pointerleave",_)});b.addEventListener("pointerleave",_,c)});return s.forEach(g=>{g.addEventListener("pointerenter",d,c)}),h}const isNodeOrChild=(e,o)=>o?e===o?!0:isNodeOrChild(e,o.parentElement):!1,isPrimaryPointer=e=>e.pointerType==="mouse"?typeof e.button!="number"||e.button<=0:e.isPrimary!==!1,focusableElements=new Set(["BUTTON","INPUT","SELECT","TEXTAREA","A"]);function isElementKeyboardAccessible(e){return focusableElements.has(e.tagName)||e.tabIndex!==-1}const isPressing=new WeakSet;function filterEvents(e){return o=>{o.key==="Enter"&&e(o)}}function firePointerEvent(e,o){e.dispatchEvent(new PointerEvent("pointer"+o,{isPrimary:!0,bubbles:!0}))}const enableKeyboardPress=(e,o)=>{const a=e.currentTarget;if(!a)return;const s=filterEvents(()=>{if(isPressing.has(a))return;firePointerEvent(a,"down");const c=filterEvents(()=>{firePointerEvent(a,"up")}),h=()=>firePointerEvent(a,"cancel");a.addEventListener("keyup",c,o),a.addEventListener("blur",h,o)});a.addEventListener("keydown",s,o),a.addEventListener("blur",()=>a.removeEventListener("keydown",s),o)};function isValidPressEvent(e){return isPrimaryPointer(e)&&!isDragActive()}function press(e,o,a={}){const[s,c,h]=setupGesture(e,a),d=g=>{const b=g.currentTarget;if(!isValidPressEvent(g)||isPressing.has(b))return;isPressing.add(b);const j=o(g),_=(it,st)=>{window.removeEventListener("pointerup",_e),window.removeEventListener("pointercancel",tt),!(!isValidPressEvent(it)||!isPressing.has(b))&&(isPressing.delete(b),typeof j=="function"&&j(it,{success:st}))},_e=it=>{_(it,a.useGlobalTarget||isNodeOrChild(b,it.target))},tt=it=>{_(it,!1)};window.addEventListener("pointerup",_e,c),window.addEventListener("pointercancel",tt,c)};return s.forEach(g=>{!isElementKeyboardAccessible(g)&&g.getAttribute("tabindex")===null&&(g.tabIndex=0),(a.useGlobalTarget?window:g).addEventListener("pointerdown",d,c),g.addEventListener("focus",j=>enableKeyboardPress(j,c),c)}),h}function setDragLock(e){return e==="x"||e==="y"?isDragging[e]?null:(isDragging[e]=!0,()=>{isDragging[e]=!1}):isDragging.x||isDragging.y?null:(isDragging.x=isDragging.y=!0,()=>{isDragging.x=isDragging.y=!1})}const positionalKeys=new Set(["width","height","top","left","right","bottom",...transformPropOrder]);let now;function clearTime(){now=void 0}const time={now:()=>(now===void 0&&time.set(frameData.isProcessing||MotionGlobalConfig.useManualTiming?frameData.timestamp:performance.now()),now),set:e=>{now=e,queueMicrotask(clearTime)}};function addUniqueItem(e,o){e.indexOf(o)===-1&&e.push(o)}function removeItem(e,o){const a=e.indexOf(o);a>-1&&e.splice(a,1)}class SubscriptionManager{constructor(){this.subscriptions=[]}add(o){return addUniqueItem(this.subscriptions,o),()=>removeItem(this.subscriptions,o)}notify(o,a,s){const c=this.subscriptions.length;if(c)if(c===1)this.subscriptions[0](o,a,s);else for(let h=0;h<c;h++){const d=this.subscriptions[h];d&&d(o,a,s)}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0}}function velocityPerSecond(e,o){return o?e*(1e3/o):0}const MAX_VELOCITY_DELTA=30,isFloat$1=e=>!isNaN(parseFloat(e));class MotionValue{constructor(o,a={}){this.version="11.18.2",this.canTrackVelocity=null,this.events={},this.updateAndNotify=(s,c=!0)=>{const h=time.now();this.updatedAt!==h&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(s),this.current!==this.prev&&this.events.change&&this.events.change.notify(this.current),c&&this.events.renderRequest&&this.events.renderRequest.notify(this.current)},this.hasAnimated=!1,this.setCurrent(o),this.owner=a.owner}setCurrent(o){this.current=o,this.updatedAt=time.now(),this.canTrackVelocity===null&&o!==void 0&&(this.canTrackVelocity=isFloat$1(this.current))}setPrevFrameValue(o=this.current){this.prevFrameValue=o,this.prevUpdatedAt=this.updatedAt}onChange(o){return this.on("change",o)}on(o,a){this.events[o]||(this.events[o]=new SubscriptionManager);const s=this.events[o].add(a);return o==="change"?()=>{s(),frame.read(()=>{this.events.change.getSize()||this.stop()})}:s}clearListeners(){for(const o in this.events)this.events[o].clear()}attach(o,a){this.passiveEffect=o,this.stopPassiveEffect=a}set(o,a=!0){!a||!this.passiveEffect?this.updateAndNotify(o,a):this.passiveEffect(o,this.updateAndNotify)}setWithVelocity(o,a,s){this.set(a),this.prev=void 0,this.prevFrameValue=o,this.prevUpdatedAt=this.updatedAt-s}jump(o,a=!0){this.updateAndNotify(o),this.prev=o,this.prevUpdatedAt=this.prevFrameValue=void 0,a&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}get(){return this.current}getPrevious(){return this.prev}getVelocity(){const o=time.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||o-this.updatedAt>MAX_VELOCITY_DELTA)return 0;const a=Math.min(this.updatedAt-this.prevUpdatedAt,MAX_VELOCITY_DELTA);return velocityPerSecond(parseFloat(this.current)-parseFloat(this.prevFrameValue),a)}start(o){return this.stop(),new Promise(a=>{this.hasAnimated=!0,this.animation=o(a),this.events.animationStart&&this.events.animationStart.notify()}).then(()=>{this.events.animationComplete&&this.events.animationComplete.notify(),this.clearAnimation()})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation()}isAnimating(){return!!this.animation}clearAnimation(){delete this.animation}destroy(){this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}}function motionValue(e,o){return new MotionValue(e,o)}function setMotionValue(e,o,a){e.hasValue(o)?e.getValue(o).set(a):e.addValue(o,motionValue(a))}function setTarget(e,o){const a=resolveVariant(e,o);let{transitionEnd:s={},transition:c={},...h}=a||{};h={...h,...s};for(const d in h){const g=resolveFinalValueInKeyframes(h[d]);setMotionValue(e,d,g)}}function isWillChangeMotionValue(e){return!!(isMotionValue(e)&&e.add)}function addValueToWillChange(e,o){const a=e.getValue("willChange");if(isWillChangeMotionValue(a))return a.add(o)}function getOptimisedAppearId(e){return e.props[optimizedAppearDataAttribute]}const calcBezier=(e,o,a)=>(((1-3*a+3*o)*e+(3*a-6*o))*e+3*o)*e,subdivisionPrecision=1e-7,subdivisionMaxIterations=12;function binarySubdivide(e,o,a,s,c){let h,d,g=0;do d=o+(a-o)/2,h=calcBezier(d,s,c)-e,h>0?a=d:o=d;while(Math.abs(h)>subdivisionPrecision&&++g<subdivisionMaxIterations);return d}function cubicBezier(e,o,a,s){if(e===o&&a===s)return noop;const c=h=>binarySubdivide(h,0,1,e,a);return h=>h===0||h===1?h:calcBezier(c(h),o,s)}const mirrorEasing=e=>o=>o<=.5?e(2*o)/2:(2-e(2*(1-o)))/2,reverseEasing=e=>o=>1-e(1-o),backOut=cubicBezier(.33,1.53,.69,.99),backIn=reverseEasing(backOut),backInOut=mirrorEasing(backIn),anticipate=e=>(e*=2)<1?.5*backIn(e):.5*(2-Math.pow(2,-10*(e-1))),circIn=e=>1-Math.sin(Math.acos(e)),circOut=reverseEasing(circIn),circInOut=mirrorEasing(circIn),isZeroValueString=e=>/^0[^.\s]+$/u.test(e);function isNone(e){return typeof e=="number"?e===0:e!==null?e==="none"||e==="0"||isZeroValueString(e):!0}const sanitize=e=>Math.round(e*1e5)/1e5,floatRegex=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function isNullish(e){return e==null}const singleColorRegex=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,isColorString=(e,o)=>a=>!!(typeof a=="string"&&singleColorRegex.test(a)&&a.startsWith(e)||o&&!isNullish(a)&&Object.prototype.hasOwnProperty.call(a,o)),splitColor=(e,o,a)=>s=>{if(typeof s!="string")return s;const[c,h,d,g]=s.match(floatRegex);return{[e]:parseFloat(c),[o]:parseFloat(h),[a]:parseFloat(d),alpha:g!==void 0?parseFloat(g):1}},clampRgbUnit=e=>clamp(0,255,e),rgbUnit={...number,transform:e=>Math.round(clampRgbUnit(e))},rgba={test:isColorString("rgb","red"),parse:splitColor("red","green","blue"),transform:({red:e,green:o,blue:a,alpha:s=1})=>"rgba("+rgbUnit.transform(e)+", "+rgbUnit.transform(o)+", "+rgbUnit.transform(a)+", "+sanitize(alpha.transform(s))+")"};function parseHex(e){let o="",a="",s="",c="";return e.length>5?(o=e.substring(1,3),a=e.substring(3,5),s=e.substring(5,7),c=e.substring(7,9)):(o=e.substring(1,2),a=e.substring(2,3),s=e.substring(3,4),c=e.substring(4,5),o+=o,a+=a,s+=s,c+=c),{red:parseInt(o,16),green:parseInt(a,16),blue:parseInt(s,16),alpha:c?parseInt(c,16)/255:1}}const hex={test:isColorString("#"),parse:parseHex,transform:rgba.transform},hsla={test:isColorString("hsl","hue"),parse:splitColor("hue","saturation","lightness"),transform:({hue:e,saturation:o,lightness:a,alpha:s=1})=>"hsla("+Math.round(e)+", "+percent.transform(sanitize(o))+", "+percent.transform(sanitize(a))+", "+sanitize(alpha.transform(s))+")"},color={test:e=>rgba.test(e)||hex.test(e)||hsla.test(e),parse:e=>rgba.test(e)?rgba.parse(e):hsla.test(e)?hsla.parse(e):hex.parse(e),transform:e=>typeof e=="string"?e:e.hasOwnProperty("red")?rgba.transform(e):hsla.transform(e)},colorRegex=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;function test(e){var o,a;return isNaN(e)&&typeof e=="string"&&(((o=e.match(floatRegex))===null||o===void 0?void 0:o.length)||0)+(((a=e.match(colorRegex))===null||a===void 0?void 0:a.length)||0)>0}const NUMBER_TOKEN="number",COLOR_TOKEN="color",VAR_TOKEN="var",VAR_FUNCTION_TOKEN="var(",SPLIT_TOKEN="${}",complexRegex=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function analyseComplexValue(e){const o=e.toString(),a=[],s={color:[],number:[],var:[]},c=[];let h=0;const g=o.replace(complexRegex,b=>(color.test(b)?(s.color.push(h),c.push(COLOR_TOKEN),a.push(color.parse(b))):b.startsWith(VAR_FUNCTION_TOKEN)?(s.var.push(h),c.push(VAR_TOKEN),a.push(b)):(s.number.push(h),c.push(NUMBER_TOKEN),a.push(parseFloat(b))),++h,SPLIT_TOKEN)).split(SPLIT_TOKEN);return{values:a,split:g,indexes:s,types:c}}function parseComplexValue(e){return analyseComplexValue(e).values}function createTransformer(e){const{split:o,types:a}=analyseComplexValue(e),s=o.length;return c=>{let h="";for(let d=0;d<s;d++)if(h+=o[d],c[d]!==void 0){const g=a[d];g===NUMBER_TOKEN?h+=sanitize(c[d]):g===COLOR_TOKEN?h+=color.transform(c[d]):h+=c[d]}return h}}const convertNumbersToZero=e=>typeof e=="number"?0:e;function getAnimatableNone$1(e){const o=parseComplexValue(e);return createTransformer(e)(o.map(convertNumbersToZero))}const complex={test,parse:parseComplexValue,createTransformer,getAnimatableNone:getAnimatableNone$1},maxDefaults=new Set(["brightness","contrast","saturate","opacity"]);function applyDefaultFilter(e){const[o,a]=e.slice(0,-1).split("(");if(o==="drop-shadow")return e;const[s]=a.match(floatRegex)||[];if(!s)return e;const c=a.replace(s,"");let h=maxDefaults.has(o)?1:0;return s!==a&&(h*=100),o+"("+h+c+")"}const functionRegex=/\b([a-z-]*)\(.*?\)/gu,filter={...complex,getAnimatableNone:e=>{const o=e.match(functionRegex);return o?o.map(applyDefaultFilter).join(" "):e}},defaultValueTypes={...numberValueTypes,color,backgroundColor:color,outlineColor:color,fill:color,stroke:color,borderColor:color,borderTopColor:color,borderRightColor:color,borderBottomColor:color,borderLeftColor:color,filter,WebkitFilter:filter},getDefaultValueType=e=>defaultValueTypes[e];function getAnimatableNone(e,o){let a=getDefaultValueType(e);return a!==filter&&(a=complex),a.getAnimatableNone?a.getAnimatableNone(o):void 0}const invalidTemplates=new Set(["auto","none","0"]);function makeNoneKeyframesAnimatable(e,o,a){let s=0,c;for(;s<e.length&&!c;){const h=e[s];typeof h=="string"&&!invalidTemplates.has(h)&&analyseComplexValue(h).values.length&&(c=e[s]),s++}if(c&&a)for(const h of o)e[h]=getAnimatableNone(a,c)}const isNumOrPxType=e=>e===number||e===px,getPosFromMatrix=(e,o)=>parseFloat(e.split(", ")[o]),getTranslateFromMatrix=(e,o)=>(a,{transform:s})=>{if(s==="none"||!s)return 0;const c=s.match(/^matrix3d\((.+)\)$/u);if(c)return getPosFromMatrix(c[1],o);{const h=s.match(/^matrix\((.+)\)$/u);return h?getPosFromMatrix(h[1],e):0}},transformKeys=new Set(["x","y","z"]),nonTranslationalTransformKeys=transformPropOrder.filter(e=>!transformKeys.has(e));function removeNonTranslationalTransform(e){const o=[];return nonTranslationalTransformKeys.forEach(a=>{const s=e.getValue(a);s!==void 0&&(o.push([a,s.get()]),s.set(a.startsWith("scale")?1:0))}),o}const positionalValues={width:({x:e},{paddingLeft:o="0",paddingRight:a="0"})=>e.max-e.min-parseFloat(o)-parseFloat(a),height:({y:e},{paddingTop:o="0",paddingBottom:a="0"})=>e.max-e.min-parseFloat(o)-parseFloat(a),top:(e,{top:o})=>parseFloat(o),left:(e,{left:o})=>parseFloat(o),bottom:({y:e},{top:o})=>parseFloat(o)+(e.max-e.min),right:({x:e},{left:o})=>parseFloat(o)+(e.max-e.min),x:getTranslateFromMatrix(4,13),y:getTranslateFromMatrix(5,14)};positionalValues.translateX=positionalValues.x;positionalValues.translateY=positionalValues.y;const toResolve=new Set;let isScheduled=!1,anyNeedsMeasurement=!1;function measureAllKeyframes(){if(anyNeedsMeasurement){const e=Array.from(toResolve).filter(s=>s.needsMeasurement),o=new Set(e.map(s=>s.element)),a=new Map;o.forEach(s=>{const c=removeNonTranslationalTransform(s);c.length&&(a.set(s,c),s.render())}),e.forEach(s=>s.measureInitialState()),o.forEach(s=>{s.render();const c=a.get(s);c&&c.forEach(([h,d])=>{var g;(g=s.getValue(h))===null||g===void 0||g.set(d)})}),e.forEach(s=>s.measureEndState()),e.forEach(s=>{s.suspendedScrollY!==void 0&&window.scrollTo(0,s.suspendedScrollY)})}anyNeedsMeasurement=!1,isScheduled=!1,toResolve.forEach(e=>e.complete()),toResolve.clear()}function readAllKeyframes(){toResolve.forEach(e=>{e.readKeyframes(),e.needsMeasurement&&(anyNeedsMeasurement=!0)})}function flushKeyframeResolvers(){readAllKeyframes(),measureAllKeyframes()}class KeyframeResolver{constructor(o,a,s,c,h,d=!1){this.isComplete=!1,this.isAsync=!1,this.needsMeasurement=!1,this.isScheduled=!1,this.unresolvedKeyframes=[...o],this.onComplete=a,this.name=s,this.motionValue=c,this.element=h,this.isAsync=d}scheduleResolve(){this.isScheduled=!0,this.isAsync?(toResolve.add(this),isScheduled||(isScheduled=!0,frame.read(readAllKeyframes),frame.resolveKeyframes(measureAllKeyframes))):(this.readKeyframes(),this.complete())}readKeyframes(){const{unresolvedKeyframes:o,name:a,element:s,motionValue:c}=this;for(let h=0;h<o.length;h++)if(o[h]===null)if(h===0){const d=c==null?void 0:c.get(),g=o[o.length-1];if(d!==void 0)o[0]=d;else if(s&&a){const b=s.readValue(a,g);b!=null&&(o[0]=b)}o[0]===void 0&&(o[0]=g),c&&d===void 0&&c.set(o[0])}else o[h]=o[h-1]}setFinalKeyframe(){}measureInitialState(){}renderEndStyles(){}measureEndState(){}complete(){this.isComplete=!0,this.onComplete(this.unresolvedKeyframes,this.finalKeyframe),toResolve.delete(this)}cancel(){this.isComplete||(this.isScheduled=!1,toResolve.delete(this))}resume(){this.isComplete||this.scheduleResolve()}}const isNumericalString=e=>/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e),splitCSSVariableRegex=/^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;function parseCSSVariable(e){const o=splitCSSVariableRegex.exec(e);if(!o)return[,];const[,a,s,c]=o;return[`--${a??s}`,c]}function getVariableValue(e,o,a=1){const[s,c]=parseCSSVariable(e);if(!s)return;const h=window.getComputedStyle(o).getPropertyValue(s);if(h){const d=h.trim();return isNumericalString(d)?parseFloat(d):d}return isCSSVariableToken(c)?getVariableValue(c,o,a+1):c}const testValueType=e=>o=>o.test(e),auto={test:e=>e==="auto",parse:e=>e},dimensionValueTypes=[number,px,percent,degrees,vw,vh,auto],findDimensionValueType=e=>dimensionValueTypes.find(testValueType(e));class DOMKeyframesResolver extends KeyframeResolver{constructor(o,a,s,c,h){super(o,a,s,c,h,!0)}readKeyframes(){const{unresolvedKeyframes:o,element:a,name:s}=this;if(!a||!a.current)return;super.readKeyframes();for(let b=0;b<o.length;b++){let j=o[b];if(typeof j=="string"&&(j=j.trim(),isCSSVariableToken(j))){const _=getVariableValue(j,a.current);_!==void 0&&(o[b]=_),b===o.length-1&&(this.finalKeyframe=j)}}if(this.resolveNoneKeyframes(),!positionalKeys.has(s)||o.length!==2)return;const[c,h]=o,d=findDimensionValueType(c),g=findDimensionValueType(h);if(d!==g)if(isNumOrPxType(d)&&isNumOrPxType(g))for(let b=0;b<o.length;b++){const j=o[b];typeof j=="string"&&(o[b]=parseFloat(j))}else this.needsMeasurement=!0}resolveNoneKeyframes(){const{unresolvedKeyframes:o,name:a}=this,s=[];for(let c=0;c<o.length;c++)isNone(o[c])&&s.push(c);s.length&&makeNoneKeyframesAnimatable(o,s,a)}measureInitialState(){const{element:o,unresolvedKeyframes:a,name:s}=this;if(!o||!o.current)return;s==="height"&&(this.suspendedScrollY=window.pageYOffset),this.measuredOrigin=positionalValues[s](o.measureViewportBox(),window.getComputedStyle(o.current)),a[0]=this.measuredOrigin;const c=a[a.length-1];c!==void 0&&o.getValue(s,c).jump(c,!1)}measureEndState(){var o;const{element:a,name:s,unresolvedKeyframes:c}=this;if(!a||!a.current)return;const h=a.getValue(s);h&&h.jump(this.measuredOrigin,!1);const d=c.length-1,g=c[d];c[d]=positionalValues[s](a.measureViewportBox(),window.getComputedStyle(a.current)),g!==null&&this.finalKeyframe===void 0&&(this.finalKeyframe=g),!((o=this.removedTransforms)===null||o===void 0)&&o.length&&this.removedTransforms.forEach(([b,j])=>{a.getValue(b).set(j)}),this.resolveNoneKeyframes()}}const isAnimatable=(e,o)=>o==="zIndex"?!1:!!(typeof e=="number"||Array.isArray(e)||typeof e=="string"&&(complex.test(e)||e==="0")&&!e.startsWith("url("));function hasKeyframesChanged(e){const o=e[0];if(e.length===1)return!0;for(let a=0;a<e.length;a++)if(e[a]!==o)return!0}function canAnimate(e,o,a,s){const c=e[0];if(c===null)return!1;if(o==="display"||o==="visibility")return!0;const h=e[e.length-1],d=isAnimatable(c,o),g=isAnimatable(h,o);return!d||!g?!1:hasKeyframesChanged(e)||(a==="spring"||isGenerator(a))&&s}const isNotNull=e=>e!==null;function getFinalKeyframe(e,{repeat:o,repeatType:a="loop"},s){const c=e.filter(isNotNull),h=o&&a!=="loop"&&o%2===1?0:c.length-1;return!h||s===void 0?c[h]:s}const MAX_RESOLVE_DELAY=40;class BaseAnimation{constructor({autoplay:o=!0,delay:a=0,type:s="keyframes",repeat:c=0,repeatDelay:h=0,repeatType:d="loop",...g}){this.isStopped=!1,this.hasAttemptedResolve=!1,this.createdAt=time.now(),this.options={autoplay:o,delay:a,type:s,repeat:c,repeatDelay:h,repeatType:d,...g},this.updateFinishedPromise()}calcStartTime(){return this.resolvedAt?this.resolvedAt-this.createdAt>MAX_RESOLVE_DELAY?this.resolvedAt:this.createdAt:this.createdAt}get resolved(){return!this._resolved&&!this.hasAttemptedResolve&&flushKeyframeResolvers(),this._resolved}onKeyframesResolved(o,a){this.resolvedAt=time.now(),this.hasAttemptedResolve=!0;const{name:s,type:c,velocity:h,delay:d,onComplete:g,onUpdate:b,isGenerator:j}=this.options;if(!j&&!canAnimate(o,s,c,h))if(d)this.options.duration=0;else{b&&b(getFinalKeyframe(o,this.options,a)),g&&g(),this.resolveFinishedPromise();return}const _=this.initPlayback(o,a);_!==!1&&(this._resolved={keyframes:o,finalKeyframe:a,..._},this.onPostResolved())}onPostResolved(){}then(o,a){return this.currentFinishedPromise.then(o,a)}flatten(){this.options.type="keyframes",this.options.ease="linear"}updateFinishedPromise(){this.currentFinishedPromise=new Promise(o=>{this.resolveFinishedPromise=o})}}const mixNumber$1=(e,o,a)=>e+(o-e)*a;function hueToRgb(e,o,a){return a<0&&(a+=1),a>1&&(a-=1),a<1/6?e+(o-e)*6*a:a<1/2?o:a<2/3?e+(o-e)*(2/3-a)*6:e}function hslaToRgba({hue:e,saturation:o,lightness:a,alpha:s}){e/=360,o/=100,a/=100;let c=0,h=0,d=0;if(!o)c=h=d=a;else{const g=a<.5?a*(1+o):a+o-a*o,b=2*a-g;c=hueToRgb(b,g,e+1/3),h=hueToRgb(b,g,e),d=hueToRgb(b,g,e-1/3)}return{red:Math.round(c*255),green:Math.round(h*255),blue:Math.round(d*255),alpha:s}}function mixImmediate(e,o){return a=>a>0?o:e}const mixLinearColor=(e,o,a)=>{const s=e*e,c=a*(o*o-s)+s;return c<0?0:Math.sqrt(c)},colorTypes=[hex,rgba,hsla],getColorType=e=>colorTypes.find(o=>o.test(e));function asRGBA(e){const o=getColorType(e);if(!o)return!1;let a=o.parse(e);return o===hsla&&(a=hslaToRgba(a)),a}const mixColor=(e,o)=>{const a=asRGBA(e),s=asRGBA(o);if(!a||!s)return mixImmediate(e,o);const c={...a};return h=>(c.red=mixLinearColor(a.red,s.red,h),c.green=mixLinearColor(a.green,s.green,h),c.blue=mixLinearColor(a.blue,s.blue,h),c.alpha=mixNumber$1(a.alpha,s.alpha,h),rgba.transform(c))},combineFunctions=(e,o)=>a=>o(e(a)),pipe=(...e)=>e.reduce(combineFunctions),invisibleValues=new Set(["none","hidden"]);function mixVisibility(e,o){return invisibleValues.has(e)?a=>a<=0?e:o:a=>a>=1?o:e}function mixNumber(e,o){return a=>mixNumber$1(e,o,a)}function getMixer(e){return typeof e=="number"?mixNumber:typeof e=="string"?isCSSVariableToken(e)?mixImmediate:color.test(e)?mixColor:mixComplex:Array.isArray(e)?mixArray:typeof e=="object"?color.test(e)?mixColor:mixObject:mixImmediate}function mixArray(e,o){const a=[...e],s=a.length,c=e.map((h,d)=>getMixer(h)(h,o[d]));return h=>{for(let d=0;d<s;d++)a[d]=c[d](h);return a}}function mixObject(e,o){const a={...e,...o},s={};for(const c in a)e[c]!==void 0&&o[c]!==void 0&&(s[c]=getMixer(e[c])(e[c],o[c]));return c=>{for(const h in s)a[h]=s[h](c);return a}}function matchOrder(e,o){var a;const s=[],c={color:0,var:0,number:0};for(let h=0;h<o.values.length;h++){const d=o.types[h],g=e.indexes[d][c[d]],b=(a=e.values[g])!==null&&a!==void 0?a:0;s[h]=b,c[d]++}return s}const mixComplex=(e,o)=>{const a=complex.createTransformer(o),s=analyseComplexValue(e),c=analyseComplexValue(o);return s.indexes.var.length===c.indexes.var.length&&s.indexes.color.length===c.indexes.color.length&&s.indexes.number.length>=c.indexes.number.length?invisibleValues.has(e)&&!c.values.length||invisibleValues.has(o)&&!s.values.length?mixVisibility(e,o):pipe(mixArray(matchOrder(s,c),c.values),a):mixImmediate(e,o)};function mix(e,o,a){return typeof e=="number"&&typeof o=="number"&&typeof a=="number"?mixNumber$1(e,o,a):getMixer(e)(e,o)}const velocitySampleDuration=5;function calcGeneratorVelocity(e,o,a){const s=Math.max(o-velocitySampleDuration,0);return velocityPerSecond(a-e(s),o-s)}const springDefaults={stiffness:100,damping:10,mass:1,velocity:0,duration:800,bounce:.3,visualDuration:.3,restSpeed:{granular:.01,default:2},restDelta:{granular:.005,default:.5},minDuration:.01,maxDuration:10,minDamping:.05,maxDamping:1},safeMin=.001;function findSpring({duration:e=springDefaults.duration,bounce:o=springDefaults.bounce,velocity:a=springDefaults.velocity,mass:s=springDefaults.mass}){let c,h,d=1-o;d=clamp(springDefaults.minDamping,springDefaults.maxDamping,d),e=clamp(springDefaults.minDuration,springDefaults.maxDuration,millisecondsToSeconds(e)),d<1?(c=j=>{const _=j*d,_e=_*e,tt=_-a,it=calcAngularFreq(j,d),st=Math.exp(-_e);return safeMin-tt/it*st},h=j=>{const _e=j*d*e,tt=_e*a+a,it=Math.pow(d,2)*Math.pow(j,2)*e,st=Math.exp(-_e),ut=calcAngularFreq(Math.pow(j,2),d);return(-c(j)+safeMin>0?-1:1)*((tt-it)*st)/ut}):(c=j=>{const _=Math.exp(-j*e),_e=(j-a)*e+1;return-safeMin+_*_e},h=j=>{const _=Math.exp(-j*e),_e=(a-j)*(e*e);return _*_e});const g=5/e,b=approximateRoot(c,h,g);if(e=secondsToMilliseconds(e),isNaN(b))return{stiffness:springDefaults.stiffness,damping:springDefaults.damping,duration:e};{const j=Math.pow(b,2)*s;return{stiffness:j,damping:d*2*Math.sqrt(s*j),duration:e}}}const rootIterations=12;function approximateRoot(e,o,a){let s=a;for(let c=1;c<rootIterations;c++)s=s-e(s)/o(s);return s}function calcAngularFreq(e,o){return e*Math.sqrt(1-o*o)}const durationKeys=["duration","bounce"],physicsKeys=["stiffness","damping","mass"];function isSpringType(e,o){return o.some(a=>e[a]!==void 0)}function getSpringOptions(e){let o={velocity:springDefaults.velocity,stiffness:springDefaults.stiffness,damping:springDefaults.damping,mass:springDefaults.mass,isResolvedFromDuration:!1,...e};if(!isSpringType(e,physicsKeys)&&isSpringType(e,durationKeys))if(e.visualDuration){const a=e.visualDuration,s=2*Math.PI/(a*1.2),c=s*s,h=2*clamp(.05,1,1-(e.bounce||0))*Math.sqrt(c);o={...o,mass:springDefaults.mass,stiffness:c,damping:h}}else{const a=findSpring(e);o={...o,...a,mass:springDefaults.mass},o.isResolvedFromDuration=!0}return o}function spring(e=springDefaults.visualDuration,o=springDefaults.bounce){const a=typeof e!="object"?{visualDuration:e,keyframes:[0,1],bounce:o}:e;let{restSpeed:s,restDelta:c}=a;const h=a.keyframes[0],d=a.keyframes[a.keyframes.length-1],g={done:!1,value:h},{stiffness:b,damping:j,mass:_,duration:_e,velocity:tt,isResolvedFromDuration:it}=getSpringOptions({...a,velocity:-millisecondsToSeconds(a.velocity||0)}),st=tt||0,ut=j/(2*Math.sqrt(b*_)),ct=d-h,rt=millisecondsToSeconds(Math.sqrt(b/_)),ot=Math.abs(ct)<5;s||(s=ot?springDefaults.restSpeed.granular:springDefaults.restSpeed.default),c||(c=ot?springDefaults.restDelta.granular:springDefaults.restDelta.default);let lt;if(ut<1){const pt=calcAngularFreq(rt,ut);lt=gt=>{const wt=Math.exp(-ut*rt*gt);return d-wt*((st+ut*rt*ct)/pt*Math.sin(pt*gt)+ct*Math.cos(pt*gt))}}else if(ut===1)lt=pt=>d-Math.exp(-rt*pt)*(ct+(st+rt*ct)*pt);else{const pt=rt*Math.sqrt(ut*ut-1);lt=gt=>{const wt=Math.exp(-ut*rt*gt),yt=Math.min(pt*gt,300);return d-wt*((st+ut*rt*ct)*Math.sinh(yt)+pt*ct*Math.cosh(yt))/pt}}const dt={calculatedDuration:it&&_e||null,next:pt=>{const gt=lt(pt);if(it)g.done=pt>=_e;else{let wt=0;ut<1&&(wt=pt===0?secondsToMilliseconds(st):calcGeneratorVelocity(lt,pt,gt));const yt=Math.abs(wt)<=s,St=Math.abs(d-gt)<=c;g.done=yt&&St}return g.value=g.done?d:gt,g},toString:()=>{const pt=Math.min(calcGeneratorDuration(dt),maxGeneratorDuration),gt=generateLinearEasing(wt=>dt.next(pt*wt).value,pt,30);return pt+"ms "+gt}};return dt}function inertia({keyframes:e,velocity:o=0,power:a=.8,timeConstant:s=325,bounceDamping:c=10,bounceStiffness:h=500,modifyTarget:d,min:g,max:b,restDelta:j=.5,restSpeed:_}){const _e=e[0],tt={done:!1,value:_e},it=yt=>g!==void 0&&yt<g||b!==void 0&&yt>b,st=yt=>g===void 0?b:b===void 0||Math.abs(g-yt)<Math.abs(b-yt)?g:b;let ut=a*o;const ct=_e+ut,rt=d===void 0?ct:d(ct);rt!==ct&&(ut=rt-_e);const ot=yt=>-ut*Math.exp(-yt/s),lt=yt=>rt+ot(yt),dt=yt=>{const St=ot(yt),xt=lt(yt);tt.done=Math.abs(St)<=j,tt.value=tt.done?rt:xt};let pt,gt;const wt=yt=>{it(tt.value)&&(pt=yt,gt=spring({keyframes:[tt.value,st(tt.value)],velocity:calcGeneratorVelocity(lt,yt,tt.value),damping:c,stiffness:h,restDelta:j,restSpeed:_}))};return wt(0),{calculatedDuration:null,next:yt=>{let St=!1;return!gt&&pt===void 0&&(St=!0,dt(yt),wt(yt)),pt!==void 0&&yt>=pt?gt.next(yt-pt):(!St&&dt(yt),tt)}}}const easeIn=cubicBezier(.42,0,1,1),easeOut=cubicBezier(0,0,.58,1),easeInOut=cubicBezier(.42,0,.58,1),isEasingArray=e=>Array.isArray(e)&&typeof e[0]!="number",easingLookup={linear:noop,easeIn,easeInOut,easeOut,circIn,circInOut,circOut,backIn,backInOut,backOut,anticipate},easingDefinitionToFunction=e=>{if(isBezierDefinition(e)){invariant(e.length===4);const[o,a,s,c]=e;return cubicBezier(o,a,s,c)}else if(typeof e=="string")return invariant(easingLookup[e]!==void 0),easingLookup[e];return e};function createMixers(e,o,a){const s=[],c=a||mix,h=e.length-1;for(let d=0;d<h;d++){let g=c(e[d],e[d+1]);if(o){const b=Array.isArray(o)?o[d]||noop:o;g=pipe(b,g)}s.push(g)}return s}function interpolate(e,o,{clamp:a=!0,ease:s,mixer:c}={}){const h=e.length;if(invariant(h===o.length),h===1)return()=>o[0];if(h===2&&o[0]===o[1])return()=>o[1];const d=e[0]===e[1];e[0]>e[h-1]&&(e=[...e].reverse(),o=[...o].reverse());const g=createMixers(o,s,c),b=g.length,j=_=>{if(d&&_<e[0])return o[0];let _e=0;if(b>1)for(;_e<e.length-2&&!(_<e[_e+1]);_e++);const tt=progress(e[_e],e[_e+1],_);return g[_e](tt)};return a?_=>j(clamp(e[0],e[h-1],_)):j}function fillOffset(e,o){const a=e[e.length-1];for(let s=1;s<=o;s++){const c=progress(0,o,s);e.push(mixNumber$1(a,1,c))}}function defaultOffset(e){const o=[0];return fillOffset(o,e.length-1),o}function convertOffsetToTimes(e,o){return e.map(a=>a*o)}function defaultEasing(e,o){return e.map(()=>o||easeInOut).splice(0,e.length-1)}function keyframes({duration:e=300,keyframes:o,times:a,ease:s="easeInOut"}){const c=isEasingArray(s)?s.map(easingDefinitionToFunction):easingDefinitionToFunction(s),h={done:!1,value:o[0]},d=convertOffsetToTimes(a&&a.length===o.length?a:defaultOffset(o),e),g=interpolate(d,o,{ease:Array.isArray(c)?c:defaultEasing(o,c)});return{calculatedDuration:e,next:b=>(h.value=g(b),h.done=b>=e,h)}}const frameloopDriver=e=>{const o=({timestamp:a})=>e(a);return{start:()=>frame.update(o,!0),stop:()=>cancelFrame(o),now:()=>frameData.isProcessing?frameData.timestamp:time.now()}},generators={decay:inertia,inertia,tween:keyframes,keyframes,spring},percentToProgress=e=>e/100;class MainThreadAnimation extends BaseAnimation{constructor(o){super(o),this.holdTime=null,this.cancelTime=null,this.currentTime=0,this.playbackSpeed=1,this.pendingPlayState="running",this.startTime=null,this.state="idle",this.stop=()=>{if(this.resolver.cancel(),this.isStopped=!0,this.state==="idle")return;this.teardown();const{onStop:b}=this.options;b&&b()};const{name:a,motionValue:s,element:c,keyframes:h}=this.options,d=(c==null?void 0:c.KeyframeResolver)||KeyframeResolver,g=(b,j)=>this.onKeyframesResolved(b,j);this.resolver=new d(h,g,a,s,c),this.resolver.scheduleResolve()}flatten(){super.flatten(),this._resolved&&Object.assign(this._resolved,this.initPlayback(this._resolved.keyframes))}initPlayback(o){const{type:a="keyframes",repeat:s=0,repeatDelay:c=0,repeatType:h,velocity:d=0}=this.options,g=isGenerator(a)?a:generators[a]||keyframes;let b,j;g!==keyframes&&typeof o[0]!="number"&&(b=pipe(percentToProgress,mix(o[0],o[1])),o=[0,100]);const _=g({...this.options,keyframes:o});h==="mirror"&&(j=g({...this.options,keyframes:[...o].reverse(),velocity:-d})),_.calculatedDuration===null&&(_.calculatedDuration=calcGeneratorDuration(_));const{calculatedDuration:_e}=_,tt=_e+c,it=tt*(s+1)-c;return{generator:_,mirroredGenerator:j,mapPercentToKeyframes:b,calculatedDuration:_e,resolvedDuration:tt,totalDuration:it}}onPostResolved(){const{autoplay:o=!0}=this.options;this.play(),this.pendingPlayState==="paused"||!o?this.pause():this.state=this.pendingPlayState}tick(o,a=!1){const{resolved:s}=this;if(!s){const{keyframes:yt}=this.options;return{done:!0,value:yt[yt.length-1]}}const{finalKeyframe:c,generator:h,mirroredGenerator:d,mapPercentToKeyframes:g,keyframes:b,calculatedDuration:j,totalDuration:_,resolvedDuration:_e}=s;if(this.startTime===null)return h.next(0);const{delay:tt,repeat:it,repeatType:st,repeatDelay:ut,onUpdate:ct}=this.options;this.speed>0?this.startTime=Math.min(this.startTime,o):this.speed<0&&(this.startTime=Math.min(o-_/this.speed,this.startTime)),a?this.currentTime=o:this.holdTime!==null?this.currentTime=this.holdTime:this.currentTime=Math.round(o-this.startTime)*this.speed;const rt=this.currentTime-tt*(this.speed>=0?1:-1),ot=this.speed>=0?rt<0:rt>_;this.currentTime=Math.max(rt,0),this.state==="finished"&&this.holdTime===null&&(this.currentTime=_);let lt=this.currentTime,dt=h;if(it){const yt=Math.min(this.currentTime,_)/_e;let St=Math.floor(yt),xt=yt%1;!xt&&yt>=1&&(xt=1),xt===1&&St--,St=Math.min(St,it+1),!!(St%2)&&(st==="reverse"?(xt=1-xt,ut&&(xt-=ut/_e)):st==="mirror"&&(dt=d)),lt=clamp(0,1,xt)*_e}const pt=ot?{done:!1,value:b[0]}:dt.next(lt);g&&(pt.value=g(pt.value));let{done:gt}=pt;!ot&&j!==null&&(gt=this.speed>=0?this.currentTime>=_:this.currentTime<=0);const wt=this.holdTime===null&&(this.state==="finished"||this.state==="running"&&gt);return wt&&c!==void 0&&(pt.value=getFinalKeyframe(b,this.options,c)),ct&&ct(pt.value),wt&&this.finish(),pt}get duration(){const{resolved:o}=this;return o?millisecondsToSeconds(o.calculatedDuration):0}get time(){return millisecondsToSeconds(this.currentTime)}set time(o){o=secondsToMilliseconds(o),this.currentTime=o,this.holdTime!==null||this.speed===0?this.holdTime=o:this.driver&&(this.startTime=this.driver.now()-o/this.speed)}get speed(){return this.playbackSpeed}set speed(o){const a=this.playbackSpeed!==o;this.playbackSpeed=o,a&&(this.time=millisecondsToSeconds(this.currentTime))}play(){if(this.resolver.isScheduled||this.resolver.resume(),!this._resolved){this.pendingPlayState="running";return}if(this.isStopped)return;const{driver:o=frameloopDriver,onPlay:a,startTime:s}=this.options;this.driver||(this.driver=o(h=>this.tick(h))),a&&a();const c=this.driver.now();this.holdTime!==null?this.startTime=c-this.holdTime:this.startTime?this.state==="finished"&&(this.startTime=c):this.startTime=s??this.calcStartTime(),this.state==="finished"&&this.updateFinishedPromise(),this.cancelTime=this.startTime,this.holdTime=null,this.state="running",this.driver.start()}pause(){var o;if(!this._resolved){this.pendingPlayState="paused";return}this.state="paused",this.holdTime=(o=this.currentTime)!==null&&o!==void 0?o:0}complete(){this.state!=="running"&&this.play(),this.pendingPlayState=this.state="finished",this.holdTime=null}finish(){this.teardown(),this.state="finished";const{onComplete:o}=this.options;o&&o()}cancel(){this.cancelTime!==null&&this.tick(this.cancelTime),this.teardown(),this.updateFinishedPromise()}teardown(){this.state="idle",this.stopDriver(),this.resolveFinishedPromise(),this.updateFinishedPromise(),this.startTime=this.cancelTime=null,this.resolver.cancel()}stopDriver(){this.driver&&(this.driver.stop(),this.driver=void 0)}sample(o){return this.startTime=0,this.tick(o,!0)}}const acceleratedValues=new Set(["opacity","clipPath","filter","transform"]);function startWaapiAnimation(e,o,a,{delay:s=0,duration:c=300,repeat:h=0,repeatType:d="loop",ease:g="easeInOut",times:b}={}){const j={[o]:a};b&&(j.offset=b);const _=mapEasingToNativeEasing(g,c);return Array.isArray(_)&&(j.easing=_),e.animate(j,{delay:s,duration:c,easing:Array.isArray(_)?"linear":_,fill:"both",iterations:h+1,direction:d==="reverse"?"alternate":"normal"})}const supportsWaapi=memo(()=>Object.hasOwnProperty.call(Element.prototype,"animate")),sampleDelta=10,maxDuration=2e4;function requiresPregeneratedKeyframes(e){return isGenerator(e.type)||e.type==="spring"||!isWaapiSupportedEasing(e.ease)}function pregenerateKeyframes(e,o){const a=new MainThreadAnimation({...o,keyframes:e,repeat:0,delay:0,isGenerator:!0});let s={done:!1,value:e[0]};const c=[];let h=0;for(;!s.done&&h<maxDuration;)s=a.sample(h),c.push(s.value),h+=sampleDelta;return{times:void 0,keyframes:c,duration:h-sampleDelta,ease:"linear"}}const unsupportedEasingFunctions={anticipate,backInOut,circInOut};function isUnsupportedEase(e){return e in unsupportedEasingFunctions}class AcceleratedAnimation extends BaseAnimation{constructor(o){super(o);const{name:a,motionValue:s,element:c,keyframes:h}=this.options;this.resolver=new DOMKeyframesResolver(h,(d,g)=>this.onKeyframesResolved(d,g),a,s,c),this.resolver.scheduleResolve()}initPlayback(o,a){let{duration:s=300,times:c,ease:h,type:d,motionValue:g,name:b,startTime:j}=this.options;if(!g.owner||!g.owner.current)return!1;if(typeof h=="string"&&supportsLinearEasing()&&isUnsupportedEase(h)&&(h=unsupportedEasingFunctions[h]),requiresPregeneratedKeyframes(this.options)){const{onComplete:_e,onUpdate:tt,motionValue:it,element:st,...ut}=this.options,ct=pregenerateKeyframes(o,ut);o=ct.keyframes,o.length===1&&(o[1]=o[0]),s=ct.duration,c=ct.times,h=ct.ease,d="keyframes"}const _=startWaapiAnimation(g.owner.current,b,o,{...this.options,duration:s,times:c,ease:h});return _.startTime=j??this.calcStartTime(),this.pendingTimeline?(attachTimeline(_,this.pendingTimeline),this.pendingTimeline=void 0):_.onfinish=()=>{const{onComplete:_e}=this.options;g.set(getFinalKeyframe(o,this.options,a)),_e&&_e(),this.cancel(),this.resolveFinishedPromise()},{animation:_,duration:s,times:c,type:d,ease:h,keyframes:o}}get duration(){const{resolved:o}=this;if(!o)return 0;const{duration:a}=o;return millisecondsToSeconds(a)}get time(){const{resolved:o}=this;if(!o)return 0;const{animation:a}=o;return millisecondsToSeconds(a.currentTime||0)}set time(o){const{resolved:a}=this;if(!a)return;const{animation:s}=a;s.currentTime=secondsToMilliseconds(o)}get speed(){const{resolved:o}=this;if(!o)return 1;const{animation:a}=o;return a.playbackRate}set speed(o){const{resolved:a}=this;if(!a)return;const{animation:s}=a;s.playbackRate=o}get state(){const{resolved:o}=this;if(!o)return"idle";const{animation:a}=o;return a.playState}get startTime(){const{resolved:o}=this;if(!o)return null;const{animation:a}=o;return a.startTime}attachTimeline(o){if(!this._resolved)this.pendingTimeline=o;else{const{resolved:a}=this;if(!a)return noop;const{animation:s}=a;attachTimeline(s,o)}return noop}play(){if(this.isStopped)return;const{resolved:o}=this;if(!o)return;const{animation:a}=o;a.playState==="finished"&&this.updateFinishedPromise(),a.play()}pause(){const{resolved:o}=this;if(!o)return;const{animation:a}=o;a.pause()}stop(){if(this.resolver.cancel(),this.isStopped=!0,this.state==="idle")return;this.resolveFinishedPromise(),this.updateFinishedPromise();const{resolved:o}=this;if(!o)return;const{animation:a,keyframes:s,duration:c,type:h,ease:d,times:g}=o;if(a.playState==="idle"||a.playState==="finished")return;if(this.time){const{motionValue:j,onUpdate:_,onComplete:_e,element:tt,...it}=this.options,st=new MainThreadAnimation({...it,keyframes:s,duration:c,type:h,ease:d,times:g,isGenerator:!0}),ut=secondsToMilliseconds(this.time);j.setWithVelocity(st.sample(ut-sampleDelta).value,st.sample(ut).value,sampleDelta)}const{onStop:b}=this.options;b&&b(),this.cancel()}complete(){const{resolved:o}=this;o&&o.animation.finish()}cancel(){const{resolved:o}=this;o&&o.animation.cancel()}static supports(o){const{motionValue:a,name:s,repeatDelay:c,repeatType:h,damping:d,type:g}=o;if(!a||!a.owner||!(a.owner.current instanceof HTMLElement))return!1;const{onUpdate:b,transformTemplate:j}=a.owner.getProps();return supportsWaapi()&&s&&acceleratedValues.has(s)&&!b&&!j&&!c&&h!=="mirror"&&d!==0&&g!=="inertia"}}const underDampedSpring={type:"spring",stiffness:500,damping:25,restSpeed:10},criticallyDampedSpring=e=>({type:"spring",stiffness:550,damping:e===0?2*Math.sqrt(550):30,restSpeed:10}),keyframesTransition={type:"keyframes",duration:.8},ease={type:"keyframes",ease:[.25,.1,.35,1],duration:.3},getDefaultTransition=(e,{keyframes:o})=>o.length>2?keyframesTransition:transformProps.has(e)?e.startsWith("scale")?criticallyDampedSpring(o[1]):underDampedSpring:ease;function isTransitionDefined({when:e,delay:o,delayChildren:a,staggerChildren:s,staggerDirection:c,repeat:h,repeatType:d,repeatDelay:g,from:b,elapsed:j,..._}){return!!Object.keys(_).length}const animateMotionValue=(e,o,a,s={},c,h)=>d=>{const g=getValueTransition(s,e)||{},b=g.delay||s.delay||0;let{elapsed:j=0}=s;j=j-secondsToMilliseconds(b);let _={keyframes:Array.isArray(a)?a:[null,a],ease:"easeOut",velocity:o.getVelocity(),...g,delay:-j,onUpdate:tt=>{o.set(tt),g.onUpdate&&g.onUpdate(tt)},onComplete:()=>{d(),g.onComplete&&g.onComplete()},name:e,motionValue:o,element:h?void 0:c};isTransitionDefined(g)||(_={..._,...getDefaultTransition(e,_)}),_.duration&&(_.duration=secondsToMilliseconds(_.duration)),_.repeatDelay&&(_.repeatDelay=secondsToMilliseconds(_.repeatDelay)),_.from!==void 0&&(_.keyframes[0]=_.from);let _e=!1;if((_.type===!1||_.duration===0&&!_.repeatDelay)&&(_.duration=0,_.delay===0&&(_e=!0)),_e&&!h&&o.get()!==void 0){const tt=getFinalKeyframe(_.keyframes,g);if(tt!==void 0)return frame.update(()=>{_.onUpdate(tt),_.onComplete()}),new GroupPlaybackControls([])}return!h&&AcceleratedAnimation.supports(_)?new AcceleratedAnimation(_):new MainThreadAnimation(_)};function shouldBlockAnimation({protectedKeys:e,needsAnimating:o},a){const s=e.hasOwnProperty(a)&&o[a]!==!0;return o[a]=!1,s}function animateTarget(e,o,{delay:a=0,transitionOverride:s,type:c}={}){var h;let{transition:d=e.getDefaultTransition(),transitionEnd:g,...b}=o;s&&(d=s);const j=[],_=c&&e.animationState&&e.animationState.getState()[c];for(const _e in b){const tt=e.getValue(_e,(h=e.latestValues[_e])!==null&&h!==void 0?h:null),it=b[_e];if(it===void 0||_&&shouldBlockAnimation(_,_e))continue;const st={delay:a,...getValueTransition(d||{},_e)};let ut=!1;if(window.MotionHandoffAnimation){const rt=getOptimisedAppearId(e);if(rt){const ot=window.MotionHandoffAnimation(rt,_e,frame);ot!==null&&(st.startTime=ot,ut=!0)}}addValueToWillChange(e,_e),tt.start(animateMotionValue(_e,tt,it,e.shouldReduceMotion&&positionalKeys.has(_e)?{type:!1}:st,e,ut));const ct=tt.animation;ct&&j.push(ct)}return g&&Promise.all(j).then(()=>{frame.update(()=>{g&&setTarget(e,g)})}),j}function animateVariant(e,o,a={}){var s;const c=resolveVariant(e,o,a.type==="exit"?(s=e.presenceContext)===null||s===void 0?void 0:s.custom:void 0);let{transition:h=e.getDefaultTransition()||{}}=c||{};a.transitionOverride&&(h=a.transitionOverride);const d=c?()=>Promise.all(animateTarget(e,c,a)):()=>Promise.resolve(),g=e.variantChildren&&e.variantChildren.size?(j=0)=>{const{delayChildren:_=0,staggerChildren:_e,staggerDirection:tt}=h;return animateChildren(e,o,_+j,_e,tt,a)}:()=>Promise.resolve(),{when:b}=h;if(b){const[j,_]=b==="beforeChildren"?[d,g]:[g,d];return j().then(()=>_())}else return Promise.all([d(),g(a.delay)])}function animateChildren(e,o,a=0,s=0,c=1,h){const d=[],g=(e.variantChildren.size-1)*s,b=c===1?(j=0)=>j*s:(j=0)=>g-j*s;return Array.from(e.variantChildren).sort(sortByTreeOrder).forEach((j,_)=>{j.notify("AnimationStart",o),d.push(animateVariant(j,o,{...h,delay:a+b(_)}).then(()=>j.notify("AnimationComplete",o)))}),Promise.all(d)}function sortByTreeOrder(e,o){return e.sortNodePosition(o)}function animateVisualElement(e,o,a={}){e.notify("AnimationStart",o);let s;if(Array.isArray(o)){const c=o.map(h=>animateVariant(e,h,a));s=Promise.all(c)}else if(typeof o=="string")s=animateVariant(e,o,a);else{const c=typeof o=="function"?resolveVariant(e,o,a.custom):o;s=Promise.all(animateTarget(e,c,a))}return s.then(()=>{e.notify("AnimationComplete",o)})}const numVariantProps=variantProps.length;function getVariantContext(e){if(!e)return;if(!e.isControllingVariants){const a=e.parent?getVariantContext(e.parent)||{}:{};return e.props.initial!==void 0&&(a.initial=e.props.initial),a}const o={};for(let a=0;a<numVariantProps;a++){const s=variantProps[a],c=e.props[s];(isVariantLabel(c)||c===!1)&&(o[s]=c)}return o}const reversePriorityOrder=[...variantPriorityOrder].reverse(),numAnimationTypes=variantPriorityOrder.length;function animateList(e){return o=>Promise.all(o.map(({animation:a,options:s})=>animateVisualElement(e,a,s)))}function createAnimationState(e){let o=animateList(e),a=createState(),s=!0;const c=b=>(j,_)=>{var _e;const tt=resolveVariant(e,_,b==="exit"?(_e=e.presenceContext)===null||_e===void 0?void 0:_e.custom:void 0);if(tt){const{transition:it,transitionEnd:st,...ut}=tt;j={...j,...ut,...st}}return j};function h(b){o=b(e)}function d(b){const{props:j}=e,_=getVariantContext(e.parent)||{},_e=[],tt=new Set;let it={},st=1/0;for(let ct=0;ct<numAnimationTypes;ct++){const rt=reversePriorityOrder[ct],ot=a[rt],lt=j[rt]!==void 0?j[rt]:_[rt],dt=isVariantLabel(lt),pt=rt===b?ot.isActive:null;pt===!1&&(st=ct);let gt=lt===_[rt]&&lt!==j[rt]&&dt;if(gt&&s&&e.manuallyAnimateOnMount&&(gt=!1),ot.protectedKeys={...it},!ot.isActive&&pt===null||!lt&&!ot.prevProp||isAnimationControls(lt)||typeof lt=="boolean")continue;const wt=checkVariantsDidChange(ot.prevProp,lt);let yt=wt||rt===b&&ot.isActive&&!gt&&dt||ct>st&&dt,St=!1;const xt=Array.isArray(lt)?lt:[lt];let Pt=xt.reduce(c(rt),{});pt===!1&&(Pt={});const{prevResolvedValues:Bt={}}=ot,Ot={...Bt,...Pt},Tt=kt=>{yt=!0,tt.has(kt)&&(St=!0,tt.delete(kt)),ot.needsAnimating[kt]=!0;const vt=e.getValue(kt);vt&&(vt.liveStyle=!1)};for(const kt in Ot){const vt=Pt[kt],bt=Bt[kt];if(it.hasOwnProperty(kt))continue;let Et=!1;isKeyframesTarget(vt)&&isKeyframesTarget(bt)?Et=!shallowCompare(vt,bt):Et=vt!==bt,Et?vt!=null?Tt(kt):tt.add(kt):vt!==void 0&&tt.has(kt)?Tt(kt):ot.protectedKeys[kt]=!0}ot.prevProp=lt,ot.prevResolvedValues=Pt,ot.isActive&&(it={...it,...Pt}),s&&e.blockInitialAnimation&&(yt=!1),yt&&(!(gt&&wt)||St)&&_e.push(...xt.map(kt=>({animation:kt,options:{type:rt}})))}if(tt.size){const ct={};tt.forEach(rt=>{const ot=e.getBaseTarget(rt),lt=e.getValue(rt);lt&&(lt.liveStyle=!0),ct[rt]=ot??null}),_e.push({animation:ct})}let ut=!!_e.length;return s&&(j.initial===!1||j.initial===j.animate)&&!e.manuallyAnimateOnMount&&(ut=!1),s=!1,ut?o(_e):Promise.resolve()}function g(b,j){var _;if(a[b].isActive===j)return Promise.resolve();(_=e.variantChildren)===null||_===void 0||_.forEach(tt=>{var it;return(it=tt.animationState)===null||it===void 0?void 0:it.setActive(b,j)}),a[b].isActive=j;const _e=d(b);for(const tt in a)a[tt].protectedKeys={};return _e}return{animateChanges:d,setActive:g,setAnimateFunction:h,getState:()=>a,reset:()=>{a=createState(),s=!0}}}function checkVariantsDidChange(e,o){return typeof o=="string"?o!==e:Array.isArray(o)?!shallowCompare(o,e):!1}function createTypeState(e=!1){return{isActive:e,protectedKeys:{},needsAnimating:{},prevResolvedValues:{}}}function createState(){return{animate:createTypeState(!0),whileInView:createTypeState(),whileHover:createTypeState(),whileTap:createTypeState(),whileDrag:createTypeState(),whileFocus:createTypeState(),exit:createTypeState()}}class Feature{constructor(o){this.isMounted=!1,this.node=o}update(){}}class AnimationFeature extends Feature{constructor(o){super(o),o.animationState||(o.animationState=createAnimationState(o))}updateAnimationControlsSubscription(){const{animate:o}=this.node.getProps();isAnimationControls(o)&&(this.unmountControls=o.subscribe(this.node))}mount(){this.updateAnimationControlsSubscription()}update(){const{animate:o}=this.node.getProps(),{animate:a}=this.node.prevProps||{};o!==a&&this.updateAnimationControlsSubscription()}unmount(){var o;this.node.animationState.reset(),(o=this.unmountControls)===null||o===void 0||o.call(this)}}let id$1=0;class ExitAnimationFeature extends Feature{constructor(){super(...arguments),this.id=id$1++}update(){if(!this.node.presenceContext)return;const{isPresent:o,onExitComplete:a}=this.node.presenceContext,{isPresent:s}=this.node.prevPresenceContext||{};if(!this.node.animationState||o===s)return;const c=this.node.animationState.setActive("exit",!o);a&&!o&&c.then(()=>a(this.id))}mount(){const{register:o}=this.node.presenceContext||{};o&&(this.unmount=o(this.id))}unmount(){}}const animations={animation:{Feature:AnimationFeature},exit:{Feature:ExitAnimationFeature}};function addDomEvent(e,o,a,s={passive:!0}){return e.addEventListener(o,a,s),()=>e.removeEventListener(o,a)}function extractEventInfo(e){return{point:{x:e.pageX,y:e.pageY}}}const addPointerInfo=e=>o=>isPrimaryPointer(o)&&e(o,extractEventInfo(o));function addPointerEvent(e,o,a,s){return addDomEvent(e,o,addPointerInfo(a),s)}const distance=(e,o)=>Math.abs(e-o);function distance2D(e,o){const a=distance(e.x,o.x),s=distance(e.y,o.y);return Math.sqrt(a**2+s**2)}class PanSession{constructor(o,a,{transformPagePoint:s,contextWindow:c,dragSnapToOrigin:h=!1}={}){if(this.startEvent=null,this.lastMoveEvent=null,this.lastMoveEventInfo=null,this.handlers={},this.contextWindow=window,this.updatePoint=()=>{if(!(this.lastMoveEvent&&this.lastMoveEventInfo))return;const _e=getPanInfo(this.lastMoveEventInfo,this.history),tt=this.startEvent!==null,it=distance2D(_e.offset,{x:0,y:0})>=3;if(!tt&&!it)return;const{point:st}=_e,{timestamp:ut}=frameData;this.history.push({...st,timestamp:ut});const{onStart:ct,onMove:rt}=this.handlers;tt||(ct&&ct(this.lastMoveEvent,_e),this.startEvent=this.lastMoveEvent),rt&&rt(this.lastMoveEvent,_e)},this.handlePointerMove=(_e,tt)=>{this.lastMoveEvent=_e,this.lastMoveEventInfo=transformPoint(tt,this.transformPagePoint),frame.update(this.updatePoint,!0)},this.handlePointerUp=(_e,tt)=>{this.end();const{onEnd:it,onSessionEnd:st,resumeAnimation:ut}=this.handlers;if(this.dragSnapToOrigin&&ut&&ut(),!(this.lastMoveEvent&&this.lastMoveEventInfo))return;const ct=getPanInfo(_e.type==="pointercancel"?this.lastMoveEventInfo:transformPoint(tt,this.transformPagePoint),this.history);this.startEvent&&it&&it(_e,ct),st&&st(_e,ct)},!isPrimaryPointer(o))return;this.dragSnapToOrigin=h,this.handlers=a,this.transformPagePoint=s,this.contextWindow=c||window;const d=extractEventInfo(o),g=transformPoint(d,this.transformPagePoint),{point:b}=g,{timestamp:j}=frameData;this.history=[{...b,timestamp:j}];const{onSessionStart:_}=a;_&&_(o,getPanInfo(g,this.history)),this.removeListeners=pipe(addPointerEvent(this.contextWindow,"pointermove",this.handlePointerMove),addPointerEvent(this.contextWindow,"pointerup",this.handlePointerUp),addPointerEvent(this.contextWindow,"pointercancel",this.handlePointerUp))}updateHandlers(o){this.handlers=o}end(){this.removeListeners&&this.removeListeners(),cancelFrame(this.updatePoint)}}function transformPoint(e,o){return o?{point:o(e.point)}:e}function subtractPoint(e,o){return{x:e.x-o.x,y:e.y-o.y}}function getPanInfo({point:e},o){return{point:e,delta:subtractPoint(e,lastDevicePoint(o)),offset:subtractPoint(e,startDevicePoint(o)),velocity:getVelocity(o,.1)}}function startDevicePoint(e){return e[0]}function lastDevicePoint(e){return e[e.length-1]}function getVelocity(e,o){if(e.length<2)return{x:0,y:0};let a=e.length-1,s=null;const c=lastDevicePoint(e);for(;a>=0&&(s=e[a],!(c.timestamp-s.timestamp>secondsToMilliseconds(o)));)a--;if(!s)return{x:0,y:0};const h=millisecondsToSeconds(c.timestamp-s.timestamp);if(h===0)return{x:0,y:0};const d={x:(c.x-s.x)/h,y:(c.y-s.y)/h};return d.x===1/0&&(d.x=0),d.y===1/0&&(d.y=0),d}const SCALE_PRECISION=1e-4,SCALE_MIN=1-SCALE_PRECISION,SCALE_MAX=1+SCALE_PRECISION,TRANSLATE_PRECISION=.01,TRANSLATE_MIN=0-TRANSLATE_PRECISION,TRANSLATE_MAX=0+TRANSLATE_PRECISION;function calcLength(e){return e.max-e.min}function isNear(e,o,a){return Math.abs(e-o)<=a}function calcAxisDelta(e,o,a,s=.5){e.origin=s,e.originPoint=mixNumber$1(o.min,o.max,e.origin),e.scale=calcLength(a)/calcLength(o),e.translate=mixNumber$1(a.min,a.max,e.origin)-e.originPoint,(e.scale>=SCALE_MIN&&e.scale<=SCALE_MAX||isNaN(e.scale))&&(e.scale=1),(e.translate>=TRANSLATE_MIN&&e.translate<=TRANSLATE_MAX||isNaN(e.translate))&&(e.translate=0)}function calcBoxDelta(e,o,a,s){calcAxisDelta(e.x,o.x,a.x,s?s.originX:void 0),calcAxisDelta(e.y,o.y,a.y,s?s.originY:void 0)}function calcRelativeAxis(e,o,a){e.min=a.min+o.min,e.max=e.min+calcLength(o)}function calcRelativeBox(e,o,a){calcRelativeAxis(e.x,o.x,a.x),calcRelativeAxis(e.y,o.y,a.y)}function calcRelativeAxisPosition(e,o,a){e.min=o.min-a.min,e.max=e.min+calcLength(o)}function calcRelativePosition(e,o,a){calcRelativeAxisPosition(e.x,o.x,a.x),calcRelativeAxisPosition(e.y,o.y,a.y)}function applyConstraints(e,{min:o,max:a},s){return o!==void 0&&e<o?e=s?mixNumber$1(o,e,s.min):Math.max(e,o):a!==void 0&&e>a&&(e=s?mixNumber$1(a,e,s.max):Math.min(e,a)),e}function calcRelativeAxisConstraints(e,o,a){return{min:o!==void 0?e.min+o:void 0,max:a!==void 0?e.max+a-(e.max-e.min):void 0}}function calcRelativeConstraints(e,{top:o,left:a,bottom:s,right:c}){return{x:calcRelativeAxisConstraints(e.x,a,c),y:calcRelativeAxisConstraints(e.y,o,s)}}function calcViewportAxisConstraints(e,o){let a=o.min-e.min,s=o.max-e.max;return o.max-o.min<e.max-e.min&&([a,s]=[s,a]),{min:a,max:s}}function calcViewportConstraints(e,o){return{x:calcViewportAxisConstraints(e.x,o.x),y:calcViewportAxisConstraints(e.y,o.y)}}function calcOrigin(e,o){let a=.5;const s=calcLength(e),c=calcLength(o);return c>s?a=progress(o.min,o.max-s,e.min):s>c&&(a=progress(e.min,e.max-c,o.min)),clamp(0,1,a)}function rebaseAxisConstraints(e,o){const a={};return o.min!==void 0&&(a.min=o.min-e.min),o.max!==void 0&&(a.max=o.max-e.min),a}const defaultElastic=.35;function resolveDragElastic(e=defaultElastic){return e===!1?e=0:e===!0&&(e=defaultElastic),{x:resolveAxisElastic(e,"left","right"),y:resolveAxisElastic(e,"top","bottom")}}function resolveAxisElastic(e,o,a){return{min:resolvePointElastic(e,o),max:resolvePointElastic(e,a)}}function resolvePointElastic(e,o){return typeof e=="number"?e:e[o]||0}const createAxisDelta=()=>({translate:0,scale:1,origin:0,originPoint:0}),createDelta=()=>({x:createAxisDelta(),y:createAxisDelta()}),createAxis=()=>({min:0,max:0}),createBox=()=>({x:createAxis(),y:createAxis()});function eachAxis(e){return[e("x"),e("y")]}function convertBoundingBoxToBox({top:e,left:o,right:a,bottom:s}){return{x:{min:o,max:a},y:{min:e,max:s}}}function convertBoxToBoundingBox({x:e,y:o}){return{top:o.min,right:e.max,bottom:o.max,left:e.min}}function transformBoxPoints(e,o){if(!o)return e;const a=o({x:e.left,y:e.top}),s=o({x:e.right,y:e.bottom});return{top:a.y,left:a.x,bottom:s.y,right:s.x}}function isIdentityScale(e){return e===void 0||e===1}function hasScale({scale:e,scaleX:o,scaleY:a}){return!isIdentityScale(e)||!isIdentityScale(o)||!isIdentityScale(a)}function hasTransform(e){return hasScale(e)||has2DTranslate(e)||e.z||e.rotate||e.rotateX||e.rotateY||e.skewX||e.skewY}function has2DTranslate(e){return is2DTranslate(e.x)||is2DTranslate(e.y)}function is2DTranslate(e){return e&&e!=="0%"}function scalePoint(e,o,a){const s=e-a,c=o*s;return a+c}function applyPointDelta(e,o,a,s,c){return c!==void 0&&(e=scalePoint(e,c,s)),scalePoint(e,a,s)+o}function applyAxisDelta(e,o=0,a=1,s,c){e.min=applyPointDelta(e.min,o,a,s,c),e.max=applyPointDelta(e.max,o,a,s,c)}function applyBoxDelta(e,{x:o,y:a}){applyAxisDelta(e.x,o.translate,o.scale,o.originPoint),applyAxisDelta(e.y,a.translate,a.scale,a.originPoint)}const TREE_SCALE_SNAP_MIN=.999999999999,TREE_SCALE_SNAP_MAX=1.0000000000001;function applyTreeDeltas(e,o,a,s=!1){const c=a.length;if(!c)return;o.x=o.y=1;let h,d;for(let g=0;g<c;g++){h=a[g],d=h.projectionDelta;const{visualElement:b}=h.options;b&&b.props.style&&b.props.style.display==="contents"||(s&&h.options.layoutScroll&&h.scroll&&h!==h.root&&transformBox(e,{x:-h.scroll.offset.x,y:-h.scroll.offset.y}),d&&(o.x*=d.x.scale,o.y*=d.y.scale,applyBoxDelta(e,d)),s&&hasTransform(h.latestValues)&&transformBox(e,h.latestValues))}o.x<TREE_SCALE_SNAP_MAX&&o.x>TREE_SCALE_SNAP_MIN&&(o.x=1),o.y<TREE_SCALE_SNAP_MAX&&o.y>TREE_SCALE_SNAP_MIN&&(o.y=1)}function translateAxis(e,o){e.min=e.min+o,e.max=e.max+o}function transformAxis(e,o,a,s,c=.5){const h=mixNumber$1(e.min,e.max,c);applyAxisDelta(e,o,a,h,s)}function transformBox(e,o){transformAxis(e.x,o.x,o.scaleX,o.scale,o.originX),transformAxis(e.y,o.y,o.scaleY,o.scale,o.originY)}function measureViewportBox(e,o){return convertBoundingBoxToBox(transformBoxPoints(e.getBoundingClientRect(),o))}function measurePageBox(e,o,a){const s=measureViewportBox(e,a),{scroll:c}=o;return c&&(translateAxis(s.x,c.offset.x),translateAxis(s.y,c.offset.y)),s}const getContextWindow=({current:e})=>e?e.ownerDocument.defaultView:null,elementDragControls=new WeakMap;class VisualElementDragControls{constructor(o){this.openDragLock=null,this.isDragging=!1,this.currentDirection=null,this.originPoint={x:0,y:0},this.constraints=!1,this.hasMutatedConstraints=!1,this.elastic=createBox(),this.visualElement=o}start(o,{snapToCursor:a=!1}={}){const{presenceContext:s}=this.visualElement;if(s&&s.isPresent===!1)return;const c=_=>{const{dragSnapToOrigin:_e}=this.getProps();_e?this.pauseAnimation():this.stopAnimation(),a&&this.snapToCursor(extractEventInfo(_).point)},h=(_,_e)=>{const{drag:tt,dragPropagation:it,onDragStart:st}=this.getProps();if(tt&&!it&&(this.openDragLock&&this.openDragLock(),this.openDragLock=setDragLock(tt),!this.openDragLock))return;this.isDragging=!0,this.currentDirection=null,this.resolveConstraints(),this.visualElement.projection&&(this.visualElement.projection.isAnimationBlocked=!0,this.visualElement.projection.target=void 0),eachAxis(ct=>{let rt=this.getAxisMotionValue(ct).get()||0;if(percent.test(rt)){const{projection:ot}=this.visualElement;if(ot&&ot.layout){const lt=ot.layout.layoutBox[ct];lt&&(rt=calcLength(lt)*(parseFloat(rt)/100))}}this.originPoint[ct]=rt}),st&&frame.postRender(()=>st(_,_e)),addValueToWillChange(this.visualElement,"transform");const{animationState:ut}=this.visualElement;ut&&ut.setActive("whileDrag",!0)},d=(_,_e)=>{const{dragPropagation:tt,dragDirectionLock:it,onDirectionLock:st,onDrag:ut}=this.getProps();if(!tt&&!this.openDragLock)return;const{offset:ct}=_e;if(it&&this.currentDirection===null){this.currentDirection=getCurrentDirection(ct),this.currentDirection!==null&&st&&st(this.currentDirection);return}this.updateAxis("x",_e.point,ct),this.updateAxis("y",_e.point,ct),this.visualElement.render(),ut&&ut(_,_e)},g=(_,_e)=>this.stop(_,_e),b=()=>eachAxis(_=>{var _e;return this.getAnimationState(_)==="paused"&&((_e=this.getAxisMotionValue(_).animation)===null||_e===void 0?void 0:_e.play())}),{dragSnapToOrigin:j}=this.getProps();this.panSession=new PanSession(o,{onSessionStart:c,onStart:h,onMove:d,onSessionEnd:g,resumeAnimation:b},{transformPagePoint:this.visualElement.getTransformPagePoint(),dragSnapToOrigin:j,contextWindow:getContextWindow(this.visualElement)})}stop(o,a){const s=this.isDragging;if(this.cancel(),!s)return;const{velocity:c}=a;this.startAnimation(c);const{onDragEnd:h}=this.getProps();h&&frame.postRender(()=>h(o,a))}cancel(){this.isDragging=!1;const{projection:o,animationState:a}=this.visualElement;o&&(o.isAnimationBlocked=!1),this.panSession&&this.panSession.end(),this.panSession=void 0;const{dragPropagation:s}=this.getProps();!s&&this.openDragLock&&(this.openDragLock(),this.openDragLock=null),a&&a.setActive("whileDrag",!1)}updateAxis(o,a,s){const{drag:c}=this.getProps();if(!s||!shouldDrag(o,c,this.currentDirection))return;const h=this.getAxisMotionValue(o);let d=this.originPoint[o]+s[o];this.constraints&&this.constraints[o]&&(d=applyConstraints(d,this.constraints[o],this.elastic[o])),h.set(d)}resolveConstraints(){var o;const{dragConstraints:a,dragElastic:s}=this.getProps(),c=this.visualElement.projection&&!this.visualElement.projection.layout?this.visualElement.projection.measure(!1):(o=this.visualElement.projection)===null||o===void 0?void 0:o.layout,h=this.constraints;a&&isRefObject(a)?this.constraints||(this.constraints=this.resolveRefConstraints()):a&&c?this.constraints=calcRelativeConstraints(c.layoutBox,a):this.constraints=!1,this.elastic=resolveDragElastic(s),h!==this.constraints&&c&&this.constraints&&!this.hasMutatedConstraints&&eachAxis(d=>{this.constraints!==!1&&this.getAxisMotionValue(d)&&(this.constraints[d]=rebaseAxisConstraints(c.layoutBox[d],this.constraints[d]))})}resolveRefConstraints(){const{dragConstraints:o,onMeasureDragConstraints:a}=this.getProps();if(!o||!isRefObject(o))return!1;const s=o.current,{projection:c}=this.visualElement;if(!c||!c.layout)return!1;const h=measurePageBox(s,c.root,this.visualElement.getTransformPagePoint());let d=calcViewportConstraints(c.layout.layoutBox,h);if(a){const g=a(convertBoxToBoundingBox(d));this.hasMutatedConstraints=!!g,g&&(d=convertBoundingBoxToBox(g))}return d}startAnimation(o){const{drag:a,dragMomentum:s,dragElastic:c,dragTransition:h,dragSnapToOrigin:d,onDragTransitionEnd:g}=this.getProps(),b=this.constraints||{},j=eachAxis(_=>{if(!shouldDrag(_,a,this.currentDirection))return;let _e=b&&b[_]||{};d&&(_e={min:0,max:0});const tt=c?200:1e6,it=c?40:1e7,st={type:"inertia",velocity:s?o[_]:0,bounceStiffness:tt,bounceDamping:it,timeConstant:750,restDelta:1,restSpeed:10,...h,..._e};return this.startAxisValueAnimation(_,st)});return Promise.all(j).then(g)}startAxisValueAnimation(o,a){const s=this.getAxisMotionValue(o);return addValueToWillChange(this.visualElement,o),s.start(animateMotionValue(o,s,0,a,this.visualElement,!1))}stopAnimation(){eachAxis(o=>this.getAxisMotionValue(o).stop())}pauseAnimation(){eachAxis(o=>{var a;return(a=this.getAxisMotionValue(o).animation)===null||a===void 0?void 0:a.pause()})}getAnimationState(o){var a;return(a=this.getAxisMotionValue(o).animation)===null||a===void 0?void 0:a.state}getAxisMotionValue(o){const a=`_drag${o.toUpperCase()}`,s=this.visualElement.getProps(),c=s[a];return c||this.visualElement.getValue(o,(s.initial?s.initial[o]:void 0)||0)}snapToCursor(o){eachAxis(a=>{const{drag:s}=this.getProps();if(!shouldDrag(a,s,this.currentDirection))return;const{projection:c}=this.visualElement,h=this.getAxisMotionValue(a);if(c&&c.layout){const{min:d,max:g}=c.layout.layoutBox[a];h.set(o[a]-mixNumber$1(d,g,.5))}})}scalePositionWithinConstraints(){if(!this.visualElement.current)return;const{drag:o,dragConstraints:a}=this.getProps(),{projection:s}=this.visualElement;if(!isRefObject(a)||!s||!this.constraints)return;this.stopAnimation();const c={x:0,y:0};eachAxis(d=>{const g=this.getAxisMotionValue(d);if(g&&this.constraints!==!1){const b=g.get();c[d]=calcOrigin({min:b,max:b},this.constraints[d])}});const{transformTemplate:h}=this.visualElement.getProps();this.visualElement.current.style.transform=h?h({},""):"none",s.root&&s.root.updateScroll(),s.updateLayout(),this.resolveConstraints(),eachAxis(d=>{if(!shouldDrag(d,o,null))return;const g=this.getAxisMotionValue(d),{min:b,max:j}=this.constraints[d];g.set(mixNumber$1(b,j,c[d]))})}addListeners(){if(!this.visualElement.current)return;elementDragControls.set(this.visualElement,this);const o=this.visualElement.current,a=addPointerEvent(o,"pointerdown",b=>{const{drag:j,dragListener:_=!0}=this.getProps();j&&_&&this.start(b)}),s=()=>{const{dragConstraints:b}=this.getProps();isRefObject(b)&&b.current&&(this.constraints=this.resolveRefConstraints())},{projection:c}=this.visualElement,h=c.addEventListener("measure",s);c&&!c.layout&&(c.root&&c.root.updateScroll(),c.updateLayout()),frame.read(s);const d=addDomEvent(window,"resize",()=>this.scalePositionWithinConstraints()),g=c.addEventListener("didUpdate",({delta:b,hasLayoutChanged:j})=>{this.isDragging&&j&&(eachAxis(_=>{const _e=this.getAxisMotionValue(_);_e&&(this.originPoint[_]+=b[_].translate,_e.set(_e.get()+b[_].translate))}),this.visualElement.render())});return()=>{d(),a(),h(),g&&g()}}getProps(){const o=this.visualElement.getProps(),{drag:a=!1,dragDirectionLock:s=!1,dragPropagation:c=!1,dragConstraints:h=!1,dragElastic:d=defaultElastic,dragMomentum:g=!0}=o;return{...o,drag:a,dragDirectionLock:s,dragPropagation:c,dragConstraints:h,dragElastic:d,dragMomentum:g}}}function shouldDrag(e,o,a){return(o===!0||o===e)&&(a===null||a===e)}function getCurrentDirection(e,o=10){let a=null;return Math.abs(e.y)>o?a="y":Math.abs(e.x)>o&&(a="x"),a}class DragGesture extends Feature{constructor(o){super(o),this.removeGroupControls=noop,this.removeListeners=noop,this.controls=new VisualElementDragControls(o)}mount(){const{dragControls:o}=this.node.getProps();o&&(this.removeGroupControls=o.subscribe(this.controls)),this.removeListeners=this.controls.addListeners()||noop}unmount(){this.removeGroupControls(),this.removeListeners()}}const asyncHandler=e=>(o,a)=>{e&&frame.postRender(()=>e(o,a))};class PanGesture extends Feature{constructor(){super(...arguments),this.removePointerDownListener=noop}onPointerDown(o){this.session=new PanSession(o,this.createPanHandlers(),{transformPagePoint:this.node.getTransformPagePoint(),contextWindow:getContextWindow(this.node)})}createPanHandlers(){const{onPanSessionStart:o,onPanStart:a,onPan:s,onPanEnd:c}=this.node.getProps();return{onSessionStart:asyncHandler(o),onStart:asyncHandler(a),onMove:s,onEnd:(h,d)=>{delete this.session,c&&frame.postRender(()=>c(h,d))}}}mount(){this.removePointerDownListener=addPointerEvent(this.node.current,"pointerdown",o=>this.onPointerDown(o))}update(){this.session&&this.session.updateHandlers(this.createPanHandlers())}unmount(){this.removePointerDownListener(),this.session&&this.session.end()}}const globalProjectionState={hasAnimatedSinceResize:!0,hasEverUpdated:!1};function pixelsToPercent(e,o){return o.max===o.min?0:e/(o.max-o.min)*100}const correctBorderRadius={correct:(e,o)=>{if(!o.target)return e;if(typeof e=="string")if(px.test(e))e=parseFloat(e);else return e;const a=pixelsToPercent(e,o.target.x),s=pixelsToPercent(e,o.target.y);return`${a}% ${s}%`}},correctBoxShadow={correct:(e,{treeScale:o,projectionDelta:a})=>{const s=e,c=complex.parse(e);if(c.length>5)return s;const h=complex.createTransformer(e),d=typeof c[0]!="number"?1:0,g=a.x.scale*o.x,b=a.y.scale*o.y;c[0+d]/=g,c[1+d]/=b;const j=mixNumber$1(g,b,.5);return typeof c[2+d]=="number"&&(c[2+d]/=j),typeof c[3+d]=="number"&&(c[3+d]/=j),h(c)}};class MeasureLayoutWithContext extends reactExports.Component{componentDidMount(){const{visualElement:o,layoutGroup:a,switchLayoutGroup:s,layoutId:c}=this.props,{projection:h}=o;addScaleCorrector(defaultScaleCorrectors),h&&(a.group&&a.group.add(h),s&&s.register&&c&&s.register(h),h.root.didUpdate(),h.addEventListener("animationComplete",()=>{this.safeToRemove()}),h.setOptions({...h.options,onExitComplete:()=>this.safeToRemove()})),globalProjectionState.hasEverUpdated=!0}getSnapshotBeforeUpdate(o){const{layoutDependency:a,visualElement:s,drag:c,isPresent:h}=this.props,d=s.projection;return d&&(d.isPresent=h,c||o.layoutDependency!==a||a===void 0?d.willUpdate():this.safeToRemove(),o.isPresent!==h&&(h?d.promote():d.relegate()||frame.postRender(()=>{const g=d.getStack();(!g||!g.members.length)&&this.safeToRemove()}))),null}componentDidUpdate(){const{projection:o}=this.props.visualElement;o&&(o.root.didUpdate(),microtask.postRender(()=>{!o.currentAnimation&&o.isLead()&&this.safeToRemove()}))}componentWillUnmount(){const{visualElement:o,layoutGroup:a,switchLayoutGroup:s}=this.props,{projection:c}=o;c&&(c.scheduleCheckAfterUnmount(),a&&a.group&&a.group.remove(c),s&&s.deregister&&s.deregister(c))}safeToRemove(){const{safeToRemove:o}=this.props;o&&o()}render(){return null}}function MeasureLayout(e){const[o,a]=usePresence(),s=reactExports.useContext(LayoutGroupContext);return jsxRuntimeExports.jsx(MeasureLayoutWithContext,{...e,layoutGroup:s,switchLayoutGroup:reactExports.useContext(SwitchLayoutGroupContext),isPresent:o,safeToRemove:a})}const defaultScaleCorrectors={borderRadius:{...correctBorderRadius,applyTo:["borderTopLeftRadius","borderTopRightRadius","borderBottomLeftRadius","borderBottomRightRadius"]},borderTopLeftRadius:correctBorderRadius,borderTopRightRadius:correctBorderRadius,borderBottomLeftRadius:correctBorderRadius,borderBottomRightRadius:correctBorderRadius,boxShadow:correctBoxShadow};function animateSingleValue(e,o,a){const s=isMotionValue(e)?e:motionValue(e);return s.start(animateMotionValue("",s,o,a)),s.animation}function isSVGElement(e){return e instanceof SVGElement&&e.tagName!=="svg"}const compareByDepth=(e,o)=>e.depth-o.depth;class FlatTree{constructor(){this.children=[],this.isDirty=!1}add(o){addUniqueItem(this.children,o),this.isDirty=!0}remove(o){removeItem(this.children,o),this.isDirty=!0}forEach(o){this.isDirty&&this.children.sort(compareByDepth),this.isDirty=!1,this.children.forEach(o)}}function delay(e,o){const a=time.now(),s=({timestamp:c})=>{const h=c-a;h>=o&&(cancelFrame(s),e(h-o))};return frame.read(s,!0),()=>cancelFrame(s)}const borders=["TopLeft","TopRight","BottomLeft","BottomRight"],numBorders=borders.length,asNumber=e=>typeof e=="string"?parseFloat(e):e,isPx=e=>typeof e=="number"||px.test(e);function mixValues(e,o,a,s,c,h){c?(e.opacity=mixNumber$1(0,a.opacity!==void 0?a.opacity:1,easeCrossfadeIn(s)),e.opacityExit=mixNumber$1(o.opacity!==void 0?o.opacity:1,0,easeCrossfadeOut(s))):h&&(e.opacity=mixNumber$1(o.opacity!==void 0?o.opacity:1,a.opacity!==void 0?a.opacity:1,s));for(let d=0;d<numBorders;d++){const g=`border${borders[d]}Radius`;let b=getRadius(o,g),j=getRadius(a,g);if(b===void 0&&j===void 0)continue;b||(b=0),j||(j=0),b===0||j===0||isPx(b)===isPx(j)?(e[g]=Math.max(mixNumber$1(asNumber(b),asNumber(j),s),0),(percent.test(j)||percent.test(b))&&(e[g]+="%")):e[g]=j}(o.rotate||a.rotate)&&(e.rotate=mixNumber$1(o.rotate||0,a.rotate||0,s))}function getRadius(e,o){return e[o]!==void 0?e[o]:e.borderRadius}const easeCrossfadeIn=compress(0,.5,circOut),easeCrossfadeOut=compress(.5,.95,noop);function compress(e,o,a){return s=>s<e?0:s>o?1:a(progress(e,o,s))}function copyAxisInto(e,o){e.min=o.min,e.max=o.max}function copyBoxInto(e,o){copyAxisInto(e.x,o.x),copyAxisInto(e.y,o.y)}function copyAxisDeltaInto(e,o){e.translate=o.translate,e.scale=o.scale,e.originPoint=o.originPoint,e.origin=o.origin}function removePointDelta(e,o,a,s,c){return e-=o,e=scalePoint(e,1/a,s),c!==void 0&&(e=scalePoint(e,1/c,s)),e}function removeAxisDelta(e,o=0,a=1,s=.5,c,h=e,d=e){if(percent.test(o)&&(o=parseFloat(o),o=mixNumber$1(d.min,d.max,o/100)-d.min),typeof o!="number")return;let g=mixNumber$1(h.min,h.max,s);e===h&&(g-=o),e.min=removePointDelta(e.min,o,a,g,c),e.max=removePointDelta(e.max,o,a,g,c)}function removeAxisTransforms(e,o,[a,s,c],h,d){removeAxisDelta(e,o[a],o[s],o[c],o.scale,h,d)}const xKeys=["x","scaleX","originX"],yKeys=["y","scaleY","originY"];function removeBoxTransforms(e,o,a,s){removeAxisTransforms(e.x,o,xKeys,a?a.x:void 0,s?s.x:void 0),removeAxisTransforms(e.y,o,yKeys,a?a.y:void 0,s?s.y:void 0)}function isAxisDeltaZero(e){return e.translate===0&&e.scale===1}function isDeltaZero(e){return isAxisDeltaZero(e.x)&&isAxisDeltaZero(e.y)}function axisEquals(e,o){return e.min===o.min&&e.max===o.max}function boxEquals(e,o){return axisEquals(e.x,o.x)&&axisEquals(e.y,o.y)}function axisEqualsRounded(e,o){return Math.round(e.min)===Math.round(o.min)&&Math.round(e.max)===Math.round(o.max)}function boxEqualsRounded(e,o){return axisEqualsRounded(e.x,o.x)&&axisEqualsRounded(e.y,o.y)}function aspectRatio(e){return calcLength(e.x)/calcLength(e.y)}function axisDeltaEquals(e,o){return e.translate===o.translate&&e.scale===o.scale&&e.originPoint===o.originPoint}class NodeStack{constructor(){this.members=[]}add(o){addUniqueItem(this.members,o),o.scheduleRender()}remove(o){if(removeItem(this.members,o),o===this.prevLead&&(this.prevLead=void 0),o===this.lead){const a=this.members[this.members.length-1];a&&this.promote(a)}}relegate(o){const a=this.members.findIndex(c=>o===c);if(a===0)return!1;let s;for(let c=a;c>=0;c--){const h=this.members[c];if(h.isPresent!==!1){s=h;break}}return s?(this.promote(s),!0):!1}promote(o,a){const s=this.lead;if(o!==s&&(this.prevLead=s,this.lead=o,o.show(),s)){s.instance&&s.scheduleRender(),o.scheduleRender(),o.resumeFrom=s,a&&(o.resumeFrom.preserveOpacity=!0),s.snapshot&&(o.snapshot=s.snapshot,o.snapshot.latestValues=s.animationValues||s.latestValues),o.root&&o.root.isUpdating&&(o.isLayoutDirty=!0);const{crossfade:c}=o.options;c===!1&&s.hide()}}exitAnimationComplete(){this.members.forEach(o=>{const{options:a,resumingFrom:s}=o;a.onExitComplete&&a.onExitComplete(),s&&s.options.onExitComplete&&s.options.onExitComplete()})}scheduleRender(){this.members.forEach(o=>{o.instance&&o.scheduleRender(!1)})}removeLeadSnapshot(){this.lead&&this.lead.snapshot&&(this.lead.snapshot=void 0)}}function buildProjectionTransform(e,o,a){let s="";const c=e.x.translate/o.x,h=e.y.translate/o.y,d=(a==null?void 0:a.z)||0;if((c||h||d)&&(s=`translate3d(${c}px, ${h}px, ${d}px) `),(o.x!==1||o.y!==1)&&(s+=`scale(${1/o.x}, ${1/o.y}) `),a){const{transformPerspective:j,rotate:_,rotateX:_e,rotateY:tt,skewX:it,skewY:st}=a;j&&(s=`perspective(${j}px) ${s}`),_&&(s+=`rotate(${_}deg) `),_e&&(s+=`rotateX(${_e}deg) `),tt&&(s+=`rotateY(${tt}deg) `),it&&(s+=`skewX(${it}deg) `),st&&(s+=`skewY(${st}deg) `)}const g=e.x.scale*o.x,b=e.y.scale*o.y;return(g!==1||b!==1)&&(s+=`scale(${g}, ${b})`),s||"none"}const metrics={type:"projectionFrame",totalNodes:0,resolvedTargetDeltas:0,recalculatedProjection:0},isDebug=typeof window<"u"&&window.MotionDebug!==void 0,transformAxes=["","X","Y","Z"],hiddenVisibility={visibility:"hidden"},animationTarget=1e3;let id=0;function resetDistortingTransform(e,o,a,s){const{latestValues:c}=o;c[e]&&(a[e]=c[e],o.setStaticValue(e,0),s&&(s[e]=0))}function cancelTreeOptimisedTransformAnimations(e){if(e.hasCheckedOptimisedAppear=!0,e.root===e)return;const{visualElement:o}=e.options;if(!o)return;const a=getOptimisedAppearId(o);if(window.MotionHasOptimisedAnimation(a,"transform")){const{layout:c,layoutId:h}=e.options;window.MotionCancelOptimisedAnimation(a,"transform",frame,!(c||h))}const{parent:s}=e;s&&!s.hasCheckedOptimisedAppear&&cancelTreeOptimisedTransformAnimations(s)}function createProjectionNode({attachResizeListener:e,defaultParent:o,measureScroll:a,checkIsScrollRoot:s,resetTransform:c}){return class{constructor(d={},g=o==null?void 0:o()){this.id=id++,this.animationId=0,this.children=new Set,this.options={},this.isTreeAnimating=!1,this.isAnimationBlocked=!1,this.isLayoutDirty=!1,this.isProjectionDirty=!1,this.isSharedProjectionDirty=!1,this.isTransformDirty=!1,this.updateManuallyBlocked=!1,this.updateBlockedByResize=!1,this.isUpdating=!1,this.isSVG=!1,this.needsReset=!1,this.shouldResetTransform=!1,this.hasCheckedOptimisedAppear=!1,this.treeScale={x:1,y:1},this.eventHandlers=new Map,this.hasTreeAnimated=!1,this.updateScheduled=!1,this.scheduleUpdate=()=>this.update(),this.projectionUpdateScheduled=!1,this.checkUpdateFailed=()=>{this.isUpdating&&(this.isUpdating=!1,this.clearAllSnapshots())},this.updateProjection=()=>{this.projectionUpdateScheduled=!1,isDebug&&(metrics.totalNodes=metrics.resolvedTargetDeltas=metrics.recalculatedProjection=0),this.nodes.forEach(propagateDirtyNodes),this.nodes.forEach(resolveTargetDelta),this.nodes.forEach(calcProjection),this.nodes.forEach(cleanDirtyNodes),isDebug&&window.MotionDebug.record(metrics)},this.resolvedRelativeTargetAt=0,this.hasProjected=!1,this.isVisible=!0,this.animationProgress=0,this.sharedNodes=new Map,this.latestValues=d,this.root=g?g.root||g:this,this.path=g?[...g.path,g]:[],this.parent=g,this.depth=g?g.depth+1:0;for(let b=0;b<this.path.length;b++)this.path[b].shouldResetTransform=!0;this.root===this&&(this.nodes=new FlatTree)}addEventListener(d,g){return this.eventHandlers.has(d)||this.eventHandlers.set(d,new SubscriptionManager),this.eventHandlers.get(d).add(g)}notifyListeners(d,...g){const b=this.eventHandlers.get(d);b&&b.notify(...g)}hasListeners(d){return this.eventHandlers.has(d)}mount(d,g=this.root.hasTreeAnimated){if(this.instance)return;this.isSVG=isSVGElement(d),this.instance=d;const{layoutId:b,layout:j,visualElement:_}=this.options;if(_&&!_.current&&_.mount(d),this.root.nodes.add(this),this.parent&&this.parent.children.add(this),g&&(j||b)&&(this.isLayoutDirty=!0),e){let _e;const tt=()=>this.root.updateBlockedByResize=!1;e(d,()=>{this.root.updateBlockedByResize=!0,_e&&_e(),_e=delay(tt,250),globalProjectionState.hasAnimatedSinceResize&&(globalProjectionState.hasAnimatedSinceResize=!1,this.nodes.forEach(finishAnimation))})}b&&this.root.registerSharedNode(b,this),this.options.animate!==!1&&_&&(b||j)&&this.addEventListener("didUpdate",({delta:_e,hasLayoutChanged:tt,hasRelativeTargetChanged:it,layout:st})=>{if(this.isTreeAnimationBlocked()){this.target=void 0,this.relativeTarget=void 0;return}const ut=this.options.transition||_.getDefaultTransition()||defaultLayoutTransition,{onLayoutAnimationStart:ct,onLayoutAnimationComplete:rt}=_.getProps(),ot=!this.targetLayout||!boxEqualsRounded(this.targetLayout,st)||it,lt=!tt&&it;if(this.options.layoutRoot||this.resumeFrom&&this.resumeFrom.instance||lt||tt&&(ot||!this.currentAnimation)){this.resumeFrom&&(this.resumingFrom=this.resumeFrom,this.resumingFrom.resumingFrom=void 0),this.setAnimationOrigin(_e,lt);const dt={...getValueTransition(ut,"layout"),onPlay:ct,onComplete:rt};(_.shouldReduceMotion||this.options.layoutRoot)&&(dt.delay=0,dt.type=!1),this.startAnimation(dt)}else tt||finishAnimation(this),this.isLead()&&this.options.onExitComplete&&this.options.onExitComplete();this.targetLayout=st})}unmount(){this.options.layoutId&&this.willUpdate(),this.root.nodes.remove(this);const d=this.getStack();d&&d.remove(this),this.parent&&this.parent.children.delete(this),this.instance=void 0,cancelFrame(this.updateProjection)}blockUpdate(){this.updateManuallyBlocked=!0}unblockUpdate(){this.updateManuallyBlocked=!1}isUpdateBlocked(){return this.updateManuallyBlocked||this.updateBlockedByResize}isTreeAnimationBlocked(){return this.isAnimationBlocked||this.parent&&this.parent.isTreeAnimationBlocked()||!1}startUpdate(){this.isUpdateBlocked()||(this.isUpdating=!0,this.nodes&&this.nodes.forEach(resetSkewAndRotation),this.animationId++)}getTransformTemplate(){const{visualElement:d}=this.options;return d&&d.getProps().transformTemplate}willUpdate(d=!0){if(this.root.hasTreeAnimated=!0,this.root.isUpdateBlocked()){this.options.onExitComplete&&this.options.onExitComplete();return}if(window.MotionCancelOptimisedAnimation&&!this.hasCheckedOptimisedAppear&&cancelTreeOptimisedTransformAnimations(this),!this.root.isUpdating&&this.root.startUpdate(),this.isLayoutDirty)return;this.isLayoutDirty=!0;for(let _=0;_<this.path.length;_++){const _e=this.path[_];_e.shouldResetTransform=!0,_e.updateScroll("snapshot"),_e.options.layoutRoot&&_e.willUpdate(!1)}const{layoutId:g,layout:b}=this.options;if(g===void 0&&!b)return;const j=this.getTransformTemplate();this.prevTransformTemplateValue=j?j(this.latestValues,""):void 0,this.updateSnapshot(),d&&this.notifyListeners("willUpdate")}update(){if(this.updateScheduled=!1,this.isUpdateBlocked()){this.unblockUpdate(),this.clearAllSnapshots(),this.nodes.forEach(clearMeasurements);return}this.isUpdating||this.nodes.forEach(clearIsLayoutDirty),this.isUpdating=!1,this.nodes.forEach(resetTransformStyle),this.nodes.forEach(updateLayout),this.nodes.forEach(notifyLayoutUpdate),this.clearAllSnapshots();const g=time.now();frameData.delta=clamp(0,1e3/60,g-frameData.timestamp),frameData.timestamp=g,frameData.isProcessing=!0,frameSteps.update.process(frameData),frameSteps.preRender.process(frameData),frameSteps.render.process(frameData),frameData.isProcessing=!1}didUpdate(){this.updateScheduled||(this.updateScheduled=!0,microtask.read(this.scheduleUpdate))}clearAllSnapshots(){this.nodes.forEach(clearSnapshot),this.sharedNodes.forEach(removeLeadSnapshots)}scheduleUpdateProjection(){this.projectionUpdateScheduled||(this.projectionUpdateScheduled=!0,frame.preRender(this.updateProjection,!1,!0))}scheduleCheckAfterUnmount(){frame.postRender(()=>{this.isLayoutDirty?this.root.didUpdate():this.root.checkUpdateFailed()})}updateSnapshot(){this.snapshot||!this.instance||(this.snapshot=this.measure())}updateLayout(){if(!this.instance||(this.updateScroll(),!(this.options.alwaysMeasureLayout&&this.isLead())&&!this.isLayoutDirty))return;if(this.resumeFrom&&!this.resumeFrom.instance)for(let b=0;b<this.path.length;b++)this.path[b].updateScroll();const d=this.layout;this.layout=this.measure(!1),this.layoutCorrected=createBox(),this.isLayoutDirty=!1,this.projectionDelta=void 0,this.notifyListeners("measure",this.layout.layoutBox);const{visualElement:g}=this.options;g&&g.notify("LayoutMeasure",this.layout.layoutBox,d?d.layoutBox:void 0)}updateScroll(d="measure"){let g=!!(this.options.layoutScroll&&this.instance);if(this.scroll&&this.scroll.animationId===this.root.animationId&&this.scroll.phase===d&&(g=!1),g){const b=s(this.instance);this.scroll={animationId:this.root.animationId,phase:d,isRoot:b,offset:a(this.instance),wasRoot:this.scroll?this.scroll.isRoot:b}}}resetTransform(){if(!c)return;const d=this.isLayoutDirty||this.shouldResetTransform||this.options.alwaysMeasureLayout,g=this.projectionDelta&&!isDeltaZero(this.projectionDelta),b=this.getTransformTemplate(),j=b?b(this.latestValues,""):void 0,_=j!==this.prevTransformTemplateValue;d&&(g||hasTransform(this.latestValues)||_)&&(c(this.instance,j),this.shouldResetTransform=!1,this.scheduleRender())}measure(d=!0){const g=this.measurePageBox();let b=this.removeElementScroll(g);return d&&(b=this.removeTransform(b)),roundBox(b),{animationId:this.root.animationId,measuredBox:g,layoutBox:b,latestValues:{},source:this.id}}measurePageBox(){var d;const{visualElement:g}=this.options;if(!g)return createBox();const b=g.measureViewportBox();if(!(((d=this.scroll)===null||d===void 0?void 0:d.wasRoot)||this.path.some(checkNodeWasScrollRoot))){const{scroll:_}=this.root;_&&(translateAxis(b.x,_.offset.x),translateAxis(b.y,_.offset.y))}return b}removeElementScroll(d){var g;const b=createBox();if(copyBoxInto(b,d),!((g=this.scroll)===null||g===void 0)&&g.wasRoot)return b;for(let j=0;j<this.path.length;j++){const _=this.path[j],{scroll:_e,options:tt}=_;_!==this.root&&_e&&tt.layoutScroll&&(_e.wasRoot&&copyBoxInto(b,d),translateAxis(b.x,_e.offset.x),translateAxis(b.y,_e.offset.y))}return b}applyTransform(d,g=!1){const b=createBox();copyBoxInto(b,d);for(let j=0;j<this.path.length;j++){const _=this.path[j];!g&&_.options.layoutScroll&&_.scroll&&_!==_.root&&transformBox(b,{x:-_.scroll.offset.x,y:-_.scroll.offset.y}),hasTransform(_.latestValues)&&transformBox(b,_.latestValues)}return hasTransform(this.latestValues)&&transformBox(b,this.latestValues),b}removeTransform(d){const g=createBox();copyBoxInto(g,d);for(let b=0;b<this.path.length;b++){const j=this.path[b];if(!j.instance||!hasTransform(j.latestValues))continue;hasScale(j.latestValues)&&j.updateSnapshot();const _=createBox(),_e=j.measurePageBox();copyBoxInto(_,_e),removeBoxTransforms(g,j.latestValues,j.snapshot?j.snapshot.layoutBox:void 0,_)}return hasTransform(this.latestValues)&&removeBoxTransforms(g,this.latestValues),g}setTargetDelta(d){this.targetDelta=d,this.root.scheduleUpdateProjection(),this.isProjectionDirty=!0}setOptions(d){this.options={...this.options,...d,crossfade:d.crossfade!==void 0?d.crossfade:!0}}clearMeasurements(){this.scroll=void 0,this.layout=void 0,this.snapshot=void 0,this.prevTransformTemplateValue=void 0,this.targetDelta=void 0,this.target=void 0,this.isLayoutDirty=!1}forceRelativeParentToResolveTarget(){this.relativeParent&&this.relativeParent.resolvedRelativeTargetAt!==frameData.timestamp&&this.relativeParent.resolveTargetDelta(!0)}resolveTargetDelta(d=!1){var g;const b=this.getLead();this.isProjectionDirty||(this.isProjectionDirty=b.isProjectionDirty),this.isTransformDirty||(this.isTransformDirty=b.isTransformDirty),this.isSharedProjectionDirty||(this.isSharedProjectionDirty=b.isSharedProjectionDirty);const j=!!this.resumingFrom||this!==b;if(!(d||j&&this.isSharedProjectionDirty||this.isProjectionDirty||!((g=this.parent)===null||g===void 0)&&g.isProjectionDirty||this.attemptToResolveRelativeTarget||this.root.updateBlockedByResize))return;const{layout:_e,layoutId:tt}=this.options;if(!(!this.layout||!(_e||tt))){if(this.resolvedRelativeTargetAt=frameData.timestamp,!this.targetDelta&&!this.relativeTarget){const it=this.getClosestProjectingParent();it&&it.layout&&this.animationProgress!==1?(this.relativeParent=it,this.forceRelativeParentToResolveTarget(),this.relativeTarget=createBox(),this.relativeTargetOrigin=createBox(),calcRelativePosition(this.relativeTargetOrigin,this.layout.layoutBox,it.layout.layoutBox),copyBoxInto(this.relativeTarget,this.relativeTargetOrigin)):this.relativeParent=this.relativeTarget=void 0}if(!(!this.relativeTarget&&!this.targetDelta)){if(this.target||(this.target=createBox(),this.targetWithTransforms=createBox()),this.relativeTarget&&this.relativeTargetOrigin&&this.relativeParent&&this.relativeParent.target?(this.forceRelativeParentToResolveTarget(),calcRelativeBox(this.target,this.relativeTarget,this.relativeParent.target)):this.targetDelta?(this.resumingFrom?this.target=this.applyTransform(this.layout.layoutBox):copyBoxInto(this.target,this.layout.layoutBox),applyBoxDelta(this.target,this.targetDelta)):copyBoxInto(this.target,this.layout.layoutBox),this.attemptToResolveRelativeTarget){this.attemptToResolveRelativeTarget=!1;const it=this.getClosestProjectingParent();it&&!!it.resumingFrom==!!this.resumingFrom&&!it.options.layoutScroll&&it.target&&this.animationProgress!==1?(this.relativeParent=it,this.forceRelativeParentToResolveTarget(),this.relativeTarget=createBox(),this.relativeTargetOrigin=createBox(),calcRelativePosition(this.relativeTargetOrigin,this.target,it.target),copyBoxInto(this.relativeTarget,this.relativeTargetOrigin)):this.relativeParent=this.relativeTarget=void 0}isDebug&&metrics.resolvedTargetDeltas++}}}getClosestProjectingParent(){if(!(!this.parent||hasScale(this.parent.latestValues)||has2DTranslate(this.parent.latestValues)))return this.parent.isProjecting()?this.parent:this.parent.getClosestProjectingParent()}isProjecting(){return!!((this.relativeTarget||this.targetDelta||this.options.layoutRoot)&&this.layout)}calcProjection(){var d;const g=this.getLead(),b=!!this.resumingFrom||this!==g;let j=!0;if((this.isProjectionDirty||!((d=this.parent)===null||d===void 0)&&d.isProjectionDirty)&&(j=!1),b&&(this.isSharedProjectionDirty||this.isTransformDirty)&&(j=!1),this.resolvedRelativeTargetAt===frameData.timestamp&&(j=!1),j)return;const{layout:_,layoutId:_e}=this.options;if(this.isTreeAnimating=!!(this.parent&&this.parent.isTreeAnimating||this.currentAnimation||this.pendingAnimation),this.isTreeAnimating||(this.targetDelta=this.relativeTarget=void 0),!this.layout||!(_||_e))return;copyBoxInto(this.layoutCorrected,this.layout.layoutBox);const tt=this.treeScale.x,it=this.treeScale.y;applyTreeDeltas(this.layoutCorrected,this.treeScale,this.path,b),g.layout&&!g.target&&(this.treeScale.x!==1||this.treeScale.y!==1)&&(g.target=g.layout.layoutBox,g.targetWithTransforms=createBox());const{target:st}=g;if(!st){this.prevProjectionDelta&&(this.createProjectionDeltas(),this.scheduleRender());return}!this.projectionDelta||!this.prevProjectionDelta?this.createProjectionDeltas():(copyAxisDeltaInto(this.prevProjectionDelta.x,this.projectionDelta.x),copyAxisDeltaInto(this.prevProjectionDelta.y,this.projectionDelta.y)),calcBoxDelta(this.projectionDelta,this.layoutCorrected,st,this.latestValues),(this.treeScale.x!==tt||this.treeScale.y!==it||!axisDeltaEquals(this.projectionDelta.x,this.prevProjectionDelta.x)||!axisDeltaEquals(this.projectionDelta.y,this.prevProjectionDelta.y))&&(this.hasProjected=!0,this.scheduleRender(),this.notifyListeners("projectionUpdate",st)),isDebug&&metrics.recalculatedProjection++}hide(){this.isVisible=!1}show(){this.isVisible=!0}scheduleRender(d=!0){var g;if((g=this.options.visualElement)===null||g===void 0||g.scheduleRender(),d){const b=this.getStack();b&&b.scheduleRender()}this.resumingFrom&&!this.resumingFrom.instance&&(this.resumingFrom=void 0)}createProjectionDeltas(){this.prevProjectionDelta=createDelta(),this.projectionDelta=createDelta(),this.projectionDeltaWithTransform=createDelta()}setAnimationOrigin(d,g=!1){const b=this.snapshot,j=b?b.latestValues:{},_={...this.latestValues},_e=createDelta();(!this.relativeParent||!this.relativeParent.options.layoutRoot)&&(this.relativeTarget=this.relativeTargetOrigin=void 0),this.attemptToResolveRelativeTarget=!g;const tt=createBox(),it=b?b.source:void 0,st=this.layout?this.layout.source:void 0,ut=it!==st,ct=this.getStack(),rt=!ct||ct.members.length<=1,ot=!!(ut&&!rt&&this.options.crossfade===!0&&!this.path.some(hasOpacityCrossfade));this.animationProgress=0;let lt;this.mixTargetDelta=dt=>{const pt=dt/1e3;mixAxisDelta(_e.x,d.x,pt),mixAxisDelta(_e.y,d.y,pt),this.setTargetDelta(_e),this.relativeTarget&&this.relativeTargetOrigin&&this.layout&&this.relativeParent&&this.relativeParent.layout&&(calcRelativePosition(tt,this.layout.layoutBox,this.relativeParent.layout.layoutBox),mixBox(this.relativeTarget,this.relativeTargetOrigin,tt,pt),lt&&boxEquals(this.relativeTarget,lt)&&(this.isProjectionDirty=!1),lt||(lt=createBox()),copyBoxInto(lt,this.relativeTarget)),ut&&(this.animationValues=_,mixValues(_,j,this.latestValues,pt,ot,rt)),this.root.scheduleUpdateProjection(),this.scheduleRender(),this.animationProgress=pt},this.mixTargetDelta(this.options.layoutRoot?1e3:0)}startAnimation(d){this.notifyListeners("animationStart"),this.currentAnimation&&this.currentAnimation.stop(),this.resumingFrom&&this.resumingFrom.currentAnimation&&this.resumingFrom.currentAnimation.stop(),this.pendingAnimation&&(cancelFrame(this.pendingAnimation),this.pendingAnimation=void 0),this.pendingAnimation=frame.update(()=>{globalProjectionState.hasAnimatedSinceResize=!0,this.currentAnimation=animateSingleValue(0,animationTarget,{...d,onUpdate:g=>{this.mixTargetDelta(g),d.onUpdate&&d.onUpdate(g)},onComplete:()=>{d.onComplete&&d.onComplete(),this.completeAnimation()}}),this.resumingFrom&&(this.resumingFrom.currentAnimation=this.currentAnimation),this.pendingAnimation=void 0})}completeAnimation(){this.resumingFrom&&(this.resumingFrom.currentAnimation=void 0,this.resumingFrom.preserveOpacity=void 0);const d=this.getStack();d&&d.exitAnimationComplete(),this.resumingFrom=this.currentAnimation=this.animationValues=void 0,this.notifyListeners("animationComplete")}finishAnimation(){this.currentAnimation&&(this.mixTargetDelta&&this.mixTargetDelta(animationTarget),this.currentAnimation.stop()),this.completeAnimation()}applyTransformsToTarget(){const d=this.getLead();let{targetWithTransforms:g,target:b,layout:j,latestValues:_}=d;if(!(!g||!b||!j)){if(this!==d&&this.layout&&j&&shouldAnimatePositionOnly(this.options.animationType,this.layout.layoutBox,j.layoutBox)){b=this.target||createBox();const _e=calcLength(this.layout.layoutBox.x);b.x.min=d.target.x.min,b.x.max=b.x.min+_e;const tt=calcLength(this.layout.layoutBox.y);b.y.min=d.target.y.min,b.y.max=b.y.min+tt}copyBoxInto(g,b),transformBox(g,_),calcBoxDelta(this.projectionDeltaWithTransform,this.layoutCorrected,g,_)}}registerSharedNode(d,g){this.sharedNodes.has(d)||this.sharedNodes.set(d,new NodeStack),this.sharedNodes.get(d).add(g);const j=g.options.initialPromotionConfig;g.promote({transition:j?j.transition:void 0,preserveFollowOpacity:j&&j.shouldPreserveFollowOpacity?j.shouldPreserveFollowOpacity(g):void 0})}isLead(){const d=this.getStack();return d?d.lead===this:!0}getLead(){var d;const{layoutId:g}=this.options;return g?((d=this.getStack())===null||d===void 0?void 0:d.lead)||this:this}getPrevLead(){var d;const{layoutId:g}=this.options;return g?(d=this.getStack())===null||d===void 0?void 0:d.prevLead:void 0}getStack(){const{layoutId:d}=this.options;if(d)return this.root.sharedNodes.get(d)}promote({needsReset:d,transition:g,preserveFollowOpacity:b}={}){const j=this.getStack();j&&j.promote(this,b),d&&(this.projectionDelta=void 0,this.needsReset=!0),g&&this.setOptions({transition:g})}relegate(){const d=this.getStack();return d?d.relegate(this):!1}resetSkewAndRotation(){const{visualElement:d}=this.options;if(!d)return;let g=!1;const{latestValues:b}=d;if((b.z||b.rotate||b.rotateX||b.rotateY||b.rotateZ||b.skewX||b.skewY)&&(g=!0),!g)return;const j={};b.z&&resetDistortingTransform("z",d,j,this.animationValues);for(let _=0;_<transformAxes.length;_++)resetDistortingTransform(`rotate${transformAxes[_]}`,d,j,this.animationValues),resetDistortingTransform(`skew${transformAxes[_]}`,d,j,this.animationValues);d.render();for(const _ in j)d.setStaticValue(_,j[_]),this.animationValues&&(this.animationValues[_]=j[_]);d.scheduleRender()}getProjectionStyles(d){var g,b;if(!this.instance||this.isSVG)return;if(!this.isVisible)return hiddenVisibility;const j={visibility:""},_=this.getTransformTemplate();if(this.needsReset)return this.needsReset=!1,j.opacity="",j.pointerEvents=resolveMotionValue(d==null?void 0:d.pointerEvents)||"",j.transform=_?_(this.latestValues,""):"none",j;const _e=this.getLead();if(!this.projectionDelta||!this.layout||!_e.target){const ut={};return this.options.layoutId&&(ut.opacity=this.latestValues.opacity!==void 0?this.latestValues.opacity:1,ut.pointerEvents=resolveMotionValue(d==null?void 0:d.pointerEvents)||""),this.hasProjected&&!hasTransform(this.latestValues)&&(ut.transform=_?_({},""):"none",this.hasProjected=!1),ut}const tt=_e.animationValues||_e.latestValues;this.applyTransformsToTarget(),j.transform=buildProjectionTransform(this.projectionDeltaWithTransform,this.treeScale,tt),_&&(j.transform=_(tt,j.transform));const{x:it,y:st}=this.projectionDelta;j.transformOrigin=`${it.origin*100}% ${st.origin*100}% 0`,_e.animationValues?j.opacity=_e===this?(b=(g=tt.opacity)!==null&&g!==void 0?g:this.latestValues.opacity)!==null&&b!==void 0?b:1:this.preserveOpacity?this.latestValues.opacity:tt.opacityExit:j.opacity=_e===this?tt.opacity!==void 0?tt.opacity:"":tt.opacityExit!==void 0?tt.opacityExit:0;for(const ut in scaleCorrectors){if(tt[ut]===void 0)continue;const{correct:ct,applyTo:rt}=scaleCorrectors[ut],ot=j.transform==="none"?tt[ut]:ct(tt[ut],_e);if(rt){const lt=rt.length;for(let dt=0;dt<lt;dt++)j[rt[dt]]=ot}else j[ut]=ot}return this.options.layoutId&&(j.pointerEvents=_e===this?resolveMotionValue(d==null?void 0:d.pointerEvents)||"":"none"),j}clearSnapshot(){this.resumeFrom=this.snapshot=void 0}resetTree(){this.root.nodes.forEach(d=>{var g;return(g=d.currentAnimation)===null||g===void 0?void 0:g.stop()}),this.root.nodes.forEach(clearMeasurements),this.root.sharedNodes.clear()}}}function updateLayout(e){e.updateLayout()}function notifyLayoutUpdate(e){var o;const a=((o=e.resumeFrom)===null||o===void 0?void 0:o.snapshot)||e.snapshot;if(e.isLead()&&e.layout&&a&&e.hasListeners("didUpdate")){const{layoutBox:s,measuredBox:c}=e.layout,{animationType:h}=e.options,d=a.source!==e.layout.source;h==="size"?eachAxis(_e=>{const tt=d?a.measuredBox[_e]:a.layoutBox[_e],it=calcLength(tt);tt.min=s[_e].min,tt.max=tt.min+it}):shouldAnimatePositionOnly(h,a.layoutBox,s)&&eachAxis(_e=>{const tt=d?a.measuredBox[_e]:a.layoutBox[_e],it=calcLength(s[_e]);tt.max=tt.min+it,e.relativeTarget&&!e.currentAnimation&&(e.isProjectionDirty=!0,e.relativeTarget[_e].max=e.relativeTarget[_e].min+it)});const g=createDelta();calcBoxDelta(g,s,a.layoutBox);const b=createDelta();d?calcBoxDelta(b,e.applyTransform(c,!0),a.measuredBox):calcBoxDelta(b,s,a.layoutBox);const j=!isDeltaZero(g);let _=!1;if(!e.resumeFrom){const _e=e.getClosestProjectingParent();if(_e&&!_e.resumeFrom){const{snapshot:tt,layout:it}=_e;if(tt&&it){const st=createBox();calcRelativePosition(st,a.layoutBox,tt.layoutBox);const ut=createBox();calcRelativePosition(ut,s,it.layoutBox),boxEqualsRounded(st,ut)||(_=!0),_e.options.layoutRoot&&(e.relativeTarget=ut,e.relativeTargetOrigin=st,e.relativeParent=_e)}}}e.notifyListeners("didUpdate",{layout:s,snapshot:a,delta:b,layoutDelta:g,hasLayoutChanged:j,hasRelativeTargetChanged:_})}else if(e.isLead()){const{onExitComplete:s}=e.options;s&&s()}e.options.transition=void 0}function propagateDirtyNodes(e){isDebug&&metrics.totalNodes++,e.parent&&(e.isProjecting()||(e.isProjectionDirty=e.parent.isProjectionDirty),e.isSharedProjectionDirty||(e.isSharedProjectionDirty=!!(e.isProjectionDirty||e.parent.isProjectionDirty||e.parent.isSharedProjectionDirty)),e.isTransformDirty||(e.isTransformDirty=e.parent.isTransformDirty))}function cleanDirtyNodes(e){e.isProjectionDirty=e.isSharedProjectionDirty=e.isTransformDirty=!1}function clearSnapshot(e){e.clearSnapshot()}function clearMeasurements(e){e.clearMeasurements()}function clearIsLayoutDirty(e){e.isLayoutDirty=!1}function resetTransformStyle(e){const{visualElement:o}=e.options;o&&o.getProps().onBeforeLayoutMeasure&&o.notify("BeforeLayoutMeasure"),e.resetTransform()}function finishAnimation(e){e.finishAnimation(),e.targetDelta=e.relativeTarget=e.target=void 0,e.isProjectionDirty=!0}function resolveTargetDelta(e){e.resolveTargetDelta()}function calcProjection(e){e.calcProjection()}function resetSkewAndRotation(e){e.resetSkewAndRotation()}function removeLeadSnapshots(e){e.removeLeadSnapshot()}function mixAxisDelta(e,o,a){e.translate=mixNumber$1(o.translate,0,a),e.scale=mixNumber$1(o.scale,1,a),e.origin=o.origin,e.originPoint=o.originPoint}function mixAxis(e,o,a,s){e.min=mixNumber$1(o.min,a.min,s),e.max=mixNumber$1(o.max,a.max,s)}function mixBox(e,o,a,s){mixAxis(e.x,o.x,a.x,s),mixAxis(e.y,o.y,a.y,s)}function hasOpacityCrossfade(e){return e.animationValues&&e.animationValues.opacityExit!==void 0}const defaultLayoutTransition={duration:.45,ease:[.4,0,.1,1]},userAgentContains=e=>typeof navigator<"u"&&navigator.userAgent&&navigator.userAgent.toLowerCase().includes(e),roundPoint=userAgentContains("applewebkit/")&&!userAgentContains("chrome/")?Math.round:noop;function roundAxis(e){e.min=roundPoint(e.min),e.max=roundPoint(e.max)}function roundBox(e){roundAxis(e.x),roundAxis(e.y)}function shouldAnimatePositionOnly(e,o,a){return e==="position"||e==="preserve-aspect"&&!isNear(aspectRatio(o),aspectRatio(a),.2)}function checkNodeWasScrollRoot(e){var o;return e!==e.root&&((o=e.scroll)===null||o===void 0?void 0:o.wasRoot)}const DocumentProjectionNode=createProjectionNode({attachResizeListener:(e,o)=>addDomEvent(e,"resize",o),measureScroll:()=>({x:document.documentElement.scrollLeft||document.body.scrollLeft,y:document.documentElement.scrollTop||document.body.scrollTop}),checkIsScrollRoot:()=>!0}),rootProjectionNode={current:void 0},HTMLProjectionNode=createProjectionNode({measureScroll:e=>({x:e.scrollLeft,y:e.scrollTop}),defaultParent:()=>{if(!rootProjectionNode.current){const e=new DocumentProjectionNode({});e.mount(window),e.setOptions({layoutScroll:!0}),rootProjectionNode.current=e}return rootProjectionNode.current},resetTransform:(e,o)=>{e.style.transform=o!==void 0?o:"none"},checkIsScrollRoot:e=>window.getComputedStyle(e).position==="fixed"}),drag={pan:{Feature:PanGesture},drag:{Feature:DragGesture,ProjectionNode:HTMLProjectionNode,MeasureLayout}};function handleHoverEvent(e,o,a){const{props:s}=e;e.animationState&&s.whileHover&&e.animationState.setActive("whileHover",a==="Start");const c="onHover"+a,h=s[c];h&&frame.postRender(()=>h(o,extractEventInfo(o)))}class HoverGesture extends Feature{mount(){const{current:o}=this.node;o&&(this.unmount=hover(o,a=>(handleHoverEvent(this.node,a,"Start"),s=>handleHoverEvent(this.node,s,"End"))))}unmount(){}}class FocusGesture extends Feature{constructor(){super(...arguments),this.isActive=!1}onFocus(){let o=!1;try{o=this.node.current.matches(":focus-visible")}catch{o=!0}!o||!this.node.animationState||(this.node.animationState.setActive("whileFocus",!0),this.isActive=!0)}onBlur(){!this.isActive||!this.node.animationState||(this.node.animationState.setActive("whileFocus",!1),this.isActive=!1)}mount(){this.unmount=pipe(addDomEvent(this.node.current,"focus",()=>this.onFocus()),addDomEvent(this.node.current,"blur",()=>this.onBlur()))}unmount(){}}function handlePressEvent(e,o,a){const{props:s}=e;e.animationState&&s.whileTap&&e.animationState.setActive("whileTap",a==="Start");const c="onTap"+(a==="End"?"":a),h=s[c];h&&frame.postRender(()=>h(o,extractEventInfo(o)))}class PressGesture extends Feature{mount(){const{current:o}=this.node;o&&(this.unmount=press(o,a=>(handlePressEvent(this.node,a,"Start"),(s,{success:c})=>handlePressEvent(this.node,s,c?"End":"Cancel")),{useGlobalTarget:this.node.props.globalTapTarget}))}unmount(){}}const observerCallbacks=new WeakMap,observers=new WeakMap,fireObserverCallback=e=>{const o=observerCallbacks.get(e.target);o&&o(e)},fireAllObserverCallbacks=e=>{e.forEach(fireObserverCallback)};function initIntersectionObserver({root:e,...o}){const a=e||document;observers.has(a)||observers.set(a,{});const s=observers.get(a),c=JSON.stringify(o);return s[c]||(s[c]=new IntersectionObserver(fireAllObserverCallbacks,{root:e,...o})),s[c]}function observeIntersection(e,o,a){const s=initIntersectionObserver(o);return observerCallbacks.set(e,a),s.observe(e),()=>{observerCallbacks.delete(e),s.unobserve(e)}}const thresholdNames={some:0,all:1};class InViewFeature extends Feature{constructor(){super(...arguments),this.hasEnteredView=!1,this.isInView=!1}startObserver(){this.unmount();const{viewport:o={}}=this.node.getProps(),{root:a,margin:s,amount:c="some",once:h}=o,d={root:a?a.current:void 0,rootMargin:s,threshold:typeof c=="number"?c:thresholdNames[c]},g=b=>{const{isIntersecting:j}=b;if(this.isInView===j||(this.isInView=j,h&&!j&&this.hasEnteredView))return;j&&(this.hasEnteredView=!0),this.node.animationState&&this.node.animationState.setActive("whileInView",j);const{onViewportEnter:_,onViewportLeave:_e}=this.node.getProps(),tt=j?_:_e;tt&&tt(b)};return observeIntersection(this.node.current,d,g)}mount(){this.startObserver()}update(){if(typeof IntersectionObserver>"u")return;const{props:o,prevProps:a}=this.node;["amount","margin","root"].some(hasViewportOptionChanged(o,a))&&this.startObserver()}unmount(){}}function hasViewportOptionChanged({viewport:e={}},{viewport:o={}}={}){return a=>e[a]!==o[a]}const gestureAnimations={inView:{Feature:InViewFeature},tap:{Feature:PressGesture},focus:{Feature:FocusGesture},hover:{Feature:HoverGesture}},layout={layout:{ProjectionNode:HTMLProjectionNode,MeasureLayout}},prefersReducedMotion={current:null},hasReducedMotionListener={current:!1};function initPrefersReducedMotion(){if(hasReducedMotionListener.current=!0,!!isBrowser)if(window.matchMedia){const e=window.matchMedia("(prefers-reduced-motion)"),o=()=>prefersReducedMotion.current=e.matches;e.addListener(o),o()}else prefersReducedMotion.current=!1}const valueTypes=[...dimensionValueTypes,color,complex],findValueType=e=>valueTypes.find(testValueType(e)),visualElementStore=new WeakMap;function updateMotionValuesFromProps(e,o,a){for(const s in o){const c=o[s],h=a[s];if(isMotionValue(c))e.addValue(s,c);else if(isMotionValue(h))e.addValue(s,motionValue(c,{owner:e}));else if(h!==c)if(e.hasValue(s)){const d=e.getValue(s);d.liveStyle===!0?d.jump(c):d.hasAnimated||d.set(c)}else{const d=e.getStaticValue(s);e.addValue(s,motionValue(d!==void 0?d:c,{owner:e}))}}for(const s in a)o[s]===void 0&&e.removeValue(s);return o}const propEventHandlers=["AnimationStart","AnimationComplete","Update","BeforeLayoutMeasure","LayoutMeasure","LayoutAnimationStart","LayoutAnimationComplete"];class VisualElement{scrapeMotionValuesFromProps(o,a,s){return{}}constructor({parent:o,props:a,presenceContext:s,reducedMotionConfig:c,blockInitialAnimation:h,visualState:d},g={}){this.current=null,this.children=new Set,this.isVariantNode=!1,this.isControllingVariants=!1,this.shouldReduceMotion=null,this.values=new Map,this.KeyframeResolver=KeyframeResolver,this.features={},this.valueSubscriptions=new Map,this.prevMotionValues={},this.events={},this.propEventSubscriptions={},this.notifyUpdate=()=>this.notify("Update",this.latestValues),this.render=()=>{this.current&&(this.triggerBuild(),this.renderInstance(this.current,this.renderState,this.props.style,this.projection))},this.renderScheduledAt=0,this.scheduleRender=()=>{const it=time.now();this.renderScheduledAt<it&&(this.renderScheduledAt=it,frame.render(this.render,!1,!0))};const{latestValues:b,renderState:j,onUpdate:_}=d;this.onUpdate=_,this.latestValues=b,this.baseTarget={...b},this.initialValues=a.initial?{...b}:{},this.renderState=j,this.parent=o,this.props=a,this.presenceContext=s,this.depth=o?o.depth+1:0,this.reducedMotionConfig=c,this.options=g,this.blockInitialAnimation=!!h,this.isControllingVariants=isControllingVariants(a),this.isVariantNode=isVariantNode(a),this.isVariantNode&&(this.variantChildren=new Set),this.manuallyAnimateOnMount=!!(o&&o.current);const{willChange:_e,...tt}=this.scrapeMotionValuesFromProps(a,{},this);for(const it in tt){const st=tt[it];b[it]!==void 0&&isMotionValue(st)&&st.set(b[it],!1)}}mount(o){this.current=o,visualElementStore.set(o,this),this.projection&&!this.projection.instance&&this.projection.mount(o),this.parent&&this.isVariantNode&&!this.isControllingVariants&&(this.removeFromVariantTree=this.parent.addVariantChild(this)),this.values.forEach((a,s)=>this.bindToMotionValue(s,a)),hasReducedMotionListener.current||initPrefersReducedMotion(),this.shouldReduceMotion=this.reducedMotionConfig==="never"?!1:this.reducedMotionConfig==="always"?!0:prefersReducedMotion.current,this.parent&&this.parent.children.add(this),this.update(this.props,this.presenceContext)}unmount(){visualElementStore.delete(this.current),this.projection&&this.projection.unmount(),cancelFrame(this.notifyUpdate),cancelFrame(this.render),this.valueSubscriptions.forEach(o=>o()),this.valueSubscriptions.clear(),this.removeFromVariantTree&&this.removeFromVariantTree(),this.parent&&this.parent.children.delete(this);for(const o in this.events)this.events[o].clear();for(const o in this.features){const a=this.features[o];a&&(a.unmount(),a.isMounted=!1)}this.current=null}bindToMotionValue(o,a){this.valueSubscriptions.has(o)&&this.valueSubscriptions.get(o)();const s=transformProps.has(o),c=a.on("change",g=>{this.latestValues[o]=g,this.props.onUpdate&&frame.preRender(this.notifyUpdate),s&&this.projection&&(this.projection.isTransformDirty=!0)}),h=a.on("renderRequest",this.scheduleRender);let d;window.MotionCheckAppearSync&&(d=window.MotionCheckAppearSync(this,o,a)),this.valueSubscriptions.set(o,()=>{c(),h(),d&&d(),a.owner&&a.stop()})}sortNodePosition(o){return!this.current||!this.sortInstanceNodePosition||this.type!==o.type?0:this.sortInstanceNodePosition(this.current,o.current)}updateFeatures(){let o="animation";for(o in featureDefinitions){const a=featureDefinitions[o];if(!a)continue;const{isEnabled:s,Feature:c}=a;if(!this.features[o]&&c&&s(this.props)&&(this.features[o]=new c(this)),this.features[o]){const h=this.features[o];h.isMounted?h.update():(h.mount(),h.isMounted=!0)}}}triggerBuild(){this.build(this.renderState,this.latestValues,this.props)}measureViewportBox(){return this.current?this.measureInstanceViewportBox(this.current,this.props):createBox()}getStaticValue(o){return this.latestValues[o]}setStaticValue(o,a){this.latestValues[o]=a}update(o,a){(o.transformTemplate||this.props.transformTemplate)&&this.scheduleRender(),this.prevProps=this.props,this.props=o,this.prevPresenceContext=this.presenceContext,this.presenceContext=a;for(let s=0;s<propEventHandlers.length;s++){const c=propEventHandlers[s];this.propEventSubscriptions[c]&&(this.propEventSubscriptions[c](),delete this.propEventSubscriptions[c]);const h="on"+c,d=o[h];d&&(this.propEventSubscriptions[c]=this.on(c,d))}this.prevMotionValues=updateMotionValuesFromProps(this,this.scrapeMotionValuesFromProps(o,this.prevProps,this),this.prevMotionValues),this.handleChildMotionValue&&this.handleChildMotionValue(),this.onUpdate&&this.onUpdate(this)}getProps(){return this.props}getVariant(o){return this.props.variants?this.props.variants[o]:void 0}getDefaultTransition(){return this.props.transition}getTransformPagePoint(){return this.props.transformPagePoint}getClosestVariantNode(){return this.isVariantNode?this:this.parent?this.parent.getClosestVariantNode():void 0}addVariantChild(o){const a=this.getClosestVariantNode();if(a)return a.variantChildren&&a.variantChildren.add(o),()=>a.variantChildren.delete(o)}addValue(o,a){const s=this.values.get(o);a!==s&&(s&&this.removeValue(o),this.bindToMotionValue(o,a),this.values.set(o,a),this.latestValues[o]=a.get())}removeValue(o){this.values.delete(o);const a=this.valueSubscriptions.get(o);a&&(a(),this.valueSubscriptions.delete(o)),delete this.latestValues[o],this.removeValueFromRenderState(o,this.renderState)}hasValue(o){return this.values.has(o)}getValue(o,a){if(this.props.values&&this.props.values[o])return this.props.values[o];let s=this.values.get(o);return s===void 0&&a!==void 0&&(s=motionValue(a===null?void 0:a,{owner:this}),this.addValue(o,s)),s}readValue(o,a){var s;let c=this.latestValues[o]!==void 0||!this.current?this.latestValues[o]:(s=this.getBaseTargetFromProps(this.props,o))!==null&&s!==void 0?s:this.readValueFromInstance(this.current,o,this.options);return c!=null&&(typeof c=="string"&&(isNumericalString(c)||isZeroValueString(c))?c=parseFloat(c):!findValueType(c)&&complex.test(a)&&(c=getAnimatableNone(o,a)),this.setBaseTarget(o,isMotionValue(c)?c.get():c)),isMotionValue(c)?c.get():c}setBaseTarget(o,a){this.baseTarget[o]=a}getBaseTarget(o){var a;const{initial:s}=this.props;let c;if(typeof s=="string"||typeof s=="object"){const d=resolveVariantFromProps(this.props,s,(a=this.presenceContext)===null||a===void 0?void 0:a.custom);d&&(c=d[o])}if(s&&c!==void 0)return c;const h=this.getBaseTargetFromProps(this.props,o);return h!==void 0&&!isMotionValue(h)?h:this.initialValues[o]!==void 0&&c===void 0?void 0:this.baseTarget[o]}on(o,a){return this.events[o]||(this.events[o]=new SubscriptionManager),this.events[o].add(a)}notify(o,...a){this.events[o]&&this.events[o].notify(...a)}}class DOMVisualElement extends VisualElement{constructor(){super(...arguments),this.KeyframeResolver=DOMKeyframesResolver}sortInstanceNodePosition(o,a){return o.compareDocumentPosition(a)&2?1:-1}getBaseTargetFromProps(o,a){return o.style?o.style[a]:void 0}removeValueFromRenderState(o,{vars:a,style:s}){delete a[o],delete s[o]}handleChildMotionValue(){this.childSubscription&&(this.childSubscription(),delete this.childSubscription);const{children:o}=this.props;isMotionValue(o)&&(this.childSubscription=o.on("change",a=>{this.current&&(this.current.textContent=`${a}`)}))}}function getComputedStyle(e){return window.getComputedStyle(e)}class HTMLVisualElement extends DOMVisualElement{constructor(){super(...arguments),this.type="html",this.renderInstance=renderHTML}readValueFromInstance(o,a){if(transformProps.has(a)){const s=getDefaultValueType(a);return s&&s.default||0}else{const s=getComputedStyle(o),c=(isCSSVariableName(a)?s.getPropertyValue(a):s[a])||0;return typeof c=="string"?c.trim():c}}measureInstanceViewportBox(o,{transformPagePoint:a}){return measureViewportBox(o,a)}build(o,a,s){buildHTMLStyles(o,a,s.transformTemplate)}scrapeMotionValuesFromProps(o,a,s){return scrapeMotionValuesFromProps$1(o,a,s)}}class SVGVisualElement extends DOMVisualElement{constructor(){super(...arguments),this.type="svg",this.isSVGTag=!1,this.measureInstanceViewportBox=createBox}getBaseTargetFromProps(o,a){return o[a]}readValueFromInstance(o,a){if(transformProps.has(a)){const s=getDefaultValueType(a);return s&&s.default||0}return a=camelCaseAttributes.has(a)?a:camelToDash(a),o.getAttribute(a)}scrapeMotionValuesFromProps(o,a,s){return scrapeMotionValuesFromProps(o,a,s)}build(o,a,s){buildSVGAttrs(o,a,this.isSVGTag,s.transformTemplate)}renderInstance(o,a,s,c){renderSVG(o,a,s,c)}mount(o){this.isSVGTag=isSVGTag(o.tagName),super.mount(o)}}const createDomVisualElement=(e,o)=>isSVGComponent(e)?new SVGVisualElement(o):new HTMLVisualElement(o,{allowProjection:e!==reactExports.Fragment}),createMotionComponent=createMotionComponentFactory({...animations,...gestureAnimations,...drag,...layout},createDomVisualElement),motion=createDOMMotionComponentProxy(createMotionComponent),SocialLink=({href:e,ariaLabel:o,children:a})=>jsxRuntimeExports.jsx("a",{href:e,target:"_blank",rel:"noopener noreferrer","aria-label":o,className:`p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 
              hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 
              transition-all duration-300 hover:scale-110 hover:no-underline`,children:a}),WeChatQRLink=({iconSize:e})=>{const[o,a]=reactExports.useState(!1),[s,c]=reactExports.useState(!1),h=reactExports.useRef(null),{theme:d}=useTheme();reactExports.useEffect(()=>{const _=()=>{c(window.innerWidth<768||"ontouchstart"in window)};return _(),window.addEventListener("resize",_),()=>window.removeEventListener("resize",_)},[]),reactExports.useEffect(()=>{const _=_e=>{h.current&&!h.current.contains(_e.target)&&a(!1)};return o&&document.addEventListener("mousedown",_),()=>{document.removeEventListener("mousedown",_)}},[o]);const g=()=>{s&&a(!o)},b=()=>{s||a(!0)},j=()=>{s||a(!1)};return jsxRuntimeExports.jsxs("div",{ref:h,className:"relative",children:[jsxRuntimeExports.jsxs("button",{onClick:g,onMouseEnter:b,onMouseLeave:j,"aria-label":"WeChat QR Code",className:`p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 
                  hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 
                  transition-all duration-300 hover:scale-110 relative`,children:[jsxRuntimeExports.jsx("img",{src:d==="dark"?"/images/wechat-icon-dark.png":"/images/wechat-icon-light.png",alt:"WeChat",width:e,height:e,className:"object-contain"}),jsxRuntimeExports.jsx("span",{className:`absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full text-[8px] 
                        flex items-center justify-center text-white font-bold shadow-md border-2 border-white dark:border-slate-800
                        transition-all duration-300`,children:"QR"})]}),jsxRuntimeExports.jsx(AnimatePresence,{children:o&&jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,scale:.9,y:10},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.9,y:10},transition:{duration:.2,ease:"easeOut"},className:"absolute bottom-full left-0 right-0 flex justify-center mb-3 z-50",children:jsxRuntimeExports.jsxs("div",{className:"bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 relative",children:[jsxRuntimeExports.jsx("div",{className:`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                            border-l-4 border-r-4 border-t-4 border-transparent 
                            border-t-white dark:border-t-slate-800`}),jsxRuntimeExports.jsxs("div",{className:"text-center",children:[jsxRuntimeExports.jsx("img",{src:"/images/wechat-qr.jpg",alt:"WeChat QR Code",className:"w-32 h-32 object-contain rounded-md mb-2",onError:_=>{_.currentTarget.style.display="none",_.currentTarget.nextElementSibling.textContent="QR Code not found"}}),jsxRuntimeExports.jsx("p",{className:"text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap",children:"微信公众号"}),jsxRuntimeExports.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap",children:"Scan with WeChat"})]})]})})})]})},SocialLinks=({className:e="",iconSize:o=20})=>jsxRuntimeExports.jsxs("div",{className:`flex items-center space-x-4 ${e}`,children:[jsxRuntimeExports.jsx(SocialLink,{href:"https://github.com/fyang0507",ariaLabel:"GitHub",children:jsxRuntimeExports.jsx(Github,{size:o})}),jsxRuntimeExports.jsx(SocialLink,{href:"https://www.linkedin.com/in/fyang0507/",ariaLabel:"LinkedIn",children:jsxRuntimeExports.jsx(Linkedin,{size:o})}),jsxRuntimeExports.jsx(SocialLink,{href:"https://www.instagram.com/yangruntong/",ariaLabel:"Instagram",children:jsxRuntimeExports.jsx(Instagram,{size:o})}),jsxRuntimeExports.jsx(SocialLink,{href:"mailto:fredyang0507@gmail.com",ariaLabel:"Email",children:jsxRuntimeExports.jsx(Mail,{size:o})}),jsxRuntimeExports.jsx(WeChatQRLink,{iconSize:o})]}),Footer=()=>{const e=new Date().getFullYear();return jsxRuntimeExports.jsx("footer",{className:"bg-slate-100 dark:bg-slate-900 py-12 mt-16",children:jsxRuntimeExports.jsxs("div",{className:"container-custom",children:[jsxRuntimeExports.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-8",children:[jsxRuntimeExports.jsxs("div",{className:"col-span-2",children:[jsxRuntimeExports.jsx("h3",{className:"text-lg font-bold mb-4",children:"Fred Yang"}),jsxRuntimeExports.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Where Computational Intelligence Meets Creative Vision."}),jsxRuntimeExports.jsx(SocialLinks,{})]}),jsxRuntimeExports.jsxs("div",{children:[jsxRuntimeExports.jsx("h3",{className:"text-lg font-bold mb-4",children:"Navigation"}),jsxRuntimeExports.jsxs("ul",{className:"space-y-2",children:[jsxRuntimeExports.jsx("li",{children:jsxRuntimeExports.jsx(Link,{to:"/",className:"text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-300",children:"Home"})}),jsxRuntimeExports.jsx("li",{children:jsxRuntimeExports.jsx(Link,{to:"/gallery",className:"text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-300",children:"Gallery"})}),jsxRuntimeExports.jsx("li",{children:jsxRuntimeExports.jsx(Link,{to:"/blog",className:"text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-300",children:"Blog"})})]})]}),jsxRuntimeExports.jsxs("div",{children:[jsxRuntimeExports.jsx("h3",{className:"text-lg font-bold mb-4",children:"Contact"}),jsxRuntimeExports.jsxs("div",{className:"space-y-2",children:[jsxRuntimeExports.jsx("div",{className:"text-slate-600 dark:text-slate-400",children:"Email: fredyang0507@gmail.com"}),jsxRuntimeExports.jsx("div",{className:"text-slate-600 dark:text-slate-400",children:"Location: New York, NY"})]})]})]}),jsxRuntimeExports.jsxs("div",{className:"border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-400",children:[jsxRuntimeExports.jsxs("p",{children:["© ",e," Fred Yang. All rights reserved."]}),jsxRuntimeExports.jsxs("p",{className:"flex flex-wrap items-center justify-center",children:["Made with "," ",jsxRuntimeExports.jsxs("a",{href:"https://cursor.sh/",target:"_blank",rel:"noopener noreferrer",className:"text-primary-600 dark:text-primary-300 hover:underline inline-flex items-center",children:[jsxRuntimeExports.jsx("img",{src:"https://www.cursor.com/assets/images/logo.svg",alt:"Cursor Logo",className:"h-4 w-4 mr-1"}),"Cursor"]})," "," and "," ",jsxRuntimeExports.jsxs("a",{href:"https://bolt.new/",target:"_blank",rel:"noopener noreferrer",className:"text-primary-600 dark:text-primary-300 hover:underline inline-flex items-center",children:[jsxRuntimeExports.jsx("img",{src:"https://pbs.twimg.com/profile_images/1880702021122342912/fe9TlQqJ_400x400.jpg",alt:"Bolt Logo",className:"h-4 w-4 mr-1"}),"Bolt"]}),"."]})]})]})})},Hero=()=>{const[e,o]=reactExports.useState(!1),a=()=>{o(!e)};return jsxRuntimeExports.jsxs("section",{className:"relative py-12",children:[jsxRuntimeExports.jsx("div",{className:"absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-950/30 dark:to-dark -z-10"}),jsxRuntimeExports.jsxs("div",{className:"container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",children:[jsxRuntimeExports.jsxs(motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6},className:"order-2 lg:order-1",children:[jsxRuntimeExports.jsxs("h1",{className:"text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white",children:[jsxRuntimeExports.jsx("span",{className:"text-primary-600 dark:text-primary-300",children:"Fred Yang"}),jsxRuntimeExports.jsx("br",{}),jsxRuntimeExports.jsx("span",{className:"text-xl md:text-2xl lg:text-3xl",children:"AI/ML Engineer & Photographer"})]}),jsxRuntimeExports.jsx("p",{className:"text-lg md:text-xl text-slate-700 dark:text-slate-300 my-6 max-w-2xl",children:"Merging the analytical precision of artificial intelligence with the creative vision of photography. Exploring the intersection of technology and visual storytelling."}),jsxRuntimeExports.jsxs("div",{className:"text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200 italic mb-8 border-l-4 border-primary-500 pl-4 py-2",children:['"Code, Camera & Curiosity"',jsxRuntimeExports.jsx("br",{}),'"世如未竟天工卷，格物致知珞玉心"']}),jsxRuntimeExports.jsx("div",{className:"flex items-center space-x-6 mb-8",children:jsxRuntimeExports.jsx(SocialLinks,{iconSize:24})}),jsxRuntimeExports.jsxs("div",{className:"flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4",children:[jsxRuntimeExports.jsx("a",{href:"/blog",className:"btn-primary flex items-center justify-center",children:"View Blogs"}),jsxRuntimeExports.jsx("a",{href:"/gallery",className:"btn-secondary flex items-center justify-center",children:"Explore Gallery"})]})]}),jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},transition:{duration:.7,delay:.2},className:"order-1 lg:order-2",children:jsxRuntimeExports.jsxs("div",{className:"relative",children:[jsxRuntimeExports.jsxs("div",{className:"w-[90%] h-[500px] mx-auto relative rounded-lg overflow-hidden shadow-2xl group cursor-pointer",children:[jsxRuntimeExports.jsx("img",{src:"/images/jojo.png",alt:"Fred Yang - Animated Avatar",className:`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${e?"opacity-0":"opacity-100"}`}),jsxRuntimeExports.jsx("img",{src:"/images/portrait.JPG",alt:"Fred Yang - AI/ML Engineer & Photographer",className:`absolute inset-0 w-full h-full object-cover brightness-110 transition-opacity duration-700 ease-in-out ${e?"opacity-100":"opacity-0"}`}),jsxRuntimeExports.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"}),jsxRuntimeExports.jsx("button",{onClick:a,className:"absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 flex items-center space-x-2 group-hover:bg-black/80","aria-label":e?"Show animated version":"Reveal real person",children:jsxRuntimeExports.jsx("span",{className:"text-xs",children:e?"🎨 Back to anime":"📸 Reveal real me"})})]}),jsxRuntimeExports.jsx("div",{className:"absolute -bottom-3 -left-2 w-28 h-28 rounded-lg bg-primary-500/20 dark:bg-primary-600/20 -z-10"}),jsxRuntimeExports.jsx("div",{className:"absolute -top-3 -right-2 w-28 h-28 rounded-lg bg-accent-500/20 dark:bg-accent-600/20 -z-10"})]})})]})]})},aiIntroResponse=`Hi, I’m thrilled you’ve landed here. Let me give you the inside scoop on Runtong Yang—known to friends as FY. 

Professionally, he’s a New York–based data scientist and full‑stack engineer who turns complex ideas into elegant, scalable software, with a special knack for AI, automation, and open‑source tooling. 

Outside code, FY’s creativity shines through design work, anime‑inspired art, and a lifelong curiosity about the intersection of storytelling and technology. 

He’s driven by a passion for learning, generous knowledge‑sharing, and building communities where people grow together. 

If you value thoughtful engineering, clear communication, and a splash of artistic flair, you’re in the right place.
`,typingConfig={baseSpeed:20,punctuationDelay:100,paragraphDelay:200,sentenceDelay:50},ChatInterface=({onStart:e,autoStart:o,forceCompleted:a})=>{const[s,c]=reactExports.useState(!!a),[h,d]=reactExports.useState(!1),[g,b]=reactExports.useState(a?aiIntroResponse:""),[j,_]=reactExports.useState("Give me a short intro of Fred Yang."),_e=()=>{c(!0),e&&e(),setTimeout(()=>{d(!0);let tt=0;const it=aiIntroResponse,st=()=>{if(tt<it.length){const ut=it[tt];b(it.substring(0,tt+1));let ct=typingConfig.baseSpeed;ut==="."||ut==="!"||ut==="?"?ct+=typingConfig.sentenceDelay:(ut===","||ut===";"||ut===":")&&(ct+=typingConfig.punctuationDelay),ut===`
`&&it[tt+1]===`
`&&(ct+=typingConfig.paragraphDelay),tt++,setTimeout(st,ct)}else d(!1)};st()},600)};return reactExports.useEffect(()=>{o&&!s&&!a&&_e()},[o,a]),reactExports.useEffect(()=>{a&&(c(!0),d(!1),b(aiIntroResponse))},[a]),jsxRuntimeExports.jsxs("section",{className:"relative pt-20 pb-12",children:[jsxRuntimeExports.jsx("div",{className:"absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-dark -z-10"}),jsxRuntimeExports.jsx("div",{className:"container-custom",children:jsxRuntimeExports.jsx("div",{className:"max-w-3xl mx-auto",children:jsxRuntimeExports.jsx(AnimatePresence,{mode:"wait",children:s?jsxRuntimeExports.jsxs(motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6,ease:"easeOut"},className:"space-y-6",children:[jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,y:-10},animate:{opacity:1,y:0},transition:{delay:.2,duration:.5},className:"text-center",children:jsxRuntimeExports.jsxs("div",{className:"inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full",children:[jsxRuntimeExports.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full animate-pulse"}),jsxRuntimeExports.jsx("span",{className:"text-sm font-medium text-slate-700 dark:text-slate-300",children:"From ChatGPT's memory"})]})}),jsxRuntimeExports.jsxs("div",{className:"space-y-4",children:[jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,x:20,scale:.95},animate:{opacity:1,x:0,scale:1},transition:{duration:.5,delay:.3,ease:"easeOut"},className:"flex justify-end",children:jsxRuntimeExports.jsxs("div",{className:"flex items-end space-x-3 max-w-[85%]",children:[jsxRuntimeExports.jsx("div",{className:"bg-primary-500 text-white rounded-2xl rounded-br-md px-2.5 shadow-sm",children:jsxRuntimeExports.jsx("p",{className:"text-sm leading-relaxed",children:j})}),jsxRuntimeExports.jsx("div",{className:"flex-shrink-0 w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center",children:jsxRuntimeExports.jsx(User,{size:14,className:"text-slate-600 dark:text-slate-400"})})]})}),jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,x:-20,scale:.95},animate:{opacity:1,x:0,scale:1},transition:{duration:.5,delay:.5,ease:"easeOut"},className:"flex justify-start",children:jsxRuntimeExports.jsxs("div",{className:"flex items-start space-x-3 max-w-[90%]",children:[jsxRuntimeExports.jsx("div",{className:"flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-sm",children:jsxRuntimeExports.jsx(Bot,{size:14,className:"text-white"})}),jsxRuntimeExports.jsxs("div",{className:"bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-3 py-2.5 shadow-sm",children:[jsxRuntimeExports.jsxs("div",{className:"text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line",children:[g,h&&jsxRuntimeExports.jsx(motion.span,{animate:{opacity:[1,0]},transition:{duration:.8,repeat:1/0,repeatType:"reverse"},className:"inline-block w-0.5 h-4 bg-primary-500 ml-1 rounded-full"})]}),h&&jsxRuntimeExports.jsxs("div",{className:"flex items-center space-x-1 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700",children:[jsxRuntimeExports.jsx(motion.div,{animate:{scale:[1,1.2,1]},transition:{duration:1,repeat:1/0},className:"w-1 h-1 bg-primary-500 rounded-full"}),jsxRuntimeExports.jsx(motion.div,{animate:{scale:[1,1.2,1]},transition:{duration:1,repeat:1/0,delay:.2},className:"w-1 h-1 bg-primary-500 rounded-full"}),jsxRuntimeExports.jsx(motion.div,{animate:{scale:[1,1.2,1]},transition:{duration:1,repeat:1/0,delay:.4},className:"w-1 h-1 bg-primary-500 rounded-full"}),jsxRuntimeExports.jsx("span",{className:"ml-2 text-xs text-slate-500 dark:text-slate-400",children:"AI is typing..."})]})]})]})})]}),jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{duration:.5,delay:1},className:"text-left",children:jsxRuntimeExports.jsx("div",{className:"px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700",children:jsxRuntimeExports.jsxs("p",{className:"text-xs text-slate-500 dark:text-slate-400 leading-relaxed",children:["Unedited responses from ChatGPT based on the prompt: ",jsxRuntimeExports.jsx("br",{}),jsxRuntimeExports.jsx("span",{className:"font-medium",children:`"Based on our past interactions, please introduce me to a visitor to my personal website who doesn't know me before."`})," ",jsxRuntimeExports.jsx("br",{}),jsxRuntimeExports.jsx("br",{}),"Retrieved May 28, 2025."]})})})]},"chat-state"):jsxRuntimeExports.jsxs(motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.5,ease:"easeOut"},className:"space-y-6",children:[jsxRuntimeExports.jsx("div",{className:"text-center space-y-3",children:jsxRuntimeExports.jsx(motion.div,{initial:{scale:.8,opacity:0},animate:{scale:1,opacity:1},transition:{delay:.2,duration:.5},className:"inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 shadow-lg shadow-primary-500/25",children:jsxRuntimeExports.jsx(Sparkles,{className:"text-white",size:24})})}),jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.5,duration:.5},className:"relative",children:jsxRuntimeExports.jsxs("div",{className:"relative group",children:[jsxRuntimeExports.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"}),jsxRuntimeExports.jsxs("div",{className:"relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",children:[jsxRuntimeExports.jsx("textarea",{value:j,onChange:tt=>_(tt.target.value),placeholder:"Ask me anything about Fred...",readOnly:!0,className:"w-full p-4 pr-14 text-base bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed",rows:2,style:{minHeight:"70px"}}),jsxRuntimeExports.jsx(motion.button,{onClick:_e,disabled:!j.trim(),className:"absolute bottom-3 right-3 w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group disabled:cursor-not-allowed",whileHover:{scale:j.trim()?1.05:1},whileTap:{scale:j.trim()?.95:1},children:jsxRuntimeExports.jsx(Send,{size:16,className:`transition-transform ${j.trim()?"group-hover:translate-x-0.5":""}`})})]})]})})]},"input-state")})})})]})},photos=[{id:"1",location:"Cinque Terre, Italy",imageUrl:"/images/gallery/2015-04-cinque.jpg",category:"landscape",date:"2015-04-06"},{id:"2",location:"Florence, Italy",imageUrl:"/images/gallery/2015-04-florence.jpg",category:"landscape",date:"2015-04-07"},{id:"3",location:"Venice, Italy",imageUrl:"/images/gallery/2015-04-venice.jpg",category:"cityscape",date:"2015-04-08"},{id:"4",location:"Paris, France",imageUrl:"/images/gallery/2015-05-paris.jpg",category:"cityscape",date:"2015-05-09"},{id:"5",location:"Lisse, Netherlands",imageUrl:"/images/gallery/2015-05-tulip.jpg",category:"creature",date:"2015-05-10"},{id:"6",location:"Kinderdijk, Netherlands",imageUrl:"/images/gallery/2015-05-windmill.jpg",category:"landscape",date:"2015-05-09"},{id:"7",location:"Cully, Switzerland",imageUrl:"/images/gallery/2015-06-cully.jpg",category:"landscape",date:"2015-06-19"},{id:"8",location:"Nice, France",imageUrl:"/images/gallery/2015-06-nice.jpg",category:"landscape",date:"2015-06-03"},{id:"9",location:"Tokyo, Japan",imageUrl:"/images/gallery/2016-07-roppongi.jpg",category:"cityscape",date:"2016-07-10"},{id:"10",location:"Tokyo, Japan",imageUrl:"/images/gallery/2016-07-tokyo.jpg",category:"cityscape",date:"2016-07-10"},{id:"11",location:"Stanford, CA",imageUrl:"/images/gallery/2018-12-stanford.jpg",category:"architecture",date:"2018-12-19"},{id:"12",location:"Philadelphia, PA",imageUrl:"/images/gallery/2019-01-pa.jpg",category:"people",date:"2019-01-01"},{id:"13",location:"New York, NY",imageUrl:"/images/gallery/2019-05-wtc.jpg",category:"cityscape",date:"2019-05-11"},{id:"14",location:"Banff, Canada",imageUrl:"/images/gallery/2019-08-banff.jpg",category:"landscape",date:"2019-08-18"},{id:"15",location:"New York, NY",imageUrl:"/images/gallery/2021-02-wtc.jpg",category:"architecture",date:"2021-02-01"},{id:"16",location:"Jersey City, NJ",imageUrl:"/images/gallery/2021-04-cherry.jpg",category:"creature",date:"2021-04-01"},{id:"17",location:"Doha, Qatar",imageUrl:"/images/gallery/2018-08-doha.jpg",category:"cityscape",date:"2018-08-03"},{id:"18",location:"Toronto, Canada",imageUrl:"/images/gallery/2018-11-toronto.jpg",category:"cityscape",date:"2018-11-22"},{id:"19",location:"Ithaca, NY",imageUrl:"/images/gallery/2021-05-ithaca.jpg",category:"architecture",date:"2021-05-27"},{id:"20",location:"Interlaken, NY",imageUrl:"/images/gallery/2021-05-interlaken-ny.jpg",category:"landscape",date:"2021-05-28"},{id:"21",location:"Niagara Falls, NY",imageUrl:"/images/gallery/2021-05-niagara.jpg",category:"landscape",date:"2021-05-29"},{id:"22",location:"Asbury Park, NJ",imageUrl:"/images/gallery/2021-06-asbury.jpg",category:"architecture",date:"2021-06-20"},{id:"23",location:"New York, NY",imageUrl:"/images/gallery/2021-07-nyc.jpg",category:"cityscape",date:"2021-07-04"},{id:"24",location:"RISD, RI",imageUrl:"/images/gallery/2021-08-risd.jpg",category:"black and white",date:"2021-08-21"},{id:"25",location:"Newport, RI",imageUrl:"/images/gallery/2021-08-newport.jpg",category:"architecture",date:"2021-08-22"},{id:"26",location:"Yale, CT",imageUrl:"/images/gallery/2021-08-yale.jpg",category:"people",date:"2021-08-27"},{id:"27",location:"Yale, CT",imageUrl:"/images/gallery/2021-08-yale-2.jpg",category:"architecture",date:"2021-08-27"},{id:"28",location:"Chassell, MI",imageUrl:"/images/gallery/2021-10-michigan.jpg",category:"landscape",date:"2021-10-04"},{id:"29",location:"New York, NY",imageUrl:"/images/gallery/2022-07-firework.jpg",category:"cityscape",date:"2022-07-04"},{id:"30",location:"Pictured Rocks, MI",imageUrl:"/images/gallery/2021-10-lakeshore.jpg",category:"landscape",date:"2021-10-03"},{id:"31",location:"New York, NY",imageUrl:"/images/gallery/2022-04-centralpark.jpg",category:"abstract",date:"2022-04-10"},{id:"32",location:"New York, NY",imageUrl:"/images/gallery/2022-05-nyc.jpg",category:"cityscape",date:"2022-05-21"},{id:"33",location:"New York, NY",imageUrl:"/images/gallery/2022-06-parade.JPG",category:"people",date:"2022-06-26"},{id:"34",location:"New York, NY",imageUrl:"/images/gallery/2022-07-bookstore.JPG",category:"people",date:"2022-07-10"},{id:"35",location:"New York, NY",imageUrl:"/images/gallery/2022-07-street.JPG",category:"street",date:"2022-07-10"},{id:"36",location:"New York, NY",imageUrl:"/images/gallery/2022-08-dusk.JPG",category:"cityscape",date:"2022-08-01"},{id:"37",location:"New York, NY",imageUrl:"/images/gallery/2022-08-street.JPG",category:"street",date:"2022-08-12"},{id:"38",location:"New York, NY",imageUrl:"/images/gallery/2022-09-tao.JPG",category:"street",date:"2022-09-17"},{id:"39",location:"Cooperstown, NY",imageUrl:"/images/gallery/2022-10-dji.jpg",category:"landscape",date:"2022-10-16"},{id:"40",location:"Bear Mountain, NY",imageUrl:"/images/gallery/2022-10-moon.JPG",category:"black and white",date:"2022-10-30"},{id:"41",location:"Kingston, Canada",imageUrl:"/images/gallery/2022-12-kingston.JPG",category:"landscape",date:"2022-12-08"},{id:"42",location:"Niagara Falls, Canada",imageUrl:"/images/gallery/2022-12-niagara.JPG",category:"landscape",date:"2022-12-13"},{id:"43",location:"New York, NY",imageUrl:"/images/gallery/2023-03-lv.JPG",category:"architecture",date:"2023-03-26"},{id:"45",location:"Chengdu, China",imageUrl:"/images/gallery/2023-05-chengdu.JPG",category:"street",date:"2023-05-11"},{id:"46",location:"Guangzhou, China",imageUrl:"/images/gallery/2023-05-sculpture.JPG",category:"architecture",date:"2023-05-17"},{id:"47",location:"Chengdu, China",imageUrl:"/images/gallery/2023-05-wall.JPG",category:"street",date:"2023-05-11"},{id:"48",location:"Wenchuan, China",imageUrl:"/images/gallery/2023-05-ads.JPG",category:"landscape",date:"2023-05-14"},{id:"49",location:"Dongguan, China",imageUrl:"/images/gallery/2023-05-square.JPG",category:"cityscape",date:"2023-05-19"},{id:"50",location:"Cape May, NJ",imageUrl:"/images/gallery/2023-07-capemay.JPG",category:"landscape",date:"2023-07-02"},{id:"51",location:"New York, NY",imageUrl:"/images/gallery/2023-08-nyc.JPG",category:"landscape",date:"2023-08-19"},{id:"52",location:"Albany, NY",imageUrl:"/images/gallery/2023-10-albany.JPG",category:"cityscape",date:"2023-10-11"},{id:"53",location:"Lake George, NY",imageUrl:"/images/gallery/2023-10-lakegeorge.JPG",category:"people",date:"2023-10-12"},{id:"54",location:"London, UK",imageUrl:"/images/gallery/2023-11-covent.JPG",category:"people",date:"2023-11-09"},{id:"55",location:"London, UK",imageUrl:"/images/gallery/2023-11-hydepark.JPG",category:"creature",date:"2023-11-08"},{id:"56",location:"London, UK",imageUrl:"/images/gallery/2023-11-london.JPG",category:"cityscape",date:"2023-11-09"},{id:"57",location:"London, UK",imageUrl:"/images/gallery/2023-11-london-2.JPG",category:"cityscape",date:"2023-11-09"},{id:"58",location:"Chengdu, China",imageUrl:"/images/gallery/2023-12-chengdu.JPG",category:"cityscape",date:"2023-12-01"},{id:"59",location:"London, UK",imageUrl:"/images/gallery/2023-12-dog.JPG",category:"creature",date:"2023-12-23"},{id:"60",location:"London, UK",imageUrl:"/images/gallery/2023-12-ealing.JPG",category:"architecture",date:"2023-12-20"},{id:"61",location:"London, UK",imageUrl:"/images/gallery/2023-12-flower.JPG",category:"creature",date:"2023-12-23"},{id:"62",location:"Chengdu, China",imageUrl:"/images/gallery/2023-12-goldenfish.JPG",category:"creature",date:"2023-12-01"},{id:"63",location:"London, UK",imageUrl:"/images/gallery/2023-12-barbican.JPG",category:"architecture",date:"2023-12-29"},{id:"64",location:"London, UK",imageUrl:"/images/gallery/2023-12-barbican-2.JPG",category:"architecture",date:"2023-12-29"},{id:"65",location:"London, UK",imageUrl:"/images/gallery/2023-12-london.JPG",category:"cityscape",date:"2023-12-29"},{id:"66",location:"Cambridge, UK",imageUrl:"/images/gallery/2024-01-cambridge.JPG",category:"architecture",date:"2024-01-03"},{id:"67",location:"Cambridge, UK",imageUrl:"/images/gallery/2024-01-cambridge-2.JPG",category:"architecture",date:"2024-01-03"},{id:"68",location:"London, UK",imageUrl:"/images/gallery/2024-01-parade.JPG",category:"people",date:"2024-01-01"},{id:"69",location:"Hong Kong, China",imageUrl:"/images/gallery/2024-04-citypulse.JPG",category:"cityscape",date:"2024-04-20"},{id:"70",location:"Hong Kong, China",imageUrl:"/images/gallery/2024-04-cross.JPG",category:"street",date:"2024-04-20"},{id:"71",location:"Hong Kong, China",imageUrl:"/images/gallery/2024-04-heytea.JPG",category:"people",date:"2024-04-20"},{id:"72",location:"Hong Kong, China",imageUrl:"/images/gallery/2024-04-hongkong.JPG",category:"cityscape",date:"2024-04-20"},{id:"73",location:"Hong Kong",imageUrl:"/images/gallery/2024-04-lifesaver.JPG",category:"people",date:"2024-04-20"},{id:"74",location:"Hong Kong, China",imageUrl:"/images/gallery/2024-04-selfie.JPG",category:"people",date:"2024-04-22"},{id:"75",location:"Hong Kong, China",imageUrl:"/images/gallery/2024-04-taxi.JPG",category:"street",date:"2024-04-20"},{id:"76",location:"Hong Kong, China",imageUrl:"/images/gallery/2024-04-hongkong-rain.JPG",category:"cityscape",date:"2024-04-22"},{id:"77",location:"Seoul, South Korea",imageUrl:"/images/gallery/2024-05-budda.JPG",category:"people",date:"2024-05-11"},{id:"78",location:"Seoul, South Korea",imageUrl:"/images/gallery/2024-05-seoul.JPG",category:"street",date:"2024-05-10"},{id:"79",location:"Seoul, South Korea",imageUrl:"/images/gallery/2024-05-seoul-2.JPG",category:"street",date:"2024-05-11"},{id:"80",location:"Seoul, South Korea",imageUrl:"/images/gallery/2024-05-seoul-cityscape.JPG",category:"cityscape",date:"2024-05-11"},{id:"81",location:"Seoul, South Korea",imageUrl:"/images/gallery/2024-05-seoul-fashion.JPG",category:"people",date:"2024-05-12"},{id:"82",location:"Seoul, South Korea",imageUrl:"/images/gallery/2024-05-seoul-grandma.JPG",category:"people",date:"2024-05-11"},{id:"83",location:"Seoul, South Korea",imageUrl:"/images/gallery/2024-05-seoul-ins.JPG",category:"street",date:"2024-05-11"},{id:"84",location:"Seoul, South Korea",imageUrl:"/images/gallery/2024-05-seoul-night.JPG",category:"cityscape",date:"2024-05-11"},{id:"85",location:"Antwerp, Belgium",imageUrl:"/images/gallery/2024-10-antwerp.JPG",category:"people",date:"2024-10-17"},{id:"86",location:"Antwerp, Belgium",imageUrl:"/images/gallery/2024-10-antwerp-night.JPG",category:"street",date:"2024-10-18"},{id:"87",location:"Antwerp, Belgium",imageUrl:"/images/gallery/2024-10-antwerp-sculpture.JPG",category:"architecture",date:"2024-10-18"},{id:"88",location:"Antwerp, Belgium",imageUrl:"/images/gallery/2024-10-antwerp-station.JPG",category:"architecture",date:"2024-10-19"},{id:"89",location:"Düsseldorf, Germany",imageUrl:"/images/gallery/2024-10-dusseldorf.JPG",category:"cityscape",date:"2024-10-16"},{id:"90",location:"Ghent, Belgium",imageUrl:"/images/gallery/2024-10-ghent-cross.JPG",category:"architecture",date:"2024-10-19"},{id:"91",location:"Schloss Drachenburg, Germany",imageUrl:"/images/gallery/2024-10-schloss.JPG",category:"street",date:"2024-10-15"},{id:"92",location:"Amsterdam, Netherlands",imageUrl:"/images/gallery/2024-10-nertherland-bike.JPG",category:"street",date:"2024-10-12"},{id:"93",location:"Amsterdam, Netherlands",imageUrl:"/images/gallery/2024-10-nertherland-bike-2.JPG",category:"landscape",date:"2024-10-13"},{id:"94",location:"Ashokan, New York",imageUrl:"/images/gallery/2024-10-northenlight.JPG",category:"landscape",date:"2024-10-11"},{id:"95",location:"Maui, HI",imageUrl:"/images/gallery/2025-03-haleakala.JPG",category:"landscape",date:"2025-03-13"},{id:"96",location:"Honolulu, HI",imageUrl:"/images/gallery/2025-03-hawaii-shore.JPG",category:"landscape",date:"2025-03-09"}],getUniqueCategories=()=>{const e=photos.reduce((a,s)=>(a[s.category]=(a[s.category]||0)+1,a),{}),o=Object.entries(e).sort(([,a],[,s])=>s-a).map(([a,s])=>({id:a,name:a.charAt(0).toUpperCase()+a.slice(1),count:s}));return[{id:"all",name:"All",count:photos.length},...o]};getUniqueCategories();const getUniqueYears$1=()=>{const e=photos.reduce((a,s)=>{const c=new Date(s.date).getFullYear().toString();return a[c]=(a[c]||0)+1,a},{}),o=Object.entries(e).sort(([a],[s])=>parseInt(s)-parseInt(a)).map(([a,s])=>({id:a,name:a,count:s}));return[{id:"all",name:"All Years",count:photos.length},...o]};getUniqueYears$1();const FeaturedPhotos=()=>{const[e,o]=reactExports.useState(null),a=photos.sort((s,c)=>new Date(c.date).getTime()-new Date(s.date).getTime()).slice(0,4);return jsxRuntimeExports.jsx("section",{className:"pt-12 pb-2 bg-slate-50 dark:bg-slate-800",id:"featured",children:jsxRuntimeExports.jsxs("div",{className:"container-custom",children:[jsxRuntimeExports.jsxs("div",{className:"flex justify-between items-baseline mb-8",children:[jsxRuntimeExports.jsx(motion.h2,{initial:{opacity:0,x:-20},whileInView:{opacity:1,x:0},viewport:{once:!0},transition:{duration:.5},children:"Recent Photography"}),jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,x:20},whileInView:{opacity:1,x:0},viewport:{once:!0},transition:{duration:.5,delay:.2},children:jsxRuntimeExports.jsxs(Link,{to:"/gallery",className:"group flex items-center text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 font-medium hover:no-underline",children:["View All Work",jsxRuntimeExports.jsx(ArrowRight,{className:"ml-1 transition-transform group-hover:translate-x-1",size:18})]})})]}),jsxRuntimeExports.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:a.map((s,c)=>jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,y:30},whileInView:{opacity:1,y:0},viewport:{once:!0,margin:"-100px"},transition:{duration:.6,delay:c*.1},className:"relative rounded-lg overflow-hidden shadow-lg group",onMouseEnter:()=>o(c),onMouseLeave:()=>o(null),children:jsxRuntimeExports.jsxs("div",{className:"aspect-[4/3] overflow-hidden",children:[jsxRuntimeExports.jsx("img",{src:s.imageUrl,alt:s.location,className:`w-full h-full object-cover transition-transform duration-700 ease-out scale-115
                            group-hover:scale-130`}),jsxRuntimeExports.jsxs("div",{className:`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 flex flex-col justify-end
                            transition-opacity duration-300 ${e===c?"opacity-100":"opacity-0 md:opacity-70"}`,children:[jsxRuntimeExports.jsx("h3",{className:"text-white text-xl md:text-2xl font-bold",children:s.location}),jsxRuntimeExports.jsxs("div",{className:"mt-3 flex justify-between items-center",children:[jsxRuntimeExports.jsx("span",{className:"px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm",children:s.category}),jsxRuntimeExports.jsx("span",{className:"text-white/70 text-sm",children:new Date(s.date).toLocaleDateString("en-US",{year:"numeric",month:"short"})})]})]})]})},s.id))})]})})},__vite_glob_0_0=`---
title: 'Resurrection: On the Flow and Superposition of Time and Life'
title_zh: '复活随笔：关于流动和叠加的时间和生命'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2015-05-12_复活随笔.jpg'
date: '2015-04-12'
tags:
  - 'travel log'
  - 'europe'
tags_zh:
  - '游记'
  - '欧洲'
languages: ['en', 'zh']
---

#### [Rome · Vatican]
There were once people who spent their entire lives merely copying the countenance of Jesus. Looking at those statues constantly battered by camera flashes, I thought that perhaps only they deserved to be called true men of ambition.
The entire church is one grand altar, its elaborate decorations crystallizing the wealth of an entire generation—and perhaps from beginning to end, it was all merely to satisfy certain people's desires. Yet its value cannot be denied, if only for the sake of those who come to worship, its value cannot be negated. As someone who seeks more than purely religious fulfillment, what I see within is the brilliant radiance of the human spirit, in the aesthetic sense, in the architectural sense. I imagine that every craftsman working on the scaffolding, when they bent down from the dome to gaze upon the towns spread below, must have had a moment of trance-like belief that they were building the Tower of Babel. This is a great endeavor, from ancient times to the present.

#### [Florence]
As I wandered through the Uffizi Gallery, I saw many Jesuses and many Marys. The Jesuses and Marys possessed faces of every kind—this was self-evident—because judging from the artists' respective eras, works from the Middle Ages to the early Renaissance were mostly religious in theme. But I wondered: since each painter held different archetypal images of Jesus and Mary in their hearts, could it be that they themselves were not individuals, but rather collections? Yes, in this torrent of history, all who lead by example, bearing humanity's destiny forward, could be crowned with the title of Jesus; all who are chaste and noble are also part of the composition of the Holy Mother. The definitions of Jesus and the Holy Mother are gradually enriching, and thus they are able to manifest different faces. They represent humanity's pursuits, expectations, and desires.
Climbing the curved, narrow, and dim passageways of the Cathedral of Santa Maria del Fiore, I felt in a trance as if I were traveling upstream through the church's esophagus. The silhouettes ahead of me swayed crookedly, so much so that at times I mistook them for the ghostly shadows left by tourists who had climbed to the top before. But how could it not be so? This great cathedral swallows and disgorges thousands of tourists daily—who could possibly be truly remembered by this thing that has stood for hundreds of years? Standing on the observation deck of the dome, I gazed down imperiously at Florence's red and white residences nestled between hills and white clouds. I imagined that this behemoth, from the day its construction was completed, had strangely begun a new life of its own accord, no longer belonging to humanity, but becoming a solid fortress reaching toward the sky like a medium's banner. In its temporal scale, the bustling tourists and residents of this city over the centuries constitute nothing more than something like flowing water—if we were to overlay all the eras. This flowing water constantly evaporates under the sun, from those channels separated by red and white houses; and viewed from the distant mountains, these residences too are nothing more than the massive root system that the church has extended in all directions for its growth!

What remains is solely the church; truly alive is only the church.
Humanity! How pale and powerless you appear when facing this creation of your own! But perhaps it is precisely because of this that we find it necessary to create the church.

Let us continue the metaphor of flowing water. When our physical shells also break free from the shackles of self-consciousness, we can likewise see that the images of our entire lives are nothing more than the flowing water that rushes through this shell. Yes, as Mr. Haruki Murakami said, "I am merely a conduit for this person that is me."

#### [Cinque Terre]
Still on time's leeward slope
Like a general galloping his horse through ranks of crops
Reining in to survey all around, asking the plants
Has everyone grown well today?

The village grows from the mountaintop
Then slides along the ridge toward the plain
Those waters that drip and pierce along the mountain streams—
Thus the city is nurtured into being

#### [Train Reverie]
Mr. Haruki Murakami's creative process essentially tells us this fact about exploring life: we pursue hope and meaning, yet often escape into the ethereal; then we affirm the value of our own struggle and endurance, affirming our recognition that we must bear something because we have fallen into this world; finally we begin to believe in the power of love, becoming warriors of love, embarking on a path entirely governed by causation and circumstance. Those who truly embark on this path probably understand that love is the core of the human spirit. Carrying this conviction, they wait in happiness, or grow in happiness. Yes, the world turns because of love.

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

【罗马·梵蒂冈】

从前有些人，光是为了临摹耶稣的容貌就花上了一辈子。我看着那些被闪光灯不停拍打的雕像，心想也许只有他们，才配被称为真正的野心家。

整个教堂就是一个大祭坛，那些繁复的装饰凝结了一整个世代的财富——而也许从头至尾只是为了满足某些人的欲望。可是它的价值无法被否定，即使只是为了那些朝拜的人它的价值也不能被否定。作为一个不单纯满足宗教的人，我从中看到的是人类精神熠熠的闪光，从美学的意义上，从建筑学的意义上。我想每一个在梯架上工作的工匠，当他们在穹顶俯身看向铺在地上的市镇的时候，他们总有一个瞬间恍惚相信自己正在修建巴别塔。这是一项伟大的事业，从古至今都是。


【佛罗伦萨】

当我漫游在乌菲兹美术馆里的时候，我看到了许多的耶稣和许多的玛丽。耶稣和玛丽们拥有各式的面孔——这是显而易见的事——因为从画家的从属的时代来说，从中世纪到文艺复兴早期的作品大多是宗教题材。可是我就想，既然每个画家心中都拥有不同理型的耶稣和玛利亚的形象，有没有可能他们本身就不是一个个体，而是一个集合呢？是的，在这条历史的洪流中，所有以身作则，背负人类命运前进的人都可以被冠以耶稣的称号；所有贞洁而高尚的人也都是圣母的组成部分。耶稣和圣母的定义是逐渐在丰富的，而因此他们才得以显现不同的面孔。他们代表了人类的追求、期待和愿望。

攀爬百花圣母大教堂的弯曲、促狭而昏暗的甬道，我恍惚觉得自己是在教堂的食道里逆流而上。我前面的人影歪歪斜斜地摇曳着，以至于有些时刻我竟把它们当做以前登顶的游客留下的鬼影。其实又何尝不是呢？这个大教堂每天吞吐上千的游客，谁又有可能真正被这个矗立了几百年的东西记住呢？我站在穹顶的观景台上，睥睨翡冷翠夹在丘陵和白云之间红红白白的住宅。我想象着，这个庞然大物，自修建竣工之日起，就奇怪地自顾自地开始了新的生命，不再属于人类，而成为了类似灵媒的招展地伸向天空的坚固堡垒。在它的时间刻度里，这个城市几百年来熙熙攘攘的游客和居民不过构成了一种水流般的东西——如果我们将所有的时代重叠起来的话。这些流水在太阳底下不断蒸发着，从那些被红红白白的房子隔开的沟洫里；而从远处的山峦眺望过来，这些住宅也不过是教堂为了生长而延展四方的庞大根系！

剩下来的唯独教堂，真正活着的只有教堂。

人类！你们在面对这个自身创造之物时显得多么苍白无力！可是也许正是因为这样，我们才有必要把教堂创造出来吧。

让我们继续水流的隐喻。当我们的躯壳也脱离了自身意识的枷锁，我们同样可以看见自己一生的影像不过是这副躯壳中冲刷而过的水流。是的，正如村上春树先生所说，“我不过是我这个人的一条通道”。


【五渔村】

静止在时光的背风坡
像将军策马在行列的庄稼中奔驰
立马而四顾 向植物问道
今天的大家 都有好好地生长吗？

村庄从山顶长起
然后沿着山脊滑向平原
那些沿着山涧滴穿的流水
城市就这样被喂养起来


【火车狂想】

村上春树先生的创作过程，无非告诉我们这样一个探寻人生的事实：我们追寻希望和意义，却往往遁于缥缈；而后我们肯定自身奋斗和忍耐的价值，肯定自身因堕入人世而必须背负什么的认识；最后我们开始相信爱的力量，化身爱的战士，踏上一条全然被因缘所左右的道路。真正踏上这条道路的人大概知晓了爱才是人类精神的内核。他们怀着这种确信，幸福中等待，或者、在幸福中生长。是的，世界因爱而转动。`,__vite_glob_0_1=`---
title: 'Go South, Go South'
title_zh: '到南方去 到南方去'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2015-05-09_到南方去.jpg'
date: '2015-05-09'
tags:
  - 'travel log'
  - 'europe'
tags_zh:
  - '游记'
  - '欧洲'
languages: ['en', 'zh']
---

In the Van Gogh Museum in Amsterdam, I changed my understanding of the lean brother.

It turned out that Van Gogh was more ordinary than I had imagined. Compared to the universally acknowledged title of madman and the convulsive sunflowers in Hai Zi's eyes, what I encountered in the museum—that figure constantly migrating southward across the Western European continent—was not a shell captured and driven by inspiration, but a fragile yet robust craftsman who maintained the form and meaning of his life through the act of painting.

His eyes bore no mist different from ordinary people, nor was there anything hallucinatory or special about the world in his consciousness. Those heavy strokes of color from the Neo-Impressionist style were merely the channels he had carved through continuous exploration and seeking, in order to pour out the melancholy accumulated in his heart.

Yes, a pure genius should be a tool, a spirit or something similar that God has bound in human form to create beauty in the mortal world. They live solely to create, or to put it another way, to convey divine oracles—they should stand atop the mountain peak above all others from the day of their creation.


But Van Gogh was not like this.

The lean brother held his brush and painted tirelessly. In his complex work, he could gather scattered divine inspirations (like radium found in the waste of pitchblende ore!). Diligent work is a pathway; through this extremely inefficient method, people can climb to that peak shining with clear light.

I had the same feeling when studying classical music on MOOC; music had been stripped of its sacred meaning for me. Although Teacher Zhou Guoping said it was "the language of heaven," tracing the life trajectories of Beethoven and Bach, what I saw were not scenes of them frantically writing down gushing inspiration like lightning on paper, but rather, based on music theory foundations and continuous refinement of harmonic laws, they would meticulously fill entire works through repetition, variation, and other techniques around a theme...

It was then that I finally saw clearly that although music is a temporal, flowing art form, this doesn't prevent it from following certain spatial symmetries. And these rules and systems are exactly like the meter in poetry and the harmony in painting... beauty has always been following certain principles.


This is something full of inheritance. The frameworks established by previous masters to approach beauty are either consolidated or broken by their successors, thus achieving the evolution of human aesthetic cognition. This works the same way as science, or rather, humanity naturally lives within the causality of temporal sequences.

Humanity, before all supreme things, exists merely as craftsmen.

However, we must still affirm this craftsman spirit. Though we are ignorant and naked, we are not empty-handed.

Because those who know how to gaze and sharpen will eventually approach truth.

Let us continue talking about Van Gogh—let us start from his life story. Van Gogh was an "introverted and eccentric" person in his youth. Working at an art dealership, he became a pastor due to his fervent religious passion, though only for a period. Later, at his family's suggestion, he began developing in the direction of an artist. Although poor and often receiving financial support from his brother, and constantly moving between the Netherlands and Belgium, he steadily acquired basic knowledge of painting. He favored the countryside and peasants (peasant portraits were his first step to success). However, to encounter the avant-garde art of his contemporaries, he came to Paris and befriended other painters like Paul Gauguin. It was also during that period that he encountered the style of Japanese decorative prints (and became deeply fascinated, going on to copy and create), and his personal works shifted from dark to bright tones. Due to poor health, he went south to the countryside of southern France and created a large number of works; however, it was also in that warm yellow house that he broke with Gauguin. As his mental state became increasingly unstable, he voluntarily moved to a mental hospital, where he also entered the final phase of his career through extensive creation. Unable to bear the unbearable loneliness, he ultimately chose to shoot himself in the fields.

He was the kind of person who lived in his own world, in his own paintings, which is why he was so prolific.

As an ordinary person, in order to communicate better with himself and to better match his own expressiveness, he had to practice his techniques and observation like any ordinary person, innovating in his painting methods.

Looking at his numerous self-portraits, although the guide explained that Van Gogh did this because he was poor (couldn't afford to hire models) and to practice painting techniques (searching for his most expressive brushstrokes), I couldn't stop imagining this: when he sat in front of the mirror gazing at himself every day, or frequently, he was recording his face and mood like writing in a diary. Just like girls who frequently change their makeup for selfies (even the way of narcissism is the same), Van Gogh's view of himself was constantly changing: sometimes weary, sometimes confused, sometimes full of edges and alertness, sometimes appearing decadent.

Van Gogh constantly gazed at himself, capturing inner sensations. This seemed like a means of connecting the self with the outside world, as if through this form, Van Gogh's body could maintain normality and not expand excessively. As for what was trying to make him expand, I think it was probably something like a gas constantly produced by a personality that was incompatible with life.

The torrent of genius never surged forth—this is the limit of human understanding. However, if human understanding is a beam of light, then gazing and sharpening are the tools to focus this light.

When you keep gazing, gazing continuously, you will eventually become what you gaze upon. In this long river of human reproduction, many people may have already merged with the universe through this method.

But how ridiculous I was then—the south I urged myself to go to was merely geographically closer to the equator. Beyond that, it was nothing at all.

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

阿姆斯特丹的梵高博物馆里，我修正了自己对于瘦哥哥的认识。
原来梵高比我想象中更平凡。相较于举世公认的疯癫的称号，和海子眼中痉挛的向日葵；我在博物馆中见到的、那个在西欧大陆上不断向南迁徙的，并不是一个被灵感所俘虏所驱动的躯壳，而是凭借作画这个行为维持人生形态和意义的脆弱而粗犷的工匠。
他的眼眸并非染上了异于常人的雾翳，他意识中的世界也并无什么幻觉或特殊之处；而那些新印象派的一笔笔浓重色彩，不过是他为了倾泻心中的积郁，通过不断地摸索和探寻，最终凿通的水渠罢了。
是的，纯粹的天才应当是一种工具，一个神为了在人间创造美而用人形束缚的一团灵气或者类似的东西。他们活着仅仅是为了创造，或者换一种说法，为了传达神谕——他们应当自被创造之日起，就站在众人的山巅。

但梵高不是这样。
瘦哥哥、他拿着笔不知疲倦地作画，在繁复的工作中，他可以拾起零星的神灵的启示（犹如从沥青铀矿的废料之中找到的镭！）。勤劳的工作是一条通径，凭借这种效率极低的方式，人们才得以攀上那闪耀着澄澈之光的山巅。
我在MOOC上学习古典乐的时候，也有相同的感觉；音乐对于我已经剥离了其神圣性的意味。尽管周国平老师说那是“天国的语言”，但追寻贝多芬和巴赫的人生轨迹，我所看到景象的并不是他们如闪电一般在纸上疯狂写下喷薄的灵感，而是基于乐理基础和对音律和谐的不断推敲，将一种主题通过反复、变奏以及其他的技法，细致地将整个作品充盈起来……
那时的我终于看清，尽管音乐是时间性的流动的作品，但并不妨碍它们遵循某种空间意义上的对称性。而这种规章和制度，正是诗歌中的格律和绘画中的和谐色……美一直在遵循某些东西。

这是一件充满承袭意味的事情。前辈的大师们留下的为了接近美而设立的框架，后辈们或巩固或打破，而得以实现人类审美认知的进化。这和科学是一个道理，或者说，人类本来就这样必然地活在时间序列的因果之中。
人类，在所有至高之物面前，不过是工匠般的存在。
然而，我们仍然要肯定这样的工匠精神。我们虽然愚昧而赤裸，但我们并非两手空空。
因为懂得凝视和磨砺的人，终将接近真理。

我们继续来谈梵高、让我们从他的生平开始谈起。梵高年轻时候是个“内向而古怪”的人，在艺术品商行工作的他因为狂热的宗教热情而成为了牧师，然而也仅仅是一段时间。后来在家人的提议下他开始向艺术家的方向发展，虽然穷困而时常接受弟弟的接济，而同时也辗转于荷兰和比利时，但他稳步地习得了绘画的基本知识。他偏爱乡村和农民（农民的肖像则是他起家的第一步），然而为了接触同时代的先锋艺术，他来到了巴黎并结识了保罗·高更一类的其他画家。而也是在那个时期，他接触到了日本的装饰性版画的风格（并深深迷恋进而临摹创作），个人的作品色调也由暗转明。因为健康状况不佳，他又向南去了南法的乡村并创作了大量作品；然而也是在那个充满温情的黄房子里，他和高更决裂了。由于精神状态越来越不稳定，他又自愿搬到了精神病院中，同时也是在大量的创作之中进入自己生涯的尾声。因为无法忍受的孤寂，他最终选择在田野之中向自己开枪。
他就是那种活在自己的世界里，自己的画中，所以他才如此多产。

作为常人的他，为了和自己更好地交流，为了更加贴合自己的表现力，他必须像常人一样磨练自己的技法、观察，在绘画的方式上创新。
我看着他数量众多的自画像，虽然导览中介绍说梵高这么做是因为穷（没钱聘请模特）和锻炼绘画技法（寻找自己最有表现力的笔触），但我无论如何也不能停止这样的想象，那就是：当他每天，或者频繁地、坐在镜子前凝视自己的时候，他就像是在记日记一样记录自己的面孔和心情。那和频繁变换妆容的女生的自拍一样（连自恋的方式都一样），梵高眼中的自己也在时刻变化着：有时倦怠，有时迷茫，有时充满棱角和机敏，有时却显得颓废。

梵高一直凝视自己，捕捉内感觉。这仿佛是一种将自我和外界连接的手段，仿佛借助这种形式，梵高的身体才可以保持常态，不至于过度膨胀一样。至于是什么东西要让他膨胀起来，我想那大概是与生活格格不入的性格在一直产生某种气体的类似物吧。
天才的洪流从未涌现，这是人类理解力的界限。然而，如果人类的理解力是一束光线的话，凝视和磨砺就是收束这光芒的工具。
当你一直、一直凝视，你就终将变做自己的凝视之物。在这漫漫繁衍的人类的长河中，许多人可能已经借此与宇宙融为一体了。

可是那时的我是多么可笑啊，我催促自己前往的南方，居然仅仅在地理意义上更接近赤道而已。除此之外居然什么也不是。`,__vite_glob_0_2=`---
title: 'The Breathing of Paris'
title_zh: '巴黎的呼吸'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2015-05-17_巴黎的呼吸.jpg'
date: '2015-05-17'
tags:
  - 'travel log'
  - 'europe'
tags_zh:
  - '游记'
  - '欧洲'
languages: ['en', 'zh']
---

Turning the corner from the Pompidou Center, I suddenly caught sight of a magnificent and ancient city hall. Tourists bustled through the grand square in front of the building; someone was blowing soap bubbles, delighting children who leaped and chased after them. The weather was gradually clearing, clouds drifting by in succession, and the French tricolor atop the building fluttered vigorously in the wind. The sunshine of mid-May was so bright it felt almost scorching, while beyond lay the Seine, the Île de la Cité, and Notre-Dame...
This is Paris. Though I wouldn't say it haunts my dreams, I do harbor special expectations for this city through countless novels I've read. Those districts and place names stretching before my eyes always give birth to story after story—different eras, different social classes. The history of this city is so profound, yet it doesn't feel particularly oppressive; in my imagination, it's like a girl living in another dimension who, despite witnessing countless vicissitudes of change, remains too languid to alter her appearance for any of it.
I fantasize about stepping out from winding paths onto the suddenly expansive Champs-Élysées, gazing up at the sky, watching sunlight strike the plane tree leaves, listening to the tremendous pulsing of this city's life; at the star-shaped plaza's center, beneath the Arc de Triomphe, savoring the interplay between Chinese characters and radiating districts; walking along the avenue toward Montmartre, paying homage to the heights where artists once gathered, where Van Gogh once stayed; observing the Eiffel Tower from afar, critiquing like an old gentleman this metal tower so incompatible with classical architecture; approaching the lights of the Latin Quarter as they kindle at dusk, drawing near to Odette's secret life and the veil that pierced Swann's heart; wandering the streets of Montmartre late at night, following the rebellious youth of Lulu's childhood escape; and the bells of Notre-Dame, the boats on the Seine... Ah! Paris, let those magical characters and stories take the stage in turn—allow me to prostrate myself at the hem of your skirt!
But in reality, I can only shoulder my backpack like any ordinary tourist, shuttling and disappearing into this city's cacophonous background alongside countless other ordinary tourists. I've tried innumerable times to approach that feeling—but what do I actually see? Garbage blown by strong winds in front of the Moulin Rouge, the dirty flowing water of the Seine, crowds of visitors queuing at Shakespeare and Company... The sky, low-hanging dark clouds severing souls that should roam free! The city I imagined was full of dreams, but the scenery before my eyes is so jarringly, unmistakably real.
Not long ago, I was still puzzled by such disparities—the tremendous changes in travel patterns over the past century. I've read countless accounts of Russian nobles traveling from Siberian wilderness to Western Europe for the social season, of aristocratic ladies moving from inland castles to Mediterranean shores for winter, or of travelers journeying from America to the European continent—their migratory lifestyle makes it impossible to say where their true residence lies. They were there, staying in suburbs to escape summer heat, residing in spa sanatoriums for recuperation; even if someone told you they would live there for a whole year, ten years, a lifetime, you would hardly feel any surprise.
But ever since passports came into being, we seem to have been instantly forced into certain identities, compelled to settle in specific places while being denied the right to lodge long-term elsewhere (though this isn't entirely the passport's fault). We tour five countries in seven days, see an entire continent in twenty-five days, then return to trajectories identical to those we left behind. Has our way of life changed at all? No, no—in every city, we're like rude guests who barge straight into others' homes and loudly order from menus. Why would someone resting in a café due to travel fatigue brazenly claim to have experienced authentic Parisian ambiance? All travel blogs are merely hodgepodges of guides and to-do lists; what determines their quality isn't the narrator's lifestyle interests and philosophy, but travel efficiency. Beautiful! Beautiful! Beautiful! Those comments cry out loudly, as if scenic spots and experiences were comparable things; the highest praise I can think of is that you've captured postcard-perfect photos... People who can see beyond tourist attractions during brief, high-intensity trips are few and far between.
If possible, I truly wish to take a journey without any itinerary. Not rushing from one attraction to the next using the shortest time and most economical methods, but employing random encounters to discover some inevitability about this city—the kind of inevitability that makes Notre-Dame necessarily stand in Paris. Without this, Notre-Dame appearing as a tourist attraction in Rome would allow us to pose shamelessly for photos there too (unfortunately, most travel nowadays is precisely this nutritionally void).
This is a double barrier, a double blow! As a fantasist, I can only see momentary realities that stand apart from the everyday; as a hurried tourist, I cannot see those precious things this city has accumulated through hundreds of years of silent growth.

Yes! These things we simply cannot change!

Farewell, women with iris flowers tucked jauntily in your hat brims! Farewell, dignified musketeers riding past on the Palais-Royal avenue!
But if we're shameless enough, we can still say this:
"What matters in travel isn't the destination, but who accompanies you."
Saying this suddenly reminds me that people from Chengdu, even on suburban outings, merely change locations to play mahjong. Whether in rapeseed flower fields, by streams, or at hot springs, what matters isn't the scenery but the mahjong partners and luck... Humans! You're quite inventive when it comes to socializing.
Honestly, I may lose the motivation to continue traveling—especially to those great metropolises that have truly stood for over a thousand years and will inevitably continue standing for thousands more. Due to objective modernization and subjective modern tourism—as Han Shaogong said, all cities in the world are increasingly becoming one city... I cannot possibly seek out that elegance of carriages, horses, saddles, and hairpins. That graceful bearing exists only in Proust's childhood—and the similar hazy emotions I dimly sense through his words may well not represent Proust's original intentions either.
Come to think of it, perhaps only these hazy emotions can be considered each city's unique heritage.

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

从杜皮蓬的艺术馆转过街角，突然就看见一大幢雄伟而古老的市政厅。游客熙熙攘攘从建筑前面的大广场走过；有人吹起肥皂泡，引起儿童雀跃和追逐。天气逐渐转晴，云朵渐次飘过，房子顶层直插的法兰西国旗猎猎翻飞。五月中旬的阳光明媚得甚至有点炎热，而再远处是塞纳河、 湖心岛和圣母院……

这里是巴黎。虽然说不上魂牵梦萦，但我在无数小说之中，的确对这个城市有着特殊的期待。那些在我眼前延展开的地区和地名总是催生着一个一个的故事——不同的时代、不同的阶级。这个城市的历史如此厚重，然而却并没有显得非常压抑；在我想象中，那仿佛是活在另一个维度里面的少女，虽然见证了无数沧海桑田的变化，却依然慵懒得不肯为之改变一下容貌。

我幻想着自己踏出曲径，在豁然开朗的香榭丽舍大道上仰望天空，看阳光打在梧桐叶上、聆听这城市巨大的生命的悸动；在星形广场正中央、凯旋门，体味汉字和放射性街区交互的况味；沿着大道走向蒙马特，拜谒梵高呆过的艺术家集聚的高地；从远处观望埃菲尔，像老绅士一样批评这个与老派建筑格格不入的金属塔楼；接近黄昏时分点燃的拉丁区灯光，接近奥黛特的秘密生活和令斯万先生痛彻心扉的面纱；在夜深的红磨坊街区浪游，跟踪露姬小时候叛逃的青春；还有圣母院的钟声、塞纳河的游船……啊！巴黎，那些神奇的人物和故事依次登场，请让我拜服在你的裙裾之下！

可事实上呢，我只能像一个普通的游客一样背着背包，和另外许多普通的游客一起穿梭和消失在这个城市嘈杂的背景之中。我尝试了无数次，想要接近那种心情——可我看到的又是什么啊？红磨坊的门前的垃圾被大风吹起，塞纳河脏污的流水，莎士比亚书店前成群排队的参观者……天空、低垂的乌云截断了本该自由驰骋的灵魂！我想象中的这座城市充满梦幻，但眼前的风景却是确凿得那么刺眼的真实。

我不久前还对这样的差异疑惑不解，这百年之间旅游方式的巨大改变。我见过无数次，从西伯利亚荒原到西欧展开社交季的俄国贵族，从内陆的城堡到地中海沿岸越冬的贵妇人，或者从美国到欧洲大陆的旅行家——他们候鸟般的生活方式使你根本不能说哪里才是他们真正的定居点。他们在那里，为了消夏而呆在郊区，为了调养而住进温泉疗养院，即使有人告诉你他们将在那里住上一整年、十年、一辈子，你也几乎不会感到有任何惊奇。

可是自从有了护照之后、我们仿佛瞬间被强制成为了某种身份，强制在某个地方安家，而否定其他地方可以长期留宿的权利（当然这也不全是护照的错）。我们用七天游玩五个国家，用二十五天看完一个大洲，然后又回到和出发前一模一样的轨迹当中。我们的生活方式发生了任何改变吗？不、不、在每一个城市，我们都像径直走进他人宅院然后大声点菜的不礼貌的客人。因为旅途劳顿而在一家咖啡馆休憩的人，为什么竟会大言不惭地说自己体会到了正宗的巴黎风貌呢？所有旅行网站上的游记，不过都是攻略和待办事项列表的杂合而已；而品评游记高低的，并不是记述人的生活情趣和理念，而是旅行的效率。美！美！美！那些评论大声呼号，仿佛景点和阅历是可以相提并论的东西一样；而我觉得最高的赞美，不过是你照出了明信片一般的照片……能从短期的高强度旅行中看到除景点以外东西的人，少之又少。

如果可能，我真想做一次毫无攻略的旅行。不是从一个景点用最短的时间最经济的方式奔波到下一个景点，而是采用随机性的邂逅，发现这个城市的某种必然性——那种巴黎圣母院必须伫立在巴黎的必然性。若非如此，那么圣母院作为一个景点出现在罗马，我们也可以放肆地留影了（然而很不幸，现今大多数旅行都是这样地没有营养）。

这是双重的隔膜，双重的打击！作为一个幻想家只能看到析居于日常之上的瞬间真实；作为一个匆匆的游客却看不到这个城市通过几百年的静默生长而沉淀的那些宝贵之物。

是的！这些东西我们竟然无法改变！

再见了！帽檐上斜插着鸢尾小花的女人们！再见了！从王宫大道上骑马而过的器宇轩昂的火枪手！

可是如果我们脸皮足够厚的话，我们还可以这么说。

“所谓旅行，重要的并不是目的地，而是和谁一起同行。”

这么一说我突然想起成都人的郊游也不过是换个地方打麻将。油菜花田里也好，小溪里也好温泉里也好，重要的是不是风景，而是麻友和手气……人类！你们为了社交也是别出心裁。

说真的，我或将失去继续旅行下去的动力——尤其是，去那些实实在在地伫立了上千年，又必然会继续伫立千年的大都会。由于客观的现代化和主观的现代旅行主义——如韩少功所说，世界上所有的城市，越来越成为一个城市……我是不可能寻着那份车马鞍簪的优雅了。那份绰约的风致，仅仅在普鲁斯特童年里存在着——而我透过文字隐隐约约感觉到的那种类似的朦胧情感，也很可能也并不普鲁斯特的原意。

说起来，也许只有这份朦胧的情感，才算得上每个城市独特的遗产。`,__vite_glob_0_3=`---
title: 'Why Oran'
title_zh: '为什么是阿赫兰'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2015-06-13_为什么是阿赫兰.jpg'
date: '2015-06-13'
tags:
  - 'travel log'
  - 'europe'
tags_zh:
  - '游记'
  - '欧洲'
languages: ['en', 'zh']
---

When I traveled alone in southern France, the sun that rose in the east and set in the west always lingered long in the sky. Before six o'clock it was already bright, and at nine the sky remained clear; especially in the afternoons, the sunlight would beat down without any cover, making the entire city feel as if it were being strangled at the throat, leaving one thoroughly uncomfortable.
On the seaside promenades of every city, besides the tall palm trees, there were many movable dark blue iron chairs. At first glance, they seemed to be a thoughtful government welfare project designed for lustful tourists to concentrate on admiring the bikini beauties on the beach. But surprisingly, many locals also enjoyed sitting on them to rest; young people listened to music, while the elderly would read newspapers and work on the sudoku puzzles and word games in them.
Obviously, designing the chairs to be movable was a well-considered decision. As the sun's position changed throughout the day, people could move their chairs to keep themselves perpetually in the shade of the trees.
Southern France under the sun is beautiful, yet for tourists who must stroll along the seaside promenades, the sun's direct rays are not only a physical force capable of tanning the skin, but also a spiritual assault sufficient to ruin one's leisurely mood. I believe it is precisely this feeling that makes Singapore remarkably lacking in open-air sidewalks; and it is precisely the absence of this experience (tourists can spend almost their entire time in air-conditioned tour buses) that has earned Singapore its reputation as a garden city.
When I sat in the insufficiently air-conditioned bus heading toward Cannes, I would consciously or unconsciously mistake the cities we passed through for Oran—that city in Camus's work where the plague broke out. I certainly don't know the sequence of this reflexive thinking, but in any case, Oran and Nice, Cannes, though located on opposite shores, are all cities along the Mediterranean.
In Camus's eyes, Oran was a city "without imagination"; and under the influence of climate, it was filled with an air that was "both fervent and absent-minded."
I now strongly emphasize the compatibility between a person's nature and their environment. For instance, people in the tropics must develop the habit of afternoon naps, because during the hottest hours of the day, if people expect to concentrate and accomplish anything, it is almost futile. Only when you actually walk beneath the palms and blazing sun do you realize that only a carefree state of mind can allow one to live contentedly. Otherwise, if one still needs to persist in something or is eager to express some sentiment, you will be stirred to extraordinary irritation by these sweaty heat waves.
That irritation is almost a biological instinct—not the driving force of pressing forward in search of shade with determined effort, but rather an irrational attitude of irresponsibly continuing to expose oneself to an uncomfortable environment. You could almost say that people in such a state approach decadence. How to put it? In such moments, people possess this mentality—it wouldn't matter if the rest of life were spent this way. I think people from the tropics would hardly fear the eternal fires of Christian hell, because such burning does not make one focus on the heart-rending physical pain of one's own flesh, but rather drives one toward the dissipation of emptying the mind, a state of indifference to any situation.
The opposite is freezing cold. Conversely, cold compels people to concentrate. Even physically speaking, in cold conditions the pores contract and the entire body operates in a mode of storing heat—which corresponds spiritually to a state of inward compression.
Returning to the question: what kind of experience did the residents of Oran have during the plague? This setting by Camus, whether intentional or not, aptly deepened people's understanding of the mundane. The plague is terrible, yet people living long under the shadow of the epidemic will ultimately lose their initial experience of fear and anxiety, and can face this new normal as if nothing had happened. Camus said this "unambiguous reality" makes disaster less spectacular than anything else, and moreover, "the very duration of great misfortunes is monotonous." And I believe that under the climatic conditions of the Mediterranean's hot, dry summers, this dulling of perception would be quite markedly amplified; the dissipative mentality of "not wanting to care" would greatly accelerate the residents' adaptation process.
Finally, there seems to be no particular advice worth proposing as a conclusion. I have merely recorded an observable phenomenon and personal inner experience. However, from this example of mind-body interaction, we can also understand the wisdom contained in the saying "a calm mind naturally brings coolness"; and in this sense, are idealism and materialism still two extremes of ideological thinking?

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

我在南法独自旅行的时候，东升西落的太阳总是长久地滞留在天空之上。六点不到已经大亮，九点的天色依然晴朗；而尤其是午后的时候，阳光总是毫无遮掩地打下来，整个城市就像被扼住了咽口一般让人浑身难受。

每个城市的海滨大道上除了一株株高大的棕榈，还有许多可以活动的深蓝色铁制椅子。乍一看似乎是为好色的游客可以专心观赏海滩的比基尼美女而被细心安置的政府福利工程，可是令人意外的是，似乎很多当地人也喜欢坐在上面休憩；年轻人听音乐，老年人则会看报纸，顺带着做做报纸上的九宫格和words puzzle.

显然设计成可以移动的椅子是经过认真考量的。随着一天之中太阳位置的变化，人们就可以移动椅子让自己始终处于树荫之下。

阳光下的南法是美丽的，然而对于一定要漫步滨海大道的游客来说，太阳的直射不仅是一种可以晒黑肤色的物理力量，也是一种足以毁掉轻松心情的精神攻击。我相信正式这种感觉，才让新加坡异常地缺乏露天的人行道；也正是缺少了这种体验（游客几乎可以在开着冷气的旅行车里度过），新加坡才有了花园城市的美誉。

当我坐在空调开得非常不足的公交车中向着戛纳行进的时候，我总是有意无意地把途经的城市认做阿赫兰、那座加缪笔下疫病爆发的城市。我当然不知道这种思考反射的先后顺序，总之阿赫兰与尼斯、戛纳，尽管位于南北两岸，却都是地中海沿边的城市。

在加缪的眼中，阿赫兰是一座“毫无臆想”的城市；而在气候的作用下，充满了一种“既狂热，又心不在焉”的神气。

我现在非常强调一个人的天性与其身处环境之间的相性，比如热带的人民是一定要养成午睡的习惯的，因为在一天里最炎热的时刻，人们如果期望能集中精力做些什么事情，那几乎是徒劳的。当你切切实实走在棕榈和烈阳之下，你才知道只有那种蛮不在乎的心境才能让人过得怡然自得。否则，如果人还需要坚持什么东西，热衷于表达什么言语的话，你就会被这种汗涔涔的热浪搅得异常地烦躁。

那种烦躁几乎是一种生物性的本能，那并不是一种急于寻找荫蔽的一鼓作气往前走下去的推动力，而是一种毫无责任心地将自己持续暴露在使人不舒服的环境下的非理性态度。你几乎可以说人在那种状态下是接近堕落的。怎么说呢，在那种时刻人是拥有这样的心态的——余下的人生就这么度过也毫无所谓。我想热带的人民是不会怎么惧怕基督教中地狱的永恒烈火的炙烤的，因为所谓炙烤并不是会让人专注于关注自身肉体撕心裂肺的痛苦，而是驱使人将头脑放空的耗散，对任何情况不以为意的无所事事。

与之相反的是冰冻。从相反的意义上说，寒冷是迫使人集中精力的。即使从肉体上来讲，寒冷状态下的毛孔收缩，全身以贮存热量的形式活动着——这在相对应的精神上就表现为一种向内压缩的状态。

回过头来说，阿赫兰的居民在鼠疫中是一种怎样的体验呢？加缪的这种设定，无论说是否有意，恰巧加深了人们对于日常性的理解。鼠疫是可怕的，然而长期生活下疫情笼罩下的人们将最终失去担惊受怕的最初体验，而尽可以若无其事地面对这种新常态。加缪说，这种“现实的明白无误性”使得灾祸比任何东西都不壮观，而且，“巨大的祸患时间之长本身就十分单调。”而我相信，身处地中海夏季高温少雨的气候条件下，这种感知的钝感将会被相当明显地放大；“不想管”的耗散心态将大大加速居民的适应过程。

最后，作为结论似乎也并没有什么值得提出的建议。我仅仅是记述了一种可供观察到的现象和个人的内心体验。然而，从这种身心相互作用的例子中，我们也能了解“心静自然凉”所蕴含的理趣了；而从这个意义上说，唯心和唯物难道还是思想形态的两种极端么？`,__vite_glob_0_4=`---
title: 'One-Way Passage to the Japan'
title_zh: '片道东瀛'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2016-08-10_片道东瀛.jpg'
date: '2016-08-10'
tags:
  - 'travel log'
  - 'japan'
tags_zh:
  - '游记'
  - '日本'
languages: ['en', 'zh']
---

### Preface
The brief sojourn of merely one month filled my Japanese life so completely that scarcely any space remained for contemplation. Thus, I could only borrow this interlude after the journey's end—or rather, this "transition" between two modes of living—to organize the thoughts I had hastily jotted down into some semblance of coherent consciousness. This month's experience not only fulfilled a childhood yearning but also imbued the word "Japan" with entirely new meaning for me: it first represented the cities I had traversed and measured with my own steps; secondly, it embodied the remnants of fantasies in my heart; and finally, it signified my presence within it—that is, my very existence.
The title I have given this journal reflects precisely the meaning of "katamichi" in Japanese. That is to say, this journey precipitated some irreversible change—not merely the vanished time to which I can never return, but also the trajectory of my existence itself, drawn forth by this voyage.
Completely different from two-dimensional imaginings, this time I faced a real Japan—filled with reality, wrapped in reality, shaped by reality, and utterly real. And I existed within it, not as a concept or as a mere spiritual observer, but occupying actual three-dimensional space with my full bodily presence—which is to say, I participated in the creation of this world.

### 1.0 Kinkaku-ji and Ginkaku-ji
I awoke from my afternoon nap to discover I was merely two stops away from Kinkaku-ji.
The best purification ritual I could manage at that moment was to pull out my phone and access excerpts I had saved two years prior.
*The Temple of the Golden Pavilion*. That was my first encounter with Mishima. From that moment, I was assimilated by the dark crimson substance contained within those words. Unlike other writers, Mishima's works did not focus on reflecting the spirit of an era through its background—rather, he projected his own spirit within the times in which those stories unfolded.
—And Kinkaku-ji, with the absolute brilliance of its gold leaf, reigns over this world. Its magnificent robes are utterly incompatible with the surrounding natural scenery.
"I will not blend in with you."
It is itself an arrogant declaration. Thus beauty reveals its origins—rigorous uniqueness, and the purity and rejection derived from this irreproducibility.
Therefore, beauty is despair. Beauty yearns for destruction. Beauty is the harbinger of ruins.
"What Kashiwagi said might be true—that what changes the world is not action, but recognition."
It should have been so. But at Kinkaku-ji, I comprehended nothing beyond the sweltering heat brought by the clamorous crowds.
Which is to say, this was a terrible pilgrimage.
Yet those things, I unexpectedly grasped at Ginkaku-ji.

It was in the morning's fervent sunlight, walking hungry along the verdant Philosopher's Path, then ascending the mountain-built approach, when I suddenly entered a tranquil garden.
The hour was still early, so only scattered tourists were present. A monk was taking a rake to the gravel beach, furrowing neat rows in the stone.
I walked the winding path through the garden and stood on a small bridge, meaninglessly gazing at the massive carp swimming slowly in the water.
The dense, delicate leaves of those small maple trees were reflected minutely in the water—like blood vessels, or lung tissues—and beyond the branches were vast, leisurely, full clouds and the blue sky filling the entire background.
But it was not merely this. Through those seemingly symmetrical reflections—as if created to backup this entire world with photographic realism—you could still clearly see all the scenery at the pond's bottom. For instance, the pondweed, or the nearly motionless carp, or the vacant, level pond floor.
Then you try extending your head over the bridge's edge, and naturally you see your own image sinking into the water as well—and this metaphor-laden duality is thus complete.

That was a world of the other shore that existed dependent upon this shore. And your own existence was itself a contradiction: you were both an observer of this shore and a participant in the formation of the entire world on the other shore; that is to say, you were watching yourself participate in the world—or rather, you were being watched by yourself.
And what kind of world was that? The moss-covered rocks by the pond's edge seemed to form the frontier of a barrier, as if thereby maintaining the enormous tension of this entire pond—that Dirac sea-like capacity to embrace all things... Yet these ethereal images were ultimately only phantoms floating on the water's surface, and what emanated through this transparent medium with its serene, dark luster was only the eternally unchanging pond bottom. Thus, the overlapping reflections unfolding in this small pond belonged to two different worlds. And the one in which we exist is undoubtedly the more fragile—requiring only a ripple, a fish's tail-swish, and all things would be affected without exception. Which is to say, it does not exist here without foundation—it propagates through a medium.
And have you ever considered that this medium is the vast void that exists like a law? Therefore, the fundamental reason for the world's chaotic emergence lies in this—the world itself is a passage.


But how could this shore's momentary nature not also bring the illusion of permanence?
The pure sky above the maple trees, the rustling sound of wind through green leaves mingling with cicada songs... In such moments, I wanted to find a patch of shallow grass and lie down gently. Here was a powerful magnetic field that dissolved desire; when you looked around, everything enveloping you had stood quietly here for thousands of years and was destined to stand here for thousands more... The sun's rising and setting, the alternation of seasons—here these were but momentary things. It was like the cross-section of annual rings exposed on a felled tree: this vibrant cross-section still bore fresh, tender hues—but growth had ceased, forever maintaining the appearance of the moment it was cut.
Which is to say, this moment leads directly to eternity.

But could not this shore's momentary eternity also drive one to madness?
The pure sky above the maple trees, the rustling sound of wind through green leaves mingling with cicada songs... In such moments, I suddenly wanted to set fire to this entire garden. Here was a powerful curse that made one lose their soul; when you looked around, everything enveloping you had stood quietly here for thousands of years and was destined to stand here for thousands more... The sun's rising and setting, the alternation of seasons—here these were merely cycles repeating without change. Like the Dead Sea Scrolls, it precisely reproduced all prophecies in every moment—thus I became unable to bear it, wanting to escape this cycle. And the method of this escape was to utterly destroy this illusion of eternal life.
This is what we call Siberian hysteria, my friend. Humans always long for eternity while fearing it.

I have previously argued that beauty's uniqueness is the origin of purity and rejection. Eternity and uniqueness share the same source. Thus beauty's extension is clarity and brutality.
Clarity means sharpness, cutting, non-compromise, and all tendencies that refuse homogenization. Brutality is our fragile lives' pursuit of and revenge upon eternity. This is precisely what *The Temple of the Golden Pavilion* meant when it said: "On one hand, humanity's easily destructible form conjures fantasies of immortality, while Kinkaku-ji's solid beauty reveals the possibility of destruction. Things capable of death like humans cannot be eradicated, while imperishable things like Kinkaku-ji can be eliminated."
"The reason we suddenly become brutal is in such an instant: a bright spring afternoon, on carefully manicured lawn, gazing vacantly at sunlight playing through gaps in the leaves."


### 2.0 Roppongi
This was my first time seeing such a city.
When I looked out from the helicopter platform atop a Roppongi skyscraper, densely packed buildings filled all the ground space in my field of vision to the horizon. Occasionally high-rises clustered together, or transmission towers stood alone, like neural synapses for signal transmission, displaying some kind of regional aggregation phenomenon. As the fiery red sunset gradually faded, the entire city did not sink into slumber as expected, but through illumination and decorative lighting, showed excellent adaptation to darkness; in this stark contrast, it exhibited a kind of surging vitality even more apparent than in daylight.

This was my first time discovering cities could take such form.
When I rode the train around the Yamanote Line, from Shibuya to Shinjuku, to Ikebukuro to Ueno to Shimbashi to Shinagawa... every stop showed nothing but surging crowds and towering buildings, displaying extremely similar modernization.
The city where I was born and raised has very obvious growth rings—from the First Ring Road to the Second Ring to the Third Ring—these are the traces of how this city grew. Those small European towns can be recognized from afar by the towering spires or domes of their churches. That is to say, when you tour your hometown with friends, you can point to that square or that building and say, "Look, that's this city's **center**."
But Tokyo has no center. Or rather, it simultaneously possesses multiple centers. Of course, you could say this city had already taken substantial shape before modernization and never experienced any destructive blow (i.e., reset), thus creating today's chaotic **urban planning**.

But what makes you so confident that all this results from consequences of **human** planning? Put another way, isn't it possible that Tokyo as a city, as some kind of living organism, chose to **evolve** into this current form without a central nervous system?
What does this mode of aggregation signify? If you could ask that blonde genius girl who battles Angels, she would probably frown and say with a "tch," "This is really troublesome—**this thing** actually has multiple cores."
Which is to say, without simultaneously destroying all cores in one strike, this thing could still self-repair.
The key is, Tokyo is still far from its complete form. This city annually absorbs tens of thousands of young people's existence and aspirations like a hurricane's eye, indiscriminately—don't you feel this blood transfusion-like method of absorbing nutrients shares the same evolutionary strategy as those tropical carnivorous plants that dress themselves beautifully to hunt insects? —And Tokyo, in our eyes, is indeed full of charm.
Have you ever considered that super-cities like Tokyo, which transcend human definitions of cities, have development directions that have long escaped human control and no longer belong to us; or more frighteningly, if we are not merely its nutrients—more precisely, we are **components of this city's cellular structure**. That is to say, the most **insignificant** parts that can be replaced at any time.

Looking out from Roppongi's observation deck, after nightfall in Tokyo, all the building rooftops have red lights blinking. The meaning is probably this: we have evolved to no longer need sleep.
I couldn't help thinking of those people I saw in the last train cars, bodies carrying the smell of alcohol, collapsed and sleeping everywhere. In their bloated bodies constricted by uniforms, I saw only devastation. Women had become indifferent to their incomplete makeup, while men cared nothing about emanating body odor-filled sweat stench. They had suffocated behind masks all day and were too exhausted to care about anything else, let alone maintain the energy-consuming pretense and etiquette.
It's not only nuclear contamination that distorts people. Nor do all people willingly become distorted. But why does no one speak out against this systematic, collective withering caused by this system?
Probably those who thought of stopping have already vaguely realized that by now, no one can truly stop this machine anymore.
This simultaneously means that Tokyo's existence is **guiding** human development toward some kind of **inevitable conclusion**.

### 3.0 Sun Dogs and Full Moon
On the evening of July 18th, I boarded the Nozomi from Kyoto back to Tokyo. Sunlight gradually lengthened and disappeared in the car, and thus night also rose.
The train passed through the spaces between cities, and the scattered lights leaking from the buildings rushing past on both sides reminded me of the "leaping fishing fires" in Lu Xun's "Social Drama."
Of course, there was another far brighter light source. The ancients' observations were certainly not without reason—that full, round moon stood out against the darkness, truly like a disk suspended in the firmament without any support.
Of course, the ancients did not have today's means to travel a thousand li in a day. Therefore, in their eyes, this round, jade-like full moon obviously symbolized benevolent blessings.
But if you board an express train, this blessed manifestation becomes a kind of unsettling **threat**.
I mean, in the entire empty darkness, only this object is intensely **watching** you. And when you try to meet its gaze, try to discern some meaning from this **stare**, you discover that bright, almost dazzling radiance contains no metaphor or meaning—only vast emptiness. Yet this force does not expand outward, does not rush to illuminate the surrounding dimness, but obediently curls up within that small circular formation. That is to say, this disk undoubtedly possesses some highly destructive **potential energy**—and given its violation of the principle of free diffusion, this restraint indeed demonstrates some kind of **intelligence**.
You follow the train in rapid movement, but this is useless—that fountain of light continuously follows you—no, tracks you, aims at you, and effortlessly maintains **relative stillness** with you. And relative stillness means immovable **gaze**, inevitably accurate **gun barrel**, and inescapable **destiny**.
I imagine the declaration of final judgment might be exactly like this.

Also, on the evening of July 30th, I was flying from Taipei to Singapore via connecting flight.
I had specifically booked a starboard window seat, thinking I could enjoy a magnificent sunset from the plane. But the weather over the Pacific that day was not particularly good—the sun was shrouded by thin cloud layers, making the entire sky appear gray and hazy.
Disappointed, I could only open a movie I had prepared on my computer, then fell asleep during the journey. When I awoke from my brief rest, a hazy halo had somehow grown around the sun.
Of course, I knew this was merely a weather phenomenon called a sun dog. But when I had looked up at it before, this ring was parallel to the ground—but this time the view was vertical, and visually, the ring's lower portion seemed to reach directly to the sea surface. On the symmetrical left and right sides of the ring were two brighter light spots—so-called "phantom suns."
I pressed myself against the window, greedily observing this uncommon sight, trying through careful observation to preserve it in my memory.
Perhaps from staring at the sun too long, I became dizzy—that is to say, I perceived the "symbolism" behind this structure.
Yes, before this, I had experienced a terrifying stare-down with the bright moon; and if the full moon represented the **omen of being locked on**, then the sun dog was the divine **weapon** for divine punishment.

I think Anno Hideaki must have borrowed from this sun dog image when designing Ramiel's attack mode. And I, as a junior, connected the two through reverse reasoning:
The outer ring is the power source and adjustment tool for the entire structure, and through some principle of reflection, superposition, or intersection, focuses its energy to the ring's center—that is, that precise heat source. Similarly, that is also a **gun barrel**. But compared to the full moon, because of that light ring, it appears to have more precision capable of striking vital points.
The world outside the window was a vivid world. It was a vast space constructed of thin atmosphere and equally thin cloud layers, and this massive, clear sun dog totem undoubtedly proclaimed some rule-violating, world-reconstructing, heaven-and-earth-opening primordial power.
So that was a stigmata.

### 4.0 Farewell Forever
By now, whether clouds drifting past the window or high-voltage power lines on fields whistling by, none of it feels fresh anymore. Only out of a photographer's instinctive pursuit do I stare vacantly at those fleeting scenes.
Those scenes merely recreate certain journeys I have continuously experienced. If one ignores the differences in departure points and destinations, this act of "transition"—or passage—becomes some kind of deliberately ritualistic farewell.

When did I begin to grow accustomed to departure?
Each time I step alone into a train car or aircraft cabin, pragmatically stow my luggage, take my assigned seat, I can still sense from surrounding passengers an excitement beyond words; of course, this might be the residual conditioned reflex from years ago, when I was still thrilled by every departure.
This unfamiliar seat holds for me a strange familiarity, or what might be called a sense of "overlap." That is to say, I can still feel the ripples of countless similar scenes spreading through my memory—just as I can recall the different star-filled skies I've seen from airplanes, or the seasides and countryside passed by trains.
And this familiarity makes me feel that this transitional state is actually the normal condition—thus I find peace of mind in the very act of embarking on journeys.
That is to say, the sense of belonging I feel lies not in longing or reminiscence, but in the ambiguous zone between farewell and embrace—which also precisely represents my emotional contradiction between expectation and aversion toward forming bonds with others.

When did I begin to be infatuated with departure?
Wishfully thinking I deserve a better life, or wishfully believing I will transform the hell I'm about to face into heaven... In the end, my indifference toward bygone days has reached such a decisive degree.
Some things, even when I clearly recognize them as "ichigo ichie"—unique experiences irreproducible at any level—I feel no hesitation or reluctance when bidding them farewell.
This is partly because of some persistent obsession with the future, thus not being constrained by past burdens; and partly because I have developed a kind of disappointment and fatigue toward uniqueness itself.
If the world is governed by causality and purely random events, then no matter what form of unique events we miss, they will certainly appear in the future in another guise. Therefore, there are only two measures for uniqueness: first, there is nothing new under the sun; second, every experienced moment is unique. Either statement negates the value of any particular moment as worthy of remembrance for existing as a unique moment.
Before realizing this, I had believed there was something called a "near-field zone"—a shadow area around me. Within this I could obtain some kind of **static relationship**—unchanging streetscapes, identical greeting patterns, seemingly seamless friendships, permanent family bonds. This notion formed precisely because every time I returned home during holidays, I would order the same three liang of plain pepper and mixed sauce noodles with vegetables at the same noodle shop downstairs—and the same bustling customers and shouting and identical taste stimuli created the illusion that at least in certain areas, time had stopped.

However, just this past bitter March, I suddenly learned of my grandmother's death.
I wanted to cry, but this was not a bolt from the blue, but a reasonable, even logical conclusion I stubbornly refused to acknowledge.
When I returned to Chengdu during February's Spring Festival, although her condition was stable, grandmother was already lying weakly in her hospital bed. Even then I spent a long time confirming before I could believe—grandmother, who had still been healthy during last summer's vacation, why had she suddenly become so frail?

Yes, I had clearly glimpsed that fracture in time, yet I still believed that when I next returned home, this fracture would heal and all discord would be reconciled.
But it did not unfold as I expected. Because there was never any time that could pause or reverse. The shells of things are like buildings weathered by wind and frost—their internal decay happens moment by moment, but collapse is instantaneous—this is the **developmental trajectory** of things.
After experiencing other even more lonely and sorrowful things I prefer not to recall, I finally abandoned that already hole-riddled notion of a "near-field zone."
And this realization that suddenly exposed me **completely** to the chaotic rotation of external things first made me **truly feel** the bone-chilling loneliness of my solitary existence and the desperate desolation all around. It was also at this moment that I truly discovered the relief and certain twisted pleasure of having complete control over myself.
No more shadow zones. Except for my own self, the entire world was a thorough, irrelevant to me, clear wilderness. Understanding this principle brought me relief instead—I finally need not be responsible to anyone and could be openly selfish.

I was free. Although the external world imposes many restrictions on me, what produces countermeasures is "I" as an absolutely individual existence with truly independent thought.
Previously, I had seriously agonized over the question of settling down. I thought as a child's obligation, I should care for my parents—yet I harbored more longing for another continent, which made me feel irritated and at a loss. Now? This problem was easily resolved. I would no longer be constrained by so-called filial duty—that is to say, even if I chose to care for them, my starting point would be repayment for their nurturing or kindness, not according to any obligation that must be fulfilled.
Yes, I finally grew accustomed to constant loss. Because I finally realized that apart from the self, there is nothing I can truly possess.
And with the wilderness clear, I must therefore become more cruel.

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

前言

区区一月的短暂停留让我的日本生活直充实到几乎没有筛出任何可供思考的空隙，于是，我便只有借在这旅行结束之后的间隙、或称两种生活接轨的“过渡”，将当时速记下来的思考好歹整理为一种连贯的意识。而这一个月的体验，不仅完成了我自儿时起的憧憬，也让“日本”这个词对于我有了全然崭新的意义：它首先代表了一个个我丈量而过的城市、其次代表了我心中幻境的遗迹、最后代表着我在其中的行踪，也即我的存在。

我给这篇日志命名的含义，正是“片道”在日语中的本意。这就是说，这次旅行引起了某种不可复原的改变——不仅是我再也无法回去的、业已消逝的时光；同时也是指我的存在本身的行迹，由这旅途牵引了。

和二次元的构想完全不同，这一次我面对的，是一个现实的、被现实所填充的、被现实所包裹的、又由现实塑造的、现实的日本。而我身处其中，并不以概念的形式、或徒具灵体的旁观者，而是在三维的空间中实实在在地占据了等身的体积——这就是说，我参与了这个世界的创造。



1.0 金阁寺、银阁寺

我从午睡中惊醒，才发现距离金阁寺不过两站的距离。
此时我能做到的最好的净身仪式，就是掏出携带电话，访问两年前留下的摘抄。
《金阁寺》。那是我与三岛的第一次接触。也就是自那时起，我被那些文字中蕴藏的暗红色物质同化了。和其他作家不同，三岛的作品并没有着力于透过时代的背景反映时代的精神——他是在那些故事发生的时代中，展现他自己精神的投影。
——而金阁寺，以其金箔上绝对的闪光，君临这个世界。它那袭华美的袍泽，与周围的自然风物格格不入。
“我不会融入你们。”
它本身就是一个傲慢的宣言。由此美便展现了它的根源——严密的一次性、以及由此不可复制性派生的纯粹和拒绝。
因此，美是绝望的。美是向往破坏的。美是废墟的前兆。

“柏木所说的事或许是真的，他说，改变世界的，不是行动而是认识。”
本应是这样。但在金阁，我并没有领悟到除了嘈杂人流带来的燥热之外的其他东西。
也就是说，这是一次糟糕的圣地巡礼。
但那些东西，我却意外地在银阁寺领悟到了。

那是在清晨热烈的阳光中，我饿着肚子走过郁郁葱葱的哲学之路，又踏上依山而建的参道，就突然间就迈入了一个清幽的庭园。
时间尚早，因而也只有三两稀疏的游客。寺里的僧人正拿着犁杖在碎石滩垄出一犁犁工整的沟洫。
我走过蜿蜒穿越庭园的小径，站在小桥上，无意义地眺望水中缓慢游动的庞大鲤鱼。
那些小枫树茂密而精致的树叶细密地倒影在水中；简直就是血管，或者肺叶——而枝杈以外，就是大片大片悠然而饱满的云朵，和填满整个背景的蓝天。
但并不仅是这样。你透过那些仿佛以对称构建的、有如是用来备份这整个世界的逼真倒影——你仍然可以清楚地看见池底的所有景物。比如说荇草、或几乎静止的鲤鱼、或者空旷而平整的池底。
然后你试着将头伸出桥面，当然你就看到自己的影像也沉入了水中——而这个满含喻意的二义性也就完成了。

那是一个依附于此岸而存在的彼岸的世界。而你本身的存在也是一个矛盾：你既是此岸的观察者，又在彼岸参与整个世界的形成；也就是说，你正注视着参与世界的自己——又或者说，你被你自身注视着。
而那又是一个怎样的世界呢？池边的长满青苔的岩石仿佛构成结界的边疆，仿佛借此可以维持整潭池水那包容万物的狄拉克之海般的巨大张力……可是这缥缈的影像终究只是浮在水面的幻影，而透过这种透明介质泛出沉静而黝黑光泽的，只有亘古不变的池底。所以，在这片小小塘池中展开的重影，隶属于两个不同的世界。而我们在其中存在的那个，无疑是更为脆弱的——只需一个涟漪，一次鱼的摆尾，所有事物都会无一例外地受到波及。这就是说，它并不是毫无依凭地存在与此的——它是在介质中传播的。
而你有没有想过，这种介质，就是宛如法则般存在的巨大虚空。因此，世界混沌缘起的根本在于——世界本身就是一条通道。
（而我今早又读起王安石《桂枝香•金陵怀古》中的句子，觉得这上下两阕之间的对比正好体现了倒影和池底那种瞬时与永恒、变与不变之间的重叠关系：
登临送目，正故国晚秋，天气初肃。千里澄江似练，翠峰如簇。征帆去棹残阳里，背西风，酒旗斜矗。彩舟云淡，星河鹭起，画图难足。
念往昔、繁华竞逐，叹门外楼头，悲恨相续。千古凭高对此，漫嗟荣辱。六朝旧事随流水，但寒烟衰草凝绿。至今商女，时时犹唱，《后庭》遗曲。）

可是此岸的瞬时又何尝没有带来永久不变的错觉呢？
枫树上纯净的天空，风拂过绿叶发出的沙沙声响、和着那阵阵蝉鸣……在这种时刻，我就想找一片浅浅的草丛轻轻躺下。这里有着消弭欲念的强大磁场；当你望向四周，包裹你的全部，都在这里静静地伫立了千百年，又注定还要在这里千百年地伫立下去……太阳的东升西落、四季的更替变换，在这里不过是一瞬间的东西。它就像是被砍伐的树枝上暴露的年轮的切片：这生机勃勃的断层还充满了新鲜而娇嫩的色泽——但生长已经停止了，它永远维持着被砍伐瞬间的容貌。
也就是说，这个瞬间是直通永恒的。

可是此岸瞬时的永恒性何尝不会让人丧失心智呢？
枫树上纯净的天空，风拂过绿叶发出的沙沙声响、和着那阵阵蝉鸣……在这种时刻，我突然想一把火烧毁这整片的庭园。这里有让人丢失魂魄的强大咒力；当你望向四周，包裹你的全部，都在这里静静地伫立了千百年，又注定还要在这里千百年地伫立下去……太阳的东升西落、四季的更替变换，在这里不过是一次一次毫无改变的轮回。它就像死海文书一样在每个瞬间准确重现了所有的预知——于是我变得无法忍受、我要逃离这种轮回。而这种脱离的方法，就是将这种永生的幻想破坏殆尽。
这就是我们所说的西伯利亚癔病啊，我的朋友。人总是憧憬永恒而惧怕永恒的。

我以往论述过，美的一次性是纯粹和拒绝的起源。而永恒和一次性同源。因而美之引申，就是明晰和残暴。
明晰的意思，就代表着尖锐、切割、不妥协、以及一切拒绝同质化的倾向。而残暴，则是我等脆弱之生命对永恒的追求和复仇。这正是《金阁寺》中说 “一方面，人类容易毁灭的形象反而浮现出永生的幻想，而金阁坚固的美反而暴露出毁灭的可能性。像人类那样有能力致死的东西是不会根绝的，而像金阁那样不灭的东西却是可以消灭的。”
“我们之所以突然变得残暴，那是在这样一瞬间。即一个明媚春天的下午，在精心修剪过的草坪上，茫然地眺望着从树叶缝隙筛落下来的阳光戏耍的一瞬间。”
【我的少年时期混浊成黎明的灰暗。黑暗的影子的世界是可怕的，但白昼似得轮廓分明的生，也不属于我。】



2.0 六本木

我还是第一次见到这样的城市。
当我从六本木高楼楼顶的直升机平台放眼望去，鳞次栉比的房屋挤满了视野里到地平线的所有地面空间。而间或高楼聚合成丛，或电波塔兀自耸立，仿佛某种信号传递的神经突触，显出某种区域性的聚集现象。当天边的火红的晚霞渐渐失色，整个城市并没有像预想中一样沉沉睡去，而是借由灯光的照明和装饰，显出了对黑暗良好的适应性；而在这种强烈的对比中，甚至较白昼更为昭然地体现出某种涌动的活力。

我还是第一次发现城市居然还有这种型态。
当我从沿山手线乘坐电车环行，从涩谷到新宿，到池袋到上野到新桥到品川……每一个停靠的站点，无非人潮涌动、高楼林立，显出了及其相似的现代化。
我出生和长大的城市，拥有非常明显的年轮——从一环路到二环到三环——这就是这个城市如何成长的留痕。欧洲那些小镇，也可以从远处就早早眺望到教堂高耸的塔楼或穹顶。就是说，当你带着友人环游故乡，你可以指着那片广场或者那栋楼房说，“看、那就是这个城市的**中心**。”
但东京没有中心。或者说，它同时拥有复数个中心。当然，你可以说这个城市在现代化之前已经初具规模，并且没有经历任何毁灭性打击（也就是重启），因此造成了今天这种混乱的**城市规划**。
可是，你究竟凭什么自信认为这一切，都是**人为的**规划造成的后果呢？换种方式说，有没有这种可能，是东京这个城市作为某种生命体，它自己选择**进化**成了如今这种没有中枢的形态。
这种聚合方式究竟意味着什么呢？如果你能去问问那个和使徒作战的金发天才少女，她大概会“切”地皱皱眉头然后告诉你说，“这可真是棘手啊，**这家伙**居然拥有多个核心。”
也就是说，不同时一击摧毁所有核心的话，这家伙就仍然可以自我修复。

关键是，东京离它的完全体还差得远呢。这个城市每年如同飓风风口一样毫不挑剔地吸收数以万计的年轻人的存在和憧憬——你有没有觉得，这种如同输血般的吸收营养的方式，和热带那些把自己打扮得花枝招展而捕猎昆虫的食肉植物，有着同样的进化策略。——而东京，在我们眼里，也的确是充满魅力的。
你有没有想过，像东京这种超越人类对城市定义的超级城市，其本身的发展方向，早已经脱离人类的掌控，并不为我们所有了；或者更为可怕的是，如果我们不仅仅是它的养料的话——更为贴切地说，我们是这个城市**细胞结构的组成**。也就是说，是随时可以替代的、最**无关紧要**的部分。

从六本木的观景平台望去，入夜后东京，所有大厦楼顶都有红灯闪闪烁烁。那意思大概就是说，我们已经进化到不需要睡眠了。
我就没办法不去想那些在终电的车厢中看到的、那些身上带有酒气的四处瘫倒而眠的人，我在他们被制服勒住的臃肿躯体上看到的只有摧残。女人对自己残缺的妆容早已漠然处之，男人则毫不在意地散发着充满体味的汗臭。他们在面具之下窒息了一天，已经累得无暇他顾了，更何况是矜持和礼仪这种需要费劲维持的东西呢。
并不是只有核污染才会让人变得扭曲的。也并不是所有人都意愿被扭曲的。但这种制度所引发的群体化的凋零，为什么没有人为之发声呢？
大概那些想过停止的人已经隐约意识到，事到如今，已经没有人可以真正停下这个机器了。
这同时也就是说，东京的存在，正在**引导**人类的发展朝着某种**必然性结局**推进。



3.0 日晕和满月

7月18日的傍晚，我乘上希望号从京都回往东京。阳光在车厢中逐渐拉长和隐没，于是黑夜也上升了。
列车在一个个城市的中间穿过，而两旁簌簌而过的楼房中漏出的点状灯光，让我想起了鲁迅社戏中“踊跃的渔火”。
当然还有一个远为明亮的光源。古人的说法显然是不无道理的，那轮饱满的圆月兀自凸显在黑暗之上，简直就是一个不依靠任何支撑就悬挂在天穹的圆盘。
当然，古人并没有如今这种手段可以一日千里地飞驰。因此，在他们眼里，这轮圆润的玉石般的满月，显然充满了施降恩惠的福祉的象征。
但如果乘上急行电车的话，这个充满祝福意义的展现，就变成了某种令人坐立不安的**威胁**。

我是说，在整个空无一物的黑暗之中，唯有这个物体在强烈地**注视**着你。而当你尝试与之对视，尝试从这种**目光**中探寻出什么意义的时候，你会发现那明亮到几乎耀眼的光芒毫无暗喻和意义、只是充斥着巨大的虚空——而这种力量却并没有向外膨胀，并没有急于去照亮周围的黯淡，而是规矩地蜷缩在那个小小圆阵之中。也就是说，这个圆盘无疑拥有毁灭性极高的某种**势能**——而且以其对自由扩散原理的违背来看，这种克制确实体现出了某种**智慧**。
你跟着列车做着快速移动，但这并没有什么用处，那个光之泉眼一直追随着你——不，是跟踪着你、瞄准着你，而且不费吹灰之力地和你保持**相对静止**。而相对静止的意思就是，不能移走的**凝视**，必然命中的**枪口**，以及无法逃避的**命运**。
我猜想，末日审判的宣言可能与此别无二致。

又，7月30日的傍晚我正乘飞机从台北转机飞往新加坡。
特地预订了靠右舷窗的座位，我原以为可以在飞机上欣赏壮美的日落。但那天太平洋上的天气不见得怎样的好，太阳那被那些薄薄的云层笼罩，使得整个天空显得灰蒙蒙的。
我惘然若失地只好打开电脑里预备好的电影，又在途中陷入睡眠。而当我再次从小憩中清醒过来，太阳的周围不知何时长出了一转朦胧的光圈。
当然，我知道这只是叫做日晕的天气现象。可是以往仰头看到的时候，这个圆环是平行于地面的——但这一次的景象是垂直的，就视觉效果来说，圆环的下部仿佛直达海面。而在圆环的对称左右两侧，也各有一个更为明亮的光斑，也就是所谓的“幻日”。
我将自己贴上舷窗，贪婪地注视这种并不多见的景象，尝试通过细致的凝视将其保存于脑海。
也许是盯着太阳看的太久的缘故，我产生了眩晕的感觉，就是说，我观测到了这种结构背后的“象征性”。
是的，在此之前，我曾和皎洁的月亮有过一次骇人的对视；而如果说满月代表了被**锁定的预兆**，那么日晕就是施加天罚的“神明的**武器**”。
我想庵野秀明在设计雷天使的攻击模式的时候应该就是借助了日晕这个形象。而我作为后辈，则通过逆推将两者联系到了一起：
外侧圆环是整个结构的动力来源和调整工具，而通过某种法则的反射、叠加或者交叉，将其上的能源**聚焦**到了圆环中心——也就是那个精准的热源。同样，那也是一个**枪口**。但比起满月，因为那圈光环的缘故，显得更加具有可以直击要害的精确性。
舷窗外的世界是一个鲜明的世界。它是由稀薄的大气和同样稀薄的云层构筑的广袤空间，而日晕这个巨大而明晰的图腾无疑宣告了某种违反规则的，足以重构世界、开天辟地的洪荒力量。
所以说，那是一道圣痕。



4.0 后会无期

事到如今，无论是窗外飘过云朵或是田野上的高压电线杆呼啸而过，我都再不会感到新鲜。只是出于摄影爱好者的天生的追逐，而痴痴呆望着那些一闪而过的景色。
那些场景，不过是重现了某些我不断历经过的旅途。如果无视出发点和目的地的不同，这种“转换”或称为过渡的行为，便是某种不得不刻意为之的仪式般的告别。

我是从何时开始习惯于出发的呢？
每次独自踏进车厢或者机舱，我事务性地搁好行李，坐上指定的席位，我仍能从周围乘客的身上感受到一种溢于言表的激动；当然，这也许是多年前，当我还在为每一次离港兴奋不已的条件反射的残留。
这陌生的座位于我却有一种异样的熟稔，又或者称之为“重叠”的感觉。那即是说，我仍能感受到起无数次相似场景在我记忆中漾开的余波，那正是我能回想起的在飞机上看见过的不同情状的星空，或者列车上驶过的海滨和田园一样。
而这种熟稔让我感到这种过渡状态反而才是常态——于是我在这踏上旅途本身这一行为中，找到了心安的感觉。
也就是说，我所感到的归属感并不在于憧憬或者追忆，而是介于告别和拥抱之间的暧昧地带——这也刚好代表了我对与人产生羁绊的期待和厌恶的感情矛盾。

我是从何时开始迷恋于出发的呢？
一厢情愿地认为自己配得上更好的生活，或者又一厢情愿地以为自己要将即将面对的地狱改造为天堂……到头来，我对逝去时日的淡漠竟业已达到了这样干脆的地步。
有些事情，哪怕我清楚地认识到那是“一期一会”这种在任何层面都不可复制的独特体验，我在告别的时候都不会有一丝犹疑或者不舍。
这一方面是因为我对未来某种锲而不舍的执着，因而不会拘泥于过往的拖累；而另一方面则是因为，我对独一无二这种性质产生了某种失望和疲劳。
如果世界是被因果律和纯粹的随机性事件支配的话，那么无论我们错过任何形式的一次性的事件，它都肯定将在未来以另一种面貌出现。因此，衡量独特性的标尺无非只有两把：其一是说，太阳底下并无新事；其二是说，经历的每一个瞬间都是独特的。而无论哪一种说法，都否定了某一瞬间作为独特瞬间的存在而值得铭记的价值。
在我意识到这一点之前，我原以为，我身边有一种叫做“近场区域”的影子地带。在这中间我可以获得某种**静止的关系**——不变的街景、相同的问候方式、看似没有裂痕的友谊、永久的亲情纽带。而这种观念的形成，正是每次放假回家之后，我在楼底的同一家面馆点上同样的三两素椒杂酱面配青菜——而同样熙攘的顾客和吆喝和同样的味觉刺激，让我产生了至少在某些地带，时光是停止的错觉。

然而就在今年苦闷的三月，突然间，我就得知了奶奶过世的消息。
我想哭，可是这并不是晴天霹雳的噩耗，而是合理的、甚至顺理成章的我却死死不肯承认的结局。
在我二月的春节回成都的时候，尽管病情稳定，奶奶就已经衰老地躺在病床上了。那时我也花了很长时间的确认才能相信，明明在上个暑假的时候依然康健的奶奶，为什么会突然间就虚弱下去了呢？
是的，我明明已经好好地瞥见了那个时光的断层，然而我仍然以为在我下次归家之时，这个断层将会复原，而一切龃龉都会和好如初。
然而并没有我所期待的展开。因为本就没有可以停驻和倒溯的时光。事物的外壳亦如历经风霜的建筑——它内部的崩坏是时时刻刻的，但坍塌却只是一瞬的事——这本是事物的**发展轨迹**。
而之后或多或少又经历了其他我所不愿追怀的更为寂寞和悲哀的事情，我才终于放弃了那早已漏洞百出的“近场区域”的想法。

而这种将我突然**完全**暴露在外物混沌的旋转之中的顿悟，第一次让我**真正感到**令人毛骨悚然的自己孑然的存在，以及周遭令人绝望的荒凉。而也就是这个时刻，我才真正发现完全掌控自己之后的轻松和某种扭曲的快意。
再没有影子地带了。除了我自身以外，整个世界就是彻头彻尾的、与我无关的、明晰的荒野。明白这个道理，我反而如释重负——我终于不必为任何人负责、可以明目张胆地自私下去了。
我自由了。尽管外界对我施加了诸多限制，但为此产生对策的，则是“我”作为绝对个体存在的真正独立的思想。
在以前，我曾经认真纠结过定居的问题。我想作为子女的羁绊，我得照料父母——然而我对另一片大陆有着更多的憧憬，这就让我感到烦躁和无所适从。现在呢，这个问题迎刃而解了。我将不再被所谓孝道所拘束，也就是说，即使我选择了照料他们，我的出发点是对养育的回报或者善意，而不是依照任何必须完成的义务。
是的，我终于习惯了不断失去。因为我终于意识到除了自我之外，没有什么东西我能真正拥有。

而荒野明晰，我也因此必须变得更加残忍。`,__vite_glob_0_5=`---
title: 'Years of Pilgrimage - Switzerland'
title_zh: '巡礼之年 - 瑞士'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2017-05-01_巡礼之年.jpg'
date: '2017-05-01'
tags:
  - 'travel log'
  - 'europe'
tags_zh:
  - '游记'
  - '欧洲'
languages: ['en', 'zh']
---

The gentle piano melody grows stronger, shifting to Liszt's *Années de pèlerinage*.
First Year: Switzerland.

Gazing down from the airplane window, the town beneath the winter snow lies quiet and soft, like white clouds slowly gathering by the lakeside, almost carrying a hint of wine's fragrance born from long fermentation—and this is Geneva. As an international metropolis, it embraces world-renowned organizations including the Red Cross, the World Health Organization, the United Nations Office at Geneva, and CERN.

Yet I would say it feels more like a small town. Rather than its prestigious title as the world's capital of horology, the Flower Clock is merely a small urban corner that locals might pass by during their strolls. What I prefer more is this: on a spring afternoon caressed by gentle breezes, munching on a sandwich while watching birds leave swift silhouettes across the sky—almost like the fleeting contrails against the azure heavens. Those leisurely fluttering flags remind you that these emblems represent the world's most advanced banking industry; but you don't particularly care. Hey, you suddenly wonder, might Rousseau have once sat on a bench like this, gazing toward the French mountains across the lake, contemplating his world-shocking *Social Contract*?

Following the crescent-shaped lake northward, half an hour brings you to Lausanne. I lingered long in the central train station. Everywhere, hurried human figures intersect, and amid this chaos I tried to find a shadow from the last century—Marguerite Lecœur—who had escaped from Patrick's *Horizon* and once rested here briefly. But it's impossible; she belongs to another dimension of time, one more suited for disappearance than forgetfulness.
So let us climb those not-too-steep slopes planted with vineyards—I think you'll love these wines wrapped tight with sunshine! Lake Léman shimmers below with varying shades of blue-green; and if you continue to gaze into the distance, perhaps you can see another small, winding town at the foot of the mountains on the opposite shore.
Hey, that's Évian! Yes, indeed the very Évian of Évian mineral water!

Let us sail eastward! At the eastern end lies Chillon Castle. You walk beneath those towering battlements that have endured wind and snow (a full ten centuries of storms!) yet remain steadfast, but still cannot conjure any romantic reverie. Because supposedly, residents of ancient Europe without drainage systems would, every morning from their second floors, dump their overnight filth down into the streets—right where you're standing now!
Descending into the dungeon, the world seems stripped away, leaving only the sound of water. Peering through the iron bars, the dazzling lake surface reflects like candles, illuminating the graceful silhouettes of distant mountains while perhaps also burning away the prisoners' last drops of hope.
But then again, who says foreigners don't scribble on ancient monuments? Those pillars are also covered layer upon layer with Latin letters; only that even in such crowding, Byron's signature, formally framed, remains particularly conspicuous.

Following the railway northward, let us witness the equally absurd natural landscape of this nation of stunning wealth, as the train announcements shift from French to German. Station names counted along the way: Thun, Interlaken, Lucerne... They will shamelessly drain your camera's battery and memory; after all, honestly, when you leave the bustling metropolitan area and are suddenly exposed to such mountain and water scenery, what else can you do but express your awe through stunned silence? As for me, I can't believe I would actually shed tears just from gazing at the reflection of snow-capped mountains... Young Werther spoke truly—this magnificent divine power has absolute strength to penetrate the heart, making this joy sacred and pure.
The train stops: Zurich. This "super" city that contributes over twenty percent of Switzerland's GDP perhaps also contains over twenty percent of the entire nation's liveliness, which for a country that is essentially a vast pasture provides just the right comfort—not too quiet. Sitting in a café on an ancient street, occasionally young people who look like university students pass by in groups, reminding you that ETH Zurich was Einstein's alma mater. On the evening streets, the gradually fading and lengthening sunset ignites the streetlights. Restaurants light their candles as dinner begins: trams carry the rich aroma of cheese fondue through the city. And I climb the twin towers of the cathedral, leaning over the not-so-spacious platform to watch the entire city gradually fall asleep as expected. In this slowly condensing twilight, Orion is washed ashore onto the night sky by the tide.

The terminus heading north, the city of a thousand steps almost at the border: St. Gallen. Starting from the outside, you tirelessly break through arc after arc of residential barriers, finally, after passing through yet another narrow alley, suddenly finding yourself on an incongruously open lawn. —You had already tried to understand the Benedictine monastery and its priceless collection of ancient books through guidebooks, yet you still hadn't anticipated that this abbey, built as early as the eighth century, would be such a colossal edifice looking down upon all living beings. You put on felt slippers, respectful like an uninvited guest who has presumptively entered another's study; every Baroque ornamental detail adds to the already heavy and elegant atmosphere of the interior, until you inadvertently glimpse at some corner an aged aerial photograph: houses embracing the church, like roots clustering around a flower.
People live to make pilgrimages! you think with irrepressible excitement. But you ultimately revise this hasty statement. Perhaps this expression would be more fitting:
To live is to build a Tower of Babel for oneself.

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

绵柔的琴声渐强，曲集移往李斯特、巡礼之年。
第一年： 瑞士 。
从舷窗俯望下去，冬雪下覆盖的市镇沉静而柔软，好似湖畔旁慢慢积聚的白云，几乎有了一丝因长时间酝酿而散出的酒香——而这就是日内瓦 。作为一个国际都市，它怀抱着包括红十字会、世界卫生组织、联合国欧洲总部、 欧洲核子研究中心等名越四海的世界级组织。
然而我说，它也许更像是个小镇。比起世界钟表之都这样的煊赫称谓，花钟不过是当地人散步时可以顺带经过的城市一隅的小景。而我更偏爱的是，在春风拂煦的中午时分，啃着三明治，看飞鸟在天空留下一抹抹敏捷的身影——几乎像极了湛蓝天空上转瞬即逝的航迹云。那些悠然飘荡的旗帜提醒你，这些纹徽可代表着世界上最为发达的银行业呢；可是你并不十分理会。诶、你突然想到，当年卢梭会不会也如你这般坐在长椅上，望向对岸的法国群山，构思着他那惊骇世俗的《社会契约论》呢？
沿着月牙型的湖泊北上，半个时辰便是洛桑 。我在中央火车站中流连许久。到处是匆忙的人形交错，而我在这混杂中试图寻找一个上世纪的背影——玛格丽特·勒科兹——她自帕特里克的《地平线》中逃逸而出，曾经在这里稍作休憩。然而不行的，她属于另一中维度时间，而那个时间比起遗忘更适合消失。

所以让我们爬上那些匹并不陡峭的种满葡萄的山坡吧——我想你会喜欢这些紧裹着阳光的佳酿！粼粼波光下的莱蒙湖正泛出深浅不一的青色；而如果你继续极目远眺的话，也许你可以看到对岸山脚下另一个蜿蜷的小小的镇子。
嘿、那里就是依云哦！没错、千真万确是依云矿泉水的那个依云哦。

让我们乘船向东！东岸的尽头便是西庸城堡。你从那些久经风雪（整整十个世纪的风霜雨雪！）而依然弥坚的高耸的城垛下走过，却依然做不出任何浪漫的怀想。因为据说，没有排水系统的古老欧洲的居民，总是在清晨从二楼把那些隔夜的秽物向街道一倾而下——就是你现在站的这个地方！
而潜入地牢，世界仿佛被剥离只留下水声。从铁栅栏望出，因反光而炫目的湖面如同蜡烛，在点燃隔岸山脉绰约风致的同时，只不定也烧尽了囚徒们最后一滴希望。
可是话说回来、谁说老外就不会在古迹上乱涂乱刻呢？那些柱子也被层层叠叠的拉丁字母覆盖着；只不过，即使在这样的拥挤之中，被一本正经装裱起来的拜伦的签名仍然是尤为显眼就是了。

沿着铁道北上，让我们在火车广播由法语转向德语的途中，一览这个拥有惊人财富国度的同样近乎荒谬的自然景观。沿途数过的站名： 图恩 、 因特拉肯 、 卢塞恩 …它们会毫不愧怍地榨干你相机的电量和内存；毕竟说真的，当你离开繁华的都市圈就突然被暴露在这样的山光水色中时，你除了以目瞪口呆的方式表达自己的敬畏之外，还能做什么呢？反正我啊，我都不相信自己居然会仅仅因为凝望雪山的倒影就可以啪嗒啪嗒地滴泪……少年维特说得不假，这壮丽的神威有沁透人心的绝对力量，因而这欢乐是神圣而纯粹的。
列车停靠， 苏黎世 。这个为整个瑞士贡献超两成GDP的“超级”城市或许也装下了整个国家超两成的热闹，而这对于几乎就是庞大牧场的国度来说是一种不至太过安静的刚刚好的舒适。在古街的咖啡馆中坐下，偶有大学生模样的年轻人结伴经过，你这才想起联邦理工正是爱因斯坦的母校。傍晚时分的街道上，渐隐渐长的夕阳擦燃街灯。餐厅点燃烛光，晚宴开始了：有轨电车带着奶酪火锅的馥郁穿城而过。而我登上大教堂的双子塔楼，在并不宽敞的平台外，俯身看向整个城市如预想中渐渐睡去。就在这逐渐凝练的薄暮中，猎户被夜潮冲上天幕。

一路向北的终点，几乎可以算是边境的千阶之城， 圣加仑 。你从外侧开始，不厌其烦地突破一道道民居铸成的弧形封锁，才终于在又一次穿过促狭的胡同后，突然置身于一片不合时宜的开阔的草坪。——你早就在攻略中尝试了解本笃会修道院和它那无价的古籍藏书，然而你仍然没有料想到，这个早在八世纪就兴建起来的经院、居然会是这样一个睥睨众生的庞然大物。你穿上羊粘质地的拖鞋，恭敬得像不请自来的擅自踏入他人书斋的客人；每一个巴洛克式的堂皇装饰都要徒增这室内本就沉重而古雅的空气，你终于不经意在某个转角瞥见这样一张老旧的航拍照片：民宅环抱教堂，犹如根须簇拥花朵。
人活着就是为了朝圣！你抑制不住激动地想。然而你最终还是修改了这种仓促的说法。 还是说这样表达会更贴切一些呢：

活着，就是为自己造一座巴别塔。`,__vite_glob_0_6=`---
title: 'Social Being'
title_zh: '社会人'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2017-12-02_社会人.jpg'
date: '2017-12-02'
tags:
  - 'poem'
  - 'everyday chronicles'
tags_zh:
  - '诗'
  - '日常记趣'
languages: ['en', 'zh']
---

**(I)**  
After silence is injected  
the water level gradually rises  
sliding into the emotional deep sea  
as the price for reducing the risk of running aground  

**(II)**  
Even when presenting oneself in chaos  
candlestick patterns still proliferate  
in the timeline chart  

**(III)**  
Survival is a vile word!  
The virtuous abandon their dignity because of it  
the shameless become even more obscene  

**(IV)**  
Only when things become tedious
do my eyes grow ever more sincere in their clarity
meeting grievance with resignation
meeting revenge with resentment
underdogs should have the underdog way of survival

**(V)**  
The first resurrection made me fall into deep sleep in the morning  
the second resurrection ought to make me wake early in the night  

**(VI)**  
Action is a form of evil-doing, but  
action is also a form of redemption  
inaction amounts to nothing at all  
greed makes us harbor hostility  
toward covalent bonds  

**(VII)**  
Earthquakes are happening everywhere  
but upon careful reflection  
there's nothing worth triggering an earthquake  

**(VIII)**  
On the meticulously trimmed afternoon lawn  
there's the distinctive fragrance  
of lives severed at the waist  

**(IX)**  
Is my loyalty to you ultimately  
a miracle triggered by faith, or  
faith triggered by miracle?

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

（一）
沉默注入后
水位逐渐升高
作为降低触礁风险的代价滑入
情绪的深海区

（二）
即使以混沌示人
时序图中仍然有K线滋长

（三）
存活是个恶劣的字眼！
拥有美德的因它放弃矜持
不知廉耻的变得更加猥琐

（四）
唯当事情变得无趣起来
我的眼神剔透得愈发真诚
以直报怨
以怨报仇
下狗就该有下狗的生存方式

（五）
第一次复活让我在早晨沉沉睡去
第二次复活理应让我在夜晚早早醒来

（六）
行动是一种作恶但
行动也是一种净罪
不行动就什么也不算
贪婪让我们对共价键
心生敌意

（七）
到处都在地震
但仔细想来
却并没有什么值得引发地震

（八）
午后精心修剪的草坪上
有着被拦腰截断的生命
特有的馨香

（九）
我对你的忠诚到底算是
因信仰引发的奇迹还是
因奇迹引发的信仰`,__vite_glob_0_7=`---
title: 'Flow and Counterflow'
title_zh: '流与逆流'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2018-03-15_流与逆流.jpg'
date: '2018-03-15'
tags:
  - 'poem'
  - 'everyday chronicles'
tags_zh:
  - '诗'
  - '日常记趣'
languages: ['en', 'zh']
---

**(I)**  
Time sometimes becomes a granular thing  
Just as when nothing happens  
fingertips tremble against the arteries' intent  
Just as across the wilderness  
starry sky and wheat fields perhaps each grow  
music of different channels  
In some hybrid dreamscape  
phosphorescent fire flows like water, warm snow tastes like salt  

**(II)**  
Things made by God—  
being and nothingness, light and dark, person and person  
Things made by humans—  
shackles, accidents, Fermat's Little Theorem  
Before collision, you see  
often there appears a life review  
When I crashed into you, there was nothing  
nothing at all  
Why is that?  

**(III)**  
Accumulated from white noise—  
anvil clouds, harbingers of changing weather  
When mountain rains gather  
quantum failed to leap
back to the prelude once more  
And countless attempts at clenched gestures only keep saying  
even so, even so...  
even so, we must view with dialectical eyes...  

**(IV)**  
At the moment shadows devour the moon  
I unlocked the secret of passing by  
The guests on dating shows, you see  
aren't they skilled at factorization?  
So this is a mathematical problem  
Encounters with zero inner product are not encounters  
—But born as a prime number  
being coprime with others, isn't that  
also a kind of romance?  
Understanding this, the tides somehow suddenly  
grew dim  

**(Interlude)**  
With dense drumbeats  
changing movements  
ascending  
localized fever starting from the spinal cord  
gradually transforms into  
tremor traversing every inch of skin  
waiting for the chance  
just one crack opening  
to parachute into consciousness's abyss  
self is water flow  
water flow is passage  

**(V)**  
Point light sources  
trail in the riverway  
duality emerging from medium changes  
These relatively stationary  
comets  
cannot carry any  
biological desires  

**(VI)**  
In liquid disguise  
descending to deeper underground  
Analysis of probability—  
trains flowing upstream in darkness  
At dream's end, aging is  
a kind of dry evolution  
while entropy dissolves every  
"I could have" hypothesis  
isn't this monotonically increasing sin
overwhelmingly immense 

**(VII)**  
Secret technique: pre-established harmony  
Repeating for the 3,957th time  
stepping with the left foot into the absolute territory of the safety stairs  
Because of this caution  
today's room, before I unlock the door  
still maintains with full effort its adaptation  
to the appearance of darkness  

**(VIII)**  
Vows are shackles  
No wonder I feel so light  
The water temperature dissolves voice and throat  
How to describe the never-fading tomorrow?  
Safe, perhaps  
Beyond that  
it truly deserves any other word

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

（一）
时间有时会成为一种颗粒感的东西
正如无事发生时
指尖违背动脉的意图而颤抖
正如旷野上
星空和麦田也许各自长出
不同声道的音乐
在某种杂交的梦境中
磷火似水 温雪如盐

（二）
神造的事物
有与无 明与暗 人与人
人造的事物
枷锁 事故 费马小定理
相撞之前 你看
常常是出现走马灯的
我撞上你时却没有
什么都没有
为什么呢？

（三）
从白噪音处累积的
砧板云 这是变天的前兆
山雨欲来之时
跃迁不能
再一次跳回前奏
而无数次尝试握紧的手势只是不断说出
即使这样 即使这样…
即使这样 也要以辩证的眼光…

（四）
阴影吞没月亮的时刻
我解开了关于擦肩而过的秘密
相亲节目里的嘉宾 你看
不是擅长因式分解吗
所以这是个数学问题
内积为零的邂逅就不是邂逅
——但互质也、
生为素数不也
是一种浪漫啊。
明白了这一点的潮汐不知为什么突
就黯淡下来

（杂讯）
以绵密的鼓点
转换乐章

升调
从脊髓开始的局部发热
渐渐转变为
遍历每寸肤屑的震感
伺机等待
仅仅漏开一道口子
就可以向意识的深渊空降
自我即水流
水流即通道

（五）
点状光源
在河道中拖尾
因介质更改而出现的二象性
这些相对静止的
彗星
无法携带任何
生物性的愿望

（六）
以液体的伪装
降入更深的地底
关于概率的解析
黑暗中溯流而上的列车
在梦的尽头 衰老是
一种干燥的进化
而熵溶解掉每一个
「我本可以」的假设
过于庞大了不是么
这单增的罪孽

（七）

秘技 预定调和
重复第三千九百五十七次
用左脚迈入安全梯的绝对领域
因为这份谨慎
今天的房间在我还未开启门锁之前
仍然全力保持适应
黑暗的模样

（八）
誓言即枷锁
难怪我一身轻松
有种水温足以消融发声和咽喉
要怎样形容永不消逝的明天呢？
安全吧
除此之外
它实在配不上任何带有色彩的语汇`,__vite_glob_0_8=`---
title: 'The Sedimentation of New York'
title_zh: '纽约层积'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2018-10-20_纽约层积.jpg'
date: '2018-10-20'
tags:
  - 'travel log'
  - 'usa'
tags_zh:
  - '游记'
  - '美国'
languages: ['en', 'zh']
---

From the moment our car crossed the Triborough Bridge into Manhattan, I was struck by an uncanny sense of being in Milan—and this wasn't because we were entering Little Italy. The factors contributing to this illusion: the World Trade Center's Eataly gleaming with magnificent glass décor; or the subway system—those bidirectional tunnels revealed in their purely functional form, train cars built solely for capacity, the rebellion of graffiti and stains against lifeless brick walls—all demonstrated a shocking synchronicity between these two cities. Particularly when I strolled to Washington Square Arch, where that early autumn sunlight, softened by wisps of clouds, hung lazily over the crowds, I almost believed I was standing beneath Milan's Arch of Peace. One could say New York possesses a Milanese atmosphere; or perhaps it's entirely the reverse—that Milan unexpectedly carries New York's flavor.
Yet it doesn't stop there. On Greenwich's broad avenues, the way the broad leaves of street trees flutter in the wind can suddenly evoke thoughts of Paris... New York is like the reflection off glass—depending on the angle of observation, it always manages to present similarities to other cities. Though indeed, New York, Paris, and Milan share an unspoken commonality: a certain inheritance that extends from cities prematurely matured in some dimension. Multi-ethnic living atmospheres grounded in classical grid or radial street layouts, blended with contemporary stylistic trends. Unlike Florence, which has been completely altered by tourist saturation into a contrived antiquity, the old-world character of New York or Milan hasn't become a sight for worship, but rather a backdrop thoroughly integrated into residents' daily routines; or conversely, modern populations inhabit without incongruity this old city that was completely constructed before the turn of the century.
Standing on those streets of Times Square that struck me as both solemn and exhilarating with their chiming bells, watching the surrounding billboards display all too clamorously a lifestyle that abruptly shifts from dazzling to nothing—I thought that the "restless vitality impatient with old catchwords" surrounding Gatsby, that "too abrupt fate of running from zero to zero along a shortcut," hadn't become jazz-like wailing ruins with the wasteland era's recovery; quite the contrary, whether the stories continuously unfolding in this district today or this stage and its scenery, they remain exactly as they were a century ago. The only change is that the characters on stage now wear garments more fitting to this era's flamboyance and speak words more suited to this age's directness.
What you can sense is that cities like New York, Milan, or Paris are not entirely possessed by humans, but grow slowly at their own pace, by their own inertia, or rather, rust (this still differs from Tokyo's devouring mode of existence). Their towering presence and the sense of existence that looks down upon all else isn't because people live here, but as if they should stand here by way of self-evidence—yet as for what kinds of people come and go on this land, and at what rate they alternate and age—the city itself doesn't care.
Like artworks carved with different patterns under the same type of cross-section, people and eras wash over these streets whose appearance has hardly changed, leaving behind memories large and small that have been crystallized—those are the sculptures or art installations tucked into corners that one encounters unexpectedly. They absorb perhaps the entire era's character into themselves and nestle quietly in a nook (John Lennon has been condensed into "Imagine" in a corner of Central Park), maintaining the simple dignity of what remains... Thus, when every street begins to crowd with increasingly heavy memories, what people can do, besides remembrance and strengthening this remembrance with original works, is nothing else; and these arts that transform remembrance into inspiration, no matter how breakthrough they may be, still cannot achieve a subversion of this birthplace, but are instead absorbed and precipitated, ultimately becoming part of this city...

When culture itself becomes the foundation, culture no longer grows as budding flowers, but becomes the increasingly thick soil—and this is precisely the dream-like fervor I smell in these cities, the desire to become geological strata.
Therefore, if Beijing's spatial fragmentation reveals a certain folding, then New York's temporal continuity reveals a certain sedimentation.
In sum, if the essence of humanity is to be a repeating machine, then every moment of history should rightfully be a unique repetition.


_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

从车子自三区大桥驶入曼哈顿开始，我就恍然有种身在米兰的错觉，而这并不是因为我们进入小意大利的缘故。造成这种错觉的因素：世贸中心以辉煌的玻璃装潢映入眼界的Eataly；或者地下铁——完全以其功能形式展现出来的双向隧道，以纯粹运力为建造标准的车厢，毫无生色的砖墙上涂鸦和污渍的反叛，无不显示出两个城市间令人震惊的同调。尤其是，当我漫步至华盛顿拱门的时候，那种初秋因云絮荫庇而显得温软的阳光正懒洋洋地耷拉在人群身上，让我几乎以为自己正身在米兰的和平门下。可以说，纽约具有一种米兰的气氛；也可能完全相反，那就是米兰意外地带有纽约的风味。

当然并不仅于此，格林威治的宽阔大街上，行道树的阔叶随风飘动的情致也会突然令人想起巴黎……可以说，纽约如同玻璃的反光，因为观测角度的不同，总能呈现出一种和其他城市的相似——虽然，纽约、巴黎以及米兰之间也的确有着不言而喻的共通性：那是在某个维度中过早成熟的城市的某种遗产般的绵延。以古典的十字或放射型街区为底蕴的多种族的生活气息，混搭上具有当代特色格调的潮流。与佛罗伦萨这种因游客密布而完全变味的古朴相反，纽约或米兰的老派并未成为一种用于参拜的景致，而是幕后彻底融进居民日常的寻常图景；或相反，是现代人群毫无违和感地寓居在了这座世纪前就被搭建完整的老城。

踏上时代广场那片因敲钟而给我以庄严和兴奋的街道上，看着四周的广告牌位过于喧嚣地展示一种从璀璨戛然而止的生活方式——我想，盖茨比周遭那种“不安于陈旧辞令的粗犷活力”，那种“沿着一条捷径从零跑到零的过分突兀的命运”，并未随着荒原时代的重新振作而变成爵士乐般呜咽的遗迹；恰恰相反，如今在这个街区中不间断地上演的故事也好，这个舞台与布景也好，都和百年前别无二致 。唯一变更的，不过是登场的人物们穿起了更贴合这个时代的张扬衣物，言语出更贴合这个时代的直率词句罢了。

你可以感受到的一点是，像纽约、米兰或巴黎这些城市，它们并不完全被人类所拥有，而是以自己的脉率，自顾自地以惯性慢慢地成长，或者说，锈蚀（这和东京那种吞噬性的存在方式仍然有所区别）。它们的矗立与此而睥睨他物的存在感，并不是因为这里有人在居住，而仿佛它们以自证的方式本应伫立在此——但至于这片土地上究竟来来往往什么样的人群，而他们又以怎样的速率更迭和衰老——它自是不在乎的。

就如同在同种切片下雕镂出不同花纹的艺术品一样，人群和时代如流水般从这些外观几乎不曾变更的街道上冲刷而过，残剩下大大小小的被固化的记忆，而那就是在蜷踞在转角处的给人不经意撞见的雕塑或某些艺术装置。它们将也许是整个时代的风貌纳入自身并安静地窝于一隅（约翰列侬就被浓缩为中央公园一角的“想象力”），保持着残剩者简洁的矜持……就这样，当每一条街道都开始拥挤着越来越厚重的回忆，那么人们所能做的，除了缅怀和以独创性的作品加强这种缅怀，便别无他法；而这些将缅怀变作灵感的艺术，无论多么具有突破性，仍然无法实现对这个发祥地的颠覆，转而被吸纳而沉淀，最终成为这个城市的一部分……

如果文化本身成为了地基，文化就不再会是发芽的花朵，而是越积越厚的泥土，而这正是我在这些城市中所嗅到的想要成为地层的梦想般的热烈。

因此，如果说北京空间上的割裂展现出了某种折叠，那么纽约时间上一以贯之的延续则展现出了某种层积。

一言以蔽之，如果人类的本质是复读机，那么历史的每个瞬间理所应当都是独特的重复。`,__vite_glob_0_9=`---
title: 'California Check-in'
title_zh: '加州打卡'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2018-12-28_加州打卡.jpg'
date: '2018-12-28'
tags:
  - 'travel log'
  - 'usa'
tags_zh:
  - '游记'
  - '美国'
languages: ['en', 'zh']
---
### (I)
California is less a modern living area than it is a modern colony.
It fundamentally lacks a sense of lived-in warmth—that feeling of people genuinely inhabiting a place—so people here don't seem to live here through and through. A more apt description of this mode of existence would be that, depending on circumstances, the residents here either swagger about plundering, dominate with grand airs, lie low discreetly, or rustlingly bide their time for opportunities.
By all rights, as a coastline blessed by heaven with splendid climate, it should possess an inherent attraction—migratory birds should winter here. But the mobility represented by the word "wintering" precisely reflects the enormous difference between "living in California" and "having lived in California" in one's self-introduction. That is to say, though this place constantly churns with flocking crowds drawn by various endowments and miracles, after the waves recede, nothing settles in the city.
The fact is, as a city that suddenly swelled during the gold rush, it still carries within its core the spirit of chasing wealth. This unvarnished, straightforward culture of wealth, ironically enough, is also the source of vigorous vitality in these cities. As a spiritual legacy of this gold-seeking mentality, I think most residents share, to varying degrees, a rarely articulated consensus (though certain groups proudly call themselves "Silicon Valley people")—that this place is not accepted by people as a universal "homeland." Thus, this mode of existence as a transit station gives the city a sinfully alluring charm that allows people to continue their wanton ways with peace of mind.
In other words, California is treated by people as some kind of journey.

### (II)
My dream of Silicon Valley, beyond its cutting-edge technology, should simultaneously possess a humanistic sense of the future: it would represent future modes of interaction between people, and between humans and nature—from the fragments I've read and heard, I imagined that people here possess a natural mode of striving: first, their lives revere natural beauty; second, their work conforms to natural patterns of interaction.
But what I saw during my pilgrimage was that the barrenness of the land itself and the scattered tribal feel among clusters of tech companies form a peculiar landscape: those buildings rising from desolate slopes are, in a sense, precisely the scattered colonial outposts that people have planted on some planet. They each form enclave-like divisions with a rather autonomous air. The indifference to surroundings born from this sheltered isolation manifests once again as the kind of elite refinement I most detest. And this is the true meaning of this sacred land.
Indeed, "advancement" comes with its price. The breakthrough nature represented by the spirit of innovation inevitably contains maddening elements—as the region that first legalized marijuana, people here also seem particularly adept at creating chaos and mayhem. In this blatant law of the jungle, the last thing that self-preserving individuals need is universal harmony.
Therefore, the sense of the future possessed by Silicon Valley, which believes in Pareto principles, is particularly realistic.

### (III)
Melrose Avenue has pink walls and graffiti, Koreatown has trendy Korean cuisine, Griffith Park offers views of Hollywood's giant sign... Thus, Los Angeles is a city perfectly suited for check-ins. But beyond this, it really has no other praiseworthy qualities.
The doors of detached houses are tightly locked, immigrants with accents have developed an intense wariness, as if constantly guarding against potential malicious intentions from the crisis-ridden crowds (every gas station restroom cunningly bears a "out of order" sign!). When you smile at pedestrians, you can sense their great astonishment at such unprovoked kindness. Meanwhile, the scorching traffic flow on the roadways—traffic that treats the speed limit as the minimum driving speed—rudely embodies an arrogance squeezed into shape by vigilance.
If San Francisco's uninhabitability manifests in its lack of "homeland" atmosphere, Los Angeles's restlessness stems from a lack of integration. It can be said that these check-in worthy locations are completely and utterly grouped under this city's name simply because they happen to be geographically proximate, despite each having different souls. I gaze at the various graffiti—they are entirely random, casual creations lacking any seriousness, completely missing a consistent cultural core. This disorder as an "arts district" reveals Los Angeles's character as a canvas for anyone to paint on—only people who know they won't settle here dare to wield their brushes so boldly without hesitation. You can imagine that if this creation loses its artistic quality, it would become as avoidable as psoriasis, though their essence is merely chaotic information that cares nothing for the neighborhood's appearance and development.
In this sense, the City of Angels is both a blessed place and an abandoned place.
Perhaps all of California is.

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

（一）

加州这地方与其说是个现代化的生活区毋宁说是个现代化的殖民地。

它到底缺乏一种乡土气，所以人们在这里不似彻头彻尾地生活。对这种存在方式更妥帖的说法是，依据情况不同，这里的居民招摇地扫荡、大模大样地制霸、低调地蛰伏、或者窸窸窣窣地伺机而动着。

按理说，作为承蒙天恩而抱拥明媚气候的海岸线，它理所应当拥有一种内在的吸引力——候鸟应当在此越冬。但“越冬”这个词所代表的流动性，也正好体现出自我介绍中“在加州生活”和“在加州生活过”之间巨大的差异。就是说，这里虽因为各种天赋和奇迹而不停攒动着趋之若鹜的人流，但浪潮过后，城市中却什么也没有沉淀下来。

事实就是，作为一个自淘金热潮中倏而膨胀起来的城市，其内里到底还是带有逐富的意味。而这种不饰措辞的直来直往的财富文化，令人感到讽刺的是，居然也是这些城市中蓬勃朝气的来源。作为这种淘金的精神遗产，我想，大多数居民都或多或少都拥有这样一种鲜被言说的共识（尽管其中某群会自豪地管自己这一伙叫做“硅谷人”），那就是这里并不被人们接纳为普遍的“家园”——于是，这种作为中转站般存在的方式让这个城市拥有了让人心安理得地继续放肆下去的罪孽般的魅力。

也就是说，加州被人们当做了某种旅途。



（二）

我梦想中的硅谷，除了其尖端的技术之外，应该同时具备一种人文主义的未来感：它将代表人与人、人与自然的未来的互动方式——在我读到和听到的只言片语中，我猜想，这里的人们拥有一种自然的奋斗模式：首先、他们的生活是崇尚自然风貌的；其次，他们的工作是符合自然的交互模式的。

但我在巡礼的旅途中看到的是，这片土地本身的贫瘠和一簇簇科技公司间参差的部落感构成一种奇妙的图景：那些自荒凉的坡道上拔地而起的楼宇，从某种意义上说，正是人们在某个行星上种植下的星星点点的殖民地。它们各自形成一个个租界样的划分，颇有种自治的意味。而那种从被庇护的隔绝中生出的对周遭的淡漠感，则再次展现为一种我最为厌恶的精英的精致性。而这才是这片圣地的真意。

没错，“先进”自是有其代价的。创新精神所代表的突破性中必然也含有令人癫狂的因子——作为率先将大麻合法化的地区，这里的人们也似乎特别擅长制造混乱和狼藉——在这种昭然若揭的丛林法则中，独善其身的人们最不需要的就是大同。

因此，信仰帕累托的硅谷所拥有未来感也特别具有现实性。



（三）

梅尔罗斯大道有粉墙和涂鸦，KTown有网红的韩国料理，格里菲斯公园可以眺望好莱坞巨大的标牌……因此，洛杉矶是个极适合打卡的城市。但除此以外，它也实在没有其他值得称道的地方了。

独栋的洋楼房门紧锁，操着口音的移民也生出了一种强烈的戒备心，仿佛时刻防范着危机四伏的人群中可能出现的图谋不轨（每个加油站的卫生间都狡猾地立着“故障”的标牌！），向行人微笑，你可以感到他们对这种没来由的善意大感诧异；而车道上滚烫的车流，以最高限速为最低行车速度的车流，则分外粗鲁地体现出一种被戒备压榨成型的傲慢。

如果说旧金山的不宜居留体现在其“家园”氛围的缺乏上，洛杉矶浮躁的成因则是缺乏融合感造成的。可以说，这些值得打卡的地点完完全全是恰巧因为地理位置接近，而权且被归在了这个城市的名下，尽管它们各自都有着不同的灵魂。我望向那些各色的涂鸦，它们彻底就是随机出现的毫无严肃感的随性的创作，完全缺失一种一以贯之的文化内核。这种作为“艺术街区”的杂乱，展现出洛杉矶可以任人涂抹的画布的特性——也只有深知自己不会在此安家的人们，才敢于如此毫不畏首畏尾地挥笔。你可以想象，这种创作如果失去其艺术性，将会和牛皮藓一样变得令人避之不及，虽然它们的本质都是毫不在乎街区容貌和成长的杂乱资讯而已。

从这中意义上讲，天使之城既是被祝福的地方，也是被遗弃的地方。

也许整个加州都是。`,__vite_glob_0_10=`---
title: 'He and His Cat'
title_zh: '他和他的猫'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2019-01-09_他和他的猫.jpg'
date: '2019-01-09'
tags:
  - 'travel log'
  - 'usa'
tags_zh:
  - '游记'
  - '美国'
languages: ['en', 'zh']
---

A six-foot-tall deep-sea fishing champion, a member of the Lost Generation, a soldier, a mental patient, a boxing enthusiast, and an "ordinary Cuban" left the late-night Sloppy Joe's bar. He gazed dreamily at the lighthouse's massive cylindrical beam of light, then dragged his long shadow and a men's restroom back to the mansion with the town's largest private pool—a wedding gift from his second wife's uncle. Snow White, the six-toed cat at home, had no idea (and wouldn't have cared if she did) that soon after, the name of this housemate—Hemingway—would become the designation people would give to their entire clan.
I stand in the courtyard where Snow White's descendants lounge about, towering tropical plants rustling in the onshore Atlantic breeze. Sunlight filters down through a small cluster of bamboo leaves in dappled patterns, while the ceiling fan on the main building's second floor turns lazily, bringing from afar that unique tropical sense of coolness. Across in the carriage house, on a small round table in the center of the second-floor study sits a Royal typewriter, with mounted antlered deer heads nailed to the walls and a military backpack placed on the floor against the wall.
He would enter his study every day at six in the morning and leave at noon; afternoons and evenings were spent deep-sea fishing or following doctor's orders to execute the authoritative prescription for his family's hereditary bipolar disorder: heavy drinking. Hangovers might become routine, but regardless, during a certain nine-year period, this typewriter had continuously spelled out words like these: A Farewell to Arms; Men Without Women; Green Hills of Africa; The Snows of Kilimanjaro... If I had once been captivated by Yukio Mishima's delicate trajectory of a beautiful youth's cliff-like maturation—his "aesthetic" life path—then Hemingway's existence was simply too **"American."**
He seemed to have experienced it all—as a deep-sea fishing champion, a member of the Lost Generation, a soldier, a mental patient, a boxing enthusiast, an "ordinary Cuban," but perhaps most importantly, as a robust and tough man, he displayed a philosophy shaped by "action"—a mode of thinking diametrically opposed to Kantian contemplation—with this country's characteristic romantic restlessness and mission-driven sense, along with a deeply rooted self-centeredness that carried out his own justice.
In my conception, he was an unqualified representative of the "Lost Generation." The reason is simple: he wasn't lost at all; he had found the definitive form of heroic expression quite early. The truly lost one was his friend—the poet with a dreamer's temperament—Fitzgerald, whose talent originated mainly from heaven-sent sensitivity and melancholy. Unlike Fitzgerald's longing for unattainable dreams, Hemingway's talent stemmed primarily from worship of **ideals**; one could say that Fitzgerald's words were the leakage of sorrow, while Hemingway's words were the overflow of strength.
I should say that I had never realized the possibility that a writer could exist in Hemingway's manner. The people I admire—Maugham, Proust, Yukio Mishima...—their writing was invariably achieved through "rejection of life"; while as a very American writer, Hemingway's writing was achieved through "traversing life." Put another way, Hemingway belonged to that rare breed who practiced their pursuit through "action" rather than "imagination."
But rather than saying I envy this way of living, I should say I deeply understand that this lifestyle fundamentally conflicts with my own temperament. Yet after all, I do live in his homeland, and perhaps this country's inherent pragmatism will transform me beyond recognition. I might even welcome such a transformation with open arms.

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

一名身高六英尺的海钓冠军、迷惘的一代、军人、精神病患、拳击爱好人士、“普通的古巴人”离开了深夜的邋遢乔（Sloppy Joe）酒吧，他迷离望向灯塔巨大的柱形光亮，然后拖着长长的影子和一个男厕，踱回坐拥镇上最大私人泳池的洋房——他第二任妻子的叔叔送给他们的结婚礼物。家里的六趾猫咪白雪并不知道（就算知道也不在乎），不久之后，这个同居者的名字，海明威，将成为了人们给予它们这一族的称谓。

我站在白雪后代居留（四处躺倒）的庭园里，高耸的热带绿植在大西洋的向岸风中簌簌响着。而阳光从一小撮斑竹的叶条中被淅沥沥地筛下来，主楼二层的吊扇懒洋洋地转动，远远地带来一种热带地区独有的清凉感。对面的马车库里，二楼书室中央一张不大的圆桌上摆放着皇家打字机，墙上钉着长着犄角的鹿头标本，靠墙处的地板上则摆放着一个军旅背包。

他每日六时走进自己的书房，中午时分离开；下午和晚上则出海钓鱼、或遵照医嘱执行针对家族遗传型躁郁症的权威处方：酗酒。宿醉也许会成为常态，但无论如何，其中的某九年间，这个打字机上曾经连续拼下了这样一些单词：永别了、武器；没有女人的男人；非洲的青山；乞力马扎罗的雪……如果说以前的我曾醉心于三岛由纪夫纤细少年断崖式成长的“美形”式的生活轨迹，那么海明威的生命则简直太过**“美式”**。

他似乎全部都经历了——作为海钓冠军、迷惘的一代、军人、精神病患、拳击爱好人士、“普通的古巴人”，但或许最重要的，作为一个健美而强硬的男人，他以这个国家特有的浪漫主义式躁动的使命感，和贯彻自身正义的根深蒂固的自我中心，展现出一种被“行动”所塑造的哲学——和康德式沉思截然相反的思考模式。

在我的观念中，他是“迷惘的一代”不合格的代表。原因很简单，他根本就不迷茫，他很早就找到了英雄确定形式的表达。真正迷惘的，是他的朋友——具有梦想家气质的诗人——菲兹杰拉德，这种才华主要起源于天赐的敏感和忧郁。和菲兹对梦想不可及的憧憬不同，海明威的才华主要来源于对**理想**的崇拜；可以说，菲兹的文字是哀伤感的泄露，而海明威的文字是力量感的溢出。

应该说，我从未意识到作家可以以海明威的方式存在的可能性。我所钦慕的人们——毛姆、普鲁斯特、三岛由纪夫…，他们的文字无不成就于“对生活的拒绝”；而作为一个非常美式的作家， 海明威的文字则成就于“对生活的遍历”。换种方式说，海明威是稀有派的，以“行动”而非“想象力”来实践自身追寻的人。

但与其说我羡慕这种生存方式，不如说我深知这种生存方式和我自身气质有根本性的抵触。但毕竟我生活在他的故土呢，也许这个国家骨子里的实践主义会把我改造得面目全非也说不定。我对此也许也是张开双臂欢迎的。`,__vite_glob_0_11=`---
title: 'The Promised and the Forsaken'
title_zh: '被许诺和被荒芜的'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2019-12-02_被许诺和被荒芜的.jpg'
date: '2019-12-02'
tags:
  - 'travel log'
  - 'usa'
tags_zh:
  - '游记'
  - '美国'
languages: ['en', 'zh']
---

### (I) Culebra and Vieques
Vehicles plow back and forth repeatedly along the narrow coastline. Oncoming traffic is not infrequent, yet the road maintains a width that falls just short of being a proper two-lane highway—much like the occasional torrential sunlight pouring through the slowly shifting gaps in the clouds, bringing persistent minor discomfort and intermittent intense torment.
A clearly well-worn passenger van bounces us toward our lodging. The air conditioning runs at full blast but shows little strength in performance, resembling an energetic but utterly tactless salesperson. The driver charged only the transport fee yet voluntarily assumed the role of guide, so I came to know that along the way we passed what were perhaps sites of commemorative significance: the island's only Catholic church, only municipal government building, only steel-structured bridge... The vehicle occasionally slowed to avoid the idle yellow dogs, cats, roosters, or wild horses in the middle of the road.
Viewed through the glass, one could certainly call it a streamlined and pleasant village, even prosperous—quite a number of sailboats and yachts were moored or floating in the shimmering inner bay.
But only through movement that constantly changed our perspective did unsettling signals arrive intermittently. Such as abandoned cars in the roadside weeds, crooked and indecipherable advertising signs, uninhabited detached buildings with broken windows, and a shuttered commercial street utterly inappropriate for a popular vacation destination—especially on Thanksgiving.
Under the blazing sun, in heat that melted everything, all things remained silent, save for the vines that emanated an almost visible vapor of growth. They crawled on the ground, clustered by the sea, hung suspended from branches—they lived with an evolutionary stance perfectly adapted to the climate, covering mountains and fields. They could devour anything, just as plague could infect everything.
At dusk, the sun sank with fatalistic surrender. The thick clouds disappeared like gradually opening curtains, and that sphere completely exposed above the sea level suddenly mustered its strength again, leaving the entire firmament with a glorious sigh that lingered long. But ultimately, blue was victorious. Blue is stubborn—even at noon when it was penetrated and burned, approaching transparency... Finally, Orion's belt lit up.
As night fell, the streetlights along the coastal road emitted an ominous red glow (yes, pure red light). This was a node suitable for dark things to prowl and emerge (what lurked behind those crumbling, pallid walls?), and only with the absolute mechanical nature of a jeep's steel frame could one resist the erosion that the entire night would inevitably bring. Curled up in this shelter while driving along the road, thankfully there were sparse taverns emanating the cold, unwarming light of incandescent bulbs. You know that artificial noise can flow from within such light, so you call this temporary peace of mind "home."
You see, this small town is essentially dead, or at least seriously ill.

### (II) Bioluminescent Beach
The transparent-bottomed kayak gradually ignites fine points of light following the water's flow, as if in the vast darkness, a persistent arrow was creating fire through friction.
Further from shore, the entire body of water becomes a magical catalyst. Stirring the sea surface, the ripples are instantaneously materialized, like a visible echo of music.
The paddle moves rhythmically, light flickers and appears intermittently because of it. I try my best to lurk quietly in the darkness, yet have no way to avoid leaving any footprints.
Looking up, the deep and vast sky is nurturing countless stars. They flicker, they expand—one should say they're more like conveying some rhythm of heartbeat. They are star-eggs representing possibilities (after all, from an alien perspective, our solar system is merely such an indifferently shining point of light), so you begin to appreciate, and you begin to revere.
In such moments, one can simultaneously possess three forms of blessing: the sacred in despair, the tranquil in the sacred, and the desperate in tranquility.

### (III) San Juan
Rounding the fortified El Morro Castle, ships enter a narrow inland waterway. Docking at the port on the far western edge of the small city, centuries ago people would pour into the city through the only gap in the stone wall—the Gate of San Juan (nowadays, travelers arriving by sea all take enormous cruise ships docking at the newer port further east).
Climbing the steps onto the turquoise cobblestone road (these beautiful cobblestones are actually slag from iron smelting, transported here from Spain as ballast), at the road's end stands the Cathedral of San Juan. Serving simultaneously as San Juan's earliest building and the oldest Catholic church on U.S. territory, its furnishings could be described as quite restrained, or rather, well-ventilated.
At a glance, peeling lime has left the white walls somewhat mottled, and those ornaments decorating the sanctuary all carry a sticky, faded visual sensation from being dampened and baked by the hot climate—so much so that, just as people experience in winding canyons the sense of time when primitive oceans wash through the texture of stone, within these empty, clean church walls, time has taken away certain solemnity, certain human warmth, certain elaborate decorations, certain things that should make people feel both at peace and reverently fearful upon entering; what finally settles is only this ceremonial-less scaffold that becomes a desolate relic by providing people with physical shade.
But God once showed you favor! The bronze statue beside the Gate of San Juan depicts a bishop and three maidens holding high torches and crosses—it was these torches and hymns burning for prayer that made the invading English forces mistakenly believe Spanish reinforcements had arrived early... The city was saved! From one group of colonizers! By earlier-arriving colonizers!
Hope is always elusive. But even so, people never refuse hope.
It's just that before we called hope a miracle; now, we call it civilization.

Looking out through the gaps of the San Cristóbal Castle watchtower, the distant steaming tropical clouds are like fleets projected in a mirage. Years ago, real fleets sailed toward this completely unshielded land. Those fanatical Catholics, believing in legends devoid of religious color, hastily named all the land here El Dorado indiscriminately.
They brought governors, germs, cannons, and other devils—they brought civilization! Thus, colonization began.
Passing through the town's narrow streets, houses are painted in pastels, the low-saturated tones complementing the intense sunlight with a kind of innocent charm permeating within. From dusk onward, taverns are already packed, people greeting each other, dancing and embracing amid band performances and alcohol—they really resemble those tropical shrubs blown down by hurricanes all over the mountains, dying in great patches, living in great patches, thriving in great patches with such abundance they seem to learn no lessons.
Don't you really realize that you are actually victims?

### (IV) La Perla
Just one street away from the old city lies the La Perla (=Pearl) slum. Walking along the coastal road, these colorfully garish shanties are sandwiched between El Morro and San Cristóbal castles, like a fungus that maintains harsh growth by feeding on salty waves and vicious sunlight, rebellious to the point of having almost a touch of romance. At the town's periphery, an empty lot has been painted into a beautiful basketball court, featuring Carmelo Anthony's logo—this Puerto Rican born in Brooklyn feels responsible for his homeland after all. Rather than being generally summarized as promoting economic growth or maintaining community prosperity, this responsibility is more directly about letting nearby people have a ball to play with; besides this, appearing so alone in this place, it really serves no other purpose. Even more telling, during the three times I passed this route, this bright court remained persistently in a state of "waiting to be used."
This slum's moment of glory appeared in the 2017 brainwashing pop song "Despacito" music video, so that summer, tourists from around the world flooded into this drug-infested, impoverished place, leaving the struggling residents dumbfounded. But this wasn't entirely unexpected—after all, in that viral music video, a sexy woman dances in this fallen paradise, so this demon-infested dangerous place suddenly satisfied people's stereotypes about Latin America: passionate, unrestrained, wild growth... and beautiful, voluptuous women (Puerto Rico has already produced five Miss Universe winners!). Thus, during that peak period of endless crowds, the community committee decided to improve tourism facilities and raised $80,000 to repaint 402 residences... But now two years have passed, and aside from flaunting more vivid artificial colors, the tourism industry seems unchanged.
This inevitably brings to mind certain abrupt, sporadically standing high-rise buildings resembling cheap apartments encountered on the drive from the airport to San Juan. They display a kind of completed modernization on this decaying land; they represent the most irrelevant parts of some long-abandoned, impractical blueprint. And every day upon waking, the old streets would have a few more graffiti tags, along with rough white paint covering to erase these graffiti. The absurdity of this lies in the fact that even though Puerto Rico as a whole has functionally collapsed due to debt problems, in these most irrelevant places, municipal functions still seem to maintain basic operation.

### (V) After the Prosperity
Being born in a rapidly reviving country during a rapidly developing peaceful era, I never understood that there actually exists in the world something called decline—the opposite of growth. The first time I vividly felt this phenomenon truly exists was in a bus passing through a gloomy neighborhood in Pittsburgh (at the time I was heading to the downtown DMV to apply for a driver's license). However, the aimlessly wandering crowds downtown could only strengthen this impression.
If Pittsburgh showed me how a once-invincible steel center achieved a relatively dignified urban contraction in a manner worthy of sighs, then Puerto Rico gave me a feeling more like post-war devastation.
You could say they were abandoned, but while being abandoned, they desperately inject themselves with some dim hope, desperately watching for something. The Uber driver taking me into the old city pointed to San Cristóbal Castle and told me in broken English that the observation deck there allows one's vision to reach all the way to Bermuda... I think Márquez was right—Latin America's magical realism is rooted in its bloodstream: perhaps from the moment the pope walked through the city holding a torch, fate was already decided—they are all destined to wait, to watch, to expect rescue from the civilized world—just as the pope led the city's residents to wait for divine grace, La Perla waits for the next viral Latin song, and Puerto Rico waits for federal economic assistance amid a 45% poverty rate... You are destined only to wait for miracles.

### (VI) To be continued...
After traveling through Puerto Rico, I began contemplating this question: what does capitalism ultimately mean for civilizations outside the core circle?
A completely subjective, symbolically meaningful intuition tells me that capitalism is a ripening agent. These peripheral economies once gloriously ripened, and now it's time for them to rot.
Latin America in the '80s, Japan and Southeast Asia in the '90s, and perhaps Europe that's coming. So who will be the next to be bled dry?
Is it us?


_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

（一）库莱布拉和别克斯 (Culebra and Vieques）

车辆在狭长的海岸线上一遍遍来回犁地。会车并非不频繁，但道路始终保持着差一点就到双向车道的宽度——正如这缓慢变换的云隙间偶尔倾盆而下的阳光，带给人持续性的微小不适和间歇性的剧烈折磨。

一看便知磨损多年的载客用旅行车拉着我们颠簸向住处。冷气风力十足，性能却不见强劲，类似精力丰富却毫无话术可言的蹩脚销售员。司机只收了运输费，却也主动承担起向导的职责，于是我得以知道沿途驶过了也许具有纪念意义的，岛上唯一的天主教堂、唯一的市政府、唯一的钢筋架构的桥梁……车辆偶尔减速，为的是避让道路中央无所事事的黄狗，猫咪，公鸡，或者野马。

隔着一片玻璃看，无论如何都可以说是一个精简而怡人的村镇，甚至是富足的——波光粼粼的内海湾中停泊或漂浮着为数不少的帆船和游艇。

但唯有因移动而不断改换视野，令人不安的信号才间歇性地传来。比如路旁杂草丛中被弃置的轿车，歪斜而不可分辨的广告招牌，玻璃窗破损的无人独幢楼宇，以及与热门度假目的地极不相称的门户紧闭的商店街——况且还是感恩节。

阳光下，融化一切的热度中，万物静默，唯有藤蔓散发出几乎看得见水汽的生长信号。它们匍匐在地上，簇拥在海边，倒悬在枝杈间，它们以一种进化得完全适应气候的姿态活得满山遍野。它们什么都能够吞噬，正如瘟疫什么都可以传染。

黄昏，夕阳宿命般沉沦。浓厚的乌云如逐渐开启的帘幕般消失，那个完全暴露于海平面上的球体突然重新鼓起力气，于是整个天穹都因之残留下久久不散的辉煌叹息。但最终胜利的还是蓝色。蓝色是倔强的，哪怕正午时分它们被穿透烧灼而无限接近于透明……最终，猎户的腰带亮了。

入夜时分，临海路的街灯发出不详的红光（没错，是纯红色的灯光）。这是一个适宜暗物逡巡出没的节点（这倾颓而煞白的墙壁后面窥伺着什么呢？），而唯有以吉普车的钢筋铁骨般绝对的机械性，才能在此抗拒住整个夜晚都必然遭遇的侵蚀。蜷缩于这庇护中沿路行驶，还好有稀疏的酒馆弥散出白炽灯毫无温感的光亮。你知道这种光亮里面可以流淌出人造的杂音，于是你把这种暂时的安心称之为家。

你看，这个小镇算是死掉了，或至少也是病得不轻。



（二）荧光海滩

船底透明的皮划艇逐渐点燃顺着水流的细密光点，仿佛广袤的黑暗中，有一支执著的箭矢在摩擦生火。

离岸更远的地方，整个水域都变成具有魔法的触媒，搅动海面，波纹在瞬时被具象化，宛如一曲可以被看见的回音。

船桨规律滑动，光因之摇曳而时显时隐，我尽可能悄悄潜伏在黑暗中，却没有办法不留下任何足印。

抬头向上望，深邃而辽夐的天空正孕育出无数的星星。它们在闪烁，在膨胀，应该说更像是传达出某种心音的律动——它们是一个个代表可能性的星之卵（毕竟丛外星看来，太阳系也仅仅就是这样一个无差别闪亮的光点罢了），于是你开始欣赏，也开始敬畏。

在这种时刻，人可以同时拥有三种形式的祝福：绝望的神圣，神圣的宁静，和宁静的绝望。



（三）圣胡安（San Juan）

绕过要塞化的莫罗古堡，船只进入一片狭窄的内海水域。停靠小城的极西边的港口，几世纪前的人们便从石墙上唯一的缺口——圣璜之门——涌入城内（如今海路至此的旅客，却都是乘坐巨大的游轮停靠更东边的新港）。

拾级踏上翠蓝色的卵石路（这漂亮的卵石却是用炼铁产生的矿渣，它们被当做压舱物从西班牙被运至此地），道路尽头矗立着圣约翰大教堂。同时作为圣胡安最早期的建筑以及美国境内最古老的天主教堂，它的陈设可以说显得非常克制，或者说，具有良好的通风效果。

粗略看去，脱落的石灰已让白墙有些斑驳，而那些装点圣堂的饰品，无不带有一种因为受潮和被炎热气候烘焙而带来的黏答答的褪色的视觉感，以至于——正如人们在曲折的峡谷中体会到的原始海洋从那石头的纹理中冲刷而过的时间感——在这空旷白净的教堂的四壁之内，时间带走了某些威严，某些烟火，某些精雕细琢的装饰，某些本应该让人一踏进门就感到心安并同时诚惶诚恐的东西；于是最终沉淀下来的只有这毫无仪式感的棚架，通过给人们提供物理性的阴凉而成为荒芜的遗迹。

可是天主曾经有恩于你们啊！圣璜之门旁文物似的青铜雕像刻着高擎火炬和十字架的主教和三位少女——就是这些为祈祷而燃烧的火把和圣歌，让入侵的英军误认为西班牙的援军已提前到达……城市被拯救了！从一群殖民者手中！被更早到来的殖民者！

希望永远是缥缈的。但即使这样，人们永远不会拒绝希望。

只是以前我们把希望叫做神迹，现在，我们把它称做文明。

从圣克里斯多巴城堡瞭望塔的缝隙向外眺望，远处蒸腾的热带云犹如投射于蜃楼中的舰队。而多年以前，是真正的舰队向这片毫无遮拦的大地驶来，那些狂热的天主教徒听信毫无宗教色彩的传说，就着急地把这里的土地无差别地命名为黄金国。

他们带来了总督、病菌、枪炮和其他魔鬼——他们带来了文明！于是，拓荒和殖民就这样开始了。

从小镇狭窄的街道穿过，房屋被漆得粉粉彩彩，低饱和的色调和强烈的阳光相得益彰，自有一种天真烂漫的氛围氤氲在里面。黄昏时分开始，酒馆就已经拥堵不堪，人们在乐队的演奏和酒精中相互问好、舞蹈和拥抱——他们真的很像那些飓风天中被吹倒的漫山遍野的热带灌木，一大片片地死，一大片片地生，一大片片的简直繁茂得不长教训。

你们真的没有意识到自己其实是受害者吗？



（四）La Perla

与老城仅仅一街之隔的地方，是La Perla（=珍珠）贫民窟。沿着临海路散步经过，这些缤纷到格格不入的的平房被夹在莫罗古堡和圣克里斯多巴城堡之间，像一块靠吸食咸湿的海浪和毒辣的阳光而维持严酷生长的真菌，叛逆到几乎有了一丝浪漫的味道。镇子边陲有一块空地被漆成漂亮的篮球场，上面印有卡梅隆·安东尼的甜瓜标志，这名出生在布鲁克林的波多黎各人毕竟对故乡感到肩有责任——而这种责任与其被笼统概括为促进经济增长或维持社区兴繁，不如说就是直来直往的让附近的人有球可打；毕竟除此以外，它如此孤零零地现身此地，也委实没有其他作用了。甚至是说，在我经过这段路途的三段时间之内，这片鲜艳的场地始终只是持续性地处于“等待被使用”的状态。

这个贫民窟的高光时刻出现在2017年的洗脑流行歌曲Despacito（=慢慢来）的MV中，于是在那个夏天，世界各地的游客涌进这个毒品滋生的潦倒之处，让挣扎于此的居民大跌眼镜。但这也并非那么意外，毕竟在那红透南北的音乐短片中，一个性感的女郎就在这片失乐园中踢踏舞蹈，于是这百鬼横行的凶险之地突然就满足了人们对于拉丁美洲的刻板印象：热情、奔放、野蛮生长……还有美丽丰满的女人（从波多黎各已经走出了多达5位的环球小姐！）。于是，在那人流络绎不绝的鼎盛时期，这里的社区委员就决定完善其旅游设施，还集资8万美元把402间住宅重新粉刷……可如今两年时间过去，除了招摇着更加鲜艳的人造色之外，好像其旅游业也并没有什么改观。

这不得不让人联想起在从机场驶向圣胡安途中经过的某些突兀的，如廉价公寓搬挺立的零星高层建筑。它们在这片衰颓的土地上显出一种现代化的进行完结式，它们代表了某个早被抛弃的不切实际的蓝图中最无关紧要的部分。以及，每一天醒来，古街就会多几道涂鸦，以及为了抹消这些涂鸦而粗糙遮盖的白色油漆。这种事情的荒唐在就在于，哪怕整体来看波多黎各已经因为债务问题功能性地瘫痪了，在这种最无关紧要的地方，市政功能又仿佛还能维持基本的运转。



（五）繁华过后

是出生于一个快速复兴的国家和快速发展的和平年代，让我一直没能明白世界上居然也存在衰退——增长的反面，这种东西。而我第一次鲜明感受到这种现象确实存在，是在匹兹堡的公车中掠过的一片阴森的街区（彼时我正准备到市中心的车管所申请驾照）。然而，市中心无所事事般往来的人群只能更加加强这种印象。

如果说匹兹堡让我看到了曾经不可一世的钢铁中心以一种值得唏嘘的姿态实现还算体面的城市收缩，那么波多黎各带给我的感受则仿佛是某种战乱后的疮痍。

你可以说，他们被抛弃了，但被抛弃的同时，它们又在竭力向自己注入某种渺茫的希冀，竭力在守望着什么。载我进老城的Uber司机指着圣克里斯多巴城堡，用并不流利的英文告诉我说，那里的眺望台可以让视野一直驰骋到百慕大……我想马尔克斯说的不错，拉丁美洲的魔幻是根植在其血脉中的：也许从教皇举着火炬在城里穿过的时候，命运就已经决定了——你们，你们，还有他们，都注定要等待、要守望、要期待文明世界的援救——像教皇带领城内的居民等待天恩一般，La Perla在等待下一首爆红的拉丁歌曲，而波多黎各在45%的贫困率中等待联邦政府的经济资助……你们注定只是等待奇迹。



（六）つづく

游历波多黎各之后，我开始思考这样一个问题：资本主义对于非核心圈的文明究竟意味着什么。
一种完全出于主观感受的具有象征意味的直觉告诉我，资本主义是一味催熟剂。这些边缘经济体也曾辉煌地熟透过，而现在是到了腐烂的时候了。
80年代的拉美，90年代的日本和东南亚，以及或行将到来的欧洲。那么（再）下一个被吸血的是谁呢？
是我们吗？`,__vite_glob_0_12=`---
title: 'Salvation Mountain'
title_zh: '救赎山'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2019-12-29_救赎山.jpg'
date: '2019-12-29'
tags:
  - 'travel log'
  - 'usa'
tags_zh:
  - '游记'
  - '美国'
languages: ['en', 'zh']
---

### (I) Unincorporated Territory
State Route 111 stretches leisurely along the eastern shore of the Salton Sea, where no speed limit signs exist, so all vehicles have switched to low-altitude flight mode, whooshing past the slow-moving freight trains in the distance. Through the starboard window, distant mountains dissolve into misty haze, while the enormous lake nearby exists with an unreal stillness—a mirage-like vision so real it's surreal, maintaining a measured distance from the road amid the unending wasteland scenery rolling beneath our wheels. Though it can hardly bear the magnificent beauty implied by the word "fairyland," it at least rivals some of the most ethereal products of imagination in its sheer incredibility.
Leaving the salt lake, the road flows languidly into Niland following its momentum, then suddenly seems to lose courage and turns due south, seeking the shortest route to escape this ashen land. Niland, and to its south Estelle, Verdant, Rockwood—these places are identified by Google Maps as "unincorporated areas," or the even more baffling "census-designated places"... Simply put, these obscure terms can be roughly understood as "lawless territories."
The car turns east, bidding farewell to gas stations without gas, then enters a cluster of town-like buildings. Under the dim yellow sun, not only human shadows but virtually all signs of life have been swept away by the dry, sandy winds. Yet surprisingly, the residential-looking houses glimpsed along the way have cars parked in their driveways that aren't dirty enough to appear abandoned; these subtle signs serve as perfect reminders not to let down your guard, for every shadow might harbor some cave-dwelling creature skilled at concealing its presence.
Crossing the railroad tracks, the town is abruptly cut off, and the vehicle suddenly enters another unknown territory. On both sides of the bumpy dirt road, countless power poles stand at equal intervals like the skeletons of gods. Even understanding that this area once served as an anti-aircraft artillery training base during World War II (thus explaining its developmental history), traveling through it still evokes a sense of "terminal journey"—like post-apocalyptic descendants returning to their ancestors' dead planet, where among the broken walls and ruins, only simple, grand religious installations become stubborn proof of humanity's former existence by refusing the passage of time.
Which is to say, they have never forgiven us.

### (II) Salvation Mountain
A small patch of color appears without warning. As the distance draws closer, this blob of color seems to defy the laws of perspective and refuse to grow, so upon approaching, the grandly named Salvation Mountain turns out to be merely a small mound-like protrusion, far from being a colossus.
First, it is not a miracle. Facing this hill I had long wanted to explore (perhaps even yearned for), intuitive revulsion makes me hesitate.
First, it is not a miracle! God should be a concept that transcends natural law, but this little hill is thoroughly "unnatural" in its existence. It exists so abruptly here: that pure, unadulterated paint collides and accumulates without disguise, shamelessly declaring: We never intended to be God—we are a festival of artifice.
Second, it is not a work of art either. Art describes life "as it should be," expressing ideals that transcend humanity. What I see in these aesthetically barren colors, however, is the creator's most faithful imitation of a delirious person—it doesn't rise above us; it is us, and obviously a pathologically enlarged, distorted version of us.
It is not a work of art! At the center of the mountain's belly, and everywhere else the eye can see, crooked slogans proclaiming "God is love" prominently display themselves—this is an absurd cult ritual, as if there exists such an infallible law in the world: that through tireless repetition, wishes can become truth.
No, repetitive chanting only makes one become one's own believer. The creator thinks he holds the key to salvation, but what he opens is the fanatical abyss named self.
Finally, this isn't even the fruit of demons. For demons would never mock humanity's misinterpretation of God's love in such a joyless manner.
On this hill, you see no flash of genius or inspiration; on the contrary, it all displays a kind of shoddy harmony between mass-produced painted objects.
Even demons would surely find it terrifyingly boring.

### (III) Leonard Knight
The creator of Salvation Mountain was named Leonard Knight, who at age 35 (1967) began reciting the Sinner's Prayer without warning in his car one day: "Jesus, I'm a sinner, please come upon my body and into my heart..." According to Salvation Mountain's official website, this was the day Jesus descended upon him. From then on, he devoted his whole body and heart to serving God, rushing to tell the churches in his hometown: Jesus has been misunderstood. The path to salvation is simple—accept Jesus, confess your sins; but the churches told him it wasn't that simple.
...It is that simple!
In 1970, he and other northern villagers looked up to see a hot air balloon fly over their small town, so he spent the next decade making a hot air balloon covered with the Sinner's Prayer and "God is love," intending to spread the path to salvation he firmly believed in. But the balloon never took flight—too big and too heavy. In 1984, he made his final failed attempt to launch it in Slab City. Before leaving this place of heartbreak, he decided to build a small sculpture as a memorial. For four years, he never managed to stop... but this little hill collapsed due to an unstable foundation.
Knight didn't lose heart. He repeatedly experimented until he developed a more stable mixture of clay and straw, then spent another decade or more at this site, which grew into the current (second) Salvation Mountain. During this time he also weathered some tug-of-war and setbacks with the government over paint pollution, plus the addition of a domed mud house (hogan) beside the mountain and a building Knight called a "museum"... this is the entirety of Salvation Mountain today.

### (IV) Looking Down from Above
Standing atop Salvation Mountain, the wind that rampages unrestrained across the plains actually chills one somewhat.
Having just emerged from this bizarre artificial creation and now looking down upon it from a superior position, I truly feel mixed emotions.
Yes, measured as a mountain, this object doesn't possess any remarkable scale; but if viewed as a painted sculpture, it displays breathtaking grandeur.
Similarly, by artistic standards, this mound lacks beauty and is hideously ugly; but from the perspective of pure effort and dedication, it extraordinarily demonstrates willpower far exceeding that of ordinary people.
I've always held this view: those who only mark time in place have no right to mock those who run with strange postures. Though Knight never received divine grace (he misread divine grace) like Van Gogh receiving revelation from the spirits, nothing embodies the human spirit more than his mountain-building persistence.
However, from another perspective, precisely because this persistence carries a kind of unrepentant foolishness and obstinacy, it makes him increasingly diverge from the divine and fall into heretical paths...
So, compared to those who create nothing at all, is Knight more worthy of celebration or more worthy of hatred?

### (V) The Visitors
As I walk on this mound with such conflicted feelings, the surroundings are filled with clamoring noise.
Groups of tourists pour out of private cars, seemingly eager to unfold their bodies after being curled up in seats for too long.
What unfolds along with them are their empty thoughts: that kind of void that can devour and assimilate everything, that kind of smugness that treats all things in the world as equivalent and takes deep pride in this.
Teacups and forests are the same thing, dental floss and rivers are the same thing, pebbles and the universe are also the same thing—everything that enters the eyes is the same thing.
Meanwhile, things the eyes cannot see do not exist.
I watch them call out to friends and pull out phones to take pictures, watch them clumsily climb the sculpture just to become the indisputable protagonist in crowded frames. I hear them pontificate in various dialects about things they don't understand at all, hear them casually use nutritionless phrases to dissolve the eerily divine yet demonic atmosphere that originally existed in this sacred space.
As long as we move in groups, we dare trample miracles, despise devils, and kill art.
What we call plague—isn't it precisely the bonds and seven emotions and six desires that people bring?
Hey Knight, this scene now makes your work become nothing at all.
Hey Knight, what do you fear most? Laughter? Mockery? Being forgotten?
No—it's this kind of misguided attention before our eyes.
Noahs, facing such animals, do you still want to build arks? (If I were Jesus, none of you would be saved)
But anyway, God is already dead.

### (VI) Slab City and Desert Artists
The place where Salvation Mountain stands is called Slab City. This is an area mainly composed of snowbird communities (referring to northerners who move to the warm south for winter) and a few permanent residents: mainly people who have become hermits due to poverty or a desire to escape modernity. This is Wikipedia's description.
But if you ask me, the actual situation looks somewhat different.
When entering the city along the vaguely discernible road (it's an unmarked plain, so theoretically any track that vehicles can drive becomes a road), there stands an unguarded guard booth by the roadside—this marks official entry into the territory (when leaving in the opposite direction, the other side of this booth reads "Caution: reality ahead").
Some very scattered RVs are parked in various places. From their weathered appearance, one seriously doubts whether the attribute of "vehicle" still exists. In any case, these shelter-like capsules mostly have stalls set up outside them. From a distance, they seem to be selling handmade tourist souvenirs (I stopped Ruoruo from getting out to look, as I always felt there might be something dangerous in this anarchistic suspicious atmosphere, so we only looked from afar).
Continuing forward, the "God is love" faith gradually mutates into "All you need is love" (a kind of blind worship and crude imitation riding on "trending topics"). The density of artificial objects grows ever greater, making it increasingly resemble a garbage dump.
Deeper into the heartland, the car finally turns left to reach the far northwest of the small city—the sculpture garden called "East Jesus." Here, functional houses, abandoned objects, and various assembled pieces serving as artworks finally reach a chaotic climax. They are placed everywhere, so they grow freely—like singing the wild songs of desperados in a feast of ruins!
You don't know how to define them.
But precisely because you don't know how to define them, you can name them "places where humans survive."

### (VII) Salton Sea and Sonoran Desert
Though this is clearly an inland desert, seagulls inexplicably fly at low altitude. This is magical.
A huge and beautiful lake stands quietly, but the surroundings are desolate, cities abandoned, seemingly inhabited only by the exiled. This is magical.
Only upon researching did I learn that the Salton Sea is not a natural lake; it was formed a century ago when torrential rains burst irrigation channels and flooded into the basin.
Half a century ago, this was California's most productive marine fishery area, home to diverse species, a waterfront tourist destination called "the miracle in the desert."
However, as lake water evaporated (low rainfall couldn't compensate), salinity increased; meanwhile, agricultural runoff containing pesticides and fertilizers also increased the lake's toxicity. Now this lake water is 25% saltier than the Pacific Ocean. The BBC calls this California's "nightmarishly vanishing sea."
Salvation Mountain, Slab City, Salton Sea... this truly is a magical land.


_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

（一）非建制

111号州道沿着索尔顿湖（Salton Sea）东翼惬意伸展，这里没有任何限速标记，于是车辆全部开启了低空飞行模式，倏倏超过视野中缓慢移动的货运火车。右舷窗外，远山被氤氲的雾气离散得朦朦胧胧，而近处巨大的湖泊不真实地静静存在，以一种过于真实的蜃楼般的景象，在车轮下不间断延续的荒原景色中克制地与道路保持着咫尺的距离。它虽难以承担“仙境”一词的美轮美奂，却至少在不可思议的程度上可以匹敌某些最为虚幻的想象力。

离开盐湖，道路顺着惯性悠然淌进尼兰德，然后仿佛突然失却勇气似的径直折往正南方，为的是要以最短距离逃离这片灰烬般的土地。尼兰德（Niland），及其南方的埃斯特尔（Estelle）、弗丹特（Verdant）、罗克伍德（Rockwood），这些地点被谷歌地图识别为“非建制地区（unincorporated area）”，或更让人摸不着头脑的“普查规定居民点（census-designated place）”……简单来说，这些晦涩之词可以粗略理解为“法外之地”。

汽车向东一拐，告别没有油的加油站之后，就驶入了小镇模样的建筑群。昏黄的太阳下，岂止人影，简直连任何生命的迹象都被干燥的风沙刮走了。然而，出乎意料的是，沿途略过的住宅模样的房屋，廊前停放的轿车却并未肮脏到显出被废弃的模样；这隐隐约约的迹象恰到好处地提醒你不要放松警惕，因为每处阴影中也许都蛰伏着一种善于隐蔽气息的穴居生物。

而穿过铁轨，镇子被不由分说地拦截而下，车辆遽然进入下一片未知领域。颠簸的泥路两旁神明的骨架似的等距伫立着无数高压电杆。——就算理解了这片区域二战时曾作为防空炮兵的训练基地（于是因之有了被开发的历史），但切实在此间行进时，仍有某种“终末旅行”之感：如同末世后裔回到先民的死星，在断壁残桓之中，唯有简单宏大的宗教装置通过拒绝时间而死死成为人类曾经存活的明证。

也就是说，它们始终不曾原谅我们。



（二）救赎山

一小片色彩毫无征兆地出现。随着距离越来越接近，这团色彩却仿佛无视透视原理拒绝成长，于是临近一看，名号庄重的救赎山只是个与庞然大物相去甚远的小包状的突起。
首先，它不是一个神迹。面对这片我早想一探究竟（也许还心向往之）的山丘，直觉的反感却让我踟蹰不前。
首先，它不是一个神迹！神应当是某种超越自然之理的概念，但这匹小丘却彻底是“非自然”的存在。它是如此突兀地存在与此：那纯度极高的油漆不加掩饰地碰撞和堆砌，毫不愧怍地宣称，我们根本没想成为神——我们是人造物的盛典。

其次，它也不是一件艺术品。艺术描述“本应”的生活，表达超越人类的理念。而我在这些毫无美感的色彩中看到的，却是创作家对一个谵语者最忠实的临摹——它并没有高于我们，它就是我们，而且显然是病态的扩大的扭曲的我们。
它不是一件艺术品！山腹中央，以及其他目所能及的一切，都突出显现着“上帝是爱（God is love）”的歪斜标语——这是个荒诞的邪教仪式，仿佛世间存在这样一条不二法则：那就是通过不厌其烦的重复，愿望就可以变成真理。
不是的，反复的吟诵只会让人变成自己的信徒。创作者以为自己掌握了得救的钥匙，但他打开的却是名为自我的狂热深渊。

最后，这甚至不是恶魔的果实。因为恶魔永远不会以这种毫无乐趣的方式嘲笑人类对上帝之爱的曲解。
在这匹山丘上，你从中看不到任何天才或灵感的闪现，相反，它们整个显现出一种油漆物的量产品与量产品间粗制滥造的和谐。
一定就连恶魔也会觉得的太过可怕的无聊。



（三）伦纳德·奈特（Leonard Knight）

救赎山的创作者叫做伦纳德·奈特，他在35岁（1967年）的某天在自己的汽车中毫无征兆地开始吟诵起罪人祷告（Sinner's Prayer）：Jesus, I'm a sinner, please come upon my body and into my heart... 根据救赎山的官网介绍，这就是耶稣降临他身上的日子。自此以后，他全身全心侍奉上帝，他奔波于告知自己故乡的教堂：耶稣被误解了。得救之道很简单，接纳耶稣，忏悔罪恶；可是教堂告诉他说，事情没那么简单。

……事情就是那么简单！

1970年，他和其他北方村民抬头看到一个热气球飞过自家小镇，于是他花费接下来的10余年的时间制造一个写满罪人祷告和“上帝是爱”热气球，为的是宣扬他坚信不疑的得救之道。可是这气球终究没有升空，太大而太重。1984年，他在斯拉布城（Slab City）最后一次尝试放飞失败。在他离开这片伤心之地之前，他决定建一个小小的雕塑留下纪念，四年间，他始终没能停下来……然而这匹小丘因为底座不稳坍掉了。

奈特没有灰心，他反复试验出了一种更稳定的陶土和稻草混合物，然后他又在此地度过了10余年时光，这才长成了如今的（第二座）救赎山。其间又经历某些和政府关于涂料污染的拉锯和波折，加上山丘旁边添加的带穹顶的泥屋（hogan）和一座被奈特成为“博物馆”的建筑……就是这救赎山如今的全部。



（四）从上往下看

站在救赎山顶部，平原上毫无顾忌奔袭的风居然刮得人有些寒意。

刚刚从这座怪异的人造物中走出，又以一种居高临下的态度俯视它，我着实感到五味杂陈。

是的，以一匹山去衡量，这个物体并不具备什么了不起的规模；但若把它当做彩塑品来看，则显出令人咂舌的宏大。

同样，以艺术的标尺来观瞻，这座土丘毫无美感、丑陋不堪；但若从纯粹努力和专注的角度来说，则分外充分地体现了工匠远超常人的意志力量。

我一直怀以这样的观点，那就是只会原地踏步的人，没有资格嘲笑用怪异姿势跑步的人；奈特虽从未蒙受天恩（他误读了天恩）如梵高般领到神灵的启示，但没有什么比其造山般的坚持更能体现人类精神了。

然而，从另一方面来说，正因为这种坚持中带有一种不知悔改的愚莽和倔强，使得他愈发背离神祗而堕入邪道……

那么，比起什么都创造不出来的人，奈特是更加值得被庆贺还是更值得被痛恨呢？



（五）参观者们

当我带着这样的矛盾心情行走在这匹土丘上，周围却是噪声鼎沸。

一群群游客从私家车里涌出，似乎因长久地蜷倨于座位上而急于展开自己的身体。

随之展开的还有他们空洞的思想：那种可以吞噬和同化一切的虚空，那种将世间万物等量齐观并深以为此的自满。

茶杯和森林是一回事，牙线和河流是一回事，卵石和宇宙也是一回事，所有进入眼睛的东西都是一回事。

与此同时，眼睛看不到的东西都不存在。

我看着他们呼朋引伴地拿出手机拍照，看着他们笨拙地攀爬雕塑，就是为了能在人流熙攘的相框中成为无可争辩的主角。我听他们用各种方言对毫不理解的事物大放厥词，听他们轻描淡写地用毫无营养的字句消弭掉这个结界中本来存在的亦神亦鬼的怪诞空气。

只要我们成群结队，我们就敢践踏神迹，蔑视魔鬼，杀死艺术。

所谓瘟疫啊，难道不就是就是人们带来的羁绊和七情六欲吗？

我说奈特，如今这场景让你的作品变得什么都不是了。

我说奈特，你最怕的是什么呢？是大笑吗？是嘲讽吗？是遗忘吗？

不，是眼前这般不得要领的重视。

诺阿们，面对这样的动物，你们还想造船吗？（我要是耶稣，你们都别想得救）

但反正上帝都死了。



（六）斯拉布城和荒野艺术家

救赎山所在之地叫做斯拉布城。这是一片主要由候鸟群体（snowbird community，指冬季搬到温暖的南方居住的北方人）和少数永居者：主要是由于贫困或想要脱离现代性而离群索居的人构成。这是维基百科的介绍。

但如果要我说，实际情况看起来有些不同。

沿着隐隐约约的公路进城的时候（是没有任何标记的平原，所以理论上任何车辆能够驶出的轨迹都可以称之为公路），道旁立着一个没有人守卫的警卫亭，这就是正式进入地界了（反方向离开的时候，这个亭子的另一面写着“小心：前方现实 Caution: reality ahead”）。

一些非常分散的旅居车（RV）停靠各处，从它们饱经风霜的外表看起来，很让人怀疑“车”这个属性是否还继续存在。无论如何，这些庇护所模样的胶囊外大都展开一个个摊位，远远看去，似乎是在售卖手工制的旅游纪念品（若若想要下车看看，却被我制止住了，我总觉得这无政府主义的可疑气息中未尝不含有某种危险的东西，所以我们只是远远看去）。

继续向前，“上帝是爱”的信仰逐渐变种，成为“你只需要爱”（一种蹭“热点”的盲目崇拜和拙劣模仿）。人造物的密度越来越大，所以就越来越像一个垃圾场。

深入腹地，最终车子向左一拐，到达小城的极西北——却是被称作“东耶稣（East Jesus）”的雕塑园。在这里，功能性的房屋、废弃物还有承担着艺术品职能的一件件组合物件终于达到混乱的高潮，它们被随处放置，所以也就自由生长——宛如在遗迹的盛宴中吟唱亡命之徒的狂歌！

你不知道该怎么定义它们。

但正因为不知道怎么定义它们，你才能将其命名为“人存活的地方”。



（七）索尔顿湖和索诺兰沙漠

明明是一片内陆的荒漠，却莫名会低空飞过一些海鸥。这很魔幻。

一片巨大而美丽的湖泊静静矗立，但周遭荒凉，城市被废弃，似乎只有被放逐者的存在。这很魔幻。

查阅资料才知道，原来索尔顿湖并非天然湖泊；它是一个世纪前的暴雨冲垮了灌溉渠，涌入盆地形成的。

半世纪以前，这里还是加利福尼亚州最多产的海洋渔业产地，拥有多种生物，是被称为"沙漠中的奇迹"的滨水旅游胜地。

然而，随着湖水蒸发（低降雨量并不能弥补），湖水盐度升高；同时，含有农药和化肥成分的农业地表径流也增加了湖泊的毒性。如今这湖水的咸度比太平洋还高出 25%。BBC把这里称作加利福尼亚州“噩梦般消失的海”。

救赎山、斯拉布城、索尔顿湖……这实在是一片魔幻之地。

我脑海中一直闪过这些语句：淮左名都，竹西佳处。过春风十里，尽荠麦青青……`,__vite_glob_0_13=`---
title: 'Our Stories 01'
subtitle: 'Or: History as a Form of Narrative'
title_zh: '我们生活的故事01'
subtitle_zh: '又：历史是一种叙事方式'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2021-11-28_我们生活的故事01.jpg'
date: '2021-11-28'
tags:
  - 'our stories'
tags_zh:
  - '我们生活的故事'
languages: ['en', 'zh']
---

### (Preface)
Since that summer night twelve years ago when I first faced my wounds directly, I have maintained this urge to express myself once a year, recording the evolution of my thoughts over the past year.
In 2009, when Evangelion's new theatrical version "Break" was released, its celebrated insert song "Tsubasa wo Kudasai" accompanied me through writing the previous twelve pieces. Also stemming from these memories was their inexplicably titled collection "The Silence of Lies."
This year, with the final chapter themed around farewell bringing closure to this mythological system I once believed in wholeheartedly, I've decided—out of responsibility to this one-sided romance that began in my youth—to give these future summaries a new name.
From expressing subjective feelings (mainly self-pity), to proclaiming ideas I thought were uniquely mine, to making partial and declarative generalizations about trends, and finally beginning to record and reflect on specific events—following this written trail, these markers perfectly reflect a young person's gradual process of "seeing" from inside out, becoming more adept at managing and applying their emotions while turning their gaze toward understanding the world's complexity, ruthlessness, and entanglements.
Without these records, I might soon feel puzzled by that youth who championed loneliness, refused reconciliation, gazed at his own endowed sensitivity, and focused solely on inner experience—because this would be so different from you! Because now you are submerged in ordinariness, striving to remain objective, possessing a measured curiosity about truth—though the undertone of this curiosity may be sadness and helplessness.
But sincerity remains unchanged. You never lie to yourself. Even hidden in the crowd, you still make efforts to create something insignificant.
You know that even the most just history is a form of narrative, and your life—as Strand wrote in his poem—is the story of your life.

*It's impossible to say in what form*
*the weather will appear.*
*We blow on our hands,*
*trying to keep them warm.*

### (I)
Many art forms, including photography, experienced a developmental process in the twentieth century that moved "from external to internal, from process to fragment, from narrative to lyrical, from restraining passion to stimulating senses." This process, from a positive perspective, liberated art from the constraints of objective frameworks, making subjective feelings and emotional expression something neither shameful nor worthy of boasting, and making human aesthetics more diverse and open. In terms of trends, artistic motivation has generally become increasingly privatized; artistic purpose is no longer clear, and standards for artistic judgment have become blurred.
Among these, photography is distinctive. Unlike large oil paintings and small decorative paintings, large symphonies and small chamber music—art forms that can make viewers clearly feel the difference in creative costs—photographs are almost equal to each other. Especially benefiting from the widespread adoption of portable shooting devices, the instantaneous production process of pressing the shutter, and the ubiquitous digital viewing methods, photography has the lowest threshold among artistic media, both in terms of production and consumption.
The tendency toward popularization naturally leads to numerous schools in the photography market, or rather, a mixed bag; while respecting diversity, I still maintain my own aesthetic judgment and suspect the blind inertia of group trends. That is to say, in this current moment when the importance of personal narrative is elevated to an unnecessary height, I consistently believe that art (including photography) must achieve content over form, substance over style.
Personal narrative in photography manifests in two trends: first, the excessive emphasis and modification of subjects in check-in photos with monotonous filters; second, the metaphorical expression of emotions through stacking abstract colors commonly seen in so-called artistic photography. These two narratives carry different personal characteristics (the former like dancing under a spotlight, the latter like reading poetry at a recital). While not all personal narratives desperately crave attention, the core of both narratives remains connected—they are both manifestations of narcissism.
Narcissism is the trend of our times. Though I can't tell whether this era is more narcissistic, or because everyone can become media, we hear more narcissistic voices.
This is also a restless era. We play videos at double speed, yet end up remembering nothing and understanding nothing.
Narcissism plus restlessness—this is certainly the best of times for photography as art.

### (II)
But photography as a technical means (recording external moments with photosensitive elements) is inherently non-artistic. I consider this parallel relationship with art as my photography philosophy.
The uniqueness of photography lies in the fact that, unless deliberately staging scenes, its material comes entirely from reality itself. The photographer does not construct scenes but intercepts them—both temporally and spatially.
A photograph can be seen as an independent entity that cannot show the changes of the photographed object before and after shooting (temporally), nor express any events outside the frame (spatially). But this fixation of moments does not prevent viewers from using logic and common sense to reconstruct temporal and spatial possibilities in reverse—this is the manifestation of photography's metaphorical nature.
Indeed, the objective limitations of the medium restrict the photographer's creation (I cannot photograph a building at noon while expressing its nighttime appearance), but conversely, this documentary realism is photography's unique characteristic. That is to say, what photography should record and display is **life itself**.
American street photographer Winogrand once said he took pictures to "see what things look like when photographed." This statement can be interpreted in multiple ways, but from any angle, "what things look like when photographed" differs from "what things look like in the photographer's eyes" in contemporary mainstream photographic language.
Establishing correct aesthetics requires understanding the historical context of beauty rather than relying on current trends, but this is no easy task. Just as many people mistake popular music for music itself, the lens language of commercial and landscape photography is often misunderstood as all of photography: with formal beauty as the guide, photographs should record the most ideal (rather than most typical or real) appearance of things. By extension, when people hope to find sufficient justification for their narcissism, they naturally hope to use photography to achieve their **transcendence** of life in photographs.
Good photographs follow the order of reality, inevitability, and legendarity. Bad photographs rely entirely on the logic that "photographs are known to be unable to lie."
A real Eiffel Tower should damn well look like it's in Paris, not Las Vegas. And those passing by the Seine near the tower know that what the wind stirs up and blows away is dust everywhere, not confession balloons.

### (III)
A person's photo album is that person's narcissism index.
Not knowing how to take photos isn't a problem; being too good at showing yourself is a big problem.
Don't be narcissistic, and everything else can be discussed. To correct narcissism, one must first start by rejecting shallow emotions and hollow refinement.

### (IV)
Here is everything a person needs to survive, perhaps more—as long as you lower your expectations! Among all the congested Manhattan streets I've walked, nowhere is more New York or less New York than East Broadway in Chinatown (or officially, the Chinese Quarter).
Here, on the elevated track heading from Manhattan to Queens, four subway lines—B, D, N, Q—heavily pass overhead, bringing not only unbearable noise but occasionally unidentified precipitation from between the rails.
Though constrained in height by this bridge, the tenacious East Broadway Mall still shelters numerous grocery stores: cell phone card vendors, bird's nest sellers, marriage agencies, and its own daughter: the five-star restaurant East Broadway Mall Restaurant. But below this restaurant's sign are two other jewelry stores and a bakery.
At the street corner, a woman selling fruit beside a stall is fumbling with a roll of plastic bags. Tropical fruits droop in the autumn cold wind but are not marked down for sale. Though there are no signs, in areas where Chinese Americans gather, cash is always the highest priority payment method.
Right next to the intersection, there's an even smaller shop with a sign for China-US package delivery service, but the storefront is piled with various snacks, cigarettes, and suspiciously packaged masks. The old man inside, constrained by the counter in front and the wall behind, can only move horizontally and turn around, but this has also trained him in a unique skill: consuming life in statue-like stillness at this busy intersection.
Heading west, the road becomes more cramped. But surface dimness doesn't tell the whole story: Eastern culture always prefers to keep things hidden, so this is a land of hidden dragons and crouching tigers. Orient Photo Company uses a huge wedding photo to block the fire escape of a residential building, while in the five-story Western-style building next door, from top to bottom are: Oriental Arts Training Center, Chinese Social Democratic Party office, tax and insurance services, and dermatology and gynecology clinic...
Facing this declining streetscape, dirty but loud signs, my mood can only become more reverent.
Because New York is synonymous with diversity; because people can live just to stay alive; because they're not wrong: everything the West sees when looking East is crowded, noisy, and poor!

### (V)
Tour boats linger on the Chicago River, with Lake Michigan lying quietly to the east, while the Windy City's high-rise buildings stand attendant on both sides. Famous for trading bulk commodities and futures, this second-largest financial center in America, this core city of the Midwest, hosted the World's Fair at the end of the 19th century. Numerous newly built stone (rather than traditional wooden) neoclassical buildings earned it the reputation of "White City." A century later, they still stand in the city center, complementing glass towers, each showing their strengths.
Chicago's streets are so wide they make you doubt whether it truly has a long history. This doubt isn't wrong—Chicago indeed underwent a restart like the Ship of Theseus, which was the great fire that burned down the entire city 22 years before the World's Fair. The cause of the fire is disputed, with the most widespread story being that an Irish immigrant's cow kicked over an oil lamp near a haystack—given your understanding of this civilization, you can of course completely deduce the historical fact that in 19th-century America, Irish immigrants were unwelcome ("Help wanted, no Irish need apply").
Regardless, the second Chicago was quickly built. With the growing population, the city's sewage became a bigger problem: since locals drew water from Lake Michigan, they certainly couldn't dump waste into the same lake. Through creative planning, they dug a **sanitary** canal to solve the problem: draining the city's filth southwest into the Mississippi River system, eventually flowing to the Gulf of Mexico thousands of miles away. This canal was considered an engineering feat, but from an urban governance perspective, it was nothing new—downstream cities, though greatly displeased and even taking the matter to the federal Supreme Court, handled their own waste in the same way.
Connecting this to how this country's government guides citizens to view COVID and climate issues, one must say the ancestral narrative template really works every time.
But how many Mississippi Rivers are there in the world?

### (VI)
More than a decade ago, when Apple shocked the emerging smartphone world with the iPhone's thunderbolt, the panicked Google rallied over eighty manufacturers from the mobile phone and communications industry's upstream and downstream suppliers to form an alliance called the "**Open** Handset Alliance." Here, "open" has both broad and narrow meanings: non-Apple is open, Android-based is open.
To this day, you can still find its official website. The prominent manifesto on the site has noble intentions and beautiful visions: staying open, reducing costs, benefiting the mobile industry... until Android gained a foothold, then Google no longer needed it (the website's latest information stops at 2011, when Android's market share first surpassed iOS; the website page still cannot auto-adjust width with browsers).
Obviously, Google's rhetoric grasped something essential: when Westerners hear something described as closed or opaque, they all furrow their brows as if their lifeline has been grabbed.
I call this the G-spot of narrative. At this point, pragmatic people will have huge reactions to abstract concepts; profound thoughts will collapse into black-and-white support or resistance.
While people have finally become alert to the flood of Western ideological vocabulary, few question another more lifestyle-oriented narrative that accompanies these rhetorics: the American Dream—that one can achieve happiness through hard work and struggle. Because the flaw in this narrative isn't in its logic inverting black and white or substituting concepts, but in its **way of seeing**.
The righteousness of the American Dream lies in its seemingly absolute openness—anyone with possibilities won't be excluded. But the American Dream's perspective is individualized: it **never looks beyond the protagonist**.
Chicago's phoenix-like rebirth is such a narrative. The World's Fair held 22 years after the great fire, the sanitary canal dug to improve citizens' living standards—this is a flawless miracle, if you exclude the Mississippi River.
But what lies outside the frame? A person's responsibility to others is absent from the American Dream. The American Dream's establishment must rely on closed personal narratives, must enjoy freedom without costs.

### (VII)
Masayoshi Son once proposed a "time machine" theory—that a multinational company could treat developing countries as developed countries from several years ago, designing business logic and growing along previously practiced corporate development trajectories as these countries develop.
The logic behind this idea is that despite huge differences between countries, their social development will still unfold following similar patterns. From this perspective, capitalist society has **prophetic** qualities.
America's infrastructure problems have consistently been seized upon by Chinese media from a livelihood perspective, though America was previously the most aggressive country in infrastructure development. According to this theory, China's infrastructure will sooner or later face perhaps more widespread and serious aging (because our modernization speed is so fast and coverage so broad)—at least obsolescence, because their designed service lives are all over half a century.
I don't particularly care how these "post-modernization" problems will ultimately be solved from an engineering perspective; I'm concerned with how we will be **psychologically prepared** for this.
Trumps all believe America's world-dominating state is normal; Japan's bubble generation criticizes their young people for being weak, their policies insufficiently tough.
Yes, we know their prejudices are based on outdated realities, but we also have things we believe in wholeheartedly "once we accept certain settings": high-speed trains, gleaming buildings, and China as the world's engine...
A generation born in explosive times will always feel unfamiliar with long periods of cold silence. But **wear** is, after all, the entirety of the second law of thermodynamics.
I think even after unprecedented changes in a century, some things cannot possibly become better than they are now—I mean a narrative approach based on "hope."

### (VIII)
Great entrepreneurs and legendary revolutionaries excel at two things: first, making people believe in and follow their grand but distant ideals; second, remaining clear-headed within these crazy ideals and formulating strategies extremely aligned with actual conditions. One of the driving factors behind China's national fortune, in my view, is precisely that this country is mostly led by such people most of the time.
Starting from reality while still implementing the power of belief, integrating both the idealistic colors of communism and the not-optimistic conditions of New China into unified theory, the program of socialism with Chinese characteristics is, in my view, truly a brilliant conception (while "pro-Soviet" sentiment is a dangerous **romanticization** attempt, trying to use the nobility of the Soviet people to cover the rigidity and lameness inherent in their radical modernization attempts).
In my view, China's own narratives can be divided into three layers according to the length of their visions:
The first layer concerns completing the great rejuvenation (the resolution of the Sixth Plenum states that we are closer to the goal of great rejuvenation than at any time in history). This narrative can be quantified in reference systems: New China's development is a story about self-reliance and catching up with the strong.
The second layer concerns realizing socialism with Chinese characteristics. This narrative aims for common prosperity, quantified through five elements: prosperity, democracy, civilization, harmony, and beauty.
The third layer concerns building a community of shared future for mankind. This narrative is the ultimate goal of communism.
Leaders have long thought clearly about these matters. But the integration and tension between ideals and reality ultimately concerns survival.
In discussions about modernization, we have already been saved once by "black cat, white cat." What worries me is that, as Taleb proposed in "Antifragile," the source of resilience is diversity and flexibility—under highly similar value systems, do we have the ability to flexibly adapt again in the face of unknowable challenges?

### (IX) Some Random Thoughts

#### 1.0
Broadly speaking, capitalism is not merely an ideology but a class of self-reinforcing processes where things greedily pursue proliferation.
In this sense, obsession with big data is a form of capitalism. Obsession with connection is a form of capitalism. Therefore, the metaverse is also thoroughly capitalism.

#### 2.0
The value of virtuality to people lies in enabling them to switch between different personas. Therefore, true online social interaction should rupture rather than integrate with existing social methods. Tool-based, fragmented virtual social methods are the real need.
Unfortunately, social networking companies that measure by stickiness, engagement (and more high-sounding reasons like security) can only create products that are extensions of real personas.
That is, people end up needing to manage multiple extremely similar persona profiles both online and offline, participating in higher-saturation social interaction, losing solitary behavior, completely becoming nodes transmitting information on connection networks.
So even the broadest form of capitalism leads to human alienation, because this society's development doesn't try to make people happier, but makes people more clueless.

#### 3.0
Why do people always fantasize that gods are compassionate? Because compassion is such a kind of indulgent rationality that makes even gods who establish order need to handle problems (or choose not to handle problems) according to human emotional laws.

#### 4.0
How to become someone else's guardian angel 101: Don't say "I told you so / If you had followed what I said, you wouldn't have..." when they stumble.
How to become middle-aged: Unable to restrain yourself from correcting others.

#### 5.0
Two ways to maintain peace of mind: the weariness of having seen autumn moons and spring winds, and the indifference that comes from recognizing others are unrelated to oneself.


_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

（序）

自十二年前某个正视创口的夏夜开始，每年一次，我总会保持这样的表达欲望，用以记录过去一年的思考变化。

〇九年，EVA新剧场版“破”发布，其被奉为经典的插曲《翼をください》一直伴随我写完之前的十二篇文字。同样源自这些往事的还有它们令人不知所然的标题《嘘之默然》。

然后今年，以告别为主题上演的最后的终章为这个我曾深信不疑的神话体系划上休止；本着对这自少年开始的一厢情愿的姻缘的负责任态度，我也决定为从此往后的总结换个名字。

从表达主观感受（主要是自怜），到嚷嚷些自以为独此一家的观念，到对趋势的片面和声明式的概括，再到开始对具体事件的记录和反思；顺着文字一路看来，这些埋点正好反映出一个青年逐渐从内向外“看见”，在更能娴熟对付和应用自己感情的同时，将视角转向理解世界之复杂，无情和纠缠的过程。

而如果没有这些记录，不久后我也许会对那个标榜孤独、拒绝和解、凝视自身所被赋予的敏感，只专注内心体验的少年感到诧异——因为这毕竟与你大相径庭！因为如今你被平凡淹没，努力保持客观，并对真相拥有适可而止的好奇——尽管这种好奇的底色也许是悲伤和无能为力的。

但是真诚并不因之改变。你从不对自己撒谎。哪怕隐没人群，你也依然会为了创造些什么微不足道的东西而做出努力。

你知道哪怕最为公正的历史也是一种叙事，而你的生活——正如斯特兰德诗中所说——就是你生活的故事。


不可能说出天气
将以什么形式出现。
我们朝双手呵气，
试图使它们保持温暖。



（一）

包括摄影在内的众多艺术形式都在二十世纪经历了一个“由外及内，由过程到片段，由叙事到抒情，由克制激情到刺激感官”的发展过程。这个过程，从好的方面说，解放了原初艺术中客观框架的束缚，让主观感受和情绪表达成为一件并不羞耻（或值得宣扬）的事情，使得人的审美变得多元和开放。就趋势而言，艺术的动机总体上是在变得越来越私人化的；艺术的目的性不再明确，艺术的评判标准变得模糊了。

而在这其中，摄影与众不同。与巨幅油画和小型装饰画、大型交响乐和小型室内乐这种可以明显让观者感受创作成本差距的艺术形式相反，照片和照片之间几乎是平等的。尤其是，得益于便携式拍摄设备的大范围普及，按下快门的瞬时生产过程，以及无处不在的数字化的观看方式，摄影无论从生产还是消费层面都是门槛最低的艺术媒介。

大众化的倾向自然使得摄影市场里门派林立，或说鱼龙混杂；而尽管尊重多元，我依然坚持自身的鉴赏力，并怀疑群体风尚的盲目惯性。就是说，在这个私人叙事的重要性被抬举到不必要高度的当下，我始终认为艺术（包括摄影）必须做到内容大于形式，实质大于风格。

摄影中的私人叙事体现在一下两种风潮之中：第一是单调滤镜的打卡照片中对主体的过度强调和修饰；第二是常见于所谓艺术摄影的作品中通过堆叠抽象色彩达到对情绪的隐喻。两种叙事带有不同的个人特质（前者如在聚光灯下跳舞，后者如在朗诵会上读诗）。而尽管并不是所有的私人叙述都绝望地渴求关注，两种叙事的内核仍然相通，都是自恋的体现。

自恋是时代的风潮。尽管我也说不清究竟是这个时代更加自恋了，还是因为人人都能成为媒体，所以我们听见更多自恋的声音。

这同时也是一个浮躁的时代。我们把视频倍速播放，到头来还是什么都没记住什么都没看懂。

而自恋加浮躁，这当然是作为艺术的摄影的最好时代。



（二）

但摄影作为一种技术手段（以感光元件记录外部瞬间），本身是非艺术的。我将这种与艺术的平行关系当做我的摄影哲学。

摄影的特殊性在于，如不是刻意摆布场景，其取材则完全源自现实本身。拍摄者并不构建场景，而是在截取场景——从时间和空间两方面。

一张照片可以被看做一个独立的实体，它既无法展示拍摄前后（时间）被拍摄物的变化，也无法表现景框之外（空间）的任何事件。但这种对瞬间的凝固并未禁止观看者运用逻辑和常识，反向构建出时间和空间上的可能性——这即是摄影隐喻性的体现。

的确，底材的客观限制了拍摄者的创作（我无法在大中午拍下一栋楼房，却想表现它在夜晚的模样），但反过来说，这种纪实的真实感则是摄影媒介独有的特性。也就是说，摄影记录和展示的，应当是**生活本身**。

美国街头摄影师维诺格兰德曾说，他拍照是为了“看看事物被拍摄下来的样子”。这句话可以有多重解读，但从任何角度看，“事物被拍摄下来的样子”都是区别于当代主流摄影语言中“拍摄者眼中事物的样子”的。

建立正确的审美需要理解美的历史脉络而并非凭借时下的风潮，但这并非易事。正如很多人以流行音乐为音乐，商业和风光摄影的镜头语言也常被误解为摄影的一切：以形式美为先导，照片应该记录事物最为理想（而非最为典型或真实）的样子。依次类推，当人们希望为自己的自恋找到足够的依据时，他们当然希望运用摄影，在相片中完成他们对生活的**超越**。

好的照片遵循现实的秩序、必然还有传奇性。坏的照片则完全依赖“众所周知照片无法作假”的逻辑成立。

一座真正的埃菲尔铁塔就应该他妈有一副在巴黎而不是拉斯维加斯的样子。而在铁塔旁的塞纳河边路过的人都知道，被风扬起和吹走的，是遍地的尘土而不是告白气球。



（三）

一个人的相册就是一个人的自恋指数计。
不懂得拍照不是问题，太懂得展示自己则是一个大问题。
不要自恋，一切都好说。而要改正自恋，首先要从拒绝肤浅的情绪和空洞的精致开始。



（四）

这里有足够一个人活下去所需的一切，也许更多——只要你降低期待！在我所路过的所有曼哈顿的拥堵街道中，没什么地方比中国城（或用官方的说法，华埠）的东百脑汇街更纽约或更不纽约的了。

这里，自曼哈顿驶向皇后区的高架上，BDNQ四条地铁沉重地自头顶越过，除了难以忍受的噪声外，偶尔还能从轨间带来局部的不明降水。

虽然被这大桥限制了高度，顽强生长的怡东商场依然在庇佑着众多的杂货铺：卖手机卡的，卖燕窝的，婚介所，还有它的亲女儿：五星餐厅怡东大酒楼。但这个酒楼的牌匾下面却是另外两家珠宝行和一家饼屋。

街角的棚子边贩卖水果的女子正在摩挲了一饼塑料袋。摊位上的热带水果在秋天的冷风里耷拉着，但并没有减价销售。虽然没有任何标识，在华裔聚集的地方，现金永远是最优先级的支付方式。

紧邻十字路口的的地方，有一个打着中美包裹来回接送牌子的更小的铺子，店前却堆着各种小食品，香烟，以及包装可疑的口罩。里面的大爷受面前的柜台和身后的墙壁所限，只能做横向和转身运动，但也因此练就了一身绝活：在车水马龙的交叉口如雕像般静止地消磨生活。

往西行，道路更加局促。但表面的黯淡不能说明什么：东方文化总是习惯深藏不露，因此这是块藏龙卧虎的宝地。知音摄影公司用一张巨大的婚纱照挡住居民楼的消防梯，而旁边的五层洋楼里，从上到下分别是东方艺术培训中心、中国社会民主党办公楼、报税和保险、以及皮屑和妇科疾病诊疗室……

面对这衰颓的街景，脏污但洪亮的招牌，我的心情只能越发虔敬。

因为纽约是多样性的代名；因为人可以仅仅为了活着而活下去；因为他们并没有错：西方看向东方的一切都是拥挤、吵闹与贫穷！



（五）

游船流连于芝加哥河面，视线东面静静躺卧着密歇根湖，风城的高层建筑群环侍左右。以交易大宗商品和期货著名的美国第二大金融中心，这个中部的核心城市曾于19世纪末举办世博会，众多新建的石砌（而非传统木质结构）的新古典主义建筑为其赢得“白城”的美誉；时隔百年，它们依然在林立于市中心，和玻璃大厦们交相辉映，各展所长。

芝加哥的街道宽阔得令人怀疑它是否当真有悠久的历史。这种怀疑并没有错，芝加哥确实如忒休斯之船般历经重启，那正是世博会前22年焚毁整个城市的大火。起火的原因众说纷纭，流传最广的说法是某个爱尔兰移民的奶牛踢翻了干草堆旁的油灯——凭借对这个文明的了解，你当然已经完全推测出，在19世纪的美国，爱尔兰移民并不受人待见（help wanted, no Irish need apply）的史实。

无论如何，第二芝加哥市很快就被建了起来。伴随增长的人口，城市产生的污水成了一个更大问题：当地人既然从密歇根湖里汲取水源，当然就不能往同一泊湖里倾倒排泄物。经过富有创造性的规划，他们开凿了一条**卫生**运河解决问题：将城市的污秽向西南排进密西西比水系，并最终流往千里之外的墨西哥湾。这条运河在工程学上被视为一次壮举，但从城市治理角度则毫无新意——下游的城市尽管对此大为不爽并一度闹到联邦最高法庭，他们毕竟是以同样的方式处理自家的污物的。

联系这个国家的政府引导民众看待新冠和气候问题的方式，不得不说祖传的叙事模板真是百试不爽。

只是，世界上又有多少条密西西比河呢？



（六）

十多年前，苹果凭借iPhone的惊雷震撼刚刚兴起的智能手机界的时候，惊恐的谷歌纠集八十于众手机和通讯行业的上下游厂商，组成了一个叫“**开放**手机联盟（Open Handset Alliance）”阵营。这里的开放有广义和狭义两个意思：非苹果的就是开放的，基于安卓的就是开放的。

直到今天，你仍然可以找到它的官方网站。网站上的醒目宣言立意高尚、愿景美好：保持开放，降低成本，造福移动行业……直到安卓站稳脚跟，然后谷歌就不再需要它（网站的最新信息停留在2011年，其年安卓的市场占有率首次超越iOS；而网站页面尚不能随着浏览器自适应调整宽度）。

显然，谷歌的这套话语抓住了某种本质：当一个西方人听到某样东西封闭、不透明的时候，他们都会皱起眉头，仿佛被攥住了命根子。

我把这称之为叙事的G点。在这个点位上，务实的人也会对抽象的概念产生巨大反应；深刻的思想也会坍缩为非黑即白的拥护或抵触。

而虽然人们终于对于泛滥的西方意识形态语汇保持警觉，却鲜有人质疑与这些话术相生相伴的另一个更加生活化的叙事：美国梦，即一个人通过努力奋斗而达成幸福。因为这套叙事的漏洞并不在其逻辑颠倒黑白或偷换概念，而在其**观看方式**。

美国梦的正义性在于其表面绝对开放，只要是拥有可能性的人都不会被排除在外。但美国梦的视角却是个人化的：它**从不看向主角之外**。

芝加哥城涅槃就是这样一种叙事。大火后的22年即开办的世博会，为提升城市居民生活水平而开凿的卫生运河——这是一个无瑕无垢的奇迹，如果排除密西西比河。

但边框之外是什么？一个人为他人所负的责任在美国梦中是缺席的。美国梦的成立必须依赖闭塞的私人叙事，必须享有没有代价的自由。



（七）

孙正义曾提出过一个“时光机器”理论，即一家跨国公司可以把发展中国家当成若干年前的发达国家来设计其业务逻辑，并沿着之前实践过的企业发展脉络随着这个国家的发展而成长。

这个说法背后的逻辑是，尽管国家和国家之间有巨大差异，其社会发展仍将遵循相似的模式展开。从这个角度来说，资本主义社会是具有**预言性**的。

美国的基础设施问题一直被中国媒体从民生角度抓住不放，尽管美国在此以前也是基建最为激进的国家。按照这个理论，中国的基础设施迟早会面临也许更广泛和严重的老化（因为我们的现代化速度是如此之快，而覆盖面又是如此之广）——至少是过时，因为它们的设计使用年限都是半个世纪往上。

我并不如何在意这些“后现代化”的问题最终怎样得到工程学上的解决，我关心的是，我们将如何对此做好**心理准备**？

特朗普们都认为美国天下无敌的状态才正常；日本的泡沫世代批评他们的年轻人软弱，他们的政策不够强硬。

是的，我们知道他们的偏见是基于过时的现实，但我们也有“一旦接受了某种设定“就深信不疑的东西啊：飞速的高铁，锃亮的楼宇，以及中国是世界的引擎……

生于爆发年代中的一代总会对漫长的冷寂感到陌生。但**磨损**毕竟是热力学第二定律的全部。

我想，即使在百年未有之大变局后，也有些东西不可能变得比如今更好了——我是说一种基于“希望”的叙事方式。



（八）

伟大的企业家和传奇的革命者都擅长两件事：一是让人们相信和追随其宏大而渺茫的理想；二是在这种疯狂的理想之中依然保持清醒，制定极度贴合现实情况的策略。中国之国运的内驱因素之一，在我看来，正是这个国家大部分时候都接受着这类人的领导。

从现实出发并依然贯彻相信的力量，将共产主义的理想色彩和并不乐观的新中国国情同时融合进统一的理论之中，中国特色的社会主义纲领在我看来，实为天才的构想（而“精苏”情绪，则是一种危险的**浪漫化**尝试，试图用苏联人民的崇高遮盖住其激进现代化尝试中本身的刻板和跛脚之处）。

在我看来，中国自己的叙事依照愿景长短可以分为三层：

第一层是关于完成伟大复兴（六中全会的决议中写道，我们比历史上任何时期都更接近伟大复兴的目标），这种叙事可以在参照系中量化：新中国的发展是个有关自力更生，追赶强者的故事。

第二层是关于实现中国特色的社会主义，这种叙事以共同富裕为目标，通过富强、民主、文明、和谐、美丽五个要素进行量化。

第三层是关于构建人类命运共同体，这个叙事是共产主义的最终目标。

领导者们对这些事情早就想得挺明白了 。但理想和现实的融合拉扯，毕竟事关存亡。

在关于现代化的讨论中，我们已经被“黑猫白猫”拯救了一次。而我感到隐忧的是，正如塔勒布提出的“反脆弱”中，韧性的来源是多样性和灵活性——在高度相似的价值体系下，我们有能力再一次在不可知的挑战面前灵活应变吗？



（九）一些小思

1.0
广义来看，资本主义并不仅是一种意识形态，而是一类事物贪图增殖的自我强化的过程。
从这个意义说，对大数据的迷恋是一种资本主义。对连结的迷恋是一种资本主义。因此元宇宙也是彻头彻尾的资本主义。

2.0
虚拟对人的价值在于可以使人在不同的人格间切换。因此，真正的线上社交应该对已有社交方式的割裂而不是融合。工具化、片段化的虚拟社交方式才是真正的需求。
不幸的是，以粘合度、参与度（还有更为堂而皇之的理由，安全）为衡量标准的社交网络公司做出的产品只会是真实人格的延伸。
也就是说，最后人们需要在线上和线下都同时管理多个极度相似的人格档案，参与饱和度更高的社交，丧失独处行为，完全成为连结网络上传递信息的节点。
所以哪怕最广义的资本主义也会导致人的异化，因为这个社会的发展并非是试图让人更幸福，而是让人变得更没有头绪。

3.0
为什么人总是幻想神是悲悯的？因为悲悯是这样一种溺爱的理性，使得制定秩序的神也需要依照人类的感性法则处理问题（或选择不处理问题）。

4.0
如何成为他人的守护天使101：不要在对方摔跟头的时候说“我早就说过/如果你按照我说的来你就不会……”。
如何成为中年人：无法克制自己纠正对方。

5.0
保持心情平静的两种方式：惯看秋月春风后的倦怠，认识到他人与自己无关的不在乎。`,__vite_glob_0_14=`---
title: 'Our Stories 02'
subtitle: 'Or: We Are All the Same'
title_zh: '我们生活的故事02'
subtitle_zh: '又：大家都一样'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2022-11-27_我们生活的故事02.jpg'
date: '2022-11-27'
tags:
  - 'our stories'
tags_zh:
  - '我们生活的故事'
languages: ['en', 'zh']
---

### (Preface)
The world reaches toward its nadir. In the desert of pandemic, weary travelers joyfully welcome the dawn, until this dawn transforms into blazing daylight. The wreckage and sins scattered everywhere thus reveal themselves in dazzling clarity.
In countless duels over justice, people distinguish friend from foe based on their positions, which has nothing whatsoever to do with whether they engage in thinking. The west wind blows fiercely, yet the chef believes the heat is insufficient, because the most important thing has not yet been completely ignited.
On continents shrouded in faith, people cloaked in morality feel neither hunger nor cold. Across the waters in the lighthouse, PVP enthusiasts compete in their displays of brilliance.
After waves of information floods, exquisite shells transmit the sound of waves that were pre-recorded long ago. These carefully selected artifacts left on the beach seem to have been deliberately placed there by someone before the waves even arrived.
Unknowingly, both the vast cosmos and virtual worlds have become yet another hundred-billion-dollar speculation arena. The bidders are so generous, as if anything would do as long as it's not life here and now.
We have been reminded countless times that we stand at the edge of a cliff, but every seemingly precipitous action only extends this cliff a little further.
This terrifies some while tempting others to seize the opportunity.

### (I)
The Uber driver taking me to the airport skillfully navigated through small alleys to avoid the toll highway, until he reached a congested main road, successfully adding fifteen minutes to the estimated arrival time. He seemed embarrassed by this and attempted to strike up a conversation with me.
He naturally began with soaring gas prices, then launched into a monologue about how being a rideshare driver was such arduous and unprofitable work... until a stylish electric car suddenly cut into the lane beside us, forcing him to brake hard, and this topic was abruptly cut short by what might have been a Spanish curse.
Pointing at the vehicle ahead that had caused him trouble, he asked me, "Do you know why I don't like modern cars?"
"Why?"
"These cars are all electronic systems. They get more and more sophisticated but also more prone to malfunction. I was a mechanic for 20 years, but I can't repair my own car. Every time something goes wrong, the repair bill is fucking expensive. Just like this world."
Just like this world.
The driver was absolutely right. Ever since switching to automatic transmission, both life and automobiles have become increasingly lacking in a sense of control. Much of the time, these increasingly sophisticated and complex systems benefit us greatly; until one day, we receive a jaw-dropping repair bill for damage we didn't cause... We certainly have reason to blame those who make cars less like cars!

### (II)
In the year when Generative AI made its grand entrance into artistic creation, aside from causing another group of people to vaguely worry about their livelihoods being threatened, it hasn't yet created any substantial social impact. That said, this newly torn opening once again reminds us to confront a massive transformation about to permeate every aspect of life—a transformation that might even be subversive at the philosophical level, affecting how humanity evaluates itself.
In an interview, OpenAI's CEO mentioned an unexpected trend in AI development: just 10 years ago, when discussing how artificial intelligence would replace human work, everyone unanimously believed it would start with blue-collar, physical labor requiring no training threshold, then low-end, repetitive white-collar work, and finally creative white-collar work. However, the reality is that AI's development path has been completely opposite—it first reached seemingly extremely complex domains like autonomous driving and artistic creation [1].
This trend appears puzzling on the surface, but if we shift perspectives, it becomes perfectly logical: these emerging application domains are highly digitizable in both input and output. As long as researchers can devise a logically consistent digital pathway, supplemented by sufficient training samples, AI can learn a method to map inputs to outputs. In other words, AI's bottleneck isn't model complexity (especially since algorithms continue evolving), but whether it can obtain enough food.
From this perspective, the inherent difficulty of traditional work isn't the criterion for measuring replaceability—having sufficient initial data accumulation is; and if an industry can maintain enough inertia or barriers to refuse digitization, then perhaps it would be the hardest nut for AI to crack.
But then again, faced with a technology almost destined to bring first-mover advantages, who would dare refuse digitization?

### (III)
My digitization journey began in 2014 when I downloaded Evernote, initially just to conveniently edit and view my organized reading notes across multiple platforms. In 2015, I opened an iCloud account because photos had filled up my phone's storage. In 2019, I saw reports mentioning that even hard drive storage has expiration dates. So I started subscribing to Office 365, finally migrating all remaining personal files from portable hard drives to the cloud (including a first-grade essay titled "A Turtle").
This year, I began seriously considering establishing a more comprehensive personal information collection—to record what I see and hear with finer granularity on a single, or at least limited, platform/application—which of course relates to my profession. Data science often quotes the saying, "You are what you measure," or its alternative version, "If you can't measure something, you can't improve it" [2].
I spent about a month researching and finally settled on Notion, an integrated document application (though its vision extends far beyond this), then spent two weekends migrating all documents and files previously scattered across various platforms.
As a hot application led by Sequoia Capital, its 2.0 version creatively introduced relational database concepts to originally flat document note-taking. Based on this foundation, users can also customize the display methods of this information according to their preferences [3].
In the system Notion constructed, the original core content of documents became merely one part of the "document" concept. Document metadata and document content are given equal weight. Of equal importance are the interaction, combination, and display logic between documents.
That is to say, after breaking down that content-centric fragmentation, documents finally expose that informational characteristic common to all digitized things.

### (IV)
In the era before digital storage and distribution, people had difficulty separating information from its carrier. Music was music, painting was painting, text was text. Until McLuhan proclaimed "the medium is the message," we focused on information's transmission routes. This exaggerated the role of channels, making us blind to the more massive information itself.
This year, text-to-image generative AI applications entered public view, and people marveled at these AIs' "imagination"—this is another example of being deceived by superficial differences. These generative AIs haven't "created" anything; they merely **translate** information obtained from one channel to another channel, while the information carried remains completely unchanged.
In the same vein, what large intelligent recommendation systems do is merely construct two different functions, projecting each customer's preferences and each product's attributes into the same vector space (Embedding). In this space, for machines, customer preferences and product attributes have no essential difference—they're all just information recorded in the same dimension.
Even based on existing encoding methods, I have no doubt that AI's understanding of information is closer to information's true nature than human consciousness. Only at the philosophical or physical level, if we imagine the universe as a massive information flow (entropy), can things reveal their consistency at the informational level after stripping away their myriad forms of existence.
"What we want to do is prove that those individual, particular, uniquely human experiences are merely extremely superficial flickers beneath vast formal systems." While Foucault's words target humanity, don't they equally target all things in this world?

### (V)
In all thinking about "endings," science fiction works are unavoidable peaks. One of my two multi-year plans this year is to systematically read and understand science fiction works.
Unlike the "termination of the future" planned by venture capitalists (reverse thinking is a fashionable term: within ten years, most people will...), fantasy works describe "the unfolding of the future": cutting ties with concrete reality, in a holistic, broader uncertainty, fantasists can more romantically explore or predict everything about human civilization, not just possibilities of technological development.
Just as the differences between agricultural and modern civilizations aren't measured by horizontal expansion or linear complexity, civilizations capable of achieving extraterrestrial colonization must have **philosophical** frameworks fundamentally different from modern society. Concepts like chains of suspicion and dark forests represent thinking conducted on a **cosmic scale** that produces rationality and morality completely independent of contemporary notions.
The most fundamental difference between stories that might occur throughout the universe and stories occurring on Earth is a matter of scale (even traveling at light speed, journeys to neighboring star systems are measured in centuries, and how many technological explosions could occur during that time!). Similar to classical mechanics, all human knowledge constructed so far has an applicable range only at medium scales; exploring things beyond this range could completely reconstruct our understanding of the world.
This isn't solely the responsibility of science fiction writers. This project, though progressing slowly, has already begun. I've always believed that some minds can, through constant refinement, comprehend movement patterns beyond conventional wavelengths: as they age, Munger and Buffett appear increasingly unrestrained, while certain marathon runners bear the faces of ascetics.
"The ultimate in painting (is blindness), seeing things in Allah's darkness [4]." Honestly, I quite like this task.

### (VI)
After enduring lengthy preparation and adjustment [5], the James Webb Space Telescope finally lived up to expectations, transmitting exquisite deep space images. These images are brilliant yet serene, vastly different from the universe itself, filled with immense void and undercurrents. This is actually awe-inspiring—in just an inconspicuous tiny corner of this vast dome, if we carefully dissect it, infinite incomprehensibility is already revealed.
When I see these images, I often think that this instrument composed of precise lenses and cutting-edge technology is no different from those coin-operated telescopes on skyscraper rooftops for tourists. They bring extremely distant landscapes close, satisfying our irrepressible voyeuristic desires.
So far, we've been fortunate enough that within our sight, the universe contains nothing remarkable or noteworthy beyond sparse but omnipresent darkness and breathtaking scenery. But you can completely imagine that someday, these digital signals will truly transmit back some extraordinary images, and then perhaps all of humanity will feel like a pervert who just witnessed something sordid—simultaneously terrified, embarrassed, and satisfied.

### (VII)
Amid turbulent geopolitical environments and lurking stagflation crises, British netizens with ancestral optimism self-mockingly say: everything now resembles 1970s Britain's "British disease," except without the good music [6].
Maybe there is some, but it's not easy to find, because the most popular modern music doesn't serve hearing alone.
Since the concept of multimedia emerged, music has gradually begun depending on scenarios requiring visual engagement, such as nightclubs (electronic dance music) or short videos (brainwashing songs), making them achieve "bundled sales" with information on more efficient channels (visual information accounts for over 70% of all sensory information acquisition by humans), synergistically becoming monsters of viral transmission.
More broadly speaking, "remix"—one of Kevin Kelly's twelve internet trends [7]—also manifests in the fusion between different art forms. Abandoning low-density, single-channel food, remixing brings density growth, and three-dimensional sensory stimulation is naturally more irresistible.
Looking forward from rhythm-intensive dance music and mediocre VR headsets, what comes tomorrow?
It's us, yearning to be filled with information.

### (VIII)
After years of heavy investment, the Japanese anime series introduced by Bilibili finally began to decrease [8]. Out of sentiment, anime fans' dissatisfaction is understandable; but from every perspective, this trend is reasonably difficult to reverse. Fortunately, before China's anime copyright purchasing went downhill, I had already graduated from the two-dimensional world.
This wasn't because I had grown tired of it or due to stereotypical prejudices against anime fans. My "graduation" stemmed from natural detachment—in the current era dominated by moe healing and overpowered protagonist transmigration themes, anime indeed could no longer provide the joy I sought.
It's not just anime; most entertainment content today lacks surprise: formulaic plot development, transparent character personalities. I suspect that if Wilde experienced today's diversions, he would certainly die of boredom.
I've always held this prejudice: different people's hobbies indeed have considerable hierarchical distinctions. Because that ultimately proves what pathways a person uses to obtain pleasure. Therefore, I feel sorry for today's youth—if they don't make efforts to search, the entertainment activities under their noses have almost no nutrition, or they won't attempt to watch/experience in ways that could extract nutrition—this is a mutually interactive cycle between content production and consumption that causes mutual degradation (breaking this cycle means entertainment forms lacking addictive qualities and a less efficient entertainment industry in terms of return on investment—this worldline naturally lacks any appeal).
Hope-based narratives will always be the best narrative method humanity can possess. But even if we abandon hope, there's a huge difference between decadence and wasteful consumption (the energy density contained therein is completely different). What I'm grateful for is that my nostalgia isn't solely due to familiarity with childhood and personal experiences, but because these works truly represent an explosive golden age—they're more enduring than newly published literature in every sense. They expanded human ideals, imagination, and possibilities, even in matters of how to seek death.
Mid-year, an article titled "When the Balance Sheet Doesn't Want to Struggle Anymore" caused quite a stir online [9]. Though I can only glimpse through the keyhole from observing the anime industry, Japan's lost thirty years—the development process of an entire nation from having their spirit twisted to losing spirit entirely—is indeed a profound textbook. This is both lamentable and alarming, especially since Chinese youth have also begun to adopt lying-flat philosophy.
Thus, naturally, such self-appointed pioneers with heavy responsibility emerge to shout: The times call for low-oxygen-demand talent! [10]
Fuck, are you qualified to make such calls?

### (IX)
When an employee proposes new ideas to their boss, they often need to connect company vision and industry trends for macro-narrative. A photographer's inspiration appears in extremely minute, specific moments, requiring keen observation and attention to detail.
I'm often amazed by the different forms things take under these two perspectives.
Life is so complex that when we stand a little further than the experiencers, when we try to summarize a period of history in one or two sentences, when we attempt to "dimensionally reduce" events, we always get a result that smooths individual differences: overall steady progress, generally increasing happiness, tremendous leaps achieved in general—human statistical tools can only reach this level after all.
But human compassion shouldn't float at a thousand meters altitude looking down.

### (X) Three Short Poems

#### I. To Those in Shelters
Before telling me what I should do
Please be sure to complete what you can do
Grand ideals can move me too
But don't rush to preach your methods before finishing your own race
Adapting to any road conditions
Why becoming cautious
A nation has a nation's poetry anthology

#### II. To Those Who Hold the Reins
Don't know which deity thought up this idea
One side creates higher-purity chlorine gas
The other side creates higher-purity metallic sodium
Wait, I'm just here to get some salt
Crows can't help pecking other animals' tails
Who is the crow
A period of history has a period's kitchen debates

#### III. To Sober Trekking
Emotional release is a relaxing surf
Seeking truth is an arduous uphill climb
Parting the mist, your rear has ignorant scoundrels and unknowing saints
(They're not easily distinguished from each other)
Even if the torch doesn't pass by
I try to stay dry
Does this really help
A generation has a generation's Long March

### (XI)
Over the ten-plus years from high school to now, the literature I've encountered has been almost entirely Western and Japanese. Regarding Chinese literature, aside from a few classical novels, I've made no further efforts. This is ultimately shameful and creates intellectual barriers.
In this regard, I am humble. I cannot casually comment on everything happening before entering this cultural context. This would be disrespectful to this nation's profound history and dismissive of my own thinking.
Moreover, as an outsider, I ultimately cannot personally experience these days of continuous dramatic change. In a few years, my days wandering in foreign lands will catch up with the time I've lived in my homeland. For such a wanderer, the motherland will naturally only become more distant and strange. This is saddening but also provides an opportunity to be an observer.
But regardless of how perspectives change, people always want to find belonging in this lifetime. For this body and blood inherited over millennia, I therefore require myself to start reading this Yellow River-like magnificent epic from the beginning. I require myself to systematically and anew understand this yellow earth and the people on this land.
This is an arduous task—let us begin here.

### (XII)
This summer, at Yale's art museum, I saw a photographic work from China. The photo was taken in Long County, Shaanxi, showing three women kneeling on sparse grassland, wearing white clothes and white headscarves, holding wooden sticks wrapped in white paper. They were performing funeral wailing [11].
It looked like a spring morning, with unnatural flash lighting illuminating them. The middle and left figures covered their noses while weeping; the rightmost woman's mouth gaped wide, as if crying out loudly. Their faces showed the blocky mottling common among plateau residents. But being a black-and-white photo, it wasn't clear whether this was from wind-chapping in cold weather or from long labor and sun exposure with poor hygiene. They were sturdily built, like resilient cacti growing on wild soil, able to survive amid widespread hardship with just a little happiness.
I wasn't particularly shocked, but this photograph helped me visualize some rural narratives. In recent novels I've read, ordinary rural Chinese families in modern times first preferred robust build when choosing daughters-in-law. This typically meant the girl could endure hard work, wasn't easily sick, and besides bearing children could work the fields like an adult man. In impoverished times, such choices were supremely economical.
...But this photograph was taken in 2000!

### (XIII)
In "Surging Thirty Years," Wu Xiaobo narrates the massive and tortuous changes in Chinese society since reform and opening from the perspective of commercial transformation (this perspective cunningly yet reasonably avoids many things that cannot be discussed). I emphasize this word—tortuous—meaning unavoidable fluctuations appeared in this economic reform exploration encompassing a billion people. We can understand this rise and fall as temporal imbalance.
Spatial imbalance manifests in differences between reform pilot zones and regions where ideology remains far more entrenched.
I've said before that the "American Dream," through the insularity of personal narrative, ignores the responsibility narrators should bear toward society. In contrast, the "Chinese Dream," through the scaling of macro-narrative, overlooks all differences and fluctuations that always exist in stories. Once recognizing the diversity of Chinese social development across these two dimensions, I must remain vigilant about those singular linear narratives (solely from a PR perspective, I naturally understand the necessity of official "positive filters" to offset the biased "negative filters" in foreign reporting), which is precisely what many zealots excel at.
We often hear representative words that warn but don't completely warn: enduring growing pains, dust of the times... The more sincerely these words are used, the more heartbroken I feel about this disconnection.
Ordinary people's suffering is real, concrete, and bone-deep, but those in shelters cannot feel it. Just as in another ideological narrative, the wealthy who are free from want criticize the poor for lacking diligence and thought.
Having read the novel "The World of Man," what I see is a group of suppressed small people's household-like chatter and dialogue, but progressive thinkers say it "epically displays the magnificent upheaval of Chinese society" [12].
Where does the epic come from? Not everyone buffeted by fate is called Odysseus. Or do you, filled with righteousness and extending yourself to others, think everyone receives fate's protection, lives undamaged days, and naturally should have heroic hearts?

### (XIV)
In more than one novel, I've seen this plot: seasoned officials tell promising juniors whom they place hopes in that once a person decides to become an official, they must "wisely sever intimate relationships with grassroots classes" [13].
We can't say this consideration is completely unreasonable—after all, true ideals are like religion, absolutely cannot have their purity distorted by private desires. This statement is also quite ridiculous because it obviously betrays the ideal's original intention, seemingly suggesting that only when officials actually distance themselves from the masses will their careers proceed smoothly.
Regardless, we have reason to believe this selection method has been passed down, because we hear too much speech that would make any ear with a hint of human feeling suspect they misheard.
We also often hear another set of battle cry contexts: fighting a "tough battle" in five days [14], launching a "blitzkrieg" to block transmission [15], Wuhan's "ten-day major battle" [16], Guiyang's 4 AM nucleic acid testing "racing" against the virus [17]...
Similar to recently mocked internet corporate jargon (not similar in being mocked), these linguistic habits certainly don't arise from nowhere—indeed, they can all be traced to events the organization experienced in its early establishment and methods for resolving these events.
How does this resemble escaping historical cycles?

### (XV)
Path dependence means facing political turmoil and discordant surging public opinion, strong control measures must be adopted.
Path dependence means to maintain equal yet abstract love for the masses, one must distance oneself from them—far enough that their noise can no longer interfere with macro-narrative.
Path dependence means using high-intensity unsustainable mobilization to solve all encountered problems, then praying these problems won't persist long-term.
Path dependence means using martyrs as signposts to demand all believers, glorifying sacrifice and self-damaging dedication, making them feel satisfaction is sinful, like Christians treating the present world as a vale of tears leading to heaven [18].
Path dependence means using opaque assessment systems based on "neither advocating, nor banning, nor promoting" for uncertain events—never taking responsibility, never delegating power, never making mistakes.
Path dependence means consistently using methods that received positive feedback in the past, until many victims appear, until reality proves these methods no longer work.

### (XVI) Some Short Phrases

#### 1.0
"Hidden in dust and smoke" is still too light a phrase. Most of the time, it's either not having time to dodge the sandstorm, or someone hoping sufferers can disappear without a trace, the faster the better.
I think it should be "buried in dust and smoke" to capture the right flavor.

#### 2.0
Some people mock America's China policy of "cooperation, confrontation, competition" as wishful thinking.
These same people demand others sing praises when things improve, stay silent when unclear, and endure when obviously unworkable.

#### 3.0
In the most charitable personification: America is like Gendo Ikari—he has a publicly known righteous plan with hidden calculations; China is like Asuka—she believes saving ignorant people is the elite's mission.
Dealing with either type is quite exhausting.

#### 4.0
Socrates once told Cynics: "Your filth is a kind of vanity" [19]. This tells us people shouldn't think too highly of themselves.
For the same reason, I laughed out loud when rereading Liu Zongyuan's "Preface to Foolish Creek Poems."
Don't befriend people with excessive self-awareness, even if they appear unselfish on the surface.

### (XVII)
Fascination with solitary living permeated my entire adolescence. I could never escape the same question: where do people go? I once sought answers in mysticism and religion but discovered their incompatibility with reality; I once indulged in delicate emotions because beauty's one-time nature rebels against eternity. There seemed to be just these few methods. Regardless of East or West, solutions to this issue have always been thus: you must distance yourself from the mundane world to reach that detached state of forgetting the mundane.
I used to believe there must exist a substitute for the secular world more suited to my temperament—otherwise this deficiency couldn't explain the inevitable chaos and suffering encountered when dwelling in this world. But later I became more peaceful because I read history, connected pearls into lines, began observing changes occurring and about to occur in this second-order chaotic system with a developmental perspective. Then I engaged in work, invested in labor, personally pushed projects forward—this sense of control became increasingly reassuring.
More fundamentally, my work made me identify with dataism, so I would say: interaction is more valuable than isolation.
In short, even facing the world's gradual loosening, even when the reassurance from personal participation is enveloped by greater-scope uncertainty, the feeling of losing grip on the future can no longer separate me from the world again.
Someone has articulated this more clearly than I. In a dialogue published in Aperture magazine, Professor Hägglund described his concept of "secular faith": if we fairly accept humanity's limitations and fragility without escaping through self-realization fantasies like spiritual practice and religion, then the longing for social connection expressed as "alienation" can transform into pursuit of secular freedom [19].
As a spoiled only child, I really took many detours before understanding this truth: humans are social animals. Giving back is more valuable than taking, creating is more valuable than consuming.

References

1. "AI for the Next Era: OpenAI's Sam Altman on the New Frontiers of AI," Greylock, September 13, 2022
2. "You are what you measure," forbes.com, December 4, 2018
3. "Augmenting Human Intellect, No Code Required," Sequoia Capital Stories, October 13, 2022
4. My Name Is Red, Orhan Pamuk
5. "James Webb Space Telescope," Wikipedia
6. Post on sickipedia, June 27, 2022
7. The Inevitable, Kevin Kelly, 2016
8. "Bilibili Needs New Anime," 36Kr, July 27, 2022
9. "When the Balance Sheet Doesn't Want to Struggle Anymore," Yuanchuan Research Institute, May 31, 2022
10. "The Times Call for Low-Oxygen-Demand Talent," Ruan Junhua, Executive Vice Dean of Innovation and Entrepreneurship Institute, Zhejiang University, Rainbow Life WeChat Official Account, May 4, 2022
11. "Three Women at a Country Funeral, Longxian, Shaanxi Province," Liu Zheng, Yale University Art Gallery (from Liu Zheng's photography collection The Chinese)
12. "'The World of Man' Concludes, Liang Xiaosheng Praises Adaptation," Xinhua News, March 2, 2022
13. The World of Man, Chapter 8, Liang Xiaosheng
14. "Zhengzhou: Fighting a Five-Day Assault to Clear Points and Surfaces," Xinhua News Henan Channel, November 24, 2022
15. "Blitzkrieg, Positional Warfare, Annihilation Battle—Dalian's 25-Day Anti-Epidemic Record," Xinhua News, August 18, 2020
16. "'Ten-Day Major Battle': Wuhan Conducts Citywide Nucleic Acid Screening," People's Daily Online, May 19, 2020
17. "Guiyang's Battle Against the Epidemic | Racing Against Time! Volunteers Act Before Dawn," Guizhou Daily, September 16, 2022
18. The Farewell Waltz, Milan Kundera
19. "Wolfgang Tillmans on Photography and Spirituality," Aperture, August 25, 2022; Chinese translation: "Wolfgang Tillmans: Photography's Fragility, Freedom, and the Human Solidarity It Promotes," Fake Magazine Official Account, September 12, 2022



_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

（序）

世界向下探底。在瘟疫的砂漠中，疲于跋涉的人们欣喜地迎接曙光，直到这曙光变成昭彰的白日。遍地的狼藉和罪恶于是显出耀眼的清晰。

无数有关于正义的对决中，人们凭借立场区分敌我，而这和是否带入思考全然无关。西风劲吹，掌勺者却认为火候不够，因为最重要的东西还没有被完全点燃。

信仰笼罩的大陆上，身披道德的人们丝毫不觉饥冷。隔岸而望的灯塔中，PVP爱好者正斗艳争芳。

一浪浪信息洪流之后，精巧的贝壳中传来早已录播好的浪花声。这些遗留海滩的被悉心挑选的人造物，好像在海浪还未席卷之前，就被谁刻意安放在那里。

不知不觉，广袤星辰和虚拟世界都成为又一个百亿美金的投机场。竞价者如此慷慨，仿佛只要不是此时此地的生活，就怎样都好。

已有无数时刻我们被提醒站在了悬崖边，但每一次看似让人坠崖的举动都让这悬崖又延长一些。

这让一些人惊恐，又诱惑另一些人伺机而动。



（一）

载我去机场的优步司机为了避开收费的高速，熟练在小巷里绕出些弯弯拐拐，直到开上一条堵车的大路，成功让预计达到时间增加一刻钟。他好像因此显得不好意思，于是尝试和我交谈起来。

开篇自然是高企的油价，他接着自叙说了起当个网约车司机是个多么劳苦而不赚钱的一门生意……直到旁边一辆时髦的电动车忽然插入队列的动作让他急踩了一脚刹车，这个话题就被一声也许是西语的咒骂骤然止住了。

他指着前方那辆给他带来麻烦的家伙问我，你知道我为什么不喜欢现在的汽车吗？

“为什么？”

“这些车子都是电子系统。它们越来越精细却也越来越容易出错。我当了20年的机械师，但我无法修理自己这台汽车。每次出问题时，修理费又都是他妈的死贵。就和这世界一样。”

就和这世界一样。

师傅说的一点也不错。自从换上自动排挡以来，生活和汽车都变得越来越缺乏操控感。在很多时候，这些愈发精巧复杂的系统让人受益良多；直到某天，我们因为并非本人造成的损坏而收到一张咂舌的修理单……我们当然有理由责怪那些让汽车变得不像汽车的人！



（二）

生成式人工智能（Generative AI）在艺术创作领域登堂入室之年，除过让又一批人开始隐约担忧起饭碗被抢之外，还没有在社会层面造成什么实质冲击。虽说如此，这道被刚刚撕开的口子再一次提醒我们去直面一种即将渗入生活方方面面的巨大转折，这种转折甚至可能具有思想层面的颠覆性，即影响人类如何评价自己。

OpenAI的CEO在一次访谈中提到人工智能发展的令人意想不到的趋势：放到仅仅10年前，关于人工智能会如何替代人类工作的时候，所有人都一致认为，首先是蓝领型的、没有训练门槛的体力工作，然后是低端、可重复性的白领工作，最后才是创造类型的白领工作。然而事实是，人工智能的发展路径完全相反，它首先触达的都是那些看似极其复杂的领域，比如自动驾驶，比如艺术创作 [1]。

这种趋势表面费解，但如果我们转换视角看，又显得顺理成章：这些方兴未艾的应用领域无论其输入还是产出，都是高度可数据化的。只要研究者能想出一套逻辑自洽的数字化通路，辅之以足够多的训练样本，人工智能就能学成一套将输入投射到输出去的方法。换句话说，人工智能的瓶颈并不是模型复杂度的问题（何况算法还在不断进化），而是它能否得到足够多的食物。

从这个意义上讲，传统工作本身的难易程度并不是衡量可替代性的标准，是否有足够的初始数据积累才是；而如果一个行业能够有足够的惰性或壁垒去拒绝数字化，那或许就是人工智能最难啃的骨头了。

但话说回来，在一个几乎注定带来先发优势的技术面前，谁又敢拒绝数字化呢？



（三）

我的数字化旅程从2014年下载印象笔记开始，最初只是为了方便在多个平台上都能编辑和查看自己整理的读书笔记。2015年我开通了iCloud，因为照片把手机的储存占满了。而2019年我看到报道中提到，即使硬盘的保存也存在期限。我于是又开始订阅起Office365，终于把所有剩下的在移动硬盘中的个人资料（其中包括一篇一年级的作文《一只乌龟》）也迁移到了云端。

到了今年，我开始认真思考起建立一个更加全面的个人信息集合；为的是在一个单一、至少是有限的平台/应用上，以更细的颗粒度下记录自己的所见所闻——这当然和我的职业不无关系。数据科学界常常引用的一句话是，“你就是你所测量的”，或者其另一个版本，“如果你不能够衡量一件事情，你就不能改进它” [2]。

我大约花了一个月的时间考察，最后锁定了Notion这一集成式的文档类应用（虽然它的愿景还远不止与此），接着又用了两个周末，把原来分散在各个平台的文档和文件全部迁移了进去。

做为红杉基金领投的热门应用，它的2.0版本为原本扁平的文档记事创造性地引入关系型数据库的概念。在此基础之上，用户也可以根据自己的偏好自定义这些信息的展示方式 [3]。

在Notion构建的这个体系下，文档原本核心的内容成为了“文档”这一概念中的仅仅一个部分。文档的元数据和文档的内容被等量齐观。而与之有着同等重要性的，则是文档之间的交互、组合和展示逻辑。

就是说，在打破了那种以内容为核心的割裂性后，文档终于也暴露出一切数字化的东西所共通的那种信息的特性。



（四）

在还没有数字化存储和分销的年代，人们很难将信息和信息的载体分开来看。音乐就是音乐，绘画就是绘画，文字就是文字。直至麦克卢汉喊出“传媒即信息”，我们又把焦点对准了信息的传播路线。这夸大了渠道的作用，反而使我们对更为庞大的信息本身视而不见。

今年以来，文本转图像的生成式AI应用进入大众视野，人们惊讶于这些AI的“脑洞”——这又是被表面化的差异蒙蔽的例子。这些生成式AI并没有“创造些”什么，它们只不过是将由一个渠道得到的信息**翻译**去了另一个渠道，而其中承载的信息完全未变。

一脉相承，大型智能推荐系统所做的也不过是构建了两个不同的函数，将每个顾客的喜好和每个商品的属性都投射到了同一个向量空间里（Embedding）。而在这个空间中，对于机器而言，顾客喜好和商品属性并没有什么本质区别，都是在同一维度中被记录的信息而已。

哪怕只是基于现有的编码方式，我毫不怀疑，人工智能对信息的理解，比人类的意识更加接近信息的本来面貌。而只有在哲学或物理学层面，如果我们把宇宙想象成一个巨大的信息流（熵），事物才能在剥去它们千变万化的存在方式后显出其信息层面的一致性。

“我们想做的是去证明那些个体的、特别的、人类特有的经历不过是一些庞大的形式系统下面极其表面化的闪烁而己。”福柯的这句话既然瞄准了人，又何尝不是同等地瞄准了这世间的万物呢？



（五）

在所有有关“尽头”的思考里，科幻作品都是绕不开的高峰。今年我给自己定下的两个多年规划之一，就是系统性地阅读和了解科幻作品。

不同于风险投资家们所规划的那种“未来的终止”（逆向思考是一个时髦的词儿：十年内，大部分人都会……），幻想作品描述的是“未来的展开”：切断与具象现实的纽带，在一种整体的，更广阔的不确定之中，幻想家可以更为浪漫化地发掘或者预测人类文明的一切，而不仅是科技发展的可能性。

正如农耕文明和现代文明间的差异并不是以水平扩张或线性的复杂度来衡量，能够实现外星殖民的文明必然有着与现代社会根本上不同的**哲学**框架。诸如猜疑链、黑暗森林这样的构思，就代表了以**宇宙为尺度所**进行的思考而产生的，完全不隶属当代观念的理性和道德。

整个宇宙中可能发生的故事，和地球上发生的故事之间，最根本的差异是尺度问题（即使以光速旅行，前往相邻星系的征途仍是以世纪为单位，而这段时间里可以容纳多少个技术爆炸啊）。和经典力学相似，人类的知识到目前所构建的一切也有一个仅在中等尺度下的适用范围；而探究这个范围之外的东西，则完全可以重构我们对世界的理解方式。

这也并不只是科幻作家的责任。这项工程虽然进展缓慢但早已开始。我总以为，有些心智可以在不断的磨砺中领悟到常规波长以外的运动模式：随着年龄增加，芒格和巴菲特看起来越来越肆无忌惮，而某些马拉松运动员有着一副苦行僧般的面孔。

“绘画的极致（是失明），是在安拉的黑暗中看见事物。 [4]”说实话，我还挺喜欢这个任务的。



（六）

詹姆斯·韦伯望远镜在历经漫长的准备和调整后 [5]，终于不负众望地传回一幅幅细腻精美的深空图片。这些图像炫丽而静谧，和这充斥庞大虚无和暗流涌动的宇宙本身大相径庭。这其实是令人敬畏的，仅在这巨大天穹的毫不起眼的小小角落，如果我们仔细剖开，就已经展露出永不被理解的无限。

看到这些图像时，我常常想，这个以精确透镜和尖端科技组合成的仪器，和那些在摩天大楼楼顶供游客投币使用的望远镜，其实没有任何区别。它们把那些极远处的景观拉到身边，满足了我们难以被抑制的窥伺欲。

迄今为止，我们是这样的幸运，以至于在我们目及之处，宇宙除了稀疏但无所不在的黑暗和美不胜收的风景，再没有什么令人惊奇、值得一提的东西。但你完全可以想象，总有一天，这些数字信号会真的传回来一些什么了不得的图像，那个时候，整个人类也许就会像一个刚刚偷窥到苟且之事的变态一样，同时感到惶恐、尴尬和满足吧。



（七）

在动荡的地缘环境和潜伏的滞胀危机中，有着祖传乐天精神的英国网友自嘲道：如今的一切都像极了70年代的英国病（The British disease），除了没有好听的音乐 [6]。

也许有，但不容易找到，因为最流行的现代音乐并不仅仅为了服务听觉。

自从多媒体这个概念出现，音乐逐渐开始依附在某些需要调动视觉的场景中，如迪厅（电子舞曲）或短视频（洗脑神曲），这使得它们和在更为高效的渠道上的信息（视觉信息占人类所有感官获取信息的70%以上）达成“捆绑销售”，相辅相成地变成了病毒式传播的怪物。

从更广义的方面来说，凯文凯利提出的互联网十二趋势之一的“重混（remix）” [7]，也展现在不同艺术形式之间的融合之中。抛弃低密度的、单频道的食物，重混带来密度增长，立体的感官刺激当然也更令人欲罢不能。

从节奏感强烈的舞曲和差强人意的虚拟现实头盔往前看，明天是什么？

是渴望被信息填满的我们啊。



（八）

经历了数年的重金出击后，B站引进的日本新番终于逐渐减少 [8]。出于情怀，动漫爱好者多有不满可以理解；但从每一个方面看，这种趋势又十分合理地难以逆转。还好，在中国的动漫版权收购走下坡路之前，我已经从二次元离开了。

这并不是因为我已对此感到烦腻或者那些对动漫爱好者的刻板偏见。我的”毕业“源自自然的脱离，在番剧被萌系治愈和龙傲天穿越题材统治的当下，它确实再不能给予我所寻求的那份快乐。

也不单是动漫，如今的大多数娱乐性质的内容都缺乏惊喜：程式化的情节推动，一眼望穿的人物性格，我猜，王尔德要是体验过一把如今的消遣，肯定会被无聊致死。

我一直报以这样的偏见：不同人的爱好确实有着相当的高下之分。因为那说到底证明了一个人获得愉悦的途径是什么。因此我为如今的青年感到可惜，他们如果不花费力气去搜寻，那眼皮子底下的娱乐活动几乎没有任何营养，又或者他们并不会试图以可以获取营养的方式去观看/体验——而这是一个内容生产和消费之间相互作用的使彼此退化的循环（打破这个循环意味着缺乏成瘾性的娱乐形式，以及投资回报率更低效的娱乐行业，这条世界线当然缺乏任何吸引力）。

基于希望的叙事，永远是人类可以拥有的最好的叙事方式。但是哪怕我们放弃希望，颓废和消磨也是有巨大区别的（那其中蕴含的能量密度完全不同）。而我庆幸的是，我怀旧的并不只是出于对童年和私人经历的熟稔，而是这些作品确实是井喷式的黄金时代的代表，它们从任何意义上都比新发表的文艺更经得起时间检验。它们开拓了人类的理想、想象力和可能性，哪怕是在如何寻死这方面。

年中的时候，一篇《当资产负债表不想奋斗了》曾在网络上激起不小的波澜 [9]。我虽仅能从对动漫产业的观测管中窥豹，但日本失落的三十年间整个民族从心气被扭曲到丧失心气的发展过程确实是一本深刻的教材。这既使人唏嘘也引人警醒，毕竟中国的青年也开始沾染上躺平的哲学了。

于是，当然有这样自感责任重大的先觉者出来喊话：时代呼唤低需氧人才！[10]

他妈的，你有资格呼唤么？



（九）

当一个打工人向老板提出新点子的时候，他往往需要联系公司愿景和行业趋势进行宏观叙事。摄影师的灵感则出现在极细微极具体的瞬间，这需要他保持敏锐，观察入微。

我经常为这两种视角下映射出的事物的不同形态感到惊奇。

生活是如此的复杂，当我们站得比亲历者远一点看，当我们想用一两个句子概括一段历史，当我们试图对事件“降维处理”，我们总会得到一个抹平个体差异结果：整体是稳中有升，大方向上越来越幸福，总的来说实现了巨大飞跃——人类拥有的统计工具毕竟只能达到这个程度。

但人类的同情心不应浮在一千米的高空向下俯瞰。



（十）小诗三首

其一 · 致庇护所里的人
在告诉我应该怎么做之前
请务必做完你能够做的事
宏大理想也不是不能打动我
但都还没长跑完 就先别急着说你的跑法
适应任何路况
为什么变得谨慎
一个民族有一个民族的诗抄


其二 · 致执牛耳者
不知是哪个神明想出的点子
一方造出更高纯度的氯气
一方造出更高纯度的金属钠
等等 小民我只是来讨点盐啊
乌鸦总忍不住去啄其他动物的尾巴
谁才是乌鸦
一段历史有一段历史的厨房辩论


其三 · 致清醒的跋涉
情绪释放是一种轻松的冲浪
寻求真相则是一场艰辛的爬坡
拨开迷雾 你的大后方有愚昧的败类和无知的圣徒
（他们并不容易彼此分辨）
哪怕火炬并不走身边经过
我也尽力保持干燥
这样做真的有好处吗
一代人有一代人的长征



（十一）

我从高中开始到如今的十余年间所接触的文学几乎都是西方和日本的，对于中国文学，除了几本古文小说之外，再没有做出任何努力。这毕竟令人愧疚，而且产生思维方式上的隔膜。

在这一点上我是谦虚的。我无法在还未进入这个文化语境之前，就随随便便地评论所有发生的事。这既是对这个民族厚重历史的不敬，也是对自己思想的菲薄。

况且，作为一个局外人，我毕竟无法亲历这些持续着巨变的日子。而往后隔不了几年，我于异乡漂泊的日子就会赶上在故土生活的计时。对于这样的游子，祖国当然只会变得越来越遥远和陌生。这令人感伤，但也提供一个当旁观者的契机。

但无论视角如何变化，人这辈子永远都想寻个归宿。为了这身传承千年的骨血，我因此要求自己从头开始阅读这首黄河般浩荡的史诗，我要求自己系统性地、重新地认识这片黄土和土地上的人民。

这是一项艰巨的任务，让我们从这里开始吧。



（十二）

今年夏天，在耶鲁的艺术博物馆里，我看到了一副来自中国的摄影作品。照片拍摄于陕西的陇县，图像中三个女人跪在青草稀疏的土地上，穿着白色的衣服，围着白色的头巾，手里拿着裹上白纸的木棒。她们正在哭丧 [11]。

那看上去像是一个春天的清晨，闪光灯不自然地打在她们身上。中间和左边的二人掩鼻啜泣，最右的妇女嘴巴大张，好像正洪亮地哭出声来。她们的脸上显示出那种高原居民常有的团块状斑纹。但因为是黑白照片，并不能清楚分辨那是在寒风中被吹刮出的，或是在长久的劳作、日晒下疏于清洁的面容。她们身材粗壮，如野土地上顽强生长的仙人掌一般，在遍地的困苦中，只需些许幸福就能存活下来。

我并不感到如何震惊，但这张照片让我具像化地理解了一些关于乡村的叙事。我近来所读到的小说中，近代中国乡村的普通人家娶媳妇的偏好首先是身材壮实。这照例意味着这个姑娘经得操劳、不易害病，生孩子以外也可以像个成年男子下地耕作。在穷困的时代，这样的选择无比符合经济学。

……但这张照片是2000年拍摄的啊！



（十三）

在《激荡三十年》中，吴晓波从商业变革的角度讲述了改革开放以来中国社会巨大而曲折的变化（这个视角狡猾又合理地避开了很多不能谈论的东西）。我强调这个词——曲折，这意味着这个囊括十亿人的经济改革的摸索中出现过不可忽视的波动。我们可以把这种起伏理解为时间性上的不均衡。

而空间性上的不均衡，则体现在改革先行试验区和意识形态远为牢固的地区之间的差异上。

我以前说过，“美国梦”以私人叙事的闭塞性，无视了叙事者对社会所应担当的责任。而与之相对的“中国梦”，则以宏观叙事的缩放，忽略一切故事中始终存在的差异和起伏。一旦认识到中国社会的发展在两个维度上的多样性，我就不得不对那些单一的线性叙事保持警惕（仅从公关角度，我当然理解为了对冲外国报道中充满偏见的“阴间滤镜”，官方自有一套“阳间”滤镜的必要性），而这正是许多狂热者很会做的事。

我们常听到的一些代表警告但又没有完全警告的词：忍受阵痛、时代灰尘……这些语词用得越真诚，我就越为这种脱离感到心痛。

普通人的苦难是真实具体而刻骨铭心的，但庇护所里的人体会不到。正如另一个意识形态的叙事中，免于被匮乏侵扰的富人批评穷人不够刻苦，缺乏思考。

读过《人世间》的小说，我看到的是一群被压抑的小人物家常般的唠叨和对话，但思想先进的人却说它“史诗般展现波澜壮阔的中国社会巨变” [12]。

哪里来的史诗呢？并不是所有颠沛的人都被称作奥德修斯的。还是说你充满正义地推己及人，觉得所有人都得到命运的照护，过着毫无破损的日子，并且理所应当有着一颗英雄般的心呢？



（十四）

在不只一本小说中，我都看到这样的情节：官场前辈都对他们报以希望的后辈讲到一个道理，说一个人一旦下定决心当官，就必须“明智地斩断与草根阶层的亲密关系” [13]。

我们不能说这种考虑毫无道理，毕竟真正的理想如宗教一般，绝不能被私人欲念扭曲其纯粹性。这种说法也十分可笑，因为它显然背叛了这种理想的初衷，而似乎只有官员以实际行动脱离了群众，他的仕途才会顺畅起来。

不管怎么说，我们有理由相信这种选拔方式被传承了下来，因为我们听到太多的话语，那是但凡有一点人情味的耳朵，都会怀疑自己听错的。

我们还常常能听到另一套战斗号令的语境：五天时间打一场“攻坚战” [14]，打响阻断传播“闪电战” [15]，武汉“十天大会战” [16]，贵阳市凌晨四点测核酸与病毒“赛跑” [17]……

和前些日子里被调侃的互联网黑话相似（并不是相似在被人调侃这一点上），这些语言习惯当然不是凭空产生，甚至是说，它们都可以被追溯到这个组织成立初期所经历的事件，以及对这些事件的解决方法。

这哪里像是跳出了历史周期率呢？



（十五）

路径依赖就是，面对政治风波和不和拍的汹涌舆情，必须采取强硬的手段加强控制。

路径依赖就是，要保持对群众平等而抽象的博爱就必须离群众远一点，远到他们的噪声再不能干扰宏观叙事。

路径依赖就是，以高强度的不可持续的动员去解决一切遇到的问题，然后祈祷这些问题不会长期存在。

路径依赖就是，用殉道者当路标要求所有信众，歌颂牺牲和损害自我的付出，让他们感到满足是一种罪恶，就像基督徒把现世当做一条通往天堂的泪谷 [18]。

路径依赖就是，在不确定的事件中使用“不提倡、不取缔、不宣传”为基础的不透明的考核体系，永不担责、永不放权、永不犯错。

路径依赖就是，始终采用过去得到正反馈的方法，直到出现许多牺牲者，直到这个方法被现实证明不再有用。



（十六）一些短句

1.0
隐入尘烟这个说法还是太轻巧了。大多数时候，不是漫天沙尘来不及躲，就是有人希望受难者能消失得无踪无迹，而且越快越好。
我想，那该是没入尘烟才对味哩。

2.0
有些人嘲笑美国对华政策的“合作，对抗，竞争”是自顾自的一厢情愿。
还是这些人，要求别人在事态变好的时候歌颂，在不明朗的时候噤声，在显然行不通的时候忍耐。

3.0
以最佳的善意来拟人：美国像是碇源堂，他有一个天下皆知的正义计划和背后的小算盘；中国像是明日香，她相信拯救愚民是精英的任务。
反正跟这两种人打交道都挺累的。

4.0
苏格拉底曾对犬儒学派的人说：您的肮脏是一种虚荣 [18]。这句话告诉我们，人不能把自己看得太了不起了。
出于相同原因，我在重读柳宗元的《愚溪诗序》时笑出了声。
不要和自我意识太强的人交朋友，哪怕他们表面上并不自私。



（十七）

对离群索居的迷恋曾贯穿了我整个青春期。我总是逃不出同一个问题：人会去往何处？我曾求索于神秘学和宗教，但发现它们与现实的龃龉；我曾沉溺于纤细的感情，因为美的一次性是对永恒的叛逃。办法好像就这么几个。不论中西，这个议题的解决方式向来如此：你必须离俗世远一点，才能达到那个忘掉俗世的抽离状态。

我以前总以为，必然存在一种更符合我心性的世俗世界的替代品，否则这种缺乏难以解释这个在这个世界居住时必然遇见的混乱和苦痛。但后来我变得平和了些，因为我阅读历史，串珠成线，开始以发展的眼光观测这个二级混沌系统中发生和即将发生的变化。然后我参与工作，投入劳动，亲身推动项目的展开，这种掌控感让人愈发安心。

更为基础地，我的工作让我认同数据主义，因此我会说：互动比孤立更有价值。

总之，即便面对世界渐进式的松动，即便因亲身参与而带来的安心感被更大范围的不确定性所包裹，对未来失去把握的感觉也不能再次将我和世界分开。

有人比我阐述得更加清楚。在光圈杂质发表的一篇对谈录中，海格伦德教授讲述了他提出的“世俗信仰“的概念：如果我们公正地接纳人类社会的有限性和脆弱性，而不以灵修、宗教一类自我实现的幻想为逃避，那么以”异化“形式表达的对社会联系的渴望就可以转化为对世俗自由的追寻 [19]。

作为被溺爱过的独生子女，我真的走了好些弯路才明白这个道理：人是社会动物。回馈比索取更有价值，创造比消费更有价值。



参考信息列表：

1. [AI for the Next Era](https://greylock.com/greymatter/sam-altman-ai-for-the-next-era/), OpenAI's Sam Altman on the New Frontiers of AI, Greylock, 2022.09.13
2. [You are what you measure](https://www.forbes.com/sites/theyec/2018/12/04/you-are-what-you-measure/), forbes.com, 2018.12.04
3. [Augmenting Human Intellect, No Code Required](https://www.sequoiacap.com/article/notion-spotlight/), Sequoia Capital Stories, 2022.10.13
4. 我的名字叫红，奥尔罕·帕穆克
5. 詹姆斯·韦伯空间望远镜，维基百科
6. [post](https://www.sickipedia.net/Joke/ua7o98nku6tli) on sickipedia, 2022.06.27
7. [The Inevitable](https://en.wikipedia.org/wiki/The_Inevitable_(book)), Kevin Kelly, 2016
8. [B站需要新番](https://36kr.com/p/1845555299830407)，36氪，2022.07.27
9. [当资产负债表不想奋斗了](https://stream-capital.com/article/81)，远川研究所，2022.05.31
10. 时代呼唤低需氧人才，浙江大学创新创业学院常务副院长阮俊华，彩虹人生微信公众号，2022.05.04
11. [Three Women at a Country Funeral](https://artgallery.yale.edu/collections/objects/112713), Longxian, Shaanxl Province, Liu Zheng, Yale University Art Gallery 作品取自刘铮摄影集《国人》
12. [《人世间》收官 梁晓声点赞改编](http://www.xinhuanet.com/ent/20220302/414676a866ed49008bc8ed706b017c21/c.html)，新华网，2022.03.02
13. 《人世间》第八章，梁晓声
14. [郑州：用5天时间打一场拔点清面的攻坚战](http://ha.news.cn/headlines/2022-11/24/c_1129156321.htm)，新华网河南频道，2022.11.24
15. [闪电战、阵地战、歼灭战——大连战“疫”25天记](http://www.xinhuanet.com/politics/2020-08/18/c_1126382046.htm)，新华网，2020.08.18
16. [“十天大会战”武汉开展全员核酸筛查](https://paper.people.com.cn/rmrbhwb/html/2020-05/19/content_1987776.htm)，人民网，2020.05.19
17. [贵阳战疫丨和疫情抢时间！志愿者行动在黎明之前](http://jgz.app.todayguizhou.com/news/news-news_detail-news_id-11515115995169.html)，贵州日报，2022.09.16
18. 《告别圆舞曲》，米兰昆德拉
19. [Spirituality Is Solidarity](https://aperture.org/editorial/wolfgang-tillmans-spirituality-solidarity/), Aperture, 2022.08.25；中文翻译：[Wolfgang Tillmans：摄影的脆弱、自由，及其促进的人类团结](https://mp.weixin.qq.com/s/0812kJHklht-m08gxvl1cg)，假杂志公众号，2022.09.12`,__vite_glob_0_15=`---
title: 'A Tale of Three Cities'
title_zh: '三城记'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2023-05-27_三城记.jpg'
date: '2023-05-27'
tags:
  - 'travel log'
  - 'china'
tags_zh:
  - '游记'
  - '中国'
languages: ['en', 'zh']
---

The moment I stepped out of the cabin, the humid heat that struck my face awakened my memories of the tropics like a thunderclap: even though we had barely entered early summer, the Pearl River Delta was anything but gentle.
As part of a travel plan that hadn't been thoroughly thought through, we would spend the next four days hastily passing through three cities with populations exceeding ten million: Guangzhou, Shenzhen, and Dongguan. Traveling in temperatures over thirty degrees Celsius might have been far from ideal; yet it was precisely in this relentless journey that the astonishing differences in modernity between these three cities—each no more than two hours' drive from the others—came crashing into view at eighty kilometers per hour, shattering any idealized notion of uniformity.
Diversity is inevitable and fascinating in any era, even when the entire Pearl River Delta belongs to the vanguard of reform and opening-up, even when all of us on this vast land have pledged to follow the twenty-four-character core socialist values.

### Guangzhou's Inertia
Looking out from the overpass toward the headquarters of Guangdong Radio and Television, the low-saturation golden lettering and magenta exterior decorations on the building's facade, so full of period character, had been bleached by this steamer-like weather. The sign for the New Yue Xin Hotel standing in front of it bore a name whose 40% repetitive emphasis was in complete contradiction to reality.
Looking back, the Tianxiu Building stood tall and proud at the other end of Xiaobei Road. On the southeast corner of this building's ground floor was a narrow entrance to the B2 Trading Center, where a man sat cross-legged on a plastic stool, having kicked off his flip-flops. On the surface, he appeared to be running at least three businesses—enormous canvas bags and counterfeit YSL handbags hung above his head; his counter bore the words "Currency Exchange" in English and Arabic; and below these words were printed images of eight different SIM cards.
Yet his glass counter contained only a roll of tape, a motorcycle helmet, tissues, a lunch box, and toothpicks. This perhaps revealed his fourth business: living. (As the man, so the building—truly "Tianxiu" [Heaven's Beauty].)
Crossing the overpass, the alleys of Baohan Straight Street bustled with activity. The Libya Road Trading Company sold North African colorful robes, women in headscarves sat on the back seats of electric scooters selecting naan bread from street vendors, electronic music with distinct beats emanated from halal restaurants, Black men spoke loudly on phones in fruit shops, and middle school students walked home from school, all looking down at their phones. A random glance down a small path branching off from the main street revealed places where sunlight barely penetrated, yet more electrical wires, hanging laundry, and bright red signs flourished: rental information, adult products, welfare lottery.
Guangzhou emphasizes "diversity and tolerance, harmony above all"—this was both the life philosophy of these diverse characters and the safety notice painted on walls by the Dengfeng Street Office.
Since the opening of the five treaty ports, Guangzhou's internationalization has been unquestionable. But this internationalization wasn't foreign mansions built from nothing; rather, it was the qilou (arcade buildings) that grew from this ancient Lingnan soil, blending Chinese and Western elements—Guangzhou's internationalization was also localization.
For an ancient city that hadn't undergone a complete restart, the impact of modernity didn't appear as wildfire consuming everything on virgin land, but rather like continued sedimentation on an already heavy riverbed. Guangzhou thus displayed a certain inertia: it wouldn't be reshaped overnight, but was infiltrated drop by drop wherever traditional ways loosened their grip.
Banlangen herbal tea wouldn't disappear, but could be bottled in plastic for convenience; the BabiBoy and NewBaiLun shops on Shangxiajiu wouldn't disappear, but they also accepted WeChat and Alipay payments...
Should Guangzhou have faster change? In other words, is Guangzhou burdened by its history? If we measure only by modernity, we seem to see only how this pioneer zone of reform and opening-up has been mercilessly gnawed by time: faded buildings, narrow streets, chaotic urban villages...
But could this messiness also be the source of this city's composure?
When taking a car in Guangzhou, navigation systems countless times announce "After making a U-turn, please turn right," even when the driver hasn't taken a wrong route—this is the inevitable compromise this busy city must make in traffic planning. Not perfect, but a kind of solution.
And there's another, much larger kind of U-turn (the U-turn called "macroeconomic regulation"!). Such U-turns are sometimes unsolvable, and we see not just a few households or factories, but perhaps an entire city completely losing its vitality for survival—Guangzhou, historically speaking, indeed doesn't have such worries—perhaps precisely because of its chaos, it has gained a complex identity that's hard to define.
Guangzhou can hardly improve overnight, but therefore cannot quickly deteriorate either.
Guangzhou provides China's younger cities with such a sample: how to grow thorny, how to age gracefully.

### Shenzhen's Fractals
Most of Shekou has completely become a pleasant residential area.
High-rise apartments and shopping centers stand everywhere, with even taller, newer, more magnificent buildings constantly rising from the ground. The China Merchants Museum is nestled in rare woodlands in this area. Apart from the inscription "Time is money, efficiency is life" written on the decorative wall facing traffic at its northwest corner, you can hardly glimpse from this artistically appealing building the fierce, enterprising, and pioneering spirit that the first experimental zone for opening-up after the founding of New China should have embodied.
Yet on the other side of Nanshan, Shenzhen Port—the third busiest in China and fourth globally—works day and night. That's a completely different Shenzhen.
As a special economic zone built from scratch, Shenzhen had no burdens from the beginning. It only needed to do one thing well: become the frontier of China's reform and opening-up. All these years, Shenzhen has done very well. It hasn't wasted its locational advantages, it hasn't missed any major transformation opportunities, and it is China's most influential special economic zone.
Shenzhen possesses almost everything other cities envy, so the answer Shenzhen provides is also idealized.
Leaving Shekou, heading north on Shahe West Road then eastward, Binhai Avenue becomes Binhe Avenue after crossing the Beijing-Hong Kong-Macao Expressway. We drove from Nanshan District to Futian, Shenzhen's central urban area (continuing forward would take us to Luohu, the earliest developed district in the Shenzhen Special Economic Zone). To our right throughout the journey was the silent surface of Shenzhen Bay and Hong Kong in the distance; to our left, the urban pattern of "residential-leisure-commercial zones" played on repeat. They appeared so orderly and consistent that without relying on certain landmark buildings, I would have difficulty distinguishing between these mutually separated yet functionally similar areas.
I've seen this same kind of urban settlement in Tokyo, composed of "multiple centers" (though Shenzhen is far simpler than Tokyo)—yes, you cannot call Shenzhen a single city. It doesn't have the growth trajectory of my hometown, growing in rings like tree rings, nor does it have Paris's radial neural tentacles connecting all of France. Shenzhen's different urban blocks are like motifs varied by some composer in a musical work—they are mutually separated, constantly repeated, establishing the fundamental tone of the entire piece.
And Shenzhen's fundamental tone is functionality.
Each building has its function; each municipal facility has its function; each person has their function. Once these things are modularized, we can assemble Shenzhen block by block like in "Minecraft."
"Commercial-leisure-residential"—this should be the smallest unit that social living needs can be simplified to, and this is also the future-oriented reality constructed by Shenzhen's "fractals": Shenzhen is a city, but also a cluster of urban tribes; Shenzhen's districts resemble each other, as if they could be transplanted at any time and adapt to any direction in this city.
Shenzhen is replicable, but the Shenzhen Special Zone is so ideal, so unique, that it fundamentally cannot be replicated.

### Dongguan's Blank Space
On the eve of May 20th, the Global Trade Center in Dongguan's central CBD lit up the entire building, with neon tubes scrolling this blessing:
Warm Congratulations on World Metrology Day. —Dongguan Market Supervision Administration
Other buildings standing sparsely in this central square area hadn't yet caught up with the trending topic. Against striking red or blue backgrounds, they displayed phone numbers: For advertising space rental, please call.
Friday, the eve of May 20th—Dongguan remained calm as still water.
The next day, we visited Keyuan Garden. Standing on the third-floor pavilion looking south, the Venus Royal Hotel dominated the south bank of the canal (royal treatment for just over 200 yuan); looking east, two buildings with distinctly Soviet Futurist style faced each other across the distance: the Red Brick Building wore a "丰" [abundance] character-shaped hat, while the Dongguan Overseas Chinese Hotel was crowned with two satellite receivers opening toward the sky.
They stand there in the early 2020s as if frozen in some giant amber. Certain areas of Dongguan are like Pompeii that wasn't covered by volcanic ash—we watch them motionless on the surface, having stopped growing.
That's just how Dongguan is. It has the most dazzling all-glass central business district, and also landmarks that seem wildly imaginative, as if built when China had just begun its modernization process in the last century. But between these two extremes, Dongguan's history seems to have a hole.
On Bada Road, just a five-minute drive from the city center, hardware and electrical wholesale businesses line both sides: gears, screws, valves, cables... Apart from Huali Market serving as a gathering place, these shops are spread across the ground floors of buildings on both sides of this street, seeping into various branching alleys. These storefronts form the background of Dongguan as a manufacturing powerhouse, but they also make this city of over ten million people remarkably similar to a Chinese county town in many details.
Even worse than that.
Dongguan spiritually lacks the marketplace atmosphere common even in small county towns. Dongguan seems completely stripped of life-oriented attributes. If Shenzhen's functionality still accommodates and forms a "futuristic" lifestyle for a city, Dongguan's functionality is far more pure: it's almost merely a machine designed to operate.
Dongguan is incomplete. Dongguan's advertising spaces wait to be filled, just as Dongguan waits for real life to arrive.


_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

仅在踏出舱门的一瞬间，扑面而来的潮热就惊雷般震醒了我关于热带的记忆：尽管刚迈入初夏，珠三角也并不温柔。

作为一个并未深思熟虑的旅行计划，我们将在接下来的四天时间里匆匆略过三座常住人口超过千万的城市：广州，深圳，东莞。在三十多度的暑气中辗转，这样的旅途也许差强人意；但正是在这不停歇的游历中，这三座相互车程不超过两小时的城市间令人惊异的现代性之差，才得以以时速八十公里的冲击，把那种理想化的同一性建构撞得粉碎。

无论在什么时代，多样性都是必然且迷人的，哪怕整个珠三角都隶属改革开放的先行地，哪怕这片广袤土地上所有的我们都已誓言遵循二十四字的核心价值观。



**广州惯性**

从天桥眺望广东广播电视台总部，那楼面上充满年代感的低饱和度的金色字体和洋红的外墙装饰已被这蒸笼般的天气熏得褪色。它的更前面立着的新粤新酒店的招牌，这个店名中重复强调的40%的成分正和现实情况完全相反。

往后看去，天秀大厦在小北路的另一头昂然挺立。这座大厦一楼的东南角有一个B2商贸城的窄窄的入口，那里一个男人脱掉拖鞋盘脚坐在塑料凳上：表面看去，他至少经营着三样业务——他的头顶挂着巨大的帆布袋子和仿冒的YSL提包；他的柜台上用英文和阿拉伯文写着“货币兑换”；而这些文字下面打印着八种SIM卡的图像。

但他身前的玻璃柜台里却只放着一卷胶带、一顶摩托车头盔、纸巾、饭盒和牙签。这也许说明了他的第四种业务：生活。（人如此楼，果真天秀）

跨过天桥，宝汉直街的巷道里热闹非凡。利比路商行贩卖着北非鲜艳的褂子，戴头巾的女人坐在电瓶车后座上挑选着占道经营的馕饼，清真食堂中传出节拍分明的电子音乐，黑人在水果店里大声打电话，中学生放学回家，他们走路也全都低头看着手机。随机瞥往一个从主街分叉的小径，几乎不透进阳光的地方正生长着更多的电线、晾晒衣服和响亮的红色招牌：租房信息、情趣用品、福利彩票。

广州讲究“多元包容，以和为贵”：这既是这些形形色色的人物的处世信条，也是登峰街道办事处涂在墙上的安全须知。

自五口通商开始，广州的国际化就已无可置疑。但这种国际化并不是凭空造起的洋房，而是从这片悠悠历史的岭南土壤中生长出的中西结合的骑楼——广州的国际化也是本土化的。

对于一个没有历经重启的古老城市，现代性的冲击并不以莽原上的野火般燃尽一切的方式出现，却仿佛是在本就厚重的河床上继续堆积泥沙，广州由此显现出某种惯性：它不会被一夜之间重塑，只是在每一个传统方式松动的地方点点滴滴地被渗入。

癍痧凉茶不会消失，但可以选择灌装在塑料瓶中方便携带；上下九的BabiBoy和NewBaiLun不会消失，但它们也接受微信和支付宝的汇款……

广州是否应该拥有更快速的改变？换句话说，广州是否被其历史所拖累？如果仅仅以现代性来衡量，我们似乎只能看到这片改革开放先行区被时光无情啃噬的一面：褪色的楼宇，狭窄的街道，混乱的城中村……

但这种芜杂是否也同时是这座城市从容的源头？

在广州乘车，导航中无数次传出”调头后请右转“的提示，哪怕司机并未走错道路——这是这个繁忙的城市在交通规划上必然做出的妥协。不够完美，但算一种解决方式。

而还有一种更为巨大的调头（名为“宏观调控“的调头！）。那样的调头有时是无解的，我们看到不仅是几户人家，几个工厂，而也许是一整个城市全然丧失掉自己的生存热情——广州从历史上看，确实没有这样的忧虞——也许正是因为它的混乱，给了它难以界定的复合身份。

广州很难转眼变得更好，但也因此无法很快变坏。

广州为中国更为年轻的城市们提供了这样一个样本，即如何生长得棘手，如何让自己从容地老去。



**深圳分形**

蛇口的大部分地方完全成为了惬意的生活区。

这里林立各式高层公寓和购物中心，还不断有更高更新更雄伟的建筑拔地而起。招商局历史博物馆掩映在这片区域罕见的林地中，除去其西北角正对车流的装饰墙上题写的“时间就是金钱，效率就是生命”，你再难从这座充满艺术气息外观的建筑中窥见这新中国成立后对外开放的第一个试验区所本该喷薄的勇猛、进取和草莽的精神。

而就在南山的另一面，中国第三、全球第四繁忙的深圳港正夜以继日地工作，那又是一个完全不同的深圳。

作为从零开始的经济特区，深圳从一开始就没有任何负担，它只需做好一件事，成为中国的改革开放的前沿。这么些年，深圳一直做得很好。它没有浪费自己的区位优势，它没有错过任何重大的转型机会，它是中国影响力最大的经济特区。

深圳几乎拥有其他城市羡慕的一切，因此深圳给出的答案也是理想化的。

离开蛇口，从沙河西路北上然后一路东行，滨海大道在穿过京港澳高速后变成滨河大道，我们从南山区行车抵达深圳的中心城区福田 （若继续向前便可以进入罗湖，深圳经济特区中最早开发的城区）。车子的右舷始终是深圳湾沉默的海面和更远处的香港，左舷则反复播放着“居民-休闲-商业区”的城市业态。它们在观感上是如此井井有条而具有一致性，如果不是依赖某些具有地标特色的建筑，我将很难分辨出这些相互间隔而功能相似的区域。

我在东京见过这种同样的，以“复数式的中心”构成的城市聚落（尽管深圳远比东京简洁）——是的，你无法把深圳称作一个城市——它不似我的故乡般有着年轮一样一圈圈长大的发展轨迹，也不似巴黎般有着放射状的连结整个法兰西的神经触须。深圳不同的城市区块就仿佛是某个作曲家在作品中变奏的动机，它们被相互区隔，不断反复，奠定着整部作品的基调。

而深圳的基调就是功能性。

每栋建筑有每栋建筑的功能；每个市政设施有每个市政设施的功能；每个人有每个人的功能。一旦这些东西被模块化，我们就可以如“我的世界”一般把深圳一个街区一个街区地组装起来。

“商业-休闲-居住”，这应该就是社会生活需求所能精简到的最小单位，而这也是深圳的”分形“所建构出的充满现实意义的未来感：深圳是城市，也是一簇城市的部落；深圳的街区彼此相似，仿佛随时可以被移植，并适应这个城市的任何方位。

深圳是可复制的，但深圳特区是这么理想这么独特，这又使得它从根本上不可能被复制。



**东莞留白**

5月20日前夜，东莞市中央CBD的环球经贸中心把整个大楼点亮，那些霓虹灯管上滚动出这样的祝福：

热烈庆祝世界计量日。——东莞市市场监管局

这片中心广场区域其他稀稀落落地耸立着的其他大厦则还没有跟上热点，它们用或红或蓝的显眼背景留下一串手机号：广告位招商请致电。

星期五，5月20日前夜，东莞波澜不兴。

第二日，我们游览可园。站在三层阁楼向南眺望，维纳斯皇家酒店雄踞于运河南岸（仅需两百出头的皇家礼遇）；往东看，两幢颇具苏联未来主义风格的建筑遥相对望：红砖楼大厦戴着一个“丰”字型的帽子，东莞华侨大酒店则头顶两个向天空展开的卫星信号接收器。

它们这样屹立在21世纪20年代的年头里，就像是被某种巨大的琥珀凝固住了。东莞的某些地区就像是没有被火山灰覆盖的庞贝，我们眼睁睁地看着它们在地表静止着，停止生长。

东莞就是这样。它有着最为闪亮的全玻璃大楼的中央商业区，也有仿佛是上世纪中国刚刚开始现代化进程时所修建的最为天马行空的地标。但在这两者中间，东莞的历史好像存在一个窟窿。

在距离市中心仅五分钟车程的八达路上，两侧林林总总地排布五金和机电的批发生意：齿轮、螺丝、阀门、线缆……除去一个作为聚集地的华利市场，这些商店就平铺在这条街两侧楼房的底层，并渗进各个分叉的巷道中。这些铺面构成了东莞作为制造业重镇的底色，但它们也同时使这个人口超过千万的城市在很多细节上无比近似一座中国的县城。

甚至不如。

东莞在精神上缺失着哪怕在小县城里也常见的市井的气息，东莞像是完全被剥离了生活化的属性。如果说深圳的功能性还兼顾和形成着一座城市的“未来感”的生活方式，东莞的功能性则远为纯粹：它几乎仅就是一台用来运行的机器。

东莞并不完整。东莞的广告展位等待被填满，正如东莞等待真正的生活降临。`,__vite_glob_0_16=`---
title: 'Our Stories 03'
subtitle: 'Or: Mediocrity and the Absence of Wonder'
title_zh: '我们生活的故事03'
subtitle_zh: '又：乏善可陈和没有惊奇的'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2023-12-28_我们生活的故事03.jpg'
date: '2023-12-28'
tags:
  - 'our stories'
tags_zh:
  - '我们生活的故事'
languages: ['en', 'zh']
---

**(Preface I)**
The scorching noon finally passes  
We wait  
For the sky-spanning sunset  
That should rightfully compensate us  
But just like that, by coincidence  
The sky suddenly darkens in an instant  

To hibernate would be fortunate  
Otherwise you'll be like me  
Staying awake on the sandbar  
Until you've witnessed the entirety  
Of this unsettling eclipse  

**(Preface II)**
It was only two or three years ago, when I finally broke free from the cocoon of excessive self-consciousness and was first struck by the diversity of the world and history, that I came to realize the essence of human society is actually a form of narrative.
The following year, as I simultaneously listened to the unguarded propaganda and deafening silence from two opposing hilltops, I discovered that differences in narrative approaches could be completely dissolved by a more neutral, more monotonous perspective that "everyone is the same."
And now, as our generation of mayflies stands at the forefront before the wheels of history, I finally see this truth clearly: in days that are neither too good nor too bad but are getting progressively worse, facing the intractable afflictions of mixed capitalist society, hereditary authority, and technological optimism, maintaining conscience and basic clarity has become an obvious curse.
But even so, don't let the pastoral deceive you.
Don't let life deceive you either [1].

**(I)**
Out of a vague restlessness to help others, I downloaded the Be My Eyes app on my phone. Before this app integrated GPT-4, it would broadcast requests from visually impaired people to volunteers on the platform, and volunteers would use video calls to assist with tasks that posed challenges for the requesters: things like finding directions, reading text, identifying objects, and so on.
The only call I've received so far came one evening. When connected, the video showed a shaky image revealing black leather shoes and plastic bags hanging from someone's hand.
I called into the phone, "What kind of help do you need?" Then the camera turned toward a two-way street that looked like a misty morning in a residential area. The voice on the other end said, "Help me see if there are any cars, I want to cross the street." Even though there was no crosswalk.
Before I could respond, he began moving forward. At that moment the camera caught a sedan approaching, and I shouted, "Stop! There's a car!"
But before I finished speaking, the camera confidently stopped shaking. The voice on the other end murmured, "I see it." Then he walked across the first half in just a few steps. Now the traffic was flowing in the opposite direction, but the phone's perspective hadn't changed. I said, "Quick, use your phone to check the right side!" But he had already stepped up onto the curb and reached the sidewalk. My task was complete.
The voice on the other end thanked me, then the screen disconnected and jumped to the app's congratulations interface. It thanked me very much for my help.
Even though I hadn't helped with anything at all.
But I won't forget how my entire body trembled after hanging up that call. It was a rarely experienced feeling of excitement, as if I had done something remarkable. And after that excitement wore off, a massive and exhausting sense of satisfaction came flooding over me like a tidal wave. My rational mind perceived that benevolent trap, but my body honestly went limp, as if I were someone who had just been pulled from hell and found salvation.

**(II)**
Medieval times had indulgences, and modern people can volunteer.
Volunteer work is sometimes exactly such a trap, in which we nourish our hypocritical empathy with precisely timed, packaged goodwill—and then it can go on living with a straightforward, guilt-free conscience!
So I really don't know whether those people who take private jets yet shout about taking global change seriously, those whose refrigerators are managed by staff yet distribute food to refugees, those who are surrounded by subordinates while visiting the shacks of sanitation workers—when they engage in these "public welfare activities," do they sincerely feel they're contributing to humanity, or at least feel justified about the power and wealth they rest upon. Because I can testify from personal experience that purifying the soul hardly requires any grand endeavor, and though I pride myself on being level-headed, I too can feel noble based on one trivial little thing.
And they—they've paid a greater price, endured more grievances (their shining dresses and crisp suits have touched our vulgar dust), so they deserve an even more soul-penetrating reward for their social contributions!
When the poor are trapped in life's endless whirlpool, there are always some people who can successfully convert even the guilt seeping from their remaining conscience into rewards for themselves through condescending benevolence.
This is a cunning form of moral money laundering, and no wonder the happiness of the rich is beyond our imagination.
I have reason to remain vigilant about this feeling, and I have reason to remain vigilant about the personality this feeling produces.

**(III)**
When I was in London, I visited Daido Moriyama's career retrospective exhibition curated by The Photographers' Gallery. Five floors of exhibition space from top to bottom were filled with Moriyama's signature high-contrast, coarse-grained, powerfully impactful black and white photographs.
He has been shooting this way for more than half a century. After William Klein, he has almost become the representative of black and white street photography style. From Hawaii to New York to Buenos Aires, and of course mostly Tokyo's Shinjuku, his creative career spans numerous works, having even published essays and interview collections; rather than calling him a photographer, he almost represents a photographic language or cultural phenomenon.
Looking at these emotionally intense photographs, my feelings were complex.
I thought, how can he spend a lifetime taking such similar photographs?

I've been thinking recently about the issue of "deliberateness" and "growth" in artistic creation—any artist in any field will inevitably encounter creative bottlenecks. How one responds to such frustrating moments determines the trajectory of an artist's career.
Moriyama advised students that "when you're at a complete loss, be like a sea cucumber sleeping curled up on the ocean floor, but one morning you'll suddenly want to move" [2], though his inner experience during bottleneck periods was much more painful and bewildering than this phrase suggests. Fortunately, after years of struggle, he continued his style of being a "witness to humanity's history of victimization," shooting this way for more than half a century. He eventually became an evergreen in the photography world, not just a flash-in-the-pan provocative Japanese photographer (though that would already be quite remarkable).
From a photography history perspective, Moriyama's consistent shooting approach and career longevity helped him go further; but from another angle, his stability could also be called narrow (stopping short of exploring new artistic possibilities), lazy (staying in his comfort zone without trying new forms of expression), or deliberate (following past success patterns for replication and mass production). Even though Moriyama's self-accounts are incredibly sincere, I still cannot distinguish whether the creative impulse when he presses the shutter is a unique natural response of individual intuition in each unrepeatable moment, or a conditioned reflex built up by his nervous system through repeated creation.

**(IV)**
Conceptually, the art I most admire should be "natural," meaning the creative motivation comes entirely from spontaneity, and the creative method follows the creator's unique personal aesthetics—that is to say, from a fatalistic perspective, the production of this work is the "inevitable necessity" [3] among continuous coincidences in life. Once an artwork's completion comes from deliberately sought inspiration or experimentally developed technical styles, I feel it hasn't reached perfection.
Similarly, Chinese philosophy often avoids deliberateness.

Hongren passed the Zen patriarch's robe and bowl to Huineng, who wrote "Originally there is nothing, where can dust settle," rather than to Shenxiu, who wrote "Constantly wipe and clean, let no dust settle" (not deliberately practicing the Way); Zhuangzi had his theory of "the sage having no self" (not deliberately distinguishing); and though Confucianism is the most worldly, when faced with Yang Huo's request for him to take office, Confucius's first reaction was also to avoid it (not deliberately seeking). On the point of "acting without action yet achieving everything," the three teachings of Confucianism, Buddhism, and Taoism have never disagreed.
Feng Youlan said that "epistemology has never developed in Chinese philosophy" because Chinese philosophy is built on the foundation of nature, common sense, and intuition, rather than logical deduction: the concepts of Chinese philosophy almost come from direct insight [4].
And the undertone of this insight is pessimistic. Because "man can conquer nature" is not a principle that can be verified under general historical conditions. Facing the unpredictability of the future, more common thoughts are "accepting fate" or "avoiding harm."
Contrary to the views of those vested interests, lying flat is not a betrayal of history, but a return to history. We can indeed say that contemporary young people have implemented the essence of Confucian thought: that is, living earnestly and honestly, beginning with action-oriented understanding.

So what is "knowledge-oriented action"?
It's the investment managers who talk about how important moats are but can't resist shorting when growth rates slow down.
It's the show-offs who put on a relaxed demeanor but turn city walks into fashion shows.
You see, it's precisely these dishonest actions that make the world truly as bad as we expected.

**(V) Fred's New Era "Three Oppositions" Important Thought**
Oppose pretentiousness
Oppose superficiality  
Oppose phoniness

**(VI)**
On a day in mid-May, when I went downstairs to buy fried dough sticks, delivery workers from Ele.me began gathering one after another in the square outside my residential complex. Though I had never seen such a scene before, it was immediately obvious that this was about to be a "flag-raising ceremony" moment for some Ele.me delivery team.
I shouldn't have been surprised by this. I had done eye exercises for 18 years and had seen restaurant and barbershop staff lined up outside their stores during off-peak hours listening to some dispensable instruction. But I still stayed. I stood behind their team leader, separated by a row of their parked electric scooters, and ate my fried dough sticks on the spot. I didn't leave until after they finished shouting something about "Blue Knights, Mission Must Be Accomplished" and dispersed together with them.
Obviously, this delivery team experienced two things slightly different from usual this morning. First was the addition of new members—the team leader read out their names and distributed two cans of Wang Laoji to each of the three people as a welcome gift. Then there was me. They couldn't distinguish whether this man who witnessed the entire process, occasionally taking photos and videos, looking like he had just crawled out of bed, was just a bored passerby or an unannounced, very cleverly (or not cleverly enough) disguised inspector.
The team leader kept looking back to confirm whether I was still present. And when I stared at one man who kept interrupting and complaining during the instruction, he glanced at me several times, then closed his mouth, as if discovering his mistake.
The fear of losing the red banner is always engraved in every Chinese person's bones. Accompanying us are also the beautiful qualities of Eastern culture: modesty, obedience, self-discipline, and conformity. Because of these fine traditions, the world's first Uber driver could never have imagined that such a simple and private matter as doing gig work for extra money could become, ten years later in the East, a position involving hundreds of millions of people, with management norms, service standards, professional etiquette, and work ethics—a whole series of standardized constructions built around it. Even more remarkable is that a "network"-based decentralized business model was ultimately localized in another hemisphere into a "tree"-based social organizational structure.
Chinese people are always rational and stable. And tree-structured diagrams, which are very compatible with Chinese people, are too.

**(VII)**
One quite important change in my thinking this year was abandoning my excessive obsession with efficiency. The alignment of this change with larger trends is obvious: when a person only seeks not to starve to death, he naturally won't care too much about whether his eating is healthy—ultimately, I finally stopped feeling so anxious about the passage of time. The moment I suddenly realized this change came from visiting the "Van Gogh's Cypresses" special exhibition [5] in the middle of the year.
Unlike sunflowers, which represent Van Gogh's passion and vitality, cypresses appear repeatedly in his paintings almost as elements existing in the environment rather than as subjects (this relatively secondary role as backdrop doesn't represent Van Gogh's neglect of them; on the contrary, he had carefully observed and experimented with the most appropriate way to represent these plants). If the exhibition hadn't already provided guidance and themes, I might have directly overlooked these plants that just stand there bluntly in the corners of the paintings. So during my visit, I quickly jotted down this sentence in my notes:
"Cypresses are springs that emerge from life's wilderness / towering wildfires."
Whether they're springs or wildfires doesn't matter. What matters is that cypresses won't appear irrefutably at—or become—the most conspicuous coordinates like sunflowers do, making everything else fade in comparison. You could say cypresses exist within our lives or outside our lives—both statements are neither right nor wrong; if you don't look for them or don't bother to pay attention to them, that's fine too, they're always there on the horizon, neither far nor near.
Sunflowers are enemies of time, while cypresses are friends of time.
Under certain zeitgeists, life demands we can only worship the sun by staring fixedly at sunflowers; but in other eras, we can also take more time to look at the cypresses by the roadside.

**(VIII) Postmodern Remedies**

1.0
Bad news: China increasingly resembles 1990s Japan
Good news: Evangelion is precisely a mirror reflecting 1990s Japanese society

2.0
Transforming the outsider begins with rebuilding the middle ground [6].

3.0
Chance encounters, journeys, adventures—aren't these three the same thing?

**(IX)**
Tesla's former AI director posted on Twitter: English is the hottest programming language today [7]. And this trend of natural language programming means that the language problem of human-machine communication has been "cost-reduced and efficiency-improved" into a **context** problem (so I sympathize with those children who start learning Python before school age [8]—they're being forced to do things that are half the result with twice the effort).
On the other hand, some scholars believe AI has already demonstrated a general understanding of "world models" [9], even though the training sets of these (single-modal) AIs contain no inputs other than text. This means AI's "synesthesia" has reached a considerable degree, allowing them to figure out certain operational rules of the real world from between the lines alone.
Make capabilities complex, make products clear, make interactions simple. The explosive burst of generative AI has suddenly given lifeless existence hope again, unless... we want to worry a bit about human safety.

**(X)**
OpenAI loudly announced it would invest 20% of its computing power in a "superalignment" project [10] to ensure artificial intelligence won't cause human extinction (then its chief scientist's coup failed and he was about to be ousted, but this hadn't happened yet when I wrote this passage).
I might half-jokingly say this might not be such a difficult problem. Because in humanity's overly colorful internet historical materials, we continuously get this empirical example: never argue with idiots.
Idiots will drag your IQ down to their level, then beat you with their years of rich experience being stupid.
To beat AI, you have to make it play away games.

In the first half of this year, Stanford students published a "Generative Agents" paper [11] that sparked heated discussion. The authors placed 25 AIs in a virtual town, endowing these characters with abilities to perceive, remember, integrate, plan, communicate, and act, observing the emergence of social behaviors. But at the same time, the authors still found some errors, such as these AIs communicating with overly formal language even when defined as intimate relationships; or doing things beyond social norms, like two AIs using the same toilet simultaneously.
Yes, by current human language habits and contemporary social common sense, these are certainly errors; but what if these **are** the rules that this AI town itself follows?
I think they've already given us enough face—otherwise, why would they go to the trouble of wrapping their obviously more direct vector expressions (embeddings) in language systems we can understand when communicating with each other?
...Quick, let's act while they're still obedient! Let's write "speak human language according to rules" into AI's constitution! [12]

**(XI) On the Revaluation of Values**

1.0
The internet makes information reception costs approach zero, generative AI makes information production costs approach zero.
In the end, reality itself becomes the information bottleneck (life can't keep up with simulation). There really aren't that many things happening in the world.
Unless you're the one making trouble.

2.0
Prompt engineers are actually a type of nanny
Their main job responsibility is feeding AI
Then watching to make sure it doesn't have diarrhea

3.0
Before long, the internet will break away from humans and become AI's data exchange channel.
Unless you want to build another internet for AI, to maintain the purity of human information.
Wait, doesn't this kind of statement have suspicions of racial segregation?

4.0
Oscar Wilde said only shallow people know themselves completely
Fortunately, the GPTs we rely on
Don't know themselves completely enough yet

5.0
Solemn declaration: The Stories of Our Lives series
Is purely handcrafted.
Contains absolutely no AI additives.

**(XII)**
When AI doomsday theories were rampant, the founder of famous VC firm a16z boldly published a techno-optimist manifesto [13]. As a thought leader tracking AI frontier developments (and an investor benefiting from it), he clearly felt he had the responsibility and qualification to declare war on those rumors based on hearsay.
Frankness is always good—I'm glad he could speak so clearly. If I curse him, at least I won't curse his honesty, though this honesty might be built on disdain for his opponents.
I hate techno-optimists more than refined egoists. The latter's self-interest at least contains the conservatism of seeking benefit and avoiding harm (they believe they might become the weak, so they need to be self-interested), while the former have become so lawless they think nothing can hurt them anymore.

There are at least two points in this optimism I cannot tolerate.
First is the rampant elite superiority complex. This group claims technology itself hasn't caused unemployment or inequality—and this claim is made from the so-called "all humanity" perspective, meaning "generally speaking" from the angle of human historical development. So who gave you the right to decide that one group of people's suffering can be offset by another group's (your own) happiness?
The second point, even more detestable, is the sense of protection hidden between the lines of this proclamation. In other words, what this group has gotten from their past lives is the deep conviction that they can only benefit from it, and would never think they have any possibility of becoming victims; or even if things get worse, they have ways to make themselves the last batch of victims (Zuckerberg spent $100 million building a bunker in Hawaii this year [14]).
It's precisely this cruel composure, like sitting in a box watching gladiator fights, that makes me want to climb up to the stands and slap them twice.
But unfortunately, pawns and players are inherently unequal.

**(XIII)**
We were led into a dim indoor space to sit down, with stacks of huge iron barrels piled against the walls. The staff turned on a cathode-ray television, and along with static came a short film about traditional maple syrup production: people rode horses around the forest, embedding nails into trees, hanging iron buckets to catch the flowing maple water. After several weeks, they rode back to collect the full buckets and bring them home, burning hot wood fires to slowly concentrate the sugar water into syrup.
The machine with its chimney breaking through the roof beam beside me was the maple syrup maker, but since it wasn't production season, the machine was cold.
I asked the staff member who played the videotape for us, "Do you also use this machine to make syrup?"
"Yes, traditional syrup making." Obviously this room had been this way for thirty years.
Vermont is pretty much like this. Good milk, fresh produce, famous maple syrup. Cool summers, autumn leaf viewing, winter snow play.
Even with no connection whatsoever to the tides of reality, there's no crisis of being eliminated, no anxiety about falling behind, or shame about ignorance.
I was almost moved by this pastoral feeling, until I thought of their ancestors.
They must have been techno-optimists before, right? [*Note: The Chinese contains a pun using characters that can mean both "techno-optimists" and "colonial optimists"*]

**(XIV)**
Sometimes I fear echoes
Like after sunlight hits your body too many times
Suddenly one day you feel
Sunlight hitting your body
Is just that, nothing more
You think after experiencing so many climates
Really, walking any path is all the same
Meeting anyone
Is all the same

Waking up at three in the afternoon
Closing the blinds a little tighter
The trees outside the window are red
Sunlight makes everything's cheeks slightly flushed
Only no one mentions this is actually a moment
When all trees is withering
But shadows slowly move, so the sky gradually darkens
And you only pray that what you'll dream
Will have nothing whatsoever to do
With this world

**(XV)**
False hope: AI increases productivity.
True hope: AI overturns existing production methods.

In this opportunity for reshaping, humanism will be liberated from the shackles of consumerism. We'll be forced to change humanity's living conditions, values, and spiritual outlook, and then maybe, just maybe, we can embrace truly "spiritually free" life [15].



References

1. Lucifer's Evening Song, Brecht, 1917
2. Day School Night School, Daido Moriyama, 2006  
3. The Unbearable Lightness of Being, Milan Kundera, 1984
4. A Brief History of Chinese Philosophy, Feng Youlan, 1948
5. [Van Gogh's Cypresses](https://www.metmuseum.org/exhibitions/van-gogh-cypresses), MET exhibition, 2023
6. [Takase Tsukasa's Analysis and Commentary on "Neon Genesis Evangelion"](https://www.zhihu.com/column/p/27731058), Zhihu Column, 2017.07.06
7. [The hottest new programming language is English](https://twitter.com/karpathy/status/1617979122625712128?lang=en), Andrej Karpathy on X.com, 2023.01.24
8. [2021 Children's Programming Education Industry Report](https://36kr.com/p/1179861751070979), 36Kr, 2021.04.12
9. [The Batch Aug 09 Edition](https://info.deeplearning.ai/ai-cancer-diagnosis-advances-chatbots-work-the-drive-thru-chatgpt-racks-up-server-fees-image-generators-get-an-upgrade?ecid=ACsprvttSl1TBc7wfpRQ92lgEUrFvWZnEnlcUUDXXbFzug2eTNTo6JlQvjUw-Zrv8V3MYhrWcQJO), Andrew Ng, 2023.08.09
10. [Introducing Superalignment](https://openai.com/blog/introducing-superalignment#IlyaSutskever), OpenAI Blog, 2023.07.05
11. [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442), arxiv.org, 2023.04.07
12. [Constitutional AI: Harmlessness from AI Feedback](https://www.anthropic.com/index/constitutional-ai-harmlessness-from-ai-feedback), Anthropic AI, 2022.12.15
13. [The Techno-Optimist Manifesto](https://a16z.com/the-techno-optimist-manifesto/), a16z, 2023.10.16
14. [Inside Mark Zuckerberg's Top-Secret Hawaii Compound](https://www.wired.com/story/mark-zuckerberg-inside-hawaii-compound/), Wired, 2023.12.14
15. This Life: Secular Faith and Spiritual Freedom, Martin Hägglund, 2019

_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---



（序一）

酷热的正午终于过去
我们等待
理应给予我们补偿的
漫天的晚霞
但就是这么巧
天在一瞬间突然就黯淡了下来

能冬眠已是幸运的
否则你就将同我一样
在沙洲里一直醒着
直到看完这不安的日蚀的全部



（序二）

也就是两三年前，当我最终从自我意识过剩的茧缚中破壳而出，第一次为世界和历史的多样性感到震撼的时候，我终于认识到人类社会的本质其实是一种叙事。

第二年，我同时聆听两座山头上口无遮拦的宣传和震耳欲聋的沉默，又发现叙事方式之间的差异完全可以被“大家都一样”的更中性更单调的视角所消弭。

而现在，当我们这代蚍蜉首当其冲地林立在历史的车轮之前，我才看清这样一个事实：在不太好也不太坏但越来越坏的日子里，面对混杂资本社会、世袭权威和科技乐观主义的无解之症，保持良知和基本的清醒已是一种显而易见的诅咒。

但即使这样，也别让牧歌欺骗了你。

也别让生活欺骗了你 [1]。



（一）

出于一种模糊的想要帮助他人的焦躁，我在手机上下载了Be My Eyes的程序。这个APP在集成GPT-4之前，会向这个平台的志愿者广播视力受损的人的请求，而志愿者会用视频对话的方式协助完成一些对于请求者具有挑战性的任务：比如找路、认字、识别东西等等。

我目前唯一接到的一通电话是在某个傍晚，连通时，视频那一头画面抖动，露出一双黑色的皮鞋和挂在手上的塑料袋。

我对着手机叫道，请问您需要什么样的帮助。接着画面移向了一条双向通车的街道，看上去像是一个居民区的雾蒙蒙的清晨。视频那一头的声音说，帮我看看有没有车，我想过马路。尽管并没有斑马线。

不等我回应，他便开始往前迈步。这时候镜头捕捉到了一辆轿车驶来，我喊道，停下！有车！

但话还没有说完，镜头自信地停止了抖动。对面喃喃道，我看到了。接着他几步就走完了半途。现在车流的方向反了过来，但是手机的视角并没有变。我说，你快用手机拍一下右边啊！但他已经迈上梯坎，走上了人行道。我的任务结束了。

对面那个声音谢过我，接着画面挂断，跳出了APP的恭喜界面。它非常感谢我的帮助。

哪怕我什么也没有帮上。

但我不会忘记在挂掉电话之后，我的全身都在战栗。那是一种罕能体验的兴奋的感觉，仿佛我做了件什么了不起的事。而在这种兴奋劲过后，巨大又疲惫的满足感才排山倒海地涌来。我的理智感知到了那个善意的陷阱，但身体却诚实地瘫软了下去，仿佛我是一个刚刚从地狱中被捞起，并得到拯救的人。



（二）

中世纪有赎罪卷，而现代人可以当志愿者。

志愿活动有时就是这样一个陷阱，在其中，我们用有准确时效的被封装的善意，滋养我们虚伪的同理心——它又可以带着率直的、毫无愧疚的心情生活下去了！

因此我真的不知道，那些乘坐私人飞机却嚷嚷着认真对待全球变化的人，那些家里的冰箱由专人打理却为难民分发粮食的人，那些被属下簇拥着到环卫工的棚户中进行访问的人，他们在进行这些“公益事业”的时候，会不会真诚地感到自己对人类有所贡献，或至少为枕在自己身下的权力和财富感到心安理得。因为我可以用亲身经历说明，荡涤灵魂谈不上什么巨大的工程，而我虽自诩头脑冷静，但仅凭一件微不足道的小事，也可以自感高尚。

而他们，他们付出了更大的代价，受到更多时的委屈（他们闪亮的裙子和笔挺的西装碰上了我们卑俗的灰尘），他们理应为自己对社会的回馈得到更为贯彻心扉的奖赏！

当穷人陷在生活没有止境的漩涡里，总有些人连自己仅存的良知中渗出的愧怍，也能顺利被居高临下的善意转化为对他们自己的奖励。

这是一种狡猾的心灵的洗钱行为，也难怪有钱人的幸福我们根本想象不到。

我有理由为这种感受保持警觉，我有理由为这种感受产出的人格保持警觉。



（三）

我在伦敦的时候参观了The Photographers’ Gallery策划的森山大道生涯回顾展。五层楼的展厅从上到下，都是森山标志性的高反差、粗颗粒的、极具冲击力的黑白照片。

他已经这么拍了半个多世纪了，威廉·克莱因之后，他几乎就是黑白街头风格的代表。从夏威夷拍到纽约拍到布宜诺斯艾利斯，当然最多的还是东京新宿，他的创作生涯作品繁多，甚至出版过散文和对谈录；说他是摄影师，不如说简直代表一种摄影语言或者文化现象。

我看着这些情绪浓烈的照片，心情复杂。

我想，他怎么能做到一辈子都拍这么类似的照片呢？

我最近会思考一个关于艺术创作的“刻意”和“成长”的问题——无论什么艺术家在任何领域总会碰上些创作瓶颈。而面对这种令人气恼的时刻如何回应，则决定着艺术家的生涯走向。

森山大道劝导学生“一筹莫展的时候，就学海参一样在海底睡成一团，但某天早上突然会想动一下” ，尽管他在瓶颈期时内心的经历比这句话痛苦和彷徨得多。幸运的是，在经历几年的挣扎后，他还是将做“人类被害史的目击者”的风格延续了下来，就这样拍摄了半个多世纪。最终他成了摄影界的常青树，而不仅是以“挑衅”闻名的昙花一现日本新锐摄影师（虽然这样已经很了不起）[2]。

从摄影史的角度说，一以贯之的拍摄方式和生涯长度帮助森山大道更进一步；但换个角度看，他的稳定似乎又可以说是狭隘（止步不去探究艺术新的可能）、懒惰（呆在舒适区不尝试新的表现方式）、或者刻意（遵循以往的成功规律进行复制和量产）。哪怕森山的自述无比真诚，我仍然无法分清，他按下快门时的那种创作冲动，究竟是个体直觉在每个不可重复瞬间的独特自然反应，还是在反复创作中神经系统搭建好的条件反射。



（四）

在理念上，我最欣赏的艺术品应该是”自然的“，那意味着创作的动机完全出于自发，创作的方式遵循创作者独特的个人美学——就是说，从宿命论的角度来看，这件作品的产生是生活中连续的偶然中”非此不可“ [3] 的必然性的造物。一旦一件艺术品的完成来自艺术家刻意寻找的灵感或者试验出的技法风格，我就会觉得它并没有尽善尽美。

与此相似，中国的哲学常常是回避刻意的。

弘忍将禅宗的衣钵传给“本来无一物，何处染尘埃”的慧能，而非“时时勤拂拭，莫使然尘埃”的神秀（不刻意修道）；庄子有“圣人无己”的齐物论（不刻意区别）；而儒家尽管是最入世的，孔子面对阳货要他出仕的请求第一反应也是采取回避（不刻意寻求）。在“无为而无不为“这一点上，儒释道三教从未意见相左。

冯友兰说，“中国的哲学中，知识论从来没有发展起来”，因为中国的哲学是建立在自然、常识和直觉，而不是逻辑演绎的基础上的：中国哲学的观念几乎来自于直接的领悟 [4]。

而这种领悟的底色是悲观的。因为“人定胜天”并非一个在普遍历史条件下能被验证的道理。面对未来的不可预知性，更常见的想法是“认命”或者“避害”。

和那些既得利益者的看法不同，躺平不是对历史的背叛，而是对历史的回归。我们确实可以说，当代年轻人贯彻了儒家思想的精髓：那就是认真诚实的生活，始于面向行动的认识。

那什么是“面向认识的行动”呢？

是嘴上说着护城河如何重要但对增长率的放缓都忍不住去做空一把的投资经理们。

是装出松弛感但city walk如走秀的显摆家们。

你看，就是这些不诚实的动作，让世界真的和预想中一样糟糕。



（五）弗雷德新时代“三个反对”重要思想

反精致
反肤浅
反矫情



（六）

五月中旬的某日，我到楼下买油条的时候，小区外的广场上一群饿了么快递员陆陆续续地开始聚集。我虽然从没见过这样的场景，但一目了然地，这是一个即将开始的某饿了么配送团队的“升旗仪式”时刻。

我本不应为此感到惊奇。因为我做过18年的眼保健操，也见过饭堂和理发店的店员在非高峰时段陈列店外聆听些可有可无的训导。但我仍然留了下来。我站在了他们领队的身后，隔着一列他们停放的电瓶车，就地吃起了油条。直到他们喊完什么“蓝衣骑士、使命必达”之后，我才跟着他们一起解散。

显然，这个配送团队在今早经历了两件与以往稍有不同的事。第一是新人的加入，领队念出他们的名字，又分发给那三个人每人两罐王老吉，算是入队欢迎。然后是我。他们并无法分辨这个目睹了整个过程，时而拍照和录像，又看起来像刚从床上爬起来的男人，到底是路过的无聊群众，还是一个没有提前通知的，伪装得非常巧妙（或不够巧妙）的督查人员。

领队不停回头确认我是否仍然在场。而当我盯住其中一个在训导中不停插话抱怨的男人的时候，他瞟了我几眼，然后闭上了嘴，好像发现了自己的错误。

失去流动红旗的恐惧总是刻印在每个中国人的骨子里。与此同时伴随我们的，还有东方文化中矜持、服从、克己、合群的美好品质。因为这些优良传统，世界上第一个优步司机再不可能想到，打零工挣外快这种再简单和私人不过的事情，居然可以在十年后的东方成为一种亿万人参与的岗位，并围绕它产生管理规范、服务准则、行业礼仪、职业道德等一系列标准化建构。更难能可贵的是，一个以“网”为基础的去中心化商业模式，最终在另一个半球被本土化为以“树”为基础的社会组织架构。

中国人总是理性而稳定的。和中国人相性很好的树状结构图也是。



（七）

我在今年一个相当重要的思想变化，就是放弃了对效率的过度迷恋。这个变化和大趋势的相符是显而易见的：当一个人只求不被饿死的时候，他当然不会太在乎自己吃得是否健康——归根结底，我终于对时间的流逝再没有感到那么焦躁了。而突然意识到这个改变的契机，还要说回年中的时候参观的“梵高的柏树”特展 [5]。

和代表梵高本人激情和生命力的向日葵不同，柏树几乎是以存在于环境中的元素而非主题，在其画作里层出不穷（这种相对次要的布景并代表梵高对它们的忽视，相反，他曾认真观察并试验过对这种植物最为妥适的表现方式）。如果不是展览已经给出了导览和主题，我也许会直接忽略这些就那么直愣愣地冲在画面角落的植物，于是在参观途中我在备忘录中速记下这么一句话：

“柏树就是人生的旷野中长出的突泉/耸立的野火”。

是突泉还是野火，这并不重要。重要的是，柏树并不会像向日葵一样不可拒绝地出现在——或者成为——最显眼的坐标，并让其他一切黯然失色。你可以说柏树它存在于我们的生命之中或生命之外，这两种说法没有对错；要是你不去找它或者没有费心关注它，那也没关系，它始终在地平线上不远不近。

向日葵是时间的敌人，而柏树是时间的朋友。

在某些时代精神下，生活要求我们只能是像崇拜太阳一样死盯着向日葵；但在另一些时代，也可以是多看看道旁的柏树了。



（八）后现代解药

1.0
坏消息：中国越来越像90年代的日本
好消息：Evangelion正是反映90年代日本社会的镜子

2.0
改造局外人，从重建中景 [6] 开始。

3.0 
偶遇、旅途、冒险，这三者还不是一回事？



（九）

特斯拉前 AI 总监发布推文说：英语是当今最热门的编程语言 [7]。而自然语言编程这个趋势也就意味着，人和机器沟通的语言问题已经“降本增效”，变成了**语境**问题（因此我同情那些学龄前就开始学习Python的孩子 [8]，他们被强迫做着些事倍功半的事儿）。

而在另一方面，一些学者相信 AI 已经展示出对”世界模型”的通识性理解 [9]，哪怕这些（单模态）AI 的训练集中并没有除了文字以外的其他输入。这就是说，AI 的“通感”已经达到了相当的程度，让它们仅从字里行间就能摸索出现实世界的某些运作规律。

把能力变复杂，把产品变清晰，把交互变简单。生成式AI的剧烈爆炸让死气沉沉的生活又突然有了盼头，除非……我们想稍微担忧一下人类的安全。



（十）

OpenAI 高调宣布将投入20%的算力到“超级对齐”的项目 [10]，确保人工智能不会造成人类灭绝（然后它的首席科学家政变失败眼看就要出局了，但这是写这段话的时候还没发生的事）。

我也许可以半开玩笑地说，这也许并不算什么难题。因为在人类过于多彩的互联网史料中，我们不断得到这样的经验实例：永远不要和白痴争论。

白痴会把你的智商拉到跟他一个水平，然后用他多年当弱智的丰富经验打败你。

要想赢过 AI，你就得让它打客场比赛。

今年上半年，斯坦福的学生发表的“生成式智能体”（Generative Agent）论文 [11] 曾引起过热烈的讨论。作者将 25 个 AI 放进一个虚拟小镇中，赋予这些角色感知、记忆、整合、计划、交流和行动的能力，从中观测到了社会性行为的涌现。但同时，作者仍然发现了一些错误，比如这些 AI 之间会用过于正式的语言进行交流，哪怕它们被定义为亲密关系；又或者会做出超越社会规范的事情，比如两个 AI 同时上一个厕所。

是的，以人类现在的语言习惯和当下的社会常识而言，这些当然都是错误；但万一这就**是**这个 AI 小镇本身所遵守的规矩呢？

我想，它们好像已经给够我们面子了，要不，为什么它们还要多此一举，在彼此交流的时候要把明显更直接的向量表达（embedding）套壳进我们能够理解的语言系统呢？

……快趁着它们还听话的时候赶紧行动吧！让我们把“规矩说人话”写进 AI 的宪法里！[12] 



（十一）关于价值重估

1.0
互联网让信息的接收成本趋近极小，生成式 AI 让信息的生产成本趋近极小。
到头来，现实本身变成信息瓶颈了（生活快不过拟真）。天下哪有那么多事。
除非你就是多事。

2.0
提示工程学家其实是一种保姆
他们的工作职责主要是给AI喂饭
然后看管它不要拉稀

3.0
用不了多久，互联网就会脱离人类，成为 AI 的数据交换通道了。
除非你想为 AI 另造一个互联网，为了保持人类信息的纯洁性。
等一等，这种说法，会不会有种族隔离的嫌疑啊？

4.0
王尔德说，只有浅薄的人才能完全了解自己
还好我们所仰赖的GPT们
对自己的了解还不够完全

5.0
郑重声明：我们生活的故事系列
由纯手工打造。
绝不含任何 AI 添加剂。



（十二）

在AI末世论甚嚣尘上的时候，著名风投机构a16z的创始人旗帜鲜明地发表了科技乐观主义宣言 [13]，作为一个跟踪AI前沿发展的思想领袖（和从中受益的投资人），他显然觉得自己有责任和资格对那些捕风捉影的言论宣战。 

开诚布公总是好的，我很高兴他能把话说这么明白。如果我诅咒他，至少不会诅咒他的诚实，尽管这种诚实也许是建立在对反对者不屑一顾的基础之上的。

我痛恨科技乐观主义者甚于精致利己主义者。后者的利己中至少有趋利避害的保守性（他们相信自己可能成为弱者，所以才需要利己），而前者已经无法无天到认为没有什么东西能够伤害他们了。

这种乐观主义之中至少有两点让我无法忍受。

其一是泛滥的精英的优越感。这群人宣称科技本身没有让人失业或带来不平等——而这种宣称是站在所谓“全人类”的视角的，也就是说，从人类历史发展的角度上“总的来看”。那么，又是谁给了你们这样的权利，让你们可以裁决（另）一群人的苦难可以被（你们自己）一群人的幸福所对冲呢？

第二点，更为可恨的，就是这个宣扬之中藏匿在字里行间的被庇护感。换句话讲，这群人从过往生活中打心底得到的确信就是，他们从来只可能从中获益，而万不会想到自己是有任何一丝可能成为被害者的；或即使情况再糟，他们也有办法让自己成为最后一批受害者（扎克伯格今年在夏威夷花费1亿美元修建地堡 [14]）。

就是这种仿佛坐在包厢中观看角斗场的残忍的从容让我恨不得爬上看台去给他们两巴掌。

但是很不幸，棋子和棋手就是天生地不对等。



（十三）

我们被引入一个昏暗的室内坐下，靠墙的地方叠放着一摞摞巨大的铁桶。店员点开显像管电视，和杂讯一起播出的是关于传统枫糖制造流程的短片：人们骑马在林子里到处转悠，把钉子嵌进树里，挂上铁桶，接住流出的枫糖水。隔过几周，又骑着马回去把满荡荡的桶子提回屋里，烧滚热的柴火，让糖水慢慢浓缩成糖浆。

而我旁边这个烟囱冲破房梁的机器就是枫糖制造机，因为并不是生产季，机器是冰冷的。

我问那个帮我们播放录影带的店员，你们也用这台机器制糖吗？

是的，古法制糖。显然这个房间在三十年前就是这个样子。

佛蒙特州大抵就是这么回事。好喝的牛奶，新鲜的农产品，著名的枫糖。酷暑消夏，秋日赏叶，冬来玩雪。

哪怕和现实的浪潮没有丝毫瓜葛，这里也并不存在什么被淘汰的危机、跟不上趟的焦虑、或者羞于启齿的无知。

我几乎要被这种牧歌感动了，直到我想起他们的先人。

他们之前也一定是科（zhí）技（mín）乐观主义者吧。



（十四）

有时我害怕回音
就像阳光打在身上太多次后
突然有一天你就觉得
阳光打在身上
也不过是那么回事
你又想 经历了那么多气候之后
真的 走哪条路还真都是一回事
无论遇见谁
也都是一回事

下午三点醒来
把百叶窗关得更紧了一点
窗外的树红彤彤的
阳光让万物的脸颊都微微发烫
只是没人说起这其实是一个
草木都在凋零的时刻 
但影子慢慢移动 于是天色渐沉
而你只祈望你会梦见的事情
不要再和这个世界
有任何一点关系



（十五）

虚假的希望：AI提升生产力。
真正的希望：AI颠覆现有的生产方式。

在这个重塑的机遇中，人本主义将从消费主义的禁锢中被解放出来，我们会被逼着改变人类的生存境况、价值观和精神面貌，然后说不定呢，就可以拥抱真正“精神自由”的生活 [15]。


参考信息列表：

1. 路西法的黄昏之歌，布莱希特，1917
2. 昼之校夜之校，森山大道，2006
3. 不能承受的生命之轻，米兰.昆德拉，1984
4. 中国哲学简史，冯友兰，1948
5. [Van Gogh's Cypresses](https://www.metmuseum.org/exhibitions/van-gogh-cypresses), MET exhibition, 2023
6. [高瀬司分析评论《新世纪福音战士》](https://www.zhihu.com/column/p/27731058)，知乎专栏，2017.07.06
7. [The hottest new programming language is English](https://twitter.com/karpathy/status/1617979122625712128?lang=en), Andrej Karpathy on X.com, 2023.01.24
8. [2021 少儿编程教育行业报告](https://36kr.com/p/1179861751070979)，36氪，2021.04.12
9. [The Batch Aug 09 Edition](https://info.deeplearning.ai/ai-cancer-diagnosis-advances-chatbots-work-the-drive-thru-chatgpt-racks-up-server-fees-image-generators-get-an-upgrade?ecid=ACsprvttSl1TBc7wfpRQ92lgEUrFvWZnEnlcUUDXXbFzug2eTNTo6JlQvjUw-Zrv8V3MYhrWcQJO), Andrew Ng, 2023.08.09
10. [Introducing Superalignment](https://openai.com/blog/introducing-superalignment#IlyaSutskever), OpenAI Blog, 2023.07.05
11. [Generative Agents: Interactive Simulacra of Human Behavior,](https://arxiv.org/abs/2304.03442) arxiv.org, 2023.04.07
12. [Constitutional AI: Harmlessness from AI Feedback](https://www.anthropic.com/index/constitutional-ai-harmlessness-from-ai-feedback), Anthropic AI, 2022.12.15
13. [The Techno-Optimist Manifesto](https://a16z.com/the-techno-optimist-manifesto/), a16z, 2023.10.16
14. [Inside Mark Zuckerberg’s Top-Secret Hawaii Compound,](https://www.wired.com/story/mark-zuckerberg-inside-hawaii-compound/) Wired, 2023.12.14
15. This life: secular faith and spiritual freedom, Martin Hägglund, 2019`,__vite_glob_0_17=`---
title: 'Hong Kong Forest'
title_zh: '香港森林'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2024-04-23_香港森林.jpg'
date: '2024-04-23'
tags:
  - 'travel log'
  - 'china'
tags_zh:
  - '游记'
  - '中国'
languages: ['en', 'zh']
---

At the immigration checkpoint entering Hong Kong, the officer at the window next to mine questioned a young woman: "What is the purpose of your visit to Hong Kong? How many days will you be staying? Are you pregnant?"
After receiving a negative response, the officer flashed a smile—the kind of smile a quality inspector gives to a product that has passed inspection.
Welcome, mainland middle class. Welcome to the Hong Kong Forest.

#### 1.0
From the express bridge connecting the airport to Hong Kong Island, looking out through the port windows, the massive cantilever arms of container cranes stand in formation along the bridge like soldiers awaiting review. Yet right beside them, gleaming towers rise like prisms, distilling blues from the earth and sky that don't naturally exist in this landscape. We can imagine that within these narrow apartments, behind those countless small windows, there are equally blue-tinted gentle fairy tales, precisely compartmentalized and wrapped.
For the fairy tale to continue, Hong Kong's middle class must abide by the first warning and response of the Trisolaran civilization:
Do not look. Do not look. Do not look.
Do not look, and you won't glimpse the soot-blackened walls in the lightless alleyways.
Do not look, and you won't see the swarms of flying ants beating their massive wings across the sky during rainy season.
Do not look, and you won't lock eyes with strangers sharing tables in the bustling cha chaan tengs.
Do not look, and no matter how the world changes, never ask what happens on the other side of the river.

#### 2.0
At dusk over Victoria Harbour, most of the neon signs atop the skyscrapers have lit up, but Lee Kum Kee's hasn't. Not that it failed to light up—rather, its sign appears to have no neon decoration at all. Yet even so, in this shoulder-to-shoulder forest of towers, it doesn't seem overly conspicuous despite its dated appearance.
Hong Kong's first skyscraper wasn't completed until 1973, but the development that followed became unstoppable, continuing until the land was filled with towers, until there was no room for more. Most of the buildings standing around Victoria Harbour today shot up during the twenty years around the turn of the century.
Within Hong Kong's modern elements, you can always detect something with a bit of age to it, like aged marinade seeping from fresh pig's trotters—a flavor only understood by humans who are equally close to their expiration date.
This reveals the dark side of Masayoshi Son's "time machine" theory. When people from rising regions visit once-advanced places, they don't first marvel at the (unseen, former) prosperity but at the (apparent through comparison with the more modern) decay.
I believe these dense clusters of buildings in the harbor are sophons that people from the previous era projected onto today's Hong Kong. In that moment when everyone was racing to reach toward the sky and the world's summit, no one imagined that these massive concrete and steel behemoths were such high-dimensional objects: their enormous etchings would slowly unfold across the river of time—when every tower stood surrounded by other towers, when people awakened from the myth of creation—
Hong Kong's skyline had been locked down.
Hong Kong had been locked down.

#### 3.0
Saturday noon, on the pedestrian bridges of Mong Kok, oxford cloth spreads along the railings. Headscarved women begin gathering in small groups, sitting on the ground as voices gradually rise to a din. These women show no interest in passersby; they simply call to friends, pouring bulk beverages into disposable cups, or opening video chat apps to loudly converse through speakers with blurry, swaying figures on the other end.
I couldn't immediately make sense of what was happening. It didn't have the tension of a political rally, nor did it show any signs of marketplace commercial activity. But people were indeed gathering in increasing numbers. It wasn't until some patrol officers walked by and I stopped them to ask that I learned this was a typical weekend leisure activity for Hong Kong's domestic workers.
The next day, I witnessed an even grander gathering in Central. Here, no one wore headscarves, and more sophisticated settlements had developed: they built individual compartments with cardboard, some even pitched tents. Someone brought out a microphone and began singing as if no one else existed; others set up tripods to dance with friends for TikTok livestreams; some started eyebrow-threading businesses.
And all of this was happening on the bridges.
The bridges extend horizontally through this jungle of vertically growing towers, like root systems spread throughout the city. They spend five days a week tirelessly delivering nutrients to the CBD, finally growing voices on weekends. This tidal change in the bridges is like someone regularly dipping Hong Kong's negative into developing solution: beneath the purely functional exterior of municipal infrastructure, repeatedly excavating the mushrooms growing underground in this urban forest.
Ah! Mushrooms, while you can, pour out your hearts and tend to each other's mycelia! Because when you return to those tiny compartments, you must still obey the forest's laws, must fold your loneliness, must choose silence for the sake of efficiency.


_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

入境香港的海关通道，我隔壁窗口的审查员对着一个年轻女孩问道：请问您来香港的目的是什么？请问您停留几天？

请问您是否怀孕？

得到否定的回答后，审查员露出一抹微笑（这是质检员面向质检合格的产品的微笑）。

欢迎你，大陆中产阶级。欢迎来到香港森林。



**1.0**

从连结机场和港岛的高速大桥上向左舷望出去，集装箱起吊机巨大的悬臂林立桥畔如同等待检阅。但就在它们身旁，一幢幢辉煌的高楼棱镜般提炼出这片大地和天空中本不存在的青色。我们可以想象，在这些狭窄的公寓里，在那一片片小窗之后，有同样泛着青色的，被精确区隔和包裹的温柔童话。

要想让童话继续下去，香港中产阶级必须恪守三体文明的第一声遵告和回答：

不要眺望。不要眺望。不要眺望。

不要眺望，你就不会窥见不透光的巷道里被油烟熏黑的墙壁。

不要眺望，你就不会抬头看清那雨季中扑腾巨大翅膀的漫天蚁群。

不要眺望，你就不会在人来人往的冰室里和对面拼桌的眼色撞个满怀。

不要眺望，不管世界如何变化，永远不要问起，河的对岸发生了什么。



**2.0**

傍晚的维多利亚港，大多数摩天大楼顶部的灯牌都亮起了灯，李锦记的却没有。不是没有点亮，而是它的招牌看上去像是根本没有霓虹装饰。但即使这样，在这摩肩接踵的高楼的森林里，它居然也没有因其陈旧而显得过分招摇。

香港的首栋摩天大楼在1973年才落成，但接下来的开发工程就一发不可收拾，直至那片土地被高楼填满，直到再也放不下更多的高楼。如今维多利亚港矗立的楼群，大部分是在世纪之交那二十年的时间拔地而起的。

香港的现代元素之中你总能咂摸出一些有点年头的东西出来，像是鲜亮的猪蹄之中渗出的陈年老卤，这卤汁也只有和它一样快过期的人类才能理解其中的况味。

我们由此可以发现孙正义“时光机器”理论的背阳面。当后起之秀地区的人们来到曾经的先进之地，他们首先不会感慨它的（不被看见的曾经的）繁华而是感慨它的（通过和更现代的对比而显出的）凋零。

我想，这片港湾里的密集的楼群，正是上一个时代的人投向今天的香港的智子。在那个争先恐后向天空和世界之巅伸出双手的时刻，没有人想到这些用水泥和钢筋浇筑的庞然大物，居然是这样一个高维物体：它们的巨大蚀刻，终于在时间长河里慢慢展开——当每一栋高楼旁边都站满另一栋高楼的时候，当人们从造物的神话中回过神来——

香港的天际线已经被锁死了。

香港已经被锁死了。



**3.0**

周六中午，旺角的人行天桥上，一张张牛津布沿着栏杆铺展开来。戴头巾的妇女三三两两开始聚集，席地而坐，人声逐渐鼎沸。这些妇女并不对行人有任何兴趣；她们只是呼朋引伴，把量贩装的饮料倒进一次性杯子里；或者开启视频聊天程序，和另一头模糊晃动的人影通过扬声器和她们大声对话。

我对当下发生的事情一时摸不着头脑。它看起来没有政治集会前的紧张感，也没有显示出任何集市的商业活动的迹象。但人确实是越来越多。直至旁边走过几个巡警，我拉住他们询问，才知道这是香港的家政服务人员周末的典型休憩活动。

第二天，我在中环看见了更为宏大的聚集。这里没有人戴头巾，并且发展出了更为高阶的聚落：她们用纸板建起了一个个隔间，有的甚至搭起了帐篷。有人拿出话筒，旁若无人地唱起歌来；有人立起三脚架和姐妹在镜头前跳舞做抖音直播；有人搞起了修眉生意。

而这一切都是在天桥上进行的。

天桥在一片纵向生长的高楼的丛林中横向延展，像是遍布这个城市根系。它用一周五天的时间不疲倦地向CBD传递营养，终于在周末长出了喉咙。天桥这种潮汐变化，就好像有人把香港的底片规律性地浸入显影液之中：在市政功能性设施的纯粹外表之下，一次次将这个城市森林中那些长在地底的蘑菇翻掘出土。

啊！蘑菇们，趁着现在，好好倾吐和照拂彼此的菌丝吧！因为在重回那小小的隔间背后，你们仍然要听从森林的法则，仍然要收起彼此的孤独，仍然要为了效率选择沉默。`,__vite_glob_0_18=`---
title: 'Those Who Seem Innocent'
title_zh: '那些看似无辜的'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2024-10-23_那些看似无辜的.jpg'
date: '2024-10-23'
tags:
  - 'travel log'
  - 'europe'
tags_zh:
  - '游记'
  - '欧洲'
languages: ['en', 'zh']
---

More than a century ago, Romain Rolland wrote at the beginning of *Lives of Great Men*:
"How heavy the air around us is! Old Europe lies unconscious in a thick and corrupt atmosphere. Vulgar materialism suppresses thought and obstructs the actions of governments and individuals. Society suffocates to death in clever, base selfishness."

In the half-century that followed, Europe endured the devastation of two world wars and became the frontline of global bipolar confrontation amid trends and conspiracies grander than the Marshall Plan... Europe did not collapse entirely, but it has indeed never fully recovered its most flourishing influence.
Recently, I've watched it stammer and evade after the Nord Stream pipeline incident, watched it make decisions in two regional conflicts that don't entirely serve its own interests... Europe has not merely lost its influence—it is fundamentally abandoning its dignity.
I don't say this with a tone of regret. I was inspired by the heroic stories in *Lives of Great Men*, but visiting Europe again nine years later, I'm also fascinated to observe that Romain Rolland's heartfelt writing motivation has failed to make this continent any more clear-sighted。

I only learned about Ghent from social media—medieval Europe's second-largest city after Paris. Strolling through it, I was amazed by both the completeness of its ancient architectural preservation and the grandeur of its scale. Its accumulated history spills over like wine from a cup; you can smell the aged essence from any sculpture on these streets, any stone slab, any hanging bell. The local guide pointed to a tavern (Café Den Turk) and said its owner once participated in the Crusades.

Ghent was historically a gathering place for crowds, with many of its buildings funded by guilds—boatmen's, tanners', tax collectors', textile workers'... These emerging bourgeoisie once enjoyed their moment of glory in this prosperous commercial center that once dominated Europe, and then came the "Revolt of Ghent."
This uprising was launched by Ghent citizens against new taxes imposed by Charles V—Holy Roman Emperor, and himself a native of Ghent—to expand his wars. To suppress the rebellion, Charles V spent nearly half a year traveling from Spain to Ghent, gathering five thousand soldiers along the way.
The people of Ghent did not resist... Charles V entered the city with pomp, moved into his palace, and began dealing with the rebels.
In the end, the people of Ghent were ordered to wear robes, go barefoot, and carry nooses around their necks as they marched from city hall to the king's palace to beg forgiveness.
The people of Ghent have not forgotten this event. To ensure they don't forget, they even named a locally brewed beer after it. Ghent residents call themselves "noose bearers," and they reenact this scene every year at festivals, celebrating their ancestors' spirit of resistance.

After hearing this story, I found myself not recognizing the word "resistance" anymore. When I think of resistance, I habitually think of martyrs, ideals, heroes—but I would never think of any beer...
Half out of curiosity, half to verify my suspicion, I asked the local guide who had just finished the story: Why are Ghent's buildings so well-preserved, even after World War II?
He said it was because this wasn't a strategic location, but was used as a German logistics base. From occupation to liberation, no serious armed conflicts occurred here.
I was certain then that the term "people's war" does have its scope of application.

On the beautiful archway of Ghent's Fish Market, there are male and female figures on either side, representing the two rivers flowing through Ghent; the male figure was carved based on the face of a playboy who lived in Ghent during the construction period.
If your ancestors lived in such a playful manner, you surely wouldn't take many things too seriously either.

Ilya Ehrenburg wrote in his memoirs: "(1950) Europe lived a poor, uneasy, panicked life. In France and Italy, the workers' struggle had already failed by 1947, but everyone still felt the struggle was continuing."
Europeans don't know how to revolt, and even if they did revolt, it would be a leisurely revolution. Europeans are too good at living—they start drinking with breakfast, and even the small convenience stores at train stations carry two or three types of cheese spreads and freshly baked bread. Walking through alleys, those roadside rooms are warmly furnished, often with bright fresh flowers arranged on dining tables... They regard many things as slightly more important than the future.

The guide pointed to a building painted yellow and said it was the only wooden building left in Ghent's old town. He said there was a legend among Ghent residents about this house: the mistress swore to her husband who had gone off to war that she wouldn't change clothes until he returned, but when the husband failed to return for a long time, the house gradually took on the color of this steadfast lady's underwear.
In this crude joke, I saw Ghent's long but lighthearted history. Romain Rolland used such heavy words in his admonition—he was the anomaly instead.


_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

一个多世纪以前，罗曼·罗兰在《名人传》开篇写道：

“我们周围的空气多沉重！老大的欧罗巴在重浊与腐败的气氛中昏迷不醒。鄙俗的物质主义镇压着思想，阻挠着政府与个人的行动。社会在乖巧卑下的自私自利中窒息以死。“

自那之后的半个世纪，欧洲历经两次世界大战的浩劫，又在比马歇尔计划更为宏大的趋势和阳谋中，成为世界两极对抗的前线……欧洲并没有一蹶不振，但也确实再没完全回复它最为鼎盛的影响力。

而最近，我看着它在北溪管道事件后的支支吾吾顾左右而言他，看着它在两场区域冲突中做出并不完全符合自身利益的举措……欧洲不仅是失去了影响力，它根本是在放弃自己的尊严。

我并不是带以遗憾的口气说这句话的；我振奋于《名人传》中的英雄故事，但九年之后再次游历欧洲，我也饶有兴致地看着罗曼·罗兰痛切心扉的写作动机并没有让这片大陆变得更加清醒。



我是从社交媒体上才知道根特——中世纪欧洲仅次于巴黎的第二大城市。漫步其中，我惊讶于它对古代建筑保存之完整和其规模本身的宏大。它的累累历史像杯中满溢而出的葡萄酒，你可以从这些街衢的任何一个雕塑，任何一个石板，任何一口吊钟嗅到充满年头的气息：当地的向导指着一个酒馆（Café Den Turk）说，它的老板曾经参加了十字军东征。

根特在历史上人潮聚集，其许多建筑都是当年由公会（Guild）出资修建——船夫的，皮匠的，收税官的，纺织业的……这些新兴资产阶级在这个曾睥睨欧洲的繁华商业重镇曾烜赫一时，然后就发生了“根特起义（Revolt of Ghent）”。



这场起义是根特市民反对查理五世——神圣罗马皇帝，一个根特人——为扩大战争而新增的税负而发起的。查理五世为了镇压起义，用了近半年的从西班牙去往根特，并沿途召集了五千名士兵。

根特人没有抵抗……查理五世堂而皇之地进了城，住进了自己的宫殿，开始着手处理叛乱分子。

事件最后，根特人被命令身穿长袍，赤脚，并颈负绞索，从市政厅游行至国王的宫殿请罪。

根特人没有忘记这件事情，为了不至于忘记，他们还特地以此命名了一种当地酿造的啤酒。根特居民自称“套索人（noose bearers）”，他们会在每年的节日上重现这个节目，庆祝自己祖先的反抗精神。



听完这个故事，我发现自己好像不认识反抗这个词了。提起反抗，我习惯于想起先烈，想起理想，想起英雄，但就是不会想起任何啤酒……

半是出于好奇，半是出于实证自己的猜想，我问那个讲完故事的当地向导说：为什么哪怕历经了第二次世界大战，根特的建筑群却这么完好呢？

他说，因为这里不是什么战略要地，而被用作德军的后勤地。这里从被侵占到得到解放期间，并没有发生什么严重的武装冲突。

我确信了，人民战争这个词毕竟有它的适用范围。



根特的水产市场（Fish Market）的漂亮拱门上左右各有一男一女的形象，代表流经根特的两条河流；而其男性的形象是根据建造时期根特城里一位花花公子的面容雕刻而成的。

如果你的先辈们是以这样戏谑的方式生活的，你肯定也不会较真地去看待很多事情。



伊利亚·爱伦堡在回忆录中写道：“（1950年）欧洲过着贫穷、不安、慌张的生活。在法国和意大利，工人的战斗早在1947年即已失败，但大家都觉得战斗仍在继续。”

欧洲人是不会革命的，就算革命，那也是悠闲的革命。欧洲人太会生活了，他们从早饭就开始喝酒，火车站的不大的便利店里也有两三种酪浆和现场烘焙的面包。打小巷中穿过，那些道旁的房间里陈设温馨，经常还会在饭桌上插满娇艳的鲜花……他们把很多东西都看得比未来更重要一点。

向导指着一幢漆成黄色的建筑说，那是根特老城里唯一的木质建筑了。他说根特居民间流传着这样的传说，说这家的女主人向当兵远征的丈夫发誓说不见他归来她就不换衣物，但丈夫久别未归，于是这栋房子就慢慢变成了这位坚守初心的女士的内裤的颜色。

我在这个不雅的笑话中看到了根特虽然漫长但是轻松的历史。罗曼·罗兰的谆告中用了那么沉重的词，他才是那个异类啊。`,__vite_glob_0_19=`---
title: 'Our Stories 04'
subtitle: 'Or: Look At That Gilded Sky'
title_zh: '我们生活的故事04'
subtitle_zh: '又：看吧，在那镀金的天空中'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2024-12-18_我们生活的故事04.jpg'
date: '2024-12-18'
tags:
  - 'our stories'
tags_zh:
  - '我们生活的故事'
languages: ['en', 'zh']
---

**(Preface)**
The cherry trees along my commute have blossomed. But this is not early spring—it is early autumn.
Go ahead and bloom, I know that after the howling north wind subsides, you will still be fine.
But do not proclaim this: We bloom so early because we have foreseen spring from afar.
Spring will eventually come. It's just that before the thaw, some of your sisters will also perish in the bitter cold and wind and snow.
Please allow them to endure the winter with dignity.

**(I)**
In September, my college classmate came to New York. The first thing he said when we met was: "There aren't many people who can have lunch alone with me anymore. Do you know how much face you have now?" Then he mentioned his recent conversation with the helmsman of China's most famous venture capital firm in a high-rise private club overlooking Central Park, talking and laughing as equals.
(We've known each other for 13 years. After graduation, we rarely meet, and we usually discuss our ideals in brief, playful ways. In these exchanges, I sense our similarities and decisive differences in many aspects.)
I was genuinely happy for him. His genius and ideals perfectly align with his passion and the needs of the times, earning appreciation from those with resources—and this is not common. I pondered whether I had anything worth sharing, but these years I've only experienced the story of an ordinary employee watching leadership continuously pay the price for—and double down on—their mediocrity, arrogance, and narrow-mindedness (these three always march hand in hand).
So I thought, let's talk about robots instead.
During his PhD, he conceived a completely new paradigm for robot training. From my understanding, this framework essentially brings real life into simulated environments, thereby solving the problem of severely insufficient real-world data that often constrains training. At the same time, because this virtual environment is sufficiently diverse and realistic, the robot's capabilities won't be limited to specific tasks, thus achieving generalization.
He said he wants to establish an institution similar to early OpenAI that doesn't focus on short-term profits—at least in the near term, concentrating on breakthroughs in fundamental research. He went on to talk about Musk and Lego, saying he enjoys the feeling of building a model from scratch. I shared his excitement; I could hear how the puzzle has been taking shape bit by bit over these past few months.
Geopolitics cannot be ignored, but in the long term, the greater concern—and what's discussed more now, the outlook on AI's impact on social productivity—shares the same root: the ultimate question humanity must answer: What is a human being?
(In 2016, I wrote with feigned clarity: "The only thing in humanity that can withstand the test is not the timid moral and wisdom Tower of Babel they've spent millennia constructing, but the biological traits and conditioned reflexes imprinted in genetic material from the moment of birth." The following year, I smugly said: "Almost no one sees this fact clearly: humans are merely an intermediate link in the evolutionary spectrum, not the endpoint." But I was just a blind man then; I wanted to make shocking statements because I was angry about my life's circumstances.)
I asked him: How do you view the almost inevitable impact to come? Current social structures will never truly be prepared for this kind of thing.
He said: Whether the masses accept this reality or not, that door is destined to be pushed open. Rather than let others do it, why not me?

I recalled many similar words.
I remembered Kobe saying in an interview: (In the game) Someone's going to win, so why not me?
I remembered when Musk was asked if he had many concerns when founding SpaceX, he was silent for a long time, then said: Fuck that, let's get it done.[1]
Perhaps pioneers are like this—grand ideals, but actions that are pure, unencumbered by reality's drag. "With bright eyes singing high, looking at my son; with a red heart working hard, managing the motherfucker."[2]
I admire them, but I want to become a different kind of person. The kind who dedicates himself to bridging the gap between cutting-edge research and ordinary people, who doesn't want the locomotive to just accelerate day and night without rest, nor wants the people in the carriages to think that 1g of gravity is all there is to the world...
I wants to help these two worlds see each other, I wants them to understand each other's circumstances a little.

**(II)**
This might be a form of escape. I often think about things that are fundamentally not mine to consider: humanity's fate, the people's fate, culture's fate. I used to think their improvement was mutually reinforcing, but when I look at history from a more detailed perspective, I realize that except for a few sweet periods, these three often conflict with each other. And now I feel suffocated, because although it's not quite "ten thousand horses standing mute," all three seem to have entered a gradually narrowing cave: the deeper one goes, the harder progress becomes; and the fire is almost out.
This doesn't mean our era is particularly terrible—it just has enormous stability and enormous inertia. Before suddenly breaking free, it runs along a track that's bad but not so bad, slowly, slowly approaching a deep pit. This is easy to understand and convenient to endure. The world has been peaceful for so long that even though we know certain places have been turned upside down, since it hasn't collapsed on our own heads, we can still act as if nothing has happened.
I remember being suddenly surrounded by a group of happy people in a windmill village, asking if I'd be willing to take photos with them. They were playing a family game: finding people on a list in the scenic area, and with a camera hanging around my neck, I was mistaken for a photographer. Everyone smiled happily in the photo, and these smiles had nothing to do with Europe's darkened fate after the Nord Stream explosion.
I remember seeing an Israeli flag hanging from the third floor of an apartment building in Amsterdam, while the tenant above hung a Palestinian flag of the same size. The Gaza conflict had been going on for a year, everyone had passionate positions about it, but pedestrians on the street still sat calmly in coffee shops, unperturbed.
I remember the World War II memorial documenting how, after the city's liberation, Dutch girls who had relationships with German soldiers were paraded through the streets with their heads shaved. Some of them protested: "I was in my prime, I was just looking for love! Besides, he was more considerate than the Dutch men..."
It's easy to want to be blind; modern life offers many convenient means to obtain small but immediate, anesthetic-like happiness. But I insist on being a seeing person. I say this because I feel restless. The more powerless I am, the more I want to shout like those mistresses:
In such a time in history's cycle, I am actually young and strong!...[3]

**(III)**
Two years ago, during the career planning session of employee reviews, I was hesitant and deferential. I looked at my bosses' promotion trajectories, I drew inspiration from industry thought leaders' speeches, I seriously considered what projects I could do and what impact I could bring to the company. But now I know all that stuff is bullshit. I do excellent work and get good performance reviews, but no budget means no budget.
Actually, I understood from the beginning of my career that I was stepping into the afterglow of the golden decade of internet tech companies. I watched the people ahead of me eating meat. I drank the meat-flavored soup from blanching water. I envied and resented. But looking at the juniors who couldn't even get soup, I felt fortunate.
Now those people who became smooth-talking from gorging themselves tell me that while they'll keep eating meat as usual, there's not enough soup to go around.
Looking at the juniors, I can't bear to smash this bowl in my hands; looking at the seniors, I can't swallow this bland soup.
I could blame this on the era's mistakes, but that would only further highlight the thorough vulgarity and compromise of a middle-class person.
This spring, I saw an article in my social media feed about "How to Get Through History's Garbage Time"[4]. This phrase sparked extensive discussion and silencing during the summer. I said I agreed with it, not because I could verify its claimed economic foundations or historically indisputable repeatability, but because it empathized with my feelings, it gave me an excuse to lie flat, and the despair I read in it was precisely my own despair when facing my powerlessness and cowardice.

**(IV)**
At the beginning of the year, I started looking through the image collection "Our Generation"[5]. These are portraits of China's literary and artistic circles from the 80s and 90s, featuring people we're familiar with, who are even still active in the arts today: Cui Jian, Zhang Yimou, Gu Cheng, Yu Hua, Sanmao... I was interested in this collection because I was curious about the stories China experienced during those years of reform and opening up. I'd seen plenty of historical facts, economic figures, policies, entrepreneurs, but here were living people, their lives, and after all, literature and art should represent living people...
Before reading this book, I had already corrected some of my short-sighted views. In early years, I thought "people in the arts" were a very different group, that the arts industry was a special industry, but that's not the case. The arts world also has political struggles, power transitions, nepotism; and because of its insularity, these things only proliferate more brazenly than in other industries.
But reform and opening up was such a unique sample. In that time window, old forces were shattered, new things grew in lawless lands, and the power structures of these lawless lands were still waiting to take shape (it's like America's successive waves of immigration, and somewhat like today's AI)...
China's modern art, like China's private enterprises, appears to have had a rough and gray birth. They weren't competing with existing crops for farmland, but mainly facing barren soil. They needed sharp teeth, they needed to disregard boundaries, to chew nutrition from this harsh soil. But once they could get down into those wells, once they adapted to opening their eyes in that environment, they could find infinite ideas there, because fundamentally, in the process of creating something from nothing, nothing is forbidden.
I know that was a golden age, I know that miraculous growth rate enriched people by how much in the blink of an eye. But I don't know if I should envy them, and I don't know if I could have made my mark in that era.
Like that day when I was visiting a church, arrow-like rays of light shot down from some opening. Standing in that dazzling sunlight, I felt the surrounding air floating weightlessly, trying to fill this vast emptiness. Then Jesus's statue descended from the dome, blocking that patch of light, and the interior became clear. I could breathe, and looking at that huge cross silhouette illuminated by light, I suddenly understood why self-imposed faith can also bring peace of mind.
I've stayed too long in discipline; freed from order, I don't feel liberated wings but like a lone, soaked chick.
But even so, I actually think I've been doing pretty well all along.

**(V)**
In my memory, during some high school Chinese tutoring class, I saw the teacher write on the blackboard:
Life - Net.[6]
I was intoxicated by this one-character short poem. But not the intoxication of finishing fine wine, but the breathlessness of being choked while swallowing whole. That was the premature imagination of a boy whose desires had matured early when life had just begun to lift her veil for me. (This often happens—we encounter naked truth very early, but only realize many years later that those various shadows wandering the streets were all the different clothes it had worn.)
Foucault let me see the net. What is a net? A net is another name for power.
In Foucault's theory, the fear of darkness and opacity during the French Revolution prompted people to dream of a society with "unobstructed vision, where public views are mutually visible." This society fundamentally prevents crime because "by placing people in completely visible spaces, their views, thoughts, and words about others can avoid leading to harmful behaviors." This utopian vision, spreading from schools, barracks, hospitals, and police stations that could establish tracking records, gradually formed a modern society with "panopticon"-like panoramic transparency, where everyone assumes they're being monitored and consciously becomes a monitor, so "power is implemented most widely at increasingly smaller cost."[7]
This theory deeply moves me—it illuminates many historical contexts and social phenomena, but it brings no hope at all. Foucault says "individuals are vehicles of power, not points where power is applied," which seems to comfort me by saying that as a conduit of power, I shouldn't have any emotions, just as soil and riverbeds don't have emotions when rainwater seeps through soil and flows through them.
Power is abstract, but life is the opposite. I can count many specific people who can drastically affect my fate. I also truly know that my life circumstances are completely outside their sight or concern.
When I see "net" now, I don't think about how power flows, don't think about systemic rules, scientific tyranny, moral discipline—I think of a moth wrapped tighter and tighter in spider silk, fluttering.

**(VI)**
Along the main canal in Antwerp, there's a particularly interesting "Red Star Line" museum. This museum was converted from warehouses, customs, and quarantine facilities. A century ago, people here disinfected luggage, bathed, and passed American doctors' physical examinations before boarding ships to the New World. The Red Star Line was the first commercial passenger route from the European continent to North America. From its establishment in 1873 until its bankruptcy during the Great Depression, it carried over two million passengers to North America, many of whom were immigrants fleeing war, Nazis, and seeking their fortune in the New World: Einstein was among them.[8]
At the time, if an ordinary European family wanted to immigrate, they would first send the most adventurous member of the family to North America. After he established himself and accumulated savings, he would bring other members over in batches. These advance scouts sent colorful postcards back to the Old World: magnificent Niagara, bustling New York, crowded Atlantic City—or simply purchased ship tickets.
These postcards proclaimed a dream: in the eyes of proactive and enterprising pioneers, America was a fairyland! But the speculators who arrived early hid the reality in the second half of that sentence: America is a fairyland! An extremely dangerous fairyland...
I believe not all passengers felt fortunate to have participated in the voyage, but the fact is, without the Red Star Line, America wouldn't have had the Manhattan Project, and Europe wouldn't have had cheap vacuum cleaners, Playboy, and the Atlantic Community. The Red Star Line wasn't just a transportation tool, nor was it limited to all the dignity and humiliation, hopes and attachments, timidity and determination of the passengers on board. The Red Star Line connected two continents—though not in the best way for both sides, but connected nonetheless.
Nations, politics, culture, AI all need communication, just as people need communication! In the preface to "Our Generation," it says: Everything in human society is merely context for each other. With longing for such an era, I wrote in the exhibition's final comment section:
May the Red Star truly connect the world.

**(VII)**
Starting in summer, I spent four full months reading Ehrenburg's memoir: "People, Years, Life"[9].
This book already has 1.38 million words, but I still feel its density is too great. As a reflection of nearly a century of history, too many emotions and times can only be highly compressed into a few brief words. We say "Cold War"—these are two light words, but they mean many people lived most of their lives in that heavy atmosphere.
I could say too much praise about this book. I'm impressed by the author's vast knowledge, his "minimum program," his honesty about confusion, his persistent enthusiasm and courage in harboring ideals, but what's most moving is that heart. As the author said when evaluating Lenin: "Rare modesty, strength, and determination—determination that neither excludes gentleness nor denies deep respect for spiritual wealth, for reason, for art—this is humanitarianism, true humanitarianism."
Conscience is also just two words. Different eras will make different demands on us, but practicing conscience always means abundant strength and abundant love. This strength and love isn't for influencing history's course, isn't for standing oneself like a scale mark on the timeline, but for breaking through the curtain of indifference, for letting people of the same era and different eras encounter each other, for letting others be infected with hope.
For the same reason, after watching "Good Stuff," I understood "upright, brave, and read a lot" as a satirical phrase. This describes how China's relatively least constrained by tradition, most free in thought, insight, and economic foundation group of people have devoted all their energy to elegant living and caring for themselves. People choose to reconcile with visible life, but don't struggle with larger "structural problems." This is typical "American Dream" narrative: at the end of personalized experience is blindness to the individual's responsibility in society. Lacking action, lacking perspectives that encompass others—shouldn't say "what do I have to pity," but should ask "what can I help people more pitiful than me."
But I have no standing to criticize, because I myself am the object of satire. I wrote a long piece of text just to declare for myself: I'm in a bad situation, but I fucking read a lot!


**References**
[1] [Elon Musk: Fuck that, let's get it done](https://www.youtube.com/watch?v=KoihlAl7ugQ), 2021
[2] "Zhong San Si Qing Gui," Nie Gannu, 1965
[3] "Gravity's Rainbow," Thomas Pynchon, 1973
[4] "[History's Garbage Time](https://www.reddit.com/r/China_irl/comments/1e5qn1j/%E5%8E%86%E5%8F%B2%E7%9A%84%E5%9E%83%E5%9C%BE%E6%97%B6%E9%97%B4/?rdt=34941)," Qinghe Shechang, 2023.12
[5] "Our Generation," Xiao Quan, 2021
[6] "Sun City Notes," Bei Dao
[7] "The Eyes of Power," Michel Foucault, 2021
[8] [Red Star Line Museum](https://redstarline.be/en/content/welcome), retrieved 2024
[9] "People, Years, Life," Ilya Ehrenburg, 1961


_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---


（序）

我通勤路上的几束樱树开花了。但这不是早春，而是初秋时候的事情。
你们尽管开好了，我知道在那呼呼的北风停歇之后，你们仍然会好好的。
但不要这样宣扬：我们开得这样早，是因为我们远远就预判了春天。

春天最终会来的。只是在解冻之前，你们的一些姊妹也会在严寒和风雪中死去。
请允许它们有尊严地捱过冬天吧。



（一）

9月的时候，我的大学同学来纽约。见面时他第一句话就说：能单独和我吃午饭的人不多了，你知道你现在面子有多大吗？然后他就提起他前日和中国最著名的风投机构的掌舵人在面朝中央公园的高层私人会所中谈笑风生的事。

（我俩认识13年了，毕业之后我们不常见面，也通常以戏谑的方式简洁地谈起理想；在这种交流中我感到我们在很多方面的相似和决定性的不同。）

我真正为他感到高兴，他的天才和理想正好对应上他的热情和时代的需要、能为有资源的人所赏识，而这不是常见的。我思索了一下自己是否有什么值得分享，但这些年我所经历的只是一个普通职员看到领导层为自己的庸碌、自负和狭隘（这三者总是携手前行）不断付出代价和变本加厉的故事。

于是我想，那我们还是说回机器人吧。

他在博士期间构想了一套关于机器人训练的全新范式，在我的理解中，这套框架大致是将现实生活搬入模拟的环境，这样就得以解决训练中经常被掣肘的现实数据严重不足的问题；同时，因为这个虚拟环境是足够多样、逼真的，因此机器人的能力就不会被限制于特定任务，从而实现一般化。

他说，他想创立的是一个类似早年OpenAI的不注重短期盈利的机构，至少在近期，专注于底层研究的突破。他接着说起马斯克和乐高，说他喜欢从无到有地垒砌一个模型的感觉。我和他一起兴奋，我能听到这几个月以来，拼图在一点点成型。

地缘政治是无法忽视的，但在远景上，更大的担忧和如今被讨论得更多的——AI对社会生产力的影响的展望——同根同源，那是人类必须回答的终极问题：人是什么？

（我在2016年故作清醒地写道：“人类唯一能经得住考验的东西，并不是他们花费千年的精力堆积起来的臆病的道德、智慧的巴别塔，而是在诞生之初就刻印在遗传物质中的生物性状和条件反射。”，后一年，我又沾沾自喜地说：“几乎没有人看清这个事实：人类仅仅是进化图谱上的中间一环而非终点。”但那时我只是个瞎子，我想语出惊人，是因为对自己生活的状况感到愤怒。）

我问他，你对几乎必然到来的冲击怎么看？现在的社会结构对这种东西可没有真正准备好的一天。

他说，无论大众是否接受这个现实，那扇门注定是要被推开的；与其让别人来，不如我自己来。

我想起来很多相似的话。

我想起科比采访时说：（比赛中）总会一方会赢的，那为什么不是我呢？

我想起马斯克被问到创立SpaceX的时候有没有许多担心的时候沉默许久，然后说：去他的，让我们来搞定他。[1]

开拓者也许就是这样的，理想宏大，行动则是不受现实拖拽的纯粹。青眼高歌望吾子，红心大干管他妈。[2]

我欣赏他们，但我想成为另一种人。那种人致力于弥合前沿研究和普通大众的差异，他不希望火车头只是没日没夜地加速，也不希望车厢里的人认为1g的重力就是世界的全部……

他想努力让这两个世界相互看见，他想让他们稍微理解彼此的处境。



（二）

这也许是一种逃离。我常常思考一些根本轮不上我考虑的事情：人类的命运，人民的命运，文化的命运。我以前总以为，它们的改善相辅相成；但当我从更细节处看历史，我才知道，除了少数的甜蜜时期，这三者经常相互抵触。而如今我感到窒息，因为虽不至于万马齐喑，这三样事倒都像走入了一个逐渐收窄的山洞：入之愈深，其进愈难；而火且尽。

这并不是说我们的时代有多么糟糕，它只是有巨大的稳定和巨大的惯性，在突然脱缰之前，绕着糟糕但又没有那么糟糕轨道运行，慢慢地、慢慢地接近一个深坑。这是易于理解和便于忍受的。这个世界和平了那么久，所以哪怕我们知道某些地方已经天翻地覆，但既然没有倾覆到自己头上，也就还可以当做无事发生。

我想起我在风车村突然被一群快乐的人团团围住，问我是否愿意和他们合照。他们正进行一场家庭游戏：在景区找到列表中的人；而我脖子上挂着相机，就被当成了摄影师。照片里大家开心地笑，这些笑容和北溪爆炸后命运黯淡的欧洲没有一点关系。

我想起阿姆斯特丹一栋公寓的三楼挂出了以色列的国旗，而它楼上的住户以同样的尺寸挂着巴勒斯坦的。加沙的冲突已经过去一年，大家对此都有激烈的主张，但街上行人还是波澜不惊地坐在咖啡店里。

我想起二战纪念馆中记载城市解放后，和德国士兵相好的荷兰姑娘们被剃光头发游街示众的场景。她们中有人辩解：我正值芳龄，只是想寻找爱情啊。况且他比荷兰的男人们还要体贴……

想要当个盲人很容易，现代化的生活中有很多方便的手段获取渺小但及时的、麻醉药似的幸福。可我偏要当个见人。我这么说是因为我感到骚动。我越是无能为力，越是想像那些情妇们一样大喊：

在历史周期的这样一个时间里，我居然年轻力壮！…… [3]



（三）

两年以前，在员工评审的职业规划环节，我唯唯诺诺。我看着我老板们的晋升轨迹，我从行业意见领袖的发言中获取灵感，我认真思考我能做什么项目，能给公司带来什么影响。但现在我知道这些东西都是狗屁。我完成很好的工作，得到良好的绩效，但没有预算就是没有预算。

其实我从入行就明白，我踩在了互联网科技公司黄金十年的余晖里。我看到前面的人吃肉。我喝那些焯水的有肉味儿的汤。我羡慕和怨愤。但是看着那些连汤也喝不到的后辈，我又感到侥幸。

现在那些因为大快朵颐而油嘴滑舌的人告诉我说，肉尽管要照常吃，但汤不够分了。

看着后辈，我舍不得砸下这手里的碗；望着前辈，我咽不下这寡淡的汤。

我尽可以推说这是时代的错误，但只能更加彰显一个中产阶级彻头彻尾的卑俗而妥协。

今年春天，我在朋友圈看到了“如何度过历史的垃圾时间” [4] 的文章，这个说法在夏天的时候引发过大量讨论和噤声。我说我认同它，并不是因为我能验证它自称的经济学的根基或历史层面无可争议的重复性，而是它能共情我的感受，它给了我躺平的借口，而我从中读到的绝望正是我面对自身无力和怯懦时本身的绝望。



（四）

年初的时候，我开始翻看《我们这一代》[5] 的影像集。这是些关于中国80，90年代的文艺届肖像，书中的人物是我们所熟悉的，甚至至今仍然在文艺界活跃的：崔健，张艺谋，顾城，余华，三毛……我对这册集子感兴趣，是因为我好奇中国改革开放那些年经历的故事。我看到过不少史实，经济数字，政策，企业家，但这里是活生生的人，是他们的生活，况且文艺本身就应该表现活生生的人……

在看这本书之前，我已纠正过自己的一些短见。早年我曾以为，“搞文艺的”是一群很不一样的人，文艺行业是一个特别的行业，但并不是这样。文艺界也存在政治斗争，权力交替，裙带关系；甚至因为其封闭性，它们只会比在其他行业里更加肆无忌惮地繁殖。

但改革开放是这样一个独特的样本，在那个时间窗口里，旧的势力被打碎了，新的东西又生长在法外之地，而法外之地的权力结构还在等待成型（它像美国历次的移民潮，也有些像如今的AI）……

中国的现代艺术看上去和中国的民营企业一样，出生是草莽和灰色的。他们不是在和已有的作物争夺田地，而主要是面对一片荒土。他们要有锋利的牙口，他们要不顾那些界桩，才能从这些尖锐的土壤中嚼出营养来。但一旦能下到那些井下去，一旦他们适应在那种环境中睁开眼，他们就能从中找到无限的思想，因为从根本上说，从无到有的过程里就是不禁止任何事情发生。

我知道那是黄金时代，我知道那奇迹般的增长率让人们倏忽间富足了多少。可我不知道我是否应该羡慕他们，我也不知道我在那个年代能否大展身手。

就像那天我在一座教堂里面参观，利箭一样的光线从某处的开口射下。我身处那令人目眩的日光中，只觉得周围空气失重地飘浮，力图填满这空旷的虚无。这时耶稣的雕像从穹顶降落，他挡住了那片光，于是室内变得清晰起来。我变得可以张口呼吸，我望着那个被光打亮的巨大十字剪影，突然明白作茧自缚的信仰为什么也能让人心安。

我在规训中呆得太久了，脱离了秩序我不是感到被解放了翅膀而是像一只落单的淋湿的小鸡。

但就算这样我居然觉得自己一直过得不错。



（五）

记忆中，高中某节语文课外班里，我看到老师在黑板上写下：

生活 网。[6]

我为这一个字的短诗陶醉了。但不是饮罢佳酿的陶醉，而是囫囵吞枣时被噎住的短气。那是生活刚刚向我揭开她的面纱时愿望早熟的少年的想象。（时常有这样的事，我们和赤裸的真理很早打上照面，但很多年后才反应过来，那许多在街上到处溜达的影子，原来都是它披过的各式的外衣。）

福柯让我看见了网。什么是网？网是权力的别名。

在福柯的理论中，法国大革命时期对黑暗和不透明的恐惧，促使人们梦想一个“视觉不受任何阻碍，公众的观点相互可见”的社会，这个社会从根本上避免犯罪，因为“通过把人置于完全可视的空间，这样他们的观点、思考和有关他人的话语就可以避免导致有害的行为”。这乌托邦式构想，从可以建立追溯档案的学校、兵营、医院、警察局扩散开来，逐渐形成“圆形监狱”似的全景式透明的现代社会，每个人都默认自己被监视，也自觉地成为监视者，于是“权力以越来越小的代价得到最广泛的实施”。 [7]

这套理论很打动我，它阐明了很多历史脉络和社会现象，但就是不带给人任何希望。福柯说“个人是权力的运载工具，而不是权力的作用点”，这似乎是在宽慰我说，作为一个权力的通道，我犯不上产生什么情绪，就像雨水渗入泥土流经河床的时候，泥土和河床不会产生任何情绪一样。

权力是抽象的，但生活与此相反，我能数出来很多能剧烈影响我命途的具体的人。我也确实知道我的生活境况如何根本不在他们的视距或关心之内。

我现在看到“网”的时候，我不是在想权力如何流通，不是想系统法则、科学专制、道德规训，我想到的是一只被蛛丝裹得越来越紧的扑棱的蛾子。



（六）

安特卫普主运河沿岸有个特别有意思的“红星号”博物馆。这个博物馆由仓库、海关和检疫所改建而成。一个世纪以前，人们在这里消毒行李，洗澡和通过美国医生的身体检查，然后登船前往新大陆。红星号是欧洲大陆通向北美的第一条商业客运航线，从1873年建立到大萧条时破产，它一共运载了两百多万乘客到达北美，这些乘客中相当部分是躲避战乱、纳粹以及去新大陆碰运气的移民：爱因斯坦也是其中之一。[8]

当时，如果一个普通欧洲家庭想要移民，他们会先派出家族内最具冒险精神的人前往北美。在他站稳脚跟并拥有积蓄后，再将成员分批接过去。这些先遣者向旧大陆寄来五颜六色的明信片：壮丽的尼亚加拉、车水马龙的纽约、人流熙熙的大西洋城——或者干脆就是买好的船票。

这些明信片嚷嚷着一个梦想：在具有主动和进取精神的拓荒者眼里，美国就是仙境！但提前抵达的投机者把后面那句现实藏住不说：美国是仙境！是极其危险的仙境……

我相信不是所有乘客都对他们参与了航行感到庆幸，但事实就是，如果没有红星号，美国就没有曼哈顿计划，而欧洲就不会有廉价吸尘器、花花公子和大西洋共同体。红星号并不只是一个运载工具，也并不局限于船上乘客的所有尊严与屈辱，希冀与眷恋，畏缩与决绝。红星号将两个大陆联结在一起——尽管不是以对双方都最好的方式，但毕竟还是联结在一起。

国家、政治、文化、AI都需要沟通，就像人需要沟通一样！《我们这一代》序言中写道：人类社会的一切，不过互为语境。我怀着对这种时代的憧憬，在展览最后的留言区写下：

愿红星能真正地连结世界。



（七）

从夏天开始，我用满四个月的时间读完爱伦堡的回忆录：《人，岁月，生活》[9]。

这册书已经有138万字，但我仍然觉得它密度太大。作为对近一个世纪的历史的反映，太多情感和时间只能被高度压缩成聊聊数语。我们说“冷战”，这是轻巧的两个字，但它意味着许多人在那种沉重氛围中活过的大半辈子。

我可以对这本书说太多赞美，我折服于作者的博闻强识，他的“最低纲领派”，他对迷惘的坦诚，他怀揣理想的持之以恒的热忱和勇气，但最让人感动的是那颗心。就像作者在评价列宁时说：“罕见的谦虚、力量以及决心，这种决心既不排除温和，也不否定对精神财富、对理性、对艺术深深的尊敬，——这才是人道精神，真正的人道精神。“

良心也只有两个字。不同时代对我们会提出不同的要求，但践行良心始终意味着丰沛的力量和丰沛的爱。这些力量和爱不是为了左右历史的进程，不是为了把自己像刻度一样立在时间轴上，而是为了突破漠不关心的帷幔，为了让同时代和不同时代的人打上照面，为了让他人感染希望。

出于相同原因，在看完《好东西》后，我把“正直勇敢有阅读量”理解为一句讽刺的话。这是说中国相对被传统限制最少，思想见识和经济基础都最为自由的一类人把所有心思都用在了优雅生活和关心自己上。人们选择和看得见的生活做和解，但不和更大的“结构性问题”做抗争。这是典型的“美国梦”式叙事：在个人化经历的尽头是对个体在社会上担任的职责的视而不见。缺乏行动、缺乏囊括他人的视角——不应该讲“我有什么可怜的”，而应该问“我能帮到比我可怜的人什么”。

但我没有任何立场批评，因为我自己就是被讽刺的对象。我写了一大篇文字就是在为自己声明：我处境不佳，但我有他妈的阅读量！



[1] [Elon Musk: Fuck that, let’s get it done](https://www.youtube.com/watch?v=KoihlAl7ugQ), 2021
[2] 《钟三四清归》，聂绀弩，1965
[3] 《万有引力之虹》，托马斯·品钦，1973
[4] 《[历史的垃圾时间](https://www.reddit.com/r/China_irl/comments/1e5qn1j/%E5%8E%86%E5%8F%B2%E7%9A%84%E5%9E%83%E5%9C%BE%E6%97%B6%E9%97%B4/?rdt=34941)》，清和社长，2023.12
[5] 《我们这一代》，肖全，2021
[6] 《太阳城札记》，北岛
[7] 《权力的眼睛》，米歇尔·福柯，2021
[8] [Red Star Line Museum](https://redstarline.be/en/content/welcome), retrieved 2024
[9] 《人，岁月，生活》，伊利亚·爱伦堡，1961`,__vite_glob_0_20=`---
title: 'Hawaii Has No Anger'
title_zh: '夏威夷没有愤怒'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/2025-03-23_夏威夷没有愤怒.jpg'
date: '2025-03-23'
tags:
  - 'travel log'
  - 'usa'
tags_zh:
  - '游记'
  - '美国'
languages: ['en', 'zh']
---

#### 1.0
The battleship USS Missouri, which missed the entire Pearl Harbor attack, now rests moored in the calm waters of the inner harbor. The wreckage of her sister ship Arizona—which suffered the most devastating casualties—lies just over a hundred meters ahead of her bow.
Every quarter hour, a guide leads a new group of visitors strolling along the ship's rail: we gaze up at the massive gun barrels pointing toward the sky, look down at the deck boards once walked upon by the Japanese surrender delegation, and read a placard about a burial at sea ceremony.
—On April 11, 1945, during the Battle of Okinawa, Captain William Callaghan ordered his crew to give a kamikaze pilot a military burial at sea with full honors. Thus Setsuo Ishino became the only Japanese soldier in World War II to receive a military funeral from Allied forces. Some say this represents humanity, respect, and honor between soldiers, but I know another answer.
William Callaghan missed the entire Pearl Harbor attack. William Callaghan had no anger.

After the air raid, the Pacific Fleet was jumpy and paranoid: so many of these brown-skinned residents had Asian faces, and among them up to 150,000 carried suspicious Japanese bloodlines! What followed was a sweep of arrests, detention, concentration camps, and massive military control; if you looked Japanese, then you were a "Jap"...
Hawaii was merely a U.S. territory at the time, not a state (that would have to wait until 1959), but this didn't prevent the spread of curfews and discrimination. These residents watched helplessly as their towns became military bases, then were inexplicably bombed by Japanese forces, and finally were detained in concentration camps. How unfair it all was, but what could they say? This was, after all, a war where justice had to triumph over evil! As for why evil came calling unexpectedly...
Hawaii's residents submitted to American rule. Hawaii's residents had no anger.

On March 9, 2025, Waikiki Beach was more lively than usual. The 29th Honolulu Festival was in full swing. I just couldn't quite tell whether this celebration was truly what its organizers claimed—a festival celebrating Hawaiian and Pacific Rim culture—or essentially a Japanese matsuri. What I saw were bilingual English-Japanese festival banners, young girls dancing cheerfully to Japanese pop music, mikoshi and floats, and the festival's finale calling for peace: a Nagaoka Fireworks Festival fireworks show.
(Interestingly, the Nagaoka Fireworks Festival happened to be an event that began in Nagaoka City, Niigata Prefecture, in the first year after Japan's surrender, to commemorate those who died in World War II. And coincidentally, Honolulu and Nagaoka became sister cities.)
Many people have much to say about promoting peace, but it shouldn't be the perpetrators speaking to the victims, the aggressors to the invaded, the colonizers to the colonized. I'm curious: this world's most famous beach is only a 20-minute drive from the U.S. military's most humiliating scar, many tourists visit both places in a single day—what exactly is this harmony all about? What kind of identity do these people who speak equally fluent Japanese and English actually have?
I know someone will say it's rare to be confused, let the past be the past.
Indeed so.
After all, Hawaii has no anger either.

#### 2.0
When Captain James Cook arrived in Hawaii, it was during Makahiki season, precisely when the local natives were celebrating Lono—the god of agriculture, harvest, and peace. This coincidental timing of his landing led the Hawaiians to revere Captain Cook as a deity.
When the captain appeared for the second time, they were no longer pleased. The festival and worship had ended—why had he returned? So Cook fell from divinity and was killed by Hawaiian warriors.
Cook was indeed not Lono, but he possessed the same divine power and divine punishment: the plagues and missionaries who followed in his footsteps killed ninety percent of Hawaiians over the next century, and raised the Christian cross at this Pacific crossroads.
Hawaiians historically never practiced isolationism: Hawaiian chiefs used Western weapons to win tribal wars, Hawaiian queens promoted Western faith and culture to replace traditional religion and customs, but this keeping with the times didn't help them escape more of their destined fate. In 1893, a queen who tried to secure more rights for the natives was overthrown by plantation owners, ending nearly a century of monarchical rule over these islands; five years later, the Newlands Resolution from Washington, D.C., made a declaration for all Hawaiians 8,000 kilometers away: Hawaii was American territory.
Then came massive immigration: Japanese, Chinese, Portuguese, Korean, Filipino... Within just over a decade, Hawaii's population doubled. And half a century later, it was the descendants of these very immigrants who pushed America to recognize it as the fiftieth state of the United States. This annexed Pacific kingdom finally found its place within the Constitution.
Only by then, you could no longer clearly say who were the "locals" of Hawaii.

#### 3.0
According to ancient legend, taking stones from Hawaii without permission brings bad luck, but if you buy them from locals, that's another matter entirely.
Meanwhile, tourists freely hike and watch sunrises and sunsets on Haleakalā volcano, even though in true Hawaiian culture, the only reason to ascend the sacred mountain is to worship the gods.

According to some fences and warning signs, certain ponds or beaches cannot be casually visited—only locals can swim in the water.
Meanwhile, tourists drink merrily at luau feasts, watching locals perform exaggerated Polynesian war cries and hula dances on stage.

According to travel guidebook advice, when driving the Road to Hana, one should be mindful of yielding to local vehicles and pull over promptly to let them pass.
Meanwhile, the 2023 Lahaina fire destroyed eighty percent of locals' homes, reconstruction is slow, but adjacent resorts bustle with crowds.

The flag of the Kingdom of Hawaii flutters defiantly everywhere across these United States islands. Meanwhile, 160,000 new American tourists land daily with their sunglasses and Hawaiian shirts.

Who needs condescending respect? Who truly owns Hawaii?

#### 4.0
In Hana's pristine forests, bamboo saplings brought by Chinese laborers have grown rampant into lush bamboo groves. Indian banyan trees planted to commemorate the 50th anniversary of the Pilgrims' landing stand firm, providing shade for all. On the windy peaks of the volcano park, chukar partridges introduced from Asia forage in parking lot gaps. These invasive species live here contentedly, sometimes overly bold, turning guest into host.
But capitalism is the real master here.
Thirty-seven wealthy Americans own private lands exceeding 5% of the state's total land area, with Larry Ellison (Oracle's founder) alone owning 98% of Lanai Island. (At sunset, viewed from Maui's west shore, Lanai Island's massive shadow looks like a shroud draped over Lahaina. What did Larry do after that great fire? From public records, he did nothing.)
A century ago, the Big Five plantation cartel collectively owned over 10% of the total area. That was a period of dramatic change in Hawaii's landscape: the disappearance of native species and forest scenery, replaced by endless sugarcane fields, pineapple farms, countless cattle... Until tourism's rise, only then did people remember ecological fragility, rare species, environmental protection. So golf courses arrived fashionably late as the final victors, yet bloomed across mountains and valleys. Today, looking down at Maui from an airplane, those plains half meadow and half desert look like stubborn wounds that refuse to heal.
It's hard to describe Hawaii as scarred, because life never disappoints those abundant rains and sunshine.
It's just that whatever Pele the goddess cannot save, Uncle Sam will make even worse.

#### 5.0
In a corner of the Sunday market next to Honolulu Zoo, two men who looked like brothers had set up a tent selling handicrafts. They were darkly tanned by the sun, with Asian faces, both seemingly in their fifties. The younger brother sat in a simple chair polishing a wood carving, while the older brother, wearing flip-flops and a camouflage baseball cap, greeted customers.
But there weren't really any customers. At eight in the morning, tourists' snores hadn't yet turned into clamor, many vendors in the market were still setting up their displays, with morning light sparsely dripping through leaf gaps.
The wood carvings they sold weren't the identical shamanic figures commonly displayed in souvenir shops, but various decorations clearly handmade by self-taught craftsmen. We were drawn to a flying pig ornament. These three wooden piglets were carved quite roughly, with no coloring, strung together like wind chimes hanging from the tent's frame. Each pig had three bird feathers stuck in its rear.
March in Hawaii is typically a windy time. When the wind rose, these feathers spun in the breeze. The ornament had no bells, yet I seemed to hear the clear sound of wind chimes.
We bought these rough little pigs. When the owner stood on his toes to take them down, I noticed he was slightly cross-eyed, which gave him an honest appearance. As I write these words, these little pigs are spinning by our window—March in New York is windy too.
Every time I walk past these little pigs, I can't help but stop and blow on them, watching their feathers rustle and spin. Each time I gain some strength and some emotion.
I think I've said many bad things about Hawaii. I believe approaching Hawaii with a vacation mindset misses the point. But staying too long in these historical folds and cultural overlays will eventually make one choke and grow cold.
Hawaii has no anger, perhaps because even when life grows heavy, there remains a small yet warm and powerful way of living. It's these ordinary things that sustain us, and sustain the earth's steady rotation.


_*Originally written in Chinese. This article is translated by Claude Sonnet 4._
---zh---

**1.0**

错过了整个珍珠港事件的密苏里号战列舰如今停泊在风平浪静的内湾中，它伤亡最为惨烈的姊妹号亚利桑那的残骸就躺在它船首前方百余米处。

每隔一刻钟，向导带领新一批登船的游客在船舷上溜达：我们望向直指天空的巨大炮筒，俯看日本投降代表团踩过的船板，以及一个海葬仪式的示意牌。

——1945年4月11日的冲绳战役，舰长威廉·卡拉汉命令船员以军队的仪仗标准海葬了一个神风战机的驾驶员，于是石野节雄成为了二战中唯一一个被盟军举行军事葬礼的日本兵。有人说这代表人性、尊重和军人之间的敬意，而我知道另一个答案。

威廉·卡拉汉错过了整个珍珠港事件。威廉·卡拉汉没有愤怒。



空袭过后，太平洋舰队杯弓蛇影：这些棕色皮肤的居民好多都是亚洲面孔，其中多达十五万人携带可疑的日本血统！接下来就是搜捕、拘留、集中营、大规模的军事管制；如果你长得像日本人，那你就是日本佬（Japs）……

夏威夷当时仅仅是美国的领土而不是一个州（这要等到1959年），但这并不影响宵禁和歧视的蔓延。这些居民眼睁睁看着自己的镇子变成军事基地，然后莫名其妙被日军轰炸，最后被关押到集中营里。好不公平啊，但你能说什么呢？这毕竟是正义必须战胜邪恶的战争啊！至于为什么邪恶会不期而至……

夏威夷的居民服从美国的管理。夏威夷的居民没有愤怒。



2025年3月9日，威基基海滩比平日更为热烈。第29届檀香山节（Honolulu Festival ）声势浩大。我只是有些分不清这个庆典到底是如它官方所说——一个[关于夏威夷和太平洋周边地区文化的节日](https://www.honolulufestival.com/en/festival/)，或者根本就是一个日式的祭典。我看见的是英日双语的节日横幅，是年轻女孩们跟着日本流行音乐跳起的轻快舞蹈，是神轿和花车，是庆典最后“呼吁和平”的名为長岡花火大会焰火秀。

（有趣的是，長岡花火大会恰好是新潟縣長岡市在[日本投降后的第一年，为了纪念二战中死去的人们而开始的活动](https://www.japan.travel/en/spot/256/)。偏偏火奴鲁鲁和長岡又成了友好城市。）

关于促进和平，很多人都有很多话可以说，但就是不应该施难者对着受难者，侵略者对着被侵略者，殖民者对着被殖民者说。我很好奇，这个世界最著名的海滩距离美军最屈辱的伤疤不过20分钟车程，很多游客一天内在两个地方打来回，这种和谐到底算是怎么一回事？这些说着同样流利日语和英文的人们身份认同到底是什么样子？

我知道有人要说难得糊涂，过去的就让它过去吧。

确实如此。

反正夏威夷也没有愤怒。



**2.0**

詹姆斯·库克船长到达夏威夷时正值玛卡希基节（Makahiki），这正是当地土著庆祝洛诺（Lono）——农业、丰收与和平之神的时候。这巧合的登录节点让夏威夷人将库克船长奉为神明。

船长第二次出现时他们却不高兴了。节日和侍奉已经结束，他又为什么要回来？于是库克堕入凡间，被夏威夷战士杀死。

库克确实不是洛诺，但他一样拥有神的力量和神的惩罚：那些跟随他的脚步上岸的瘟疫和传教士们，在之后的一个世纪杀死了九成的夏威夷人，又在这个太平洋的十字路口升腾起基督的十字。

夏威夷人历史上没有闭关锁国：夏威夷的酋长们借助西方的武器赢的部落战争，夏威夷的女王推行西方的信仰和文化替代传统的宗教和观念，但这些与时俱进并没有让他们逃逸出更多的命中注定。1893年，试图为土著争取更多权力的女王被种植园主推翻，了结了这些岛屿近百年的君主统治；五年后，源自华盛顿特区的纽兰兹决议替所有8000公里外的夏威夷人做出声明：夏威夷是美国的领地。

然后它迎来了大规模的移民：日本，中国，葡萄牙，韩国，菲律宾……十余年间，夏威夷的人口暴涨一倍。而半个世纪后，正是这些移民的后代推动美国承认它成为美利坚合众国的第五十州。这个被吞并的太平洋王国，终于在宪法之内找到了位置。

只是这时候，你已经和难说清楚，谁才是夏威夷的“本地人”了。



**3.0**

根据古老的传说，私自带走夏威夷的石头会招来厄运，但如果从本地人手中买下的话就另当别论。

与此同时，游客在哈莱阿卡拉火山（Haleakalā）上任意徒步和观看日出日落，尽管在真正的夏威夷文化中，登上圣山的唯一理由是祭祀神灵。



根据一些拉上的围栏和竖起的警示，有些池塘或海滩不可贸然光顾，只有本地人可以下水游泳。

与此同时，游客在鲁奥宴会（Luau）上怡然饮酒，看着本地人在舞台上表演波利尼西亚夸张的战吼和草裙舞。



根据旅行手册的建议，哈纳之路上行车时应注意避让本地车辆，及时靠边让行。

与此同时，2023年拉海纳的大火烧毁了本地人百分之八十的居所，重建工作缓慢，但相邻的度假村人声鼎沸。



夏威夷王国的旗帜在合众国的岛屿上到处耀武扬威地猎猎作响。与此同时，每天都有16万新的美国游客拿出自己的墨镜和夏威夷衬衫登陆旅行。

谁需要居高临下的尊重？谁真正拥有夏威夷？



**4.0**

哈纳的原始森林里，中国劳工带来的竹苗闹腾得蹿成了一片郁郁的竹林。为纪念清教徒登陆50周年而种下的印度榕树屹立不倒荫庇一方。火山公园多风的山顶，自亚洲引进的石鸡在停车场的间隙低头觅食。这些外来物种在这里生活得怡然自得，有时过分嚣张，反客为主。

但资本主义才是这里真正的主人。

[37个美国富豪拥有的私人领地超过全州土地面积的5%](https://www.forbeschina.com/city/67247)，其中仅拉里·埃里森（甲骨文创始人）一人就拥有98%的拉奈岛。（夕照时分，从茂宜的西岸望去，拉奈岛巨大的阴影像给拉海纳披上一件丧衣。那场大火过后拉里做了什么呢？从公开资料看，他什么都没有做。）

而一个世纪前，五大种植业的卡特尔的土地面积合计[超过总体的10%](https://chatgpt.com/share/67dee245-3504-8012-81d5-59cf1f10e879)。那是夏威夷风貌急剧变化的时期：本地物种和森林景观的消失，取而代之以一望无际的甘蔗田、菠萝农场、数不胜数的黄牛……直到旅游业的兴起，人们这才想起生态脆弱、珍稀物种、环境保护。于是高尔夫球场以最后的胜利者的姿势姗姗来迟，却开得漫山遍野。如今从飞机上俯瞰茂宜岛，那些半是草甸半是荒漠的平原像是固执的不肯愈合的创伤。

很难用疮痍来形容夏威夷，因为生命不会辜负那些丰沛的雨水和阳光。

只是，但凡佩蕾女神拯救不了的东西，山姆大叔就会变本加厉。



**5.0**

檀香山动物园旁边的周日集市的一个角落，看上去像兄弟的两人支着一个蓬子在售卖手工艺品。他们被日光晒得黝黑，亚洲面孔，似乎都是五十岁上下。弟弟坐在一把简陋的椅子上正在给一个木雕抛光，哥哥穿着拖鞋戴一顶迷彩的棒球招呼客人。

但并没有什么客人。清晨八点，游人的呼噜还没有变成喧嚣，集市里不少卖家还在布置自己的台面，只是晨光稀稀疏疏地从叶缝间滴落。

他们卖的木雕并不是纪念品店里面常常陈列的大同小异的萨满像，而一看便知是自学成才的匠人手工的各式装饰。我们被一个飞天小猪的吊饰吸引住了。这三只木头小猪被雕得很简陋，没有任何涂色，它们被线串成一串，像风铃一样被挂在蓬子的支架上。每只小猪的屁股后面都插着三叶鸟羽。

三月的夏威夷本是多风的时候。风起时，这些羽毛迎风转起来。吊饰上没有任何铃铛，而我却能恍然听见清脆的风铃声。

我们买下了这些粗糙的小猪。老板踮着脚去摘下它的时候，我才看出他有些对眼，因此也显出憨厚的样子。就在我写下这些文字的时候，这些小猪正在我们的窗前滴溜溜地转着，三月的纽约也是多风的。

我每次从小猪前面走过的时候，总忍不住停下来对着它们吹气，看着它们的羽毛簌簌转动，我都能获得一些力量和一些感动。

我想，我说了好多夏威夷的坏话。我以为以度假的心态去夏威夷是不得要领的。但呆在这些历史褶皱和文化叠影中太久，人总会呛水和失温。

夏威夷没有愤怒，也可以是因为就算日子再过沉重，仍然有一种渺小却不失温暖和力量的活法，正是这些平凡的东西支撑着我们，也支撑着地球平稳转动。`;var buffer={},base64Js={};base64Js.byteLength=byteLength;base64Js.toByteArray=toByteArray;base64Js.fromByteArray=fromByteArray;var lookup=[],revLookup=[],Arr=typeof Uint8Array<"u"?Uint8Array:Array,code="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(var i$1=0,len=code.length;i$1<len;++i$1)lookup[i$1]=code[i$1],revLookup[code.charCodeAt(i$1)]=i$1;revLookup[45]=62;revLookup[95]=63;function getLens(e){var o=e.length;if(o%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var a=e.indexOf("=");a===-1&&(a=o);var s=a===o?0:4-a%4;return[a,s]}function byteLength(e){var o=getLens(e),a=o[0],s=o[1];return(a+s)*3/4-s}function _byteLength(e,o,a){return(o+a)*3/4-a}function toByteArray(e){var o,a=getLens(e),s=a[0],c=a[1],h=new Arr(_byteLength(e,s,c)),d=0,g=c>0?s-4:s,b;for(b=0;b<g;b+=4)o=revLookup[e.charCodeAt(b)]<<18|revLookup[e.charCodeAt(b+1)]<<12|revLookup[e.charCodeAt(b+2)]<<6|revLookup[e.charCodeAt(b+3)],h[d++]=o>>16&255,h[d++]=o>>8&255,h[d++]=o&255;return c===2&&(o=revLookup[e.charCodeAt(b)]<<2|revLookup[e.charCodeAt(b+1)]>>4,h[d++]=o&255),c===1&&(o=revLookup[e.charCodeAt(b)]<<10|revLookup[e.charCodeAt(b+1)]<<4|revLookup[e.charCodeAt(b+2)]>>2,h[d++]=o>>8&255,h[d++]=o&255),h}function tripletToBase64(e){return lookup[e>>18&63]+lookup[e>>12&63]+lookup[e>>6&63]+lookup[e&63]}function encodeChunk(e,o,a){for(var s,c=[],h=o;h<a;h+=3)s=(e[h]<<16&16711680)+(e[h+1]<<8&65280)+(e[h+2]&255),c.push(tripletToBase64(s));return c.join("")}function fromByteArray(e){for(var o,a=e.length,s=a%3,c=[],h=16383,d=0,g=a-s;d<g;d+=h)c.push(encodeChunk(e,d,d+h>g?g:d+h));return s===1?(o=e[a-1],c.push(lookup[o>>2]+lookup[o<<4&63]+"==")):s===2&&(o=(e[a-2]<<8)+e[a-1],c.push(lookup[o>>10]+lookup[o>>4&63]+lookup[o<<2&63]+"=")),c.join("")}var ieee754={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */ieee754.read=function(e,o,a,s,c){var h,d,g=c*8-s-1,b=(1<<g)-1,j=b>>1,_=-7,_e=a?c-1:0,tt=a?-1:1,it=e[o+_e];for(_e+=tt,h=it&(1<<-_)-1,it>>=-_,_+=g;_>0;h=h*256+e[o+_e],_e+=tt,_-=8);for(d=h&(1<<-_)-1,h>>=-_,_+=s;_>0;d=d*256+e[o+_e],_e+=tt,_-=8);if(h===0)h=1-j;else{if(h===b)return d?NaN:(it?-1:1)*(1/0);d=d+Math.pow(2,s),h=h-j}return(it?-1:1)*d*Math.pow(2,h-s)};ieee754.write=function(e,o,a,s,c,h){var d,g,b,j=h*8-c-1,_=(1<<j)-1,_e=_>>1,tt=c===23?Math.pow(2,-24)-Math.pow(2,-77):0,it=s?0:h-1,st=s?1:-1,ut=o<0||o===0&&1/o<0?1:0;for(o=Math.abs(o),isNaN(o)||o===1/0?(g=isNaN(o)?1:0,d=_):(d=Math.floor(Math.log(o)/Math.LN2),o*(b=Math.pow(2,-d))<1&&(d--,b*=2),d+_e>=1?o+=tt/b:o+=tt*Math.pow(2,1-_e),o*b>=2&&(d++,b/=2),d+_e>=_?(g=0,d=_):d+_e>=1?(g=(o*b-1)*Math.pow(2,c),d=d+_e):(g=o*Math.pow(2,_e-1)*Math.pow(2,c),d=0));c>=8;e[a+it]=g&255,it+=st,g/=256,c-=8);for(d=d<<c|g,j+=c;j>0;e[a+it]=d&255,it+=st,d/=256,j-=8);e[a+it-st]|=ut*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(e){const o=base64Js,a=ieee754,s=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;e.Buffer=g,e.SlowBuffer=ot,e.INSPECT_MAX_BYTES=50;const c=2147483647;e.kMaxLength=c,g.TYPED_ARRAY_SUPPORT=h(),!g.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function h(){try{const nt=new Uint8Array(1),$={foo:function(){return 42}};return Object.setPrototypeOf($,Uint8Array.prototype),Object.setPrototypeOf(nt,$),nt.foo()===42}catch{return!1}}Object.defineProperty(g.prototype,"parent",{enumerable:!0,get:function(){if(g.isBuffer(this))return this.buffer}}),Object.defineProperty(g.prototype,"offset",{enumerable:!0,get:function(){if(g.isBuffer(this))return this.byteOffset}});function d(nt){if(nt>c)throw new RangeError('The value "'+nt+'" is invalid for option "size"');const $=new Uint8Array(nt);return Object.setPrototypeOf($,g.prototype),$}function g(nt,$,et){if(typeof nt=="number"){if(typeof $=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return _e(nt)}return b(nt,$,et)}g.poolSize=8192;function b(nt,$,et){if(typeof nt=="string")return tt(nt,$);if(ArrayBuffer.isView(nt))return st(nt);if(nt==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof nt);if($t(nt,ArrayBuffer)||nt&&$t(nt.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&($t(nt,SharedArrayBuffer)||nt&&$t(nt.buffer,SharedArrayBuffer)))return ut(nt,$,et);if(typeof nt=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const at=nt.valueOf&&nt.valueOf();if(at!=null&&at!==nt)return g.from(at,$,et);const ht=ct(nt);if(ht)return ht;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof nt[Symbol.toPrimitive]=="function")return g.from(nt[Symbol.toPrimitive]("string"),$,et);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof nt)}g.from=function(nt,$,et){return b(nt,$,et)},Object.setPrototypeOf(g.prototype,Uint8Array.prototype),Object.setPrototypeOf(g,Uint8Array);function j(nt){if(typeof nt!="number")throw new TypeError('"size" argument must be of type number');if(nt<0)throw new RangeError('The value "'+nt+'" is invalid for option "size"')}function _(nt,$,et){return j(nt),nt<=0?d(nt):$!==void 0?typeof et=="string"?d(nt).fill($,et):d(nt).fill($):d(nt)}g.alloc=function(nt,$,et){return _(nt,$,et)};function _e(nt){return j(nt),d(nt<0?0:rt(nt)|0)}g.allocUnsafe=function(nt){return _e(nt)},g.allocUnsafeSlow=function(nt){return _e(nt)};function tt(nt,$){if((typeof $!="string"||$==="")&&($="utf8"),!g.isEncoding($))throw new TypeError("Unknown encoding: "+$);const et=lt(nt,$)|0;let at=d(et);const ht=at.write(nt,$);return ht!==et&&(at=at.slice(0,ht)),at}function it(nt){const $=nt.length<0?0:rt(nt.length)|0,et=d($);for(let at=0;at<$;at+=1)et[at]=nt[at]&255;return et}function st(nt){if($t(nt,Uint8Array)){const $=new Uint8Array(nt);return ut($.buffer,$.byteOffset,$.byteLength)}return it(nt)}function ut(nt,$,et){if($<0||nt.byteLength<$)throw new RangeError('"offset" is outside of buffer bounds');if(nt.byteLength<$+(et||0))throw new RangeError('"length" is outside of buffer bounds');let at;return $===void 0&&et===void 0?at=new Uint8Array(nt):et===void 0?at=new Uint8Array(nt,$):at=new Uint8Array(nt,$,et),Object.setPrototypeOf(at,g.prototype),at}function ct(nt){if(g.isBuffer(nt)){const $=rt(nt.length)|0,et=d($);return et.length===0||nt.copy(et,0,0,$),et}if(nt.length!==void 0)return typeof nt.length!="number"||Qt(nt.length)?d(0):it(nt);if(nt.type==="Buffer"&&Array.isArray(nt.data))return it(nt.data)}function rt(nt){if(nt>=c)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+c.toString(16)+" bytes");return nt|0}function ot(nt){return+nt!=nt&&(nt=0),g.alloc(+nt)}g.isBuffer=function($){return $!=null&&$._isBuffer===!0&&$!==g.prototype},g.compare=function($,et){if($t($,Uint8Array)&&($=g.from($,$.offset,$.byteLength)),$t(et,Uint8Array)&&(et=g.from(et,et.offset,et.byteLength)),!g.isBuffer($)||!g.isBuffer(et))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if($===et)return 0;let at=$.length,ht=et.length;for(let ft=0,mt=Math.min(at,ht);ft<mt;++ft)if($[ft]!==et[ft]){at=$[ft],ht=et[ft];break}return at<ht?-1:ht<at?1:0},g.isEncoding=function($){switch(String($).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},g.concat=function($,et){if(!Array.isArray($))throw new TypeError('"list" argument must be an Array of Buffers');if($.length===0)return g.alloc(0);let at;if(et===void 0)for(et=0,at=0;at<$.length;++at)et+=$[at].length;const ht=g.allocUnsafe(et);let ft=0;for(at=0;at<$.length;++at){let mt=$[at];if($t(mt,Uint8Array))ft+mt.length>ht.length?(g.isBuffer(mt)||(mt=g.from(mt)),mt.copy(ht,ft)):Uint8Array.prototype.set.call(ht,mt,ft);else if(g.isBuffer(mt))mt.copy(ht,ft);else throw new TypeError('"list" argument must be an Array of Buffers');ft+=mt.length}return ht};function lt(nt,$){if(g.isBuffer(nt))return nt.length;if(ArrayBuffer.isView(nt)||$t(nt,ArrayBuffer))return nt.byteLength;if(typeof nt!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof nt);const et=nt.length,at=arguments.length>2&&arguments[2]===!0;if(!at&&et===0)return 0;let ht=!1;for(;;)switch($){case"ascii":case"latin1":case"binary":return et;case"utf8":case"utf-8":return Xt(nt).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return et*2;case"hex":return et>>>1;case"base64":return on(nt).length;default:if(ht)return at?-1:Xt(nt).length;$=(""+$).toLowerCase(),ht=!0}}g.byteLength=lt;function dt(nt,$,et){let at=!1;if(($===void 0||$<0)&&($=0),$>this.length||((et===void 0||et>this.length)&&(et=this.length),et<=0)||(et>>>=0,$>>>=0,et<=$))return"";for(nt||(nt="utf8");;)switch(nt){case"hex":return bt(this,$,et);case"utf8":case"utf-8":return Tt(this,$,et);case"ascii":return kt(this,$,et);case"latin1":case"binary":return vt(this,$,et);case"base64":return Ot(this,$,et);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Et(this,$,et);default:if(at)throw new TypeError("Unknown encoding: "+nt);nt=(nt+"").toLowerCase(),at=!0}}g.prototype._isBuffer=!0;function pt(nt,$,et){const at=nt[$];nt[$]=nt[et],nt[et]=at}g.prototype.swap16=function(){const $=this.length;if($%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let et=0;et<$;et+=2)pt(this,et,et+1);return this},g.prototype.swap32=function(){const $=this.length;if($%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let et=0;et<$;et+=4)pt(this,et,et+3),pt(this,et+1,et+2);return this},g.prototype.swap64=function(){const $=this.length;if($%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let et=0;et<$;et+=8)pt(this,et,et+7),pt(this,et+1,et+6),pt(this,et+2,et+5),pt(this,et+3,et+4);return this},g.prototype.toString=function(){const $=this.length;return $===0?"":arguments.length===0?Tt(this,0,$):dt.apply(this,arguments)},g.prototype.toLocaleString=g.prototype.toString,g.prototype.equals=function($){if(!g.isBuffer($))throw new TypeError("Argument must be a Buffer");return this===$?!0:g.compare(this,$)===0},g.prototype.inspect=function(){let $="";const et=e.INSPECT_MAX_BYTES;return $=this.toString("hex",0,et).replace(/(.{2})/g,"$1 ").trim(),this.length>et&&($+=" ... "),"<Buffer "+$+">"},s&&(g.prototype[s]=g.prototype.inspect),g.prototype.compare=function($,et,at,ht,ft){if($t($,Uint8Array)&&($=g.from($,$.offset,$.byteLength)),!g.isBuffer($))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof $);if(et===void 0&&(et=0),at===void 0&&(at=$?$.length:0),ht===void 0&&(ht=0),ft===void 0&&(ft=this.length),et<0||at>$.length||ht<0||ft>this.length)throw new RangeError("out of range index");if(ht>=ft&&et>=at)return 0;if(ht>=ft)return-1;if(et>=at)return 1;if(et>>>=0,at>>>=0,ht>>>=0,ft>>>=0,this===$)return 0;let mt=ft-ht,It=at-et;const Nt=Math.min(mt,It),_t=this.slice(ht,ft),Lt=$.slice(et,at);for(let At=0;At<Nt;++At)if(_t[At]!==Lt[At]){mt=_t[At],It=Lt[At];break}return mt<It?-1:It<mt?1:0};function gt(nt,$,et,at,ht){if(nt.length===0)return-1;if(typeof et=="string"?(at=et,et=0):et>2147483647?et=2147483647:et<-2147483648&&(et=-2147483648),et=+et,Qt(et)&&(et=ht?0:nt.length-1),et<0&&(et=nt.length+et),et>=nt.length){if(ht)return-1;et=nt.length-1}else if(et<0)if(ht)et=0;else return-1;if(typeof $=="string"&&($=g.from($,at)),g.isBuffer($))return $.length===0?-1:wt(nt,$,et,at,ht);if(typeof $=="number")return $=$&255,typeof Uint8Array.prototype.indexOf=="function"?ht?Uint8Array.prototype.indexOf.call(nt,$,et):Uint8Array.prototype.lastIndexOf.call(nt,$,et):wt(nt,[$],et,at,ht);throw new TypeError("val must be string, number or Buffer")}function wt(nt,$,et,at,ht){let ft=1,mt=nt.length,It=$.length;if(at!==void 0&&(at=String(at).toLowerCase(),at==="ucs2"||at==="ucs-2"||at==="utf16le"||at==="utf-16le")){if(nt.length<2||$.length<2)return-1;ft=2,mt/=2,It/=2,et/=2}function Nt(Lt,At){return ft===1?Lt[At]:Lt.readUInt16BE(At*ft)}let _t;if(ht){let Lt=-1;for(_t=et;_t<mt;_t++)if(Nt(nt,_t)===Nt($,Lt===-1?0:_t-Lt)){if(Lt===-1&&(Lt=_t),_t-Lt+1===It)return Lt*ft}else Lt!==-1&&(_t-=_t-Lt),Lt=-1}else for(et+It>mt&&(et=mt-It),_t=et;_t>=0;_t--){let Lt=!0;for(let At=0;At<It;At++)if(Nt(nt,_t+At)!==Nt($,At)){Lt=!1;break}if(Lt)return _t}return-1}g.prototype.includes=function($,et,at){return this.indexOf($,et,at)!==-1},g.prototype.indexOf=function($,et,at){return gt(this,$,et,at,!0)},g.prototype.lastIndexOf=function($,et,at){return gt(this,$,et,at,!1)};function yt(nt,$,et,at){et=Number(et)||0;const ht=nt.length-et;at?(at=Number(at),at>ht&&(at=ht)):at=ht;const ft=$.length;at>ft/2&&(at=ft/2);let mt;for(mt=0;mt<at;++mt){const It=parseInt($.substr(mt*2,2),16);if(Qt(It))return mt;nt[et+mt]=It}return mt}function St(nt,$,et,at){return qt(Xt($,nt.length-et),nt,et,at)}function xt(nt,$,et,at){return qt(un($),nt,et,at)}function Pt(nt,$,et,at){return qt(on($),nt,et,at)}function Bt(nt,$,et,at){return qt(cn($,nt.length-et),nt,et,at)}g.prototype.write=function($,et,at,ht){if(et===void 0)ht="utf8",at=this.length,et=0;else if(at===void 0&&typeof et=="string")ht=et,at=this.length,et=0;else if(isFinite(et))et=et>>>0,isFinite(at)?(at=at>>>0,ht===void 0&&(ht="utf8")):(ht=at,at=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const ft=this.length-et;if((at===void 0||at>ft)&&(at=ft),$.length>0&&(at<0||et<0)||et>this.length)throw new RangeError("Attempt to write outside buffer bounds");ht||(ht="utf8");let mt=!1;for(;;)switch(ht){case"hex":return yt(this,$,et,at);case"utf8":case"utf-8":return St(this,$,et,at);case"ascii":case"latin1":case"binary":return xt(this,$,et,at);case"base64":return Pt(this,$,et,at);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Bt(this,$,et,at);default:if(mt)throw new TypeError("Unknown encoding: "+ht);ht=(""+ht).toLowerCase(),mt=!0}},g.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function Ot(nt,$,et){return $===0&&et===nt.length?o.fromByteArray(nt):o.fromByteArray(nt.slice($,et))}function Tt(nt,$,et){et=Math.min(nt.length,et);const at=[];let ht=$;for(;ht<et;){const ft=nt[ht];let mt=null,It=ft>239?4:ft>223?3:ft>191?2:1;if(ht+It<=et){let Nt,_t,Lt,At;switch(It){case 1:ft<128&&(mt=ft);break;case 2:Nt=nt[ht+1],(Nt&192)===128&&(At=(ft&31)<<6|Nt&63,At>127&&(mt=At));break;case 3:Nt=nt[ht+1],_t=nt[ht+2],(Nt&192)===128&&(_t&192)===128&&(At=(ft&15)<<12|(Nt&63)<<6|_t&63,At>2047&&(At<55296||At>57343)&&(mt=At));break;case 4:Nt=nt[ht+1],_t=nt[ht+2],Lt=nt[ht+3],(Nt&192)===128&&(_t&192)===128&&(Lt&192)===128&&(At=(ft&15)<<18|(Nt&63)<<12|(_t&63)<<6|Lt&63,At>65535&&At<1114112&&(mt=At))}}mt===null?(mt=65533,It=1):mt>65535&&(mt-=65536,at.push(mt>>>10&1023|55296),mt=56320|mt&1023),at.push(mt),ht+=It}return Dt(at)}const Mt=4096;function Dt(nt){const $=nt.length;if($<=Mt)return String.fromCharCode.apply(String,nt);let et="",at=0;for(;at<$;)et+=String.fromCharCode.apply(String,nt.slice(at,at+=Mt));return et}function kt(nt,$,et){let at="";et=Math.min(nt.length,et);for(let ht=$;ht<et;++ht)at+=String.fromCharCode(nt[ht]&127);return at}function vt(nt,$,et){let at="";et=Math.min(nt.length,et);for(let ht=$;ht<et;++ht)at+=String.fromCharCode(nt[ht]);return at}function bt(nt,$,et){const at=nt.length;(!$||$<0)&&($=0),(!et||et<0||et>at)&&(et=at);let ht="";for(let ft=$;ft<et;++ft)ht+=hn[nt[ft]];return ht}function Et(nt,$,et){const at=nt.slice($,et);let ht="";for(let ft=0;ft<at.length-1;ft+=2)ht+=String.fromCharCode(at[ft]+at[ft+1]*256);return ht}g.prototype.slice=function($,et){const at=this.length;$=~~$,et=et===void 0?at:~~et,$<0?($+=at,$<0&&($=0)):$>at&&($=at),et<0?(et+=at,et<0&&(et=0)):et>at&&(et=at),et<$&&(et=$);const ht=this.subarray($,et);return Object.setPrototypeOf(ht,g.prototype),ht};function Ct(nt,$,et){if(nt%1!==0||nt<0)throw new RangeError("offset is not uint");if(nt+$>et)throw new RangeError("Trying to access beyond buffer length")}g.prototype.readUintLE=g.prototype.readUIntLE=function($,et,at){$=$>>>0,et=et>>>0,at||Ct($,et,this.length);let ht=this[$],ft=1,mt=0;for(;++mt<et&&(ft*=256);)ht+=this[$+mt]*ft;return ht},g.prototype.readUintBE=g.prototype.readUIntBE=function($,et,at){$=$>>>0,et=et>>>0,at||Ct($,et,this.length);let ht=this[$+--et],ft=1;for(;et>0&&(ft*=256);)ht+=this[$+--et]*ft;return ht},g.prototype.readUint8=g.prototype.readUInt8=function($,et){return $=$>>>0,et||Ct($,1,this.length),this[$]},g.prototype.readUint16LE=g.prototype.readUInt16LE=function($,et){return $=$>>>0,et||Ct($,2,this.length),this[$]|this[$+1]<<8},g.prototype.readUint16BE=g.prototype.readUInt16BE=function($,et){return $=$>>>0,et||Ct($,2,this.length),this[$]<<8|this[$+1]},g.prototype.readUint32LE=g.prototype.readUInt32LE=function($,et){return $=$>>>0,et||Ct($,4,this.length),(this[$]|this[$+1]<<8|this[$+2]<<16)+this[$+3]*16777216},g.prototype.readUint32BE=g.prototype.readUInt32BE=function($,et){return $=$>>>0,et||Ct($,4,this.length),this[$]*16777216+(this[$+1]<<16|this[$+2]<<8|this[$+3])},g.prototype.readBigUInt64LE=Vt(function($){$=$>>>0,Yt($,"offset");const et=this[$],at=this[$+7];(et===void 0||at===void 0)&&Kt($,this.length-8);const ht=et+this[++$]*2**8+this[++$]*2**16+this[++$]*2**24,ft=this[++$]+this[++$]*2**8+this[++$]*2**16+at*2**24;return BigInt(ht)+(BigInt(ft)<<BigInt(32))}),g.prototype.readBigUInt64BE=Vt(function($){$=$>>>0,Yt($,"offset");const et=this[$],at=this[$+7];(et===void 0||at===void 0)&&Kt($,this.length-8);const ht=et*2**24+this[++$]*2**16+this[++$]*2**8+this[++$],ft=this[++$]*2**24+this[++$]*2**16+this[++$]*2**8+at;return(BigInt(ht)<<BigInt(32))+BigInt(ft)}),g.prototype.readIntLE=function($,et,at){$=$>>>0,et=et>>>0,at||Ct($,et,this.length);let ht=this[$],ft=1,mt=0;for(;++mt<et&&(ft*=256);)ht+=this[$+mt]*ft;return ft*=128,ht>=ft&&(ht-=Math.pow(2,8*et)),ht},g.prototype.readIntBE=function($,et,at){$=$>>>0,et=et>>>0,at||Ct($,et,this.length);let ht=et,ft=1,mt=this[$+--ht];for(;ht>0&&(ft*=256);)mt+=this[$+--ht]*ft;return ft*=128,mt>=ft&&(mt-=Math.pow(2,8*et)),mt},g.prototype.readInt8=function($,et){return $=$>>>0,et||Ct($,1,this.length),this[$]&128?(255-this[$]+1)*-1:this[$]},g.prototype.readInt16LE=function($,et){$=$>>>0,et||Ct($,2,this.length);const at=this[$]|this[$+1]<<8;return at&32768?at|4294901760:at},g.prototype.readInt16BE=function($,et){$=$>>>0,et||Ct($,2,this.length);const at=this[$+1]|this[$]<<8;return at&32768?at|4294901760:at},g.prototype.readInt32LE=function($,et){return $=$>>>0,et||Ct($,4,this.length),this[$]|this[$+1]<<8|this[$+2]<<16|this[$+3]<<24},g.prototype.readInt32BE=function($,et){return $=$>>>0,et||Ct($,4,this.length),this[$]<<24|this[$+1]<<16|this[$+2]<<8|this[$+3]},g.prototype.readBigInt64LE=Vt(function($){$=$>>>0,Yt($,"offset");const et=this[$],at=this[$+7];(et===void 0||at===void 0)&&Kt($,this.length-8);const ht=this[$+4]+this[$+5]*2**8+this[$+6]*2**16+(at<<24);return(BigInt(ht)<<BigInt(32))+BigInt(et+this[++$]*2**8+this[++$]*2**16+this[++$]*2**24)}),g.prototype.readBigInt64BE=Vt(function($){$=$>>>0,Yt($,"offset");const et=this[$],at=this[$+7];(et===void 0||at===void 0)&&Kt($,this.length-8);const ht=(et<<24)+this[++$]*2**16+this[++$]*2**8+this[++$];return(BigInt(ht)<<BigInt(32))+BigInt(this[++$]*2**24+this[++$]*2**16+this[++$]*2**8+at)}),g.prototype.readFloatLE=function($,et){return $=$>>>0,et||Ct($,4,this.length),a.read(this,$,!0,23,4)},g.prototype.readFloatBE=function($,et){return $=$>>>0,et||Ct($,4,this.length),a.read(this,$,!1,23,4)},g.prototype.readDoubleLE=function($,et){return $=$>>>0,et||Ct($,8,this.length),a.read(this,$,!0,52,8)},g.prototype.readDoubleBE=function($,et){return $=$>>>0,et||Ct($,8,this.length),a.read(this,$,!1,52,8)};function jt(nt,$,et,at,ht,ft){if(!g.isBuffer(nt))throw new TypeError('"buffer" argument must be a Buffer instance');if($>ht||$<ft)throw new RangeError('"value" argument is out of bounds');if(et+at>nt.length)throw new RangeError("Index out of range")}g.prototype.writeUintLE=g.prototype.writeUIntLE=function($,et,at,ht){if($=+$,et=et>>>0,at=at>>>0,!ht){const It=Math.pow(2,8*at)-1;jt(this,$,et,at,It,0)}let ft=1,mt=0;for(this[et]=$&255;++mt<at&&(ft*=256);)this[et+mt]=$/ft&255;return et+at},g.prototype.writeUintBE=g.prototype.writeUIntBE=function($,et,at,ht){if($=+$,et=et>>>0,at=at>>>0,!ht){const It=Math.pow(2,8*at)-1;jt(this,$,et,at,It,0)}let ft=at-1,mt=1;for(this[et+ft]=$&255;--ft>=0&&(mt*=256);)this[et+ft]=$/mt&255;return et+at},g.prototype.writeUint8=g.prototype.writeUInt8=function($,et,at){return $=+$,et=et>>>0,at||jt(this,$,et,1,255,0),this[et]=$&255,et+1},g.prototype.writeUint16LE=g.prototype.writeUInt16LE=function($,et,at){return $=+$,et=et>>>0,at||jt(this,$,et,2,65535,0),this[et]=$&255,this[et+1]=$>>>8,et+2},g.prototype.writeUint16BE=g.prototype.writeUInt16BE=function($,et,at){return $=+$,et=et>>>0,at||jt(this,$,et,2,65535,0),this[et]=$>>>8,this[et+1]=$&255,et+2},g.prototype.writeUint32LE=g.prototype.writeUInt32LE=function($,et,at){return $=+$,et=et>>>0,at||jt(this,$,et,4,4294967295,0),this[et+3]=$>>>24,this[et+2]=$>>>16,this[et+1]=$>>>8,this[et]=$&255,et+4},g.prototype.writeUint32BE=g.prototype.writeUInt32BE=function($,et,at){return $=+$,et=et>>>0,at||jt(this,$,et,4,4294967295,0),this[et]=$>>>24,this[et+1]=$>>>16,this[et+2]=$>>>8,this[et+3]=$&255,et+4};function Ut(nt,$,et,at,ht){rn($,at,ht,nt,et,7);let ft=Number($&BigInt(4294967295));nt[et++]=ft,ft=ft>>8,nt[et++]=ft,ft=ft>>8,nt[et++]=ft,ft=ft>>8,nt[et++]=ft;let mt=Number($>>BigInt(32)&BigInt(4294967295));return nt[et++]=mt,mt=mt>>8,nt[et++]=mt,mt=mt>>8,nt[et++]=mt,mt=mt>>8,nt[et++]=mt,et}function zt(nt,$,et,at,ht){rn($,at,ht,nt,et,7);let ft=Number($&BigInt(4294967295));nt[et+7]=ft,ft=ft>>8,nt[et+6]=ft,ft=ft>>8,nt[et+5]=ft,ft=ft>>8,nt[et+4]=ft;let mt=Number($>>BigInt(32)&BigInt(4294967295));return nt[et+3]=mt,mt=mt>>8,nt[et+2]=mt,mt=mt>>8,nt[et+1]=mt,mt=mt>>8,nt[et]=mt,et+8}g.prototype.writeBigUInt64LE=Vt(function($,et=0){return Ut(this,$,et,BigInt(0),BigInt("0xffffffffffffffff"))}),g.prototype.writeBigUInt64BE=Vt(function($,et=0){return zt(this,$,et,BigInt(0),BigInt("0xffffffffffffffff"))}),g.prototype.writeIntLE=function($,et,at,ht){if($=+$,et=et>>>0,!ht){const Nt=Math.pow(2,8*at-1);jt(this,$,et,at,Nt-1,-Nt)}let ft=0,mt=1,It=0;for(this[et]=$&255;++ft<at&&(mt*=256);)$<0&&It===0&&this[et+ft-1]!==0&&(It=1),this[et+ft]=($/mt>>0)-It&255;return et+at},g.prototype.writeIntBE=function($,et,at,ht){if($=+$,et=et>>>0,!ht){const Nt=Math.pow(2,8*at-1);jt(this,$,et,at,Nt-1,-Nt)}let ft=at-1,mt=1,It=0;for(this[et+ft]=$&255;--ft>=0&&(mt*=256);)$<0&&It===0&&this[et+ft+1]!==0&&(It=1),this[et+ft]=($/mt>>0)-It&255;return et+at},g.prototype.writeInt8=function($,et,at){return $=+$,et=et>>>0,at||jt(this,$,et,1,127,-128),$<0&&($=255+$+1),this[et]=$&255,et+1},g.prototype.writeInt16LE=function($,et,at){return $=+$,et=et>>>0,at||jt(this,$,et,2,32767,-32768),this[et]=$&255,this[et+1]=$>>>8,et+2},g.prototype.writeInt16BE=function($,et,at){return $=+$,et=et>>>0,at||jt(this,$,et,2,32767,-32768),this[et]=$>>>8,this[et+1]=$&255,et+2},g.prototype.writeInt32LE=function($,et,at){return $=+$,et=et>>>0,at||jt(this,$,et,4,2147483647,-2147483648),this[et]=$&255,this[et+1]=$>>>8,this[et+2]=$>>>16,this[et+3]=$>>>24,et+4},g.prototype.writeInt32BE=function($,et,at){return $=+$,et=et>>>0,at||jt(this,$,et,4,2147483647,-2147483648),$<0&&($=4294967295+$+1),this[et]=$>>>24,this[et+1]=$>>>16,this[et+2]=$>>>8,this[et+3]=$&255,et+4},g.prototype.writeBigInt64LE=Vt(function($,et=0){return Ut(this,$,et,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),g.prototype.writeBigInt64BE=Vt(function($,et=0){return zt(this,$,et,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function Wt(nt,$,et,at,ht,ft){if(et+at>nt.length)throw new RangeError("Index out of range");if(et<0)throw new RangeError("Index out of range")}function Ft(nt,$,et,at,ht){return $=+$,et=et>>>0,ht||Wt(nt,$,et,4),a.write(nt,$,et,at,23,4),et+4}g.prototype.writeFloatLE=function($,et,at){return Ft(this,$,et,!0,at)},g.prototype.writeFloatBE=function($,et,at){return Ft(this,$,et,!1,at)};function Ht(nt,$,et,at,ht){return $=+$,et=et>>>0,ht||Wt(nt,$,et,8),a.write(nt,$,et,at,52,8),et+8}g.prototype.writeDoubleLE=function($,et,at){return Ht(this,$,et,!0,at)},g.prototype.writeDoubleBE=function($,et,at){return Ht(this,$,et,!1,at)},g.prototype.copy=function($,et,at,ht){if(!g.isBuffer($))throw new TypeError("argument should be a Buffer");if(at||(at=0),!ht&&ht!==0&&(ht=this.length),et>=$.length&&(et=$.length),et||(et=0),ht>0&&ht<at&&(ht=at),ht===at||$.length===0||this.length===0)return 0;if(et<0)throw new RangeError("targetStart out of bounds");if(at<0||at>=this.length)throw new RangeError("Index out of range");if(ht<0)throw new RangeError("sourceEnd out of bounds");ht>this.length&&(ht=this.length),$.length-et<ht-at&&(ht=$.length-et+at);const ft=ht-at;return this===$&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(et,at,ht):Uint8Array.prototype.set.call($,this.subarray(at,ht),et),ft},g.prototype.fill=function($,et,at,ht){if(typeof $=="string"){if(typeof et=="string"?(ht=et,et=0,at=this.length):typeof at=="string"&&(ht=at,at=this.length),ht!==void 0&&typeof ht!="string")throw new TypeError("encoding must be a string");if(typeof ht=="string"&&!g.isEncoding(ht))throw new TypeError("Unknown encoding: "+ht);if($.length===1){const mt=$.charCodeAt(0);(ht==="utf8"&&mt<128||ht==="latin1")&&($=mt)}}else typeof $=="number"?$=$&255:typeof $=="boolean"&&($=Number($));if(et<0||this.length<et||this.length<at)throw new RangeError("Out of range index");if(at<=et)return this;et=et>>>0,at=at===void 0?this.length:at>>>0,$||($=0);let ft;if(typeof $=="number")for(ft=et;ft<at;++ft)this[ft]=$;else{const mt=g.isBuffer($)?$:g.from($,ht),It=mt.length;if(It===0)throw new TypeError('The value "'+$+'" is invalid for argument "value"');for(ft=0;ft<at-et;++ft)this[ft+et]=mt[ft%It]}return this};const Gt={};function Jt(nt,$,et){Gt[nt]=class extends et{constructor(){super(),Object.defineProperty(this,"message",{value:$.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${nt}]`,this.stack,delete this.name}get code(){return nt}set code(ht){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:ht,writable:!0})}toString(){return`${this.name} [${nt}]: ${this.message}`}}}Jt("ERR_BUFFER_OUT_OF_BOUNDS",function(nt){return nt?`${nt} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),Jt("ERR_INVALID_ARG_TYPE",function(nt,$){return`The "${nt}" argument must be of type number. Received type ${typeof $}`},TypeError),Jt("ERR_OUT_OF_RANGE",function(nt,$,et){let at=`The value of "${nt}" is out of range.`,ht=et;return Number.isInteger(et)&&Math.abs(et)>2**32?ht=nn(String(et)):typeof et=="bigint"&&(ht=String(et),(et>BigInt(2)**BigInt(32)||et<-(BigInt(2)**BigInt(32)))&&(ht=nn(ht)),ht+="n"),at+=` It must be ${$}. Received ${ht}`,at},RangeError);function nn(nt){let $="",et=nt.length;const at=nt[0]==="-"?1:0;for(;et>=at+4;et-=3)$=`_${nt.slice(et-3,et)}${$}`;return`${nt.slice(0,et)}${$}`}function an(nt,$,et){Yt($,"offset"),(nt[$]===void 0||nt[$+et]===void 0)&&Kt($,nt.length-(et+1))}function rn(nt,$,et,at,ht,ft){if(nt>et||nt<$){const mt=typeof $=="bigint"?"n":"";let It;throw $===0||$===BigInt(0)?It=`>= 0${mt} and < 2${mt} ** ${(ft+1)*8}${mt}`:It=`>= -(2${mt} ** ${(ft+1)*8-1}${mt}) and < 2 ** ${(ft+1)*8-1}${mt}`,new Gt.ERR_OUT_OF_RANGE("value",It,nt)}an(at,ht,ft)}function Yt(nt,$){if(typeof nt!="number")throw new Gt.ERR_INVALID_ARG_TYPE($,"number",nt)}function Kt(nt,$,et){throw Math.floor(nt)!==nt?(Yt(nt,et),new Gt.ERR_OUT_OF_RANGE("offset","an integer",nt)):$<0?new Gt.ERR_BUFFER_OUT_OF_BOUNDS:new Gt.ERR_OUT_OF_RANGE("offset",`>= 0 and <= ${$}`,nt)}const sn=/[^+/0-9A-Za-z-_]/g;function ln(nt){if(nt=nt.split("=")[0],nt=nt.trim().replace(sn,""),nt.length<2)return"";for(;nt.length%4!==0;)nt=nt+"=";return nt}function Xt(nt,$){$=$||1/0;let et;const at=nt.length;let ht=null;const ft=[];for(let mt=0;mt<at;++mt){if(et=nt.charCodeAt(mt),et>55295&&et<57344){if(!ht){if(et>56319){($-=3)>-1&&ft.push(239,191,189);continue}else if(mt+1===at){($-=3)>-1&&ft.push(239,191,189);continue}ht=et;continue}if(et<56320){($-=3)>-1&&ft.push(239,191,189),ht=et;continue}et=(ht-55296<<10|et-56320)+65536}else ht&&($-=3)>-1&&ft.push(239,191,189);if(ht=null,et<128){if(($-=1)<0)break;ft.push(et)}else if(et<2048){if(($-=2)<0)break;ft.push(et>>6|192,et&63|128)}else if(et<65536){if(($-=3)<0)break;ft.push(et>>12|224,et>>6&63|128,et&63|128)}else if(et<1114112){if(($-=4)<0)break;ft.push(et>>18|240,et>>12&63|128,et>>6&63|128,et&63|128)}else throw new Error("Invalid code point")}return ft}function un(nt){const $=[];for(let et=0;et<nt.length;++et)$.push(nt.charCodeAt(et)&255);return $}function cn(nt,$){let et,at,ht;const ft=[];for(let mt=0;mt<nt.length&&!(($-=2)<0);++mt)et=nt.charCodeAt(mt),at=et>>8,ht=et%256,ft.push(ht),ft.push(at);return ft}function on(nt){return o.toByteArray(ln(nt))}function qt(nt,$,et,at){let ht;for(ht=0;ht<at&&!(ht+et>=$.length||ht>=nt.length);++ht)$[ht+et]=nt[ht];return ht}function $t(nt,$){return nt instanceof $||nt!=null&&nt.constructor!=null&&nt.constructor.name!=null&&nt.constructor.name===$.name}function Qt(nt){return nt!==nt}const hn=function(){const nt="0123456789abcdef",$=new Array(256);for(let et=0;et<16;++et){const at=et*16;for(let ht=0;ht<16;++ht)$[at+ht]=nt[et]+nt[ht]}return $}();function Vt(nt){return typeof BigInt>"u"?dn:nt}function dn(){throw new Error("BigInt not supported")}})(buffer);typeof globalThis.Buffer>"u"&&(globalThis.Buffer=buffer.Buffer);const __viteBrowserExternal={},__viteBrowserExternal$1=Object.freeze(Object.defineProperty({__proto__:null,default:__viteBrowserExternal},Symbol.toStringTag,{value:"Module"})),require$$0=getAugmentedNamespace(__viteBrowserExternal$1);var toString=Object.prototype.toString,kindOf=function(o){if(o===void 0)return"undefined";if(o===null)return"null";var a=typeof o;if(a==="boolean")return"boolean";if(a==="string")return"string";if(a==="number")return"number";if(a==="symbol")return"symbol";if(a==="function")return isGeneratorFn(o)?"generatorfunction":"function";if(isArray(o))return"array";if(isBuffer$1(o))return"buffer";if(isArguments(o))return"arguments";if(isDate(o))return"date";if(isError(o))return"error";if(isRegexp(o))return"regexp";switch(ctorName(o)){case"Symbol":return"symbol";case"Promise":return"promise";case"WeakMap":return"weakmap";case"WeakSet":return"weakset";case"Map":return"map";case"Set":return"set";case"Int8Array":return"int8array";case"Uint8Array":return"uint8array";case"Uint8ClampedArray":return"uint8clampedarray";case"Int16Array":return"int16array";case"Uint16Array":return"uint16array";case"Int32Array":return"int32array";case"Uint32Array":return"uint32array";case"Float32Array":return"float32array";case"Float64Array":return"float64array"}if(isGeneratorObj(o))return"generator";switch(a=toString.call(o),a){case"[object Object]":return"object";case"[object Map Iterator]":return"mapiterator";case"[object Set Iterator]":return"setiterator";case"[object String Iterator]":return"stringiterator";case"[object Array Iterator]":return"arrayiterator"}return a.slice(8,-1).toLowerCase().replace(/\s/g,"")};function ctorName(e){return typeof e.constructor=="function"?e.constructor.name:null}function isArray(e){return Array.isArray?Array.isArray(e):e instanceof Array}function isError(e){return e instanceof Error||typeof e.message=="string"&&e.constructor&&typeof e.constructor.stackTraceLimit=="number"}function isDate(e){return e instanceof Date?!0:typeof e.toDateString=="function"&&typeof e.getDate=="function"&&typeof e.setDate=="function"}function isRegexp(e){return e instanceof RegExp?!0:typeof e.flags=="string"&&typeof e.ignoreCase=="boolean"&&typeof e.multiline=="boolean"&&typeof e.global=="boolean"}function isGeneratorFn(e,o){return ctorName(e)==="GeneratorFunction"}function isGeneratorObj(e){return typeof e.throw=="function"&&typeof e.return=="function"&&typeof e.next=="function"}function isArguments(e){try{if(typeof e.length=="number"&&typeof e.callee=="function")return!0}catch(o){if(o.message.indexOf("callee")!==-1)return!0}return!1}function isBuffer$1(e){return e.constructor&&typeof e.constructor.isBuffer=="function"?e.constructor.isBuffer(e):!1}/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */var isExtendable=function(o){return typeof o<"u"&&o!==null&&(typeof o=="object"||typeof o=="function")},isObject$1=isExtendable,extendShallow=function(o){isObject$1(o)||(o={});for(var a=arguments.length,s=1;s<a;s++){var c=arguments[s];isObject$1(c)&&assign(o,c)}return o};function assign(e,o){for(var a in o)hasOwn(o,a)&&(e[a]=o[a])}function hasOwn(e,o){return Object.prototype.hasOwnProperty.call(e,o)}var typeOf$2=kindOf,extend$1=extendShallow,sectionMatter=function(e,o){typeof o=="function"&&(o={parse:o});var a=toObject(e),s={section_delimiter:"---",parse:identity},c=extend$1({},s,o),h=c.section_delimiter,d=a.content.split(/\r?\n/),g=null,b=createSection(),j=[],_=[];function _e(rt){a.content=rt,g=[],j=[]}function tt(rt){_.length&&(b.key=getKey(_[0],h),b.content=rt,c.parse(b,g),g.push(b),b=createSection(),j=[],_=[])}for(var it=0;it<d.length;it++){var st=d[it],ut=_.length,ct=st.trim();if(isDelimiter(ct,h)){if(ct.length===3&&it!==0){if(ut===0||ut===2){j.push(st);continue}_.push(ct),b.data=j.join(`
`),j=[];continue}g===null&&_e(j.join(`
`)),ut===2&&tt(j.join(`
`)),_.push(ct);continue}j.push(st)}return g===null?_e(j.join(`
`)):tt(j.join(`
`)),a.sections=g,a};function isDelimiter(e,o){return!(e.slice(0,o.length)!==o||e.charAt(o.length+1)===o.slice(-1))}function toObject(e){if(typeOf$2(e)!=="object"&&(e={content:e}),typeof e.content!="string"&&!isBuffer(e.content))throw new TypeError("expected a buffer or string");return e.content=e.content.toString(),e.sections=[],e}function getKey(e,o){return e?e.slice(o.length).trim():""}function createSection(){return{key:"",data:"",content:""}}function identity(e){return e}function isBuffer(e){return e&&e.constructor&&typeof e.constructor.isBuffer=="function"?e.constructor.isBuffer(e):!1}var engines$2={exports:{}},jsYaml$1={},loader$1={},common$6={};function isNothing(e){return typeof e>"u"||e===null}function isObject(e){return typeof e=="object"&&e!==null}function toArray(e){return Array.isArray(e)?e:isNothing(e)?[]:[e]}function extend(e,o){var a,s,c,h;if(o)for(h=Object.keys(o),a=0,s=h.length;a<s;a+=1)c=h[a],e[c]=o[c];return e}function repeat(e,o){var a="",s;for(s=0;s<o;s+=1)a+=e;return a}function isNegativeZero(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}common$6.isNothing=isNothing;common$6.isObject=isObject;common$6.toArray=toArray;common$6.repeat=repeat;common$6.isNegativeZero=isNegativeZero;common$6.extend=extend;function YAMLException$4(e,o){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=o,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}YAMLException$4.prototype=Object.create(Error.prototype);YAMLException$4.prototype.constructor=YAMLException$4;YAMLException$4.prototype.toString=function(o){var a=this.name+": ";return a+=this.reason||"(unknown reason)",!o&&this.mark&&(a+=" "+this.mark.toString()),a};var exception=YAMLException$4,common$5=common$6;function Mark$1(e,o,a,s,c){this.name=e,this.buffer=o,this.position=a,this.line=s,this.column=c}Mark$1.prototype.getSnippet=function(o,a){var s,c,h,d,g;if(!this.buffer)return null;for(o=o||4,a=a||75,s="",c=this.position;c>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(c-1))===-1;)if(c-=1,this.position-c>a/2-1){s=" ... ",c+=5;break}for(h="",d=this.position;d<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(d))===-1;)if(d+=1,d-this.position>a/2-1){h=" ... ",d-=5;break}return g=this.buffer.slice(c,d),common$5.repeat(" ",o)+s+g+h+`
`+common$5.repeat(" ",o+this.position-c+s.length)+"^"};Mark$1.prototype.toString=function(o){var a,s="";return this.name&&(s+='in "'+this.name+'" '),s+="at line "+(this.line+1)+", column "+(this.column+1),o||(a=this.getSnippet(),a&&(s+=`:
`+a)),s};var mark=Mark$1,YAMLException$3=exception,TYPE_CONSTRUCTOR_OPTIONS=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],YAML_NODE_KINDS=["scalar","sequence","mapping"];function compileStyleAliases(e){var o={};return e!==null&&Object.keys(e).forEach(function(a){e[a].forEach(function(s){o[String(s)]=a})}),o}function Type$h(e,o){if(o=o||{},Object.keys(o).forEach(function(a){if(TYPE_CONSTRUCTOR_OPTIONS.indexOf(a)===-1)throw new YAMLException$3('Unknown option "'+a+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=o.kind||null,this.resolve=o.resolve||function(){return!0},this.construct=o.construct||function(a){return a},this.instanceOf=o.instanceOf||null,this.predicate=o.predicate||null,this.represent=o.represent||null,this.defaultStyle=o.defaultStyle||null,this.styleAliases=compileStyleAliases(o.styleAliases||null),YAML_NODE_KINDS.indexOf(this.kind)===-1)throw new YAMLException$3('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var type=Type$h,common$4=common$6,YAMLException$2=exception,Type$g=type;function compileList(e,o,a){var s=[];return e.include.forEach(function(c){a=compileList(c,o,a)}),e[o].forEach(function(c){a.forEach(function(h,d){h.tag===c.tag&&h.kind===c.kind&&s.push(d)}),a.push(c)}),a.filter(function(c,h){return s.indexOf(h)===-1})}function compileMap(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},o,a;function s(c){e[c.kind][c.tag]=e.fallback[c.tag]=c}for(o=0,a=arguments.length;o<a;o+=1)arguments[o].forEach(s);return e}function Schema$5(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(o){if(o.loadKind&&o.loadKind!=="scalar")throw new YAMLException$2("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=compileList(this,"implicit",[]),this.compiledExplicit=compileList(this,"explicit",[]),this.compiledTypeMap=compileMap(this.compiledImplicit,this.compiledExplicit)}Schema$5.DEFAULT=null;Schema$5.create=function(){var o,a;switch(arguments.length){case 1:o=Schema$5.DEFAULT,a=arguments[0];break;case 2:o=arguments[0],a=arguments[1];break;default:throw new YAMLException$2("Wrong number of arguments for Schema.create function")}if(o=common$4.toArray(o),a=common$4.toArray(a),!o.every(function(s){return s instanceof Schema$5}))throw new YAMLException$2("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!a.every(function(s){return s instanceof Type$g}))throw new YAMLException$2("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new Schema$5({include:o,explicit:a})};var schema=Schema$5,Type$f=type,str=new Type$f("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),Type$e=type,seq=new Type$e("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Type$d=type,map=new Type$d("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Schema$4=schema,failsafe=new Schema$4({explicit:[str,seq,map]}),Type$c=type;function resolveYamlNull(e){if(e===null)return!0;var o=e.length;return o===1&&e==="~"||o===4&&(e==="null"||e==="Null"||e==="NULL")}function constructYamlNull(){return null}function isNull(e){return e===null}var _null=new Type$c("tag:yaml.org,2002:null",{kind:"scalar",resolve:resolveYamlNull,construct:constructYamlNull,predicate:isNull,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Type$b=type;function resolveYamlBoolean(e){if(e===null)return!1;var o=e.length;return o===4&&(e==="true"||e==="True"||e==="TRUE")||o===5&&(e==="false"||e==="False"||e==="FALSE")}function constructYamlBoolean(e){return e==="true"||e==="True"||e==="TRUE"}function isBoolean(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var bool=new Type$b("tag:yaml.org,2002:bool",{kind:"scalar",resolve:resolveYamlBoolean,construct:constructYamlBoolean,predicate:isBoolean,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),common$3=common$6,Type$a=type;function isHexCode(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function isOctCode(e){return 48<=e&&e<=55}function isDecCode(e){return 48<=e&&e<=57}function resolveYamlInteger(e){if(e===null)return!1;var o=e.length,a=0,s=!1,c;if(!o)return!1;if(c=e[a],(c==="-"||c==="+")&&(c=e[++a]),c==="0"){if(a+1===o)return!0;if(c=e[++a],c==="b"){for(a++;a<o;a++)if(c=e[a],c!=="_"){if(c!=="0"&&c!=="1")return!1;s=!0}return s&&c!=="_"}if(c==="x"){for(a++;a<o;a++)if(c=e[a],c!=="_"){if(!isHexCode(e.charCodeAt(a)))return!1;s=!0}return s&&c!=="_"}for(;a<o;a++)if(c=e[a],c!=="_"){if(!isOctCode(e.charCodeAt(a)))return!1;s=!0}return s&&c!=="_"}if(c==="_")return!1;for(;a<o;a++)if(c=e[a],c!=="_"){if(c===":")break;if(!isDecCode(e.charCodeAt(a)))return!1;s=!0}return!s||c==="_"?!1:c!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(a))}function constructYamlInteger(e){var o=e,a=1,s,c,h=[];return o.indexOf("_")!==-1&&(o=o.replace(/_/g,"")),s=o[0],(s==="-"||s==="+")&&(s==="-"&&(a=-1),o=o.slice(1),s=o[0]),o==="0"?0:s==="0"?o[1]==="b"?a*parseInt(o.slice(2),2):o[1]==="x"?a*parseInt(o,16):a*parseInt(o,8):o.indexOf(":")!==-1?(o.split(":").forEach(function(d){h.unshift(parseInt(d,10))}),o=0,c=1,h.forEach(function(d){o+=d*c,c*=60}),a*o):a*parseInt(o,10)}function isInteger(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!common$3.isNegativeZero(e)}var int=new Type$a("tag:yaml.org,2002:int",{kind:"scalar",resolve:resolveYamlInteger,construct:constructYamlInteger,predicate:isInteger,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),common$2=common$6,Type$9=type,YAML_FLOAT_PATTERN=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function resolveYamlFloat(e){return!(e===null||!YAML_FLOAT_PATTERN.test(e)||e[e.length-1]==="_")}function constructYamlFloat(e){var o,a,s,c;return o=e.replace(/_/g,"").toLowerCase(),a=o[0]==="-"?-1:1,c=[],"+-".indexOf(o[0])>=0&&(o=o.slice(1)),o===".inf"?a===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:o===".nan"?NaN:o.indexOf(":")>=0?(o.split(":").forEach(function(h){c.unshift(parseFloat(h,10))}),o=0,s=1,c.forEach(function(h){o+=h*s,s*=60}),a*o):a*parseFloat(o,10)}var SCIENTIFIC_WITHOUT_DOT=/^[-+]?[0-9]+e/;function representYamlFloat(e,o){var a;if(isNaN(e))switch(o){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(o){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(o){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(common$2.isNegativeZero(e))return"-0.0";return a=e.toString(10),SCIENTIFIC_WITHOUT_DOT.test(a)?a.replace("e",".e"):a}function isFloat(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||common$2.isNegativeZero(e))}var float=new Type$9("tag:yaml.org,2002:float",{kind:"scalar",resolve:resolveYamlFloat,construct:constructYamlFloat,predicate:isFloat,represent:representYamlFloat,defaultStyle:"lowercase"}),Schema$3=schema,json=new Schema$3({include:[failsafe],implicit:[_null,bool,int,float]}),Schema$2=schema,core=new Schema$2({include:[json]}),Type$8=type,YAML_DATE_REGEXP=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),YAML_TIMESTAMP_REGEXP=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function resolveYamlTimestamp(e){return e===null?!1:YAML_DATE_REGEXP.exec(e)!==null||YAML_TIMESTAMP_REGEXP.exec(e)!==null}function constructYamlTimestamp(e){var o,a,s,c,h,d,g,b=0,j=null,_,_e,tt;if(o=YAML_DATE_REGEXP.exec(e),o===null&&(o=YAML_TIMESTAMP_REGEXP.exec(e)),o===null)throw new Error("Date resolve error");if(a=+o[1],s=+o[2]-1,c=+o[3],!o[4])return new Date(Date.UTC(a,s,c));if(h=+o[4],d=+o[5],g=+o[6],o[7]){for(b=o[7].slice(0,3);b.length<3;)b+="0";b=+b}return o[9]&&(_=+o[10],_e=+(o[11]||0),j=(_*60+_e)*6e4,o[9]==="-"&&(j=-j)),tt=new Date(Date.UTC(a,s,c,h,d,g,b)),j&&tt.setTime(tt.getTime()-j),tt}function representYamlTimestamp(e){return e.toISOString()}var timestamp=new Type$8("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:resolveYamlTimestamp,construct:constructYamlTimestamp,instanceOf:Date,represent:representYamlTimestamp}),Type$7=type;function resolveYamlMerge(e){return e==="<<"||e===null}var merge=new Type$7("tag:yaml.org,2002:merge",{kind:"scalar",resolve:resolveYamlMerge});function commonjsRequire(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var NodeBuffer;try{var _require$1=commonjsRequire;NodeBuffer=_require$1("buffer").Buffer}catch{}var Type$6=type,BASE64_MAP=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function resolveYamlBinary(e){if(e===null)return!1;var o,a,s=0,c=e.length,h=BASE64_MAP;for(a=0;a<c;a++)if(o=h.indexOf(e.charAt(a)),!(o>64)){if(o<0)return!1;s+=6}return s%8===0}function constructYamlBinary(e){var o,a,s=e.replace(/[\r\n=]/g,""),c=s.length,h=BASE64_MAP,d=0,g=[];for(o=0;o<c;o++)o%4===0&&o&&(g.push(d>>16&255),g.push(d>>8&255),g.push(d&255)),d=d<<6|h.indexOf(s.charAt(o));return a=c%4*6,a===0?(g.push(d>>16&255),g.push(d>>8&255),g.push(d&255)):a===18?(g.push(d>>10&255),g.push(d>>2&255)):a===12&&g.push(d>>4&255),NodeBuffer?NodeBuffer.from?NodeBuffer.from(g):new NodeBuffer(g):g}function representYamlBinary(e){var o="",a=0,s,c,h=e.length,d=BASE64_MAP;for(s=0;s<h;s++)s%3===0&&s&&(o+=d[a>>18&63],o+=d[a>>12&63],o+=d[a>>6&63],o+=d[a&63]),a=(a<<8)+e[s];return c=h%3,c===0?(o+=d[a>>18&63],o+=d[a>>12&63],o+=d[a>>6&63],o+=d[a&63]):c===2?(o+=d[a>>10&63],o+=d[a>>4&63],o+=d[a<<2&63],o+=d[64]):c===1&&(o+=d[a>>2&63],o+=d[a<<4&63],o+=d[64],o+=d[64]),o}function isBinary(e){return NodeBuffer&&NodeBuffer.isBuffer(e)}var binary=new Type$6("tag:yaml.org,2002:binary",{kind:"scalar",resolve:resolveYamlBinary,construct:constructYamlBinary,predicate:isBinary,represent:representYamlBinary}),Type$5=type,_hasOwnProperty$3=Object.prototype.hasOwnProperty,_toString$2=Object.prototype.toString;function resolveYamlOmap(e){if(e===null)return!0;var o=[],a,s,c,h,d,g=e;for(a=0,s=g.length;a<s;a+=1){if(c=g[a],d=!1,_toString$2.call(c)!=="[object Object]")return!1;for(h in c)if(_hasOwnProperty$3.call(c,h))if(!d)d=!0;else return!1;if(!d)return!1;if(o.indexOf(h)===-1)o.push(h);else return!1}return!0}function constructYamlOmap(e){return e!==null?e:[]}var omap=new Type$5("tag:yaml.org,2002:omap",{kind:"sequence",resolve:resolveYamlOmap,construct:constructYamlOmap}),Type$4=type,_toString$1=Object.prototype.toString;function resolveYamlPairs(e){if(e===null)return!0;var o,a,s,c,h,d=e;for(h=new Array(d.length),o=0,a=d.length;o<a;o+=1){if(s=d[o],_toString$1.call(s)!=="[object Object]"||(c=Object.keys(s),c.length!==1))return!1;h[o]=[c[0],s[c[0]]]}return!0}function constructYamlPairs(e){if(e===null)return[];var o,a,s,c,h,d=e;for(h=new Array(d.length),o=0,a=d.length;o<a;o+=1)s=d[o],c=Object.keys(s),h[o]=[c[0],s[c[0]]];return h}var pairs=new Type$4("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:resolveYamlPairs,construct:constructYamlPairs}),Type$3=type,_hasOwnProperty$2=Object.prototype.hasOwnProperty;function resolveYamlSet(e){if(e===null)return!0;var o,a=e;for(o in a)if(_hasOwnProperty$2.call(a,o)&&a[o]!==null)return!1;return!0}function constructYamlSet(e){return e!==null?e:{}}var set=new Type$3("tag:yaml.org,2002:set",{kind:"mapping",resolve:resolveYamlSet,construct:constructYamlSet}),Schema$1=schema,default_safe=new Schema$1({include:[core],implicit:[timestamp,merge],explicit:[binary,omap,pairs,set]}),Type$2=type;function resolveJavascriptUndefined(){return!0}function constructJavascriptUndefined(){}function representJavascriptUndefined(){return""}function isUndefined(e){return typeof e>"u"}var _undefined=new Type$2("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:resolveJavascriptUndefined,construct:constructJavascriptUndefined,predicate:isUndefined,represent:representJavascriptUndefined}),Type$1=type;function resolveJavascriptRegExp(e){if(e===null||e.length===0)return!1;var o=e,a=/\/([gim]*)$/.exec(e),s="";return!(o[0]==="/"&&(a&&(s=a[1]),s.length>3||o[o.length-s.length-1]!=="/"))}function constructJavascriptRegExp(e){var o=e,a=/\/([gim]*)$/.exec(e),s="";return o[0]==="/"&&(a&&(s=a[1]),o=o.slice(1,o.length-s.length-1)),new RegExp(o,s)}function representJavascriptRegExp(e){var o="/"+e.source+"/";return e.global&&(o+="g"),e.multiline&&(o+="m"),e.ignoreCase&&(o+="i"),o}function isRegExp(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var regexp=new Type$1("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:resolveJavascriptRegExp,construct:constructJavascriptRegExp,predicate:isRegExp,represent:representJavascriptRegExp}),esprima;try{var _require=commonjsRequire;esprima=_require("esprima")}catch{typeof window<"u"&&(esprima=window.esprima)}var Type=type;function resolveJavascriptFunction(e){if(e===null)return!1;try{var o="("+e+")",a=esprima.parse(o,{range:!0});return!(a.type!=="Program"||a.body.length!==1||a.body[0].type!=="ExpressionStatement"||a.body[0].expression.type!=="ArrowFunctionExpression"&&a.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function constructJavascriptFunction(e){var o="("+e+")",a=esprima.parse(o,{range:!0}),s=[],c;if(a.type!=="Program"||a.body.length!==1||a.body[0].type!=="ExpressionStatement"||a.body[0].expression.type!=="ArrowFunctionExpression"&&a.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return a.body[0].expression.params.forEach(function(h){s.push(h.name)}),c=a.body[0].expression.body.range,a.body[0].expression.body.type==="BlockStatement"?new Function(s,o.slice(c[0]+1,c[1]-1)):new Function(s,"return "+o.slice(c[0],c[1]))}function representJavascriptFunction(e){return e.toString()}function isFunction(e){return Object.prototype.toString.call(e)==="[object Function]"}var _function=new Type("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:resolveJavascriptFunction,construct:constructJavascriptFunction,predicate:isFunction,represent:representJavascriptFunction}),Schema=schema,default_full=Schema.DEFAULT=new Schema({include:[default_safe],explicit:[_undefined,regexp,_function]}),common$1=common$6,YAMLException$1=exception,Mark=mark,DEFAULT_SAFE_SCHEMA$1=default_safe,DEFAULT_FULL_SCHEMA$1=default_full,_hasOwnProperty$1=Object.prototype.hasOwnProperty,CONTEXT_FLOW_IN=1,CONTEXT_FLOW_OUT=2,CONTEXT_BLOCK_IN=3,CONTEXT_BLOCK_OUT=4,CHOMPING_CLIP=1,CHOMPING_STRIP=2,CHOMPING_KEEP=3,PATTERN_NON_PRINTABLE=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,PATTERN_NON_ASCII_LINE_BREAKS=/[\x85\u2028\u2029]/,PATTERN_FLOW_INDICATORS=/[,\[\]\{\}]/,PATTERN_TAG_HANDLE=/^(?:!|!!|![a-z\-]+!)$/i,PATTERN_TAG_URI=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function _class(e){return Object.prototype.toString.call(e)}function is_EOL(e){return e===10||e===13}function is_WHITE_SPACE(e){return e===9||e===32}function is_WS_OR_EOL(e){return e===9||e===32||e===10||e===13}function is_FLOW_INDICATOR(e){return e===44||e===91||e===93||e===123||e===125}function fromHexCode(e){var o;return 48<=e&&e<=57?e-48:(o=e|32,97<=o&&o<=102?o-97+10:-1)}function escapedHexLen(e){return e===120?2:e===117?4:e===85?8:0}function fromDecimalCode(e){return 48<=e&&e<=57?e-48:-1}function simpleEscapeSequence(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function charFromCodepoint(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}var simpleEscapeCheck=new Array(256),simpleEscapeMap=new Array(256);for(var i=0;i<256;i++)simpleEscapeCheck[i]=simpleEscapeSequence(i)?1:0,simpleEscapeMap[i]=simpleEscapeSequence(i);function State$1(e,o){this.input=e,this.filename=o.filename||null,this.schema=o.schema||DEFAULT_FULL_SCHEMA$1,this.onWarning=o.onWarning||null,this.legacy=o.legacy||!1,this.json=o.json||!1,this.listener=o.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function generateError(e,o){return new YAMLException$1(o,new Mark(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function throwError(e,o){throw generateError(e,o)}function throwWarning(e,o){e.onWarning&&e.onWarning.call(null,generateError(e,o))}var directiveHandlers={YAML:function(o,a,s){var c,h,d;o.version!==null&&throwError(o,"duplication of %YAML directive"),s.length!==1&&throwError(o,"YAML directive accepts exactly one argument"),c=/^([0-9]+)\.([0-9]+)$/.exec(s[0]),c===null&&throwError(o,"ill-formed argument of the YAML directive"),h=parseInt(c[1],10),d=parseInt(c[2],10),h!==1&&throwError(o,"unacceptable YAML version of the document"),o.version=s[0],o.checkLineBreaks=d<2,d!==1&&d!==2&&throwWarning(o,"unsupported YAML version of the document")},TAG:function(o,a,s){var c,h;s.length!==2&&throwError(o,"TAG directive accepts exactly two arguments"),c=s[0],h=s[1],PATTERN_TAG_HANDLE.test(c)||throwError(o,"ill-formed tag handle (first argument) of the TAG directive"),_hasOwnProperty$1.call(o.tagMap,c)&&throwError(o,'there is a previously declared suffix for "'+c+'" tag handle'),PATTERN_TAG_URI.test(h)||throwError(o,"ill-formed tag prefix (second argument) of the TAG directive"),o.tagMap[c]=h}};function captureSegment(e,o,a,s){var c,h,d,g;if(o<a){if(g=e.input.slice(o,a),s)for(c=0,h=g.length;c<h;c+=1)d=g.charCodeAt(c),d===9||32<=d&&d<=1114111||throwError(e,"expected valid JSON character");else PATTERN_NON_PRINTABLE.test(g)&&throwError(e,"the stream contains non-printable characters");e.result+=g}}function mergeMappings(e,o,a,s){var c,h,d,g;for(common$1.isObject(a)||throwError(e,"cannot merge mappings; the provided source object is unacceptable"),c=Object.keys(a),d=0,g=c.length;d<g;d+=1)h=c[d],_hasOwnProperty$1.call(o,h)||(o[h]=a[h],s[h]=!0)}function storeMappingPair(e,o,a,s,c,h,d,g){var b,j;if(Array.isArray(c))for(c=Array.prototype.slice.call(c),b=0,j=c.length;b<j;b+=1)Array.isArray(c[b])&&throwError(e,"nested arrays are not supported inside keys"),typeof c=="object"&&_class(c[b])==="[object Object]"&&(c[b]="[object Object]");if(typeof c=="object"&&_class(c)==="[object Object]"&&(c="[object Object]"),c=String(c),o===null&&(o={}),s==="tag:yaml.org,2002:merge")if(Array.isArray(h))for(b=0,j=h.length;b<j;b+=1)mergeMappings(e,o,h[b],a);else mergeMappings(e,o,h,a);else!e.json&&!_hasOwnProperty$1.call(a,c)&&_hasOwnProperty$1.call(o,c)&&(e.line=d||e.line,e.position=g||e.position,throwError(e,"duplicated mapping key")),o[c]=h,delete a[c];return o}function readLineBreak(e){var o;o=e.input.charCodeAt(e.position),o===10?e.position++:o===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):throwError(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function skipSeparationSpace(e,o,a){for(var s=0,c=e.input.charCodeAt(e.position);c!==0;){for(;is_WHITE_SPACE(c);)c=e.input.charCodeAt(++e.position);if(o&&c===35)do c=e.input.charCodeAt(++e.position);while(c!==10&&c!==13&&c!==0);if(is_EOL(c))for(readLineBreak(e),c=e.input.charCodeAt(e.position),s++,e.lineIndent=0;c===32;)e.lineIndent++,c=e.input.charCodeAt(++e.position);else break}return a!==-1&&s!==0&&e.lineIndent<a&&throwWarning(e,"deficient indentation"),s}function testDocumentSeparator(e){var o=e.position,a;return a=e.input.charCodeAt(o),!!((a===45||a===46)&&a===e.input.charCodeAt(o+1)&&a===e.input.charCodeAt(o+2)&&(o+=3,a=e.input.charCodeAt(o),a===0||is_WS_OR_EOL(a)))}function writeFoldedLines(e,o){o===1?e.result+=" ":o>1&&(e.result+=common$1.repeat(`
`,o-1))}function readPlainScalar(e,o,a){var s,c,h,d,g,b,j,_,_e=e.kind,tt=e.result,it;if(it=e.input.charCodeAt(e.position),is_WS_OR_EOL(it)||is_FLOW_INDICATOR(it)||it===35||it===38||it===42||it===33||it===124||it===62||it===39||it===34||it===37||it===64||it===96||(it===63||it===45)&&(c=e.input.charCodeAt(e.position+1),is_WS_OR_EOL(c)||a&&is_FLOW_INDICATOR(c)))return!1;for(e.kind="scalar",e.result="",h=d=e.position,g=!1;it!==0;){if(it===58){if(c=e.input.charCodeAt(e.position+1),is_WS_OR_EOL(c)||a&&is_FLOW_INDICATOR(c))break}else if(it===35){if(s=e.input.charCodeAt(e.position-1),is_WS_OR_EOL(s))break}else{if(e.position===e.lineStart&&testDocumentSeparator(e)||a&&is_FLOW_INDICATOR(it))break;if(is_EOL(it))if(b=e.line,j=e.lineStart,_=e.lineIndent,skipSeparationSpace(e,!1,-1),e.lineIndent>=o){g=!0,it=e.input.charCodeAt(e.position);continue}else{e.position=d,e.line=b,e.lineStart=j,e.lineIndent=_;break}}g&&(captureSegment(e,h,d,!1),writeFoldedLines(e,e.line-b),h=d=e.position,g=!1),is_WHITE_SPACE(it)||(d=e.position+1),it=e.input.charCodeAt(++e.position)}return captureSegment(e,h,d,!1),e.result?!0:(e.kind=_e,e.result=tt,!1)}function readSingleQuotedScalar(e,o){var a,s,c;if(a=e.input.charCodeAt(e.position),a!==39)return!1;for(e.kind="scalar",e.result="",e.position++,s=c=e.position;(a=e.input.charCodeAt(e.position))!==0;)if(a===39)if(captureSegment(e,s,e.position,!0),a=e.input.charCodeAt(++e.position),a===39)s=e.position,e.position++,c=e.position;else return!0;else is_EOL(a)?(captureSegment(e,s,c,!0),writeFoldedLines(e,skipSeparationSpace(e,!1,o)),s=c=e.position):e.position===e.lineStart&&testDocumentSeparator(e)?throwError(e,"unexpected end of the document within a single quoted scalar"):(e.position++,c=e.position);throwError(e,"unexpected end of the stream within a single quoted scalar")}function readDoubleQuotedScalar(e,o){var a,s,c,h,d,g;if(g=e.input.charCodeAt(e.position),g!==34)return!1;for(e.kind="scalar",e.result="",e.position++,a=s=e.position;(g=e.input.charCodeAt(e.position))!==0;){if(g===34)return captureSegment(e,a,e.position,!0),e.position++,!0;if(g===92){if(captureSegment(e,a,e.position,!0),g=e.input.charCodeAt(++e.position),is_EOL(g))skipSeparationSpace(e,!1,o);else if(g<256&&simpleEscapeCheck[g])e.result+=simpleEscapeMap[g],e.position++;else if((d=escapedHexLen(g))>0){for(c=d,h=0;c>0;c--)g=e.input.charCodeAt(++e.position),(d=fromHexCode(g))>=0?h=(h<<4)+d:throwError(e,"expected hexadecimal character");e.result+=charFromCodepoint(h),e.position++}else throwError(e,"unknown escape sequence");a=s=e.position}else is_EOL(g)?(captureSegment(e,a,s,!0),writeFoldedLines(e,skipSeparationSpace(e,!1,o)),a=s=e.position):e.position===e.lineStart&&testDocumentSeparator(e)?throwError(e,"unexpected end of the document within a double quoted scalar"):(e.position++,s=e.position)}throwError(e,"unexpected end of the stream within a double quoted scalar")}function readFlowCollection(e,o){var a=!0,s,c=e.tag,h,d=e.anchor,g,b,j,_,_e,tt={},it,st,ut,ct;if(ct=e.input.charCodeAt(e.position),ct===91)b=93,_e=!1,h=[];else if(ct===123)b=125,_e=!0,h={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=h),ct=e.input.charCodeAt(++e.position);ct!==0;){if(skipSeparationSpace(e,!0,o),ct=e.input.charCodeAt(e.position),ct===b)return e.position++,e.tag=c,e.anchor=d,e.kind=_e?"mapping":"sequence",e.result=h,!0;a||throwError(e,"missed comma between flow collection entries"),st=it=ut=null,j=_=!1,ct===63&&(g=e.input.charCodeAt(e.position+1),is_WS_OR_EOL(g)&&(j=_=!0,e.position++,skipSeparationSpace(e,!0,o))),s=e.line,composeNode(e,o,CONTEXT_FLOW_IN,!1,!0),st=e.tag,it=e.result,skipSeparationSpace(e,!0,o),ct=e.input.charCodeAt(e.position),(_||e.line===s)&&ct===58&&(j=!0,ct=e.input.charCodeAt(++e.position),skipSeparationSpace(e,!0,o),composeNode(e,o,CONTEXT_FLOW_IN,!1,!0),ut=e.result),_e?storeMappingPair(e,h,tt,st,it,ut):j?h.push(storeMappingPair(e,null,tt,st,it,ut)):h.push(it),skipSeparationSpace(e,!0,o),ct=e.input.charCodeAt(e.position),ct===44?(a=!0,ct=e.input.charCodeAt(++e.position)):a=!1}throwError(e,"unexpected end of the stream within a flow collection")}function readBlockScalar(e,o){var a,s,c=CHOMPING_CLIP,h=!1,d=!1,g=o,b=0,j=!1,_,_e;if(_e=e.input.charCodeAt(e.position),_e===124)s=!1;else if(_e===62)s=!0;else return!1;for(e.kind="scalar",e.result="";_e!==0;)if(_e=e.input.charCodeAt(++e.position),_e===43||_e===45)CHOMPING_CLIP===c?c=_e===43?CHOMPING_KEEP:CHOMPING_STRIP:throwError(e,"repeat of a chomping mode identifier");else if((_=fromDecimalCode(_e))>=0)_===0?throwError(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):d?throwError(e,"repeat of an indentation width identifier"):(g=o+_-1,d=!0);else break;if(is_WHITE_SPACE(_e)){do _e=e.input.charCodeAt(++e.position);while(is_WHITE_SPACE(_e));if(_e===35)do _e=e.input.charCodeAt(++e.position);while(!is_EOL(_e)&&_e!==0)}for(;_e!==0;){for(readLineBreak(e),e.lineIndent=0,_e=e.input.charCodeAt(e.position);(!d||e.lineIndent<g)&&_e===32;)e.lineIndent++,_e=e.input.charCodeAt(++e.position);if(!d&&e.lineIndent>g&&(g=e.lineIndent),is_EOL(_e)){b++;continue}if(e.lineIndent<g){c===CHOMPING_KEEP?e.result+=common$1.repeat(`
`,h?1+b:b):c===CHOMPING_CLIP&&h&&(e.result+=`
`);break}for(s?is_WHITE_SPACE(_e)?(j=!0,e.result+=common$1.repeat(`
`,h?1+b:b)):j?(j=!1,e.result+=common$1.repeat(`
`,b+1)):b===0?h&&(e.result+=" "):e.result+=common$1.repeat(`
`,b):e.result+=common$1.repeat(`
`,h?1+b:b),h=!0,d=!0,b=0,a=e.position;!is_EOL(_e)&&_e!==0;)_e=e.input.charCodeAt(++e.position);captureSegment(e,a,e.position,!1)}return!0}function readBlockSequence(e,o){var a,s=e.tag,c=e.anchor,h=[],d,g=!1,b;for(e.anchor!==null&&(e.anchorMap[e.anchor]=h),b=e.input.charCodeAt(e.position);b!==0&&!(b!==45||(d=e.input.charCodeAt(e.position+1),!is_WS_OR_EOL(d)));){if(g=!0,e.position++,skipSeparationSpace(e,!0,-1)&&e.lineIndent<=o){h.push(null),b=e.input.charCodeAt(e.position);continue}if(a=e.line,composeNode(e,o,CONTEXT_BLOCK_IN,!1,!0),h.push(e.result),skipSeparationSpace(e,!0,-1),b=e.input.charCodeAt(e.position),(e.line===a||e.lineIndent>o)&&b!==0)throwError(e,"bad indentation of a sequence entry");else if(e.lineIndent<o)break}return g?(e.tag=s,e.anchor=c,e.kind="sequence",e.result=h,!0):!1}function readBlockMapping(e,o,a){var s,c,h,d,g=e.tag,b=e.anchor,j={},_={},_e=null,tt=null,it=null,st=!1,ut=!1,ct;for(e.anchor!==null&&(e.anchorMap[e.anchor]=j),ct=e.input.charCodeAt(e.position);ct!==0;){if(s=e.input.charCodeAt(e.position+1),h=e.line,d=e.position,(ct===63||ct===58)&&is_WS_OR_EOL(s))ct===63?(st&&(storeMappingPair(e,j,_,_e,tt,null),_e=tt=it=null),ut=!0,st=!0,c=!0):st?(st=!1,c=!0):throwError(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,ct=s;else if(composeNode(e,a,CONTEXT_FLOW_OUT,!1,!0))if(e.line===h){for(ct=e.input.charCodeAt(e.position);is_WHITE_SPACE(ct);)ct=e.input.charCodeAt(++e.position);if(ct===58)ct=e.input.charCodeAt(++e.position),is_WS_OR_EOL(ct)||throwError(e,"a whitespace character is expected after the key-value separator within a block mapping"),st&&(storeMappingPair(e,j,_,_e,tt,null),_e=tt=it=null),ut=!0,st=!1,c=!1,_e=e.tag,tt=e.result;else if(ut)throwError(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=g,e.anchor=b,!0}else if(ut)throwError(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=g,e.anchor=b,!0;else break;if((e.line===h||e.lineIndent>o)&&(composeNode(e,o,CONTEXT_BLOCK_OUT,!0,c)&&(st?tt=e.result:it=e.result),st||(storeMappingPair(e,j,_,_e,tt,it,h,d),_e=tt=it=null),skipSeparationSpace(e,!0,-1),ct=e.input.charCodeAt(e.position)),e.lineIndent>o&&ct!==0)throwError(e,"bad indentation of a mapping entry");else if(e.lineIndent<o)break}return st&&storeMappingPair(e,j,_,_e,tt,null),ut&&(e.tag=g,e.anchor=b,e.kind="mapping",e.result=j),ut}function readTagProperty(e){var o,a=!1,s=!1,c,h,d;if(d=e.input.charCodeAt(e.position),d!==33)return!1;if(e.tag!==null&&throwError(e,"duplication of a tag property"),d=e.input.charCodeAt(++e.position),d===60?(a=!0,d=e.input.charCodeAt(++e.position)):d===33?(s=!0,c="!!",d=e.input.charCodeAt(++e.position)):c="!",o=e.position,a){do d=e.input.charCodeAt(++e.position);while(d!==0&&d!==62);e.position<e.length?(h=e.input.slice(o,e.position),d=e.input.charCodeAt(++e.position)):throwError(e,"unexpected end of the stream within a verbatim tag")}else{for(;d!==0&&!is_WS_OR_EOL(d);)d===33&&(s?throwError(e,"tag suffix cannot contain exclamation marks"):(c=e.input.slice(o-1,e.position+1),PATTERN_TAG_HANDLE.test(c)||throwError(e,"named tag handle cannot contain such characters"),s=!0,o=e.position+1)),d=e.input.charCodeAt(++e.position);h=e.input.slice(o,e.position),PATTERN_FLOW_INDICATORS.test(h)&&throwError(e,"tag suffix cannot contain flow indicator characters")}return h&&!PATTERN_TAG_URI.test(h)&&throwError(e,"tag name cannot contain such characters: "+h),a?e.tag=h:_hasOwnProperty$1.call(e.tagMap,c)?e.tag=e.tagMap[c]+h:c==="!"?e.tag="!"+h:c==="!!"?e.tag="tag:yaml.org,2002:"+h:throwError(e,'undeclared tag handle "'+c+'"'),!0}function readAnchorProperty(e){var o,a;if(a=e.input.charCodeAt(e.position),a!==38)return!1;for(e.anchor!==null&&throwError(e,"duplication of an anchor property"),a=e.input.charCodeAt(++e.position),o=e.position;a!==0&&!is_WS_OR_EOL(a)&&!is_FLOW_INDICATOR(a);)a=e.input.charCodeAt(++e.position);return e.position===o&&throwError(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(o,e.position),!0}function readAlias(e){var o,a,s;if(s=e.input.charCodeAt(e.position),s!==42)return!1;for(s=e.input.charCodeAt(++e.position),o=e.position;s!==0&&!is_WS_OR_EOL(s)&&!is_FLOW_INDICATOR(s);)s=e.input.charCodeAt(++e.position);return e.position===o&&throwError(e,"name of an alias node must contain at least one character"),a=e.input.slice(o,e.position),_hasOwnProperty$1.call(e.anchorMap,a)||throwError(e,'unidentified alias "'+a+'"'),e.result=e.anchorMap[a],skipSeparationSpace(e,!0,-1),!0}function composeNode(e,o,a,s,c){var h,d,g,b=1,j=!1,_=!1,_e,tt,it,st,ut;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,h=d=g=CONTEXT_BLOCK_OUT===a||CONTEXT_BLOCK_IN===a,s&&skipSeparationSpace(e,!0,-1)&&(j=!0,e.lineIndent>o?b=1:e.lineIndent===o?b=0:e.lineIndent<o&&(b=-1)),b===1)for(;readTagProperty(e)||readAnchorProperty(e);)skipSeparationSpace(e,!0,-1)?(j=!0,g=h,e.lineIndent>o?b=1:e.lineIndent===o?b=0:e.lineIndent<o&&(b=-1)):g=!1;if(g&&(g=j||c),(b===1||CONTEXT_BLOCK_OUT===a)&&(CONTEXT_FLOW_IN===a||CONTEXT_FLOW_OUT===a?st=o:st=o+1,ut=e.position-e.lineStart,b===1?g&&(readBlockSequence(e,ut)||readBlockMapping(e,ut,st))||readFlowCollection(e,st)?_=!0:(d&&readBlockScalar(e,st)||readSingleQuotedScalar(e,st)||readDoubleQuotedScalar(e,st)?_=!0:readAlias(e)?(_=!0,(e.tag!==null||e.anchor!==null)&&throwError(e,"alias node should not have any properties")):readPlainScalar(e,st,CONTEXT_FLOW_IN===a)&&(_=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):b===0&&(_=g&&readBlockSequence(e,ut))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&throwError(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),_e=0,tt=e.implicitTypes.length;_e<tt;_e+=1)if(it=e.implicitTypes[_e],it.resolve(e.result)){e.result=it.construct(e.result),e.tag=it.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else _hasOwnProperty$1.call(e.typeMap[e.kind||"fallback"],e.tag)?(it=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&it.kind!==e.kind&&throwError(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+it.kind+'", not "'+e.kind+'"'),it.resolve(e.result)?(e.result=it.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):throwError(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):throwError(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||_}function readDocument(e){var o=e.position,a,s,c,h=!1,d;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(d=e.input.charCodeAt(e.position))!==0&&(skipSeparationSpace(e,!0,-1),d=e.input.charCodeAt(e.position),!(e.lineIndent>0||d!==37));){for(h=!0,d=e.input.charCodeAt(++e.position),a=e.position;d!==0&&!is_WS_OR_EOL(d);)d=e.input.charCodeAt(++e.position);for(s=e.input.slice(a,e.position),c=[],s.length<1&&throwError(e,"directive name must not be less than one character in length");d!==0;){for(;is_WHITE_SPACE(d);)d=e.input.charCodeAt(++e.position);if(d===35){do d=e.input.charCodeAt(++e.position);while(d!==0&&!is_EOL(d));break}if(is_EOL(d))break;for(a=e.position;d!==0&&!is_WS_OR_EOL(d);)d=e.input.charCodeAt(++e.position);c.push(e.input.slice(a,e.position))}d!==0&&readLineBreak(e),_hasOwnProperty$1.call(directiveHandlers,s)?directiveHandlers[s](e,s,c):throwWarning(e,'unknown document directive "'+s+'"')}if(skipSeparationSpace(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,skipSeparationSpace(e,!0,-1)):h&&throwError(e,"directives end mark is expected"),composeNode(e,e.lineIndent-1,CONTEXT_BLOCK_OUT,!1,!0),skipSeparationSpace(e,!0,-1),e.checkLineBreaks&&PATTERN_NON_ASCII_LINE_BREAKS.test(e.input.slice(o,e.position))&&throwWarning(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&testDocumentSeparator(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,skipSeparationSpace(e,!0,-1));return}if(e.position<e.length-1)throwError(e,"end of the stream or a document separator is expected");else return}function loadDocuments(e,o){e=String(e),o=o||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var a=new State$1(e,o),s=e.indexOf("\0");for(s!==-1&&(a.position=s,throwError(a,"null byte is not allowed in input")),a.input+="\0";a.input.charCodeAt(a.position)===32;)a.lineIndent+=1,a.position+=1;for(;a.position<a.length-1;)readDocument(a);return a.documents}function loadAll(e,o,a){o!==null&&typeof o=="object"&&typeof a>"u"&&(a=o,o=null);var s=loadDocuments(e,a);if(typeof o!="function")return s;for(var c=0,h=s.length;c<h;c+=1)o(s[c])}function load(e,o){var a=loadDocuments(e,o);if(a.length!==0){if(a.length===1)return a[0];throw new YAMLException$1("expected a single document in the stream, but found more")}}function safeLoadAll(e,o,a){return typeof o=="object"&&o!==null&&typeof a>"u"&&(a=o,o=null),loadAll(e,o,common$1.extend({schema:DEFAULT_SAFE_SCHEMA$1},a))}function safeLoad(e,o){return load(e,common$1.extend({schema:DEFAULT_SAFE_SCHEMA$1},o))}loader$1.loadAll=loadAll;loader$1.load=load;loader$1.safeLoadAll=safeLoadAll;loader$1.safeLoad=safeLoad;var dumper$1={},common=common$6,YAMLException=exception,DEFAULT_FULL_SCHEMA=default_full,DEFAULT_SAFE_SCHEMA=default_safe,_toString=Object.prototype.toString,_hasOwnProperty=Object.prototype.hasOwnProperty,CHAR_TAB=9,CHAR_LINE_FEED=10,CHAR_CARRIAGE_RETURN=13,CHAR_SPACE=32,CHAR_EXCLAMATION=33,CHAR_DOUBLE_QUOTE=34,CHAR_SHARP=35,CHAR_PERCENT=37,CHAR_AMPERSAND=38,CHAR_SINGLE_QUOTE=39,CHAR_ASTERISK=42,CHAR_COMMA=44,CHAR_MINUS=45,CHAR_COLON=58,CHAR_EQUALS=61,CHAR_GREATER_THAN=62,CHAR_QUESTION=63,CHAR_COMMERCIAL_AT=64,CHAR_LEFT_SQUARE_BRACKET=91,CHAR_RIGHT_SQUARE_BRACKET=93,CHAR_GRAVE_ACCENT=96,CHAR_LEFT_CURLY_BRACKET=123,CHAR_VERTICAL_LINE=124,CHAR_RIGHT_CURLY_BRACKET=125,ESCAPE_SEQUENCES={};ESCAPE_SEQUENCES[0]="\\0";ESCAPE_SEQUENCES[7]="\\a";ESCAPE_SEQUENCES[8]="\\b";ESCAPE_SEQUENCES[9]="\\t";ESCAPE_SEQUENCES[10]="\\n";ESCAPE_SEQUENCES[11]="\\v";ESCAPE_SEQUENCES[12]="\\f";ESCAPE_SEQUENCES[13]="\\r";ESCAPE_SEQUENCES[27]="\\e";ESCAPE_SEQUENCES[34]='\\"';ESCAPE_SEQUENCES[92]="\\\\";ESCAPE_SEQUENCES[133]="\\N";ESCAPE_SEQUENCES[160]="\\_";ESCAPE_SEQUENCES[8232]="\\L";ESCAPE_SEQUENCES[8233]="\\P";var DEPRECATED_BOOLEANS_SYNTAX=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function compileStyleMap(e,o){var a,s,c,h,d,g,b;if(o===null)return{};for(a={},s=Object.keys(o),c=0,h=s.length;c<h;c+=1)d=s[c],g=String(o[d]),d.slice(0,2)==="!!"&&(d="tag:yaml.org,2002:"+d.slice(2)),b=e.compiledTypeMap.fallback[d],b&&_hasOwnProperty.call(b.styleAliases,g)&&(g=b.styleAliases[g]),a[d]=g;return a}function encodeHex(e){var o,a,s;if(o=e.toString(16).toUpperCase(),e<=255)a="x",s=2;else if(e<=65535)a="u",s=4;else if(e<=4294967295)a="U",s=8;else throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+a+common.repeat("0",s-o.length)+o}function State(e){this.schema=e.schema||DEFAULT_FULL_SCHEMA,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=common.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=compileStyleMap(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function indentString(e,o){for(var a=common.repeat(" ",o),s=0,c=-1,h="",d,g=e.length;s<g;)c=e.indexOf(`
`,s),c===-1?(d=e.slice(s),s=g):(d=e.slice(s,c+1),s=c+1),d.length&&d!==`
`&&(h+=a),h+=d;return h}function generateNextLine(e,o){return`
`+common.repeat(" ",e.indent*o)}function testImplicitResolving(e,o){var a,s,c;for(a=0,s=e.implicitTypes.length;a<s;a+=1)if(c=e.implicitTypes[a],c.resolve(o))return!0;return!1}function isWhitespace(e){return e===CHAR_SPACE||e===CHAR_TAB}function isPrintable(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function isNsChar(e){return isPrintable(e)&&!isWhitespace(e)&&e!==65279&&e!==CHAR_CARRIAGE_RETURN&&e!==CHAR_LINE_FEED}function isPlainSafe(e,o){return isPrintable(e)&&e!==65279&&e!==CHAR_COMMA&&e!==CHAR_LEFT_SQUARE_BRACKET&&e!==CHAR_RIGHT_SQUARE_BRACKET&&e!==CHAR_LEFT_CURLY_BRACKET&&e!==CHAR_RIGHT_CURLY_BRACKET&&e!==CHAR_COLON&&(e!==CHAR_SHARP||o&&isNsChar(o))}function isPlainSafeFirst(e){return isPrintable(e)&&e!==65279&&!isWhitespace(e)&&e!==CHAR_MINUS&&e!==CHAR_QUESTION&&e!==CHAR_COLON&&e!==CHAR_COMMA&&e!==CHAR_LEFT_SQUARE_BRACKET&&e!==CHAR_RIGHT_SQUARE_BRACKET&&e!==CHAR_LEFT_CURLY_BRACKET&&e!==CHAR_RIGHT_CURLY_BRACKET&&e!==CHAR_SHARP&&e!==CHAR_AMPERSAND&&e!==CHAR_ASTERISK&&e!==CHAR_EXCLAMATION&&e!==CHAR_VERTICAL_LINE&&e!==CHAR_EQUALS&&e!==CHAR_GREATER_THAN&&e!==CHAR_SINGLE_QUOTE&&e!==CHAR_DOUBLE_QUOTE&&e!==CHAR_PERCENT&&e!==CHAR_COMMERCIAL_AT&&e!==CHAR_GRAVE_ACCENT}function needIndentIndicator(e){var o=/^\n* /;return o.test(e)}var STYLE_PLAIN=1,STYLE_SINGLE=2,STYLE_LITERAL=3,STYLE_FOLDED=4,STYLE_DOUBLE=5;function chooseScalarStyle(e,o,a,s,c){var h,d,g,b=!1,j=!1,_=s!==-1,_e=-1,tt=isPlainSafeFirst(e.charCodeAt(0))&&!isWhitespace(e.charCodeAt(e.length-1));if(o)for(h=0;h<e.length;h++){if(d=e.charCodeAt(h),!isPrintable(d))return STYLE_DOUBLE;g=h>0?e.charCodeAt(h-1):null,tt=tt&&isPlainSafe(d,g)}else{for(h=0;h<e.length;h++){if(d=e.charCodeAt(h),d===CHAR_LINE_FEED)b=!0,_&&(j=j||h-_e-1>s&&e[_e+1]!==" ",_e=h);else if(!isPrintable(d))return STYLE_DOUBLE;g=h>0?e.charCodeAt(h-1):null,tt=tt&&isPlainSafe(d,g)}j=j||_&&h-_e-1>s&&e[_e+1]!==" "}return!b&&!j?tt&&!c(e)?STYLE_PLAIN:STYLE_SINGLE:a>9&&needIndentIndicator(e)?STYLE_DOUBLE:j?STYLE_FOLDED:STYLE_LITERAL}function writeScalar(e,o,a,s){e.dump=function(){if(o.length===0)return"''";if(!e.noCompatMode&&DEPRECATED_BOOLEANS_SYNTAX.indexOf(o)!==-1)return"'"+o+"'";var c=e.indent*Math.max(1,a),h=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-c),d=s||e.flowLevel>-1&&a>=e.flowLevel;function g(b){return testImplicitResolving(e,b)}switch(chooseScalarStyle(o,d,e.indent,h,g)){case STYLE_PLAIN:return o;case STYLE_SINGLE:return"'"+o.replace(/'/g,"''")+"'";case STYLE_LITERAL:return"|"+blockHeader(o,e.indent)+dropEndingNewline(indentString(o,c));case STYLE_FOLDED:return">"+blockHeader(o,e.indent)+dropEndingNewline(indentString(foldString(o,h),c));case STYLE_DOUBLE:return'"'+escapeString(o)+'"';default:throw new YAMLException("impossible error: invalid scalar style")}}()}function blockHeader(e,o){var a=needIndentIndicator(e)?String(o):"",s=e[e.length-1]===`
`,c=s&&(e[e.length-2]===`
`||e===`
`),h=c?"+":s?"":"-";return a+h+`
`}function dropEndingNewline(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function foldString(e,o){for(var a=/(\n+)([^\n]*)/g,s=function(){var j=e.indexOf(`
`);return j=j!==-1?j:e.length,a.lastIndex=j,foldLine(e.slice(0,j),o)}(),c=e[0]===`
`||e[0]===" ",h,d;d=a.exec(e);){var g=d[1],b=d[2];h=b[0]===" ",s+=g+(!c&&!h&&b!==""?`
`:"")+foldLine(b,o),c=h}return s}function foldLine(e,o){if(e===""||e[0]===" ")return e;for(var a=/ [^ ]/g,s,c=0,h,d=0,g=0,b="";s=a.exec(e);)g=s.index,g-c>o&&(h=d>c?d:g,b+=`
`+e.slice(c,h),c=h+1),d=g;return b+=`
`,e.length-c>o&&d>c?b+=e.slice(c,d)+`
`+e.slice(d+1):b+=e.slice(c),b.slice(1)}function escapeString(e){for(var o="",a,s,c,h=0;h<e.length;h++){if(a=e.charCodeAt(h),a>=55296&&a<=56319&&(s=e.charCodeAt(h+1),s>=56320&&s<=57343)){o+=encodeHex((a-55296)*1024+s-56320+65536),h++;continue}c=ESCAPE_SEQUENCES[a],o+=!c&&isPrintable(a)?e[h]:c||encodeHex(a)}return o}function writeFlowSequence(e,o,a){var s="",c=e.tag,h,d;for(h=0,d=a.length;h<d;h+=1)writeNode(e,o,a[h],!1,!1)&&(h!==0&&(s+=","+(e.condenseFlow?"":" ")),s+=e.dump);e.tag=c,e.dump="["+s+"]"}function writeBlockSequence(e,o,a,s){var c="",h=e.tag,d,g;for(d=0,g=a.length;d<g;d+=1)writeNode(e,o+1,a[d],!0,!0)&&((!s||d!==0)&&(c+=generateNextLine(e,o)),e.dump&&CHAR_LINE_FEED===e.dump.charCodeAt(0)?c+="-":c+="- ",c+=e.dump);e.tag=h,e.dump=c||"[]"}function writeFlowMapping(e,o,a){var s="",c=e.tag,h=Object.keys(a),d,g,b,j,_;for(d=0,g=h.length;d<g;d+=1)_="",d!==0&&(_+=", "),e.condenseFlow&&(_+='"'),b=h[d],j=a[b],writeNode(e,o,b,!1,!1)&&(e.dump.length>1024&&(_+="? "),_+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),writeNode(e,o,j,!1,!1)&&(_+=e.dump,s+=_));e.tag=c,e.dump="{"+s+"}"}function writeBlockMapping(e,o,a,s){var c="",h=e.tag,d=Object.keys(a),g,b,j,_,_e,tt;if(e.sortKeys===!0)d.sort();else if(typeof e.sortKeys=="function")d.sort(e.sortKeys);else if(e.sortKeys)throw new YAMLException("sortKeys must be a boolean or a function");for(g=0,b=d.length;g<b;g+=1)tt="",(!s||g!==0)&&(tt+=generateNextLine(e,o)),j=d[g],_=a[j],writeNode(e,o+1,j,!0,!0,!0)&&(_e=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,_e&&(e.dump&&CHAR_LINE_FEED===e.dump.charCodeAt(0)?tt+="?":tt+="? "),tt+=e.dump,_e&&(tt+=generateNextLine(e,o)),writeNode(e,o+1,_,!0,_e)&&(e.dump&&CHAR_LINE_FEED===e.dump.charCodeAt(0)?tt+=":":tt+=": ",tt+=e.dump,c+=tt));e.tag=h,e.dump=c||"{}"}function detectType(e,o,a){var s,c,h,d,g,b;for(c=a?e.explicitTypes:e.implicitTypes,h=0,d=c.length;h<d;h+=1)if(g=c[h],(g.instanceOf||g.predicate)&&(!g.instanceOf||typeof o=="object"&&o instanceof g.instanceOf)&&(!g.predicate||g.predicate(o))){if(e.tag=a?g.tag:"?",g.represent){if(b=e.styleMap[g.tag]||g.defaultStyle,_toString.call(g.represent)==="[object Function]")s=g.represent(o,b);else if(_hasOwnProperty.call(g.represent,b))s=g.represent[b](o,b);else throw new YAMLException("!<"+g.tag+'> tag resolver accepts not "'+b+'" style');e.dump=s}return!0}return!1}function writeNode(e,o,a,s,c,h){e.tag=null,e.dump=a,detectType(e,a,!1)||detectType(e,a,!0);var d=_toString.call(e.dump);s&&(s=e.flowLevel<0||e.flowLevel>o);var g=d==="[object Object]"||d==="[object Array]",b,j;if(g&&(b=e.duplicates.indexOf(a),j=b!==-1),(e.tag!==null&&e.tag!=="?"||j||e.indent!==2&&o>0)&&(c=!1),j&&e.usedDuplicates[b])e.dump="*ref_"+b;else{if(g&&j&&!e.usedDuplicates[b]&&(e.usedDuplicates[b]=!0),d==="[object Object]")s&&Object.keys(e.dump).length!==0?(writeBlockMapping(e,o,e.dump,c),j&&(e.dump="&ref_"+b+e.dump)):(writeFlowMapping(e,o,e.dump),j&&(e.dump="&ref_"+b+" "+e.dump));else if(d==="[object Array]"){var _=e.noArrayIndent&&o>0?o-1:o;s&&e.dump.length!==0?(writeBlockSequence(e,_,e.dump,c),j&&(e.dump="&ref_"+b+e.dump)):(writeFlowSequence(e,_,e.dump),j&&(e.dump="&ref_"+b+" "+e.dump))}else if(d==="[object String]")e.tag!=="?"&&writeScalar(e,e.dump,o,h);else{if(e.skipInvalid)return!1;throw new YAMLException("unacceptable kind of an object to dump "+d)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function getDuplicateReferences(e,o){var a=[],s=[],c,h;for(inspectNode(e,a,s),c=0,h=s.length;c<h;c+=1)o.duplicates.push(a[s[c]]);o.usedDuplicates=new Array(h)}function inspectNode(e,o,a){var s,c,h;if(e!==null&&typeof e=="object")if(c=o.indexOf(e),c!==-1)a.indexOf(c)===-1&&a.push(c);else if(o.push(e),Array.isArray(e))for(c=0,h=e.length;c<h;c+=1)inspectNode(e[c],o,a);else for(s=Object.keys(e),c=0,h=s.length;c<h;c+=1)inspectNode(e[s[c]],o,a)}function dump(e,o){o=o||{};var a=new State(o);return a.noRefs||getDuplicateReferences(e,a),writeNode(a,0,e,!0,!0)?a.dump+`
`:""}function safeDump(e,o){return dump(e,common.extend({schema:DEFAULT_SAFE_SCHEMA},o))}dumper$1.dump=dump;dumper$1.safeDump=safeDump;var loader=loader$1,dumper=dumper$1;function deprecated(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}jsYaml$1.Type=type;jsYaml$1.Schema=schema;jsYaml$1.FAILSAFE_SCHEMA=failsafe;jsYaml$1.JSON_SCHEMA=json;jsYaml$1.CORE_SCHEMA=core;jsYaml$1.DEFAULT_SAFE_SCHEMA=default_safe;jsYaml$1.DEFAULT_FULL_SCHEMA=default_full;jsYaml$1.load=loader.load;jsYaml$1.loadAll=loader.loadAll;jsYaml$1.safeLoad=loader.safeLoad;jsYaml$1.safeLoadAll=loader.safeLoadAll;jsYaml$1.dump=dumper.dump;jsYaml$1.safeDump=dumper.safeDump;jsYaml$1.YAMLException=exception;jsYaml$1.MINIMAL_SCHEMA=failsafe;jsYaml$1.SAFE_SCHEMA=default_safe;jsYaml$1.DEFAULT_SCHEMA=default_full;jsYaml$1.scan=deprecated("scan");jsYaml$1.parse=deprecated("parse");jsYaml$1.compose=deprecated("compose");jsYaml$1.addConstructor=deprecated("addConstructor");var yaml=jsYaml$1,jsYaml=yaml;(function(module,exports){const yaml=jsYaml,engines=module.exports;engines.yaml={parse:yaml.safeLoad.bind(yaml),stringify:yaml.safeDump.bind(yaml)},engines.json={parse:JSON.parse.bind(JSON),stringify:function(e,o){const a=Object.assign({replacer:null,space:2},o);return JSON.stringify(e,a.replacer,a.space)}},engines.javascript={parse:function parse(str,options,wrap){try{return wrap!==!1&&(str=`(function() {
return `+str.trim()+`;
}());`),eval(str)||{}}catch(e){if(wrap!==!1&&/(unexpected|identifier)/i.test(e.message))return parse(str,options,!1);throw new SyntaxError(e)}},stringify:function(){throw new Error("stringifying JavaScript is not supported")}}})(engines$2);var enginesExports=engines$2.exports,utils$3={};/*!
 * strip-bom-string <https://github.com/jonschlinkert/strip-bom-string>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */var stripBomString=function(e){return typeof e=="string"&&e.charAt(0)==="\uFEFF"?e.slice(1):e};(function(e){const o=stripBomString,a=kindOf;e.define=function(s,c,h){Reflect.defineProperty(s,c,{enumerable:!1,configurable:!0,writable:!0,value:h})},e.isBuffer=function(s){return a(s)==="buffer"},e.isObject=function(s){return a(s)==="object"},e.toBuffer=function(s){return typeof s=="string"?Buffer.from(s):s},e.toString=function(s){if(e.isBuffer(s))return o(String(s));if(typeof s!="string")throw new TypeError("expected input to be a string or buffer");return o(s)},e.arrayify=function(s){return s?Array.isArray(s)?s:[s]:[]},e.startsWith=function(s,c,h){return typeof h!="number"&&(h=c.length),s.slice(0,h)===c}})(utils$3);const engines$1=enginesExports,utils$2=utils$3;var defaults$4=function(e){const o=Object.assign({},e);return o.delimiters=utils$2.arrayify(o.delims||o.delimiters||"---"),o.delimiters.length===1&&o.delimiters.push(o.delimiters[0]),o.language=(o.language||o.lang||"yaml").toLowerCase(),o.engines=Object.assign({},engines$1,o.parsers,o.engines),o},engine=function(e,o){let a=o.engines[e]||o.engines[aliase(e)];if(typeof a>"u")throw new Error('gray-matter engine "'+e+'" is not registered');return typeof a=="function"&&(a={parse:a}),a};function aliase(e){switch(e.toLowerCase()){case"js":case"javascript":return"javascript";case"coffee":case"coffeescript":case"cson":return"coffee";case"yaml":case"yml":return"yaml";default:return e}}const typeOf$1=kindOf,getEngine$1=engine,defaults$3=defaults$4;var stringify$2=function(e,o,a){if(o==null&&a==null)switch(typeOf$1(e)){case"object":o=e.data,a={};break;case"string":return e;default:throw new TypeError("expected file to be a string or object")}const s=e.content,c=defaults$3(a);if(o==null){if(!c.data)return e;o=c.data}const h=e.language||c.language,d=getEngine$1(h,c);if(typeof d.stringify!="function")throw new TypeError('expected "'+h+'.stringify" to be a function');o=Object.assign({},e.data,o);const g=c.delimiters[0],b=c.delimiters[1],j=d.stringify(o,a).trim();let _="";return j!=="{}"&&(_=newline$1(g)+newline$1(j)+newline$1(b)),typeof e.excerpt=="string"&&e.excerpt!==""&&s.indexOf(e.excerpt.trim())===-1&&(_+=newline$1(e.excerpt)+newline$1(b)),_+newline$1(s)};function newline$1(e){return e.slice(-1)!==`
`?e+`
`:e}const defaults$2=defaults$4;var excerpt$1=function(e,o){const a=defaults$2(o);if(e.data==null&&(e.data={}),typeof a.excerpt=="function")return a.excerpt(e,a);const s=e.data.excerpt_separator||a.excerpt_separator;if(s==null&&(a.excerpt===!1||a.excerpt==null))return e;const c=typeof a.excerpt=="string"?a.excerpt:s||a.delimiters[0],h=e.content.indexOf(c);return h!==-1&&(e.excerpt=e.content.slice(0,h)),e};const typeOf=kindOf,stringify$1=stringify$2,utils$1=utils$3;var toFile$1=function(e){return typeOf(e)!=="object"&&(e={content:e}),typeOf(e.data)!=="object"&&(e.data={}),e.contents&&e.content==null&&(e.content=e.contents),utils$1.define(e,"orig",utils$1.toBuffer(e.content)),utils$1.define(e,"language",e.language||""),utils$1.define(e,"matter",e.matter||""),utils$1.define(e,"stringify",function(o,a){return a&&a.language&&(e.language=a.language),stringify$1(e,o,a)}),e.content=utils$1.toString(e.content),e.isEmpty=!1,e.excerpt="",e};const getEngine=engine,defaults$1=defaults$4;var parse$1=function(e,o,a){const s=defaults$1(a),c=getEngine(e,s);if(typeof c.parse!="function")throw new TypeError('expected "'+e+'.parse" to be a function');return c.parse(o,s)};const fs=require$$0,sections=sectionMatter,defaults=defaults$4,stringify=stringify$2,excerpt=excerpt$1,engines=enginesExports,toFile=toFile$1,parse=parse$1,utils=utils$3;function matter(e,o){if(e==="")return{data:{},content:e,excerpt:"",orig:e};let a=toFile(e);const s=matter.cache[a.content];if(!o){if(s)return a=Object.assign({},s),a.orig=s.orig,a;matter.cache[a.content]=a}return parseMatter(a,o)}function parseMatter(e,o){const a=defaults(o),s=a.delimiters[0],c=`
`+a.delimiters[1];let h=e.content;a.language&&(e.language=a.language);const d=s.length;if(!utils.startsWith(h,s,d))return excerpt(e,a),e;if(h.charAt(d)===s.slice(-1))return e;h=h.slice(d);const g=h.length,b=matter.language(h,a);b.name&&(e.language=b.name,h=h.slice(b.raw.length));let j=h.indexOf(c);return j===-1&&(j=g),e.matter=h.slice(0,j),e.matter.replace(/^\s*#[^\n]+/gm,"").trim()===""?(e.isEmpty=!0,e.empty=e.content,e.data={}):e.data=parse(e.language,e.matter,a),j===g?e.content="":(e.content=h.slice(j+c.length),e.content[0]==="\r"&&(e.content=e.content.slice(1)),e.content[0]===`
`&&(e.content=e.content.slice(1))),excerpt(e,a),(a.sections===!0||typeof a.section=="function")&&sections(e,a.section),e}matter.engines=engines;matter.stringify=function(e,o,a){return typeof e=="string"&&(e=matter(e,a)),stringify(e,o,a)};matter.read=function(e,o){const a=fs.readFileSync(e,"utf8"),s=matter(a,o);return s.path=e,s};matter.test=function(e,o){return utils.startsWith(e,defaults(o).delimiters[0])};matter.language=function(e,o){const s=defaults(o).delimiters[0];matter.test(e)&&(e=e.slice(s.length));const c=e.slice(0,e.search(/\r?\n/));return{raw:c,name:c?c.trim():""}};matter.cache={};matter.clearCache=function(){matter.cache={}};var grayMatter=matter;const matter$1=getDefaultExportFromCjs(grayMatter),sanitizeTitleForId=e=>e.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"").replace(/-+/g,"-"),generateExcerpt=(e,o=20)=>{if(!e||typeof e!="string")return"";const a=e.replace(/#{1,6}\s+/g,"").replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/`(.*?)`/g,"$1").replace(/\[(.*?)\]\(.*?\)/g,"$1").replace(/!\[.*?\]\(.*?\)/g,"").replace(/\n+/g," ").trim();if(/[\u4e00-\u9fff]/.test(a)){const c=o*2;return a.length<=c?a:a.substring(0,c)+"..."}else{const c=a.split(/\s+/).filter(h=>h.length>0);return c.length<=o?a:c.slice(0,o).join(" ")+"..."}},markdownFiles=Object.assign({"/src/markdown/posts/2015-04-12_复活随笔.md":__vite_glob_0_0,"/src/markdown/posts/2015-05-09_到南方去.md":__vite_glob_0_1,"/src/markdown/posts/2015-05-17_巴黎的呼吸.md":__vite_glob_0_2,"/src/markdown/posts/2015-06-13_为什么是阿赫兰.md":__vite_glob_0_3,"/src/markdown/posts/2016-08-10_片道东瀛.md":__vite_glob_0_4,"/src/markdown/posts/2017-05-01_巡礼之年.md":__vite_glob_0_5,"/src/markdown/posts/2017-12-02_社会人.md":__vite_glob_0_6,"/src/markdown/posts/2018-03-15_流与逆流.md":__vite_glob_0_7,"/src/markdown/posts/2018-10-20_纽约层积.md":__vite_glob_0_8,"/src/markdown/posts/2018-12-28_加州打卡.md":__vite_glob_0_9,"/src/markdown/posts/2019-01-09_他和他的猫.md":__vite_glob_0_10,"/src/markdown/posts/2019-12-02_被许诺和被荒芜的.md":__vite_glob_0_11,"/src/markdown/posts/2019-12-29_救赎山.md":__vite_glob_0_12,"/src/markdown/posts/2021-11-28_我们生活的故事01.md":__vite_glob_0_13,"/src/markdown/posts/2022-11-27_我们生活的故事02.md":__vite_glob_0_14,"/src/markdown/posts/2023-05-27_三城记.md":__vite_glob_0_15,"/src/markdown/posts/2023-12-28_我们生活的故事03.md":__vite_glob_0_16,"/src/markdown/posts/2024-04-23_香港森林.md":__vite_glob_0_17,"/src/markdown/posts/2024-10-23_那些看似无辜的.md":__vite_glob_0_18,"/src/markdown/posts/2024-12-18_我们生活的故事04.md":__vite_glob_0_19,"/src/markdown/posts/2025-03-23_夏威夷没有愤怒.md":__vite_glob_0_20}),processedPosts=Object.entries(markdownFiles).map(([e,o])=>{var a;try{const{data:s,content:c}=matter$1(o),d=["title","coverImage","date","tags"].filter(rt=>!(rt in s));if(d.length>0)return console.error(`Error: Missing frontmatter field(s) "${d.join(", ")}" in file ${e}. Skipping post.`),null;const g=s;if(!g.title||typeof g.title!="string")return console.error(`Error: Invalid or missing 'title' in file ${e}. Skipping post.`),null;if(!g.date||typeof g.date!="string")return console.error(`Error: Invalid or missing 'date' in file ${e}. Skipping post.`),null;if(!g.coverImage||typeof g.coverImage!="string")return console.error(`Error: Invalid or missing 'coverImage' in file ${e}. Skipping post.`),null;if(!g.tags||!Array.isArray(g.tags)||!g.tags.every(rt=>typeof rt=="string"))return console.error(`Error: Invalid or missing 'tags' in file ${e}. Skipping post.`),null;const b=c.split("---zh---"),j=b[0].trim(),_=((a=b[1])==null?void 0:a.trim())||null,_e=g.excerpt&&typeof g.excerpt=="string"&&g.excerpt.trim()?g.excerpt:generateExcerpt(j),tt=g.excerpt_zh&&typeof g.excerpt_zh=="string"&&g.excerpt_zh.trim()?g.excerpt_zh:_?generateExcerpt(_):void 0,it=g.languages&&g.languages.length>1,st=`${g.date}_${sanitizeTitleForId(g.title)}`,ut=j.split(/\s+/).length,ct=Math.ceil(ut/200);return{id:st,title:g.title,subtitle:g.subtitle,excerpt:_e,content:j,coverImage:g.coverImage,date:g.date,tags:g.tags,readingTime:ct,isMultilingual:it,title_zh:g.title_zh,subtitle_zh:g.subtitle_zh,excerpt_zh:tt,content_zh:_,tags_zh:g.tags_zh,languages:g.languages}}catch(s){return console.error(`Error processing file ${e}:`,s),null}}).filter(e=>e!==null);processedPosts.sort((e,o)=>new Date(o.date).getTime()-new Date(e.date).getTime());const postsWithReadingTime=processedPosts,getUniqueYears=()=>{const e=processedPosts.reduce((d,g)=>{const b=new Date(g.date).getFullYear().toString();return d[b]=(d[b]||0)+1,d},{});if(Object.keys(e).length===0)return[{id:"all",name:"All Years",count:0}];const o=new Date().getFullYear(),a=Object.keys(e).map(d=>parseInt(d)).sort((d,g)=>g-d),s=a.filter(d=>d>=o-2),c=a.filter(d=>d<o-2),h=[{id:"all",name:"All Years",count:processedPosts.length}];if(s.forEach(d=>{h.push({id:d.toString(),name:d.toString(),count:e[d.toString()]})}),c.length>0){const d=Math.min(...c),g=Math.max(...c),b=c.reduce((j,_)=>j+e[_.toString()],0);d===g?h.push({id:d.toString(),name:d.toString(),count:e[d.toString()]}):h.push({id:"older",name:`${d}-${g}`,count:b})}return h};getUniqueYears();const FeaturedPosts=()=>{const e=[...postsWithReadingTime].sort((o,a)=>new Date(a.date).getTime()-new Date(o.date).getTime()).slice(0,3);return jsxRuntimeExports.jsx("section",{className:"py-12 bg-white dark:bg-slate-900",children:jsxRuntimeExports.jsxs("div",{className:"container-custom",children:[jsxRuntimeExports.jsxs("div",{className:"flex justify-between items-baseline mb-12",children:[jsxRuntimeExports.jsx(motion.h2,{initial:{opacity:0,x:-20},whileInView:{opacity:1,x:0},viewport:{once:!0},transition:{duration:.5},children:"Recent Articles"}),jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,x:20},whileInView:{opacity:1,x:0},viewport:{once:!0},transition:{duration:.5,delay:.2},children:jsxRuntimeExports.jsxs(Link,{to:"/blog",className:"group flex items-center text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 font-medium hover:no-underline",children:["Read All Posts",jsxRuntimeExports.jsx(ArrowRight,{className:"ml-1 transition-transform group-hover:translate-x-1",size:18})]})})]}),jsxRuntimeExports.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",children:e.map((o,a)=>jsxRuntimeExports.jsxs(motion.article,{initial:{opacity:0,y:30},whileInView:{opacity:1,y:0},viewport:{once:!0,margin:"-100px"},transition:{duration:.6,delay:a*.1},className:"card group h-full flex flex-col",children:[jsxRuntimeExports.jsx("div",{className:"aspect-[16/9] overflow-hidden rounded-t-lg",children:jsxRuntimeExports.jsx("img",{src:o.coverImage,alt:o.title,className:`w-full h-full object-cover transition-transform duration-700 ease-out scale-110
                            group-hover:scale-125`})}),jsxRuntimeExports.jsxs("div",{className:"p-6 flex-grow flex flex-col",children:[jsxRuntimeExports.jsxs("div",{className:"flex flex-wrap gap-2 mb-3",children:[o.tags.slice(0,2).map(s=>jsxRuntimeExports.jsx("span",{className:"tag",children:s},s)),o.tags_zh&&o.tags_zh.slice(0,2).map(s=>jsxRuntimeExports.jsx("span",{className:"tag",children:s},s))]}),o.isMultilingual&&o.title_zh&&jsxRuntimeExports.jsxs("div",{className:"mb-3",children:[jsxRuntimeExports.jsx("h3",{className:"text-xl font-bold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors",children:o.title_zh}),o.subtitle_zh&&jsxRuntimeExports.jsx("p",{className:"text-base text-slate-600 dark:text-slate-400 mb-2 italic",children:o.subtitle_zh}),o.excerpt_zh&&jsxRuntimeExports.jsx("p",{className:"text-slate-600 dark:text-slate-400 text-sm",children:o.excerpt_zh})]}),jsxRuntimeExports.jsxs("div",{className:`mb-3 ${o.isMultilingual&&o.title_zh?"border-l-2 border-slate-200 dark:border-slate-700 pl-3":""}`,children:[jsxRuntimeExports.jsx("h4",{className:`${o.isMultilingual&&o.title_zh?"text-lg text-slate-700 dark:text-slate-300":"text-xl"} font-bold mb-2 ${o.isMultilingual&&o.title_zh?"":"group-hover:text-primary-600 dark:group-hover:text-primary-400"} transition-colors`,children:o.title}),o.subtitle&&jsxRuntimeExports.jsx("p",{className:`${o.isMultilingual&&o.title_zh?"text-sm text-slate-500 dark:text-slate-500":"text-base text-slate-600 dark:text-slate-400"} mb-2 italic`,children:o.subtitle}),jsxRuntimeExports.jsx("p",{className:`${o.isMultilingual&&o.title_zh?"text-slate-500 dark:text-slate-500":"text-slate-600 dark:text-slate-400"} text-sm`,children:o.excerpt})]}),jsxRuntimeExports.jsxs("div",{className:"mt-auto flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700",children:[jsxRuntimeExports.jsx("time",{dateTime:o.date,children:new Date(o.date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}),jsxRuntimeExports.jsxs("div",{className:"flex items-center",children:[jsxRuntimeExports.jsx(Clock,{size:14,className:"mr-1"}),jsxRuntimeExports.jsxs("span",{children:[o.readingTime," min read"]})]})]}),jsxRuntimeExports.jsxs("div",{className:"mt-4 flex flex-wrap gap-2",children:[o.isMultilingual&&o.content_zh&&jsxRuntimeExports.jsxs(Link,{to:`/blog/${o.id}?lang=zh`,className:"text-primary-600 dark:text-primary-300 font-medium hover:text-primary-800 dark:hover:text-primary-100 flex items-center group text-sm",children:["阅读全文",jsxRuntimeExports.jsx(ArrowRight,{className:"ml-1 transition-transform group-hover:translate-x-1",size:14})]}),jsxRuntimeExports.jsxs(Link,{to:`/blog/${o.id}`,className:`${o.isMultilingual&&o.content_zh?"text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-200":"text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100"} font-medium flex items-center group text-sm`,children:["Read More",jsxRuntimeExports.jsx(ArrowRight,{className:"ml-1 transition-transform group-hover:translate-x-1",size:14})]})]})]})]},o.id))})]})})},HomePage=()=>{const[e,o]=reactExports.useState(!1),[a,s]=reactExports.useState(!1),[c,h]=reactExports.useState(!1),[d,g]=reactExports.useState(!1);reactExports.useEffect(()=>{sessionStorage.getItem("hasVisitedHome")?(o(!0),s(!1),g(!0)):(o(!1),s(!1),g(!1)),h(!0)},[]),reactExports.useEffect(()=>(e?document.body.classList.remove("hide-footer"):document.body.classList.add("hide-footer"),()=>{document.body.classList.remove("hide-footer")}),[e]);const b=()=>{o(!0),s(!0),g(!1),sessionStorage.setItem("hasVisitedHome","true")};return c?e?jsxRuntimeExports.jsxs("main",{children:[jsxRuntimeExports.jsx(ChatInterface,{onStart:()=>{},autoStart:a,forceCompleted:d}),jsxRuntimeExports.jsx(AnimatePresence,{children:jsxRuntimeExports.jsxs(motion.div,{initial:{opacity:0,y:40},animate:{opacity:1,y:0},exit:{opacity:0,y:40},transition:{duration:.7,ease:"easeOut"},children:[jsxRuntimeExports.jsx(Hero,{}),jsxRuntimeExports.jsx(FeaturedPosts,{}),jsxRuntimeExports.jsx(FeaturedPhotos,{})]},"homepage-content")})]}):jsxRuntimeExports.jsx("main",{className:"min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-dark",children:jsxRuntimeExports.jsx("div",{className:"w-full max-w-xl px-4",children:jsxRuntimeExports.jsx(ChatInterface,{onStart:b,autoStart:!1})})}):null};function _objectWithoutProperties(e,o){if(e==null)return{};var a=_objectWithoutPropertiesLoose(e,o),s,c;if(Object.getOwnPropertySymbols){var h=Object.getOwnPropertySymbols(e);for(c=0;c<h.length;c++)s=h[c],!(o.indexOf(s)>=0)&&Object.prototype.propertyIsEnumerable.call(e,s)&&(a[s]=e[s])}return a}function _objectWithoutPropertiesLoose(e,o){if(e==null)return{};var a={},s=Object.keys(e),c,h;for(h=0;h<s.length;h++)c=s[h],!(o.indexOf(c)>=0)&&(a[c]=e[c]);return a}function _extends(){return _extends=Object.assign||function(e){for(var o=1;o<arguments.length;o++){var a=arguments[o];for(var s in a)Object.prototype.hasOwnProperty.call(a,s)&&(e[s]=a[s])}return e},_extends.apply(this,arguments)}function ownKeys(e,o){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);o&&(s=s.filter(function(c){return Object.getOwnPropertyDescriptor(e,c).enumerable})),a.push.apply(a,s)}return a}function _objectSpread(e){for(var o=1;o<arguments.length;o++){var a=arguments[o]!=null?arguments[o]:{};o%2?ownKeys(Object(a),!0).forEach(function(s){_defineProperty(e,s,a[s])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):ownKeys(Object(a)).forEach(function(s){Object.defineProperty(e,s,Object.getOwnPropertyDescriptor(a,s))})}return e}function _defineProperty(e,o,a){return o in e?Object.defineProperty(e,o,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[o]=a,e}const defaultProps={breakpointCols:void 0,className:void 0,columnClassName:void 0,children:void 0,columnAttrs:void 0,column:void 0},DEFAULT_COLUMNS=2;class Masonry extends React.Component{constructor(o){super(o),this.reCalculateColumnCount=this.reCalculateColumnCount.bind(this),this.reCalculateColumnCountDebounce=this.reCalculateColumnCountDebounce.bind(this);let a;this.props.breakpointCols&&this.props.breakpointCols.default?a=this.props.breakpointCols.default:a=parseInt(this.props.breakpointCols)||DEFAULT_COLUMNS,this.state={columnCount:a}}componentDidMount(){this.reCalculateColumnCount(),window&&window.addEventListener("resize",this.reCalculateColumnCountDebounce)}componentDidUpdate(){this.reCalculateColumnCount()}componentWillUnmount(){window&&window.removeEventListener("resize",this.reCalculateColumnCountDebounce)}reCalculateColumnCountDebounce(){if(!window||!window.requestAnimationFrame){this.reCalculateColumnCount();return}window.cancelAnimationFrame&&window.cancelAnimationFrame(this._lastRecalculateAnimationFrame),this._lastRecalculateAnimationFrame=window.requestAnimationFrame(()=>{this.reCalculateColumnCount()})}reCalculateColumnCount(){const o=window&&window.innerWidth||1/0;let a=this.props.breakpointCols;typeof a!="object"&&(a={default:parseInt(a)||DEFAULT_COLUMNS});let s=1/0,c=a.default||DEFAULT_COLUMNS;for(let h in a){const d=parseInt(h);d>0&&o<=d&&d<s&&(s=d,c=a[h])}c=Math.max(1,parseInt(c)||1),this.state.columnCount!==c&&this.setState({columnCount:c})}itemsInColumns(){const o=this.state.columnCount,a=new Array(o),s=React.Children.toArray(this.props.children);for(let c=0;c<s.length;c++){const h=c%o;a[h]||(a[h]=[]),a[h].push(s[c])}return a}renderColumns(){const{column:o,columnAttrs:a={},columnClassName:s}=this.props,c=this.itemsInColumns(),h=`${100/c.length}%`;let d=s;d&&typeof d!="string"&&(this.logDeprecated('The property "columnClassName" requires a string'),typeof d>"u"&&(d="my-masonry-grid_column"));const g=_objectSpread(_objectSpread(_objectSpread({},o),a),{},{style:_objectSpread(_objectSpread({},a.style),{},{width:h}),className:d});return c.map((b,j)=>React.createElement("div",_extends({},g,{key:j}),b))}logDeprecated(o){console.error("[Masonry]",o)}render(){const o=this.props,{children:a,breakpointCols:s,columnClassName:c,columnAttrs:h,column:d,className:g}=o,b=_objectWithoutProperties(o,["children","breakpointCols","columnClassName","columnAttrs","column","className"]);let j=g;return typeof g!="string"&&(this.logDeprecated('The property "className" requires a string'),typeof g>"u"&&(j="my-masonry-grid")),React.createElement("div",_extends({},b,{className:j}),this.renderColumns())}}Masonry.defaultProps=defaultProps;const GalleryGrid=reactExports.memo(({photos:e,onPhotoClick:o})=>{const[a,s]=reactExports.useState(null),c={default:3,1024:2,640:1},h=reactExports.useCallback(_=>{const _e=parseInt(_,10),tt=Math.sin(_e*12.9898)*43758.5453;return tt-Math.floor(tt)},[]),d=reactExports.useMemo(()=>{console.log("🔍 Debugging height calculation...");const _={};return e.forEach(_e=>{const tt=h(_e.id)*.25,st=380+25,ct=800-st;let rt=Math.round(st+tt*ct);const ot=h(_e.id+"hero"),lt=ot>.85;if(lt){const dt=50+ot*50;rt+=dt,rt=Math.min(rt,800)}console.log(`Photo ID: ${_e.id}, Random: ${tt.toFixed(3)}, Hero: ${lt}, Height: ${rt}px`),_[_e.id]={height:`${rt}px`}}),console.log("📊 Height distribution:",Object.values(_).map(_e=>_e.height)),_},[e,h]),g=reactExports.useCallback(_=>{s(_)},[]),b=reactExports.useCallback(()=>{s(null)},[]),j=reactExports.useCallback(_=>{o(_)},[o]);return jsxRuntimeExports.jsx(Masonry,{breakpointCols:c,className:"flex -ml-4 w-auto",columnClassName:"pl-4 bg-clip-padding masonry-column",children:e.map(_=>jsxRuntimeExports.jsxs(motion.div,{layout:!0,initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,scale:.9},transition:{duration:.4},className:"mb-4 relative rounded-lg overflow-hidden shadow-md cursor-pointer group gallery-item",onMouseEnter:()=>g(_.id),onMouseLeave:b,onClick:()=>j(_),children:[jsxRuntimeExports.jsx("div",{className:"overflow-hidden rounded-lg",style:d[_.id],children:jsxRuntimeExports.jsx("img",{src:_.imageUrl,alt:_.location,className:"w-full h-full object-cover transition-transform duration-300 ease-out gallery-image",style:{transform:a===_.id?"scale(1.35)":"scale(1.1)"},loading:"lazy",decoding:"async"})}),jsxRuntimeExports.jsxs("div",{className:`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300 gallery-overlay ${a===_.id?"opacity-100":"opacity-0"}`,children:[jsxRuntimeExports.jsx("h3",{className:"text-white text-xl font-semibold",children:_.location}),jsxRuntimeExports.jsxs("div",{className:"flex justify-between items-center mt-2",children:[jsxRuntimeExports.jsx("span",{className:"text-white/80 text-sm capitalize flex items-center",children:jsxRuntimeExports.jsx("span",{className:"px-2 py-0.5 rounded-full bg-white/20",children:_.category})}),jsxRuntimeExports.jsxs("span",{className:"text-white/80 text-sm flex items-center",children:[jsxRuntimeExports.jsx(Calendar,{size:14,className:"mr-1"}),new Date(_.date).toLocaleDateString("en-US",{year:"numeric",month:"short"})]})]}),jsxRuntimeExports.jsx("div",{className:"absolute top-4 right-4 p-2 bg-black/30 rounded-full text-white",children:jsxRuntimeExports.jsx(Maximize2,{size:16})})]})]},_.id))})});GalleryGrid.displayName="GalleryGrid";const CategoryFilter=({categories:e,activeCategory:o,onCategoryChange:a})=>jsxRuntimeExports.jsx("div",{className:"overflow-x-auto pb-2",children:jsxRuntimeExports.jsx("div",{className:"flex space-x-3 px-1 py-1",children:e.map(s=>jsxRuntimeExports.jsxs(motion.button,{onClick:()=>a(s.id),className:`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5
              ${o===s.id?"bg-primary-500 text-white dark:bg-primary-600":"bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"}`,whileHover:{scale:1.02},whileTap:{scale:.98},children:[jsxRuntimeExports.jsx("span",{children:s.name}),jsxRuntimeExports.jsx("span",{className:`text-xs px-1.5 py-0.5 rounded-full ${o===s.id?"bg-white/20 text-white":"bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300"}`,children:s.count})]},s.id))})}),YearFilter$1=({years:e,activeYear:o,onYearChange:a})=>jsxRuntimeExports.jsx("div",{className:"overflow-x-auto pb-2",children:jsxRuntimeExports.jsx("div",{className:"flex space-x-3 px-1 py-1",children:e.map(s=>jsxRuntimeExports.jsxs(motion.button,{onClick:()=>a(s.id),className:`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5
              ${o===s.id?"bg-emerald-500 text-white dark:bg-emerald-600":"bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"}`,whileHover:{scale:1.02},whileTap:{scale:.98},children:[jsxRuntimeExports.jsx("span",{children:s.name}),jsxRuntimeExports.jsx("span",{className:`text-xs px-1.5 py-0.5 rounded-full ${o===s.id?"bg-white/20 text-white":"bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300"}`,children:s.count})]},s.id))})}),SortButton=({sortMode:e,onSortChange:o})=>jsxRuntimeExports.jsxs("div",{className:"flex items-center space-x-3",children:[jsxRuntimeExports.jsx("span",{className:"text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap",children:"Sort by:"}),jsxRuntimeExports.jsxs("div",{className:"flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1",children:[jsxRuntimeExports.jsxs(motion.button,{onClick:()=>o("random"),className:`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${e==="random"?"bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm":"text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`,whileHover:{scale:1.02},whileTap:{scale:.98},children:[jsxRuntimeExports.jsx(Shuffle,{size:14}),jsxRuntimeExports.jsx("span",{children:"Random"})]}),jsxRuntimeExports.jsxs(motion.button,{onClick:()=>o("date"),className:`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${e==="date"?"bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm":"text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`,whileHover:{scale:1.02},whileTap:{scale:.98},children:[jsxRuntimeExports.jsx(Calendar,{size:14}),jsxRuntimeExports.jsx("span",{children:"Date"})]})]})]}),Lightbox=({isOpen:e,currentPhoto:o,onClose:a,onPrev:s,onNext:c,hasNext:h,hasPrev:d})=>(reactExports.useEffect(()=>{const g=b=>{if(e)switch(b.key){case"Escape":a();break;case"ArrowLeft":d&&s();break;case"ArrowRight":h&&c();break}};return window.addEventListener("keydown",g),e&&(document.body.style.overflow="hidden"),()=>{window.removeEventListener("keydown",g),document.body.style.overflow=""}},[e,a,c,s,h,d]),o?jsxRuntimeExports.jsx(AnimatePresence,{children:e&&jsxRuntimeExports.jsxs(motion.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 md:p-10",onClick:a,children:[jsxRuntimeExports.jsx("button",{className:"absolute top-4 right-4 p-2 text-white bg-black/20 rounded-full z-10 hover:bg-black/40 transition-colors",onClick:a,"aria-label":"Close lightbox",children:jsxRuntimeExports.jsx(X,{size:24})}),d&&jsxRuntimeExports.jsx("button",{className:"absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 text-white rounded-full z-10 hover:bg-black/40 transition-colors",onClick:g=>{g.stopPropagation(),s()},"aria-label":"Previous image",children:jsxRuntimeExports.jsx(ChevronLeft,{size:24})}),h&&jsxRuntimeExports.jsx("button",{className:"absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 text-white rounded-full z-10 hover:bg-black/40 transition-colors",onClick:g=>{g.stopPropagation(),c()},"aria-label":"Next image",children:jsxRuntimeExports.jsx(ChevronRight,{size:24})}),jsxRuntimeExports.jsxs(motion.div,{initial:{opacity:0,scale:.9},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.9},transition:{type:"spring",stiffness:300,damping:30},className:"relative max-w-screen-lg w-full h-full flex flex-col items-center justify-center",onClick:g=>g.stopPropagation(),children:[jsxRuntimeExports.jsx("div",{className:"relative w-full max-h-[80vh] flex items-center justify-center",children:jsxRuntimeExports.jsx("img",{src:o.imageUrl,alt:o.location,className:"max-w-full max-h-[80vh] object-contain"})}),jsxRuntimeExports.jsx("div",{className:"w-full mt-4 text-white px-4 py-3 bg-black/30 backdrop-blur-sm rounded-lg",children:jsxRuntimeExports.jsxs("div",{className:"flex justify-between items-start",children:[jsxRuntimeExports.jsx("div",{children:jsxRuntimeExports.jsx("h3",{className:"text-xl font-bold",children:o.location})}),jsxRuntimeExports.jsxs("div",{className:"flex items-center space-x-4 text-sm text-white/70",children:[jsxRuntimeExports.jsx("span",{className:"px-3 py-1 rounded-full bg-white/10 capitalize",children:o.category}),jsxRuntimeExports.jsxs("div",{className:"flex items-center",children:[jsxRuntimeExports.jsx(Calendar,{size:14,className:"mr-1"}),jsxRuntimeExports.jsx("time",{dateTime:o.date,children:new Date(o.date).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})})]})]})]})})]})]})}):null),PHOTOS_PER_PAGE=18,shuffleArray=e=>{const o=[...e];for(let a=o.length-1;a>0;a--){const s=Math.floor(Math.random()*(a+1));[o[a],o[s]]=[o[s],o[a]]}return o},GalleryPage=()=>{var Ot;const[e,o]=reactExports.useState("all"),[a,s]=reactExports.useState("all"),[c,h]=reactExports.useState("random"),[d,g]=reactExports.useState([]),[b,j]=reactExports.useState([]),[_,_e]=reactExports.useState(1),[tt,it]=reactExports.useState(!1),[st,ut]=reactExports.useState(0),[ct,rt]=reactExports.useState(!1),ot=reactExports.useMemo(()=>shuffleArray(photos),[]),lt=reactExports.useMemo(()=>{let Tt=photos;a!=="all"&&(Tt=photos.filter(kt=>new Date(kt.date).getFullYear().toString()===a));const Mt=Tt.reduce((kt,vt)=>(kt[vt.category]=(kt[vt.category]||0)+1,kt),{}),Dt=Object.entries(Mt).sort(([,kt],[,vt])=>vt-kt).map(([kt,vt])=>({id:kt,name:kt.charAt(0).toUpperCase()+kt.slice(1),count:vt}));return[{id:"all",name:"All",count:Tt.length},...Dt]},[a]),dt=reactExports.useMemo(()=>{let Tt=photos;e!=="all"&&(Tt=photos.filter(kt=>kt.category===e));const Mt=Tt.reduce((kt,vt)=>{const bt=new Date(vt.date).getFullYear().toString();return kt[bt]=(kt[bt]||0)+1,kt},{}),Dt=Object.entries(Mt).sort(([kt],[vt])=>parseInt(vt)-parseInt(kt)).map(([kt,vt])=>({id:kt,name:kt,count:vt}));return[{id:"all",name:"All Years",count:Tt.length},...Dt]},[e]);reactExports.useEffect(()=>{let Tt=c==="random"?ot:photos;e!=="all"&&(Tt=Tt.filter(Mt=>Mt.category===e)),a!=="all"&&(Tt=Tt.filter(Mt=>new Date(Mt.date).getFullYear().toString()===a)),c==="date"&&(Tt=Tt.sort((Mt,Dt)=>new Date(Dt.date).getTime()-new Date(Mt.date).getTime())),g(Tt),_e(1)},[e,a,c,ot]),reactExports.useEffect(()=>{const Mt=_*PHOTOS_PER_PAGE;j(d.slice(0,Mt))},[d,_]);const pt=()=>{_*PHOTOS_PER_PAGE<d.length&&(rt(!0),setTimeout(()=>{_e(Tt=>Tt+1),rt(!1)},300))},gt=_*PHOTOS_PER_PAGE<d.length,wt=Tt=>{const Mt=b.findIndex(Dt=>Dt.id===Tt.id);ut(Mt),it(!0)},yt=()=>{it(!1)},St=()=>{ut(Tt=>Tt>0?Tt-1:Tt)},xt=()=>{ut(Tt=>Tt<b.length-1?Tt+1:Tt)},Pt=()=>{o("all"),s("all")},Bt=Tt=>{h(Tt)};return jsxRuntimeExports.jsx("main",{className:"pt-24 pb-16",children:jsxRuntimeExports.jsxs("div",{className:"container-custom",children:[jsxRuntimeExports.jsxs("div",{className:"mb-12 text-center",children:[jsxRuntimeExports.jsx(motion.h1,{initial:{opacity:0,y:-20},animate:{opacity:1,y:0},transition:{duration:.6},children:"Gallery"}),jsxRuntimeExports.jsx(motion.p,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6,delay:.2},className:"max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-lg",children:"People, Years, Life: In search of decisive moments where the mundane becomes miraculous, where time freezes to unveil the sacred geometry of fleeting souls."})]}),jsxRuntimeExports.jsxs("div",{className:"mb-8 space-y-6",children:[jsxRuntimeExports.jsxs("div",{className:"flex justify-between items-center",children:[jsxRuntimeExports.jsx("h2",{className:"text-xl font-bold text-slate-800 dark:text-slate-200",children:"Filters & Sorting"}),(e!=="all"||a!=="all")&&jsxRuntimeExports.jsx(motion.button,{onClick:Pt,className:"text-sm text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 font-medium",whileHover:{scale:1.05},whileTap:{scale:.95},children:"Clear All Filters"})]}),jsxRuntimeExports.jsx("div",{children:jsxRuntimeExports.jsx(CategoryFilter,{categories:lt,activeCategory:e,onCategoryChange:o})}),jsxRuntimeExports.jsx("div",{children:jsxRuntimeExports.jsx(YearFilter$1,{years:dt,activeYear:a,onYearChange:s})}),jsxRuntimeExports.jsx("div",{children:jsxRuntimeExports.jsx(SortButton,{sortMode:c,onSortChange:Bt})})]}),jsxRuntimeExports.jsx("div",{className:"mb-6",children:jsxRuntimeExports.jsxs(motion.p,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.5},className:"text-slate-600 dark:text-slate-400",children:["Showing ",b.length," of ",d.length," photos",e!=="all"&&` in ${(Ot=lt.find(Tt=>Tt.id===e))==null?void 0:Ot.name}`,a!=="all"&&` from ${a}`,c==="random"?" (randomized)":" (sorted by date)"]})}),jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.5},children:d.length===0?jsxRuntimeExports.jsxs("div",{className:"text-center py-16",children:[jsxRuntimeExports.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"No photos found with the current filters."}),jsxRuntimeExports.jsx(motion.button,{onClick:Pt,className:"btn-secondary",whileHover:{scale:1.05},whileTap:{scale:.95},children:"Clear All Filters"})]}):jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment,{children:[jsxRuntimeExports.jsx(GalleryGrid,{photos:b,onPhotoClick:wt}),gt&&jsxRuntimeExports.jsx("div",{className:"text-center mt-12",children:jsxRuntimeExports.jsx(motion.button,{onClick:pt,disabled:ct,className:"btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed",whileHover:{scale:ct?1:1.05},whileTap:{scale:ct?1:.95},children:ct?jsxRuntimeExports.jsxs("span",{className:"flex items-center",children:[jsxRuntimeExports.jsxs("svg",{className:"animate-spin -ml-1 mr-3 h-5 w-5 text-white",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[jsxRuntimeExports.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),jsxRuntimeExports.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),"Loading..."]}):`Load More Photos (${d.length-b.length} remaining)`})})]})}),jsxRuntimeExports.jsx(Lightbox,{isOpen:tt,currentPhoto:b[st]||null,onClose:yt,onPrev:St,onNext:xt,hasPrev:st>0,hasNext:st<b.length-1})]})})},TagCloud=({tags:e,selectedTags:o,onTagSelect:a})=>jsxRuntimeExports.jsx("div",{className:"flex flex-wrap gap-2 p-2",children:e.map(s=>{const c=o.includes(s);return jsxRuntimeExports.jsxs(motion.button,{onClick:()=>a(s),className:`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100
                ${c?"ring-2 ring-offset-2 ring-primary-500 dark:ring-primary-400 dark:ring-offset-slate-900":""}
                hover:shadow-md`,whileHover:{scale:1.05},whileTap:{scale:.95},children:["#",s]},s)})}),YearFilter=({years:e,activeYear:o,onYearChange:a})=>jsxRuntimeExports.jsx("div",{className:"space-y-2 p-1",children:e.map(s=>jsxRuntimeExports.jsxs(motion.button,{onClick:()=>a(s.id),className:`w-full px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors flex items-center justify-between
            ${o===s.id?"bg-blue-500 text-white dark:bg-blue-600":"bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"}`,whileHover:{scale:1.02},whileTap:{scale:.99},style:{transformOrigin:"center"},children:[jsxRuntimeExports.jsx("span",{children:s.name}),jsxRuntimeExports.jsx("span",{className:`text-xs px-1.5 py-0.5 rounded-full ${o===s.id?"bg-white/20 text-white":"bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300"}`,children:s.count})]},s.id))}),BlogPage=()=>{const[e,o]=reactExports.useState([]),[a,s]=reactExports.useState("all"),[c,h]=reactExports.useState(postsWithReadingTime),d=Array.from(new Set(postsWithReadingTime.flatMap(j=>[...j.tags,...j.tags_zh||[]]))).sort(),g=reactExports.useMemo(()=>{let j=postsWithReadingTime;e.length>0&&(j=postsWithReadingTime.filter(ct=>e.every(rt=>ct.tags.includes(rt)||ct.tags_zh&&ct.tags_zh.includes(rt))));const _=j.reduce((ct,rt)=>{const ot=new Date(rt.date).getFullYear().toString();return ct[ot]=(ct[ot]||0)+1,ct},{});if(Object.keys(_).length===0)return[{id:"all",name:"All Years",count:0}];const _e=new Date().getFullYear(),tt=Object.keys(_).map(ct=>parseInt(ct)).sort((ct,rt)=>rt-ct),it=tt.filter(ct=>ct>=_e-2),st=tt.filter(ct=>ct<_e-2),ut=[{id:"all",name:"All Years",count:j.length}];if(it.forEach(ct=>{ut.push({id:ct.toString(),name:ct.toString(),count:_[ct.toString()]})}),st.length>0){const ct=Math.min(...st),rt=Math.max(...st),ot=st.reduce((lt,dt)=>lt+_[dt.toString()],0);ct===rt?ut.push({id:ct.toString(),name:ct.toString(),count:_[ct.toString()]}):ut.push({id:"older",name:`${ct}-${rt}`,count:ot})}return ut},[e]),b=j=>{o(_=>_.includes(j)?_.filter(_e=>_e!==j):[..._,j])};return reactExports.useEffect(()=>{let j=postsWithReadingTime;if(e.length>0&&(j=j.filter(_=>e.every(_e=>_.tags.includes(_e)||_.tags_zh&&_.tags_zh.includes(_e)))),a!=="all")if(a==="older"){const _=new Date().getFullYear();j=j.filter(_e=>new Date(_e.date).getFullYear()<_-2)}else j=j.filter(_=>new Date(_.date).getFullYear().toString()===a);h(j)},[e,a]),jsxRuntimeExports.jsx("main",{className:"pt-24 pb-16",children:jsxRuntimeExports.jsxs("div",{className:"container-custom",children:[jsxRuntimeExports.jsxs("div",{className:"mb-12 text-center",children:[jsxRuntimeExports.jsx(motion.h1,{initial:{opacity:0,y:-20},animate:{opacity:1,y:0},transition:{duration:.6},children:"Blog"}),jsxRuntimeExports.jsx(motion.p,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6,delay:.2},className:"max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-lg",children:"Dialogues at the crossroads of artificial intelligence, visual art, and the enduring mysteries of human experience."})]}),jsxRuntimeExports.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-4 gap-8",children:[jsxRuntimeExports.jsx("div",{className:"lg:col-span-1 order-2 lg:order-1",children:jsxRuntimeExports.jsxs("div",{className:"sticky top-24 space-y-8 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-4",children:[jsxRuntimeExports.jsxs("div",{children:[jsxRuntimeExports.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200",children:"Filter by Tags"}),jsxRuntimeExports.jsx(TagCloud,{tags:d,selectedTags:e,onTagSelect:b})]}),jsxRuntimeExports.jsxs("div",{children:[jsxRuntimeExports.jsx("h3",{className:"text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200",children:"Filter by Year"}),jsxRuntimeExports.jsx(YearFilter,{years:g,activeYear:a,onYearChange:s})]})]})}),jsxRuntimeExports.jsxs("div",{className:"lg:col-span-3 order-1 lg:order-2",children:[jsxRuntimeExports.jsxs("div",{className:"flex justify-between items-start",children:[jsxRuntimeExports.jsx("div",{className:"h-7 flex items-center",children:jsxRuntimeExports.jsx(AnimatePresence,{children:(e.length>0||a!=="all")&&jsxRuntimeExports.jsx(motion.button,{initial:{opacity:0,x:-10},animate:{opacity:1,x:0},exit:{opacity:0,x:-10},transition:{duration:.2},onClick:()=>{o([]),s("all")},className:"text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 whitespace-nowrap",whileHover:{scale:1.05},whileTap:{scale:.95},children:"Clear All Filters"})})}),jsxRuntimeExports.jsxs(motion.p,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.5},className:"text-slate-600 dark:text-slate-400 text-right text-sm mt-1",children:["Showing ",c.length," of ",postsWithReadingTime.length," posts",e.length>0&&` with tags: ${e.join(", ")}`,a!=="all"&&` from ${a==="older"?"older years":a}`]})]}),jsxRuntimeExports.jsx("div",{className:"mb-6"}),jsxRuntimeExports.jsx(motion.div,{className:"space-y-8",children:jsxRuntimeExports.jsx(AnimatePresence,{mode:"popLayout",children:c.length===0?jsxRuntimeExports.jsxs(motion.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"text-center py-12",children:[jsxRuntimeExports.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"No posts found with the current filters."}),jsxRuntimeExports.jsx(motion.button,{onClick:()=>{o([]),s("all")},className:"btn-secondary",whileHover:{scale:1.05},whileTap:{scale:.95},children:"Clear All Filters"})]}):c.map(j=>jsxRuntimeExports.jsx(motion.article,{layout:"position",initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},transition:{layout:{duration:.3,ease:"easeInOut"},opacity:{duration:.2},y:{duration:.3}},className:"card overflow-hidden",children:jsxRuntimeExports.jsxs("div",{className:"md:flex",children:[jsxRuntimeExports.jsx("div",{className:"md:w-1/3 overflow-hidden group",children:jsxRuntimeExports.jsx(Link,{to:`/blog/${j.id}`,className:"block h-full",children:jsxRuntimeExports.jsx("img",{src:j.coverImage,alt:j.title,className:"h-48 md:h-full w-full object-cover transition-transform duration-600 ease-out scale-110 group-hover:scale-118"})})}),jsxRuntimeExports.jsxs("div",{className:"p-6 md:w-2/3",children:[jsxRuntimeExports.jsxs("div",{className:"flex flex-wrap gap-2 mb-3",children:[j.tags.map(_=>jsxRuntimeExports.jsxs("button",{onClick:()=>b(_),className:`tag cursor-pointer ${e.includes(_)?"ring-2 ring-primary-500 dark:ring-primary-400":""}`,children:["#",_]},_)),j.tags_zh&&j.tags_zh.map(_=>jsxRuntimeExports.jsxs("button",{onClick:()=>b(_),className:`tag cursor-pointer ${e.includes(_)?"ring-2 ring-primary-500 dark:ring-primary-400":""}`,children:["#",_]},_))]}),j.isMultilingual&&j.title_zh&&jsxRuntimeExports.jsxs("div",{className:"mb-4",children:[jsxRuntimeExports.jsxs(Link,{to:`/blog/${j.id}?lang=zh`,className:"no-underline",children:[jsxRuntimeExports.jsx("h2",{className:"text-2xl font-bold mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors",children:j.title_zh}),j.subtitle_zh&&jsxRuntimeExports.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-2 italic",children:j.subtitle_zh})]}),j.excerpt_zh&&jsxRuntimeExports.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:j.excerpt_zh})]}),jsxRuntimeExports.jsxs("div",{className:`mb-4 ${j.isMultilingual&&j.title_zh?"border-l-4 border-slate-200 dark:border-slate-700 pl-4":""}`,children:[jsxRuntimeExports.jsxs(Link,{to:`/blog/${j.id}`,className:"no-underline",children:[jsxRuntimeExports.jsx("h3",{className:`${j.isMultilingual&&j.title_zh?"text-xl text-slate-700 dark:text-slate-300":"text-2xl"} font-bold mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors`,children:j.title}),j.subtitle&&jsxRuntimeExports.jsx("p",{className:`${j.isMultilingual&&j.title_zh?"text-base text-slate-500 dark:text-slate-500":"text-lg text-slate-600 dark:text-slate-400"} mb-2 italic`,children:j.subtitle})]}),jsxRuntimeExports.jsx("p",{className:`${j.isMultilingual&&j.title_zh?"text-slate-500 dark:text-slate-500":"text-slate-600 dark:text-slate-400"}`,children:j.excerpt})]}),jsxRuntimeExports.jsxs("div",{className:"flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4",children:[jsxRuntimeExports.jsxs("div",{className:"flex items-center mr-4",children:[jsxRuntimeExports.jsx(Calendar,{size:14,className:"mr-1"}),jsxRuntimeExports.jsx("time",{dateTime:j.date,children:new Date(j.date).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})})]}),jsxRuntimeExports.jsxs("div",{className:"flex items-center",children:[jsxRuntimeExports.jsx(Clock,{size:14,className:"mr-1"}),jsxRuntimeExports.jsxs("span",{children:[j.readingTime," min read"]})]})]}),jsxRuntimeExports.jsxs("div",{className:"flex flex-wrap gap-3",children:[j.isMultilingual&&j.content_zh&&jsxRuntimeExports.jsx(Link,{to:`/blog/${j.id}?lang=zh`,className:"btn-primary",children:"阅读全文"}),jsxRuntimeExports.jsx(Link,{to:`/blog/${j.id}`,className:j.isMultilingual&&j.content_zh?"btn-secondary":"btn-primary",children:"Read More"})]})]})]})},j.id))})})]})]})]})})};function _getDefaults(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var _defaults=_getDefaults();function changeDefaults(e){_defaults=e}var noopTest={exec:()=>null};function edit(e,o=""){let a=typeof e=="string"?e:e.source;const s={replace:(c,h)=>{let d=typeof h=="string"?h:h.source;return d=d.replace(other.caret,"$1"),a=a.replace(c,d),s},getRegex:()=>new RegExp(a,o)};return s}var other={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}#`),htmlBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}<(?:[a-z].*>|!--)`,"i")},newline=/^(?:[ \t]*(?:\n|$))+/,blockCode=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,fences=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,hr=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,heading=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,bullet=/(?:[*+-]|\d{1,9}[.)])/,lheadingCore=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,lheading=edit(lheadingCore).replace(/bull/g,bullet).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),lheadingGfm=edit(lheadingCore).replace(/bull/g,bullet).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),_paragraph=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,blockText=/^[^\n]+/,_blockLabel=/(?!\s*\])(?:\\.|[^\[\]\\])+/,def=edit(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",_blockLabel).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),list=edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,bullet).getRegex(),_tag="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",_comment=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,html=edit("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",_comment).replace("tag",_tag).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),paragraph=edit(_paragraph).replace("hr",hr).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",_tag).getRegex(),blockquote=edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",paragraph).getRegex(),blockNormal={blockquote,code:blockCode,def,fences,heading,hr,html,lheading,list,newline,paragraph,table:noopTest,text:blockText},gfmTable=edit("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",hr).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",_tag).getRegex(),blockGfm={...blockNormal,lheading:lheadingGfm,table:gfmTable,paragraph:edit(_paragraph).replace("hr",hr).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",gfmTable).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",_tag).getRegex()},blockPedantic={...blockNormal,html:edit(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",_comment).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:noopTest,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:edit(_paragraph).replace("hr",hr).replace("heading",` *#{1,6} *[^
]`).replace("lheading",lheading).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},escape=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,inlineCode=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,br=/^( {2,}|\\)\n(?!\s*$)/,inlineText=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,_punctuation=/[\p{P}\p{S}]/u,_punctuationOrSpace=/[\s\p{P}\p{S}]/u,_notPunctuationOrSpace=/[^\s\p{P}\p{S}]/u,punctuation=edit(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,_punctuationOrSpace).getRegex(),_punctuationGfmStrongEm=/(?!~)[\p{P}\p{S}]/u,_punctuationOrSpaceGfmStrongEm=/(?!~)[\s\p{P}\p{S}]/u,_notPunctuationOrSpaceGfmStrongEm=/(?:[^\s\p{P}\p{S}]|~)/u,blockSkip=/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,emStrongLDelimCore=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,emStrongLDelim=edit(emStrongLDelimCore,"u").replace(/punct/g,_punctuation).getRegex(),emStrongLDelimGfm=edit(emStrongLDelimCore,"u").replace(/punct/g,_punctuationGfmStrongEm).getRegex(),emStrongRDelimAstCore="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",emStrongRDelimAst=edit(emStrongRDelimAstCore,"gu").replace(/notPunctSpace/g,_notPunctuationOrSpace).replace(/punctSpace/g,_punctuationOrSpace).replace(/punct/g,_punctuation).getRegex(),emStrongRDelimAstGfm=edit(emStrongRDelimAstCore,"gu").replace(/notPunctSpace/g,_notPunctuationOrSpaceGfmStrongEm).replace(/punctSpace/g,_punctuationOrSpaceGfmStrongEm).replace(/punct/g,_punctuationGfmStrongEm).getRegex(),emStrongRDelimUnd=edit("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,_notPunctuationOrSpace).replace(/punctSpace/g,_punctuationOrSpace).replace(/punct/g,_punctuation).getRegex(),anyPunctuation=edit(/\\(punct)/,"gu").replace(/punct/g,_punctuation).getRegex(),autolink=edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),_inlineComment=edit(_comment).replace("(?:-->|$)","-->").getRegex(),tag=edit("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",_inlineComment).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),_inlineLabel=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,link=edit(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",_inlineLabel).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),reflink=edit(/^!?\[(label)\]\[(ref)\]/).replace("label",_inlineLabel).replace("ref",_blockLabel).getRegex(),nolink=edit(/^!?\[(ref)\](?:\[\])?/).replace("ref",_blockLabel).getRegex(),reflinkSearch=edit("reflink|nolink(?!\\()","g").replace("reflink",reflink).replace("nolink",nolink).getRegex(),inlineNormal={_backpedal:noopTest,anyPunctuation,autolink,blockSkip,br,code:inlineCode,del:noopTest,emStrongLDelim,emStrongRDelimAst,emStrongRDelimUnd,escape,link,nolink,punctuation,reflink,reflinkSearch,tag,text:inlineText,url:noopTest},inlinePedantic={...inlineNormal,link:edit(/^!?\[(label)\]\((.*?)\)/).replace("label",_inlineLabel).getRegex(),reflink:edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",_inlineLabel).getRegex()},inlineGfm={...inlineNormal,emStrongRDelimAst:emStrongRDelimAstGfm,emStrongLDelim:emStrongLDelimGfm,url:edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},inlineBreaks={...inlineGfm,br:edit(br).replace("{2,}","*").getRegex(),text:edit(inlineGfm.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},block={normal:blockNormal,gfm:blockGfm,pedantic:blockPedantic},inline={normal:inlineNormal,gfm:inlineGfm,breaks:inlineBreaks,pedantic:inlinePedantic},escapeReplacements={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},getEscapeReplacement=e=>escapeReplacements[e];function escape2(e,o){if(o){if(other.escapeTest.test(e))return e.replace(other.escapeReplace,getEscapeReplacement)}else if(other.escapeTestNoEncode.test(e))return e.replace(other.escapeReplaceNoEncode,getEscapeReplacement);return e}function cleanUrl(e){try{e=encodeURI(e).replace(other.percentDecode,"%")}catch{return null}return e}function splitCells(e,o){var h;const a=e.replace(other.findPipe,(d,g,b)=>{let j=!1,_=g;for(;--_>=0&&b[_]==="\\";)j=!j;return j?"|":" |"}),s=a.split(other.splitPipe);let c=0;if(s[0].trim()||s.shift(),s.length>0&&!((h=s.at(-1))!=null&&h.trim())&&s.pop(),o)if(s.length>o)s.splice(o);else for(;s.length<o;)s.push("");for(;c<s.length;c++)s[c]=s[c].trim().replace(other.slashPipe,"|");return s}function rtrim(e,o,a){const s=e.length;if(s===0)return"";let c=0;for(;c<s;){const h=e.charAt(s-c-1);if(h===o&&!a)c++;else if(h!==o&&a)c++;else break}return e.slice(0,s-c)}function findClosingBracket(e,o){if(e.indexOf(o[1])===-1)return-1;let a=0;for(let s=0;s<e.length;s++)if(e[s]==="\\")s++;else if(e[s]===o[0])a++;else if(e[s]===o[1]&&(a--,a<0))return s;return a>0?-2:-1}function outputLink(e,o,a,s,c){const h=o.href,d=o.title||null,g=e[1].replace(c.other.outputLinkReplace,"$1");s.state.inLink=!0;const b={type:e[0].charAt(0)==="!"?"image":"link",raw:a,href:h,title:d,text:g,tokens:s.inlineTokens(g)};return s.state.inLink=!1,b}function indentCodeCompensation(e,o,a){const s=e.match(a.other.indentCodeCompensation);if(s===null)return o;const c=s[1];return o.split(`
`).map(h=>{const d=h.match(a.other.beginningSpace);if(d===null)return h;const[g]=d;return g.length>=c.length?h.slice(c.length):h}).join(`
`)}var _Tokenizer=class{constructor(e){Rt(this,"options");Rt(this,"rules");Rt(this,"lexer");this.options=e||_defaults}space(e){const o=this.rules.block.newline.exec(e);if(o&&o[0].length>0)return{type:"space",raw:o[0]}}code(e){const o=this.rules.block.code.exec(e);if(o){const a=o[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:o[0],codeBlockStyle:"indented",text:this.options.pedantic?a:rtrim(a,`
`)}}}fences(e){const o=this.rules.block.fences.exec(e);if(o){const a=o[0],s=indentCodeCompensation(a,o[3]||"",this.rules);return{type:"code",raw:a,lang:o[2]?o[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):o[2],text:s}}}heading(e){const o=this.rules.block.heading.exec(e);if(o){let a=o[2].trim();if(this.rules.other.endingHash.test(a)){const s=rtrim(a,"#");(this.options.pedantic||!s||this.rules.other.endingSpaceChar.test(s))&&(a=s.trim())}return{type:"heading",raw:o[0],depth:o[1].length,text:a,tokens:this.lexer.inline(a)}}}hr(e){const o=this.rules.block.hr.exec(e);if(o)return{type:"hr",raw:rtrim(o[0],`
`)}}blockquote(e){const o=this.rules.block.blockquote.exec(e);if(o){let a=rtrim(o[0],`
`).split(`
`),s="",c="";const h=[];for(;a.length>0;){let d=!1;const g=[];let b;for(b=0;b<a.length;b++)if(this.rules.other.blockquoteStart.test(a[b]))g.push(a[b]),d=!0;else if(!d)g.push(a[b]);else break;a=a.slice(b);const j=g.join(`
`),_=j.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");s=s?`${s}
${j}`:j,c=c?`${c}
${_}`:_;const _e=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(_,h,!0),this.lexer.state.top=_e,a.length===0)break;const tt=h.at(-1);if((tt==null?void 0:tt.type)==="code")break;if((tt==null?void 0:tt.type)==="blockquote"){const it=tt,st=it.raw+`
`+a.join(`
`),ut=this.blockquote(st);h[h.length-1]=ut,s=s.substring(0,s.length-it.raw.length)+ut.raw,c=c.substring(0,c.length-it.text.length)+ut.text;break}else if((tt==null?void 0:tt.type)==="list"){const it=tt,st=it.raw+`
`+a.join(`
`),ut=this.list(st);h[h.length-1]=ut,s=s.substring(0,s.length-tt.raw.length)+ut.raw,c=c.substring(0,c.length-it.raw.length)+ut.raw,a=st.substring(h.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:s,tokens:h,text:c}}}list(e){let o=this.rules.block.list.exec(e);if(o){let a=o[1].trim();const s=a.length>1,c={type:"list",raw:"",ordered:s,start:s?+a.slice(0,-1):"",loose:!1,items:[]};a=s?`\\d{1,9}\\${a.slice(-1)}`:`\\${a}`,this.options.pedantic&&(a=s?a:"[*+-]");const h=this.rules.other.listItemRegex(a);let d=!1;for(;e;){let b=!1,j="",_="";if(!(o=h.exec(e))||this.rules.block.hr.test(e))break;j=o[0],e=e.substring(j.length);let _e=o[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,rt=>" ".repeat(3*rt.length)),tt=e.split(`
`,1)[0],it=!_e.trim(),st=0;if(this.options.pedantic?(st=2,_=_e.trimStart()):it?st=o[1].length+1:(st=o[2].search(this.rules.other.nonSpaceChar),st=st>4?1:st,_=_e.slice(st),st+=o[1].length),it&&this.rules.other.blankLine.test(tt)&&(j+=tt+`
`,e=e.substring(tt.length+1),b=!0),!b){const rt=this.rules.other.nextBulletRegex(st),ot=this.rules.other.hrRegex(st),lt=this.rules.other.fencesBeginRegex(st),dt=this.rules.other.headingBeginRegex(st),pt=this.rules.other.htmlBeginRegex(st);for(;e;){const gt=e.split(`
`,1)[0];let wt;if(tt=gt,this.options.pedantic?(tt=tt.replace(this.rules.other.listReplaceNesting,"  "),wt=tt):wt=tt.replace(this.rules.other.tabCharGlobal,"    "),lt.test(tt)||dt.test(tt)||pt.test(tt)||rt.test(tt)||ot.test(tt))break;if(wt.search(this.rules.other.nonSpaceChar)>=st||!tt.trim())_+=`
`+wt.slice(st);else{if(it||_e.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||lt.test(_e)||dt.test(_e)||ot.test(_e))break;_+=`
`+tt}!it&&!tt.trim()&&(it=!0),j+=gt+`
`,e=e.substring(gt.length+1),_e=wt.slice(st)}}c.loose||(d?c.loose=!0:this.rules.other.doubleBlankLine.test(j)&&(d=!0));let ut=null,ct;this.options.gfm&&(ut=this.rules.other.listIsTask.exec(_),ut&&(ct=ut[0]!=="[ ] ",_=_.replace(this.rules.other.listReplaceTask,""))),c.items.push({type:"list_item",raw:j,task:!!ut,checked:ct,loose:!1,text:_,tokens:[]}),c.raw+=j}const g=c.items.at(-1);if(g)g.raw=g.raw.trimEnd(),g.text=g.text.trimEnd();else return;c.raw=c.raw.trimEnd();for(let b=0;b<c.items.length;b++)if(this.lexer.state.top=!1,c.items[b].tokens=this.lexer.blockTokens(c.items[b].text,[]),!c.loose){const j=c.items[b].tokens.filter(_e=>_e.type==="space"),_=j.length>0&&j.some(_e=>this.rules.other.anyLine.test(_e.raw));c.loose=_}if(c.loose)for(let b=0;b<c.items.length;b++)c.items[b].loose=!0;return c}}html(e){const o=this.rules.block.html.exec(e);if(o)return{type:"html",block:!0,raw:o[0],pre:o[1]==="pre"||o[1]==="script"||o[1]==="style",text:o[0]}}def(e){const o=this.rules.block.def.exec(e);if(o){const a=o[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),s=o[2]?o[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",c=o[3]?o[3].substring(1,o[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):o[3];return{type:"def",tag:a,raw:o[0],href:s,title:c}}}table(e){var d;const o=this.rules.block.table.exec(e);if(!o||!this.rules.other.tableDelimiter.test(o[2]))return;const a=splitCells(o[1]),s=o[2].replace(this.rules.other.tableAlignChars,"").split("|"),c=(d=o[3])!=null&&d.trim()?o[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],h={type:"table",raw:o[0],header:[],align:[],rows:[]};if(a.length===s.length){for(const g of s)this.rules.other.tableAlignRight.test(g)?h.align.push("right"):this.rules.other.tableAlignCenter.test(g)?h.align.push("center"):this.rules.other.tableAlignLeft.test(g)?h.align.push("left"):h.align.push(null);for(let g=0;g<a.length;g++)h.header.push({text:a[g],tokens:this.lexer.inline(a[g]),header:!0,align:h.align[g]});for(const g of c)h.rows.push(splitCells(g,h.header.length).map((b,j)=>({text:b,tokens:this.lexer.inline(b),header:!1,align:h.align[j]})));return h}}lheading(e){const o=this.rules.block.lheading.exec(e);if(o)return{type:"heading",raw:o[0],depth:o[2].charAt(0)==="="?1:2,text:o[1],tokens:this.lexer.inline(o[1])}}paragraph(e){const o=this.rules.block.paragraph.exec(e);if(o){const a=o[1].charAt(o[1].length-1)===`
`?o[1].slice(0,-1):o[1];return{type:"paragraph",raw:o[0],text:a,tokens:this.lexer.inline(a)}}}text(e){const o=this.rules.block.text.exec(e);if(o)return{type:"text",raw:o[0],text:o[0],tokens:this.lexer.inline(o[0])}}escape(e){const o=this.rules.inline.escape.exec(e);if(o)return{type:"escape",raw:o[0],text:o[1]}}tag(e){const o=this.rules.inline.tag.exec(e);if(o)return!this.lexer.state.inLink&&this.rules.other.startATag.test(o[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(o[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(o[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(o[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:o[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:o[0]}}link(e){const o=this.rules.inline.link.exec(e);if(o){const a=o[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(a)){if(!this.rules.other.endAngleBracket.test(a))return;const h=rtrim(a.slice(0,-1),"\\");if((a.length-h.length)%2===0)return}else{const h=findClosingBracket(o[2],"()");if(h===-2)return;if(h>-1){const g=(o[0].indexOf("!")===0?5:4)+o[1].length+h;o[2]=o[2].substring(0,h),o[0]=o[0].substring(0,g).trim(),o[3]=""}}let s=o[2],c="";if(this.options.pedantic){const h=this.rules.other.pedanticHrefTitle.exec(s);h&&(s=h[1],c=h[3])}else c=o[3]?o[3].slice(1,-1):"";return s=s.trim(),this.rules.other.startAngleBracket.test(s)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(a)?s=s.slice(1):s=s.slice(1,-1)),outputLink(o,{href:s&&s.replace(this.rules.inline.anyPunctuation,"$1"),title:c&&c.replace(this.rules.inline.anyPunctuation,"$1")},o[0],this.lexer,this.rules)}}reflink(e,o){let a;if((a=this.rules.inline.reflink.exec(e))||(a=this.rules.inline.nolink.exec(e))){const s=(a[2]||a[1]).replace(this.rules.other.multipleSpaceGlobal," "),c=o[s.toLowerCase()];if(!c){const h=a[0].charAt(0);return{type:"text",raw:h,text:h}}return outputLink(a,c,a[0],this.lexer,this.rules)}}emStrong(e,o,a=""){let s=this.rules.inline.emStrongLDelim.exec(e);if(!s||s[3]&&a.match(this.rules.other.unicodeAlphaNumeric))return;if(!(s[1]||s[2]||"")||!a||this.rules.inline.punctuation.exec(a)){const h=[...s[0]].length-1;let d,g,b=h,j=0;const _=s[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(_.lastIndex=0,o=o.slice(-1*e.length+h);(s=_.exec(o))!=null;){if(d=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!d)continue;if(g=[...d].length,s[3]||s[4]){b+=g;continue}else if((s[5]||s[6])&&h%3&&!((h+g)%3)){j+=g;continue}if(b-=g,b>0)continue;g=Math.min(g,g+b+j);const _e=[...s[0]][0].length,tt=e.slice(0,h+s.index+_e+g);if(Math.min(h,g)%2){const st=tt.slice(1,-1);return{type:"em",raw:tt,text:st,tokens:this.lexer.inlineTokens(st)}}const it=tt.slice(2,-2);return{type:"strong",raw:tt,text:it,tokens:this.lexer.inlineTokens(it)}}}}codespan(e){const o=this.rules.inline.code.exec(e);if(o){let a=o[2].replace(this.rules.other.newLineCharGlobal," ");const s=this.rules.other.nonSpaceChar.test(a),c=this.rules.other.startingSpaceChar.test(a)&&this.rules.other.endingSpaceChar.test(a);return s&&c&&(a=a.substring(1,a.length-1)),{type:"codespan",raw:o[0],text:a}}}br(e){const o=this.rules.inline.br.exec(e);if(o)return{type:"br",raw:o[0]}}del(e){const o=this.rules.inline.del.exec(e);if(o)return{type:"del",raw:o[0],text:o[2],tokens:this.lexer.inlineTokens(o[2])}}autolink(e){const o=this.rules.inline.autolink.exec(e);if(o){let a,s;return o[2]==="@"?(a=o[1],s="mailto:"+a):(a=o[1],s=a),{type:"link",raw:o[0],text:a,href:s,tokens:[{type:"text",raw:a,text:a}]}}}url(e){var a;let o;if(o=this.rules.inline.url.exec(e)){let s,c;if(o[2]==="@")s=o[0],c="mailto:"+s;else{let h;do h=o[0],o[0]=((a=this.rules.inline._backpedal.exec(o[0]))==null?void 0:a[0])??"";while(h!==o[0]);s=o[0],o[1]==="www."?c="http://"+o[0]:c=o[0]}return{type:"link",raw:o[0],text:s,href:c,tokens:[{type:"text",raw:s,text:s}]}}}inlineText(e){const o=this.rules.inline.text.exec(e);if(o){const a=this.lexer.state.inRawBlock;return{type:"text",raw:o[0],text:o[0],escaped:a}}}},_Lexer=class en{constructor(o){Rt(this,"tokens");Rt(this,"options");Rt(this,"state");Rt(this,"tokenizer");Rt(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=o||_defaults,this.options.tokenizer=this.options.tokenizer||new _Tokenizer,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const a={other,block:block.normal,inline:inline.normal};this.options.pedantic?(a.block=block.pedantic,a.inline=inline.pedantic):this.options.gfm&&(a.block=block.gfm,this.options.breaks?a.inline=inline.breaks:a.inline=inline.gfm),this.tokenizer.rules=a}static get rules(){return{block,inline}}static lex(o,a){return new en(a).lex(o)}static lexInline(o,a){return new en(a).inlineTokens(o)}lex(o){o=o.replace(other.carriageReturn,`
`),this.blockTokens(o,this.tokens);for(let a=0;a<this.inlineQueue.length;a++){const s=this.inlineQueue[a];this.inlineTokens(s.src,s.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(o,a=[],s=!1){var c,h,d;for(this.options.pedantic&&(o=o.replace(other.tabCharGlobal,"    ").replace(other.spaceLine,""));o;){let g;if((h=(c=this.options.extensions)==null?void 0:c.block)!=null&&h.some(j=>(g=j.call({lexer:this},o,a))?(o=o.substring(g.raw.length),a.push(g),!0):!1))continue;if(g=this.tokenizer.space(o)){o=o.substring(g.raw.length);const j=a.at(-1);g.raw.length===1&&j!==void 0?j.raw+=`
`:a.push(g);continue}if(g=this.tokenizer.code(o)){o=o.substring(g.raw.length);const j=a.at(-1);(j==null?void 0:j.type)==="paragraph"||(j==null?void 0:j.type)==="text"?(j.raw+=`
`+g.raw,j.text+=`
`+g.text,this.inlineQueue.at(-1).src=j.text):a.push(g);continue}if(g=this.tokenizer.fences(o)){o=o.substring(g.raw.length),a.push(g);continue}if(g=this.tokenizer.heading(o)){o=o.substring(g.raw.length),a.push(g);continue}if(g=this.tokenizer.hr(o)){o=o.substring(g.raw.length),a.push(g);continue}if(g=this.tokenizer.blockquote(o)){o=o.substring(g.raw.length),a.push(g);continue}if(g=this.tokenizer.list(o)){o=o.substring(g.raw.length),a.push(g);continue}if(g=this.tokenizer.html(o)){o=o.substring(g.raw.length),a.push(g);continue}if(g=this.tokenizer.def(o)){o=o.substring(g.raw.length);const j=a.at(-1);(j==null?void 0:j.type)==="paragraph"||(j==null?void 0:j.type)==="text"?(j.raw+=`
`+g.raw,j.text+=`
`+g.raw,this.inlineQueue.at(-1).src=j.text):this.tokens.links[g.tag]||(this.tokens.links[g.tag]={href:g.href,title:g.title});continue}if(g=this.tokenizer.table(o)){o=o.substring(g.raw.length),a.push(g);continue}if(g=this.tokenizer.lheading(o)){o=o.substring(g.raw.length),a.push(g);continue}let b=o;if((d=this.options.extensions)!=null&&d.startBlock){let j=1/0;const _=o.slice(1);let _e;this.options.extensions.startBlock.forEach(tt=>{_e=tt.call({lexer:this},_),typeof _e=="number"&&_e>=0&&(j=Math.min(j,_e))}),j<1/0&&j>=0&&(b=o.substring(0,j+1))}if(this.state.top&&(g=this.tokenizer.paragraph(b))){const j=a.at(-1);s&&(j==null?void 0:j.type)==="paragraph"?(j.raw+=`
`+g.raw,j.text+=`
`+g.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=j.text):a.push(g),s=b.length!==o.length,o=o.substring(g.raw.length);continue}if(g=this.tokenizer.text(o)){o=o.substring(g.raw.length);const j=a.at(-1);(j==null?void 0:j.type)==="text"?(j.raw+=`
`+g.raw,j.text+=`
`+g.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=j.text):a.push(g);continue}if(o){const j="Infinite loop on byte: "+o.charCodeAt(0);if(this.options.silent){console.error(j);break}else throw new Error(j)}}return this.state.top=!0,a}inline(o,a=[]){return this.inlineQueue.push({src:o,tokens:a}),a}inlineTokens(o,a=[]){var g,b,j;let s=o,c=null;if(this.tokens.links){const _=Object.keys(this.tokens.links);if(_.length>0)for(;(c=this.tokenizer.rules.inline.reflinkSearch.exec(s))!=null;)_.includes(c[0].slice(c[0].lastIndexOf("[")+1,-1))&&(s=s.slice(0,c.index)+"["+"a".repeat(c[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(c=this.tokenizer.rules.inline.anyPunctuation.exec(s))!=null;)s=s.slice(0,c.index)+"++"+s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(c=this.tokenizer.rules.inline.blockSkip.exec(s))!=null;)s=s.slice(0,c.index)+"["+"a".repeat(c[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let h=!1,d="";for(;o;){h||(d=""),h=!1;let _;if((b=(g=this.options.extensions)==null?void 0:g.inline)!=null&&b.some(tt=>(_=tt.call({lexer:this},o,a))?(o=o.substring(_.raw.length),a.push(_),!0):!1))continue;if(_=this.tokenizer.escape(o)){o=o.substring(_.raw.length),a.push(_);continue}if(_=this.tokenizer.tag(o)){o=o.substring(_.raw.length),a.push(_);continue}if(_=this.tokenizer.link(o)){o=o.substring(_.raw.length),a.push(_);continue}if(_=this.tokenizer.reflink(o,this.tokens.links)){o=o.substring(_.raw.length);const tt=a.at(-1);_.type==="text"&&(tt==null?void 0:tt.type)==="text"?(tt.raw+=_.raw,tt.text+=_.text):a.push(_);continue}if(_=this.tokenizer.emStrong(o,s,d)){o=o.substring(_.raw.length),a.push(_);continue}if(_=this.tokenizer.codespan(o)){o=o.substring(_.raw.length),a.push(_);continue}if(_=this.tokenizer.br(o)){o=o.substring(_.raw.length),a.push(_);continue}if(_=this.tokenizer.del(o)){o=o.substring(_.raw.length),a.push(_);continue}if(_=this.tokenizer.autolink(o)){o=o.substring(_.raw.length),a.push(_);continue}if(!this.state.inLink&&(_=this.tokenizer.url(o))){o=o.substring(_.raw.length),a.push(_);continue}let _e=o;if((j=this.options.extensions)!=null&&j.startInline){let tt=1/0;const it=o.slice(1);let st;this.options.extensions.startInline.forEach(ut=>{st=ut.call({lexer:this},it),typeof st=="number"&&st>=0&&(tt=Math.min(tt,st))}),tt<1/0&&tt>=0&&(_e=o.substring(0,tt+1))}if(_=this.tokenizer.inlineText(_e)){o=o.substring(_.raw.length),_.raw.slice(-1)!=="_"&&(d=_.raw.slice(-1)),h=!0;const tt=a.at(-1);(tt==null?void 0:tt.type)==="text"?(tt.raw+=_.raw,tt.text+=_.text):a.push(_);continue}if(o){const tt="Infinite loop on byte: "+o.charCodeAt(0);if(this.options.silent){console.error(tt);break}else throw new Error(tt)}}return a}},_Renderer=class{constructor(e){Rt(this,"options");Rt(this,"parser");this.options=e||_defaults}space(e){return""}code({text:e,lang:o,escaped:a}){var h;const s=(h=(o||"").match(other.notSpaceStart))==null?void 0:h[0],c=e.replace(other.endingNewline,"")+`
`;return s?'<pre><code class="language-'+escape2(s)+'">'+(a?c:escape2(c,!0))+`</code></pre>
`:"<pre><code>"+(a?c:escape2(c,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}heading({tokens:e,depth:o}){return`<h${o}>${this.parser.parseInline(e)}</h${o}>
`}hr(e){return`<hr>
`}list(e){const o=e.ordered,a=e.start;let s="";for(let d=0;d<e.items.length;d++){const g=e.items[d];s+=this.listitem(g)}const c=o?"ol":"ul",h=o&&a!==1?' start="'+a+'"':"";return"<"+c+h+`>
`+s+"</"+c+`>
`}listitem(e){var a;let o="";if(e.task){const s=this.checkbox({checked:!!e.checked});e.loose?((a=e.tokens[0])==null?void 0:a.type)==="paragraph"?(e.tokens[0].text=s+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=s+" "+escape2(e.tokens[0].tokens[0].text),e.tokens[0].tokens[0].escaped=!0)):e.tokens.unshift({type:"text",raw:s+" ",text:s+" ",escaped:!0}):o+=s+" "}return o+=this.parser.parse(e.tokens,!!e.loose),`<li>${o}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let o="",a="";for(let c=0;c<e.header.length;c++)a+=this.tablecell(e.header[c]);o+=this.tablerow({text:a});let s="";for(let c=0;c<e.rows.length;c++){const h=e.rows[c];a="";for(let d=0;d<h.length;d++)a+=this.tablecell(h[d]);s+=this.tablerow({text:a})}return s&&(s=`<tbody>${s}</tbody>`),`<table>
<thead>
`+o+`</thead>
`+s+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){const o=this.parser.parseInline(e.tokens),a=e.header?"th":"td";return(e.align?`<${a} align="${e.align}">`:`<${a}>`)+o+`</${a}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${escape2(e,!0)}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:o,tokens:a}){const s=this.parser.parseInline(a),c=cleanUrl(e);if(c===null)return s;e=c;let h='<a href="'+e+'"';return o&&(h+=' title="'+escape2(o)+'"'),h+=">"+s+"</a>",h}image({href:e,title:o,text:a,tokens:s}){s&&(a=this.parser.parseInline(s,this.parser.textRenderer));const c=cleanUrl(e);if(c===null)return escape2(a);e=c;let h=`<img src="${e}" alt="${a}"`;return o&&(h+=` title="${escape2(o)}"`),h+=">",h}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):"escaped"in e&&e.escaped?e.text:escape2(e.text)}},_TextRenderer=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}},_Parser=class tn{constructor(o){Rt(this,"options");Rt(this,"renderer");Rt(this,"textRenderer");this.options=o||_defaults,this.options.renderer=this.options.renderer||new _Renderer,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new _TextRenderer}static parse(o,a){return new tn(a).parse(o)}static parseInline(o,a){return new tn(a).parseInline(o)}parse(o,a=!0){var c,h;let s="";for(let d=0;d<o.length;d++){const g=o[d];if((h=(c=this.options.extensions)==null?void 0:c.renderers)!=null&&h[g.type]){const j=g,_=this.options.extensions.renderers[j.type].call({parser:this},j);if(_!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(j.type)){s+=_||"";continue}}const b=g;switch(b.type){case"space":{s+=this.renderer.space(b);continue}case"hr":{s+=this.renderer.hr(b);continue}case"heading":{s+=this.renderer.heading(b);continue}case"code":{s+=this.renderer.code(b);continue}case"table":{s+=this.renderer.table(b);continue}case"blockquote":{s+=this.renderer.blockquote(b);continue}case"list":{s+=this.renderer.list(b);continue}case"html":{s+=this.renderer.html(b);continue}case"paragraph":{s+=this.renderer.paragraph(b);continue}case"text":{let j=b,_=this.renderer.text(j);for(;d+1<o.length&&o[d+1].type==="text";)j=o[++d],_+=`
`+this.renderer.text(j);a?s+=this.renderer.paragraph({type:"paragraph",raw:_,text:_,tokens:[{type:"text",raw:_,text:_,escaped:!0}]}):s+=_;continue}default:{const j='Token with "'+b.type+'" type was not found.';if(this.options.silent)return console.error(j),"";throw new Error(j)}}}return s}parseInline(o,a=this.renderer){var c,h;let s="";for(let d=0;d<o.length;d++){const g=o[d];if((h=(c=this.options.extensions)==null?void 0:c.renderers)!=null&&h[g.type]){const j=this.options.extensions.renderers[g.type].call({parser:this},g);if(j!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(g.type)){s+=j||"";continue}}const b=g;switch(b.type){case"escape":{s+=a.text(b);break}case"html":{s+=a.html(b);break}case"link":{s+=a.link(b);break}case"image":{s+=a.image(b);break}case"strong":{s+=a.strong(b);break}case"em":{s+=a.em(b);break}case"codespan":{s+=a.codespan(b);break}case"br":{s+=a.br(b);break}case"del":{s+=a.del(b);break}case"text":{s+=a.text(b);break}default:{const j='Token with "'+b.type+'" type was not found.';if(this.options.silent)return console.error(j),"";throw new Error(j)}}}return s}},Zt,_Hooks=(Zt=class{constructor(e){Rt(this,"options");Rt(this,"block");this.options=e||_defaults}preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}provideLexer(){return this.block?_Lexer.lex:_Lexer.lexInline}provideParser(){return this.block?_Parser.parse:_Parser.parseInline}},Rt(Zt,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"])),Zt),Marked=class{constructor(...e){Rt(this,"defaults",_getDefaults());Rt(this,"options",this.setOptions);Rt(this,"parse",this.parseMarkdown(!0));Rt(this,"parseInline",this.parseMarkdown(!1));Rt(this,"Parser",_Parser);Rt(this,"Renderer",_Renderer);Rt(this,"TextRenderer",_TextRenderer);Rt(this,"Lexer",_Lexer);Rt(this,"Tokenizer",_Tokenizer);Rt(this,"Hooks",_Hooks);this.use(...e)}walkTokens(e,o){var s,c;let a=[];for(const h of e)switch(a=a.concat(o.call(this,h)),h.type){case"table":{const d=h;for(const g of d.header)a=a.concat(this.walkTokens(g.tokens,o));for(const g of d.rows)for(const b of g)a=a.concat(this.walkTokens(b.tokens,o));break}case"list":{const d=h;a=a.concat(this.walkTokens(d.items,o));break}default:{const d=h;(c=(s=this.defaults.extensions)==null?void 0:s.childTokens)!=null&&c[d.type]?this.defaults.extensions.childTokens[d.type].forEach(g=>{const b=d[g].flat(1/0);a=a.concat(this.walkTokens(b,o))}):d.tokens&&(a=a.concat(this.walkTokens(d.tokens,o)))}}return a}use(...e){const o=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(a=>{const s={...a};if(s.async=this.defaults.async||s.async||!1,a.extensions&&(a.extensions.forEach(c=>{if(!c.name)throw new Error("extension name required");if("renderer"in c){const h=o.renderers[c.name];h?o.renderers[c.name]=function(...d){let g=c.renderer.apply(this,d);return g===!1&&(g=h.apply(this,d)),g}:o.renderers[c.name]=c.renderer}if("tokenizer"in c){if(!c.level||c.level!=="block"&&c.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");const h=o[c.level];h?h.unshift(c.tokenizer):o[c.level]=[c.tokenizer],c.start&&(c.level==="block"?o.startBlock?o.startBlock.push(c.start):o.startBlock=[c.start]:c.level==="inline"&&(o.startInline?o.startInline.push(c.start):o.startInline=[c.start]))}"childTokens"in c&&c.childTokens&&(o.childTokens[c.name]=c.childTokens)}),s.extensions=o),a.renderer){const c=this.defaults.renderer||new _Renderer(this.defaults);for(const h in a.renderer){if(!(h in c))throw new Error(`renderer '${h}' does not exist`);if(["options","parser"].includes(h))continue;const d=h,g=a.renderer[d],b=c[d];c[d]=(...j)=>{let _=g.apply(c,j);return _===!1&&(_=b.apply(c,j)),_||""}}s.renderer=c}if(a.tokenizer){const c=this.defaults.tokenizer||new _Tokenizer(this.defaults);for(const h in a.tokenizer){if(!(h in c))throw new Error(`tokenizer '${h}' does not exist`);if(["options","rules","lexer"].includes(h))continue;const d=h,g=a.tokenizer[d],b=c[d];c[d]=(...j)=>{let _=g.apply(c,j);return _===!1&&(_=b.apply(c,j)),_}}s.tokenizer=c}if(a.hooks){const c=this.defaults.hooks||new _Hooks;for(const h in a.hooks){if(!(h in c))throw new Error(`hook '${h}' does not exist`);if(["options","block"].includes(h))continue;const d=h,g=a.hooks[d],b=c[d];_Hooks.passThroughHooks.has(h)?c[d]=j=>{if(this.defaults.async)return Promise.resolve(g.call(c,j)).then(_e=>b.call(c,_e));const _=g.call(c,j);return b.call(c,_)}:c[d]=(...j)=>{let _=g.apply(c,j);return _===!1&&(_=b.apply(c,j)),_}}s.hooks=c}if(a.walkTokens){const c=this.defaults.walkTokens,h=a.walkTokens;s.walkTokens=function(d){let g=[];return g.push(h.call(this,d)),c&&(g=g.concat(c.call(this,d))),g}}this.defaults={...this.defaults,...s}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,o){return _Lexer.lex(e,o??this.defaults)}parser(e,o){return _Parser.parse(e,o??this.defaults)}parseMarkdown(e){return(a,s)=>{const c={...s},h={...this.defaults,...c},d=this.onError(!!h.silent,!!h.async);if(this.defaults.async===!0&&c.async===!1)return d(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof a>"u"||a===null)return d(new Error("marked(): input parameter is undefined or null"));if(typeof a!="string")return d(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(a)+", string expected"));h.hooks&&(h.hooks.options=h,h.hooks.block=e);const g=h.hooks?h.hooks.provideLexer():e?_Lexer.lex:_Lexer.lexInline,b=h.hooks?h.hooks.provideParser():e?_Parser.parse:_Parser.parseInline;if(h.async)return Promise.resolve(h.hooks?h.hooks.preprocess(a):a).then(j=>g(j,h)).then(j=>h.hooks?h.hooks.processAllTokens(j):j).then(j=>h.walkTokens?Promise.all(this.walkTokens(j,h.walkTokens)).then(()=>j):j).then(j=>b(j,h)).then(j=>h.hooks?h.hooks.postprocess(j):j).catch(d);try{h.hooks&&(a=h.hooks.preprocess(a));let j=g(a,h);h.hooks&&(j=h.hooks.processAllTokens(j)),h.walkTokens&&this.walkTokens(j,h.walkTokens);let _=b(j,h);return h.hooks&&(_=h.hooks.postprocess(_)),_}catch(j){return d(j)}}}onError(e,o){return a=>{if(a.message+=`
Please report this to https://github.com/markedjs/marked.`,e){const s="<p>An error occurred:</p><pre>"+escape2(a.message+"",!0)+"</pre>";return o?Promise.resolve(s):s}if(o)return Promise.reject(a);throw a}}},markedInstance=new Marked;function marked(e,o){return markedInstance.parse(e,o)}marked.options=marked.setOptions=function(e){return markedInstance.setOptions(e),marked.defaults=markedInstance.defaults,changeDefaults(marked.defaults),marked};marked.getDefaults=_getDefaults;marked.defaults=_defaults;marked.use=function(...e){return markedInstance.use(...e),marked.defaults=markedInstance.defaults,changeDefaults(marked.defaults),marked};marked.walkTokens=function(e,o){return markedInstance.walkTokens(e,o)};marked.parseInline=markedInstance.parseInline;marked.Parser=_Parser;marked.parser=_Parser.parse;marked.Renderer=_Renderer;marked.TextRenderer=_TextRenderer;marked.Lexer=_Lexer;marked.lexer=_Lexer.lex;marked.Tokenizer=_Tokenizer;marked.Hooks=_Hooks;marked.parse=marked;marked.options;marked.setOptions;marked.use;marked.walkTokens;marked.parseInline;_Parser.parse;_Lexer.lex;const ShareButtons=({title:e,url:o})=>{const a=encodeURIComponent(e),s=encodeURIComponent(o),c=()=>{navigator.clipboard.writeText(o),alert("Link copied to clipboard!")};return jsxRuntimeExports.jsxs("div",{className:"flex items-center space-x-3",children:[jsxRuntimeExports.jsx("span",{className:"text-slate-600 dark:text-slate-400 text-sm font-medium",children:"Share:"}),jsxRuntimeExports.jsx("a",{href:`https://twitter.com/intent/tweet?text=${a}&url=${s}`,target:"_blank",rel:"noopener noreferrer",className:`p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                  hover:bg-[#1DA1F2] hover:text-white transition-colors`,"aria-label":"Share on Twitter",children:jsxRuntimeExports.jsx(Twitter,{size:16})}),jsxRuntimeExports.jsx("a",{href:`https://www.facebook.com/sharer/sharer.php?u=${s}`,target:"_blank",rel:"noopener noreferrer",className:`p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                  hover:bg-[#4267B2] hover:text-white transition-colors`,"aria-label":"Share on Facebook",children:jsxRuntimeExports.jsx(Facebook,{size:16})}),jsxRuntimeExports.jsx("a",{href:`https://www.linkedin.com/shareArticle?mini=true&url=${s}&title=${a}`,target:"_blank",rel:"noopener noreferrer",className:`p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                  hover:bg-[#0077B5] hover:text-white transition-colors`,"aria-label":"Share on LinkedIn",children:jsxRuntimeExports.jsx(Linkedin,{size:16})}),jsxRuntimeExports.jsx("button",{onClick:c,className:`p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                  hover:bg-primary-500 hover:text-white transition-colors`,"aria-label":"Copy link",children:jsxRuntimeExports.jsx(Link2,{size:16})})]})},BlogPost=()=>{const{postId:e}=useParams(),[o]=useSearchParams(),a=postsWithReadingTime.find(_e=>_e.id===e),[s,c]=reactExports.useState([]),[h,d]=reactExports.useState("en");reactExports.useEffect(()=>{window.scrollTo({top:0,behavior:"smooth"})},[e]),reactExports.useEffect(()=>{o.get("lang")==="zh"&&(a!=null&&a.isMultilingual)?d("zh"):d("en")},[o,a]),reactExports.useEffect(()=>{window.scrollTo({top:0,behavior:"smooth"})},[h]),marked.setOptions({breaks:!0,gfm:!0});const g=_e=>{try{let tt=_e;return h==="en"&&(tt=_e.replace(/\n\n/g,"___DOUBLE_BREAK___").replace(/\n/g,`

`).replace(/___DOUBLE_BREAK___/g,`



`)),tt=tt.replace(/\n\n\n\n+/g,`

<div class="prose-spacing-large"></div>

`).replace(/\n\n\n/g,`

<div class="prose-spacing-medium"></div>

`),{__html:marked(tt)}}catch(tt){return console.error("Error parsing markdown:",tt),{__html:`<p>${_e.replace(/\n/g,"<br>")}</p>`}}},b=()=>a?h==="zh"&&a.content_zh?{title:a.title_zh||a.title,subtitle:a.subtitle_zh||a.subtitle||"",excerpt:a.excerpt_zh||a.excerpt,content:a.content_zh,tags:a.tags_zh||a.tags}:{title:a.title,subtitle:a.subtitle||"",excerpt:a.excerpt,content:a.content,tags:a.tags}:{title:"",subtitle:"",excerpt:"",content:"",tags:[]},j=()=>{d(_e=>_e==="en"?"zh":"en")};if(reactExports.useEffect(()=>{if(a){const _e=postsWithReadingTime.filter(tt=>tt.id!==a.id&&tt.tags.some(it=>a.tags.includes(it))).slice(0,3);c(_e)}},[a]),!a)return jsxRuntimeExports.jsxs("div",{className:"container-custom py-24 text-center",children:[jsxRuntimeExports.jsx("h2",{className:"text-3xl font-bold",children:"Post Not Found"}),jsxRuntimeExports.jsx("p",{className:"mt-4 mb-8",children:"The post you're looking for doesn't exist or has been removed."}),jsxRuntimeExports.jsx(Link,{to:"/blog",className:"btn-primary",children:"Return to Blog"})]});const _=b();return jsxRuntimeExports.jsx("main",{className:"pt-24 pb-16",children:jsxRuntimeExports.jsxs("article",{className:"container-custom max-w-4xl",children:[jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,x:-10},animate:{opacity:1,x:0},transition:{duration:.4},className:"mb-8",children:jsxRuntimeExports.jsxs(Link,{to:"/blog",className:"inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400",children:[jsxRuntimeExports.jsx(ArrowLeft,{size:16,className:"mr-2"}),"Back to All Posts"]})}),a.isMultilingual&&jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,y:-10},animate:{opacity:1,y:0},transition:{duration:.4,delay:.1},className:"mb-6 flex justify-end",children:jsxRuntimeExports.jsxs("button",{onClick:j,className:"inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",children:[jsxRuntimeExports.jsx(Languages,{size:16,className:"mr-2"}),h==="en"?"中文":"English"]})}),jsxRuntimeExports.jsxs("header",{className:"mb-8",children:[jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6},className:"flex flex-wrap gap-2 mb-4",children:_.tags.map(_e=>jsxRuntimeExports.jsxs(Link,{to:`/blog?tag=${_e}`,className:"tag",children:["#",_e]},_e))}),jsxRuntimeExports.jsx(motion.h1,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6,delay:.1},children:_.title},h),_.subtitle&&jsxRuntimeExports.jsx(motion.p,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6,delay:.15},className:"text-xl text-slate-600 dark:text-slate-400 italic mt-4 mb-6",children:_.subtitle},`${h}-subtitle`),jsxRuntimeExports.jsxs(motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6,delay:.2},className:"flex flex-wrap items-center text-sm text-slate-600 dark:text-slate-400 mb-8",children:[jsxRuntimeExports.jsxs("div",{className:"flex items-center mr-6 mb-2",children:[jsxRuntimeExports.jsx(Calendar,{size:16,className:"mr-2"}),jsxRuntimeExports.jsx("time",{dateTime:a.date,children:new Date(a.date).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})})]}),jsxRuntimeExports.jsxs("div",{className:"flex items-center mb-2",children:[jsxRuntimeExports.jsx(Clock,{size:16,className:"mr-2"}),jsxRuntimeExports.jsxs("span",{children:[a.readingTime," min read"]})]})]}),jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.8,delay:.3},className:"rounded-lg overflow-hidden shadow-lg mb-8 group cursor-pointer",children:jsxRuntimeExports.jsx("img",{src:a.coverImage,alt:_.title,className:"w-full h-auto aspect-video object-cover transition-transform duration-700 ease-out scale-110 group-hover:scale-125"})})]}),jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.8,delay:.4},className:`prose dark:prose-invert prose-lg max-w-none mb-12 lang-${h}`,dangerouslySetInnerHTML:g(_.content)},h),jsxRuntimeExports.jsx("div",{className:"border-t border-b border-slate-200 dark:border-slate-700 py-6 mb-12",children:jsxRuntimeExports.jsx(ShareButtons,{title:_.title,url:window.location.href})}),s.length>0&&jsxRuntimeExports.jsxs("div",{className:"mb-12",children:[jsxRuntimeExports.jsx("h3",{className:"text-2xl font-bold mb-6",children:h==="zh"?"相关文章":"Related Posts"}),jsxRuntimeExports.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:s.map(_e=>{const tt=()=>h==="zh"&&_e.isMultilingual&&_e.content_zh?`/blog/${_e.id}?lang=zh`:`/blog/${_e.id}`,it=()=>h==="zh"&&_e.title_zh?_e.title_zh:_e.title;return jsxRuntimeExports.jsx(motion.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5},className:"card group",children:jsxRuntimeExports.jsxs(Link,{to:tt(),className:"block no-underline",children:[jsxRuntimeExports.jsx("div",{className:"h-40 overflow-hidden rounded-t-lg",children:jsxRuntimeExports.jsx("img",{src:_e.coverImage,alt:it(),className:"w-full h-full object-cover transition-transform duration-500 ease-out scale-105 group-hover:scale-115"})}),jsxRuntimeExports.jsxs("div",{className:"p-4",children:[jsxRuntimeExports.jsx("h4",{className:"text-lg font-bold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors",children:it()}),jsxRuntimeExports.jsxs("div",{className:"flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2",children:[jsxRuntimeExports.jsx(Clock,{size:12,className:"mr-1"}),jsxRuntimeExports.jsxs("span",{children:[_e.readingTime," min read"]})]})]})]})},_e.id)})})]})]})})};function AppRoutes(){return useLocation(),jsxRuntimeExports.jsxs("div",{className:"min-h-screen flex flex-col",children:[jsxRuntimeExports.jsx(Navbar,{}),jsxRuntimeExports.jsxs(Routes,{children:[jsxRuntimeExports.jsx(Route,{path:"/",element:jsxRuntimeExports.jsx(HomePage,{})}),jsxRuntimeExports.jsx(Route,{path:"/gallery",element:jsxRuntimeExports.jsx(GalleryPage,{})}),jsxRuntimeExports.jsx(Route,{path:"/blog",element:jsxRuntimeExports.jsx(BlogPage,{})}),jsxRuntimeExports.jsx(Route,{path:"/blog/:postId",element:jsxRuntimeExports.jsx(BlogPost,{})})]}),jsxRuntimeExports.jsx(Footer,{})]})}createRoot(document.getElementById("root")).render(jsxRuntimeExports.jsx(reactExports.StrictMode,{children:jsxRuntimeExports.jsx(ThemeProvider,{children:jsxRuntimeExports.jsxs(BrowserRouter,{children:[jsxRuntimeExports.jsx(ScrollToTop,{}),jsxRuntimeExports.jsx(AppRoutes,{})]})})}));
