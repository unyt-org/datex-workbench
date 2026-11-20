import type { BaseSharedContainer, SharedContainerMutability } from "./base-shared-container.js";
import type { MaybeSharedRef, PointerAddress } from "./mod.js";
import type { DIFUpdateData } from "../dif/types/update.js";
export declare enum SharedReferenceMutability {
    Immutable = 0,
    Mutable = 1
}
export declare class ReferencedSharedContainer<T, Mutability extends SharedContainerMutability = SharedContainerMutability, ReferenceMutability extends SharedReferenceMutability = SharedReferenceMutability> {
    #private;
    constructor(baseSharedContainer: BaseSharedContainer<T, Mutability>, referenceMutability: ReferenceMutability);
    /**
     * Gets the address of the pointer storing the reference.
     */
    get pointerAddress(): PointerAddress;
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
    get _base(): BaseSharedContainer<T, Mutability>;
    isMutable(): boolean;
    /**
     * Derives an immutable reference from the current reference. The derived reference will have the same underlying shared container,
     * @returns A new ReferencedSharedContainer instance with immutable reference mutability.
     */
    deriveImmutableReference(): ReferencedSharedContainer<T, Mutability, SharedReferenceMutability.Immutable>;
    /**
     * Observes changes to the shared container and invokes the provided callback when an update occurs.
     * @param callback
     */
    observe(callback: (value: DIFUpdateData) => void): void;
}
