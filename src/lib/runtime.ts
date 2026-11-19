import { Endpoint, tagged } from "@unyt/datex/lib";
import { Runtime, type RuntimeConfig } from "@unyt/datex";

const websocketServerEndpointURL =
    localStorage.getItem('websocketServerEndpoint') || 'wss://example.unyt.land';

const endpointName =
    sessionStorage.getItem('datexRuntimeEndpointName') ||
    '@workbench_' + Math.floor(Math.random() * 1000);
sessionStorage.setItem('datexRuntimeEndpointName', endpointName);

const defaultConfig: RuntimeConfig = {
    endpoint: Endpoint.get(endpointName),
    // @ts-expect-error name is missing in type definition (fixme added in latest datex web)
    name: 'DATEX Workbench',
    interfaces: [
        {
            type: 'websocket-client',
            config: {
                url: websocketServerEndpointURL,
            },
            priority: tagged('Priority', 1),
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

export const Datex: Runtime = await Runtime.create(defaultConfig, {
    log_level: logLevel ?? undefined,
});

// @ts-expect-error expose Datex globally for debugging purposes
globalThis.Datex = Datex;

export async function removeInterface(interfaceUuid: string) {
    return await Datex.comHub.removeInterface(interfaceUuid as `com_interface::${string}`);
}
export async function removeSocket(socketUuid: string) {
    return await Datex.comHub.removeSocket(socketUuid as `socket::${string}`);
}
