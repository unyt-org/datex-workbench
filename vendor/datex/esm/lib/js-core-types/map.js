import { CoreLibTypeId } from "../../dif/core.js";
const ORIGINAL_SET = Symbol("ORIGINAL_SET");
const ORIGINAL_DELETE = Symbol("ORIGINAL_DELETE");
const ORIGINAL_CLEAR = Symbol("ORIGINAL_CLEAR");
export const mapTypeBinding = {
    coreLibTypeId: CoreLibTypeId.Map,
    jsClass: Map,
    bind(value, pointerAddress) {
        const originalSet = value.set.bind(value);
        const originalDelete = value.delete.bind(value);
        const originalClear = value.clear.bind(value);
        Object.defineProperties(value, {
            set: {
                value: (key, val) => {
                    this.difHandler.triggerSet(pointerAddress, key, val);
                    return originalSet.call(value, key, val);
                },
                configurable: true,
                writable: true,
            },
            delete: {
                value: (key) => {
                    this.difHandler.triggerDelete(pointerAddress, key);
                    return originalDelete.call(value, key);
                },
                configurable: true,
                writable: true,
            },
            clear: {
                value: () => {
                    console.warn("triggering clear for pointer address:", pointerAddress);
                    this.difHandler.triggerClear(pointerAddress);
                    return originalClear.call(value);
                },
                configurable: true,
                writable: true,
            },
        });
        return {
            value,
            metadata: {
                [ORIGINAL_SET]: originalSet,
                [ORIGINAL_DELETE]: originalDelete,
                [ORIGINAL_CLEAR]: originalClear,
            },
        };
    },
    handleSet(target, key, value) {
        const set = this.getCustomReferenceMetadata(target)[ORIGINAL_SET];
        set.call(target, key, value);
    },
    handleDelete(target, key) {
        const del = this.getCustomReferenceMetadata(target)[ORIGINAL_DELETE];
        del.call(target, key);
    },
    handleClear(target) {
        const clear = this.getCustomReferenceMetadata(target)[ORIGINAL_CLEAR];
        clear.call(target);
    },
    handleReplace(target, newValue) {
        const metadata = this.getCustomReferenceMetadata(target);
        metadata[ORIGINAL_CLEAR].call(target);
        for (const [key, value] of newValue.entries()) {
            metadata[ORIGINAL_SET].call(target, key, value);
        }
    },
};
