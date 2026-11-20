import { unreachable } from "../../utils/exceptions.js";
export function tryGetClassification(value) {
    if (typeof value === "object" && value !== null && "_" in value && value?._ === "c") {
        if (!("c" in value)) {
            unreachable("DIFValue with _='c' must have a 'c' property");
        }
        return value.c ?? null;
    }
    return null;
}
export function hasImplClassification(value, implTypeAddress) {
    const classification = tryGetClassification(value);
    if (!classification) {
        return false;
    }
    return classificationHasImpl(classification, implTypeAddress);
}
export function classificationHasImpl(classification, implTypeAddress) {
    const [_, implTypes] = classification;
    return implTypes?.includes(implTypeAddress) ?? false;
}
export function createDIFValueWithClassification(value, classification) {
    return {
        _: "c",
        c: classification,
        v: value,
    };
}
export function createDIFValueWithImplClassification(value, implTypeAddresses) {
    return createDIFValueWithClassification(value, [null, implTypeAddresses]);
}
export function createDIFValueWithEntityClassification(value, entityTypeAddress) {
    return createDIFValueWithClassification(value, [entityTypeAddress, []]);
}
export function createDIFValueWithTag(value, tag, is_empty = null) {
    return {
        _: "t",
        t: is_empty ? [tag, is_empty] : [tag],
        v: value,
    };
}
export function isSharedValueContainer(value) {
    return typeof value === "object" && value !== null && "_" in value && value._ !== "t" && value._ !== "c";
}
export function isDIFCoreValue(value) {
    return Array.isArray(value) && value.length === 2;
}
