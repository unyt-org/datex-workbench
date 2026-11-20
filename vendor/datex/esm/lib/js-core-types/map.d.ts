import type { TypeBindingDefinition } from "../../dif/type-registry.js";
declare const ORIGINAL_SET: unique symbol;
declare const ORIGINAL_DELETE: unique symbol;
declare const ORIGINAL_CLEAR: unique symbol;
export type MapMetadata<K = unknown, V = unknown> = {
    [ORIGINAL_SET]: Map<K, V>["set"];
    [ORIGINAL_DELETE]: Map<K, V>["delete"];
    [ORIGINAL_CLEAR]: Map<K, V>["clear"];
};
export declare const mapTypeBinding: TypeBindingDefinition<Map<unknown, unknown>, MapMetadata>;
export {};
