import { panic } from "./exceptions.js";
var OptionType;
(function (OptionType) {
    OptionType[OptionType["Some"] = 0] = "Some";
    OptionType[OptionType["None"] = 1] = "None";
})(OptionType || (OptionType = {}));
export class Option {
    kind;
    value;
    constructor(kind, value) {
        this.kind = kind;
        if (kind === OptionType.Some) {
            this.value = value;
        }
    }
    static Some(value) {
        return new Option(OptionType.Some, value);
    }
    static None() {
        return new Option(OptionType.None);
    }
    unwrap() {
        if (this.kind === OptionType.Some) {
            return this.value;
        }
        else {
            panic("Called unwrap on a None value");
        }
    }
    expect(message) {
        if (this.kind === OptionType.Some) {
            return this.value;
        }
        else {
            panic(message);
        }
    }
    isSome() {
        return this.kind === OptionType.Some;
    }
    isNone() {
        return this.kind === OptionType.None;
    }
}
