import{Datex as h}from"../lib/runtime-kta6JP6o.js";import{Repl as g}from"https://datex.unyt/esm/repl/mod.js";import{watch as y}from"../node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler-Bi8Ho3Kn.js";import{ref as p,shallowRef as S,toValue as f}from"../node_modules/@vue/reactivity/dist/reactivity.esm-bundler-CmkSKHJe.js";const i=new Map,w=["var","true","false","null","clear","reset","help","test","name","endpoint"];function R(o,r){const e=`replState:${o}`;localStorage.setItem(e,JSON.stringify({entries:r.entries,history:r.history}))}function E(o){const r=`replState:${o}`,e=localStorage.getItem(r);if(!e)return null;try{const l=JSON.parse(e);return{repl:new g(h,o),entries:l.entries??[],history:l.history??[],suggestions:[]}}catch{return null}}function C(o){const r=S(null),e=p([]),l=p([]),u=p([]);y([e,l],([t,a])=>{const s=f(o);if(s){const n=i.get(s)??{repl:r.value,entries:[],history:[],suggestions:u.value};n.entries=t,n.history=a,i.set(s,n),R(s,n)}},{deep:!0}),y(()=>f(o),t=>{if(t){if(!i.has(t)){const s=E(t);i.set(t,s??{repl:new g(h,t),entries:[],history:[],suggestions:[]})}const a=i.get(t);r.value=a.repl??null,e.value=a.entries??[],l.value=a.history??[],u.value=a.suggestions??[]}},{immediate:!0});function v(t){if(!t.trim()){u.value=[];return}const s=t.match(/(\w+)$/);if(!s){u.value=[];return}const n=s[0],c=w;u.value=c.filter(x=>x.startsWith(n)).slice(0,8)}async function d(t){if(!t.trim())return;e.value.push({type:"input",content:t}),l.value[0]!==t&&l.value.unshift(t);const a=t.trim().toLowerCase();if(a==="clear"){m();return}if(a==="help"){e.value.push({type:"output",content:`<span class="text-cyan-400 font-semibold">DATEΧ REPL Help</span>

<span class="text-cyan-400">Commands:</span>
<span class="text-emerald-400">help</span>  ─ Show all available commands
<span class="text-emerald-400">clear</span> ─ Clear console output
<span class="text-emerald-400">reset</span> ─ Reset REPL state and history
<span class="text-emerald-400">test</span>  ─ Run test command (if available)

<span class="text-cyan-400">Autocomplete:</span>
Tab ─ Cycle suggestions
Right Arrow ─ Accept suggestion

<span class="text-cyan-400">Examples:</span>
<span class="text-yellow-400">var a = 10</span>
<span class="text-yellow-400">a + 5</span>
<span class="text-yellow-400">true</span>
`});return}const s=r.value;if(!s){e.value.push({type:"error",content:"No endpoint available"});return}try{const n=await s.execute(t)??null;e.value.push({type:"output",content:n})}catch(n){const c=n instanceof Error?n.message:String(n);e.value.push({type:"error",content:c})}}function m(){e.value=[]}return{entries:e,history:l,suggestions:u,executeCommand:d,updateSuggestions:v,clear:()=>e.value=[],reset:m}}export{C as useDatexRepl};
