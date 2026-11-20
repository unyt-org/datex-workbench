import { CoreLibTypeId } from "../../dif/core.js";
import { mapTypeBinding } from "./map.js";
import { objectTypeBinding } from "./object.js";
export const mapOrObjectTypeBinding = {
    coreLibTypeId: CoreLibTypeId.Map,
    bind(value, pointerAddress) {
        if (value instanceof Map) {
            return mapTypeBinding.bind.call(this, value, pointerAddress);
        }
        else {
            return objectTypeBinding.bind.call(this, value, pointerAddress);
        }
    },
    handleSet(target, key, value) {
        if (target instanceof Map) {
            mapTypeBinding.handleSet.call(this, target, key, value);
        }
        else {
            objectTypeBinding.handleSet.call(this, target, key, value);
        }
    },
    handleDelete(target, key) {
        if (target instanceof Map) {
            mapTypeBinding.handleDelete.call(this, target, key);
        }
        else {
            objectTypeBinding.handleDelete.call(this, target, key);
        }
    },
    handleClear(target) {
        if (target instanceof Map) {
            mapTypeBinding.handleClear.call(this, target);
        }
        else {
            throw new Error("Clear operation is not supported for objects");
        }
    },
    handleReplace(target, newValue) {
        if (target instanceof Map) {
            mapTypeBinding.handleReplace.call(this, target, newValue);
        }
        else {
            objectTypeBinding.handleReplace.call(this, target, newValue);
        }
    },
};
