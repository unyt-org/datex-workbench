import type { DIFHandler } from "../../dif/dif-handler.js";
import type { DIFCoreValueEntityTypeDefinition } from "../../dif/types/mod.js";
export declare function createClassForEntityType(entityDef: DIFCoreValueEntityTypeDefinition, dif: DIFHandler): new (...args: unknown[]) => unknown;
