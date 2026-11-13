import { Tagged, type SharedRef, SharedContainerMutability, SharedReferenceMutability, Endpoint } from './runtime-loader.ts';
/** TODO: remove and use types from datex-web, just temporary until types are updated */
export type Span = { start: number; end: number };
export type SpannedInstruction<T> = { instruction: T; span: Span };
export type Instruction = string | [string, string];
export type TreeInstruction = SpannedInstruction<Instruction | [string, string, InstructionTree]>;
export type FlatInstruction = SpannedInstruction<Instruction | [string, string, FlatInstruction[]]>;

export type InstructionTree = { instruction: TreeInstruction; children?: InstructionTree[] };

/** Result tuple: [data, errorOrNull] */
export type TreeResult = [InstructionTree, string | null];
export type FlatResult = [FlatInstruction[], string | null];


export type InterfaceDirection = Tagged<"In"> | Tagged<"Out"> | Tagged<"InOut">;

export type ReconnectionConfig = Tagged<"NoReconnect"> | Tagged<"Reconnect", {
    attempts: number | null;
    interval: number | null;
}>;

/**
 * The properties of a communication interface, which are used to describe the capabilities and characteristics of the interface.
 */
export type ComInterfaceProperties = {
    interface_type: string;
    channel: string;
    name: string | null;
    direction: InterfaceDirection;
    round_trip_time: number;
    max_bandwidth: number;
    continuous_connection: boolean;
    allow_redirects: boolean;
    is_secure_channel: boolean;
    reconnection_config: ReconnectionConfig;
    auto_identify: boolean;
    connectable_interfaces: RuntimeConfigInterface[] | null;
};

export type InterfacePriority = Tagged<"None"> | Tagged<"Priority", number>;

export type RuntimeConfigInterface = {
    type: string;
    config: unknown;
    priority: InterfacePriority;
};

export type ComHubMetadataInterfaceSocket = {
    uuid: string;
    direction: InterfaceDirection;
    endpoint: Endpoint | null;
    properties: DynamicEndpointProperties | null;
};

export type DynamicEndpointProperties = {
    known_since: number;
    distance: number;
    is_direct: boolean;
    channel_factor: number;
    direction: InterfaceDirection;
};

export type ComHubMetadataInterface = {
    uuid: string;
    properties: ComInterfaceProperties;
    sockets: ComHubMetadataInterfaceSocket[];
    is_waiting_for_socket_connections: boolean;
};

export type ComHubMetadata = {
    endpoint: Endpoint;
    interfaces: ComHubMetadataInterface[];
    reconnecting_interfaces: ComHubMetadataInterface[];
};


export type LogLevel = Tagged<"Trace"> | Tagged<"Debug"> | Tagged<"Info"> | Tagged<"Warn"> | Tagged<"Error">;
export type LogMessage = {
    level: LogLevel;
    module: string;
    tag: string | null;
    message: string;
};

export type RuntimeInfo = {
    device_type: string | null;
    other_versions: Map<string, string>;
    datex_version: string;
    running_since: number;
};

export type HeapStats = {
    total: number;
    used: number;
    max_used: number;
};

export type RuntimeStats = {
    heap: HeapStats | null;
};
export type BlockDirection = Tagged<"Incoming"> | Tagged<"Outgoing">;

export type CapturedBlockData = {
    block: number[];
    socket_uuid: string;
    direction: BlockDirection;
};


export declare class Inspector {
    public name: string;
    public info: RuntimeInfo;
    /**
     * Returns a stream of all global log messages of the endpoint.
     */ public logs(): Promise<SharedRef<ReadableStream<LogMessage>, SharedContainerMutability.Mutable, SharedReferenceMutability.Mutable>>;
    /**
     * Returns a stream of all incoming and outgoing blocks on the endpoint (excluding debug blocks).
     */ public blocks(): Promise<SharedRef<ReadableStream<CapturedBlockData>, SharedContainerMutability.Mutable, SharedReferenceMutability.Mutable>>;
    /**
     * Returns the current metadata information (connected interfaces, sockets) of the endpoint's com hub.
     */ public com_hub_metadata(): Promise<ComHubMetadata>;
    /**
     * Returns the current runtime statistics of the endpoint.
     */ public stats(): Promise<RuntimeStats>;
    /**
     * Attempts to reboot the endpoint associated with the inspector.
     * Currently, this function is not implemented and will panic if called.
     */ public try_reboot_endpoint(): Promise<void>;
}
/**************************************************************************************** */
