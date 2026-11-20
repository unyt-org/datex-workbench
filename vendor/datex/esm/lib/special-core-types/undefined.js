import { JsLibTypeAddress } from "../../dif/js-lib.js";
import { hasImplClassification } from "../../dif/helpers/values.js";
export const JS_UNDEFINED = {
    _: "c",
    c: [null, [JsLibTypeAddress.undefined]],
    v: null,
};
export function isJsUndefined(value) {
    return hasImplClassification(value, JsLibTypeAddress.undefined);
}
