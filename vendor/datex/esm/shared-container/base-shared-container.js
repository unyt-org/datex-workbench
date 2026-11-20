import { DIFSharedContainerOwnership } from "../dif/types/mod.js";
import { OwnedSharedContainer } from "./mod.js";
import { ReferencedSharedContainer } from "./reference.js";
export var SharedContainerMutability;
(function (SharedContainerMutability) {
    SharedContainerMutability[SharedContainerMutability["Immutable"] = 0] = "Immutable";
    SharedContainerMutability[SharedContainerMutability["Mutable"] = 1] = "Mutable";
})(SharedContainerMutability || (SharedContainerMutability = {}));
/**
 * The Ref class is a wrapper around a value that is stored in a pointer.
 * Primitive values (string, number, boolean, null) are always wrapped in a Ref when stored in a pointer.
 */
export class BaseSharedContainer {
    #value;
    #pointerAddress;
    #difHandler;
    #containerMutability;
    constructor(value, pointerAddress, mutability, difHandler) {
        this.#value = value;
        this.#pointerAddress = pointerAddress;
        this.#containerMutability = mutability;
        this.#difHandler = difHandler;
    }
    /**
     * Gets the address of the pointer storing the reference.
     */
    get pointerAddress() {
        return this.#pointerAddress;
    }
    /**
     * Silently updates the value of the reference without notifying observers.
     * This should only be used internally.
     * @param newValue - The new value to set.
     */
    updateValueSilently(newValue) {
        this.#value = newValue;
    }
    /**
     * Gets the current value of the reference.
     */
    get value() {
        return this.#value;
    }
    /**
     * Replaces the current value of the reference with a new value.
     * Also notifies all observers of the pointer about the change.
     * @throws If the reference is immutable or the new value is of an incompatible type.
     */
    set value(newValue) {
        if (!this.isContainerMutable()) {
            throw new Error("Cannot set value of an immutable reference.");
        }
        const oldValue = this.#value;
        if (oldValue === newValue)
            return;
        // Try to update the pointer
        this.#difHandler.triggerReplace(this.#pointerAddress, newValue);
        this.#value = newValue;
    }
    isContainerMutable() {
        return this.#containerMutability === SharedContainerMutability.Mutable;
    }
    withOwnership(ownership) {
        if (ownership === DIFSharedContainerOwnership.ImmutableRef) {
            return new ReferencedSharedContainer(this, ownership);
        }
        else if (ownership === DIFSharedContainerOwnership.MutableRef) {
            if (this.isContainerMutable()) {
                return new ReferencedSharedContainer(this, ownership);
            }
            else {
                throw new Error("Cannot create a mutable reference to an immutable shared container.");
            }
        }
        else if (ownership === DIFSharedContainerOwnership.Owned) {
            return new OwnedSharedContainer(this);
        }
        else {
            throw new Error(`Invalid ownership type: ${ownership}`);
        }
    }
    /**
     * Observes changes to the shared container and invokes the provided callback when an update occurs.
     * @param callback
     */
    observe(callback) {
        this.#difHandler.observePointer(this.#pointerAddress, callback);
    }
}
