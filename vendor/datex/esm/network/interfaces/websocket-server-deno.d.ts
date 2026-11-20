/**
 * @module websocket-server-deno.ts
 * @description
 * This module provides a WebSocket server communication interface factory for the Deno runtime.
 * It utilizes Deno's built-in HTTP server and WebSocket capabilities to create a WebSocket server that can be used as a com interface in the DATEX runtime.
 */
import type { WebSocketServerInterfaceSetupData } from "../../datex-web/types/network/com_interfaces/default_setup_data/websocket/websocket_server.js";
import type { ComInterfaceFactory } from "../com-hub.js";
export declare const websocketServerDenoComInterfaceFactory: ComInterfaceFactory<WebSocketServerInterfaceSetupData>;
