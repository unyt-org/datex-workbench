import type { Endpoint } from "../../../lib/mod.js";
import type { InterfacePriority } from "../network/com_hub/mod.js";
/**
 * A generic interface configuration to setup a runtime interface.
 */
export type RuntimeConfigInterface = {
    type: string;
    config: unknown;
    priority: InterfacePriority;
};
export type RuntimeConfig = {
    endpoint: Endpoint;
    name: string | null;
    interfaces: RuntimeConfigInterface[] | null;
    env: Map<string, string> | null;
};
