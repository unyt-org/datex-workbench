import type { DIFHandler } from "../dif/dif-handler.js";
import { DIFSharedContainerOwnership, type DIFUpdateData } from "../dif/types/mod.js";
import { type MaybeSharedRef, type PointerAddress, type SharedContainer } from "./mod.js";
export declare enum SharedContainerMutability {
    Immutable = 0,
    Mutable = 1
}
/**
 * The Ref class is a wrapper around a value that is stored in a pointer.
 * Primitive values (string, number, boolean, null) are always wrapped in a Ref when stored in a pointer.
 */
export declare class BaseSharedContainer<T, Mutability extends SharedContainerMutability = SharedContainerMutability> {
    #private;
    constructor(value: MaybeSharedRef<T, Mutability>, pointerAddress: PointerAddress, mutability: Mutability, difHandler: DIFHandler);
    /**
     * Gets the address of the pointer storing the reference.
     */
    get pointerAddress(): PointerAddress;
    /**
     * Silently updates the value of the reference without notifying observers.
     * This should only be used internally.
     * @param newValue - The new value to set.
     */
    updateValueSilently(newValue: MaybeSharedRef<T, Mutability>): void;
    /**
     * Gets the current value of the reference.
     */
    get value(): MaybeSharedRef<T, Mutability>;
    /**
     * Replaces the current value of the reference with a new value.
     * Also notifies all observers of the pointer about the change.
     * @throws If the reference is immutable or the new value is of an incompatible type.
     */
    set value(newValue: Mutability extends SharedContainerMutability.Mutable ? MaybeSharedRef<T, Mutability> : never);
    isContainerMutable(): this is BaseSharedContainer<T, typeof SharedContainerMutability.Mutable>;
    withOwnership<Ownership extends DIFSharedContainerOwnership>(ownership: Ownership): SharedContainer<T, Mutability>;
    /**
     * Observes changes to the shared container and invokes the provided callback when an update occurs.
     * @param callback
     */
    observe(callback: (value: DIFUpdateData) => void): void;
}
