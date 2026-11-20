// @generated file from wasmbuild -- do not edit
// deno-lint-ignore-file
// deno-fmt-ignore-file

/* tslint:disable */
/* eslint-disable */

export class JSComHub {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    create_interface(interface_type: string, setup_data: any, priority?: number | null): Promise<string>;
    get_metadata(): any;
    get_metadata_string(): string;
    get_trace(endpoint: string): Promise<any | undefined>;
    get_trace_string(endpoint: string): Promise<string | undefined>;
    register_block_interceptor(callback: Function, include_debug_blocks: boolean): string;
    register_default_interface_factories(): void;
    register_interface_factory(interface_type: string, factory: Function): void;
    remove_interface(interface_uuid: string): Promise<void>;
    remove_socket(socket_uuid: string): Promise<void>;
    unregister_block_interceptor(uuid: string): void;
}

export class JSDIFInterface {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    apply_async(callee: any, args: any): Promise<any>;
    apply_sync(callee: any, args: any): any;
    call_method_async(callee: any, method_name: string, args: any): Promise<any>;
    call_method_sync(callee: any, method_name: string, args: any): any;
    create_inspector(endpoint: string, name: string): Promise<any>;
    create_pointer(value: any): string;
    has_address_with_ownership(address: string, ownership?: number | null): boolean;
    observe_pointer(address: string, observe_options: any, callback: Function): number;
    register_callable(callable: Function, name: string | null | undefined, signature: any, is_method: boolean): string;
    remove_stored_vec(address: number): void;
    /**
     * Resolve a pointer address synchronously if it's in memory, otherwise return an error
     */
    resolve_pointer_address(address: string): any;
    unobserve_pointer(address: string, observer_id: number): void;
    /**
     * Applies a DIF update on a shared container at the given address, using the provided update data.
     * TODO: Can we optimize this, by not returning the update result data back to JS, as it adds unnecessary overhead, as
     * we can access the values in JS before update.
     */
    update(address: string, update: any): any;
    update_observer_options(address: string, observer_id: number, observe_options: any): void;
}

export class JSRuntime {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Compiles a DATEX script with optional inserted values to a DXB body
     */
    compile(script: string, inserted_values?: any[] | null): Promise<Uint8Array>;
    crypto_test_tmp(): Promise<Promise<any>>;
    /**
     * Get a handle to the DIF interface of the runtime
     */
    dif_interface(): JSDIFInterface;
    /**
     * Executes a DATEX script with inserted values, returning the result as DIFValue
     */
    execute(script: string, inserted_values: any[] | null | undefined, mark_as_debug: boolean): Promise<any>;
    /**
     * Executes a DATEX script remotely with inserted values, returning the result as DIFValue
     */
    execute_remote(target: string, script: string, inserted_values: any[] | null | undefined, mark_as_debug: boolean): Promise<any>;
    execute_sync(script: string, dif_values?: any[] | null): any;
    execute_sync_with_string_result(script: string, dif_values: any[] | null | undefined, decompile_options: any): string;
    /**
     * Execute a DATEX script with optional inserted values, returning the result as a string
     */
    execute_with_string_result(script: string, inserted_values: any[] | null | undefined, decompile_options: any, mark_as_debug: boolean): Promise<string>;
    /**
     * Start the LSP server, returning a JS function to send messages to Rust
     */
    start_lsp(send_to_js: Function): Function;
    value_to_string(dif_value: any, decompile_options: any): string;
    com_hub: JSComHub;
    readonly endpoint: string;
    readonly version: string;
}

export class Repl {
    free(): void;
    [Symbol.dispose](): void;
    execute(script: string): Promise<any | undefined>;
    constructor(runtime: JSRuntime, endpoint: string | null | undefined, verbose: boolean);
}

export function create_runtime(config: any, debug_config: any, device_type: string, datex_web_version: any): Promise<JSRuntime>;

export function decompile_dxb_body(dxb: Uint8Array): string;

export function disassemble_dxb_flat(dxb: Uint8Array): any;

export function disassemble_dxb_to_string(dxb: Uint8Array, options: any): any;

export function disassemble_dxb_tree(dxb: Uint8Array): any;
