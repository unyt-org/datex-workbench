/**
 * Represents a range of numbers with a start and end.
 */
export class Range {
    start;
    end;
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    /**
     * Gets the length of the range (end - start).
     */
    get length() {
        return this.end - this.start;
    }
    /**
     * Checks if a given value is within the range (inclusive of start, exclusive of end).
     * @param value The number to check.
     * @returns True if the value is within the range, false otherwise.
     */
    contains(value) {
        return value >= this.start && value < this.end;
    }
    /**
     * Turns a string representation of the range in the format
     * @returns The string representation of the range.
     */
    toString() {
        return `${this.start}..${this.end}`;
    }
    get [Symbol.toStringTag]() {
        return this.toString();
    }
    [Symbol.toPrimitive](_hint) {
        return this.toString();
    }
}
