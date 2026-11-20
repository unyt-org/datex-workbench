/**
 * @module DIF Update Types
 * @description
 * This module contains all type definitions related to the representation of updates in DIF.
 */
/**
 * Kinds of updates that can be applied to a DIF value.
 */
export const DIFUpdateKind = {
    Replace: "replace",
    AppendEntry: "append_entry",
    SetEntry: "set_entry",
    DeleteEntry: "delete_entry",
    Clear: "clear",
    ListSplice: "list_splice",
};
