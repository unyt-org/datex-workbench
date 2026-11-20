import { ReferencedSharedContainer, SharedReferenceMutability } from "./reference.js";
import type { BaseSharedContainer, SharedContainerMutability } from "./base-shared-container.js";
import type { MaybeSharedRef, PointerAddress } from "./mod.js";
import type { DIFUpdateData } from "../dif/types/update.js";
export declare class OwnedSharedContainer<T, Mutability extends SharedContainerMutability = SharedContainerMutability> {
    #private;
    constructor(baseSharedContainer: BaseSharedContainer<T, Mutability>);
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
    /**
     * Derives a new mutable reference from the current reference if the current reference is mutable.
     * Otherwise returns an error
     * @returns A new mutable reference derived from the current reference if the current reference is mutable, otherwise throws an error.
     */
    deriveMutableReference(): Mutability extends SharedContainerMutability.Mutable ? ReferencedSharedContainer<T, Mutability, SharedReferenceMutability.Mutable> : never;
    /**
     * Derives a new immutable reference from the current reference. The derived reference will have the same underlying shared container,
     * @returns A new ReferencedSharedContainer instance with immutable reference mutability.
     */
    deriveImmutableReference(): ReferencedSharedContainer<T, Mutability, SharedReferenceMutability.Immutable>;
    /**
     * Observes changes to the shared container and invokes the provided callback when an update occurs.
     * @param callback
     */
    observe(callback: (value: DIFUpdateData) => void): void;
}
