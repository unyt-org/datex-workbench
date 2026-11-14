import type { Runtime as RuntimeT, RuntimeConfig, DIF } from '@unyt/datex';
import { Builtins, Runtime } from './runtime-loader';
import type { ComHubMetadata } from './_temp_types';


const websocketServerEndpointURL =
    localStorage.getItem('websocketServerEndpoint') || 'wss://example.unyt.land';

const endpointName =
    sessionStorage.getItem('datexRuntimeEndpointName') ||
    '@workbench_' + Math.floor(Math.random() * 1000);
sessionStorage.setItem('datexRuntimeEndpointName', endpointName);

const defaultConfig: RuntimeConfig = {
    endpoint: Builtins.Endpoint.get(endpointName),
    name: "DATEX Workbench",
    interfaces: [
        {
            type: 'websocket-client',
            config: {
                url: websocketServerEndpointURL,
            },
            // @ts-expect-error --- old type ---
            priority: new Builtins.Tagged('Priority', 1),
        },
    ],
};

const logLevel = localStorage.getItem('datexRuntimeLogLevel') as
    | 'error'
    | 'warn'
    | 'info'
    | 'debug'
    | 'trace'
    | null
    | undefined;

export const Datex: RuntimeT = await Runtime.create(defaultConfig, {
    log_level: logLevel ?? undefined,
});

// @ts-expect-error expose Datex globally for debugging purposes
globalThis.Datex = Datex;
// @ts-expect-error expose Endpoint globally for debugging purposes
globalThis.Endpoint = Builtins.Endpoint;
// @ts-expect-error expose Tagged globally for debugging purposes
globalThis.Tagged = Builtins.Tagged;
// @ts-expect-error expose tagged globally for debugging purposes
globalThis.tagged = Builtins.tagged;

export function getPointers(): Map<string, DIF.Definitions.DIFValueContainer> {
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
            const difValue = Datex.dif.convertJSValueToDIFValueContainer(
                value,
            ) as DIF.Definitions.DIFValueContainer;
            return [`$${index.toString().padStart(16, '0')}`, difValue];
        }),
    );
    return pointers;
}

export function getComHubMetadata(): ComHubMetadata {
    return Datex.comHub.getMetadata() as unknown as ComHubMetadata; // FIXME
}

export async function removeInterface(interfaceUuid: string) {
    return await Datex.comHub.removeInterface(interfaceUuid as `com_interface::${string}`);
}
export async function removeSocket(socketUuid: string) {
    return await Datex.comHub.removeSocket(socketUuid as `socket::${string}`);
}
