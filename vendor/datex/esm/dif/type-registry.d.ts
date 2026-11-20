/**
 * This module implements the TypeRegistry and TypeBinding classes which allow registering custom type definitions and bindings to JS implementations.
 */
import type { CoreLibTypeId } from "./core.js";
import { type DIFTypeDefinition, type DIFUpdateData, DIFUpdateKind } from "./types/mod.js";
import { type CachedSharedContainer, type CustomReferenceMetadata, type DIFHandler } from "./dif-handler.js";
import type { BaseSharedContainer, PointerAddress, SharedContainerMutability, SharedRef } from "../shared-container/mod.js";
type ImplMethod = {
    name: string;
    implementation: (...args: unknown[]) => unknown;
};
type OwnImpl = {
    methods: ImplMethod[];
};
type InterfaceImpl = {
    interfaceName: string;
    methods: ImplMethod[];
};
export type TypeDefinition = {
    name: string;
    structuralDefinition: DIFTypeDefinition;
    ownImpls?: OwnImpl[];
    interfaceImpls: InterfaceImpl[];
};
export type TypeBindingContext<M extends CustomReferenceMetadata> = {
    readonly difHandler: DIFHandler;
    getCustomReferenceMetadata(value: WeakKey): M;
    allowOriginalValueAccess<R>(target: WeakKey, callback: () => R): R;
};
export type BindResult<T, M extends CustomReferenceMetadata> = {
    value: T;
    metadata: M;
};
export type TypeBindingDefinition<T extends object, M extends CustomReferenceMetadata = CustomReferenceMetadata> = {
    coreLibTypeId?: CoreLibTypeId;
    pointerAddress?: PointerAddress;
    jsClass?: new (...args: unknown[]) => T;
    bind(this: TypeBindingContext<M>, value: T, pointerAddress: PointerAddress): BindResult<T, M>;
    handleSet?(this: TypeBindingContext<M>, target: SharedRef<T, SharedContainerMutability>, key: unknown, value: unknown): void;
    handleAppend?(this: TypeBindingContext<M>, target: SharedRef<T, SharedContainerMutability>, value: unknown): void;
    handleReplace?(this: TypeBindingContext<M>, parent: SharedRef<T, SharedContainerMutability>, newValue: unknown): void;
    handleDelete?(this: TypeBindingContext<M>, target: SharedRef<T, SharedContainerMutability>, key: unknown): void;
    handleClear?(this: TypeBindingContext<M>, target: SharedRef<T, SharedContainerMutability>): void;
    handleListSplice?(this: TypeBindingContext<M>, target: SharedRef<T, SharedContainerMutability>, start: number, deleteCount: number, items: unknown[]): void;
};
export declare class TypeRegistry {
    #private;
    constructor(difHandler: DIFHandler);
    /**
     * Defines a completely new nominal type with optional implementations that can be bound to JS native functions.
     * @param definition
     */
    registerTypeDefinition(_definition: TypeDefinition): void;
    /**
     * Binds an existing nominal type to a JS mirror implementation.
     * @param typePointerAddress The address of the type pointer in the Datex runtime.
     */
    registerTypeBinding<T extends object>(typeBindingDefinition: TypeBindingDefinition<T>): void;
    /**
     * Gets the type binding for a given type pointer address.
     * @param typePointerAddress The pointer address of the type in the Datex runtime.
     * @returns The corresponding TypeBinding or null if no binding is found for the given pointer address.
     */
    getTypeBindingForPointerAddress(typePointerAddress: string): TypeBinding | null;
    getCoreLibIdForJSClass(jsClass: new (...args: unknown[]) => object): CoreLibTypeId | null;
    /**
     * Gets the type binding for a given core library type id.
     * @param coreLibTypeId
     * @returns
     */
    getTypeBindingByCoreLibTypeId(coreLibTypeId: CoreLibTypeId): TypeBinding | null;
}
export declare class TypeBinding<T extends object = object, M extends CustomReferenceMetadata = CustomReferenceMetadata> {
    #private;
    get difHandler(): DIFHandler;
    getCustomReferenceMetadata(value: CachedSharedContainer): M;
    constructor(definition: TypeBindingDefinition<T, M>, difHandler: DIFHandler);
    /**
     * Binds a new JS value to this type binding.
     * @returns
     */
    bindValue(value: T, pointerAddress: PointerAddress): BindResult<T, M>;
    /**
     * Checks if the given JS class matches the JS class defined in this type binding.
     * @param jsClass
     */
    matchesJSClass(jsClass: new (...args: unknown[]) => object): boolean;
    /**
     * Sets up observers for the given value and pointer address if there are update handlers defined for this type binding.
     */
    handleDifUpdate(base: BaseSharedContainer<T>, _pointerAddress: string, difUpdateData: DIFUpdateData): void;
    getUpdateHandlerTypes(): Set<DIFUpdateKind>;
    allowOriginalValueAccess<R>(target: CachedSharedContainer, callback: () => R): R;
}
export {};
