/**
 * @module websocket-server-base.ts
 * @description
 * This module provides utility functions to create a WebSocket server communication interface factory and to create an async generator yielding ArrayBuffers from a WebSocket.
 * It is used to facilitate the creation of WebSocket server interfaces in the Datex runtime.
 */
import type { ComInterfaceFactory } from "../com-hub.js";
import type { WebSocketServerInterfaceSetupData } from "../../datex-web/types/network/com_interfaces/default_setup_data/websocket/websocket_server.js";
/**
 * Utility function to create a WebSocket server communication interface factory from a given server factory function.
 * @param serverFactory
 */
export declare function createWebsocketServerComInterfaceFactory(serverFactory: (setupData: WebSocketServerInterfaceSetupData) => ReadableStream<WebSocket>): ComInterfaceFactory<WebSocketServerInterfaceSetupData>;
