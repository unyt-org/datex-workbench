import type { Inspector } from '@/lib/_temp_types';
import { activeEndpoint, activeInspector } from '@/lib/inspector/mod';
import { Datex } from '@/lib/runtime';
import type { RawBlockEntry } from '@/types/NetworkInspector/BlockEntry';
import { parseStructure, type ParsedSection, type StructureDefinition } from '@unyt/speck';
import { computed, ref, watch, type Ref } from 'vue';

// Helper functions to extract metadata from parsed block structure (parse once, read many)
function getBlockType(parsedBlock: ParsedSection[]): string {
    const blockHeader = parsedBlock.find((section) => section.name === 'Block Header');
    if (!blockHeader) return 'Unknown';

    const flagsAndTimestamp = blockHeader.fields.find(
        (field) => field.name === 'Flags and Timestamp',
    );
    if (!flagsAndTimestamp || !('subFields' in flagsAndTimestamp)) return 'Unknown';

    const blockType = flagsAndTimestamp.subFields.find(
        (field: { name: string }) => field.name === 'Block Type',
    );
    return blockType && 'parsedValue' in blockType
        ? blockType.parsedValue?.toString() || 'Unknown'
        : 'Unknown';
}

function getSender(parsedBlock: ParsedSection[]): string {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 'Unknown';

    const sender = routingHeader.fields.find((field) => field.name === 'Sender');
    return sender && 'parsedValue' in sender
        ? sender.parsedValue?.toString() || 'Unknown'
        : 'Unknown';
}

function getReceivers(parsedBlock: ParsedSection[]): string[] {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return [];

    const receivers = routingHeader.fields.filter((field) => field.name === 'Receivers');
    return receivers.map((field) =>
        'parsedValue' in field ? field.parsedValue?.toString() || '' : '',
    );
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
    return timestamp && 'parsedValue' in timestamp ? Number(timestamp.parsedValue) || 0 : 0;
}

function getBlockSize(parsedBlock: ParsedSection[]): number {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 0;

    const blockSize = routingHeader.fields.find((field) => field.name === 'Block Size');
    return blockSize && 'parsedValue' in blockSize ? Number(blockSize.parsedValue) || 0 : 0;
}

function getEncryptionType(parsedBlock: ParsedSection[]): string {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 'Unknown';

    const flags = routingHeader.fields.find((field) => field.name === 'Flags');
    if (!flags || !('subFields' in flags)) return 'Unknown';

    const encryptionType = flags.subFields.find(
        (field: { name: string }) => field.name === 'Encryption Type',
    );
    return encryptionType && 'parsedValue' in encryptionType
        ? encryptionType.parsedValue?.toString() || 'Unknown'
        : 'Unknown';
}

function getSignatureType(parsedBlock: ParsedSection[]): string {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 'Unknown';

    const flags = routingHeader.fields.find((field) => field.name === 'Flags');
    if (!flags || !('subFields' in flags)) return 'Unknown';

    const signatureType = flags.subFields.find(
        (field: { name: string }) => field.name === 'Signature Type',
    );
    return signatureType && 'parsedValue' in signatureType
        ? signatureType.parsedValue?.toString() || 'Unknown'
        : 'Unknown';
}

function getBlockIsDebug(parsedBlock: ParsedSection[]): boolean {
    const blockHeader = parsedBlock.find((section) => section.name === 'Block Header');
    if (!blockHeader) return false;

    const flags = blockHeader.fields.find((field) => field.name === 'Flags and Timestamp');
    if (!flags || !('subFields' in flags)) return false;

    const isDebug = flags.subFields.find(
        (field: { name: string }) => field.name === 'Is Debug Block',
    );

    return isDebug && 'parsedValue' in isDebug ? Boolean(isDebug.parsedValue) : false;
}

