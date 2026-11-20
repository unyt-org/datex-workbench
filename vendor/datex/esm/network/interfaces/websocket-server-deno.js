/**
 * @module websocket-server-deno.ts
 * @description
 * This module provides a WebSocket server communication interface factory for the Deno runtime.
 * It utilizes Deno's built-in HTTP server and WebSocket capabilities to create a WebSocket server that can be used as a com interface in the DATEX runtime.
 */
import { createWebsocketServerComInterfaceFactory } from "./websocket-server-base.js";
function denoServerFactory(setupData) {
    const [hostname, maybe_port] = setupData.bind_address.split(":");
    const port = maybe_port ? parseInt(maybe_port) : undefined;
    let server;
    return new ReadableStream({
        start(controller) {
            server = Deno.serve({ port, hostname }, (req) => {
                if (req.headers.get("upgrade") != "websocket") {
                    return new Response(null, { status: 501 });
                }
                const { socket, response } = Deno.upgradeWebSocket(req);
                controller.enqueue(socket);
                return response;
            });
        },
        async cancel() {
            await server.shutdown();
        },
    });
}
export const websocketServerDenoComInterfaceFactory = createWebsocketServerComInterfaceFactory(denoServerFactory);
