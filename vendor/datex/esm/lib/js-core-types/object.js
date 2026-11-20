import { CoreLibTypeId } from "../../dif/core.js";
import { IS_PROXY_ACCESS } from "../../dif/dif-handler.js";
import { DEBUG_MODE } from "../../global.js";
import { interceptAccessors } from "../../dif/reflect-utils.js";
import { Option } from "../../utils/option.js";
export const objectTypeBinding = {
    coreLibTypeId: CoreLibTypeId.Map,
    jsClass: Object,
    bind(target, _pointerAddress) {
        const metadata = {};
        // catch access (get or set) to original object value, not via proxy - this check is only active in debug mode
        if (DEBUG_MODE) {
            interceptAccessors(target, () => {
                if (!metadata[IS_PROXY_ACCESS]) {
                    throw new Error("Invalid access to original object value that was moved to a reference");
                }
                return Option.None();
            }, () => {
                if (!metadata[IS_PROXY_ACCESS]) {
                    throw new Error("Invalid access to original object value that was moved to a reference");
                }
            });
        }
        // deno-lint-ignore no-this-alias
        const self = this;
        const proxy = new Proxy(target, {
            get(_target, key) {
                return self.allowOriginalValueAccess(proxy, () => {
                    return Reflect.get(target, key);
                });
            },
            set(_target, prop, value, receiver) {
                return self.allowOriginalValueAccess(proxy, () => {
                    return Reflect.set(target, prop, value, receiver);
                });
            },
        });
        return {
            value: proxy,
            metadata,
        };
    },
    handleSet(target, key, value) {
        this.difHandler.getOriginalValueFromProxy(target)[key] = value;
    },
    handleDelete(target, key) {
        delete this.difHandler.getOriginalValueFromProxy(target)[key];
    },
    handleReplace(target, newValue) {
        const original = this.difHandler.getOriginalValueFromProxy(target);
        for (const key of Object.keys(original)) {
            delete original[key];
        }
        for (const [key, value] of Object.entries(newValue)) {
            original[key] = value;
        }
    },
};
