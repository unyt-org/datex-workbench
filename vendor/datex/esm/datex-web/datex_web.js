import * as imports from "./datex_web.internal.js";
import { detectRuntime, runtimeInterface } from "../utils/js-runtime-compat/js-runtime.js";

let wasmUrl;
const isViteProduction = import.meta.env?.MODE === "production";
if (detectRuntime() == "browser" && isViteProduction) {
    wasmUrl = (await import("./wasm_url.node.js")).default;
} else {
    wasmUrl = new URL("datex_web.wasm", import.meta.url);
}

const wasm = (await runtimeInterface.instantiateWebAssembly(wasmUrl, {
    "./datex_web_bg.js": imports,
})).instance;
export * from "./datex_web.internal.js";
import { __wbg_set_wasm } from "./datex_web.internal.js";
export const memory = wasm.exports.memory;
__wbg_set_wasm(wasm.exports);
wasm.exports.__wbindgen_start();
