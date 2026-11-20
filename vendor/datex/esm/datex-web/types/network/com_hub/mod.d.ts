import type { Tagged } from "../../../../lib/mod.js";
/**
 * Represents the direction of a block, either incoming or outgoing, used in the block interceptor callback.
 */
export type BlockDirection = Tagged<"Incoming"> | Tagged<"Outgoing">;
/**
 * The priority of an interface, which determines the order in which interfaces are used for routing fallback logic.
 */
export type InterfacePriority = Tagged<"None"> | Tagged<"Priority", number>;
