import { tagged } from '@unyt/datex/lib';
import { Runtime, type RuntimeConfig } from '@unyt/datex';

const websocketServerEndpointURL =
    localStorage.getItem('websocketServerEndpoint') || 'wss://example.unyt.land';

/**
 * Default configuration for the Datex runtime,
 * initializes a random anonymous endpoint with keys stored in session storage
 */
const defaultConfig: RuntimeConfig = {
    endpoint: null,
    name: 'DATEX Workbench',
    keys: null,
    interfaces: [
        {
            type: 'websocket-client',
            config: {
                url: websocketServerEndpointURL,
            },
            priority: tagged('Priority', 1),
        },
    ],
    env: null,
    vault_location: 'session_storage'
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
