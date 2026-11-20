import type { Endpoint } from "../../../../lib/mod.js";
import type { ComInterfaceProperties, InterfaceDirection } from "../com_interfaces/com_interface/properties.js";
import type { DynamicEndpointProperties } from "./managers/socket_manager.js";
export type ComHubMetadataInterfaceSocket = {
    uuid: string;
    direction: InterfaceDirection;
    endpoint: Endpoint | null;
    properties: DynamicEndpointProperties | null;
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
