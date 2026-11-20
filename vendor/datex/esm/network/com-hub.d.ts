import type { Runtime } from "../runtime/runtime.js";
import type { DIFValueContainer } from "../dif/types/value.js";
import type { JSComHub } from "../datex.js";
import type { ComHubMetadata } from "../datex-web/types/network/com_hub/metadata.js";
import type { NetworkTraceResult } from "../datex-web/types/network/com_hub/network_tracing.js";
import type { SocketPropertiesPartial } from "../datex-web/types/network/com_hub.js";
import type { ComInterfaceProperties } from "../datex-web/types/network/com_interfaces/com_interface/properties.js";
export type ComInterfaceFactory<SetupData = unknown> = {
    interfaceType: string;
    factory: ComInterfaceFactoryFn<SetupData>;
};
export type SocketConfiguration = {
    properties: DIFValueContainer<SocketPropertiesPartial>;
    iterator: ReadableStream<ArrayBufferLike>;
    send_callback: (data: ArrayBuffer) => void;
};
export type ComInterfaceConfiguration = {
    /**
     * The properties of the interface instance
     */
    properties: ComInterfaceProperties;
    /**
     * Indicates that this interface only establishes a single socket connection
     * And stops the sockets iterator after yielding the first socket configuration.
     * When set to true, the first socket connection is awaited on interface creation.
     */
    has_single_socket: boolean;
    new_sockets_iterator: ReadableStream<SocketConfiguration>;
    /**
     * An optional asynchronous callback that is called by the com hub when the interface is closed
     */
    close_async_callback?: never;
};
export type ComInterfaceFactoryFn<SetupData = unknown> = (setup_data: SetupData) => ComInterfaceConfiguration | Promise<ComInterfaceConfiguration>;
export type ComInterfaceUUID = `com_interface::${string}`;
export type ComInterfaceSocketUUID = `socket::${string}`;
/**
 * Communication hub for managing communication interfaces.
 */
export declare class ComHub {
    #private;
    constructor(jsComHub: JSComHub, runtime: Runtime);
    registerInterfaceFactory<SetupData>(factoryDefinition: ComInterfaceFactory<SetupData>): void;
    /**
     * Creates a new communication interface.
     * @param type The type of the interface to create.
     * @param setupData The setup data for the interface.
     * @param priority The priority of the interface (optional).
     * @returns A promise that resolves to the UUID of the created interface.
     */
    createInterface<SetupData>(type: string, setupData: SetupData, priority?: number): Promise<ComInterfaceUUID>;
    removeInterface(interface_uuid: ComInterfaceUUID): Promise<void>;
    removeSocket(socket_uuid: ComInterfaceSocketUUID): Promise<void>;
    /**
     * Prints the metadata of the ComHub. Only available in debug builds.
     * Only exists in debug builds
     */
    printMetadata(): void;
    getMetadata(): ComHubMetadata;
    /**
     * Prints the trace for a specific endpoint. Only available in debug builds.
     * @param endpoint The endpoint for which to print the trace.
     */
    printTrace(endpoint: string): Promise<void>;
    getTrace(endpoint: string): Promise<NetworkTraceResult | undefined>;
    /**
     * Registers a callback to intercept incoming and outgoing blocks.
     * @param callback The callback to be invoked for each block.
     * @param include_debug_blocks Whether to include debug blocks in the interception. Defaults to false.
     * @returns A UUID for the registered interceptor, which can be used to unregister it later.
     */
    registerBlockInterceptor(callback: (block: Uint8Array, socket_uuid: string, direction: "Incoming" | "Outgoing") => void, include_debug_blocks?: boolean): string;
    /**
     * Unregisters a previously registered block interceptor.
     * @param uuid
     */
    unregisterBlockInterceptor(uuid: string): void;
}
