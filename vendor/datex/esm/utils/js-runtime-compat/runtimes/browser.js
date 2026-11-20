export default class BrowserRuntimeInterface {
    type = "browser";
    async readTextFile(path) {
        const response = await fetch(path.toString());
        return await response.text();
    }
    async readFile(path) {
        const response = await fetch(path.toString());
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    }
    instantiateWebAssembly(path, importObject) {
        return WebAssembly.instantiateStreaming(fetch(path), importObject);
    }
}
