import type { JsRuntimeInterface } from "../js-runtime-interface.js";
export default class DenoRuntimeInterface implements JsRuntimeInterface {
    readonly type = "deno";
    readTextFile(path: string | URL): Promise<string>;
    readFile(path: string | URL): Promise<Uint8Array>;
    instantiateWebAssembly(path: URL, importObject?: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource>;
}
