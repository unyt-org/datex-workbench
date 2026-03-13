import { Datex } from '@/lib/runtime';
import type { RawBlockEntry } from '@/types/NetworkInspector/BlockEntry';
import { parseStructure, type ParsedSection, type StructureDefinition } from '@unyt/speck';
import { computed, ref } from 'vue';

// Helper functions to extract metadata from parsed block structure (parse once, read many)
function getBlockType(parsedBlock: ParsedSection[]): string {
    const blockHeader = parsedBlock.find((section) => section.name === 'Block Header');
    if (!blockHeader) return 'Unknown';

    const flagsAndTimestamp = blockHeader.fields.find(
        (field) => field.name === 'Flags and Timestamp',
    );
    if (!flagsAndTimestamp || !('subFields' in flagsAndTimestamp)) return 'Unknown';

    const blockType = flagsAndTimestamp.subFields.find((field: { name: string }) => field.name === 'Block Type');
    return (blockType && 'parsedValue' in blockType) ? blockType.parsedValue?.toString() || 'Unknown' : 'Unknown';
}

function getSender(parsedBlock: ParsedSection[]): string {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 'Unknown';

    const sender = routingHeader.fields.find((field) => field.name === 'Sender');
    return (sender && 'parsedValue' in sender) ? sender.parsedValue?.toString() || 'Unknown' : 'Unknown';
}

function getReceivers(parsedBlock: ParsedSection[]): string[] {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return [];

    const receivers = routingHeader.fields.filter((field) => field.name === 'Receivers');
    return receivers.map((field) => ('parsedValue' in field) ? field.parsedValue?.toString() || '' : '');
}

function getTimestamp(parsedBlock: ParsedSection[]): number {
    const blockHeader = parsedBlock.find((section) => section.name === 'Block Header');
    if (!blockHeader) return 0;

    const flagsAndTimestamp = blockHeader.fields.find(
        (field) => field.name === 'Flags and Timestamp',
    );
    if (!flagsAndTimestamp || !('subFields' in flagsAndTimestamp)) return 0;

    const timestamp = flagsAndTimestamp.subFields.find(
        (field) => field.name === 'Creation Timestamp',
    );
    return (timestamp && 'parsedValue' in timestamp) ? Number(timestamp.parsedValue) || 0 : 0;
}

function getBlockSize(parsedBlock: ParsedSection[]): number {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 0;

    const blockSize = routingHeader.fields.find((field) => field.name === 'Block Size');
    return (blockSize && 'parsedValue' in blockSize) ? Number(blockSize.parsedValue) || 0 : 0;
}

function getEncryptionType(parsedBlock: ParsedSection[]): string {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 'Unknown';

    const flags = routingHeader.fields.find((field) => field.name === 'Flags');
    if (!flags || !('subFields' in flags)) return 'Unknown';

    const encryptionType = flags.subFields.find((field: { name: string }) => field.name === 'Encryption Type');
    return (encryptionType && 'parsedValue' in encryptionType) ? encryptionType.parsedValue?.toString() || 'Unknown' : 'Unknown';
}

function getSignatureType(parsedBlock: ParsedSection[]): string {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 'Unknown';

    const flags = routingHeader.fields.find((field) => field.name === 'Flags');
    if (!flags || !('subFields' in flags)) return 'Unknown';

    const signatureType = flags.subFields.find((field: { name: string }) => field.name === 'Signature Type');
    return (signatureType && 'parsedValue' in signatureType) ? signatureType.parsedValue?.toString() || 'Unknown' : 'Unknown';
}

// Extract all metadata once from parsed block
function extractBlockMetadata(parsedBlock: ParsedSection[]) {
    return {
        blockType: getBlockType(parsedBlock),
        sender: getSender(parsedBlock),
        receivers: getReceivers(parsedBlock),
        timestamp: getTimestamp(parsedBlock),
        size: getBlockSize(parsedBlock),
        encryptionType: getEncryptionType(parsedBlock),
        signatureType: getSignatureType(parsedBlock),
    };
}

// Storage configuration
const STORAGE_KEY = 'datex-workbench:network-inspector:blocks';
const MAX_STORED_BLOCKS = 200;
const INITIAL_DISPLAYED_BLOCKS = 20;
const LOAD_MORE_INCREMENT = 20;

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
        binary += String.fromCharCode(buffer[i]!);
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
function loadBlocksFromStorage(definition: StructureDefinition): RawBlockEntry[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        
        const storedBlocks: StoredBlockEntry[] = JSON.parse(stored);
        return storedBlocks.map(stored => {
            const originalBinary = base64ToArrayBuffer(stored.blockBase64);
            const parsedBlock = parseStructure(definition, originalBinary);
            const metadata = extractBlockMetadata(parsedBlock);
            return {
                direction: stored.direction,
                parsedBlock,
                originalBinary,
                socketUuid: stored.socketUuid,
                interfaceName: stored.interfaceName,
                capturedAt: stored.capturedAt,
                ...metadata,
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

// Lazy loading state
const loadedBlocksCount = ref(INITIAL_DISPLAYED_BLOCKS);

// Computed property for progressively displaying blocks
const displayedBlocks = computed(() => blocks.value.slice(0, loadedBlocksCount.value));

// Check if more blocks are available to load
const hasMoreBlocks = computed(() => loadedBlocksCount.value < blocks.value.length);

// Load more blocks (called when user scrolls near bottom)
function loadMoreBlocks() {
    if (hasMoreBlocks.value) {
        const remaining = blocks.value.length - loadedBlocksCount.value;
        loadedBlocksCount.value += Math.min(LOAD_MORE_INCREMENT, remaining);
    }
}

// Reset loaded count when blocks array significantly changes
function resetLoadedCount() {
    loadedBlocksCount.value = Math.min(INITIAL_DISPLAYED_BLOCKS, blocks.value.length);
}


function sendTestBlock() {
    return Datex.execute("@@local :: 1 + 41")
}

Datex.comHub.registerIncomingBlockInterceptor((block: Uint8Array, socket_uuid: string) => {
    const parsedBlock = parseStructure(definition, block);
    console.log(parsedBlock, socket_uuid);
    
    // Extract metadata once at capture time
    const metadata = extractBlockMetadata(parsedBlock);
    
    // Add new block at the beginning (top of list)
    blocks.value.unshift({
        direction: 'in',
        parsedBlock,
        originalBinary: block,
        socketUuid: socket_uuid,
        interfaceName: "local",
        capturedAt: Date.now(),
        ...metadata,
    });
    
    // Keep only the most recent 200 blocks (FIFO rotation)
    if (blocks.value.length > MAX_STORED_BLOCKS) {
        blocks.value = blocks.value.slice(0, MAX_STORED_BLOCKS);
    }
    
    // Reset loaded count to show new block while maintaining scroll position logic
    // Only reset if we're at the top (showing initial blocks)
    if (loadedBlocksCount.value <= INITIAL_DISPLAYED_BLOCKS) {
        loadedBlocksCount.value = INITIAL_DISPLAYED_BLOCKS;
    } else {
        // User has scrolled down, increment to include new block
        loadedBlocksCount.value = Math.min(loadedBlocksCount.value + 1, blocks.value.length);
    }
    
    // Persist to localStorage
    saveBlocksToStorage(blocks.value);
});

export function useNetworkInspector() {
    return {
        sendTestBlock,
        blocks,
        displayedBlocks,
        hasMoreBlocks,
        loadMoreBlocks,
        resetLoadedCount,
        loadedBlocksCount,
        saveBlocksToStorage,
    };
}
