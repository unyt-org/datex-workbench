/**
 * @param {any} config
 * @param {any} debug_config
 * @param {string} device_type
 * @param {any} datex_web_version
 * @returns {Promise<JSRuntime>}
 */
export function create_runtime(config: any, debug_config: any, device_type: string, datex_web_version: any): Promise<JSRuntime>;
/**
 * @param {Uint8Array} dxb
 * @returns {string}
 */
export function decompile_dxb_body(dxb: Uint8Array): string;
/**
 * @param {Uint8Array} dxb
 * @returns {any}
 */
export function disassemble_dxb_flat(dxb: Uint8Array): any;
/**
 * @param {Uint8Array} dxb
 * @param {any} options
 * @returns {any}
 */
export function disassemble_dxb_to_string(dxb: Uint8Array, options: any): any;
/**
 * @param {Uint8Array} dxb
 * @returns {any}
 */
export function disassemble_dxb_tree(dxb: Uint8Array): any;
export function __wbg_Error_9dc85fe1bc224456(arg0: any, arg1: any): Error;
export function __wbg_Number_4779d427bae39753(arg0: any): number;
export function __wbg_String_8564e559799eccda(arg0: any, arg1: any): void;
export function __wbg___wbindgen_bigint_get_as_i64_8ea6736501f396b6(arg0: any, arg1: any): void;
export function __wbg___wbindgen_boolean_get_b131b2f36d6b2f55(arg0: any): 1 | 0 | 16777215;
export function __wbg___wbindgen_debug_string_56c147eb1a51f0c4(arg0: any, arg1: any): void;
export function __wbg___wbindgen_in_ce8569b2fc6f5088(arg0: any, arg1: any): boolean;
export function __wbg___wbindgen_is_bigint_df272c65456269c2(arg0: any): arg0 is bigint;
export function __wbg___wbindgen_is_function_147961669f068cd4(arg0: any): boolean;
export function __wbg___wbindgen_is_object_3a2c414391dbf751(arg0: any): boolean;
export function __wbg___wbindgen_is_string_6541b0f6ecd4e8e5(arg0: any): arg0 is string;
export function __wbg___wbindgen_is_undefined_4410e3c20a99fa97(arg0: any): boolean;
export function __wbg___wbindgen_jsval_eq_174c93ec61bab0c5(arg0: any, arg1: any): boolean;
export function __wbg___wbindgen_jsval_loose_eq_e07e3b1f5db6da6c(arg0: any, arg1: any): boolean;
export function __wbg___wbindgen_number_get_588ed6b97f0d7e14(arg0: any, arg1: any): void;
export function __wbg___wbindgen_shr_c56e7cc32546f554(arg0: any, arg1: any): number;
export function __wbg___wbindgen_string_get_fa2687d531ed17a5(arg0: any, arg1: any): void;
export function __wbg___wbindgen_throw_bbadd78c1bac3a77(arg0: any, arg1: any): void;
export function __wbg__wbg_cb_unref_c2301a3c9b78104b(arg0: any): void;
export function __wbg_buffer_8524b3453cde4918(arg0: any): any;
export function __wbg_byteLength_96807b1d9ab24a4c(arg0: any): any;
export function __wbg_call_2ad4e88518737145(...args: any[]): any;
export function __wbg_call_91f00ddc43e01490(...args: any[]): any;
export function __wbg_call_ec09a4cf93377d3a(...args: any[]): any;
export function __wbg_cancel_f3a197b26dc88b39(arg0: any): any;
export function __wbg_clearTimeout_113b1cde814ec762(arg0: any): any;
export function __wbg_close_296263cfe1bb2999(...args: any[]): any;
export function __wbg_codePointAt_92c678dd76a87be4(arg0: any, arg1: any): any;
export function __wbg_crypto_43cf0aa0813e3fe3(...args: any[]): any;
export function __wbg_data_8a04443c1e5a8cd3(arg0: any): any;
export function __wbg_debug_916d96e2f1e976c2(arg0: any, arg1: any, arg2: any, arg3: any): void;
export function __wbg_decrypt_434a0a20c1926b35(...args: any[]): any;
export function __wbg_deriveBits_2ef28a1a5553afd1(...args: any[]): any;
export function __wbg_digest_07cbf8c660cbb7ad(...args: any[]): any;
export function __wbg_done_6a8439e544ec6206(arg0: any): any;
export function __wbg_encrypt_c8d1f29c3903aa3a(...args: any[]): any;
export function __wbg_entries_5a6a7e7e0df09fe5(arg0: any): [string, any][];
export function __wbg_error_4dee59d95d79feac(arg0: any, arg1: any, arg2: any, arg3: any): void;
export function __wbg_error_6651fee1c71e5da9(arg0: any): void;
export function __wbg_error_a6fa202b58aa1cd3(arg0: any, arg1: any): void;
export function __wbg_exportKey_ce86487ed97172ea(...args: any[]): any;
export function __wbg_fromCodePoint_9732a81eca648320(...args: any[]): any;
export function __wbg_from_8a57180716c586ee(arg0: any): any[];
export function __wbg_generateKey_073b1d14947ffbdc(...args: any[]): any;
export function __wbg_getRandomValues_d1f6a3c738b6cec2(...args: any[]): any;
export function __wbg_getReader_0cd37e95fbf00f7f(arg0: any): any;
export function __wbg_getWriter_a66f661ac532a709(...args: any[]): any;
export function __wbg_get_44e98e27bda25b5b(...args: any[]): any;
export function __wbg_get_4b90d6d8c5deb5d5(arg0: any, arg1: any): any;
export function __wbg_get_52a8a619f7b88df6(...args: any[]): any;
export function __wbg_get_done_c21b9933fc9a9e9c(arg0: any): 1 | 0 | 16777215;
export function __wbg_get_private_key_0d151957f982887e(arg0: any): any;
export function __wbg_get_public_key_d7128338e1b299e0(arg0: any): any;
export function __wbg_get_unchecked_46e778e3cec74b5e(arg0: any, arg1: any): any;
export function __wbg_get_value_ad568c7d3db9073f(arg0: any): any;
export function __wbg_get_with_ref_key_6412cf3094599694(arg0: any, arg1: any): any;
export function __wbg_importKey_871c11d416fb97ee(...args: any[]): any;
export function __wbg_info_31621acdcc2e6cbc(arg0: any, arg1: any, arg2: any, arg3: any): void;
export function __wbg_instanceof_ArrayBuffer_a581da923203f29f(arg0: any): boolean;
export function __wbg_instanceof_CryptoKey_d5f90a816d96ad67(arg0: any): boolean;
export function __wbg_instanceof_Error_cb5ebd65d798655e(arg0: any): boolean;
export function __wbg_instanceof_Map_7f94c740225003e2(arg0: any): boolean;
export function __wbg_instanceof_Object_34d30ae022f04c89(arg0: any): boolean;
export function __wbg_instanceof_Promise_aa24ea31000d4ee6(arg0: any): boolean;
export function __wbg_instanceof_ReadableStreamDefaultReader_2ab4b6bb85f96463(arg0: any): boolean;
export function __wbg_instanceof_Uint8Array_b6fe1ac89eba107e(arg0: any): boolean;
export function __wbg_instanceof_Window_9e0fe7d3d1ff4342(arg0: any): boolean;
export function __wbg_isArray_139f48e3c057ede8(arg0: any): arg0 is any[];
export function __wbg_isSafeInteger_c22ccb4af2201fe9(arg0: any): boolean;
export function __wbg_iterator_9b36cebf3be7b7cd(): symbol;
export function __wbg_jsruntime_new(arg0: any): any;
export function __wbg_length_68a9d5278d084f4f(arg0: any): any;
export function __wbg_length_7abf942ae12c9744(arg0: any): any;
export function __wbg_length_fb04d16d7bdf6d4c(arg0: any): any;
export function __wbg_log_534d68700f4f2519(arg0: any, arg1: any, arg2: any, arg3: any): void;
export function __wbg_message_5c6ab4dd6c4b34e8(arg0: any): any;
export function __wbg_navigator_e8073f0771c8d619(arg0: any): any;
export function __wbg_new_0b303268aa395a38(): any[];
export function __wbg_new_20b778a4c5c691c3(): Object;
export function __wbg_new_227d7c05414eb861(): Error;
export function __wbg_new_883c0db065f06efd(): Map<any, any>;
export function __wbg_new_a3e5112401a82338(...args: any[]): any;
export function __wbg_new_b06772b280cc6e52(arg0: any): Uint8Array<any>;
export function __wbg_new_from_slice_bb2d1778c0b87eb1(arg0: any, arg1: any): Uint8Array<any>;
export function __wbg_new_typed_90c3f6c29ba36d19(arg0: any, arg1: any): Promise<any>;
export function __wbg_next_8cb028b6ba50743f(...args: any[]): any;
export function __wbg_next_cfd0b146c9538df8(arg0: any): any;
export function __wbg_now_bce4dc999095ea77(): number;
export function __wbg_now_e7c6795a7f81e10f(arg0: any): any;
export function __wbg_of_472cbb5aebb61f18(arg0: any, arg1: any): any[];
export function __wbg_of_5188689822ff45d7(arg0: any): any[];
export function __wbg_open_d98d78c4b7a1c768(arg0: any, arg1: any): any;
export function __wbg_performance_3fcf6e32a7e1ed0a(arg0: any): any;
export function __wbg_prototypesetcall_956c7493c68e29b4(arg0: any, arg1: any, arg2: any): void;
export function __wbg_push_ceb8ef046afb2041(arg0: any, arg1: any): any;
export function __wbg_queueMicrotask_4698f900840e3286(arg0: any): void;
export function __wbg_queueMicrotask_477a5533c7100338(arg0: any): any;
export function __wbg_randomUUID_e5dd7dca4573cb5a(arg0: any, arg1: any): void;
export function __wbg_read_8426c146431f2905(arg0: any): any;
export function __wbg_readable_66d8c77a99f46032(arg0: any): any;
export function __wbg_readyState_25243ad6ce649774(arg0: any): any;
export function __wbg_requestPort_bb908206a009e1c9(arg0: any): any;
export function __wbg_resolve_0183de2e8c6b1d54(arg0: any): Promise<any>;
export function __wbg_send_99d049cae69c53cc(...args: any[]): any;
export function __wbg_serial_7f54fcd24ab16cc5(arg0: any): any;
export function __wbg_setTimeout_ef24d2fc3ad97385(...args: any[]): any;
export function __wbg_set_5f806304fb633ab3(arg0: any, arg1: any, arg2: any): any;
export function __wbg_set_6be42768c690e380(arg0: any, arg1: any, arg2: any): void;
export function __wbg_set_a6ba3ac0e634b822(...args: any[]): any;
export function __wbg_set_baud_rate_9d8ddfbe1b7dbe69(arg0: any, arg1: any): void;
export function __wbg_set_binaryType_8c2dd2cf1cfc2e28(arg0: any, arg1: any): void;
export function __wbg_set_counter_0347cbcd3540ef1f(arg0: any, arg1: any): void;
export function __wbg_set_da33c120a6584674(arg0: any, arg1: any, arg2: any): void;
export function __wbg_set_length_89bd687854acccd5(arg0: any, arg1: any): void;
export function __wbg_set_name_212a8e4fc124e29b(arg0: any, arg1: any, arg2: any): void;
export function __wbg_set_onclose_9cb5c3372e16c192(arg0: any, arg1: any): void;
export function __wbg_set_onerror_190fe67e911ebf28(arg0: any, arg1: any): void;
export function __wbg_set_onmessage_96337495f0bfb796(arg0: any, arg1: any): void;
export function __wbg_set_onopen_3e2bf6b11d434c2d(arg0: any, arg1: any): void;
export function __wbg_sign_0be635e70fca00c4(...args: any[]): any;
export function __wbg_slice_48ba39549a845019(arg0: any, arg1: any): void;
export function __wbg_stack_3b0d974bbf31e44f(arg0: any, arg1: any): void;
export function __wbg_static_accessor_GLOBAL_60a4124bab7dcc9a(): any;
export function __wbg_static_accessor_GLOBAL_THIS_95ca6460658b5d13(): any;
export function __wbg_static_accessor_SELF_4c95f759a91e9aae(): any;
export function __wbg_static_accessor_WINDOW_44b435597f9e9ee7(): any;
export function __wbg_subtle_8f1ee4c21d530fce(arg0: any): any;
export function __wbg_then_254bab9b266a77a5(arg0: any, arg1: any, arg2: any): any;
export function __wbg_then_3ea18602c6a5123b(arg0: any, arg1: any): any;
export function __wbg_toString_b09619b263823abf(arg0: any): any;
export function __wbg_unwrapKey_8c36ebd252475005(...args: any[]): any;
export function __wbg_value_3d3defe09fb1ffca(arg0: any): any;
export function __wbg_verify_618a7b8d4b5707fc(...args: any[]): any;
export function __wbg_warn_9a910409d920f84d(arg0: any, arg1: any, arg2: any, arg3: any): void;
export function __wbg_wrapKey_ad361de1031fac4b(...args: any[]): any;
export function __wbg_writable_b89f747b2d1d8950(arg0: any): any;
export function __wbg_write_20b6542ec273cec7(arg0: any, arg1: any): any;
export function __wbindgen_cast_0000000000000001(arg0: any, arg1: any): {
    (...args: any[]): any;
    _wbg_cb_unref(): void;
};
export function __wbindgen_cast_0000000000000002(arg0: any, arg1: any): {
    (...args: any[]): any;
    _wbg_cb_unref(): void;
};
export function __wbindgen_cast_0000000000000003(arg0: any, arg1: any): {
    (...args: any[]): any;
    _wbg_cb_unref(): void;
};
export function __wbindgen_cast_0000000000000004(arg0: any, arg1: any): {
    (...args: any[]): any;
    _wbg_cb_unref(): void;
};
export function __wbindgen_cast_0000000000000005(arg0: any, arg1: any): {
    (...args: any[]): any;
    _wbg_cb_unref(): void;
};
export function __wbindgen_cast_0000000000000006(arg0: any, arg1: any): {
    (...args: any[]): any;
    _wbg_cb_unref(): void;
};
export function __wbindgen_cast_0000000000000007(arg0: any, arg1: any): {
    (...args: any[]): any;
    _wbg_cb_unref(): void;
};
export function __wbindgen_cast_0000000000000008(arg0: any, arg1: any): {
    (...args: any[]): any;
    _wbg_cb_unref(): void;
};
export function __wbindgen_cast_0000000000000009(arg0: any): any;
export function __wbindgen_cast_000000000000000a(arg0: any, arg1: any): bigint;
export function __wbindgen_cast_000000000000000b(arg0: any): any;
export function __wbindgen_cast_000000000000000c(arg0: any, arg1: any): any;
export function __wbindgen_cast_000000000000000d(arg0: any, arg1: any): any;
export function __wbindgen_cast_000000000000000e(arg0: any, arg1: any): bigint;
export function __wbindgen_cast_000000000000000f(arg0: any): bigint;
export function __wbindgen_cast_0000000000000010(arg0: any, arg1: any): any;
export function __wbindgen_init_externref_table(): void;
export function __wbg_set_wasm(val: any): void;
export class JSComHub {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number | undefined;
    __wbg_ptr: number | undefined;
    free(): void;
    /**
     * @param {string} interface_type
     * @param {any} setup_data
     * @param {number | null} [priority]
     * @returns {Promise<string>}
     */
    create_interface(interface_type: string, setup_data: any, priority?: number | null): Promise<string>;
    /**
     * @returns {any}
     */
    get_metadata(): any;
    /**
     * @returns {string}
     */
    get_metadata_string(): string;
    /**
     * @param {string} endpoint
     * @returns {Promise<any | undefined>}
     */
    get_trace(endpoint: string): Promise<any | undefined>;
    /**
     * @param {string} endpoint
     * @returns {Promise<string | undefined>}
     */
    get_trace_string(endpoint: string): Promise<string | undefined>;
    /**
     * @param {Function} callback
     * @param {boolean} include_debug_blocks
     * @returns {string}
     */
    register_block_interceptor(callback: Function, include_debug_blocks: boolean): string;
    register_default_interface_factories(): void;
    /**
     * @param {string} interface_type
     * @param {Function} factory
     */
    register_interface_factory(interface_type: string, factory: Function): void;
    /**
     * @param {string} interface_uuid
     * @returns {Promise<void>}
     */
    remove_interface(interface_uuid: string): Promise<void>;
    /**
     * @param {string} socket_uuid
     * @returns {Promise<void>}
     */
    remove_socket(socket_uuid: string): Promise<void>;
    /**
     * @param {string} uuid
     */
    unregister_block_interceptor(uuid: string): void;
}
export class JSDIFInterface {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number | undefined;
    __wbg_ptr: number | undefined;
    free(): void;
    /**
     * @param {any} callee
     * @param {any} args
     * @returns {Promise<any>}
     */
    apply_async(callee: any, args: any): Promise<any>;
    /**
     * @param {any} callee
     * @param {any} args
     * @returns {any}
     */
    apply_sync(callee: any, args: any): any;
    /**
     * @param {any} callee
     * @param {string} method_name
     * @param {any} args
     * @returns {Promise<any>}
     */
    call_method_async(callee: any, method_name: string, args: any): Promise<any>;
    /**
     * @param {any} callee
     * @param {string} method_name
     * @param {any} args
     * @returns {any}
     */
    call_method_sync(callee: any, method_name: string, args: any): any;
    /**
     * @param {string} endpoint
     * @param {string} name
     * @returns {Promise<any>}
     */
    create_inspector(endpoint: string, name: string): Promise<any>;
    /**
     * @param {any} value
     * @returns {string}
     */
    create_pointer(value: any): string;
    /**
     * @param {string} address
     * @param {number | null} [ownership]
     * @returns {boolean}
     */
    has_address_with_ownership(address: string, ownership?: number | null): boolean;
    /**
     * @param {string} address
     * @param {any} observe_options
     * @param {Function} callback
     * @returns {number}
     */
    observe_pointer(address: string, observe_options: any, callback: Function): number;
    /**
     * @param {Function} callable
     * @param {string | null | undefined} name
     * @param {any} signature
     * @param {boolean} is_method
     * @returns {string}
     */
    register_callable(callable: Function, name: string | null | undefined, signature: any, is_method: boolean): string;
    /**
     * @param {number} address
     */
    remove_stored_vec(address: number): void;
    /**
     * Resolve a pointer address synchronously if it's in memory, otherwise return an error
     * @param {string} address
     * @returns {any}
     */
    resolve_pointer_address(address: string): any;
    /**
     * @param {string} address
     * @param {number} observer_id
     */
    unobserve_pointer(address: string, observer_id: number): void;
    /**
     * Applies a DIF update on a shared container at the given address, using the provided update data.
     * TODO: Can we optimize this, by not returning the update result data back to JS, as it adds unnecessary overhead, as
     * we can access the values in JS before update.
     * @param {string} address
     * @param {any} update
     * @returns {any}
     */
    update(address: string, update: any): any;
    /**
     * @param {string} address
     * @param {number} observer_id
     * @param {any} observe_options
     */
    update_observer_options(address: string, observer_id: number, observe_options: any): void;
}
export class JSRuntime {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number | undefined;
    __wbg_ptr: number | undefined;
    free(): void;
    /**
     * @param {JSComHub} arg0
     */
    set com_hub(arg0: JSComHub);
    /**
     * @returns {JSComHub}
     */
    get com_hub(): JSComHub;
    /**
     * Compiles a DATEX script with optional inserted values to a DXB body
     * @param {string} script
     * @param {any[] | null} [inserted_values]
     * @returns {Promise<Uint8Array>}
     */
    compile(script: string, inserted_values?: any[] | null): Promise<Uint8Array>;
    /**
     * @returns {Promise<Promise<any>>}
     */
    crypto_test_tmp(): Promise<Promise<any>>;
    /**
     * Get a handle to the DIF interface of the runtime
     * @returns {JSDIFInterface}
     */
    dif_interface(): JSDIFInterface;
    /**
     * @returns {string}
     */
    get endpoint(): string;
    /**
     * Executes a DATEX script with inserted values, returning the result as DIFValue
     * @param {string} script
     * @param {any[] | null | undefined} inserted_values
     * @param {boolean} mark_as_debug
     * @returns {Promise<any>}
     */
    execute(script: string, inserted_values: any[] | null | undefined, mark_as_debug: boolean): Promise<any>;
    /**
     * Executes a DATEX script remotely with inserted values, returning the result as DIFValue
     * @param {string} target
     * @param {string} script
     * @param {any[] | null | undefined} inserted_values
     * @param {boolean} mark_as_debug
     * @returns {Promise<any>}
     */
    execute_remote(target: string, script: string, inserted_values: any[] | null | undefined, mark_as_debug: boolean): Promise<any>;
    /**
     * @param {string} script
     * @param {any[] | null} [dif_values]
     * @returns {any}
     */
    execute_sync(script: string, dif_values?: any[] | null): any;
    /**
     * @param {string} script
     * @param {any[] | null | undefined} dif_values
     * @param {any} decompile_options
     * @returns {string}
     */
    execute_sync_with_string_result(script: string, dif_values: any[] | null | undefined, decompile_options: any): string;
    /**
     * Execute a DATEX script with optional inserted values, returning the result as a string
     * @param {string} script
     * @param {any[] | null | undefined} inserted_values
     * @param {any} decompile_options
     * @param {boolean} mark_as_debug
     * @returns {Promise<string>}
     */
    execute_with_string_result(script: string, inserted_values: any[] | null | undefined, decompile_options: any, mark_as_debug: boolean): Promise<string>;
    /**
     * Start the LSP server, returning a JS function to send messages to Rust
     * @param {Function} send_to_js
     * @returns {Function}
     */
    start_lsp(send_to_js: Function): Function;
    /**
     * @param {any} dif_value
     * @param {any} decompile_options
     * @returns {string}
     */
    value_to_string(dif_value: any, decompile_options: any): string;
    /**
     * @returns {string}
     */
    get version(): string;
}
export class Repl {
    /**
     * @param {JSRuntime} runtime
     * @param {string | null | undefined} endpoint
     * @param {boolean} verbose
     */
    constructor(runtime: JSRuntime, endpoint: string | null | undefined, verbose: boolean);
    __destroy_into_raw(): any;
    __wbg_ptr: any;
    free(): void;
    /**
     * @param {string} script
     * @returns {Promise<any | undefined>}
     */
    execute(script: string): Promise<any | undefined>;
}
