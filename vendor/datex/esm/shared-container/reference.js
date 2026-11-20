export var SharedReferenceMutability;
(function (SharedReferenceMutability) {
    SharedReferenceMutability[SharedReferenceMutability["Immutable"] = 0] = "Immutable";
    SharedReferenceMutability[SharedReferenceMutability["Mutable"] = 1] = "Mutable";
})(SharedReferenceMutability || (SharedReferenceMutability = {}));
export class ReferencedSharedContainer {
    #baseSharedContainer;
    #referenceMutability;
    constructor(baseSharedContainer, referenceMutability) {
        this.#baseSharedContainer = baseSharedContainer;
        this.#referenceMutability = referenceMutability;
    }
    /**
     * Gets the address of the pointer storing the reference.
     */
    get pointerAddress() {
        return this.#baseSharedContainer.pointerAddress;
    }
    /**
     * Gets the current value of the reference.
     */
    get value() {
        return this.#baseSharedContainer.value;
    }
    /**
     * Replaces the current value of the reference with a new value.
     * Also notifies all observers of the pointer about the change.
     * @throws If the reference is immutable or the new value is of an incompatible type.
     */
    set value(newValue) {
        this.#baseSharedContainer.value = newValue;
    }
    // FIXME
    get _base() {
        return this.#baseSharedContainer;
    }
    isMutable() {
        return this.#referenceMutability === SharedReferenceMutability.Mutable;
    }
    /**
     * Derives an immutable reference from the current reference. The derived reference will have the same underlying shared container,
     * @returns A new ReferencedSharedContainer instance with immutable reference mutability.
     */
    deriveImmutableReference() {
        return new ReferencedSharedContainer(this.#baseSharedContainer, SharedReferenceMutability.Immutable);
    }
    /**
     * Observes changes to the shared container and invokes the provided callback when an update occurs.
     * @param callback
     */
    observe(callback) {
        this.#baseSharedContainer.observe(callback);
    }
}
// export function deriveImmutableReference<
//     T,
//     Mutability extends SharedContainerMutability,
// >(
//     reference: SharedReferenced<T, Mutability, SharedReferenceMutability>,
// ): SharedReferenced<T, Mutability, SharedReferenceMutability.Immutable> {
//     return reference as SharedReferenced<T, Mutability, SharedReferenceMutability.Immutable>;
// }
