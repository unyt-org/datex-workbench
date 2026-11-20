/**
 * @module DIF Handler
 * Represents the main interface for interacting with the DATEX Core via DIF from JavaScript.
 */
import type { JSDIFInterface, JSRuntime } from "../datex.js";
import { Endpoint } from "../lib/special-core-types/endpoint.js";
import { type DIFTypeDefinition, type DIFUpdate, type DIFUpdateData, type DIFValue, type DIFValueContainer, type ObserveOptions } from "./types/mod.js";
import { type TypeBinding, TypeRegistry } from "./type-registry.js";
import { SharedContainerMutability } from "../shared-container/base-shared-container.js";
import { BaseSharedContainer, type PointerAddress, ReferencedSharedContainer, type SharedContainer, type SharedRef } from "../shared-container/mod.js";
import { DIFSharedContainerOwnership } from "./types/type.js";
import type { DIFUpdateReturn } from "./types/update.js";
import { OwnedSharedContainer } from "../shared-container/owned.js";
export declare const IS_PROXY_ACCESS: unique symbol;
export type CustomReferenceMetadata = Record<string | symbol, unknown> & {
    [IS_PROXY_ACCESS]?: boolean;
};
export type ReferenceMetadata<M extends CustomReferenceMetadata> = {
    address: PointerAddress;
    customMetadata: M;
};
export type CachedSharedContainer = SharedRef<object> | BaseSharedContainer<unknown, SharedContainerMutability> | OwnedSharedContainer<unknown> | ReferencedSharedContainer<unknown>;
export type CacheData = {
    value: WeakRef<BaseSharedContainer<unknown, SharedContainerMutability>>;
    maxOwnership: DIFSharedContainerOwnership;
    originalValue: object | null;
    observerId: number | null;
};
declare const DATEX_CALLABLE: unique symbol;
export type Callable = ((...args: unknown[]) => unknown) & {
    ctx: {
        [DATEX_CALLABLE]: (args: unknown[]) => unknown;
    };
};
/**
 * The DIFHandler class provides methods to interact with the DATEX Core DIF runtime,
 * including executing Datex scripts, creating and managing references, and observing changes.
 * It includes a local reference cache to optimize performance and reduce cross-language calls.
 */
