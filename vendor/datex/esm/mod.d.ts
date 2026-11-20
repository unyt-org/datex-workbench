/**
 * @module mod.ts
 * @description
 * This module exports all public APIs of the DATEX runtime.
 *
 * @example
 * ```ts
 * import { Runtime } from "@unyt/datex";
 *
 * // Create a runtime instance
 * export const runtime: Runtime = await Runtime.create({
 *    interfaces: [{
 *         type: "websocket-client",
 *         config: { url: "wss://example.unyt.land" },
 *     }],
 * });
 *
 *  // Use the runtime instance
 * const result = await runtime.execute("@example :: 1 + 2");
 * ```
 */
export * from "./runtime/runtime.js";
export * as DIF from "./dif/mod.js";
export * as Network from "./network/mod.js";
export * as Builtins from "./lib/mod.js";
export * as Shared from "./shared-container/mod.js";
export * from "./repl/mod.js";
export type * from "./datex-core-types.js";
import "./utils/devtools-formatter.js";
