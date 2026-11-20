export function panic(message = "unknown") {
    throw new Error(`Panic: ${message}`);
}
export function unreachable(message = "unknown") {
    throw new Error(`Unreachable code reached: ${message}`);
}
export function unimplemented(message = "unknown") {
    throw new Error(`Not implemented: ${message}`);
}
export function assert(condition, message = "unknown") {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}
