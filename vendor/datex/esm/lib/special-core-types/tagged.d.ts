export declare const EMPTY_TAG: unique symbol;
/**
 * A simple wrapper type that allows to associate a string tag with a value.
 * TODO: "enum classes" should extend Tagged class, e.g. class Example extends Tagged<...> but tag->value mapping must be defined somehow in type system
 */
export declare class Tagged<Tag extends string, const Value = typeof EMPTY_TAG> {
    __tag: Tag;
    __value: Value;
    constructor(tag: Tag, value?: Value);
    get value(): Value;
    set value(newValue: Value);
    get tag(): Tag;
}
/**
 * Creates a new Tagged instance with the given tag and value.
 */
export declare function tagged<Tag extends string>(tag: Tag): Tagged<Tag, typeof EMPTY_TAG>;
export declare function tagged<Tag extends string, const Value>(tag: Tag, value: Value): Tagged<Tag, Value>;
