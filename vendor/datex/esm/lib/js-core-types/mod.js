/**
 * @module js-core-types
 * @description
 * This module contains all core type definitions that have a builtin JS mapping, such as arrays and maps.
 */
import { mapOrObjectTypeBinding } from "./map_or_object.js";
export * from "./map.js";
export * from "./array.js";
import { arrayTypeBinding } from "../mod.js";
import { readableStreamTypeBinding } from "../web-api-types/readable-stream.js";
export function registerCoreTypeBindings(registry) {
    registry.registerTypeBinding(arrayTypeBinding);
    registry.registerTypeBinding(mapOrObjectTypeBinding);
    registry.registerTypeBinding(readableStreamTypeBinding);
}
