import type { Runtime as RuntimeT, RuntimeConfig, DIF } from '@unyt/datex';
import { Builtins, Runtime } from './runtime-loader';

export type ComHubMetadata = {
    endpoint: typeof Builtins.Endpoint;
    interfaces: {
        uuid: string;
        properties: Record<string, unknown>;
        sockets: {
            uuid: string;
            direction: string;
            endpoint: string;
            properties: Record<string, unknown>;
        }[];
        is_waiting_for_socket_connections: boolean;
    }[];
};

const defaultConfig: RuntimeConfig = {
    endpoint: Builtins.Endpoint.get('@workbench_' + Math.floor(Math.random() * 1000)),
    interfaces: [
        {
            type: 'websocket-client',
            config: {
                url: 'wss://example.unyt.land',
            },
            // @ts-expect-error --- old type ---
            priority: new Builtins.Tagged('Priority', 1),
        },
    ],
};

export const Datex: RuntimeT = await Runtime.create(defaultConfig);

// @ts-expect-error expose Datex globally for debugging purposes
globalThis.Datex = Datex;

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
