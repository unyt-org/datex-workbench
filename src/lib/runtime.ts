// @ts-expect-error external import
import { Datex } from "https://unyt-org.github.io/datex-core-js/datex.js";
import type { Datex as _Datex } from "@unyt/datex";

export type DIFContainer = ReturnType<typeof _Datex.dif.executeSyncDIF>;

/**
 * Returns a map of pointers that are currently loaded in the runtime.
 * The keys are pointer identifiers and the values are DIFContainer objects
 * representing the values stored at the pointer.
 */
export function getPointers(): Map<string, DIFContainer> {
    // some example JS values
    const values = [
        42,
        "Hello, World!",
        true,
        { a: 1, b: 2 },
        [1, 2, 3, 4, 5],
        {
            nested: {
                key: "value",
                arr: [10, 20, 30]
            },
        }
    ]
    const pointers = new Map(values.map((value, index) => {
        const difValue = Datex.dif.convertJSValueToDIFValue(value);
        return [`$${index.toString().padStart(16, "0")}`, difValue] as [string, DIFContainer];
    }));
    return pointers;
}