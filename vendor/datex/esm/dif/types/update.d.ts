/**
 * @module DIF Update Types
 * @description
 * This module contains all type definitions related to the representation of updates in DIF.
 */
import type { DIFValueContainer } from "./mod.js";
/**
 * Kinds of updates that can be applied to a DIF value.
 */
export declare const DIFUpdateKind: {
    readonly Replace: "replace";
    readonly AppendEntry: "append_entry";
    readonly SetEntry: "set_entry";
    readonly DeleteEntry: "delete_entry";
    readonly Clear: "clear";
    readonly ListSplice: "list_splice";
};
/** A DIF update kind. */
export type DIFUpdateKind = typeof DIFUpdateKind[keyof typeof DIFUpdateKind];
/** Different kinds of updates that can be applied to a DIF value. */
export type DIFUpdateBaseData<Kind extends DIFUpdateKind> = {
    kind: Kind;
};
export type DIFUpdateDataReplace = [DIFValueContainer];
export type DIFUpdateDataPush = [DIFValueContainer];
export type DIFUpdateDataDelete = [DIFValueContainer];
export type DIFUpdateDataSet = [DIFValueContainer, DIFValueContainer];
export type DIFUpdateDataListSplice = [number, number, DIFValueContainer[]];
export type DIFUpdateReturn = ["none"] | ["single_value", DIFValueContainer] | [
    "multiple_values",
    ...DIFValueContainer[]
];
export type DIFUpdateData = [
    DIFValueContainer[],
    typeof DIFUpdateKind.Replace,
    ...DIFUpdateDataReplace
] | [
    DIFValueContainer[],
    typeof DIFUpdateKind.AppendEntry,
    ...DIFUpdateDataPush
] | [
    DIFValueContainer[],
    typeof DIFUpdateKind.DeleteEntry,
    ...DIFUpdateDataDelete
] | [
    DIFValueContainer[],
    typeof DIFUpdateKind.SetEntry,
    ...DIFUpdateDataSet
] | [
    DIFValueContainer[],
    typeof DIFUpdateKind.Clear
] | [
    DIFValueContainer[],
    typeof DIFUpdateKind.ListSplice,
    ...DIFUpdateDataListSplice
];
export type DIFTransceiverId = number;
export type DIFUpdate = [DIFTransceiverId, ...DIFUpdateData];
/** Options for observing DIF pointers. */
export type ObserveOptions = {
    relay_own_updates: boolean;
};
