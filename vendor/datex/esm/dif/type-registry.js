/**
 * This module implements the TypeRegistry and TypeBinding classes which allow registering custom type definitions and bindings to JS implementations.
 */
import { DEBUG_MODE } from "../global.js";
import { DIFUpdateKind } from "./types/mod.js";
import { IS_PROXY_ACCESS, } from "./dif-handler.js";
// interface GetProperty<K,V> = {
//     function getProperty<K>(self: Type, key: K) -> X;
// }
// type = {x: fn()->y),}
// impl Type {
//     fn autoSelectFamily() -> Family {
// }
// impl Type {
//     fn autoSelectFamily(self) -> Family {
//     }
// }
// Type.self(x);
// x->autoSelectFamily();
// MyTrait.autoSelectFamily(x);
// Type.autoSelectFamily(x);
// object->contains()
// obj.hasOwnPropety()
export class TypeRegistry {
    #difHandler;
    #typePointerAddressBindings = new Map();
    #coreLibTypeIdBindings = new Map();
    constructor(difHandler) {
        this.#difHandler = difHandler;
    }
    /**
     * Defines a completely new nominal type with optional implementations that can be bound to JS native functions.
     * @param definition
     */
    registerTypeDefinition(_definition) {
        // TODO
    }
    /**
     * Binds an existing nominal type to a JS mirror implementation.
     * @param typePointerAddress The address of the type pointer in the Datex runtime.
     */
    registerTypeBinding(typeBindingDefinition) {
        const binding = new TypeBinding(typeBindingDefinition, this.#difHandler);
        if (typeBindingDefinition.pointerAddress != null) {
            this.#typePointerAddressBindings.set(typeBindingDefinition.pointerAddress, binding);
        }
        else if (typeBindingDefinition.coreLibTypeId != null) {
            this.#coreLibTypeIdBindings.set(typeBindingDefinition.coreLibTypeId, binding);
        }
        else {
            throw new Error("TypeBindingDefinition must have either pointerAddress or coreLibTypeId defined");
        }
    }
    /**
     * Gets the type binding for a given type pointer address.
     * @param typePointerAddress The pointer address of the type in the Datex runtime.
     * @returns The corresponding TypeBinding or null if no binding is found for the given pointer address.
     */
    getTypeBindingForPointerAddress(typePointerAddress) {
        return this.#typePointerAddressBindings.get(typePointerAddress) || null;
    }
    getCoreLibIdForJSClass(jsClass) {
        for (const [coreLibId, binding] of this.#coreLibTypeIdBindings.entries()) {
            if (binding.matchesJSClass(jsClass)) {
                return coreLibId;
            }
        }
        return null;
    }
    /**
     * Gets the type binding for a given core library type id.
     * @param coreLibTypeId
     * @returns
     */
    getTypeBindingByCoreLibTypeId(coreLibTypeId) {
        return this.#coreLibTypeIdBindings.get(coreLibTypeId) || null;
    }
}
export class TypeBinding {
    #difHandler;
    #definition;
    get difHandler() {
        return this.#difHandler;
    }
    getCustomReferenceMetadata(value) {
        return this.#difHandler.getReferenceMetadataUnsafe(value)
            .customMetadata;
    }
    constructor(definition, difHandler) {
        this.#definition = definition;
        this.#difHandler = difHandler;
    }
    /**
     * Binds a new JS value to this type binding.
     * @returns
     */
    bindValue(value, pointerAddress) {
        return this.#definition.bind.call(this, value, pointerAddress);
    }
    /**
     * Checks if the given JS class matches the JS class defined in this type binding.
     * @param jsClass
     */
    matchesJSClass(jsClass) {
        return this.#definition.jsClass === jsClass;
    }
    /**
     * Sets up observers for the given value and pointer address if there are update handlers defined for this type binding.
     */
    handleDifUpdate(base, _pointerAddress, difUpdateData) {
        const updateHandlerTypes = this.getUpdateHandlerTypes();
        // add observer if there are update handlers
        if (updateHandlerTypes.size > 0) {
            // const path = difUpdateData[0]; // TODO handle path
            const kind = difUpdateData[1];
            const value = base.value;
            this.allowOriginalValueAccess(base, () => {
                // call appropriate handler based on update kind
                if (kind === DIFUpdateKind.SetEntry &&
                    this.#definition.handleSet) {
                    this.#definition.handleSet.call(this, value, this.#difHandler.resolveDIFValueContainer(difUpdateData[2]), this.#difHandler.resolveDIFValueContainer(difUpdateData[3]));
                }
                else if (kind === DIFUpdateKind.AppendEntry &&
                    this.#definition.handleAppend) {
                    this.#definition.handleAppend.call(this, value, this.#difHandler.resolveDIFValueContainer(difUpdateData[2]));
                }
                else if (kind === DIFUpdateKind.Replace &&
                    this.#definition.handleReplace) {
                    this.#definition.handleReplace.call(this, value, this.#difHandler.resolveDIFValueContainer(difUpdateData[2]));
                }
                else if (kind === DIFUpdateKind.DeleteEntry &&
                    this.#definition.handleDelete) {
                    this.#definition.handleDelete.call(this, value, difUpdateData[2]);
                }
                else if (kind === DIFUpdateKind.Clear &&
                    this.#definition.handleClear) {
                    this.#definition.handleClear.call(this, value);
                }
                else if (kind === DIFUpdateKind.ListSplice &&
                    this.#definition.handleListSplice) {
                    this.#definition.handleListSplice.call(this, value, difUpdateData[2], difUpdateData[3], difUpdateData[4].map((item) => this.#difHandler.resolveDIFValueContainer(item)));
                }
            });
        }
    }
    getUpdateHandlerTypes() {
        const updateHandlerTypes = new Set();
        if (this.#definition.handleSet) {
            updateHandlerTypes.add(DIFUpdateKind.SetEntry);
        }
        if (this.#definition.handleAppend) {
            updateHandlerTypes.add(DIFUpdateKind.AppendEntry);
        }
        if (this.#definition.handleReplace) {
            updateHandlerTypes.add(DIFUpdateKind.Replace);
        }
        if (this.#definition.handleDelete) {
            updateHandlerTypes.add(DIFUpdateKind.DeleteEntry);
        }
        if (this.#definition.handleClear) {
            updateHandlerTypes.add(DIFUpdateKind.Clear);
        }
        return updateHandlerTypes;
    }
    allowOriginalValueAccess(target, callback) {
        if (!DEBUG_MODE) {
            return callback();
        }
        const metadata = this.getCustomReferenceMetadata(target);
        metadata[IS_PROXY_ACCESS] = true;
        try {
            return callback();
        }
        finally {
            metadata[IS_PROXY_ACCESS] = false;
        }
    }
}
