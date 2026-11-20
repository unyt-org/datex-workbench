import * as fs from "node:fs/promises";
export default class NodeRuntimeInterface {
    type = "node";
    readTextFile(path) {
        return fs.readFile(path, { encoding: "utf-8" });
    }
    readFile(path) {
        return fs.readFile(path);
    }
    async instantiateWebAssembly(path, importObject) {
        const file = await fs.readFile(path);
        return (await WebAssembly.instantiate(file, importObject));
    }
}
