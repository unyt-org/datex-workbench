import type { TypeBindingDefinition } from "../../dif/type-registry.js";
import type { CustomReferenceMetadata } from "../../dif/dif-handler.js";
import { type MapMetadata } from "./map.js";
export declare const mapOrObjectTypeBinding: TypeBindingDefinition<Map<unknown, unknown> | Record<string | symbol, unknown>, MapMetadata | CustomReferenceMetadata>;
