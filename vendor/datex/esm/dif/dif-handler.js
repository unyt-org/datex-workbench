/**
 * @module DIF Handler
 * Represents the main interface for interacting with the DATEX Core via DIF from JavaScript.
 */
import { Endpoint } from "../lib/special-core-types/endpoint.js";
import { Range } from "../lib/special-core-types/range.js";
import { DIFCallableKind, DIFUpdateKind, } from "./types/mod.js";
import { CoreLibTypeId } from "./core.js";
import { TypeRegistry } from "./type-registry.js";
import { assert, panic, unimplemented, unreachable } from "../utils/exceptions.js";
import { JS_UNDEFINED } from "../lib/special-core-types/undefined.js";
import { SharedContainerMutability } from "../shared-container/base-shared-container.js";
import { BaseSharedContainer, combinePointerAddressWithOwnership, ReferencedSharedContainer, splitPointerAddressWithOwnership, } from "../shared-container/mod.js";
import { DIFSharedContainerOwnership } from "./types/type.js";
import { appendEntry, clear, deleteEntry, listSplice, replace, setArrayEntry, setEntry } from "./update.js";
import { JsLibTypeAddress } from "./js-lib.js";
import { registerCoreTypeBindings } from "../lib/mod.js";
import { OwnedSharedContainer } from "../shared-container/owned.js";
import { EMPTY_TAG, Tagged } from "../lib/special-core-types/tagged.js";
import { ibig } from "./helpers/mod.js";
import { getCoreLibTypeIdForJSValue } from "./helpers/type-id.js";
import { classificationHasImpl, createDIFValueWithTag, isSharedValueContainer, tryGetClassification, } from "./helpers/values.js";
import { createClassForEntityType } from "../lib/js-classes/mod.js";
// @ts-ignore memory must be part of d.ts
import { memory } from "../datex.js";
import { isDIFCoreValue } from "./helpers/values.js";
/**
 * Some DIF methods may return an optional ValueContainer, so does the execute_sync, when no result is returned.
 * DIF must differentiate between null and no result, so we wrap DIFOptionalValueContainer.
 * @param value - The DIFOptionalValueContainer to collapse.
 * @returns The contained DIFValueContainer if present, or undefined if the value is not present.
 */
function collapseDIFOption(value) {
    if (value === null) {
        return undefined;
    }
    else {
        if (Array.isArray(value) && value.length === 1) {
            return value[0];
        }
        else {
            throw new Error("Invalid DIFOptionalValueContainer format: expected an array of length 1 or null");
        }
    }
}
/**
 * Converts special float string representations ("nan", "infinity", "-infinity") to the JS values NaN, Infinity and -Infinity respectively.
 * @param value - The string representation of the float value.
 * @returns The corresponding JS number value for the special float representation.
 * @throws If the input value is not a valid special float representation.
 */
function specialDIFFloatToNumber(value) {
    if (!isSpecialDIFFloatString(value)) {
        throw new Error(`Expected a special float string ("nan", "infinity", "-infinity"), got ${value}`);
    }
    if (value === "nan") {
        return NaN;
    }
    else if (value === "infinity") {
        return Infinity;
    }
    else if (value === "-infinity") {
        return -Infinity;
    }
    unreachable(`Invalid special float string: ${value}`);
}
function isSpecialDIFFloatString(value) {
    return ["nan", "infinity", "-infinity"].includes(value);
}
export const IS_PROXY_ACCESS = Symbol("IS_PROXY_ACCESS");
const DATEX_CALLABLE_HASH = Symbol("DATEX_CALLABLE_HASH");
const DATEX_CALLABLE = Symbol("CALLABLE");
/**
 * The DIFHandler class provides methods to interact with the DATEX Core DIF runtime,
 * including executing Datex scripts, creating and managing references, and observing changes.
 * It includes a local reference cache to optimize performance and reduce cross-language calls.
 */
