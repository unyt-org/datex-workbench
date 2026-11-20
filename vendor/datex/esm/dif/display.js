/**
 * @module
 * @description
 * This module contains helper functions to convert DIF structures to display strings.
 */
import { SharedContainerMutability } from "../shared-container/mod.js";
import { CoreLibTypeId } from "./core.js";
import { isDIFCoreValue, isSharedValueContainer } from "./helpers/values.js";
/**
 * Converts a DIF reference mutability to a display string.
 */
export function mutabilityToDisplayString(mut) {
    if (mut === SharedContainerMutability.Mutable) {
        return "&mut ";
    }
    else if (mut === SharedContainerMutability.Immutable) {
        return "&";
    }
    throw new Error("Unknown mutability: " + mut);
}
/**
 * Converts a DIF reference to a display string.
 */
export function difBaseSharedContainerToDisplayString(reference) {
    const valueString = difValueContainerToDisplayString(reference[0]);
    const mutString = mutabilityToDisplayString(reference[1]);
    const typeString = difTypeDefinitionToDisplayString(reference[2]);
    return `${mutString}${valueString} (allowed: ${typeString})`;
}
/**
 * Converts a DIF value container to a display string.
 */
export function difValueContainerToDisplayString(container) {
    if (isSharedValueContainer(container)) {
        return container._;
    }
    else if (isDIFCoreValue(container)) {
        return difCoreValueToDisplayString(container);
    }
    else {
        return JSON.stringify(container);
    }
}
/**
 * Converts a DIF representation value to a display string.
 */
export function difCoreValueToDisplayString(coreValue) {
    const [id, rawValue] = coreValue;
    switch (id) {
        case CoreLibTypeId.boolean:
        case CoreLibTypeId.text:
        case CoreLibTypeId.endpoint:
        case CoreLibTypeId.integer:
        case CoreLibTypeId.integer_i8:
        case CoreLibTypeId.integer_i16:
        case CoreLibTypeId.integer_i32:
        case CoreLibTypeId.integer_i64:
        case CoreLibTypeId.integer_i128:
        case CoreLibTypeId.integer_u8:
        case CoreLibTypeId.integer_u16:
        case CoreLibTypeId.integer_u32:
        case CoreLibTypeId.integer_u64:
        case CoreLibTypeId.integer_u128:
        case CoreLibTypeId.integer_ibig:
        case CoreLibTypeId.decimal_f32:
        case CoreLibTypeId.decimal_f64:
        case CoreLibTypeId.decimal_dbig:
        case CoreLibTypeId.null:
        case CoreLibTypeId.decimal:
            return JSON.stringify(rawValue);
        case CoreLibTypeId.Unit:
            return "()";
        case CoreLibTypeId.Never:
            return "never";
        case CoreLibTypeId.Any:
            return "unknown";
        case CoreLibTypeId.Range:
            if (Array.isArray(rawValue)) {
                return `[${difValueContainerToDisplayString(rawValue[0])}, ${difValueContainerToDisplayString(rawValue[1])}]`;
            }
            else if (rawValue && typeof rawValue === "object" && "start" in rawValue && "end" in rawValue) {
                return `{ start: ${difValueContainerToDisplayString(rawValue.start)}, end: ${difValueContainerToDisplayString(rawValue.end)} }`;
            }
            else {
                throw new Error("Invalid range value: " + JSON.stringify(rawValue));
            }
        case CoreLibTypeId.Type:
            return difTypeDefinitionToDisplayString(rawValue);
        case CoreLibTypeId.Map:
            if (Array.isArray(rawValue)) {
                return `[${rawValue
                    .map((value) => {
                    if (Array.isArray(value)) {
                        return `[${value
                            .map((item) => difValueContainerToDisplayString(item))
                            .join(", ")}]`;
                    }
                    return difValueContainerToDisplayString(value);
                })
                    .join(", ")}]`;
            }
            if (rawValue && typeof rawValue === "object") {
                return `{ ${Object.entries(rawValue)
                    .map(([key, value]) => `${key}: ${difValueContainerToDisplayString(value)}`)
                    .join(", ")} }`;
            }
            throw new Error("Invalid map value: " + JSON.stringify(rawValue));
        default:
            throw new Error("Unknown core lib type id: " + id);
    }
}
/**
 * Converts a DIF type definition to a display string.
 */
export function difTypeDefinitionToDisplayString(difType) {
    if (typeof difType === "number") {
        return coreLibTypeIdToDisplayString(difType);
    }
    else {
        const [key, def] = Object.entries(difType)[0];
        return `{ ${key}: ${JSON.stringify(def)} }`;
    }
}
/**
 * Converts a core type address to a display string.
 */
export function addressToDisplayString(address) {
    return `$${address}`;
}
/**
 * Converts a core lib type id to a display string.
 * @param typeId The core lib type id to convert.
 * @returns The display string for the given core lib type id.
 */
export function coreLibTypeIdToDisplayString(typeId) {
    return Object.entries(CoreLibTypeId).find(([, value]) => value === typeId)?.[0] ?? "Unknown";
}
