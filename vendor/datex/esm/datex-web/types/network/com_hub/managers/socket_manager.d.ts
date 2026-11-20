import type { InterfaceDirection } from "../../com_interfaces/com_interface/properties.js";
export type DynamicEndpointProperties = {
    known_since: number;
    distance: number;
    is_direct: boolean;
    channel_factor: number;
    direction: InterfaceDirection;
};
