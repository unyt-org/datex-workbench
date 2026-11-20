import { CoreLibTypeId } from "../core.js";
export function i8(value) {
    return [CoreLibTypeId.integer_i8, value];
}
export function i16(value) {
    return [CoreLibTypeId.integer_i16, value];
}
export function i32(value) {
    return [CoreLibTypeId.integer_i32, value];
}
export function i64(value) {
    return [CoreLibTypeId.integer_i64, value];
}
export function u8(value) {
    return [CoreLibTypeId.integer_u8, value];
}
export function u16(value) {
    return [CoreLibTypeId.integer_u16, value];
}
export function u32(value) {
    return [CoreLibTypeId.integer_u32, value];
}
export function u64(value) {
    return [CoreLibTypeId.integer_u64, value.toString()];
}
export function i128(value) {
    return [CoreLibTypeId.integer_i128, value.toString()];
}
export function u128(value) {
    return [CoreLibTypeId.integer_u128, value.toString()];
}
export function ibig(value) {
    return [CoreLibTypeId.integer_ibig, value.toString()];
}
export function integer(value) {
    return [CoreLibTypeId.integer, value.toString()];
}
