import{Datex as o}from"../lib/runtime-C2343kvS.js";import{ref as c}from"../node_modules/@vue/reactivity/dist/reactivity.esm-bundler-Drk9aNzV.js";const s=c([]),l=c([]),a=c([]);function v(){function u(e){if(!e.trim()){a.value=[];return}const t=e.match(/(\w+)$/);if(!t){a.value=[];return}const r=t[0],x=["var","true","false","null","clear","reset","help","test"];a.value=x.filter(f=>f.startsWith(r)).slice(0,8)}async function i(e){if(!e.trim())return;s.value.push({type:"input",content:e}),l.value[0]!==e&&l.value.unshift(e);const n=e.trim().toLowerCase();if(n==="clear"){s.value=[];return}if(n==="reset"){p();return}if(n==="help"){s.value.push({type:"output",content:`<span class="text-cyan-400 font-semibold">DATEΧ REPL Help</span>

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
`});return}try{const t=await o.execute(e);s.value.push({type:"output",content:m(o.valueToString(t))})}catch(t){const r=t instanceof Error?t.message:String(t);s.value.push({type:"error",content:r})}}function p(){s.value=[],l.value=[],a.value=[]}function m(e){return e==="null"||e===void 0?'<span class="opacity-40 italic">void</span>':String(e).replace(/\x1b\[32m/g,'<span class="text-emerald-400">').replace(/\x1b\[31m/g,'<span class="text-red-400">').replace(/\x1b\[33m/g,'<span class="text-yellow-400">').replace(/\x1b\[36m/g,'<span class="text-cyan-400">').replace(/\x1b\[0m/g,"</span>")}return{entries:s,history:l,suggestions:a,executeCommand:i,updateSuggestions:u,clear:()=>s.value=[],reset:p}}export{v as useDatexRepl};
