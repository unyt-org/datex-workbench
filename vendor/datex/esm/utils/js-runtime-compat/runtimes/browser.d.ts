import type { JsRuntimeInterface } from "../js-runtime-interface.js";
export default class BrowserRuntimeInterface implements JsRuntimeInterface {
    readonly type = "browser";
    readTextFile(path: string | URL): Promise<string>;
    readFile(path: string | URL): Promise<Uint8Array>;
    instantiateWebAssembly(path: URL, importObject?: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource>;
}
