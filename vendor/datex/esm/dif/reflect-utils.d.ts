/**
 * Utility reflect functions for intercepting property access on objects.
 */
import type { Option } from "../utils/option.js";
/**
 * Gets all own and inherited property keys (including symbols) of an object, excluding those from Object.prototype.
 * @param obj The object to retrieve property keys from.
 * @returns A Set containing all own and inherited property keys of the object.
 */
export declare function getAllObjectKeys(obj: object): Set<(string | symbol)>;
/**
 * Gets the property descriptor for a given key in an object, searching through the prototype chain if necessary.
 * @param obj The object to retrieve the property descriptor from.
 * @param key The property key to look for.
 * @returns The property descriptor for the specified key, or undefined if not found.
 */
export declare function getOwnPropertyDescriptorInPrototypeChain(obj: object, key: string | symbol): PropertyDescriptor | undefined;
/**
 * This function intercepts property access (get and set) on an object by defining custom getters and setters for the specified keys. It allows you to provide custom handlers for get and set operations, while still preserving the original behavior of the object.
 * @param originalObject The object whose property access is to be intercepted.
 * @param getHandler A function to handle property get operations. It receives the property key and should return an Option containing the value if handled.
 * @param setHandler A function to handle property set operations. It receives the property key and the value being set.
 * @param keys An iterable of property keys to intercept. Defaults to all own and inherited keys of the original object.
 */
export declare function interceptAccessors(originalObject: object, getHandler?: ((key: string | symbol) => Option<unknown>) | null, setHandler?: ((key: string | symbol, value: unknown) => void) | null, keys?: Iterable<string | symbol>): void;