export declare class DIFHandler {
    #private;
    /**
     * Internal property
     * @returns The map of observers for each pointer address.
     */
    get _observers(): Map<string, Map<number, (value: DIFUpdateData) => void>>;
    /**
     * Internal property
     * @returns The {@link JSDIFInterface} instance.
     */
    get _handle(): JSDIFInterface;
    /**
     * This should only be used for debugging purposes, not for modifying the cache.
     * @returns The map of cached references.
     */
    get _cache(): Map<PointerAddress, CacheData>;
    /**
     * Internal property
     * @returns The transceiver ID of the DIF client.
     */
    get _transceiver_id(): number;
    get type_registry(): TypeRegistry;
    /**
     * Creates a new DIFHandler instance.
     * This also sets up all type bindings for core types (array, map, ...) on the runtime.
     * @param runtime - The JSRuntime instance for executing Datex scripts.
     */
    constructor(runtime: JSRuntime);
    /**
     * Executes a Datex script asynchronously and returns a Promise that resolves to a DIFContainer.
     * @param datexScript - The Datex script source code to execute.
     * @param values - An optional array of values to inject into the script.
     * @param markAsDebug - An optional boolean to mark the (remote) execution as debug (default: false).
     * @returns A Promise that resolves to the execution result as a DIFContainer.
     * @throws If an error occurs during execution.
     */
    executeDIF(datexScript: string, values?: unknown[] | null, markAsDebug?: boolean): Promise<DIFValueContainer | undefined>;
    /**
     * Executes a Datex script asynchronously and returns a Promise that resolves to a DIFContainer.
     * @param target - The target endpoint for the execution.
     * @param datexScript - The Datex script source code to execute.
     * @param values - An optional array of values to inject into the script.
     * @param markAsDebug - An optional boolean to mark the (remote) execution as debug (default: false).
     * @returns A Promise that resolves to the execution result as a DIFContainer.
     * @throws If an error occurs during execution.
     */
    executeDIFRemote(target: Endpoint, datexScript: string, values?: unknown[] | null, markAsDebug?: boolean): Promise<DIFValueContainer | undefined>;
    /**
     * Executes a Datex script synchronously and returns the result as a DIFContainer.
     * @param datexScript - The Datex script source code to execute.
     * @param values - An optional array of values to inject into the script.
     * @returns The execution result as a DIFContainer.
     * @throws If an error occurs during execution.
     */
    executeSyncDIF(datexScript: string, values?: unknown[] | null): DIFValueContainer | undefined;
    /**
     * Creates a new shared value for the specified DIF value.
     * @param difValueContainer - The DIFValueContainer value to create a pointer for.
     * @param allowedType - The allowed type for the pointer.
     * @param mutability - The mutability of the pointer.
     * @returns The created pointer address.
     */
    constructSharedValue(difValueContainer: DIFValueContainer, mutability?: SharedContainerMutability, allowedType?: DIFTypeDefinition | null): PointerAddress;
    /**
     * Updates the DIF value at the specified address.
     * @param address - The address of the DIF value to update.
     * @param update_data - The DIFUpdate object containing the update information.
     */
    updateSharedValue(address: PointerAddress, update_data: DIFUpdateData): DIFUpdateReturn;
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
    observeSharedValueBindDirect(address: PointerAddress, callback: (value: DIFUpdate) => void, options?: ObserveOptions): number;
    /**
     * Updates the observe options for a registered observer.
     * @param address - The address of the DIF value being observed.
     * @param observerId - The observer ID returned by the observePointer method.
     * @param options - The new observe options to apply.
     */
    private updateObserverOptions;
    /**
     * Removes any cache state of a shared value.
     * This should only be called if the value of the shared container / the BaseSharedContainer was garbage collected on the JS side,
     * @param address
     * @private
     */
    private cleanupSharedValue;
    /**
     * Enables propagation of own updates for a registered observer.
     * @param address - The address of the DIF value being observed.
     * @param observerId - The observer ID returned by the observePointer method.
     */
    enableOwnUpdatesPropagation(address: PointerAddress, observerId: number): void;
    /**
     * Disables propagation of own updates for a registered observer.
     * @param address - The address of the DIF value being observed.
     * @param observerId - The observer ID returned by the observePointer method.
     */
    disableOwnUpdatesPropagation(address: PointerAddress, observerId: number): void;
    /**
     * Unregisters an observer that was registered directly on the DATEX core runtime
     * with the observePointerBindDirect method.
     * For internal use only.
     * @param address - The address of the DIF value being observed.
     * @param observerId - The observer ID returned by the observePointer method.
     */
    unobserveSharedValueBindDirect(address: PointerAddress, observerId: number): void;
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
    observePointer(address: PointerAddress, callback: (value: DIFUpdateData) => void): number;
    /**
     * Unregisters an observer that was registered with the observePointer method.
     * @param address - The address of the DIF value being observed.
     * @param observerId - The observer ID returned by the observePointer method.
     * @returns True if the observer was successfully unregistered, false otherwise.
     */
    unobservePointer(address: PointerAddress, observerId: number): boolean;
    /**
     * Calls a sync callable DIF value identified by the given hash with the specified arguments.
     */
    private callCallableSync;
    /**
     * Calls an async callable DIF value identified by the given hash with the specified arguments.
     */
    private callCallableAsync;
    /**
     * Calls a sync method on a DIF value
     */
    callMethodSync(callee: DIFValueContainer, method: string, args: unknown[]): unknown;
    /**
     * Calls an async method on a DIF value
     */
    callMethodAsync(callee: DIFValueContainer, method: string, args: unknown[]): Promise<unknown>;
    /**
     * Resolves a DIFValue to its corresponding JS value.
     * This function handles core types and custom types (not yet implemented).
     * It returns the resolved value as the specified type T.
     * @param value
     */
    resolveDIFValue<T extends unknown>(value: DIFValue): T;
    /**
     * Creates a new JS class instance for a given entity value.
     */
    private instantiateEntityInstance;
    private resolveDIFTaggedValue;
    private resolveDIFInMemoryValue;
    private resolveDIFCoreValue;
    /**
     * Resolves a DIFValueContainer (either a DIFValue or a pointer address) to its corresponding JS value.
     * If the container contains pointers that are not yet loaded in memory, it returns a Promise that resolves to the value.
     * Otherwise, it returns the resolved value directly.
     * @param value - The DIFValueContainer to resolve.
     * @returns The resolved value as type T, or a Promise that resolves to type T.
     */
    resolveDIFValueContainer<T>(value: DIFValueContainer): T;
    /**
     * Resolves a pointer address to its corresponding JS value.
     * If the pointer address is not yet loaded in memory, it returns a Promise that resolves to the value.
     * Otherwise, it returns the resolved value directly.
     * @param ownership
     * @param address - The pointer address to resolve.
     * @returns The resolved value as type T, or a Promise that resolves to type T.
     */
    resolvePointerAddress<T extends unknown>(ownership: DIFSharedContainerOwnership, address: PointerAddress): SharedContainer<T, SharedContainerMutability>;
    private isClass;
    isDatexCallable(value: unknown): value is Callable;
    private bindSharedContainerCallable;
    /**
     * Retrieves the original value from a proxy value if available
     * @param proxy
     * @returns
     */
    getOriginalValueFromProxy<T extends WeakKey>(proxy: CachedSharedContainer & T): T | null;
    /**
     * Retrieves the proxy value for a given original value if available
     * @param original
     * @returns
     */
    getProxyValueFromOriginal<T extends WeakKey>(original: T): T | null;
    /**
     * Converts an array of JS values to an array of DIFValues.
     * If the input is null, it returns null.
     * @param values
     */
    convertToDIFValues<T extends unknown[]>(values: T | null): DIFValueContainer[] | null;
    /**
     * Initializes a reference with the given value and mutability, by
     * adding a proxy wrapper if necessary, and setting up observation and caching on the JS side.
     */
    protected initSharedValue<T, Mutability extends SharedContainerMutability>(pointerAddress: PointerAddress, value: T, mutability: Mutability, ownership: DIFSharedContainerOwnership): BaseSharedContainer<T, Mutability>;
    private getCoreLibTypeIdForJSValue;
    /**
     * Handles a pointer update received from the DATEX core runtime.
     * for non-primitive values.
     * If the pointer is cached and has a dereferenceable value, it updates the value.
     * @param pointerAddress - The address of the pointer being updated.
     * @param update - The DIFUpdateData containing the update information.
     * @returns True if the pointer was found and updated, false otherwise.
     */
    protected handlePointerUpdate<T extends object>(pointerAddress: string, value: BaseSharedContainer<T>, update: DIFUpdateData, typeBinding: TypeBinding<T> | null): boolean;
    /**
     * Handles a pointer update received from the DATEX core runtime.
     * for primitive values (typeBinding not supported).
     * If the pointer is cached and has a dereferenceable value, it updates the value.
     * @param pointerAddress - The address of the pointer being updated.
     * @param update - The DIFUpdateData containing the update information.
     * @returns True if the pointer was found and updated, false otherwise.
     */
    protected handlePointerUpdate<T>(pointerAddress: PointerAddress, value: BaseSharedContainer<T>, update: DIFUpdateData, typeBinding: null): boolean;
    /**
     * Udate the inner value of a BaseSharedContainer in the JS side cache
     * @param base
     */
    protected updateBaseSharedContainerValueCache(base: BaseSharedContainer<unknown, SharedContainerMutability>): void;
    /**
     * Caches the given reference value with the given address in the JS side cache.
     * The reference must already be wrapped if necessary.
     */
    protected cacheWrappedReferenceValue(address: PointerAddress, ownership: DIFSharedContainerOwnership, originalValue: unknown, baseSharedContainer: BaseSharedContainer<unknown, SharedContainerMutability>, observerId: number | null, customMetadata?: CustomReferenceMetadata): void;
    /**
     * Registers a callback to be invoked whenever the cache changes (e.g., when a reference is added or removed).
     * @param callback
     */
    registerCacheObserver(callback: () => void): void;
    protected getCachedStateForSharedContainer<T>(address: PointerAddress, ownership: DIFSharedContainerOwnership): SharedContainer<T, SharedContainerMutability> | "not_cached" | "insufficient_ownership";
    /**
     * Creates a new reference containing the given JS value.
     * The returned value is a wrapped {@link OwnedSharedContainer} that can be used to access the value and its pointer address.
     */
    createSharedValueFromJSValue<V, M extends SharedContainerMutability>(value: V, allowedType?: DIFTypeDefinition | null, mutability?: M): OwnedSharedContainer<V, M>;
    protected isPrimitiveValue(value: unknown): value is null | undefined | boolean | number | bigint | string | symbol;
    protected isWeakKey(value: unknown): value is CachedSharedContainer;
    private isBaseSharedContainer;
    /**
     * Tries to collapse a value to a {@link BaseSharedContainer} if it is a {@link ReferencedSharedContainer}
     * or {@link OwnedSharedContainer}, otherwise returns null.
     * If the value is already a {@link BaseSharedContainer}, it is returned as is.
     * @param value
     * @private
     */
    private tryAsBaseSharedContainer;
    /**
     * Collapses a value to its underlying value if it is a {@link ReferencedSharedContainer}, otherwise returns the value as is.
     * @param value
     */
    collapseReferenceSharedContainer(value: unknown): unknown;
    /**
     * Returns the pointer address for the given value if it is already cached, or null otherwise.
     */
    getPointerAddressForValue(value: CachedSharedContainer): PointerAddress | null;
    /**
     * Returns the reference metadata for the given value if it is registered.
     * The caller must ensure that the correct type M is used and the reference is already registered.
     * If the reference is not found, an error is thrown.
     */
    getReferenceMetadataUnsafe<M extends CustomReferenceMetadata>(value: CachedSharedContainer): ReferenceMetadata<M>;
    /**
     * Returns the reference metadata for the given value if it is registered, or null otherwise.
     */
    tryGetReferenceMetadata<M extends CustomReferenceMetadata>(value: CachedSharedContainer): ReferenceMetadata<M> | null;
    /**
     * Converts a given JS value to its DIFValueContainer representation.
     * This method can be called statically or with an instance to use the instance's DIFHandler context.
     * NOTE: When called statically, there is no cache for already registered references, meaning that new references will be created
     * for the same object each time this method is called.
     */
    static convertJSValueToDIFValueContainer<T extends unknown>(value: T, difHandlerInstance?: DIFHandler, forceExplicitFormat?: boolean): DIFValueContainer<T>;
    /**
     * Registers a callable function with the DATEX core runtime and stores its hash in the function's metadata.
     */
    private registerCallable;
    private extractFunctionParameterNames;
    /**
     * Generates the DIF representation for a cached pointer address, using the ownership information from the cache.
     */
    private generateDIFValueContainerForCachedPointer;
    /**
     * Instance method wrapper for static convertJSValueToDIFValueContainer
     * Converts a given JS value to its DIFValueContainer representation.
     * @param value
     */
    convertJSValueToDIFValueContainer<T extends unknown>(value: T): DIFValueContainer<T>;
    /** DIF update handler utilities */
    /**
     * Triggers a 'set' update for the given pointer address, key and value.
     */
    triggerSet<K, V>(pointerAddress: PointerAddress, key: K, value: V): void;
    /**
     * Triggers a 'set' update for the given pointer address, index and value.
     */
    triggerIndexSet<V>(pointerAddress: PointerAddress, index: number | bigint, value: V): void;
    /**
     * Triggers an 'append' update for the given pointer address and value.
     */
    triggerAppend<V>(pointerAddress: PointerAddress, value: V): void;
    /**
     * Triggers a 'replace' update for the given pointer address and key.
     */
    triggerReplace<V>(pointerAddress: PointerAddress, value: V): void;
    /**
     * Triggers a 'delete' update for the given pointer address and key.
     */
    triggerDelete<K>(pointerAddress: PointerAddress, key: K): void;
    /**
     * Triggers a 'clear' update for the given pointer address.
     */
    triggerClear(pointerAddress: PointerAddress): void;
    /**
     * Triggers a 'list splice' update for the given pointer address.
     */
    triggerListSplice<V>(pointerAddress: PointerAddress, start: number, deleteCount: number, items: V[]): void;
}
export {};
