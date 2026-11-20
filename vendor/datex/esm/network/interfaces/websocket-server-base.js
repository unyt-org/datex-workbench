/**
 * @module websocket-server-base.ts
 * @description
 * This module provides utility functions to create a WebSocket server communication interface factory and to create an async generator yielding ArrayBuffers from a WebSocket.
 * It is used to facilitate the creation of WebSocket server interfaces in the Datex runtime.
 */
import { tagged } from "../../lib/special-core-types/tagged.js";
import { DIFHandler } from "../../dif/dif-handler.js";
/**
 * Utility function to create a WebSocket server communication interface factory from a given server factory function.
 * @param serverFactory
 */
export function createWebsocketServerComInterfaceFactory(serverFactory) {
    return {
        interfaceType: "websocket-server",
        factory: (setupData) => {
            // FIXME: workaround, convert map to object if map provided as setupData
            if (setupData instanceof Map) {
                setupData = Object.fromEntries(Array.from(setupData.entries()));
            }
            return {
                properties: {
                    interface_type: "websocket-server",
                    channel: "websocket",
                    name: setupData.bind_address,
                    direction: tagged("InOut"),
                    round_trip_time: 0,
                    max_bandwidth: 0,
                    continuous_connection: false,
                    allow_redirects: false,
                    is_secure_channel: false,
                    reconnection_config: tagged("NoReconnect"),
                    auto_identify: true,
                    connectable_interfaces: [], // TODO add websocket client connections
                },
                has_single_socket: false,
                new_sockets_iterator: serverFactory(setupData).pipeThrough(new TransformStream({
                    async transform(socket, controller) {
                        const incoming_data_stream = await createSocketDataIterator(socket);
                        controller.enqueue({
                            properties: DIFHandler.convertJSValueToDIFValueContainer({
                                direction: tagged("InOut"),
                                channel_factor: 1,
                                direct_endpoint: null,
                            }),
                            iterator: incoming_data_stream,
                            send_callback: (data) => {
                                socket.send(data);
                            },
                        });
                    },
                })),
            };
        },
    };
}
/**
 * Utility function that returns an async generator yielding ArrayBuffers from a WebSocket
 */
async function createSocketDataIterator(webSocket) {
    const { promise, resolve, reject } = Promise.withResolvers();
    webSocket.addEventListener("open", () => resolve(), { once: true });
    webSocket.addEventListener("error", (event) => reject(new Error(`WebSocket error: ${event}`)), { once: true });
    // wait until the socket is open before starting to yield messages
    if (webSocket.readyState === WebSocket.OPEN) {
        resolve();
    }
    else if (webSocket.readyState === WebSocket.CLOSED || webSocket.readyState === WebSocket.CLOSING) {
        reject(new Error("WebSocket is already closed"));
    }
    else {
        // otherwise, wait for the open event
    }
    await promise;
    let closed = false;
    return new ReadableStream({
        start(controller) {
            webSocket.onmessage = (event) => {
                // ignore if not ArrayBuffer
                if (!(event.data instanceof ArrayBuffer)) {
                    console.warn("Received non-ArrayBuffer message, ignoring");
                    return;
                }
                controller.enqueue(event.data);
            };
            webSocket.onerror = () => {
                controller.error(new Error("WebSocket error"));
            };
            webSocket.onclose = () => {
                if (!closed)
                    controller.close();
            };
        },
        cancel() {
            webSocket.close();
            closed = true;
        },
    });
}
