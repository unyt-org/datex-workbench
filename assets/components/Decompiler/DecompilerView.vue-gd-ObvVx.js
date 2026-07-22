import"../../node_modules/shiki/dist/index-2-1uMQDe.js";import{useColorMode as i}from"../../node_modules/@vueuse/core/dist/index-CJWdpYvk.js";import l from"./datex.tmLanguage.json-5EbCKRBn.js";import{createHighlighter as a}from"../../node_modules/shiki/dist/bundle-full-B1lyesJX.js";import{defineComponent as m,onMounted as c,watch as h,openBlock as s,createElementBlock as u}from"../../node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler-Blnnrc39.js";import{ref as d}from"../../node_modules/@vue/reactivity/dist/reactivity.esm-bundler-Drk9aNzV.js";const p=["innerHTML"],g=`const example = [1,2,3,"test"];
const sharedValue = shared 42;

function myFunction() (
    @example :: print "Hello DATEX";
)

myFunction();
`,M=m({__name:"DecompilerView",setup(f){const t=i(),o=d("");let e=null;async function n(){e||(e=await a({themes:["github-dark","github-light"],langs:[l]}));const r=t.value==="dark"?"github-dark":"github-light";o.value=e.codeToHtml(g,{lang:"datex",theme:r})}return c(n),h(()=>t.value,n),(r,_)=>(s(),u("div",{class:"p-4 overflow-auto text-sm",innerHTML:o.value},null,8,p))}});export{M as default};
