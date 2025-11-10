import { Runtime, DIF } from '@unyt/datex';

/**
 * The default configuration for the Datex runtime.
 */
const defaultConfig = {
    // interfaces: [{
    //     type: "websocket-client",
    //     config: { address: "wss://example.unyt.land" },
    // }],
    debug: false, // set to true to show info/debug messages
};

/**
 * The default instance of the Datex runtime.
 */
export const Datex: Runtime = await Runtime.create(defaultConfig, {
    allow_unsigned_blocks: true,
});

/**
 * Returns a map of pointers that are currently loaded in the runtime.
 * The keys are pointer identifiers and the values are DIFContainer objects
 * representing the values stored at the pointer.
 */
export function getPointers(): Map<string, DIF.Definitions.DIFContainer> {
    // some example JS values
    const values = [
        42,
        'Hello, World!',
        true,
        { a: 1, b: 2 },
        [1, 2, 3, 4, 5],
        {
            nested: {
                key: 'value',
                arr: [10, 20, 30],
            },
        },
    ];
    const pointers = new Map(
        values.map((value, index) => {
            const difValue = Datex.dif.convertJSValueToDIFValue(
                value,
            ) as DIF.Definitions.DIFContainer;
            return [`$${index.toString().padStart(16, '0')}`, difValue];
        }),
    );
    return pointers;
}
