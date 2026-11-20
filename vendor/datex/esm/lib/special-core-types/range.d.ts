/**
 * Represents a range of numbers with a start and end.
 */
export declare class Range {
    start: number;
    end: number;
    constructor(start: number, end: number);
    /**
     * Gets the length of the range (end - start).
     */
    get length(): number;
    /**
     * Checks if a given value is within the range (inclusive of start, exclusive of end).
     * @param value The number to check.
     * @returns True if the value is within the range, false otherwise.
     */
    contains(value: number): boolean;
    /**
     * Turns a string representation of the range in the format
     * @returns The string representation of the range.
     */
    toString(): string;
    get [Symbol.toStringTag](): string;
    [Symbol.toPrimitive](_hint: string): string;
}
