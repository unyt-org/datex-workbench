import { Datex } from '@/lib/runtime';
import { parseStructure } from '@unyt/speck';
import { BaseInterfaceImpl, type BaseInterfaceSetupData } from '@unyt/datex/network/interface-impls/base';
import { ref, computed } from 'vue';
import type { RawBlockEntry } from '@/types/NetworkInspector/BlockEntry';

// Storage configuration
const STORAGE_KEY = 'datex-workbench:network-inspector:blocks';
const MAX_STORED_BLOCKS = 200;
const MAX_DISPLAYED_BLOCKS = 20;

// Serializable block entry for localStorage
interface StoredBlockEntry {
    blockBase64: string;
    direction: 'in' | 'out';
    socketUuid: string;
    interfaceName: string;
    capturedAt: number;
}

// Utility functions for base64 conversion
function arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Save blocks to localStorage
function saveBlocksToStorage(blocks: RawBlockEntry[]): void {
    try {
        const storedBlocks: StoredBlockEntry[] = blocks.map(block => ({
            blockBase64: arrayBufferToBase64(block.originalBinary),
            direction: block.direction,
            socketUuid: block.socketUuid,
            interfaceName: block.interfaceName,
            capturedAt: block.capturedAt,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedBlocks));
    } catch (error) {
        console.warn('Failed to save blocks to localStorage:', error);
    }
}

// Load blocks from localStorage
function loadBlocksFromStorage(definition: any): RawBlockEntry[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        
        const storedBlocks: StoredBlockEntry[] = JSON.parse(stored);
        return storedBlocks.map(stored => {
            const originalBinary = base64ToArrayBuffer(stored.blockBase64);
            const parsedBlock = parseStructure(definition, originalBinary);
            return {
                direction: stored.direction,
                parsedBlock,
                originalBinary,
                socketUuid: stored.socketUuid,
                interfaceName: stored.interfaceName,
                capturedAt: stored.capturedAt,
            };
        });
    } catch (error) {
        console.warn('Failed to load blocks from localStorage:', error);
        return [];
    }
}

const definition = await (
    await fetch(
        'https://raw.githubusercontent.com/unyt-org/datex-specification/refs/heads/main/assets/structures/dxb.json',
    )
).json();

// Initialize blocks from storage
const blocks = ref<RawBlockEntry[]>(loadBlocksFromStorage(definition));

// Computed property for displaying only the latest 20 blocks
const displayedBlocks = computed(() => blocks.value.slice(0, MAX_DISPLAYED_BLOCKS));

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
baseInterface.impl.onSend(() => {
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
        originalBinary: block,
        socketUuid: socket_uuid,
        interfaceName: config.name,
        capturedAt: Date.now(),
    });
    
    // Keep only the most recent 200 blocks (FIFO rotation)
    if (blocks.value.length > MAX_STORED_BLOCKS) {
        blocks.value = blocks.value.slice(0, MAX_STORED_BLOCKS);
    }
    
    // Persist to localStorage
    saveBlocksToStorage(blocks.value);
});

export function useNetworkInspector() {
    return {
        sendTestBlock,
        blocks,
        displayedBlocks,
        baseInterface,
        socketUUID,
    };
}
