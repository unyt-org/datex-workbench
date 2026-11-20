import type { Tagged } from "../../../../../lib/mod.js";
import type { RuntimeConfigInterface } from "../../../runtime/config.js";
export type InterfaceDirection = Tagged<"In"> | Tagged<"Out"> | Tagged<"InOut">;
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
    auto_identify: boolean;
    connectable_interfaces: RuntimeConfigInterface[] | null;
};
export type ReconnectionConfig = Tagged<"NoReconnect"> | Tagged<"Reconnect", {
    attempts: number | null;
    interval: number | null;
}>;
