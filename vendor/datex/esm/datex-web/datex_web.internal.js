// @generated file from wasmbuild -- do not edit
// deno-lint-ignore-file
// deno-fmt-ignore-file
export class JSComHub {
    static __wrap(ptr) {
        const obj = Object.create(JSComHub.prototype);
        obj.__wbg_ptr = ptr;
        JSComHubFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JSComHubFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jscomhub_free(ptr, 0);
    }
    /**
     * @param {string} interface_type
     * @param {any} setup_data
     * @param {number | null} [priority]
     * @returns {Promise<string>}
     */
    create_interface(interface_type, setup_data, priority) {
        const ptr0 = passStringToWasm0(interface_type, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jscomhub_create_interface(this.__wbg_ptr, ptr0, len0, setup_data, isLikeNone(priority) ? 0xFFFFFF : priority);
        return ret;
    }
    /**
     * @returns {any}
     */
    get_metadata() {
        const ret = wasm.jscomhub_get_metadata(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {string}
     */
    get_metadata_string() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.jscomhub_get_metadata_string(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        }
        finally {
            wasm.__wbindgen_free_command_export(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} endpoint
     * @returns {Promise<any | undefined>}
     */
    get_trace(endpoint) {
        const ptr0 = passStringToWasm0(endpoint, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jscomhub_get_trace(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * @param {string} endpoint
     * @returns {Promise<string | undefined>}
     */
    get_trace_string(endpoint) {
        const ptr0 = passStringToWasm0(endpoint, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jscomhub_get_trace_string(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * @param {Function} callback
     * @param {boolean} include_debug_blocks
     * @returns {string}
     */
    register_block_interceptor(callback, include_debug_blocks) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.jscomhub_register_block_interceptor(this.__wbg_ptr, callback, include_debug_blocks);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        }
        finally {
            wasm.__wbindgen_free_command_export(deferred1_0, deferred1_1, 1);
        }
    }
    register_default_interface_factories() {
        wasm.jscomhub_register_default_interface_factories(this.__wbg_ptr);
    }
    /**
     * @param {string} interface_type
     * @param {Function} factory
     */
    register_interface_factory(interface_type, factory) {
        const ptr0 = passStringToWasm0(interface_type, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.jscomhub_register_interface_factory(this.__wbg_ptr, ptr0, len0, factory);
    }
    /**
     * @param {string} interface_uuid
     * @returns {Promise<void>}
     */
    remove_interface(interface_uuid) {
        const ptr0 = passStringToWasm0(interface_uuid, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jscomhub_remove_interface(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * @param {string} socket_uuid
     * @returns {Promise<void>}
     */
    remove_socket(socket_uuid) {
        const ptr0 = passStringToWasm0(socket_uuid, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jscomhub_remove_socket(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * @param {string} uuid
     */
    unregister_block_interceptor(uuid) {
        const ptr0 = passStringToWasm0(uuid, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.jscomhub_unregister_block_interceptor(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose)
    JSComHub.prototype[Symbol.dispose] = JSComHub.prototype.free;
export class JSDIFInterface {
    static __wrap(ptr) {
        const obj = Object.create(JSDIFInterface.prototype);
        obj.__wbg_ptr = ptr;
        JSDIFInterfaceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JSDIFInterfaceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsdifinterface_free(ptr, 0);
    }
    /**
     * @param {any} callee
     * @param {any} args
     * @returns {Promise<any>}
     */
    apply_async(callee, args) {
        const ret = wasm.jsdifinterface_apply_async(this.__wbg_ptr, callee, args);
        return ret;
    }
    /**
     * @param {any} callee
     * @param {any} args
     * @returns {any}
     */
    apply_sync(callee, args) {
        const ret = wasm.jsdifinterface_apply_sync(this.__wbg_ptr, callee, args);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} callee
     * @param {string} method_name
     * @param {any} args
     * @returns {Promise<any>}
     */
    call_method_async(callee, method_name, args) {
        const ptr0 = passStringToWasm0(method_name, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsdifinterface_call_method_async(this.__wbg_ptr, callee, ptr0, len0, args);
        return ret;
    }
    /**
     * @param {any} callee
     * @param {string} method_name
     * @param {any} args
     * @returns {any}
     */
    call_method_sync(callee, method_name, args) {
        const ptr0 = passStringToWasm0(method_name, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsdifinterface_call_method_sync(this.__wbg_ptr, callee, ptr0, len0, args);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} endpoint
     * @param {string} name
     * @returns {Promise<any>}
     */
    create_inspector(endpoint, name) {
        const ptr0 = passStringToWasm0(endpoint, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(name, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.jsdifinterface_create_inspector(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * @param {any} value
     * @returns {string}
     */
    create_pointer(value) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.jsdifinterface_create_pointer(this.__wbg_ptr, value);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0;
                len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        }
        finally {
            wasm.__wbindgen_free_command_export(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {string} address
     * @param {number | null} [ownership]
     * @returns {boolean}
     */
    has_address_with_ownership(address, ownership) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsdifinterface_has_address_with_ownership(this.__wbg_ptr, ptr0, len0, isLikeNone(ownership) ? 0xFFFFFF : ownership);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * @param {string} address
     * @param {any} observe_options
     * @param {Function} callback
     * @returns {number}
     */
    observe_pointer(address, observe_options, callback) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsdifinterface_observe_pointer(this.__wbg_ptr, ptr0, len0, observe_options, callback);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * @param {Function} callable
     * @param {string | null | undefined} name
     * @param {any} signature
     * @param {boolean} is_method
     * @returns {string}
     */
    register_callable(callable, name, signature, is_method) {
        let deferred3_0;
        let deferred3_1;
        try {
            var ptr0 = isLikeNone(name) ? 0 : passStringToWasm0(name, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
            var len0 = WASM_VECTOR_LEN;
            const ret = wasm.jsdifinterface_register_callable(this.__wbg_ptr, callable, ptr0, len0, signature, is_method);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0;
                len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        }
        finally {
            wasm.__wbindgen_free_command_export(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {number} address
     */
    remove_stored_vec(address) {
        wasm.jsdifinterface_remove_stored_vec(this.__wbg_ptr, address);
    }
    /**
     * Resolve a pointer address synchronously if it's in memory, otherwise return an error
     * @param {string} address
     * @returns {any}
     */
    resolve_pointer_address(address) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsdifinterface_resolve_pointer_address(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} address
     * @param {number} observer_id
     */
    unobserve_pointer(address, observer_id) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsdifinterface_unobserve_pointer(this.__wbg_ptr, ptr0, len0, observer_id);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Applies a DIF update on a shared container at the given address, using the provided update data.
     * TODO: Can we optimize this, by not returning the update result data back to JS, as it adds unnecessary overhead, as
     * we can access the values in JS before update.
     * @param {string} address
     * @param {any} update
     * @returns {any}
     */
    update(address, update) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsdifinterface_update(this.__wbg_ptr, ptr0, len0, update);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} address
     * @param {number} observer_id
     * @param {any} observe_options
     */
    update_observer_options(address, observer_id, observe_options) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsdifinterface_update_observer_options(this.__wbg_ptr, ptr0, len0, observer_id, observe_options);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose)
    JSDIFInterface.prototype[Symbol.dispose] = JSDIFInterface.prototype.free;
export class JSRuntime {
    static __wrap(ptr) {
        const obj = Object.create(JSRuntime.prototype);
        obj.__wbg_ptr = ptr;
        JSRuntimeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JSRuntimeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsruntime_free(ptr, 0);
    }
    /**
     * @returns {JSComHub}
     */
    get com_hub() {
        const ret = wasm.__wbg_get_jsruntime_com_hub(this.__wbg_ptr);
        return JSComHub.__wrap(ret);
    }
    /**
     * Compiles a DATEX script with optional inserted values to a DXB body
     * @param {string} script
     * @param {any[] | null} [inserted_values]
     * @returns {Promise<Uint8Array>}
     */
    compile(script, inserted_values) {
        const ptr0 = passStringToWasm0(script, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(inserted_values) ? 0 : passArrayJsValueToWasm0(inserted_values, wasm.__wbindgen_malloc_command_export);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.jsruntime_compile(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * @returns {Promise<Promise<any>>}
     */
    crypto_test_tmp() {
        const ret = wasm.jsruntime_crypto_test_tmp(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get a handle to the DIF interface of the runtime
     * @returns {JSDIFInterface}
     */
    dif_interface() {
        const ret = wasm.jsruntime_dif_interface(this.__wbg_ptr);
        return JSDIFInterface.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    get endpoint() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.jsruntime_endpoint(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        }
        finally {
            wasm.__wbindgen_free_command_export(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Executes a DATEX script with inserted values, returning the result as DIFValue
     * @param {string} script
     * @param {any[] | null | undefined} inserted_values
     * @param {boolean} mark_as_debug
     * @returns {Promise<any>}
     */
    execute(script, inserted_values, mark_as_debug) {
        const ptr0 = passStringToWasm0(script, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(inserted_values) ? 0 : passArrayJsValueToWasm0(inserted_values, wasm.__wbindgen_malloc_command_export);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.jsruntime_execute(this.__wbg_ptr, ptr0, len0, ptr1, len1, mark_as_debug);
        return ret;
    }
    /**
     * Executes a DATEX script remotely with inserted values, returning the result as DIFValue
     * @param {string} target
     * @param {string} script
     * @param {any[] | null | undefined} inserted_values
     * @param {boolean} mark_as_debug
     * @returns {Promise<any>}
     */
    execute_remote(target, script, inserted_values, mark_as_debug) {
        const ptr0 = passStringToWasm0(target, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(script, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(inserted_values) ? 0 : passArrayJsValueToWasm0(inserted_values, wasm.__wbindgen_malloc_command_export);
        var len2 = WASM_VECTOR_LEN;
        const ret = wasm.jsruntime_execute_remote(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, mark_as_debug);
        return ret;
    }
    /**
     * @param {string} script
     * @param {any[] | null} [dif_values]
     * @returns {any}
     */
    execute_sync(script, dif_values) {
        const ptr0 = passStringToWasm0(script, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(dif_values) ? 0 : passArrayJsValueToWasm0(dif_values, wasm.__wbindgen_malloc_command_export);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.jsruntime_execute_sync(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} script
     * @param {any[] | null | undefined} dif_values
     * @param {any} decompile_options
     * @returns {string}
     */
    execute_sync_with_string_result(script, dif_values, decompile_options) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(script, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(dif_values) ? 0 : passArrayJsValueToWasm0(dif_values, wasm.__wbindgen_malloc_command_export);
            var len1 = WASM_VECTOR_LEN;
            const ret = wasm.jsruntime_execute_sync_with_string_result(this.__wbg_ptr, ptr0, len0, ptr1, len1, decompile_options);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0;
                len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        }
        finally {
            wasm.__wbindgen_free_command_export(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * Execute a DATEX script with optional inserted values, returning the result as a string
     * @param {string} script
     * @param {any[] | null | undefined} inserted_values
     * @param {any} decompile_options
     * @param {boolean} mark_as_debug
     * @returns {Promise<string>}
     */
    execute_with_string_result(script, inserted_values, decompile_options, mark_as_debug) {
        const ptr0 = passStringToWasm0(script, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(inserted_values) ? 0 : passArrayJsValueToWasm0(inserted_values, wasm.__wbindgen_malloc_command_export);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.jsruntime_execute_with_string_result(this.__wbg_ptr, ptr0, len0, ptr1, len1, decompile_options, mark_as_debug);
        return ret;
    }
    /**
     * Start the LSP server, returning a JS function to send messages to Rust
     * @param {Function} send_to_js
     * @returns {Function}
     */
    start_lsp(send_to_js) {
        const ret = wasm.jsruntime_start_lsp(this.__wbg_ptr, send_to_js);
        return ret;
    }
    /**
     * @param {any} dif_value
     * @param {any} decompile_options
     * @returns {string}
     */
    value_to_string(dif_value, decompile_options) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.jsruntime_value_to_string(this.__wbg_ptr, dif_value, decompile_options);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0;
                len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        }
        finally {
            wasm.__wbindgen_free_command_export(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get version() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.jsruntime_version(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        }
        finally {
            wasm.__wbindgen_free_command_export(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {JSComHub} arg0
     */
    set com_hub(arg0) {
        _assertClass(arg0, JSComHub);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsruntime_com_hub(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose)
    JSRuntime.prototype[Symbol.dispose] = JSRuntime.prototype.free;
export class Repl {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ReplFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_repl_free(ptr, 0);
    }
    /**
     * @param {string} script
     * @returns {Promise<any | undefined>}
     */
    execute(script) {
        const ptr0 = passStringToWasm0(script, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.repl_execute(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * @param {JSRuntime} runtime
     * @param {string | null | undefined} endpoint
     * @param {boolean} verbose
     */
    constructor(runtime, endpoint, verbose) {
        _assertClass(runtime, JSRuntime);
        var ptr0 = isLikeNone(endpoint) ? 0 : passStringToWasm0(endpoint, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.repl_new(runtime.__wbg_ptr, ptr0, len0, verbose);
        this.__wbg_ptr = ret;
        ReplFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose)
    Repl.prototype[Symbol.dispose] = Repl.prototype.free;
/**
 * @param {any} config
 * @param {any} debug_config
 * @param {string} device_type
 * @param {any} datex_web_version
 * @returns {Promise<JSRuntime>}
 */
export function create_runtime(config, debug_config, device_type, datex_web_version) {
    const ptr0 = passStringToWasm0(device_type, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.create_runtime(config, debug_config, ptr0, len0, datex_web_version);
    return ret;
}
/**
 * @param {Uint8Array} dxb
 * @returns {string}
 */
export function decompile_dxb_body(dxb) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passArray8ToWasm0(dxb, wasm.__wbindgen_malloc_command_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decompile_dxb_body(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    }
    finally {
        wasm.__wbindgen_free_command_export(deferred2_0, deferred2_1, 1);
    }
}
/**
 * @param {Uint8Array} dxb
 * @returns {any}
 */
export function disassemble_dxb_flat(dxb) {
    const ptr0 = passArray8ToWasm0(dxb, wasm.__wbindgen_malloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.disassemble_dxb_flat(ptr0, len0);
    return ret;
}
/**
 * @param {Uint8Array} dxb
 * @param {any} options
 * @returns {any}
 */
export function disassemble_dxb_to_string(dxb, options) {
    const ptr0 = passArray8ToWasm0(dxb, wasm.__wbindgen_malloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.disassemble_dxb_to_string(ptr0, len0, options);
    return ret;
}
/**
 * @param {Uint8Array} dxb
 * @returns {any}
 */
export function disassemble_dxb_tree(dxb) {
    const ptr0 = passArray8ToWasm0(dxb, wasm.__wbindgen_malloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.disassemble_dxb_tree(ptr0, len0);
    return ret;
}
export function __wbg_Error_9dc85fe1bc224456(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
}
export function __wbg_Number_4779d427bae39753(arg0) {
    const ret = Number(arg0);
    return ret;
}
export function __wbg_String_8564e559799eccda(arg0, arg1) {
    const ret = String(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_bigint_get_as_i64_8ea6736501f396b6(arg0, arg1) {
    const v = arg1;
    const ret = typeof (v) === 'bigint' ? v : undefined;
    getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
}
export function __wbg___wbindgen_boolean_get_b131b2f36d6b2f55(arg0) {
    const v = arg0;
    const ret = typeof (v) === 'boolean' ? v : undefined;
    return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
}
export function __wbg___wbindgen_debug_string_56c147eb1a51f0c4(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_in_ce8569b2fc6f5088(arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
}
export function __wbg___wbindgen_is_bigint_df272c65456269c2(arg0) {
    const ret = typeof (arg0) === 'bigint';
    return ret;
}
export function __wbg___wbindgen_is_function_147961669f068cd4(arg0) {
    const ret = typeof (arg0) === 'function';
    return ret;
}
export function __wbg___wbindgen_is_object_3a2c414391dbf751(arg0) {
    const val = arg0;
    const ret = typeof (val) === 'object' && val !== null;
    return ret;
}
export function __wbg___wbindgen_is_string_6541b0f6ecd4e8e5(arg0) {
    const ret = typeof (arg0) === 'string';
    return ret;
}
export function __wbg___wbindgen_is_undefined_4410e3c20a99fa97(arg0) {
    const ret = arg0 === undefined;
    return ret;
}
export function __wbg___wbindgen_jsval_eq_174c93ec61bab0c5(arg0, arg1) {
    const ret = arg0 === arg1;
    return ret;
}
export function __wbg___wbindgen_jsval_loose_eq_e07e3b1f5db6da6c(arg0, arg1) {
    const ret = arg0 == arg1;
    return ret;
}
export function __wbg___wbindgen_number_get_588ed6b97f0d7e14(arg0, arg1) {
    const obj = arg1;
    const ret = typeof (obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
}
export function __wbg___wbindgen_shr_c56e7cc32546f554(arg0, arg1) {
    const ret = arg0 >> arg1;
    return ret;
}
export function __wbg___wbindgen_string_get_fa2687d531ed17a5(arg0, arg1) {
    const obj = arg1;
    const ret = typeof (obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_throw_bbadd78c1bac3a77(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbg__wbg_cb_unref_c2301a3c9b78104b(arg0) {
    arg0._wbg_cb_unref();
}
export function __wbg_buffer_8524b3453cde4918(arg0) {
    const ret = arg0.buffer;
    return ret;
}
export function __wbg_byteLength_96807b1d9ab24a4c(arg0) {
    const ret = arg0.byteLength;
    return ret;
}
export function __wbg_call_2ad4e88518737145() {
    return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = arg0.call(arg1, arg2, arg3, arg4);
        return ret;
    }, arguments);
}
export function __wbg_call_91f00ddc43e01490() {
    return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments);
}
export function __wbg_call_ec09a4cf93377d3a() {
    return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
    }, arguments);
}
export function __wbg_cancel_f3a197b26dc88b39(arg0) {
    const ret = arg0.cancel();
    return ret;
}
export function __wbg_clearTimeout_113b1cde814ec762(arg0) {
    const ret = clearTimeout(arg0);
    return ret;
}
export function __wbg_close_296263cfe1bb2999() {
    return handleError(function (arg0) {
        arg0.close();
    }, arguments);
}
export function __wbg_codePointAt_92c678dd76a87be4(arg0, arg1) {
    const ret = arg0.codePointAt(arg1 >>> 0);
    return ret;
}
export function __wbg_crypto_43cf0aa0813e3fe3() {
    return handleError(function (arg0) {
        const ret = arg0.crypto;
        return ret;
    }, arguments);
}
export function __wbg_data_8a04443c1e5a8cd3(arg0) {
    const ret = arg0.data;
    return ret;
}
export function __wbg_debug_916d96e2f1e976c2(arg0, arg1, arg2, arg3) {
    console.debug(arg0, arg1, arg2, arg3);
}
export function __wbg_decrypt_434a0a20c1926b35() {
    return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg0.decrypt(arg1, arg2, arg3);
        return ret;
    }, arguments);
}
export function __wbg_deriveBits_2ef28a1a5553afd1() {
    return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg0.deriveBits(arg1, arg2, arg3 >>> 0);
        return ret;
    }, arguments);
}
export function __wbg_digest_07cbf8c660cbb7ad() {
    return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg0.digest(arg1, getArrayU8FromWasm0(arg2, arg3));
        return ret;
    }, arguments);
}
export function __wbg_done_6a8439e544ec6206(arg0) {
    const ret = arg0.done;
    return ret;
}
export function __wbg_encrypt_c8d1f29c3903aa3a() {
    return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg0.encrypt(arg1, arg2, arg3);
        return ret;
    }, arguments);
}
export function __wbg_entries_5a6a7e7e0df09fe5(arg0) {
    const ret = Object.entries(arg0);
    return ret;
}
export function __wbg_error_4dee59d95d79feac(arg0, arg1, arg2, arg3) {
    console.error(arg0, arg1, arg2, arg3);
}
export function __wbg_error_6651fee1c71e5da9(arg0) {
    console.error(arg0);
}
export function __wbg_error_a6fa202b58aa1cd3(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    }
    finally {
        wasm.__wbindgen_free_command_export(deferred0_0, deferred0_1, 1);
    }
}
export function __wbg_exportKey_ce86487ed97172ea() {
    return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg0.exportKey(getStringFromWasm0(arg1, arg2), arg3);
        return ret;
    }, arguments);
}
export function __wbg_fromCodePoint_9732a81eca648320() {
    return handleError(function (arg0) {
        const ret = String.fromCodePoint(arg0 >>> 0);
        return ret;
    }, arguments);
}
export function __wbg_from_8a57180716c586ee(arg0) {
    const ret = Array.from(arg0);
    return ret;
}
export function __wbg_generateKey_073b1d14947ffbdc() {
    return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg0.generateKey(arg1, arg2 !== 0, arg3);
        return ret;
    }, arguments);
}
export function __wbg_getRandomValues_d1f6a3c738b6cec2() {
    return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.getRandomValues(getArrayU8FromWasm0(arg1, arg2));
        return ret;
    }, arguments);
}
export function __wbg_getReader_0cd37e95fbf00f7f(arg0) {
    const ret = arg0.getReader();
    return ret;
}
export function __wbg_getWriter_a66f661ac532a709() {
    return handleError(function (arg0) {
        const ret = arg0.getWriter();
        return ret;
    }, arguments);
}
export function __wbg_get_44e98e27bda25b5b() {
    return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments);
}
export function __wbg_get_4b90d6d8c5deb5d5(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
}
export function __wbg_get_52a8a619f7b88df6() {
    return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments);
}
export function __wbg_get_done_c21b9933fc9a9e9c(arg0) {
    const ret = arg0.done;
    return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
}
export function __wbg_get_private_key_0d151957f982887e(arg0) {
    const ret = arg0.privateKey;
    return ret;
}
export function __wbg_get_public_key_d7128338e1b299e0(arg0) {
    const ret = arg0.publicKey;
    return ret;
}
export function __wbg_get_unchecked_46e778e3cec74b5e(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
}
export function __wbg_get_value_ad568c7d3db9073f(arg0) {
    const ret = arg0.value;
    return ret;
}
export function __wbg_get_with_ref_key_6412cf3094599694(arg0, arg1) {
    const ret = arg0[arg1];
    return ret;
}
export function __wbg_importKey_871c11d416fb97ee() {
    return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        const ret = arg0.importKey(getStringFromWasm0(arg1, arg2), arg3, arg4, arg5 !== 0, arg6);
        return ret;
    }, arguments);
}
export function __wbg_info_31621acdcc2e6cbc(arg0, arg1, arg2, arg3) {
    console.info(arg0, arg1, arg2, arg3);
}
export function __wbg_instanceof_ArrayBuffer_a581da923203f29f(arg0) {
    let result;
    try {
        result = arg0 instanceof ArrayBuffer;
    }
    catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_CryptoKey_d5f90a816d96ad67(arg0) {
    let result;
    try {
        result = arg0 instanceof CryptoKey;
    }
    catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Error_cb5ebd65d798655e(arg0) {
    let result;
    try {
        result = arg0 instanceof Error;
    }
    catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Map_7f94c740225003e2(arg0) {
    let result;
    try {
        result = arg0 instanceof Map;
    }
    catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Object_34d30ae022f04c89(arg0) {
    let result;
    try {
        result = arg0 instanceof Object;
    }
    catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Promise_aa24ea31000d4ee6(arg0) {
    let result;
    try {
        result = arg0 instanceof Promise;
    }
    catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_ReadableStreamDefaultReader_2ab4b6bb85f96463(arg0) {
    let result;
    try {
        result = arg0 instanceof ReadableStreamDefaultReader;
    }
    catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Uint8Array_b6fe1ac89eba107e(arg0) {
    let result;
    try {
        result = arg0 instanceof Uint8Array;
    }
    catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Window_9e0fe7d3d1ff4342(arg0) {
    let result;
    try {
        result = arg0 instanceof Window;
    }
    catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_isArray_139f48e3c057ede8(arg0) {
    const ret = Array.isArray(arg0);
    return ret;
}
export function __wbg_isSafeInteger_c22ccb4af2201fe9(arg0) {
    const ret = Number.isSafeInteger(arg0);
    return ret;
}
export function __wbg_iterator_9b36cebf3be7b7cd() {
    const ret = Symbol.iterator;
    return ret;
}
export function __wbg_jsruntime_new(arg0) {
    const ret = JSRuntime.__wrap(arg0);
    return ret;
}
export function __wbg_length_68a9d5278d084f4f(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_length_7abf942ae12c9744(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_length_fb04d16d7bdf6d4c(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_log_534d68700f4f2519(arg0, arg1, arg2, arg3) {
    console.log(arg0, arg1, arg2, arg3);
}
export function __wbg_message_5c6ab4dd6c4b34e8(arg0) {
    const ret = arg0.message;
    return ret;
}
export function __wbg_navigator_e8073f0771c8d619(arg0) {
    const ret = arg0.navigator;
    return ret;
}
export function __wbg_new_0b303268aa395a38() {
    const ret = new Array();
    return ret;
}
export function __wbg_new_20b778a4c5c691c3() {
    const ret = new Object();
    return ret;
}
export function __wbg_new_227d7c05414eb861() {
    const ret = new Error();
    return ret;
}
export function __wbg_new_883c0db065f06efd() {
    const ret = new Map();
    return ret;
}
export function __wbg_new_a3e5112401a82338() {
    return handleError(function (arg0, arg1) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
        return ret;
    }, arguments);
}
export function __wbg_new_b06772b280cc6e52(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
}
export function __wbg_new_from_slice_bb2d1778c0b87eb1(arg0, arg1) {
    const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
    return ret;
}
export function __wbg_new_typed_90c3f6c29ba36d19(arg0, arg1) {
    try {
        var state0 = { a: arg0, b: arg1 };
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Function_fn_wasm_bindgen_5a68df9f3bbc0c26___JsValue_____wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined___js_sys_8e6944b8953f11d5___Function_fn_wasm_bindgen_5a68df9f3bbc0c26___JsValue_____wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined_______true_(a, state0.b, arg0, arg1);
            }
            finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return ret;
    }
    finally {
        state0.a = 0;
    }
}
export function __wbg_next_8cb028b6ba50743f() {
    return handleError(function (arg0) {
        const ret = arg0.next();
        return ret;
    }, arguments);
}
export function __wbg_next_cfd0b146c9538df8(arg0) {
    const ret = arg0.next;
    return ret;
}
export function __wbg_now_bce4dc999095ea77() {
    const ret = Date.now();
    return ret;
}
export function __wbg_now_e7c6795a7f81e10f(arg0) {
    const ret = arg0.now();
    return ret;
}
export function __wbg_of_472cbb5aebb61f18(arg0, arg1) {
    const ret = Array.of(arg0, arg1);
    return ret;
}
export function __wbg_of_5188689822ff45d7(arg0) {
    const ret = Array.of(arg0);
    return ret;
}
export function __wbg_open_d98d78c4b7a1c768(arg0, arg1) {
    const ret = arg0.open(arg1);
    return ret;
}
export function __wbg_performance_3fcf6e32a7e1ed0a(arg0) {
    const ret = arg0.performance;
    return ret;
}
export function __wbg_prototypesetcall_956c7493c68e29b4(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
}
export function __wbg_push_ceb8ef046afb2041(arg0, arg1) {
    const ret = arg0.push(arg1);
    return ret;
}
export function __wbg_queueMicrotask_4698f900840e3286(arg0) {
    queueMicrotask(arg0);
}
export function __wbg_queueMicrotask_477a5533c7100338(arg0) {
    const ret = arg0.queueMicrotask;
    return ret;
}
export function __wbg_randomUUID_e5dd7dca4573cb5a(arg0, arg1) {
    const ret = arg1.randomUUID();
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg_read_8426c146431f2905(arg0) {
    const ret = arg0.read();
    return ret;
}
export function __wbg_readable_66d8c77a99f46032(arg0) {
    const ret = arg0.readable;
    return ret;
}
export function __wbg_readyState_25243ad6ce649774(arg0) {
    const ret = arg0.readyState;
    return ret;
}
export function __wbg_requestPort_bb908206a009e1c9(arg0) {
    const ret = arg0.requestPort();
    return ret;
}
export function __wbg_resolve_0183de2e8c6b1d54(arg0) {
    const ret = Promise.resolve(arg0);
    return ret;
}
export function __wbg_send_99d049cae69c53cc() {
    return handleError(function (arg0, arg1, arg2) {
        arg0.send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments);
}
export function __wbg_serial_7f54fcd24ab16cc5(arg0) {
    const ret = arg0.serial;
    return ret;
}
export function __wbg_setTimeout_ef24d2fc3ad97385() {
    return handleError(function (arg0, arg1) {
        const ret = setTimeout(arg0, arg1);
        return ret;
    }, arguments);
}
export function __wbg_set_5f806304fb633ab3(arg0, arg1, arg2) {
    const ret = arg0.set(arg1, arg2);
    return ret;
}
export function __wbg_set_6be42768c690e380(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
}
export function __wbg_set_a6ba3ac0e634b822() {
    return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
    }, arguments);
}
export function __wbg_set_baud_rate_9d8ddfbe1b7dbe69(arg0, arg1) {
    arg0.baudRate = arg1 >>> 0;
}
export function __wbg_set_binaryType_8c2dd2cf1cfc2e28(arg0, arg1) {
    arg0.binaryType = __wbindgen_enum_BinaryType[arg1];
}
export function __wbg_set_counter_0347cbcd3540ef1f(arg0, arg1) {
    arg0.counter = arg1;
}
export function __wbg_set_da33c120a6584674(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
}
export function __wbg_set_length_89bd687854acccd5(arg0, arg1) {
    arg0.length = arg1;
}
export function __wbg_set_name_212a8e4fc124e29b(arg0, arg1, arg2) {
    arg0.name = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_onclose_9cb5c3372e16c192(arg0, arg1) {
    arg0.onclose = arg1;
}
export function __wbg_set_onerror_190fe67e911ebf28(arg0, arg1) {
    arg0.onerror = arg1;
}
export function __wbg_set_onmessage_96337495f0bfb796(arg0, arg1) {
    arg0.onmessage = arg1;
}
export function __wbg_set_onopen_3e2bf6b11d434c2d(arg0, arg1) {
    arg0.onopen = arg1;
}
export function __wbg_sign_0be635e70fca00c4() {
    return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = arg0.sign(arg1, arg2, getArrayU8FromWasm0(arg3, arg4));
        return ret;
    }, arguments);
}
export function __wbg_slice_48ba39549a845019(arg0, arg1) {
    const ret = arg1.slice();
    const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg_stack_3b0d974bbf31e44f(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg_static_accessor_GLOBAL_60a4124bab7dcc9a() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_GLOBAL_THIS_95ca6460658b5d13() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_SELF_4c95f759a91e9aae() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_WINDOW_44b435597f9e9ee7() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_subtle_8f1ee4c21d530fce(arg0) {
    const ret = arg0.subtle;
    return ret;
}
export function __wbg_then_254bab9b266a77a5(arg0, arg1, arg2) {
    const ret = arg0.then(arg1, arg2);
    return ret;
}
export function __wbg_then_3ea18602c6a5123b(arg0, arg1) {
    const ret = arg0.then(arg1);
    return ret;
}
export function __wbg_toString_b09619b263823abf(arg0) {
    const ret = arg0.toString();
    return ret;
}
export function __wbg_unwrapKey_8c36ebd252475005() {
    return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        const ret = arg0.unwrapKey(getStringFromWasm0(arg1, arg2), arg3, arg4, getStringFromWasm0(arg5, arg6), arg7, arg8 !== 0, arg9);
        return ret;
    }, arguments);
}
export function __wbg_value_3d3defe09fb1ffca(arg0) {
    const ret = arg0.value;
    return ret;
}
export function __wbg_verify_618a7b8d4b5707fc() {
    return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        const ret = arg0.verify(arg1, arg2, getArrayU8FromWasm0(arg3, arg4), getArrayU8FromWasm0(arg5, arg6));
        return ret;
    }, arguments);
}
export function __wbg_warn_9a910409d920f84d(arg0, arg1, arg2, arg3) {
    console.warn(arg0, arg1, arg2, arg3);
}
export function __wbg_wrapKey_ad361de1031fac4b() {
    return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        const ret = arg0.wrapKey(getStringFromWasm0(arg1, arg2), arg3, arg4, getStringFromWasm0(arg5, arg6));
        return ret;
    }, arguments);
}
export function __wbg_writable_b89f747b2d1d8950(arg0) {
    const ret = arg0.writable;
    return ret;
}
export function __wbg_write_20b6542ec273cec7(arg0, arg1) {
    const ret = arg0.write(arg1);
    return ret;
}
export function __wbindgen_cast_0000000000000001(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 8349, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___wasm_bindgen_5a68df9f3bbc0c26___JsValue__core_e46589d91d22e842___result__Result_____wasm_bindgen_5a68df9f3bbc0c26___JsError___true_);
    return ret;
}
export function __wbindgen_cast_0000000000000002(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("ErrorEvent")], shim_idx: 2825, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true_);
    return ret;
}
export function __wbindgen_cast_0000000000000003(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("Event")], shim_idx: 2825, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true__2);
    return ret;
}
export function __wbindgen_cast_0000000000000004(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("MessageEvent")], shim_idx: 2825, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true__3);
    return ret;
}
export function __wbindgen_cast_0000000000000005(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("SerialPort")], shim_idx: 2827, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined__core_e46589d91d22e842___result__Result_____wasm_bindgen_5a68df9f3bbc0c26___JsError___true_);
    return ret;
}
export function __wbindgen_cast_0000000000000006(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("Uint8Array")], shim_idx: 2825, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true__5);
    return ret;
}
export function __wbindgen_cast_0000000000000007(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("undefined")], shim_idx: 2827, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined__core_e46589d91d22e842___result__Result_____wasm_bindgen_5a68df9f3bbc0c26___JsError___true__6);
    return ret;
}
export function __wbindgen_cast_0000000000000008(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [], shim_idx: 7309, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke_______true_);
    return ret;
}
export function __wbindgen_cast_0000000000000009(arg0) {
    // Cast intrinsic for `F64 -> Externref`.
    const ret = arg0;
    return ret;
}
export function __wbindgen_cast_000000000000000a(arg0, arg1) {
    // Cast intrinsic for `I128 -> Externref`.
    const ret = (BigInt.asUintN(64, arg0) | (arg1 << BigInt(64)));
    return ret;
}
export function __wbindgen_cast_000000000000000b(arg0) {
    // Cast intrinsic for `I64 -> Externref`.
    const ret = arg0;
    return ret;
}
export function __wbindgen_cast_000000000000000c(arg0, arg1) {
    // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
    const ret = getArrayU8FromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_cast_000000000000000d(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_cast_000000000000000e(arg0, arg1) {
    // Cast intrinsic for `U128 -> Externref`.
    const ret = (BigInt.asUintN(64, arg0) | (BigInt.asUintN(64, arg1) << BigInt(64)));
    return ret;
}
export function __wbindgen_cast_000000000000000f(arg0) {
    // Cast intrinsic for `U64 -> Externref`.
    const ret = BigInt.asUintN(64, arg0);
    return ret;
}
export function __wbindgen_cast_0000000000000010(arg0, arg1) {
    var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
    wasm.__wbindgen_free_command_export(arg0, arg1 * 1, 1);
    // Cast intrinsic for `Vector(U8) -> Externref`.
    const ret = v0;
    return ret;
}
export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
}
function wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke_______true_(arg0, arg1) {
    wasm.wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke_______true_(arg0, arg1);
}
function wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true_(arg0, arg1, arg2) {
    wasm.wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true_(arg0, arg1, arg2);
}
function wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true__2(arg0, arg1, arg2) {
    wasm.wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true__2(arg0, arg1, arg2);
}
function wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true__3(arg0, arg1, arg2) {
    wasm.wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true__3(arg0, arg1, arg2);
}
function wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true__5(arg0, arg1, arg2) {
    wasm.wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Uint8Array______true__5(arg0, arg1, arg2);
}
function wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___wasm_bindgen_5a68df9f3bbc0c26___JsValue__core_e46589d91d22e842___result__Result_____wasm_bindgen_5a68df9f3bbc0c26___JsError___true_(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___wasm_bindgen_5a68df9f3bbc0c26___JsValue__core_e46589d91d22e842___result__Result_____wasm_bindgen_5a68df9f3bbc0c26___JsError___true_(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}
function wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined__core_e46589d91d22e842___result__Result_____wasm_bindgen_5a68df9f3bbc0c26___JsError___true_(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined__core_e46589d91d22e842___result__Result_____wasm_bindgen_5a68df9f3bbc0c26___JsError___true_(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}
function wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined__core_e46589d91d22e842___result__Result_____wasm_bindgen_5a68df9f3bbc0c26___JsError___true__6(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined__core_e46589d91d22e842___result__Result_____wasm_bindgen_5a68df9f3bbc0c26___JsError___true__6(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}
function wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Function_fn_wasm_bindgen_5a68df9f3bbc0c26___JsValue_____wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined___js_sys_8e6944b8953f11d5___Function_fn_wasm_bindgen_5a68df9f3bbc0c26___JsValue_____wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined_______true_(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen_5a68df9f3bbc0c26___convert__closures_____invoke___js_sys_8e6944b8953f11d5___Function_fn_wasm_bindgen_5a68df9f3bbc0c26___JsValue_____wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined___js_sys_8e6944b8953f11d5___Function_fn_wasm_bindgen_5a68df9f3bbc0c26___JsValue_____wasm_bindgen_5a68df9f3bbc0c26___sys__Undefined_______true_(arg0, arg1, arg2, arg3);
}
const __wbindgen_enum_BinaryType = ["blob", "arraybuffer"];
const JSComHubFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry(ptr => wasm.__wbg_jscomhub_free(ptr, 1));
const JSDIFInterfaceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsdifinterface_free(ptr, 1));
const JSRuntimeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsruntime_free(ptr, 1));
const ReplFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry(ptr => wasm.__wbg_repl_free(ptr, 1));
function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc_command_export();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}
function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}
const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry(state => wasm.__wbindgen_destroy_closure_command_export(state.a, state.b));
function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        }
        else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        }
        else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for (let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    }
    else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        }
        catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}
function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}
function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}
let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}
function handleError(f, args) {
    try {
        return f.apply(this, args);
    }
    catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store_command_export(idx);
    }
}
function isLikeNone(x) {
    return x === undefined || x === null;
}
function makeMutClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        }
        finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_destroy_closure_command_export(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }
    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;
    const mem = getUint8ArrayMemory0();
    let offset = 0;
    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F)
            break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);
        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }
    WASM_VECTOR_LEN = offset;
    return ptr;
}
function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc_command_export(idx);
    return value;
}
let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
const cachedTextEncoder = new TextEncoder();
if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}
let WASM_VECTOR_LEN = 0;
let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}
