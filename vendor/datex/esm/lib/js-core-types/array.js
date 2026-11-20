import { CoreLibTypeId } from "../../dif/core.js";
import { IS_PROXY_ACCESS } from "../../dif/dif-handler.js";
import { interceptAccessors } from "../../dif/reflect-utils.js";
import { DEBUG_MODE } from "../../global.js";
import { Option } from "../../utils/option.js";
export const arrayTypeBinding = {
    coreLibTypeId: CoreLibTypeId.List,
    jsClass: Array,
    bind(target, pointerAddress) {
        const metadata = {};
        const arrayMethods = getArrayMethods(target, pointerAddress, this.difHandler, metadata);
        // catch access (get or set) to original array value, not via proxy - this check is only active in debug mode
        if (DEBUG_MODE) {
            interceptAccessors(target, () => {
                if (!metadata[IS_PROXY_ACCESS]) {
                    throw new Error("Invalid access to original array value that was moved to a reference");
                }
                return Option.None();
            }, () => {
                if (!metadata[IS_PROXY_ACCESS]) {
                    throw new Error("Invalid access to original array value that was moved to a reference");
                }
            });
        }
        // deno-lint-ignore no-this-alias
        const self = this;
        const proxy = new Proxy(target, {
            get(_target, key) {
                return self.allowOriginalValueAccess(proxy, () => {
                    return arrayMethods[key] ??
                        Reflect.get(target, key);
                });
            },
            set(_target, prop, value, receiver) {
                return self.allowOriginalValueAccess(proxy, () => {
                    const index = Number(prop);
                    if (typeof prop === "string" && !isNaN(index) && index >= 0) {
                        // check if out of bounds - fill with null&js.empty
                        if (index >= target.length) {
                            triggerArrayFillEmpty(target, target.length, index, pointerAddress, self.difHandler);
                        }
                        self.difHandler.triggerIndexSet(pointerAddress, index, value);
                    }
                    else if (prop === "length") {
                        // if length is reduced, trigger delete for removed items
                        const newLength = Number(value);
                        // explicit length value 0 is treated as a full clear
                        if (newLength == 0) {
                            self.difHandler.triggerClear(pointerAddress);
                        }
                        else if (newLength < target.length) {
                            self.difHandler.triggerListSplice(pointerAddress, newLength, target.length - newLength, []);
                        } // if length is increased, trigger set for new empty items
                        else if (newLength > target.length) {
                            triggerArrayFillEmpty(target, target.length, newLength, pointerAddress, self.difHandler);
                        }
                    }
                    // x[1..4] = js:empty
                    return Reflect.set(target, prop, value, receiver);
                });
            },
        });
        return {
            value: proxy,
            metadata,
        };
    },
    handleAppend(target, value) {
        this.difHandler.getOriginalValueFromProxy(target).push(value);
        // target.push(value);
    },
    handleSet(target, key, value) {
        this.difHandler.getOriginalValueFromProxy(target)[key] = value;
    },
    handleDelete(target, key) {
        // remove key (splice)
        this.difHandler.getOriginalValueFromProxy(target).splice(key, 1);
    },
    handleClear(target) {
        this.difHandler.getOriginalValueFromProxy(target).length = 0;
    },
    handleReplace(target, newValue) {
        const original = this.difHandler.getOriginalValueFromProxy(target);
        original.length = 0;
        original.push(...newValue);
    },
    handleListSplice(target, start, deleteCount, items) {
        this.difHandler
            .getOriginalValueFromProxy(target)
            .splice(start, deleteCount, ...items);
    },
};
/**
 * Implementes optimized array methods that send DIF updates on mutation.
 * @returns
 */
function getArrayMethods(array, pointerAddress, difHandler, metadata) {
    const originalPush = array.push.bind(array);
    const originalUnshift = array.unshift.bind(array);
    const originalSplice = array.splice.bind(array);
    const originalFill = array.fill.bind(array);
    return {
        push: generateInterceptedArrayPush(array, originalPush, pointerAddress, difHandler),
        unshift: generateInterceptedArrayUnshift(originalUnshift, pointerAddress, difHandler, metadata),
        splice: generateInterceptedArraySplice(array, originalSplice, pointerAddress, difHandler, metadata),
        fill: generateInterceptedArrayFill(array, originalFill, pointerAddress, difHandler, metadata),
    };
}
function generateInterceptedArrayPush(array, originalPush, pointerAddress, difHandler) {
    return (...items) => {
        if (items.length === 1) {
            difHandler.triggerAppend(pointerAddress, items[0]);
        }
        else {
            difHandler.triggerListSplice(pointerAddress, array.length, 0, items);
        }
        return originalPush(...items);
    };
}
function generateInterceptedArrayUnshift(originalUnshift, pointerAddress, difHandler, metadata) {
    return (...items) => {
        difHandler.triggerListSplice(pointerAddress, 0, 0, items);
        try {
            metadata[IS_PROXY_ACCESS] = true;
            return originalUnshift(...items);
        }
        finally {
            metadata[IS_PROXY_ACCESS] = false;
        }
    };
}
function generateInterceptedArraySplice(array, originalSplice, pointerAddress, difHandler, metadata) {
    return (start, deleteCount, ...items) => {
        difHandler.triggerListSplice(pointerAddress, start, deleteCount ?? (array.length - start), items);
        try {
            metadata[IS_PROXY_ACCESS] = true;
            return originalSplice(start, deleteCount, ...items);
        }
        finally {
            metadata[IS_PROXY_ACCESS] = false;
        }
    };
}
function generateInterceptedArrayFill(array, originalFill, pointerAddress, difHandler, metadata) {
    return (value, start, end) => {
        const actualStart = start !== undefined
            ? (start < 0 ? Math.max(array.length + start, 0) : Math.min(start, array.length))
            : 0;
        const actualEnd = end !== undefined
            ? (end < 0 ? Math.max(array.length + end, 0) : Math.min(end, array.length))
            : array.length;
        const itemCount = actualEnd - actualStart;
        // splice to replace the filled range
        if (itemCount > 0) {
            difHandler.triggerListSplice(pointerAddress, actualStart, actualEnd - actualStart, new Array(itemCount).fill(value));
        }
        try {
            metadata[IS_PROXY_ACCESS] = true;
            return originalFill(value, start, end);
        }
        finally {
            metadata[IS_PROXY_ACCESS] = false;
        }
    };
}
/**
 * Sends DIF updates that correspond to filling an array up to a certain index with
 * empty values.
 */
function triggerArrayFillEmpty(array, from, to, pointerAddress, difHandler) {
    const originalLength = array.length;
    for (let i = from; i < to; i++) {
        if (i < originalLength) {
            difHandler.triggerSet(pointerAddress, i, null); // TODO: special js empty value
        }
        else {
            difHandler.triggerAppend(pointerAddress, null); // TODO: special js empty value
        }
    }
}
