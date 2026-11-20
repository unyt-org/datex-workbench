/**
 * Helper methods for creating update data dif structures.
 */
import type { DIFValueContainer } from "./types/mod.js";
import { type DIFUpdateData } from "./types/update.js";
/**
 * Creates a DIFUpdateData structure representing a clear operation.
 * @param path The path to the property being updated (optional).
 * @returns A DIFUpdateData structure representing the clear operation.
 */
export declare function clear(path?: DIFValueContainer[]): DIFUpdateData;
/**
 * Creates a DIFUpdateData structure representing a replace operation.
 * @param value The new value to replace the existing value with.
 * @param path The path to the property being updated (optional).
 * @returns A DIFUpdateData structure representing the replace operation.
 */
export declare function replace(value: DIFValueContainer, path?: DIFValueContainer[]): DIFUpdateData;
/**
 * Creates a DIFUpdateData structure representing an append entry operation.
 * @param value The value to append to the collection.
 * @param path The path to the property being updated (optional).
 * @returns A DIFUpdateData structure representing the append entry operation.
 */
export declare function appendEntry(value: DIFValueContainer, path?: DIFValueContainer[]): DIFUpdateData;
/**
 * Creates a DIFUpdateData structure representing a set entry operation.
 * @param key The key of the entry to set.
 * @param value The value to set for the specified key.
 * @param path The path to the property being updated (optional).
 * @returns A DIFUpdateData structure representing the set entry operation.
 */
export declare function setEntry(key: DIFValueContainer, value: DIFValueContainer, path?: DIFValueContainer[]): DIFUpdateData;
/**
 * Creates a DIFUpdateData structure representing a set entry operation for an array.
 * @param index The index of the entry to set.
 * @param value The value to set for the specified key.
 * @param path The path to the property being updated (optional).
 * @returns A DIFUpdateData structure representing the set entry operation.
 */
export declare function setArrayEntry(index: number, value: DIFValueContainer, path?: DIFValueContainer[]): DIFUpdateData;
/**
 * Creates a DIFUpdateData structure representing a delete entry operation.
 * @param key The key of the entry to delete.
 * @param path The path to the property being updated (optional).
 * @returns A DIFUpdateData structure representing the delete entry operation.
 */
export declare function deleteEntry(key: DIFValueContainer, path?: DIFValueContainer[]): DIFUpdateData;
/**
 * Creates a DIFUpdateData structure representing a delete entry operation for an array.
 * @param index
 * @param path
 */
export declare function deleteArrayEntry(index: number, path?: DIFValueContainer[]): DIFUpdateData;
/**
 * Creates a DIFUpdateData structure representing a list splice operation.
 * @param start The starting index of the splice operation.
 * @param deleteCount The number of elements to delete.
 * @param items The items to insert at the specified start index.
 * @param path The path to the property being updated (optional).
 * @returns A DIFUpdateData structure representing the list splice operation.
 */
export declare function listSplice(start: number, deleteCount: number, items: DIFValueContainer[], path?: DIFValueContainer[]): DIFUpdateData;
