import type { Endpoint, Tagged } from "../../../../lib/mod.js";
export type NetworkTraceHopSocket = {
    interface_type: string;
    interface_name: string | null;
    channel: string;
    socket_uuid: string;
};
export type NetworkTraceHopDirection = Tagged<"Outgoing"> | Tagged<"Incoming">;
export type NetworkTraceHop = {
    endpoint: Endpoint;
    distance: number;
    socket: NetworkTraceHopSocket;
    direction: NetworkTraceHopDirection;
    fork_nr: string;
    bounce_back: boolean;
};
export type NetworkTraceResult = {
    sender: Endpoint;
    receiver: Endpoint;
    hops: NetworkTraceHop[];
    round_trip_time: unknown;
};
