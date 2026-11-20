/**
 * Creates a reserved pointer address for a js lib type with the given id.
 * The endpoint is the broadcast (reserved) endpoint. This can be used for builtin types.
 * @param id Id of the js lib type. Must be a non-negative integer that fits into 5 bytes.
 * @returns The reserved pointer address for the js lib type with the given id.
 */
export function createReservedPointerAddress(id) {
    const idHex = id.toString(16).toLowerCase();
    if (!Number.isInteger(id) || id < 0 || idHex.length > 10) {
        throw new Error("invalid id");
    }
    return "ff".repeat(21) + idHex.padStart(10, "0");
}
/**
 * Mapping of js lib types to their unique reserved internal pointer addresses.
 * These addresses are used to identify impl types dedicated to special js lib types.
 */
export const JsLibTypeAddress = {
    undefined: createReservedPointerAddress(0),
};
