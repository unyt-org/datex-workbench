import { SharedContainerMutability, type SharedRef, SharedReferenceMutability } from "../../../shared-container/mod.js";
import type { ComHubMetadata } from "../network/com_hub/metadata.js";
import type { BlockDirection } from "../network/com_hub/mod.js";
import type { RuntimeInfo, RuntimeStats } from "../runtime/internal.js";
import type { LogMessage } from "../utils/logger.js";
export type CapturedBlockData = {
    block: number[];
    socket_uuid: string;
    direction: BlockDirection;
};
/**
 * The Inspector is a built-in debug helper that provides access to the DATEX runtime and its properties.
 * It is currently publicly accessible, but will be restricted with permission rules in the future.
 */
export declare class Inspector {
    name: string;
    info: RuntimeInfo;
    /**
     * Returns a stream of all global log messages of the endpoint.
     */ logs(): Promise<SharedRef<ReadableStream<LogMessage>, SharedContainerMutability.Mutable, SharedReferenceMutability.Mutable>>;
    /**
     * Returns a stream of all incoming and outgoing blocks on the endpoint (excluding debug blocks).
     */ blocks(): Promise<SharedRef<ReadableStream<CapturedBlockData>, SharedContainerMutability.Mutable, SharedReferenceMutability.Mutable>>;
    /**
     * Returns the current metadata information (connected interfaces, sockets) of the endpoint's com hub.
     */ com_hub_metadata(): Promise<ComHubMetadata>;
    /**
     * Returns the current runtime statistics of the endpoint.
     */ stats(): Promise<RuntimeStats>;
    /**
     * Attempts to reboot the endpoint associated with the inspector.
     * Currently, this function is not implemented and will panic if called.
     */ try_reboot_endpoint(): Promise<void>;
}
