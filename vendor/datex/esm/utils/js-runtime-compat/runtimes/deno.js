export default class DenoRuntimeInterface {
    type = "deno";
    readTextFile(path) {
        return Deno.readTextFile(path);
    }
    readFile(path) {
        return Deno.readFile(path);
    }
    instantiateWebAssembly(path, importObject) {
        return WebAssembly.instantiateStreaming(fetch(path), importObject);
    }
}
