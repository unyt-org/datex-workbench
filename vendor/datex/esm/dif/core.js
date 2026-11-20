/**
 * @module DIF Core
 * @description
 * This module contains core library specific mappings of core type ids.
 */
/**
 * Mapping of core types to their respective type id.
 */
export const CoreLibTypeId = {
    null: 1,
    boolean: 2,
    integer: 3,
    integer_u8: 500,
    integer_u16: 501,
    integer_u32: 502,
    integer_u64: 503,
    integer_u128: 504,
    integer_i8: 505,
    integer_i16: 506,
    integer_i32: 507,
    integer_i64: 508,
    integer_i128: 509,
    integer_ibig: 510,
    decimal: 4,
    decimal_f32: 511,
    decimal_f64: 512,
    decimal_dbig: 513,
    text: 5,
    endpoint: 6,
    instant: 7,
    Unit: 8,
    Never: 9,
    Any: 10,
    List: 11,
    Map: 12,
    Callable: 13,
    Range: 14,
    Type: 15,
    Container: 16,
    EntityTypeDefinition: 17,
    Sender: 18,
    Receiver: 19,
};
