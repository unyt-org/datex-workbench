/**
 * Gets all own and inherited property keys (including symbols) of an object, excluding those from Object.prototype.
 * @param obj The object to retrieve property keys from.
 * @returns A Set containing all own and inherited property keys of the object.
 */
export function getAllObjectKeys(obj) {
    const keys = new Set();
    let currentObj = obj;
    while (currentObj && currentObj !== Object.prototype) {
        for (const key of Reflect.ownKeys(currentObj)) {
            keys.add(key);
        }
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return keys;
}
/**
 * Gets the property descriptor for a given key in an object, searching through the prototype chain if necessary.
 * @param obj The object to retrieve the property descriptor from.
 * @param key The property key to look for.
 * @returns The property descriptor for the specified key, or undefined if not found.
 */
export function getOwnPropertyDescriptorInPrototypeChain(obj, key) {
    let currentObj = obj;
    while (currentObj && currentObj !== Object.prototype) {
        const descriptor = Object.getOwnPropertyDescriptor(currentObj, key);
        if (descriptor) {
            return descriptor;
        }
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return undefined;
}
/**
 * This function intercepts property access (get and set) on an object by defining custom getters and setters for the specified keys. It allows you to provide custom handlers for get and set operations, while still preserving the original behavior of the object.
 * @param originalObject The object whose property access is to be intercepted.
 * @param getHandler A function to handle property get operations. It receives the property key and should return an Option containing the value if handled.
 * @param setHandler A function to handle property set operations. It receives the property key and the value being set.
 * @param keys An iterable of property keys to intercept. Defaults to all own and inherited keys of the original object.
 */
export function interceptAccessors(originalObject, getHandler, setHandler, keys = getAllObjectKeys(originalObject)) {
    const shadowObject = Array.isArray(originalObject) ? [] : {};
    function addPropertyInterceptor(originalDescriptor, key) {
        return {
            get() {
                if (getHandler) {
                    const result = getHandler(key);
                    if (result.isSome()) {
                        return result.unwrap();
                    }
                }
                return shadowObject[key];
            },
            set(value) {
                if (setHandler) {
                    setHandler(key, value);
                }
                shadowObject[key] = value;
            },
            enumerable: originalDescriptor?.enumerable,
            configurable: true,
        };
    }
    for (const key of keys) {
        const originalDescriptor = getOwnPropertyDescriptorInPrototypeChain(originalObject, key);
        // assign property directly to shadow object if non-configurable and no getter/setter
        if (originalDescriptor && (("value" in originalDescriptor &&
            originalDescriptor.writable) ||
            !originalDescriptor.configurable)) {
            shadowObject[key] = originalObject[key];
        } // bind original getter/setter to shadow object
        else if (originalDescriptor?.get || originalDescriptor?.set) {
            Object.defineProperty(shadowObject, key, {
                get: originalDescriptor.get ? originalDescriptor.get.bind(originalObject) : undefined,
                set: originalDescriptor.set ? originalDescriptor.set.bind(originalObject) : undefined,
                enumerable: originalDescriptor.enumerable,
                configurable: true,
            });
        }
        // only define interceptor if property is configurable
        if (!originalDescriptor || originalDescriptor.configurable) {
            Object.defineProperty(originalObject, key, addPropertyInterceptor(originalDescriptor, key));
        }
    }
}