function getBlockId(parsedBlock: ParsedSection[]): {
    contextId: number;
    sectionIndex: number;
    blockNumber: number;
} {
    const blockHeader = parsedBlock.find((section) => section.name === 'Block Header');
    if (!blockHeader) return { contextId: 0, sectionIndex: 0, blockNumber: 0 };

    // get Context ID field
    const contextIdField = blockHeader.fields.find((field) => field.name === 'Context ID');
    const contextId =
        contextIdField && 'parsedValue' in contextIdField
            ? Number(contextIdField.parsedValue) || 0
            : 0;

    // get Section Index field
    const sectionIndexField = blockHeader.fields.find((field) => field.name === 'Section Index');
    const sectionIndex =
        sectionIndexField && 'parsedValue' in sectionIndexField
            ? Number(sectionIndexField.parsedValue) || 0
            : 0;

    // get Block Number field
    const blockNumberField = blockHeader.fields.find((field) => field.name === 'Block Number');
    const blockNumber =
        blockNumberField && 'parsedValue' in blockNumberField
            ? Number(blockNumberField.parsedValue) || 0
            : 0;

    return { contextId, sectionIndex, blockNumber };
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
        blockId: getBlockId(parsedBlock),
        isDebug: getBlockIsDebug(parsedBlock)
    };
}

// Maximum number of blocks kept in memory, oldest are dropped first
const MAX_BLOCKS = 400;

let nextBlockId = 0;

export type BlockId = {
    contextId: number;
    sectionIndex: number;
    blockNumber: number;
};


const definition = await (
    await fetch(
        'https://raw.githubusercontent.com/unyt-org/datex-specification/refs/heads/main/assets/structures/dxb.json',
    )
).json();

// Initialize blocks from storage
const blocks = ref<RawBlockEntry[]>([]);


function handleBlock(block: Uint8Array, socket_uuid: string, direction: 'in' | 'out') {
    const parsedBlock = parseStructure(definition, block);

    blocks.value.push({
        id: nextBlockId++,
        direction,
        parsedBlock,
        originalBinary: block,
        socketUuid: socket_uuid,
        interfaceName: 'todo',
        capturedAt: Date.now(),
        ...extractBlockMetadata(parsedBlock),
    });

    // Drop the oldest blocks once the limit is exceeded
    const overflow = blocks.value.length - MAX_BLOCKS;
    if (overflow > 0) blocks.value.splice(0, overflow);
}

let localInterceptorUUID: string|null = null;

function collectBlocksLocal(showDebug: boolean) {
  if (localInterceptorUUID !== null) return;
  localInterceptorUUID = Datex.comHub.registerBlockInterceptor((block: Uint8Array, socket_uuid: string, direction: "Incoming"|"Outgoing") => {
      handleBlock(block, socket_uuid, direction === "Incoming" ? 'in' : 'out');
  }, showDebug);
}

function stopCollectingBlocksLocal() {
    if (localInterceptorUUID !== null) {
        Datex.comHub.unregisterBlockInterceptor(localInterceptorUUID);
        localInterceptorUUID = null;
    }
}



export function useNetworkInspector(showDebug: Ref<boolean>) {

    async function collectBlocksRemote(inspector: Inspector) {
      // Handle changes to the active inspector if needed
        let blocks = await inspector.blocks()
        for await (const block of blocks) {
            // stop if inspector is no longer active
            if (inspector !== activeInspector.value) break;
            handleBlock(new Uint8Array(block.block), block.socket_uuid, block.direction.tag === 'Incoming' ? 'in' : 'out');
        }
    }

    let lastInspector: Inspector|null = null;

    watch([activeInspector, showDebug], ([newInspector, showDebug]) => {
        // only reset blocks if the inspector has changed
        if (newInspector !== lastInspector) {
          blocks.value = [];
          lastInspector = newInspector;
        }

        // collect local blocks with optional debug flag
        if (activeEndpoint.value.toString() === "@@local") {
          stopCollectingBlocksLocal();
          collectBlocksLocal(showDebug);
        }
        // collect remote blocks if not local
        else {
          stopCollectingBlocksLocal();
          collectBlocksRemote(newInspector);
        }
    }, { immediate: true });

    return {
        blocks,
    };
}
