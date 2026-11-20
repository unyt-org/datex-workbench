import { ReferencedSharedContainer, SharedReferenceMutability } from "./reference.js";
export class OwnedSharedContainer {
    #baseSharedContainer;
    constructor(baseSharedContainer) {
        this.#baseSharedContainer = baseSharedContainer;
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
    /**
     * Derives a new mutable reference from the current reference if the current reference is mutable.
     * Otherwise returns an error
     * @returns A new mutable reference derived from the current reference if the current reference is mutable, otherwise throws an error.
     */
    deriveMutableReference() {
        if (this.#baseSharedContainer.isContainerMutable()) {
            return new ReferencedSharedContainer(this.#baseSharedContainer, SharedReferenceMutability.Mutable);
        }
        else {
            throw new Error("Cannot derive a mutable reference from an immutable reference.");
        }
    }
    /**
     * Derives a new immutable reference from the current reference. The derived reference will have the same underlying shared container,
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
