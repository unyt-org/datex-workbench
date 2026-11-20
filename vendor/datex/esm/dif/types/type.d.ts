/**
 * @module DIF Types
 * @description
 * This module contains all type definitions related to the representation of types in DIF.
 */
import type { PointerAddress, PointerAddressWithOwnership, SharedContainerMutability } from "../../shared-container/mod.js";
import type { CoreLibTypeId } from "../core.js";
/**
 * A core lib is directly serialized as number.
 */
export type DIFCoreLibTypeDefinition = CoreLibTypeId;
export type DIFTypeDefinitionMap = {
    literal: DIFLiteralTypeDefinition;
    list: DIFListTypeDefinition;
    map: DIFMapTypeDefinition;
    range: DIFRangeTypeDefinition;
    collection: DIFCollectionTypeDefinition;
    shared: DIFSharedTypeDefinition;
    nested: DIFNestedTypeDefinition;
    callable: DIFCallableTypeDefinition;
    impl_type: DIFImplTypeDefinition;
    intersection: DIFIntersectionTypeDefinition;
    union: DIFUnionTypeDefinition;
    tagged_type: DIFTaggedTypeDefinition;
    marker_type: DIFTypeMarker;
};
export type DIFTypeKey = keyof DIFTypeDefinitionMap;
export declare const DIFLocalMutability: {
    readonly Immutable: 0;
    readonly Mutable: 1;
};
export type DIFLocalMutability = typeof DIFLocalMutability[keyof typeof DIFLocalMutability];
export declare const DIFLocalOwnership: {
    readonly Immutable: 0;
    readonly Mutable: 1;
    readonly Owned: null;
};
export type DIFLocalOwnership = typeof DIFLocalOwnership[keyof typeof DIFLocalOwnership];
export declare const DIFSharedContainerOwnership: {
    readonly ImmutableRef: 0;
    readonly MutableRef: 1;
    readonly Owned: null;
};
export type DIFSharedContainerOwnership = typeof DIFSharedContainerOwnership[keyof typeof DIFSharedContainerOwnership];
export type DIFTypeMetadata = {
    kind: "local";
    mutability: DIFLocalMutability;
    ownership?: DIFLocalOwnership;
} | {
    kind: "shared";
    mutability: SharedContainerMutability;
    ownership: DIFSharedContainerOwnership;
};
export type DIFTypeDefinitionWithMetadata = [
    DIFTypeMetadata,
    DIFTypeDefinition
];
export type SharedContainerContainingNominalType = PointerAddressWithOwnership;
export type DIFType = DIFTypeDefinitionWithMetadata | SharedContainerContainingNominalType | CoreLibTypeId;
/**
 * Creates an immutable local DIFType for a given DIFTypeDefinition.
 * @param def The DIFTypeDefinition to create the DIFType for.
 * @returns A DIFType with the given definition and immutable local metadata.
 */
export declare function defaultDIFTypeForDefinition(def: DIFTypeDefinition): DIFType;
/**
 * The DIFTypeDefinition represents a structural (only for now) type definition in the DIF format.
 */
export type DIFTypeDefinition = DIFCoreLibTypeDefinition | {
    [K in keyof DIFTypeDefinitionMap]: {
        [P in K]: DIFTypeDefinitionMap[K];
    };
}[keyof DIFTypeDefinitionMap];
export type DIFLiteralTypeDefinition = boolean | string | [typeof CoreLibTypeId.integer, number] | [typeof CoreLibTypeId.integer_u8, number] | [typeof CoreLibTypeId.integer_u16, number] | [typeof CoreLibTypeId.integer_u32, number] | [typeof CoreLibTypeId.integer_u64, number] | [typeof CoreLibTypeId.integer_u128, string] | [typeof CoreLibTypeId.integer_i8, number] | [typeof CoreLibTypeId.integer_i16, number] | [typeof CoreLibTypeId.integer_i32, number] | [typeof CoreLibTypeId.integer_i64, number] | [typeof CoreLibTypeId.integer_i128, string] | [typeof CoreLibTypeId.integer_ibig, string] | [typeof CoreLibTypeId.decimal, string] | [typeof CoreLibTypeId.decimal_f32, "nan" | "infinity" | "-infinity" | number] | [typeof CoreLibTypeId.decimal_f64, "nan" | "infinity" | "-infinity" | number] | [typeof CoreLibTypeId.decimal_dbig, string] | [typeof CoreLibTypeId.endpoint, string];
export type DIFListTypeDefinition = DIFType[];
export type DIFMapTypeDefinition = Array<[DIFType, DIFType]>;
export type DIFRangeTypeDefinition = [DIFType, DIFType];
export type DIFNestedTypeDefinition = DIFType;
export type DIFImplTypeDefinition = [DIFType, Array<PointerAddress>];
export type DIFIntersectionTypeDefinition = Array<DIFType>;
export type DIFUnionTypeDefinition = Array<DIFType>;
export type DIFTaggedTypeDefinition = [string, DIFType];
export type DIFTypeMarker = "";
export type DIFSharedTypeDefinition = PointerAddressWithOwnership;
export type DIFCollectionTypeDefinition = DIFCollectionListTypeDefinition | DIFCollectionListSliceTypeDefinition | DIFCollectionMapTypeDefinition | DIFRangeTypeDefinition;
export type DIFCollectionListTypeDefinition = DIFType;
export type DIFCollectionListSliceTypeDefinition = [DIFType, number];
export type DIFCollectionMapTypeDefinition = Array<[DIFType, DIFType]>;
export declare const DIFCallableKind: {
    readonly Function: "function";
    readonly Procedure: "procedure";
};
export type DIFCallableKind = typeof DIFCallableKind[keyof typeof DIFCallableKind];
export type DIFCallableTypeDefinition = {
    kind: DIFCallableKind;
    requires_async: boolean;
    parameters: [string | null, DIFType][];
    rest_parameter: [string | null, DIFType] | null;
    return_type: DIFType | null;
    yeet_type: DIFType | null;
};
