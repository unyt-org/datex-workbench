import type { JsRuntimeInterface } from "../js-runtime-interface.js";
export default class NodeRuntimeInterface implements JsRuntimeInterface {
    readonly type = "node";
    readTextFile(path: string | URL): Promise<string>;
    readFile(path: string | URL): Promise<Uint8Array>;
    instantiateWebAssembly(path: URL, importObject?: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource>;
}
