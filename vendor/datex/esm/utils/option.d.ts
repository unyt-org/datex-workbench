declare enum OptionType {
    Some = 0,
    None = 1
}
export declare class Option<T, Type extends OptionType = OptionType> {
    private readonly kind;
    private readonly value?;
    constructor(kind: Type, value?: T);
    static Some<T>(value: T): Option<T, OptionType.Some>;
    static None<T>(): Option<T, OptionType.None>;
    unwrap(): Type extends OptionType.Some ? T : never;
    expect(message: string): T;
    isSome(): this is Option<T, OptionType.Some>;
    isNone(): this is Option<T, OptionType.None>;
}
export {};
