import { Endpoint, Range } from "../../lib/mod.js";
import { CoreLibTypeId } from "../mod.js";
/**
 * Gets the core library type id for a given JavaScript value.
 * @param value The JavaScript value to get the core library type id for.
 * @returns The core library type id corresponding to the JavaScript value.
 */
export function getCoreLibTypeIdForJSValue(value) {
    if (value === null) {
        return CoreLibTypeId.null;
    }
    else if (typeof value === "string") {
        return CoreLibTypeId.text;
    }
    else if (typeof value === "boolean") {
        return CoreLibTypeId.boolean;
    }
    else if (typeof value === "number") {
        return CoreLibTypeId.decimal_f64;
    }
    else if (typeof value === "bigint") {
        return CoreLibTypeId.integer_ibig;
    }
    else if (value instanceof Endpoint) {
        return CoreLibTypeId.endpoint;
    }
    else if (value instanceof Range) {
        return CoreLibTypeId.Range;
    }
    else if (Array.isArray(value)) {
        return CoreLibTypeId.List;
    }
    else if (value instanceof Map) {
        return CoreLibTypeId.Map;
    }
    else if (typeof value === "object") {
        return CoreLibTypeId.Map;
    }
    else if (typeof value === "function") {
        return CoreLibTypeId.Callable;
    }
    throw new Error(`Unsupported JavaScript value type for DIF conversion: ${typeof value}`);
}
