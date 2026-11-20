/**
 * @module shared-container/mod.ts
 * @description
 * This module provides wrapper classes, types and utility functions for shared containers in the DATEX runtime.
 */
import { DIFSharedContainerOwnership } from "../dif/types/mod.js";
import type { SharedContainerMutability } from "./base-shared-container.js";
import type { OwnedSharedContainer } from "./owned.js";
import type { ReferencedSharedContainer, SharedReferenceMutability } from "./reference.js";
export * from "./base-shared-container.js";
export * from "./reference.js";
export * from "./owned.js";
declare const PointerAddressBrand: unique symbol;
declare const PointerAddressWithOwnershipBrand: unique symbol;
export type PointerAddressWithOwnership = string & {
    [PointerAddressWithOwnershipBrand]: never;
};
export type PointerAddress = string & {
    [PointerAddressBrand]: never;
};
/**
 * Splits a PointerAddressWithOwnership into its ownership and address components.
 * @param address The PointerAddressWithOwnership to split.
 * @returns A array containing the ownership and the pointer address.
 */
export declare function splitPointerAddressWithOwnership(address: PointerAddressWithOwnership): [DIFSharedContainerOwnership, PointerAddress];
/**
 * Combines a pointer address with an ownership prefix to create a PointerAddressWithOwnership.
 * @param address The pointer address to combine with ownership.
 * @param ownership The ownership to prefix to the pointer address.
 * @returns A PointerAddressWithOwnership that combines the ownership prefix and the pointer address.
 */
export declare function combinePointerAddressWithOwnership(address: PointerAddress, ownership: DIFSharedContainerOwnership): PointerAddressWithOwnership;
/**
 * Strip the ownership prefix from a pointer address with ownership, returning just the pointer address.
 * @param address The pointer address with ownership to normalize.
 * @returns The normalized pointer address without ownership prefix.
 */
export declare function addressWithoutOwnership(address: PointerAddressWithOwnership): PointerAddress;
/**
 * Represents a shared container, which can be either an owned container or a referenced container.
 */
export type SharedContainer<T, Mutability extends SharedContainerMutability = SharedContainerMutability> = OwnedSharedContainer<T, Mutability> | ReferencedSharedContainer<T, Mutability, typeof SharedReferenceMutability.Immutable> | ReferencedSharedContainer<T, Mutability, typeof SharedReferenceMutability.Mutable>;
declare const SharedReferencedTag: unique symbol;
/**
 * The SharedReferenced type represents a referenced shared value, which is a reference to a shared value that can be either mutable or immutable.
 * The underlying value can be mutable or not.
 */
export type SharedRef<T extends object, Mutability extends SharedContainerMutability = SharedContainerMutability, ReferenceMutability extends SharedReferenceMutability = SharedReferenceMutability> = Mutability extends SharedContainerMutability.Immutable ? ReferenceMutability extends SharedReferenceMutability.Mutable ? never : SharedReferenceInner<T, Mutability, ReferenceMutability> : SharedReferenceInner<T, Mutability, ReferenceMutability>;
export type MaybeSharedRef<T, Mutability extends SharedContainerMutability> = T extends object ? SharedRef<T, Mutability> : T;
type SharedReferenceInner<T extends object, Mutability extends SharedContainerMutability, ReferenceMutability extends SharedReferenceMutability> = T & {
    [SharedReferencedTag]: {
        mutability: Mutability;
        referenceMutability: ReferenceMutability;
    };
};
export type AsShared<T, Mutability extends SharedContainerMutability> = T extends object ? SharedRef<T, Mutability> | SharedContainer<T, Mutability> : SharedContainer<T, Mutability>;
export type AsSharedMaybeOwned<T, Mutability extends SharedContainerMutability> = T extends object ? SharedRef<T, Mutability> | OwnedSharedContainer<T, Mutability> : OwnedSharedContainer<T, Mutability>;
