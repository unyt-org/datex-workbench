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
import type { JsRuntimeInterface, JSRuntimeType } from "./js-runtime-interface.js";
export declare function detectRuntime(): JSRuntimeType;
/** The runtime interface for the current runtime environment */
export declare const runtimeInterface: JsRuntimeInterface;
