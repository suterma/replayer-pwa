(function(e,h){typeof exports=="object"&&typeof module!="undefined"?module.exports=h(require("vue")):typeof define=="function"&&define.amd?define(["vue"],h):(e=typeof globalThis!="undefined"?globalThis:e||self,e.ControlKnob=h(e.Vue))})(this,function(e){"use strict";function c(r){return r*Math.PI/180}function he(r,u=13){let o;return(...s)=>{o?clearTimeout(o):r.apply(this,s),o=setTimeout(()=>{o=void 0},u)}}function Ae(r,u,o=!1){let s=150;o&&(s=s*10);const l=(420-120)/s;return u*l}function C(r,u,o){let s;const l=u-r;return o===120?s=0:o===420?s=1:s=(o-120)/300,r+l*s}function x(r,u,o){let s;const l=u-r;return o===r?s=0:o===u?s=1:s=(o-r)/l,120+300*s}const ve=["width","height","aria-label","aria-valuemin","aria-valuemax","aria-valuenow","tabindex","onClick"],Le=["cx","cy","r"],ke=["stroke-width"],Me=["d","stroke-width"],_e=["x1","y1","x2","y2","stroke-width"],Ie=["x","y"];return e.defineComponent({props:{modelValue:null,options:null},emits:["update:modelValue"],setup(r,{emit:u}){var F,$,Y,H,W,z,K,P,j,q,J,Q,Z,ee,te,oe,ne,se,ae,re,le,ie,ce,ue,fe,de,me,pe,Ee;const o=r,s=e.ref(0),n=e.ref(120),l=e.computed({get(){return o.modelValue},set(t){u("update:modelValue",t)}}),_=((F=o.options)==null?void 0:F.imageSize)||40,d=(($=o.options)==null?void 0:$.minValue)||0,m=((Y=o.options)==null?void 0:Y.maxValue)||100,we=((H=o.options)==null?void 0:H.showTick)===void 0?!0:(W=o.options)==null?void 0:W.showTick,Ne=((z=o.options)==null?void 0:z.showValue)===void 0?!0:(K=o.options)==null?void 0:K.showTick,Ve=((P=o.options)==null?void 0:P.hideDefaultValue)===void 0?!0:(j=o.options)==null?void 0:j.hideDefaultValue,y=((q=o.options)==null?void 0:q.tickLength)||18,S=((J=o.options)==null?void 0:J.tickOffset)||10,ge=((Q=o.options)==null?void 0:Q.tickStroke)||3,Ce=((Z=o.options)==null?void 0:Z.rimStroke)||11,xe=((ee=o.options)==null?void 0:ee.valueArchStroke)||11,ye=((te=o.options)==null?void 0:te.bgRadius)||34,Se=((oe=o.options)==null?void 0:oe.wheelFactor)||10,Xe=((ne=o.options)==null?void 0:ne.keyFactor)||10,Re=((se=o.options)==null?void 0:se.tabIndex)||0,Ge=((ae=o.options)==null?void 0:ae.ariaLabel)||"Knob",De=((re=o.options)==null?void 0:re.valueTextX)||50,Be=((le=o.options)==null?void 0:le.valueTextY)||62,be=((ie=o.options)==null?void 0:ie.svgClass)||"select-none",Te=((ce=o.options)==null?void 0:ce.bgClass)||"text-[#868686]",Ue=((ue=o.options)==null?void 0:ue.rimClass)||"text-[#393939]",Oe=((fe=o.options)==null?void 0:fe.valueArchClass)||"text-[#53d769]",Fe=((de=o.options)==null?void 0:de.tickClass)||"text-black",$e=((me=o.options)==null?void 0:me.valueTextClass)||"text-gray-50 text-[30px] font-normal font-mono",I=((pe=o.options)==null?void 0:pe.passiveEvents)===void 0?!1:(Ee=o.options)==null?void 0:Ee.passiveEvents,Ye=l.value,He=e.computed(()=>50+Math.cos(c(n.value))*(40-y)),We=e.computed(()=>50+Math.sin(c(n.value))*(40-y)),ze=e.computed(()=>50+Math.cos(c(n.value))*(40-S)),Ke=e.computed(()=>50+Math.sin(c(n.value))*(40-S)),X=50+-.5*40,R=50+Math.sin(c(120))*40,Pe=50+.5*40,je=50+Math.sin(c(420))*40,qe=c(120),Je=e.computed(()=>c(n.value)),Qe=e.computed(()=>Math.abs(qe-Je.value)<Math.PI?0:1),Ze=e.ref(1),et=e.computed(()=>50+Math.cos(c(n.value))*40),tt=e.computed(()=>50+Math.sin(c(n.value))*40),ot=`M ${X} ${R} A ${40} ${40} 0 1 1 ${Pe} ${je}`,nt=e.computed(()=>`M ${X} ${R} A ${40} ${40} 0 ${Qe.value} ${Ze.value} ${et.value} ${tt.value}`);let p=0,E=0;const A=e.ref(!1),w=e.ref(!1),G=e.ref(!1),f=e.ref(!1),v=e.ref(!1),L=t=>{A.value=!0,G.value=!1,p=D(t),N(t)};function D(t){return window.TouchEvent&&t instanceof TouchEvent?t.touches[0].pageY:t instanceof MouseEvent?E=t.clientY:0}function st(t){if(G.value=!0,A.value){E=D(t);let a;const i=p-E;if(i<0?a="down":a="up",p!==E&&(a==="up"&&n.value<420||a==="down"&&n.value>120)){const g=Ae(p,i,v.value);n.value+g<120?n.value=120:n.value+g>420?n.value=420:n.value+=g,l.value=C(d,m,n.value)}p=E}}const k=he(st);function N(t){I===!1&&(t.preventDefault(),t.stopPropagation())}const M=()=>{A.value=!1};function at(){n.value=120}function V(t){t>n.value&&(t<420?n.value=t:n.value=420),t<n.value&&(t<n.value&&t>120?n.value=t:n.value=120),l.value=C(d,m,n.value)}function B(t){t.key==="Shift"&&(v.value=!0),f.value&&(t.key==="ArrowUp"||t.key==="ArrowDown")&&N(t)}function b(t){t.key==="Shift"&&(v.value=!1);let a;const i=v.value?1:Xe;f.value&&t.key==="ArrowUp"&&(a=n.value+1*i,V(a)),f.value&&t.key==="ArrowDown"&&(a=n.value-1*i,V(a))}function T(t){let a;const i=t.shiftKey?1:Se;!t.shiftKey&&t.deltaY<0||t.shiftKey&&t.deltaX<0?a=n.value+1*i:a=n.value-1*i,V(a),N(t)}function U(){w.value=!0}function O(){w.value=!1}return e.watch(()=>s.value,(t,a)=>{if(t&&!a){t.addEventListener("mousedown",L),t.addEventListener("touchstart",L,{passive:I}),t.addEventListener("wheel",T,{passive:I}),t.addEventListener("mouseenter",U),t.addEventListener("mouseleave",O),document.addEventListener("mouseup",M),document.addEventListener("touchend",M),document.addEventListener("mousemove",k),document.addEventListener("touchmove",k),document.addEventListener("keydown",B),document.addEventListener("keyup",b);const i=x(d,m,o.modelValue);n.value=i}}),e.watch(()=>o.modelValue,t=>{if(w.value===!1&&A.value===!1&&f.value===!1){const a=x(d,m,t);n.value=a}}),e.onBeforeUnmount(()=>{s.value.removeEventListener("mousedown",L),s.value.removeEventListener("touchstart",L),s.value.removeEventListener("wheel",T),s.value.removeEventListener("mouseenter",U),s.value.removeEventListener("mouseleave",O),document.removeEventListener("mouseup",M),document.removeEventListener("touchend",M),document.removeEventListener("mousemove",k),document.removeEventListener("touchmove",k),document.removeEventListener("keydown",B),document.removeEventListener("keyup",b)}),(t,a)=>(e.openBlock(),e.createElementBlock("svg",{width:e.unref(_),height:e.unref(_),viewBox:"0 0 100 100",ref_key:"knobElement",ref:s,role:"slider","aria-label":e.unref(Ge),"aria-valuemin":e.unref(d),"aria-valuemax":e.unref(m),"aria-valuenow":e.unref(l),tabindex:e.unref(Re),class:e.normalizeClass(e.unref(be)),onClick:e.withModifiers(at,["alt"]),onFocus:a[0]||(a[0]=i=>f.value=!0),onBlur:a[1]||(a[1]=i=>f.value=!1)},[e.createElementVNode("circle",{cx:e.unref(50),cy:e.unref(50),r:e.unref(ye),stroke:"currentColor",fill:"currentColor",class:e.normalizeClass(e.unref(Te)),"stroke-width":1},null,10,Le),e.createElementVNode("path",{d:ot,"stroke-width":e.unref(Ce),stroke:"currentColor",fill:"none",class:e.normalizeClass(e.unref(Ue))},null,10,ke),n.value>120?(e.openBlock(),e.createElementBlock("path",{key:0,d:e.unref(nt),"stroke-width":e.unref(xe),stroke:"currentColor",fill:"none",class:e.normalizeClass(e.unref(Oe))},null,10,Me)):e.createCommentVNode("",!0),e.unref(we)?(e.openBlock(),e.createElementBlock("line",{key:1,x1:e.unref(He),y1:e.unref(We),x2:e.unref(ze),y2:e.unref(Ke),stroke:"currentColor","stroke-width":e.unref(ge),class:e.normalizeClass(e.unref(Fe))},null,10,_e)):e.createCommentVNode("",!0),e.unref(Ne)&&(!e.unref(Ve)||e.unref(Ye)!==e.unref(l))?(e.openBlock(),e.createElementBlock("text",{key:2,x:e.unref(De),y:e.unref(Be),"text-anchor":"middle",fill:"currentColor",class:e.normalizeClass(e.unref($e))},e.toDisplayString(Math.ceil(e.unref(l))),11,Ie)):e.createCommentVNode("",!0)],42,ve))}})});
//# sourceMappingURL=index.umd.js.map