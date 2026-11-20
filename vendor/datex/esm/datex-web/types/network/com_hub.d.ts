import type { Endpoint } from "../../../lib/mod.js";
import type { InterfaceDirection } from "./com_interfaces/com_interface/properties.js";
export type SocketPropertiesPartial = {
    direction: InterfaceDirection;
    channel_factor: number;
    direct_endpoint: Endpoint | null;
};
