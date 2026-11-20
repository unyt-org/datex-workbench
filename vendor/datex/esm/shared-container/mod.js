/**
 * @module shared-container/mod.ts
 * @description
 * This module provides wrapper classes, types and utility functions for shared containers in the DATEX runtime.
 */
import { DIFSharedContainerOwnership } from "../dif/types/mod.js";
export * from "./base-shared-container.js";
export * from "./reference.js";
export * from "./owned.js";
/**
 * Splits a PointerAddressWithOwnership into its ownership and address components.
 * @param address The PointerAddressWithOwnership to split.
 * @returns A array containing the ownership and the pointer address.
 */
export function splitPointerAddressWithOwnership(address) {
    const [ownershipStr, addressStr] = address.split("$");
    if (ownershipStr === "") {
        return [DIFSharedContainerOwnership.Owned, addressStr];
    }
    else if (ownershipStr === "'") {
        return [DIFSharedContainerOwnership.ImmutableRef, addressStr];
    }
    else if (ownershipStr === "'mut") {
        return [DIFSharedContainerOwnership.MutableRef, addressStr];
    }
    throw new Error(`Invalid pointer address with ownership: ${address}`);
}
/**
 * Combines a pointer address with an ownership prefix to create a PointerAddressWithOwnership.
 * @param address The pointer address to combine with ownership.
 * @param ownership The ownership to prefix to the pointer address.
 * @returns A PointerAddressWithOwnership that combines the ownership prefix and the pointer address.
 */
export function combinePointerAddressWithOwnership(address, ownership) {
    let ownershipStr = "";
    if (ownership === DIFSharedContainerOwnership.ImmutableRef) {
        ownershipStr = "'";
    }
    else if (ownership === DIFSharedContainerOwnership.MutableRef) {
        ownershipStr = "'mut";
    }
    return `${ownershipStr}$${address}`;
}
/**
 * Strip the ownership prefix from a pointer address with ownership, returning just the pointer address.
 * @param address The pointer address with ownership to normalize.
 * @returns The normalized pointer address without ownership prefix.
 */
export function addressWithoutOwnership(address) {
    const [, addressStr] = splitPointerAddressWithOwnership(address);
    return addressStr;
}