export class DIFHandler {
    /** The JSRuntime interface for the underlying Datex Core runtime */
    #runtime;
    #handle;
    // always 0 for now - potentially used for multi DIF transceivers using the same underlying runtime
    #transceiver_id = 0;
    // The set of observers that are currently registered for cache updates.
    #cacheObservers = new Set();
    /**
     * The reference cache for storing and reusing object instances on the JS side
     * The observerId is only set if the reference is being observed (if not final).
     */
    #cache = new Map();
    /**
     * Maps the original value to a proxy value
     * (if the values is bound to a custom proxy wrapper)
     */
    #proxyMapping = new WeakMap();
    /**
     * The reference metadata map, storing metadata for each cached reference.
     */
    #baseSharedContainerMetadata = new WeakMap();
    /**
     * The reference metadata map, storing metadata for each shared reference.
     */
    #jsValueSharedContainerMetadata = new WeakMap();
    #observers = new Map();
    #type_registry = new TypeRegistry(this);
    // register finalizer to clean up the cache and free the reference in the runtime
    // when the object is garbage collected
    #pointerFinalizationRegistry = new FinalizationRegistry((address) => {
        console.debug(`${address} was garbage collected`);
        this.cleanupSharedValue(address);
    });
    #bufferFinalizationRegistry = new FinalizationRegistry((address) => {
        console.debug(`Buffer at address ${address} was garbage collected`);
        this.#handle.remove_stored_vec(address);
    });
    /**
     * Internal property
     * @returns The map of observers for each pointer address.
     */
    get _observers() {
        return this.#observers;
    }
    /**
     * Internal property
     * @returns The {@link JSDIFInterface} instance.
     */
    get _handle() {
        return this.#handle;
    }
    /**
     * This should only be used for debugging purposes, not for modifying the cache.
     * @returns The map of cached references.
     */
    get _cache() {
        return this.#cache;
    }
    /**
     * Internal property
     * @returns The transceiver ID of the DIF client.
     */
    get _transceiver_id() {
        return this.#transceiver_id;
    }
    get type_registry() {
        return this.#type_registry;
    }
    /**
     * Creates a new DIFHandler instance.
     * This also sets up all type bindings for core types (array, map, ...) on the runtime.
     * @param runtime - The JSRuntime instance for executing Datex scripts.
     */
    constructor(runtime) {
        this.#runtime = runtime;
        this.#handle = runtime.dif_interface();
        // setup all core type bindings on the runtime (array, map, ...)
        registerCoreTypeBindings(this.#type_registry);
    }
    /**
     * Executes a Datex script asynchronously and returns a Promise that resolves to a DIFContainer.
     * @param datexScript - The Datex script source code to execute.
     * @param values - An optional array of values to inject into the script.
     * @param markAsDebug - An optional boolean to mark the (remote) execution as debug (default: false).
     * @returns A Promise that resolves to the execution result as a DIFContainer.
     * @throws If an error occurs during execution.
     */
    async executeDIF(datexScript, values = [], markAsDebug = false) {
        return collapseDIFOption(await this.#runtime.execute(datexScript, this.convertToDIFValues(values), markAsDebug));
    }
    /**
     * Executes a Datex script asynchronously and returns a Promise that resolves to a DIFContainer.
     * @param target - The target endpoint for the execution.
     * @param datexScript - The Datex script source code to execute.
     * @param values - An optional array of values to inject into the script.
     * @param markAsDebug - An optional boolean to mark the (remote) execution as debug (default: false).
     * @returns A Promise that resolves to the execution result as a DIFContainer.
     * @throws If an error occurs during execution.
     */
    async executeDIFRemote(target, datexScript, values = [], markAsDebug = false) {
        return collapseDIFOption(await this.#runtime.execute_remote(target.toString(), datexScript, this.convertToDIFValues(values), markAsDebug));
    }
    /**
     * Executes a Datex script synchronously and returns the result as a DIFContainer.
     * @param datexScript - The Datex script source code to execute.
     * @param values - An optional array of values to inject into the script.
     * @returns The execution result as a DIFContainer.
     * @throws If an error occurs during execution.
     */
    executeSyncDIF(datexScript, values = []) {
        return collapseDIFOption(this.#runtime.execute_sync(datexScript, this.convertToDIFValues(values)));
    }
    /**
     * Creates a new shared value for the specified DIF value.
     * @param difValueContainer - The DIFValueContainer value to create a pointer for.
     * @param allowedType - The allowed type for the pointer.
     * @param mutability - The mutability of the pointer.
     * @returns The created pointer address.
     */
    constructSharedValue(difValueContainer, mutability = SharedContainerMutability.Mutable, allowedType = null) {
        const baseSharedValueContainer = [
            difValueContainer,
            mutability,
        ];
        if (allowedType) {
            baseSharedValueContainer[2] = allowedType;
        }
        return this.#handle.create_pointer(baseSharedValueContainer);
    }
    /**
     * Updates the DIF value at the specified address.
     * @param address - The address of the DIF value to update.
     * @param update_data - The DIFUpdate object containing the update information.
     */
    updateSharedValue(address, update_data) {
        return this.#handle.update(address, [this.#transceiver_id, ...update_data]);
    }
    /**
     * Registers an observer callback for changes to the DIF value at the specified address
     * directly on the DATEX core runtime.
     * This method should only be used internally, since it comes with additional overhead.
     * For normal use cases, use the observePointer method instead.
     * The callback will be invoked whenever the value at the address is updated.
     * @param address - The address of the DIF value to observe.
     * @param callback - The callback function to invoke on updates.
     * @returns An observer ID that can be used to unregister the observer.
     * @throws If the pointer is final.
     */
    observeSharedValueBindDirect(address, callback, options = { relay_own_updates: false }) {
        return this.#runtime.dif_interface().observe_pointer(address, options, callback);
    }
    /**
     * Updates the observe options for a registered observer.
     * @param address - The address of the DIF value being observed.
     * @param observerId - The observer ID returned by the observePointer method.
     * @param options - The new observe options to apply.
     */
    updateObserverOptions(address, observerId, options) {
        this.#runtime.dif_interface().update_observer_options(address, observerId, options);
    }
    /**
     * Removes any cache state of a shared value.
     * This should only be called if the value of the shared container / the BaseSharedContainer was garbage collected on the JS side,
     * @param address
     * @private
     */
    cleanupSharedValue(address) {
        const { originalValue, observerId } = this.#cache.get(address) ?? {};
        // remove from proxy mapping if applicable
        if (originalValue != null) {
            this.#proxyMapping.delete(originalValue);
        }
        this.#cache.delete(address);
        // remove local observers
        this.#observers.delete(address);
        // if observer is active, unregister it
        if (observerId != null) {
            this.unobserveSharedValueBindDirect(address, observerId);
        }
        // trigger cache change observers
        this.#triggerCacheObservers();
    }
    /**
     * Enables propagation of own updates for a registered observer.
     * @param address - The address of the DIF value being observed.
     * @param observerId - The observer ID returned by the observePointer method.
     */
    enableOwnUpdatesPropagation(address, observerId) {
        this.updateObserverOptions(address, observerId, {
            relay_own_updates: true,
        });
    }
    /**
     * Disables propagation of own updates for a registered observer.
     * @param address - The address of the DIF value being observed.
     * @param observerId - The observer ID returned by the observePointer method.
     */
    disableOwnUpdatesPropagation(address, observerId) {
        this.updateObserverOptions(address, observerId, {
            relay_own_updates: false,
        });
    }
    /**
     * Unregisters an observer that was registered directly on the DATEX core runtime
     * with the observePointerBindDirect method.
     * For internal use only.
     * @param address - The address of the DIF value being observed.
     * @param observerId - The observer ID returned by the observePointer method.
     */
    unobserveSharedValueBindDirect(address, observerId) {
        this.#runtime.dif_interface().unobserve_pointer(address, observerId);
    }
    /**
     * Registers a local observer callback for changes to the DIF value at the specified address.
     * The callback will be invoked whenever the value at the address is updated.
     * In contrast to observePointerBindDirect, this method does not register the observer
     * directly on the DATEX core runtime, but keeps it local in the JS side, which prevents
     * unnecessary overhead from additional cross-language calls.
     * @param address - The address of the DIF value to observe.
     * @param callback - The callback function to invoke on updates.
     * @returns An observer ID that can be used to unregister the observer.
     * @throws If the pointer is final.
     */
    observePointer(address, callback) {
        let cached = this.#cache.get(address);
        if (!cached) {
            // first resolve the pointer to make sure it's loaded in the cache
            this.resolvePointerAddress(DIFSharedContainerOwnership.ImmutableRef, address);
            cached = this.#cache.get(address);
        }
        // make sure the pointer is not final (no observer)
        if (cached.observerId === null) {
            throw new Error(`Cannot observe final reference $${address}`);
        }
        // directly add to observers map
        let observers = this.#observers.get(address);
        if (!observers) {
            observers = new Map();
            this.#observers.set(address, observers);
            // first local observer for this address - enable own updates propagation
            this.enableOwnUpdatesPropagation(address, cached.observerId);
        }
        // FIXME make this more robust for delete/re-add cases
        const observerId = observers.size + 1;
        observers.set(observerId, callback);
        return observerId;
    }
    /**
     * Unregisters an observer that was registered with the observePointer method.
     * @param address - The address of the DIF value being observed.
     * @param observerId - The observer ID returned by the observePointer method.
     * @returns True if the observer was successfully unregistered, false otherwise.
     */
    unobservePointer(address, observerId) {
        const observers = this.#observers.get(address);
        if (observers) {
            observers.delete(observerId);
            if (observers.size === 0) {
                // no local observers left - disable own updates propagation and remove from map
                const cached = this.#cache.get(address);
                if (cached?.observerId) {
                    this.disableOwnUpdatesPropagation(address, cached.observerId);
                }
                else {
                    console.error(`No observer found for address ${address}`);
                }
                return this.#observers.delete(address);
            }
        }
        return false;
    }
    /**
     * Calls a sync callable DIF value identified by the given hash with the specified arguments.
     */
    callCallableSync(value, args) {
        const result = collapseDIFOption(this.#handle.apply_sync(value, args.map((arg) => this.convertJSValueToDIFValueContainer(arg))));
        if (result === undefined)
            return result;
        return this.resolveDIFValueContainer(result);
    }
    /**
     * Calls an async callable DIF value identified by the given hash with the specified arguments.
     */
    async callCallableAsync(value, args) {
        const result = collapseDIFOption(await this.#handle.apply_async(value, args.map((arg) => this.convertJSValueToDIFValueContainer(arg))));
        if (result === undefined)
            return result;
        return this.resolveDIFValueContainer(result);
    }
    /**
     * Calls a sync method on a DIF value
     */
    callMethodSync(callee, method, args) {
        const result = collapseDIFOption(this.#handle.call_method_sync(callee, method, args.map((arg) => this.convertJSValueToDIFValueContainer(arg))));
        if (result === undefined)
            return result;
        return this.collapseReferenceSharedContainer(this.resolveDIFValueContainer(result));
    }
    /**
     * Calls an async method on a DIF value
     */
    async callMethodAsync(callee, method, args) {
        const result = collapseDIFOption(await this.#handle.call_method_async(callee, method, args.map((arg) => this.convertJSValueToDIFValueContainer(arg))));
        if (result === undefined)
            return result;
        return this.collapseReferenceSharedContainer(this.resolveDIFValueContainer(result));
    }
    /**
     * Resolves a DIFValue to its corresponding JS value.
     * This function handles core types and custom types (not yet implemented).
     * It returns the resolved value as the specified type T.
     * @param value
     */
    resolveDIFValue(value) {
        let classification = null;
        // direct interpretation of trivial types without type annotation
        if (value === null) {
            return null;
        }
        else if (typeof value === "string") {
            return value;
        }
        else if (typeof value === "boolean") {
            return value;
        }
        else if (typeof value === "number") {
            return value;
        } // custom interpretation means
        else if (typeof value !== "object") {
            unreachable(`Invalid DIFValue format: expected an object / array for non-primitive types, got ${typeof value}`);
        } // direct core value
        else if (Array.isArray(value)) {
            return this.resolveDIFCoreValue(value);
        } // classified value
        else if ((classification = tryGetClassification(value))) {
            // special JS undefined value
            if (classificationHasImpl(classification, JsLibTypeAddress.undefined)) {
                return undefined;
            }
            else if (classification[0]) {
                return this.instantiateEntityInstance(classification[0], value.v);
            }
            else {
                unimplemented("Handle this case");
            }
        }
        else if (value._ === "t") {
            assert("t" in value, "Invalid DIFValue format: expected a tagged value with 't' property");
            return this.resolveDIFTaggedValue(value);
        }
        unreachable(`Invalid DIFValue format: expected a tagged value, got ${typeof value}`);
    }
    /**
     * Creates a new JS class instance for a given entity value.
     */
    instantiateEntityInstance(entityTypeAddress, value) {
        const jsClass = this.resolvePointerAddress(...splitPointerAddressWithOwnership(entityTypeAddress));
        assert(this.isClass(jsClass.value), "Expected a JS class for the entity type definition");
        const instance = new jsClass.value();
        // FIXME: improve class member instantiation
        const resolvedValue = this.resolveDIFValue(value);
        if (typeof resolvedValue === "object" && resolvedValue !== null && !Array.isArray(resolvedValue)) {
            for (const [key, val] of Object.entries(resolvedValue)) {
                instance[key] = val;
            }
        }
        return instance;
    }
    resolveDIFTaggedValue(value) {
        const [tag, is_empty] = value.t;
        if (is_empty) {
            return new Tagged(tag, EMPTY_TAG);
        }
        else {
            const val = this.resolveDIFCoreValue(value.v);
            return new Tagged(tag, val);
        }
    }
    resolveDIFInMemoryValue(value) {
        const [_, type, count, address] = value;
        if (type === CoreLibTypeId.integer_u8) {
            const array = new Uint8Array(memory.buffer, address, count);
            this.#bufferFinalizationRegistry.register(array, address);
            return array;
        }
        else {
            unimplemented("resolveDIFInMemoryValue for type " + type);
        }
    }
    resolveDIFCoreValue(value) {
        // handle in memory values
        if (value[0] === null) {
            return this.resolveDIFInMemoryValue(value);
        }
        const [type_id, raw_value] = value;
        if (type_id === CoreLibTypeId.null || type_id === CoreLibTypeId.Unit) {
            if (raw_value !== null) {
                unreachable("Expected null value for null type");
            }
            return raw_value;
        }
        else if (type_id === CoreLibTypeId.boolean) {
            if (typeof raw_value !== "boolean") {
                unreachable("Expected boolean value for boolean type");
            }
            return raw_value;
        }
        else if ([
            CoreLibTypeId.integer_i8,
            CoreLibTypeId.integer_i16,
            CoreLibTypeId.integer_i32,
            CoreLibTypeId.integer_u8,
            CoreLibTypeId.integer_u16,
            CoreLibTypeId.integer_u32,
            CoreLibTypeId.integer_i64,
        ].includes(type_id)) {
            if (typeof raw_value !== "number") {
                unreachable("Expected number value for integer type");
            }
            return raw_value;
        }
        else if (type_id === CoreLibTypeId.integer) {
            if (typeof raw_value === "string") {
                return parseInt(raw_value, 10);
            }
            else {
                unreachable("Expected number value for integer type");
            }
        }
        else if ([
            CoreLibTypeId.integer_i128,
            CoreLibTypeId.integer_u64,
            CoreLibTypeId.integer_u128,
            CoreLibTypeId.integer_ibig,
        ].includes(type_id)) {
            if (typeof raw_value !== "string" && typeof raw_value !== "number") {
                unreachable("Expected string or number value for big integer type");
            }
            return BigInt(raw_value);
        }
        else if ([
            CoreLibTypeId.decimal_dbig,
            CoreLibTypeId.decimal, // FIXME rational notation 3/4
        ].includes(type_id)) {
            if (typeof raw_value !== "string") {
                unreachable("Expected string value for decimal big type" + typeof raw_value + " " + JSON.stringify(raw_value));
            }
            if (isSpecialDIFFloatString(raw_value)) {
                return specialDIFFloatToNumber(raw_value);
            } // FIXME this is a temporary solution until we have a proper decimal implementation
            else if (raw_value.includes("/")) {
                const [numerator, denominator] = raw_value.split("/").map((part) => part.trim());
                return parseFloat(numerator) / parseFloat(denominator);
            }
            else if (raw_value.includes(".")) {
                return parseFloat(raw_value);
            }
            else {
                unreachable("Expected a valid decimal string for decimal big type");
            }
        }
        else if ([
            CoreLibTypeId.decimal_f32,
            CoreLibTypeId.decimal_f64,
        ].includes(type_id)) {
            if (typeof raw_value === "string") {
                return specialDIFFloatToNumber(raw_value);
            }
            else if (typeof raw_value === "number") {
                return raw_value;
            }
            else {
                unreachable("Expected number value for decimal type");
            }
        }
        else if (type_id === CoreLibTypeId.text) {
            if (typeof raw_value !== "string") {
                unreachable("Expected string value for text type");
            }
            return raw_value;
        }
        else if (type_id === CoreLibTypeId.endpoint) {
            if (typeof raw_value !== "string") {
                unreachable("Expected string value for endpoint type");
            }
            return Endpoint.get(raw_value);
        }
        else if (type_id === CoreLibTypeId.Range) {
            if (!Array.isArray(raw_value) || raw_value.length !== 2) {
                unreachable("Expected array of length 2 for range type");
            }
            const [start, end] = raw_value;
            const res = [
                this.resolveDIFValueContainer(start),
                this.resolveDIFValueContainer(end),
            ];
            // FIXME fix range
            return new Range(res[0], res[1]);
        }
        else if (type_id === CoreLibTypeId.List) {
            if (!Array.isArray(raw_value)) {
                unreachable("Expected array value for list type");
            }
            return raw_value.map((v) => this.resolveDIFValueContainer(v));
        }
        else if (type_id === CoreLibTypeId.Map) {
            if (Array.isArray(raw_value)) {
                const map = new Map();
                for (const [key, value] of raw_value) {
                    map.set(this.resolveDIFValueContainer(key), this.resolveDIFValueContainer(value));
                }
                return map;
            }
            else if (typeof raw_value === "object" && raw_value !== null) {
                const object = {};
                for (const [key, value] of Object.entries(raw_value)) {
                    object[key] = this.resolveDIFValueContainer(value);
                }
                return object;
            }
            else {
                throw new Error("Expected array of key-value pairs or object for map type");
            }
        }
        else if (type_id === CoreLibTypeId.Callable) {
            const [hash, name, requiresAsync] = raw_value;
            const ctx = {};
            const callableBuilder = new Function("ctx", "DATEX_CALLABLE", `return ${requiresAsync ? "async " : ""}function ${name || ""}(...args) {return ctx[DATEX_CALLABLE](args)}`);
            const callable = callableBuilder(ctx, DATEX_CALLABLE);
            callable[DATEX_CALLABLE_HASH] = hash;
            const difCallee = [CoreLibTypeId.Callable, [hash, null]];
            Object.defineProperty(ctx, DATEX_CALLABLE, {
                value: requiresAsync
                    ? (args) => this.callCallableAsync(difCallee, args)
                    : (args) => this.callCallableSync(difCallee, args),
                configurable: false,
                enumerable: false,
                writable: true,
            });
            Object.seal(ctx);
            callable.ctx = ctx;
            return callable;
        }
        else if (type_id === CoreLibTypeId.EntityTypeDefinition) {
            const typeDef = raw_value;
            return createClassForEntityType(typeDef, this);
        }
        else if (type_id === CoreLibTypeId.Receiver) {
            return new ReadableStream();
        }
        else if (type_id === CoreLibTypeId.Sender) {
            return new WritableStream();
        }
        throw new Error(`Unsupported DIF type: ${type_id}`);
    }
    /**
     * Resolves a DIFValueContainer (either a DIFValue or a pointer address) to its corresponding JS value.
     * If the container contains pointers that are not yet loaded in memory, it returns a Promise that resolves to the value.
     * Otherwise, it returns the resolved value directly.
     * @param value - The DIFValueContainer to resolve.
     * @returns The resolved value as type T, or a Promise that resolves to type T.
     */
    resolveDIFValueContainer(value) {
        if (isSharedValueContainer(value)) {
            return this.resolvePointerAddress(...splitPointerAddressWithOwnership(value._));
        }
        else {
            return this.resolveDIFValue(value);
        }
    }
    /**
     * Resolves a pointer address to its corresponding JS value.
     * If the pointer address is not yet loaded in memory, it returns a Promise that resolves to the value.
     * Otherwise, it returns the resolved value directly.
     * @param ownership
     * @param address - The pointer address to resolve.
     * @returns The resolved value as type T, or a Promise that resolves to type T.
     */
    resolvePointerAddress(ownership, address) {
        const addressWithOwnership = combinePointerAddressWithOwnership(address, ownership);
        // check cache first
        const cached = this.getCachedStateForSharedContainer(address, ownership);
        if (cached === "insufficient_ownership") {
            // try to resolve with upgraded ownership if possible
            if (!this.#handle.has_address_with_ownership(addressWithOwnership)) {
                throw new Error(`Address ${address} not found in runtime with ownership ${ownership} or higher`);
            }
            this.#cache.get(address).maxOwnership = ownership;
            const upgraded = this.getCachedStateForSharedContainer(address, ownership);
            if (typeof upgraded === "string") {
                unreachable(`Ownership assertion passed but cache still returns ${upgraded}`);
            }
            return upgraded;
        }
        else if (cached === "not_cached") {
            // if not in cache, resolve from runtime
            const [container, mutability] = this.#handle.resolve_pointer_address(address);
            const value = this.resolveDIFValueContainer(container);
            // if immutable function value inside, replace inner Callable with call via shared container
            if (mutability === SharedContainerMutability.Immutable && typeof value === "function" &&
                !this.isClass(value)) {
                assert(this.isDatexCallable(value), "Expected a Datex callable function");
                this.bindSharedContainerCallable(value, address);
            }
            // init pointer
            const shared = this.initSharedValue(address, value, mutability, ownership);
            return shared.withOwnership(ownership);
        }
        else {
            // fallthrough case, already in cache with correct ownership
            return cached;
        }
    }
    isClass(fn) {
        return typeof fn === "function" &&
            /^class\s/.test(Function.prototype.toString.call(fn));
    }
    isDatexCallable(value) {
        return typeof value === "function" && "ctx" in value &&
            Object.hasOwn(value.ctx, DATEX_CALLABLE);
    }
    bindSharedContainerCallable(callable, address) {
        const requiresAsync = callable.constructor.name === "AsyncFunction";
        const difCallee = {
            _: combinePointerAddressWithOwnership(address, DIFSharedContainerOwnership.ImmutableRef),
        };
        callable.ctx[DATEX_CALLABLE] = requiresAsync
            ? (args) => this.callCallableAsync(difCallee, args)
            : (args) => this.callCallableSync(difCallee, args);
    }
    /**
     * Retrieves the original value from a proxy value if available
     * @param proxy
     * @returns
     */
    getOriginalValueFromProxy(proxy) {
        const address = this.getPointerAddressForValue(proxy);
        if (address) {
            const cached = this.#cache.get(address);
            if (cached && cached.originalValue) {
                return cached.originalValue;
            }
        }
        return null;
    }
    /**
     * Retrieves the proxy value for a given original value if available
     * @param original
     * @returns
     */
    getProxyValueFromOriginal(original) {
        const ref = this.#proxyMapping.get(original);
        if (ref) {
            const proxied = ref.deref();
            if (proxied) {
                return proxied;
            }
        }
        return null;
    }
    /**
     * Converts an array of JS values to an array of DIFValues.
     * If the input is null, it returns null.
     * @param values
     */
    convertToDIFValues(values) {
        return values?.map((value) => this.convertJSValueToDIFValueContainer(value)) ||
            null;
    }
    /**
     * Initializes a reference with the given value and mutability, by
     * adding a proxy wrapper if necessary, and setting up observation and caching on the JS side.
     */
    initSharedValue(pointerAddress, value, mutability, ownership) {
        let typeBinding = null;
        let metadata = undefined;
        const originalValue = value;
        // bind js value (if mutable, nominal type)
        const coreLibId = this.getCoreLibTypeIdForJSValue(value);
        // only bind the value, if we have a shared container or a core lib type
        const bindJSValue = typeof value === "object" && value !== null &&
            mutability !== SharedContainerMutability.Immutable;
        if (bindJSValue) {
            // if value class is registered in cache, this is an entity type - don't add type binding
            const isEntityType = typeof value === "object" && value !== null && "constructor" in value &&
                value.constructor &&
                this.getPointerAddressForValue(value.constructor) != null;
            typeBinding = isEntityType ? null : this.type_registry.getTypeBindingByCoreLibTypeId(coreLibId);
            if (typeBinding) {
                const { value: proxifiedValue, metadata: newMetadata } = typeBinding
                    .bindValue(value, pointerAddress);
                value = proxifiedValue;
                metadata = newMetadata;
            }
        }
        // wrap the value in a BaseSharedContainer
        const wrappedValue = new BaseSharedContainer(value, pointerAddress, mutability, this);
        // if not immutable, observe to keep the pointer 'live' and receive updates
        let observerId = null;
        if (mutability !== SharedContainerMutability.Immutable) {
            observerId = this.observeSharedValueBindDirect(pointerAddress, (update) => {
                const [sourceId, ...data] = update;
                // if source_id is not own transceiver id, handle pointer update
                if (sourceId !== this.#transceiver_id) {
                    try {
                        this.handlePointerUpdate(pointerAddress, wrappedValue, data, typeBinding);
                    }
                    catch (e) {
                        console.error("Error handling pointer update", e);
                        throw e;
                    }
                }
                // call all local observers
                const observers = this.#observers.get(pointerAddress);
                if (observers) {
                    for (const cb of observers.values()) {
                        try {
                            cb(data);
                        }
                        catch (e) {
                            console.error("Error in pointer observer callback", e);
                        }
                    }
                }
            });
        }
        this.cacheWrappedReferenceValue(pointerAddress, ownership, originalValue, wrappedValue, observerId, metadata);
        // set up observers
        return wrappedValue;
    }
    getCoreLibTypeIdForJSValue(value) {
        // check class constraints in type registry
        if (typeof value === "object" && value !== null && value.constructor) {
            const typeBinding = this.type_registry.getCoreLibIdForJSClass(value.constructor);
            if (typeBinding) {
                return typeBinding;
            }
        }
        return getCoreLibTypeIdForJSValue(value);
    }
    handlePointerUpdate(pointerAddress, value, update, typeBinding) {
        const cached = this.#cache.get(pointerAddress);
        if (!cached)
            return false;
        const deref = cached.value.deref();
        if (!deref)
            return false;
        if (!typeBinding?.getUpdateHandlerTypes().has(DIFUpdateKind.Replace) && update[1] === DIFUpdateKind.Replace) {
            // const path = update[0]; // TODO handle path
            deref.updateValueSilently(this.resolveDIFValueContainer(update[2]));
        }
        // handle generic updates for values (depending on type interface definition)
        if (typeBinding) {
            typeBinding.handleDifUpdate(value, pointerAddress, update);
        }
        return true;
    }
    /**
     * Udate the inner value of a BaseSharedContainer in the JS side cache
     * @param base
     */
    updateBaseSharedContainerValueCache(base) {
        if (this.isWeakKey(base.value)) {
            const metadata = this.#baseSharedContainerMetadata.get(base);
            if (metadata) {
                this.#jsValueSharedContainerMetadata.set(base.value, metadata);
            }
            else {
                unreachable(`No metadata found for base shared container at address ${base.pointerAddress}`);
            }
        }
    }
    /**
     * Caches the given reference value with the given address in the JS side cache.
     * The reference must already be wrapped if necessary.
     */
    cacheWrappedReferenceValue(address, ownership, originalValue, baseSharedContainer, observerId, customMetadata = {}) {
        // check if the value in the base shared container was proxified, or is still the original JS value (for primitive types)
        const isProxifiedValue = this.isWeakKey(originalValue) &&
            this.isWeakKey(baseSharedContainer.value) &&
            originalValue !== baseSharedContainer.value;
        // store the address, with the mapping between BaseSharedContainer and original JS value
        this.#cache.set(address, {
            value: new WeakRef(baseSharedContainer),
            maxOwnership: ownership,
            originalValue: isProxifiedValue ? originalValue : null,
            observerId,
        });
        // store base shared container with metadata
        this.#baseSharedContainerMetadata.set(baseSharedContainer, {
            address,
            customMetadata,
        });
        // update the cache for the original value if it is a weak key
        this.updateBaseSharedContainerValueCache(baseSharedContainer);
        // store in proxy mapping if original value is not identical to proxied value
        // and original value is a weak key
        if (isProxifiedValue) {
            this.#proxyMapping.set(originalValue, new WeakRef(baseSharedContainer));
        }
        this.#pointerFinalizationRegistry.register(baseSharedContainer, address);
        // trigger cache change observers
        this.#triggerCacheObservers();
    }
    #triggerCacheObservers() {
        for (const observer of this.#cacheObservers) {
            try {
                observer();
            }
            catch (e) {
                console.error("Error in cache observer callback", e);
            }
        }
    }
    /**
     * Registers a callback to be invoked whenever the cache changes (e.g., when a reference is added or removed).
     * @param callback
     */
    registerCacheObserver(callback) {
        this.#cacheObservers.add(callback);
    }
    getCachedStateForSharedContainer(address, ownership) {
        if (!this.#cache.has(address)) {
            return "not_cached";
        }
        const cached = this.#cache.get(address);
        const deref = cached.value.deref();
        if (!deref) {
            // try to resolve again from rust side, assuming that the shared value might still exist there and was just
            // garbage collected on the JS side.
            this.cleanupSharedValue(address);
            try {
                return this.resolvePointerAddress(ownership, address);
            }
            catch (e) {
                console.error(`Failed to resolve pointer address ${address} after cache cleanup:`, e);
                throw e;
            }
        }
        if (
        // ownership mismatch
        (ownership === DIFSharedContainerOwnership.Owned &&
            cached.maxOwnership !== DIFSharedContainerOwnership.Owned) || (cached.maxOwnership === DIFSharedContainerOwnership.ImmutableRef &&
            ownership === DIFSharedContainerOwnership.MutableRef)) {
            return "insufficient_ownership";
        }
        return deref.withOwnership(ownership);
    }
    /**
     * Creates a new reference containing the given JS value.
     * The returned value is a wrapped {@link OwnedSharedContainer} that can be used to access the value and its pointer address.
     */
    createSharedValueFromJSValue(value, allowedType = null, mutability = SharedContainerMutability.Mutable) {
        const pointerAddress = this.getPointerAddressForValue(value);
        if (pointerAddress) {
            throw new Error(`Value is already bound to a reference ($${pointerAddress}). Cannot create a new reference for the same value.`);
        }
        const difValue = this.convertJSValueToDIFValueContainer(value);
        const ptrAddress = this.constructSharedValue(difValue, mutability, allowedType);
        return new OwnedSharedContainer(this.initSharedValue(ptrAddress, value, mutability, DIFSharedContainerOwnership.Owned));
    }
    isPrimitiveValue(value) {
        return value === null || value === undefined ||
            typeof value === "boolean" ||
            typeof value === "number" || typeof value === "bigint" ||
            typeof value === "string" || typeof value === "symbol";
    }
    isWeakKey(value) {
        // non-registered symbols are valid WeakKeys
        return (typeof value === "symbol" && !Symbol.keyFor(value)) ||
            !this.isPrimitiveValue(value);
    }
    isBaseSharedContainer(value) {
        return value instanceof BaseSharedContainer;
    }
    /**
     * Tries to collapse a value to a {@link BaseSharedContainer} if it is a {@link ReferencedSharedContainer}
     * or {@link OwnedSharedContainer}, otherwise returns null.
     * If the value is already a {@link BaseSharedContainer}, it is returned as is.
     * @param value
     * @private
     */
    tryAsBaseSharedContainer(value) {
        if (value instanceof BaseSharedContainer) {
            return value;
        }
        else if (value instanceof ReferencedSharedContainer || value instanceof OwnedSharedContainer) {
            return value._base;
        }
        else {
            return null;
        }
    }
    /**
     * Collapses a value to its underlying value if it is a {@link ReferencedSharedContainer}, otherwise returns the value as is.
     * @param value
     */
    collapseReferenceSharedContainer(value) {
        if (value instanceof ReferencedSharedContainer) {
            return value.value; // equivalent to SharedRef<T>
        }
        else {
            return value;
        }
    }
    /**
     * Returns the pointer address for the given value if it is already cached, or null otherwise.
     */
    getPointerAddressForValue(value) {
        const maybeBase = this.tryAsBaseSharedContainer(value);
        if (maybeBase) {
            return maybeBase.pointerAddress;
        }
        else {
            return this.#jsValueSharedContainerMetadata.get(value)?.address || null;
        }
    }
    /**
     * Returns the reference metadata for the given value if it is registered.
     * The caller must ensure that the correct type M is used and the reference is already registered.
     * If the reference is not found, an error is thrown.
     */
    getReferenceMetadataUnsafe(value) {
        const metadata = this.tryGetReferenceMetadata(value);
        if (!metadata) {
            panic("Reference metadata not found for the given value");
        }
        return metadata;
    }
    /**
     * Returns the reference metadata for the given value if it is registered, or null otherwise.
     */
    tryGetReferenceMetadata(value) {
        // if passed value is a BaseSharedContainer, return its metadata directly
        const maybeBase = this.tryAsBaseSharedContainer(value);
        if (maybeBase) {
            return this.#baseSharedContainerMetadata.get(maybeBase) ?? null;
        }
        // request for the proxied (BaseSharedContainer.value) value
        if (this.#jsValueSharedContainerMetadata.has(value)) {
            return this.#jsValueSharedContainerMetadata.get(value) ?? null;
        }
        // otherwise the value is a non-proxied JS object
        const base = this.#proxyMapping.get(value)?.deref();
        return base ? this.#baseSharedContainerMetadata.get(base) ?? null : null;
    }
    // FIXME do we need these two methods still?
    // public isReference(value: object): boolean {
    //     return this.#referenceMetadata.has(value as CachedSharedContainer) ||
    //         this.#proxyMapping.has(value);
    // }
    // public getReferenceProxy<T>(value: CachedSharedContainer<T>): T | null {
    //     const reference = this.#referenceMetadata.get(value);
    //     if (reference) {
    //         return value;
    //     }
    //     const proxyRef = this.#proxyMapping.get(value);
    //     if (proxyRef) {
    //         const deref = proxyRef.deref();
    //         if (deref) {
    //             return deref as T;
    //         } else {
    //             panic("Reference proxy has been garbage collected");
    //         }
    //     } else {
    //         return null;
    //     }
    // }
    /**
     * Converts a given JS value to its DIFValueContainer representation.
     * This method can be called statically or with an instance to use the instance's DIFHandler context.
     * NOTE: When called statically, there is no cache for already registered references, meaning that new references will be created
     * for the same object each time this method is called.
     */
    static convertJSValueToDIFValueContainer(value, difHandlerInstance, forceExplicitFormat = false) {
        // if the value is a registered reference, return its address
        const ref = (value instanceof ReferencedSharedContainer || value instanceof OwnedSharedContainer)
            ? value._base
            : value;
        const existingReference = difHandlerInstance &&
            difHandlerInstance.tryGetReferenceMetadata(ref);
        if (existingReference) {
            return difHandlerInstance.generateDIFValueContainerForCachedPointer(existingReference.address);
        }
        else if (ref instanceof BaseSharedContainer) {
            if (!difHandlerInstance) {
                throw new Error("Could not resolve shared container in cache for value " + ref.pointerAddress +
                    " - no dif handler instance provided");
            }
            else {
                throw new Error("Could not find shared container in cache for value " + ref.pointerAddress);
            }
        }
        // TODO: handle custom types
        // core lib prefixed dif core types
        if (value === null) {
            return forceExplicitFormat ? [CoreLibTypeId.null, null] : null;
        }
        else if (typeof value === "string") {
            return forceExplicitFormat ? [CoreLibTypeId.text, value] : value;
        }
        else if (typeof value === "boolean") {
            return forceExplicitFormat ? [CoreLibTypeId.boolean, value] : value;
        }
        else if (typeof value === "number") {
            return forceExplicitFormat ? [CoreLibTypeId.decimal_f64, value] : value;
        }
        else if (typeof value === "bigint") {
            return ibig(value);
        }
        else if (value instanceof Endpoint) {
            return [CoreLibTypeId.endpoint, value.toString()];
        }
        else if (value instanceof Range) {
            return [CoreLibTypeId.Range, [
                    this.convertJSValueToDIFValueContainer(value.start, difHandlerInstance),
                    this.convertJSValueToDIFValueContainer(value.end, difHandlerInstance),
                ]];
        } // special treatment
        else if (value === undefined) {
            return JS_UNDEFINED;
        }
        else if (value instanceof Tagged) {
            // special case: empty tagged value
            if (value.value === EMPTY_TAG) {
                return createDIFValueWithTag([CoreLibTypeId.Unit, null], value.tag, true);
            }
            const inner = this.convertJSValueToDIFValueContainer(value.value, difHandlerInstance, true);
            if (isSharedValueContainer(inner)) {
                unimplemented("Support nested shared reference value in tagged value");
            }
            else if (isDIFCoreValue(inner)) {
                return createDIFValueWithTag(inner, value.tag);
            }
            else {
                unreachable("Unsupported inner value type in tagged value");
            }
        }
        else if (Array.isArray(value)) {
            return [
                CoreLibTypeId.List,
                value.map((v) => this.convertJSValueToDIFValueContainer(v, difHandlerInstance)),
            ];
        }
        else if (value instanceof Map) {
            const map = value
                .entries().map(([k, v]) => [
                this.convertJSValueToDIFValueContainer(k, difHandlerInstance),
                this.convertJSValueToDIFValueContainer(v, difHandlerInstance),
            ]).toArray();
            return [CoreLibTypeId.Map, map];
        }
        else if (typeof value === "object") {
            const map = {};
            for (const [key, val] of Object.entries(value)) {
                map[key] = this.convertJSValueToDIFValueContainer(val, difHandlerInstance);
            }
            return [CoreLibTypeId.Map, map];
        }
        else if (typeof value == "function") {
            // function originating from JS side, register it as shared value with pointer address
            if (!(DATEX_CALLABLE_HASH in value)) {
                if (!difHandlerInstance) {
                    throw new Error("Cannot register callable function without a DIFHandler instance");
                }
                // register the JS function as native callable via DIF
                difHandlerInstance.registerCallable(value);
                // after registration, the function should be in cache, so we can get its reference metadata and return the pointer address
                const existingReference = difHandlerInstance.tryGetReferenceMetadata(value);
                if (!existingReference) {
                    throw new Error("Failed to register callable function and retrieve its reference metadata");
                }
                return difHandlerInstance.generateDIFValueContainerForCachedPointer(existingReference.address);
            } // local DATEX function with hash
            else {
                const hash = value[DATEX_CALLABLE_HASH];
                return [CoreLibTypeId.Callable, [hash, null]];
            }
        }
        throw new Error("Unsupported type for conversion to DIFValue");
    }
    /**
     * Registers a callable function with the DATEX core runtime and stores its hash in the function's metadata.
     */
    registerCallable(callable, typeDefinition, isMethod = false) {
        const isAsync = callable.constructor.name === "AsyncFunction";
        typeDefinition ??= {
            kind: DIFCallableKind.Procedure,
            requires_async: isAsync,
            parameters: this.extractFunctionParameterNames(callable).map((name) => [name, CoreLibTypeId.Any]),
            rest_parameter: null,
            return_type: CoreLibTypeId.Any,
            yeet_type: CoreLibTypeId.Any,
        };
        const wrapperFn = (args) => {
            return callable(...args.map((arg) => this.resolveDIFValueContainer(arg)));
        };
        const address = this.#handle.register_callable(wrapperFn, callable.name || null, typeDefinition, isMethod);
        this.initSharedValue(address, callable, SharedContainerMutability.Immutable, DIFSharedContainerOwnership.ImmutableRef);
    }
    extractFunctionParameterNames(fn) {
        const fnStr = fn.toString();
        const result = fnStr.match(/\(([^)]*)\)/);
        if (!result) {
            throw new Error("Could not extract parameter names from function");
        }
        const params = result[1].split(",").map((param) => param.trim());
        return params;
    }
    /**
     * Generates the DIF representation for a cached pointer address, using the ownership information from the cache.
     */
    generateDIFValueContainerForCachedPointer(address) {
        const ownership = this.#cache.get(address);
        if (!ownership) {
            throw new Error(`Reference metadata found for address ${address} but no ownership info in cache`);
        }
        // move(x) -> function (x: OwnedValue) {}
        return { _: combinePointerAddressWithOwnership(address, ownership.maxOwnership) };
    }
    /**
     * Instance method wrapper for static convertJSValueToDIFValueContainer
     * Converts a given JS value to its DIFValueContainer representation.
     * @param value
     */
    convertJSValueToDIFValueContainer(value) {
        return DIFHandler.convertJSValueToDIFValueContainer(value, this);
    }
    /** DIF update handler utilities */
    /**
     * Triggers a 'set' update for the given pointer address, key and value.
     */
    triggerSet(pointerAddress, key, value) {
        const difKey = this.convertJSValueToDIFValueContainer(key);
        const difValue = this.convertJSValueToDIFValueContainer(value);
        this.updateSharedValue(pointerAddress, setEntry(difKey, difValue));
    }
    /**
     * Triggers a 'set' update for the given pointer address, index and value.
     */
    triggerIndexSet(pointerAddress, index, value) {
        if (typeof index !== "bigint" && !Number.isInteger(index)) {
            throw new Error("Index must be a non-negative integer");
        }
        const difValue = this.convertJSValueToDIFValueContainer(value);
        this.updateSharedValue(pointerAddress, setArrayEntry(Number(index), difValue));
    }
    /**
     * Triggers an 'append' update for the given pointer address and value.
     */
    triggerAppend(pointerAddress, value) {
        const difValue = this.convertJSValueToDIFValueContainer(value);
        this.updateSharedValue(pointerAddress, appendEntry(difValue));
    }
    /**
     * Triggers a 'replace' update for the given pointer address and key.
     */
    triggerReplace(pointerAddress, value) {
        const difValue = this.convertJSValueToDIFValueContainer(value);
        this.updateSharedValue(pointerAddress, replace(difValue));
    }
    /**
     * Triggers a 'delete' update for the given pointer address and key.
     */
    triggerDelete(pointerAddress, key) {
        const difKey = this.convertJSValueToDIFValueContainer(key);
        this.updateSharedValue(pointerAddress, deleteEntry(difKey));
    }
    /**
     * Triggers a 'clear' update for the given pointer address.
     */
    triggerClear(pointerAddress) {
        this.updateSharedValue(pointerAddress, clear());
    }
    /**
     * Triggers a 'list splice' update for the given pointer address.
     */
    triggerListSplice(pointerAddress, start, deleteCount, items) {
        const difItems = items.map((item) => this.convertJSValueToDIFValueContainer(item));
        this.updateSharedValue(pointerAddress, listSplice(start, deleteCount, difItems));
    }
}
