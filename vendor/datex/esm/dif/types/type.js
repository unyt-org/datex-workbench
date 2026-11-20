/**
 * @module DIF Types
 * @description
 * This module contains all type definitions related to the representation of types in DIF.
 */
export const DIFLocalMutability = {
    Immutable: 0,
    Mutable: 1,
};
export const DIFLocalOwnership = {
    Immutable: 0,
    Mutable: 1,
    Owned: null,
};
export const DIFSharedContainerOwnership = {
    ImmutableRef: 0,
    MutableRef: 1,
    Owned: null,
};
/**
 * Creates an immutable local DIFType for a given DIFTypeDefinition.
 * @param def The DIFTypeDefinition to create the DIFType for.
 * @returns A DIFType with the given definition and immutable local metadata.
 */
export function defaultDIFTypeForDefinition(def) {
    return [
        {
            kind: "local",
            mutability: DIFLocalMutability.Immutable,
        },
        def,
    ];
}
export const DIFCallableKind = {
    Function: "function",
    Procedure: "procedure",
};
