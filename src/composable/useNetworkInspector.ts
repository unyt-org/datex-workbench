import { Datex } from '@/lib/runtime';
import { parseStructure } from '@unyt/speck';
import { BaseInterfaceImpl, type BaseInterfaceSetupData } from '@unyt/datex/network/interface-impls/base';
import { ref } from 'vue';
import type { RawBlockEntry } from '@/types/NetworkInspector/BlockEntry';

const definition = await (
    await fetch(
        'https://raw.githubusercontent.com/unyt-org/datex-specification/refs/heads/main/assets/structures/dxb.json',
    )
).json();

const blocks = ref<RawBlockEntry[]>([]);

const config: BaseInterfaceSetupData = {
    name: "base",
    interface_type: "base",
    channel: "test",
    direction: "InOut",
    round_trip_time: 5,
    max_bandwidth: 1,
    continuous_connection: true,
    allow_redirects: true,
    is_secure_channel: true,
    reconnection_config: "NoReconnect",
    reconnect_attempts: undefined,
    close_timestamp: undefined,
};
const baseInterface = await Datex.comHub.createInterface<BaseInterfaceImpl>(
    'base',
    config,
);
baseInterface.impl.onSend((_block: Uint8Array, _receiver_socket_uuid: string) => {

    return Promise.resolve(true);
});

const socketUUID = baseInterface.impl.registerSocket('InOut');

function sendTestBlock() {
    baseInterface.impl.receive(
        socketUUID,
        Uint8Array.from(
            atob(
                'AWQBWQAQACoCAAAAAAAAAAAAAAAAAAAAAAAAAAACAGpvbmFzAAAAAAAAAAAAAAAAAAAAAGJlbgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKgD0AAAAAAAAAAA=',
            ),
            (c) => c.charCodeAt(0),
        ),
    );
}

Datex.comHub.registerIncomingBlockInterceptor((block: Uint8Array, socket_uuid: string) => {
    const parsedBlock = parseStructure(definition, block);
    console.log(parsedBlock, socket_uuid);
    
    // Add new block at the beginning (top of list)
    blocks.value.unshift({
        direction: 'in',
        parsedBlock,
        socketUuid: socket_uuid,
        interfaceName: config.name,
        capturedAt: Date.now(),
    });
    
    // Keep only the most recent 20 blocks
    if (blocks.value.length > 20) {
        blocks.value = blocks.value.slice(0, 20);
    }
});

export function useNetworkInspector() {
    return {
        sendTestBlock,
        blocks,
    };
}
