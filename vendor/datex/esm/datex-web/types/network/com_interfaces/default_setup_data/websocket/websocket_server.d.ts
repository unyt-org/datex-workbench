import type { AcceptAddress } from "../http_common.js";
export type WebSocketServerInterfaceSetupData = {
    bind_address: string;
    accept_addresses: AcceptAddress[] | null;
};
