/**
 * @module
 * @description
 * This module contains helper functions to convert DIF structures to display strings.
 */
import { SharedContainerMutability } from "../shared-container/mod.js";
import { CoreLibTypeId } from "./core.js";
import type { DIFBaseSharedValueContainer, DIFCoreValue, DIFTypeDefinition, DIFValueContainer } from "./types/mod.js";
import type { PointerAddress } from "../shared-container/mod.js";
/**
 * Converts a DIF reference mutability to a display string.
 */
export declare function mutabilityToDisplayString(mut: SharedContainerMutability): string;
/**
 * Converts a DIF reference to a display string.
 */
export declare function difBaseSharedContainerToDisplayString(reference: DIFBaseSharedValueContainer): string;
/**
 * Converts a DIF value container to a display string.
 */
export declare function difValueContainerToDisplayString(container: DIFValueContainer): string;
/**
 * Converts a DIF representation value to a display string.
 */
export declare function difCoreValueToDisplayString(coreValue: DIFCoreValue): string;
/**
 * Converts a DIF type definition to a display string.
 */
export declare function difTypeDefinitionToDisplayString(difType: DIFTypeDefinition): string;
/**
 * Converts a core type address to a display string.
 */
export declare function addressToDisplayString(address: PointerAddress): string;
/**
 * Converts a core lib type id to a display string.
 * @param typeId The core lib type id to convert.
 * @returns The display string for the given core lib type id.
 */
export declare function coreLibTypeIdToDisplayString(typeId: CoreLibTypeId): string;
