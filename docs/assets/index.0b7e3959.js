(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const n of t.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&o(n)}).observe(document,{childList:!0,subtree:!0});function r(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?t.credentials="include":e.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(e){if(e.ep)return;e.ep=!0;const t=r(e);fetch(e.href,t)}})();const s=`<a-scene stats background="color:#000" vr-mode-ui="enabled:false" main>
  <a-assets></a-assets>

  <a-curve id="track1" type="CatmullRom">
    <a-curve-point curve-point="fps:20" tracker position=" 0 1 -3"></a-curve-point>

    <a-curve-point curve-point="fps:20" tracker position="-1.7 1 -3"></a-curve-point>
    <a-curve-point curve-point="fps:20" tracker position="-2.0 .7 -3"></a-curve-point>
    <a-curve-point curve-point="fps:20" tracker position="-2.0 .3 -3"></a-curve-point>
    <a-curve-point curve-point="fps:20" tracker position="-1.7 0 -3"></a-curve-point>

    <a-curve-point curve-point="fps:20" tracker position=" 2 0 -3"></a-curve-point>
  </a-curve>

  <a-draw-curve curveref="#track1" material="shader:line; color:blue;" visible="false"></a-draw-curve>

  <a-entity clone-along-curve="curve: #track1; spacing: 0.2; scale: 1 1 1; rotation: 0 0 0;" geometry="primitive:box; height:0.1; width:0.1; depth:0.1;" material="color:#06f;"></a-entity>

</a-scene>`;AFRAME.registerComponent("tracker",{init(){this.el.setAttribute("geometry","primitive","box"),this.el.setAttribute("geometry","width",.1),this.el.setAttribute("geometry","height",.1),this.el.setAttribute("geometry","depth",.1),this.el.setAttribute("material","color","#FFF")}});AFRAME.registerComponent("main",{init(){const c=document.querySelector("#track1"),i=new Tweakpane.Pane({title:"tweakpane"});for(let r=0;r<c.children.length;r++){const o=c.children[r],{position:e}=o.object3D,t=1;i.addInput({pos:{x:e.x,y:e.y}},"pos",{label:`point${r+1}`,picker:"inline",expanded:r===0,x:{min:-t-1,max:t+2},y:{min:-t,max:t+2,inverted:!0}}).on("change",n=>{o.object3D.position.set(n.value.x,n.value.y,-3)})}}});document.querySelector("#app").innerHTML=s;
