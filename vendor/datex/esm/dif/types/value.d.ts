/**
 * @module DIF Value Types
 * @description
 * This module contains all type definitions related to the representation of values in DIF.
 */
import type { PointerAddress, PointerAddressWithOwnership, SharedContainerMutability } from "../../shared-container/mod.js";
import type { CoreLibTypeId } from "../core.js";
import type { DIFTypeDefinition } from "./type.js";
/**
 * An optional DIF value container, which can either be null or contain a DIFValueContainer. This is used to represent values that may be absent or optional in certain contexts within the DIF system.
 */
export type DIFOptionalValueContainer = null | [DIFValueContainer];
/**
 * DIF value container, which can be either a pointer address or a value.
 */
export type DIFValueContainer<T = unknown> = DIFSharedValue | DIFValue;
/**
 * A DATEX pointer address representation in the DIF format.
 */
export type DIFSharedValue = {
    _: PointerAddressWithOwnership;
};
/**
 * A DIF value, which can be directly represented in the DIF format (e.g., primitive types) or a value including
 * additional type information.
 */
export type DIFValue = DIFClassifiedValue | DIFCoreValueWithTag;
export type DIFClassifiedValue = {
    _: "c";
    c?: DIFClassification;
    v: DIFCoreValueWithTag;
};
export type DIFCoreValueWithTag = DIFDirectRepresentationValue | DIFTaggedValue | DIFCoreValue | DIFInMemoryValue;
export type DIFTaggedValue = {
    _: "t";
    t: DIFValueTag;
    v: DIFCoreValue;
};
export type DIFValueTag = [tag: string, is_empty?: true];
export type DIFCoreValue = [CoreLibTypeId, DIFRawValue];
export type DIFInMemoryValue = [null, CoreLibTypeId, number, number];
export type DIFClassification = [
    PointerAddressWithOwnership | null,
    // entity address
    PointerAddress[] | null
];
/**
 * Types of values that can be directly represented in DIF without
 * additional type information (e.g., for primitive types like text, f64, boolean, and null).
 */
export type DIFDirectRepresentationValue = boolean | string | number | null;
/**
 * Represents a list of DIFValueContainers.
 */
export type DIFCoreValueList = Array<DIFValueContainer>;
/**
 * Represents a map of key-value pairs in DIF, where both keys and values are DIFValueContainers.
 */
export type DIFCoreValueMap = Array<[DIFValueContainer, DIFValueContainer]>;
/**
 * Represents a callable definition with hash and optional name
 */
export type DIFCoreValueCallable = [string, string | null, boolean | null];
/**
 * Represents a range of values in DIF, defined by a start and end value container, or as a tuple of two value containers.
 */
export type DIFCoreValueRange = [DIFValueContainer, DIFValueContainer] | {
    start: DIFValueContainer;
    end: DIFValueContainer;
};
export type DIFCoreValueEntityTypeDefinition = [
    string,
    DIFTypeDefinition,
    [
        [
            typeof CoreLibTypeId.Callable,
            DIFCoreValueCallable
        ][],
        [
            typeof CoreLibTypeId.Callable,
            DIFCoreValueCallable
        ][]
    ][]
];
/**
 * Represents a core value in DIF, which can be a primitive value, a structured object, a list, or a map.
 */
export type DIFRawValue = DIFCoreValueList | DIFCoreValueMap | DIFCoreValueRange | DIFCoreValueCallable | Record<string, DIFValueContainer> | DIFTypeDefinition | DIFDirectRepresentationValue | DIFCoreValueEntityTypeDefinition;
/**
 * Base struct for the shared value container.
 * The allowed type is optional and can be used to specify the type of value that can be stored in the container.
 * If the allowed type is not provided, it means that the type is inferred based on the provided value container.
 */
export type DIFBaseSharedValueContainer = [
    DIFValueContainer,
    SharedContainerMutability,
    DIFTypeDefinition
];
