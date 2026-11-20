export const EMPTY_TAG = Symbol("EMPTY_TAG");
/**
 * A simple wrapper type that allows to associate a string tag with a value.
 * TODO: "enum classes" should extend Tagged class, e.g. class Example extends Tagged<...> but tag->value mapping must be defined somehow in type system
 */
export class Tagged {
    // FIXME: #tag would be better, but has problems with (especially vue) reactivity (Proxies)
    __tag;
    __value;
    constructor(tag, value = EMPTY_TAG) {
        this.__tag = tag;
        this.__value = value;
    }
    get value() {
        return this.__value;
    }
    set value(newValue) {
        this.__value = newValue;
    }
    get tag() {
        return this.__tag;
    }
}
export function tagged(tag, value = EMPTY_TAG) {
    return new Tagged(tag, value);
}
