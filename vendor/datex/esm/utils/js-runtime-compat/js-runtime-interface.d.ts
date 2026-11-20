/** Type representing the supported JavaScript runtime types */
export type JSRuntimeType = "deno" | "browser" | "node" | "bun";
/** Interface for JavaScript runtime functionalities */
export interface JsRuntimeInterface {
    type: JSRuntimeType;
    readTextFile(path: string | URL): Promise<string>;
    readFile(path: string | URL): Promise<Uint8Array>;
    instantiateWebAssembly(path: URL, importObject?: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource>;
}
