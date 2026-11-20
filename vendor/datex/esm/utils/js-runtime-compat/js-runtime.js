/**
 * @module
 * @description
 * The runtime module provides a runtimeInterface object that contains common
 * runtime-specific functions for reading files, etc.
 * It automatically detects the runtime environment and provides the correct
 * runtime interface.
 * Supported runtimes are:
 * - Deno
 * - Node.js
 * - Bun
 * - Browser
 */
import BrowserRuntimeInterface from "./runtimes/browser.js";
export function detectRuntime() {
    if (globalThis.navigator?.userAgent.startsWith("Node.js")) {
        return "node";
    }
    else if (globalThis.navigator?.userAgent.startsWith("Deno")) {
        return "deno";
    }
    else if (globalThis.navigator?.userAgent.startsWith("Bun")) {
        return "bun";
    }
    else {
        return "browser";
    }
}
async function getRuntimeInterface(type) {
    if (type == "deno") {
        const { default: Interface } = (await import("./runtimes/deno.js"));
        return new Interface();
    }
    else if (type == "node" || type == "bun") {
        const { default: Interface } = (await import("./runtimes/node.js"));
        return new Interface();
    }
    else {
        return new BrowserRuntimeInterface();
    }
}
/** The runtime interface for the current runtime environment */
export const runtimeInterface = await getRuntimeInterface(detectRuntime());
