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
import { Endpoint, tagged } from "./lib/mod.js";
import { Runtime } from "./runtime/runtime.js";
/**
 * The default configuration for the Datex runtime.
 */
const defaultConfig = {
    endpoint: Endpoint.get("@unyt"),
    name: null,
    interfaces: [{
            priority: tagged("Priority", 1),
            type: "websocket-client",
            config: { url: "wss://example.unyt.land" },
        }],
    env: null,
};
/**
 * The default instance of the Datex runtime.
 */
export const Datex = await Runtime.create(defaultConfig, {
    log_level: "warn",
});
