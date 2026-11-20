/**
 * @module default.ts
 * @description
 * This module exports an instance of the DATEX runtime.
 *
 * @example
 * ```ts
 * import { Datex } from "@unyt/datex/default";
 *
 * // Use the Datex runtime instance
 * const result = await Datex.execute("@example :: 1 + 2");
 * ```
 */
import { Runtime } from "./runtime/runtime.js";
/**
 * The default instance of the Datex runtime.
 */
export declare const Datex: Runtime;
