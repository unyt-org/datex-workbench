import { Endpoint } from "../lib/special-core-types/endpoint.js";
import { Range } from "../lib/special-core-types/range.js";
import { BaseSharedContainer } from "../shared-container/mod.js";
import { EMPTY_TAG, Tagged } from "../lib/special-core-types/tagged.js";
// @ts-ignore devtoolsFormatters
globalThis.devtoolsFormatters = [
    {
        header(obj) {
            if (obj instanceof Endpoint) {
                return ["span", { style: "color: #58d452" }, obj.toString()];
            }
            else if (obj instanceof Tagged) {
                const inner = [
                    "span",
                    {},
                    [
                        "span",
                        { style: "color: #1279d5" },
                        "#" + obj.tag + (obj.value == EMPTY_TAG ? "" : " "),
                    ],
                ];
                if (obj.value !== EMPTY_TAG) {
                    const value = typeof obj.value === "bigint" ? Number(obj.value) : obj.value;
                    inner.push([
                        "span",
                        {},
                        // TODO: only proof of concept, syntax highlighting does not match JS
                        JSON.stringify(value, null, 4),
                    ]);
                }
                return [
                    "span",
                    {},
                    inner,
                ];
            }
            else if (obj instanceof BaseSharedContainer) {
                const value = typeof obj.value === "bigint" ? Number(obj.value) : obj.value;
                return [
                    "span",
                    {},
                    [
                        "span",
                        {},
                        [
                            "span",
                            { style: "color: #1279d5" },
                            "&mut ",
                        ],
                        [
                            "span",
                            {},
                            // TODO: only proof of concept, syntax highlighting does not match JS
                            JSON.stringify(value, null, 4),
                        ],
                    ],
                ];
            }
            else if (obj instanceof Range) {
                return [
                    "span",
                    {},
                    [
                        "span",
                        {},
                        ["span", { style: "color: #d57258" }, `${obj.start}`],
                    ],
                    [
                        "span",
                        {},
                        ["span", {}, `..`],
                    ],
                    [
                        "span",
                        {},
                        ["span", { style: "color: #d57258" }, `${obj.end}`],
                    ],
                ];
            }
            return null; // fall back to default
        },
        hasBody(_) {
            return false;
        },
        body(_) {
            return null;
        },
    },
];
