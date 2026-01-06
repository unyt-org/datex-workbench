// Block type definitions with their corresponding GitHub raw URLs
export interface BlockType {
    id: string;
    label: string;
    description: string;
    url: string;
}

export const BLOCK_TYPES: BlockType[] = [
    {
        id: 'receivers',
        label: 'Receivers',
        description: 'Block with multiple receivers',
        url: 'https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/receivers/block.bin'
    },
    {
        id: 'no_receivers',
        label: 'No Receivers',
        description: 'Block without receivers',
        url: 'https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/no_receivers/block.bin'
    },
    {
        id: 'receivers_with_keys',
        label: 'Receivers With Keys',
        description: 'Block with encryption keys',
        url: 'https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/receivers_with_keys/block.bin'
    },
    {
        id: 'single_receiver_request',
        label: 'Single Receiver Request',
        description: 'Request block with single receiver',
        url: 'https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/single_receiver_request/block.bin'
    },
    {
        id: 'with_payload',
        label: 'With Payload',
        description: 'Block containing payload data',
        url: 'https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/with_payload/block.bin'
    }
];

// Cache for fetched block data
const blockCache = new Map<string, Uint8Array>();

/**
 * Fetches a binary block from GitHub and converts it to Uint8Array
 */
async function fetchBlock(url: string): Promise<Uint8Array> {
    // Check cache first
    if (blockCache.has(url)) {
        return blockCache.get(url)!;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch block: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Cache the result
        blockCache.set(url, uint8Array);
        
        return uint8Array;
    } catch (error) {
        console.error('Error fetching block:', error);
        throw error;
    }
}

/**
 * Sends a specific block type to the network inspector
 */
export async function sendBlock(blockType: BlockType, baseInterface: { impl: { receive: (socketUUID: string, data: Uint8Array) => void } }, socketUUID: string): Promise<void> {
    try {
        const blockData = await fetchBlock(blockType.url);
        baseInterface.impl.receive(socketUUID, blockData);
        console.log(`Sent ${blockType.label} block:`, blockData);
    } catch (error) {
        console.error(`Failed to send ${blockType.label} block:`, error);
        throw error;
    }
}

/**
 * Composable for block simulation functionality
 */
export function useBlockSimulator() {
    /**
     * Sends a block by its ID
     */
    async function sendBlockById(blockId: string, baseInterface: { impl: { receive: (socketUUID: string, data: Uint8Array) => void } }, socketUUID: string): Promise<void> {
        const blockType = BLOCK_TYPES.find(bt => bt.id === blockId);
        if (!blockType) {
            throw new Error(`Block type not found: ${blockId}`);
        }
        await sendBlock(blockType, baseInterface, socketUUID);
    }

    /**
     * Preload all block types into cache
     */
    async function preloadBlocks(): Promise<void> {
        const promises = BLOCK_TYPES.map(bt => fetchBlock(bt.url));
        await Promise.all(promises);
        console.log('All blocks preloaded');
    }

    return {
        BLOCK_TYPES,
        sendBlock,
        sendBlockById,
        preloadBlocks
    };
}
