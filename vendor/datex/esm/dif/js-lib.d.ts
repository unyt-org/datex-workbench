import type { PointerAddress } from "../shared-container/mod.js";
/**
 * Creates a reserved pointer address for a js lib type with the given id.
 * The endpoint is the broadcast (reserved) endpoint. This can be used for builtin types.
 * @param id Id of the js lib type. Must be a non-negative integer that fits into 5 bytes.
 * @returns The reserved pointer address for the js lib type with the given id.
 */
export declare function createReservedPointerAddress(id: number): PointerAddress;
/**
 * Mapping of js lib types to their unique reserved internal pointer addresses.
 * These addresses are used to identify impl types dedicated to special js lib types.
 */
export declare const JsLibTypeAddress: {
    readonly undefined: PointerAddress;
};
/**
 * Type representing the unique pointer addresses of js lib types.
 */
export type JsLibTypeAddress = typeof JsLibTypeAddress[keyof typeof JsLibTypeAddress];
