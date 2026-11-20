/**
 * @module DIF Core
 * @description
 * This module contains core library specific mappings of core type ids.
 */
/**
 * Mapping of core types to their respective type id.
 */
export declare const CoreLibTypeId: {
    readonly null: 1;
    readonly boolean: 2;
    readonly integer: 3;
    readonly integer_u8: 500;
    readonly integer_u16: 501;
    readonly integer_u32: 502;
    readonly integer_u64: 503;
    readonly integer_u128: 504;
    readonly integer_i8: 505;
    readonly integer_i16: 506;
    readonly integer_i32: 507;
    readonly integer_i64: 508;
    readonly integer_i128: 509;
    readonly integer_ibig: 510;
    readonly decimal: 4;
    readonly decimal_f32: 511;
    readonly decimal_f64: 512;
    readonly decimal_dbig: 513;
    readonly text: 5;
    readonly endpoint: 6;
    readonly instant: 7;
    readonly Unit: 8;
    readonly Never: 9;
    readonly Any: 10;
    readonly List: 11;
    readonly Map: 12;
    readonly Callable: 13;
    readonly Range: 14;
    readonly Type: 15;
    readonly Container: 16;
    readonly EntityTypeDefinition: 17;
    readonly Sender: 18;
    readonly Receiver: 19;
};
/**
 * Type representing the core library type ids.
 */
export type CoreLibTypeId = typeof CoreLibTypeId[keyof typeof CoreLibTypeId];
