<script setup lang="ts">
import { useNetworkInspector } from '@/composable/useNetworkInspector';
import { useBlockSimulator, BLOCK_TYPES } from '@/composable/useBlockSimulator';
import { Button } from '@/components/ui/button';
import { computed, ref, watch, nextTick } from 'vue';
import type { ParsedSection } from '@unyt/speck';
import type { NetworkBlockTableRow } from '@/types/NetworkInspector/TableRow';
import DataTable from '@/components/NetworkInspector/DataTable.vue';
import NetworkFilter from '@/components/NetworkInspector/NetworkFilter.vue';
import { createColumns } from '@/components/NetworkInspector/columns';
import { parseSearchQuery, filterRowsBySearch } from '@/utils/searchParser';

const { sendTestBlock, blocks, baseInterface, socketUUID } = useNetworkInspector();
const { sendBlock } = useBlockSimulator();

// Search query state
const searchQuery = ref('');

// Block sending functionality
async function handleSendBlock(blockTypeId: string) {
    try {
        const blockType = BLOCK_TYPES.find(bt => bt.id === blockTypeId);
        if (blockType) {
            await sendBlock(blockType, baseInterface, socketUUID);
        }
    } catch (error) {
        console.error('Failed to send block:', error);
    }
}

// Scroll container ref for maintaining scroll position
const scrollContainerRef = ref<HTMLElement | null>(null);
let savedScrollTop = 0;
let savedScrollHeight = 0;

// Watch for new blocks and preserve scroll position
watch(
    () => blocks.value.length,
    (newLength, oldLength) => {
        if (newLength > oldLength && scrollContainerRef.value) {
            // Save scroll position before DOM update
            savedScrollTop = scrollContainerRef.value.scrollTop;
            savedScrollHeight = scrollContainerRef.value.scrollHeight;
            
            // Adjust scroll after DOM update
            nextTick(() => {
                if (scrollContainerRef.value) {
                    const newScrollHeight = scrollContainerRef.value.scrollHeight;
                    const heightDiff = newScrollHeight - savedScrollHeight;
                    
                    // Only adjust if user is scrolled down (not watching new items at top)
                    if (savedScrollTop > 50) {
                        scrollContainerRef.value.scrollTop = savedScrollTop + heightDiff;
                    }
                }
            });
        }
    },
);

// Helper functions to extract data from parsed block structure
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

// Computed property to transform raw blocks into table rows
const allTableRows = computed<NetworkBlockTableRow[]>(() => {
    return blocks.value.map((block) => {
        const blockType = getBlockType(block.parsedBlock);
        const sender = getSender(block.parsedBlock);
        const receivers = getReceivers(block.parsedBlock);
        const timestamp = getTimestamp(block.parsedBlock);
        const size = getBlockSize(block.parsedBlock);

        const encryptionType = getEncryptionType(block.parsedBlock);
        const signatureType = getSignatureType(block.parsedBlock);

        return {
            direction: block.direction,
            blockType,
            sender,
            receiver: receivers.join(', '),
            timestamp: timestamp === 0 ? new Date(block.capturedAt).toLocaleTimeString() : new Date(timestamp).toLocaleTimeString(),
            size,
            isEncrypted: encryptionType !== 'None' && encryptionType !== 'Unknown',
            isSigned: signatureType !== 'None' && signatureType !== 'Unknown',
            interface: block.interfaceName,
            capturedAt: block.capturedAt,
        };
    });
});

// Filtered table rows 
const tableRows = computed<NetworkBlockTableRow[]>(() => {
    if (!searchQuery.value.trim()) return allTableRows.value;
    
    const parsedQuery = parseSearchQuery(searchQuery.value);
    return filterRowsBySearch(allTableRows.value, parsedQuery);
});

// Dynamic columns with search highlighting
const dynamicColumns = computed(() => {
    if (!searchQuery.value.trim()) return createColumns();
    
    const parsedQuery = parseSearchQuery(searchQuery.value);
    return createColumns(parsedQuery);
});
</script>

<template>
    <div class="flex h-full flex-col p-4">
        <div class="mb-4">
            <h1 class="text-2xl font-bold mb-3">Network Inspector</h1>
            
            <!-- Block simulation buttons -->
            <div class="flex flex-wrap gap-2">
                <Button 
                    v-for="blockType in BLOCK_TYPES" 
                    :key="blockType.id"
                    @click="handleSendBlock(blockType.id)"
                    variant="outline"
                    size="sm"
                    :title="blockType.description"
                >
                    {{ blockType.label }}
                </Button>
                
                <!-- Legacy TraceBack button -->
                <Button 
                    @click="sendTestBlock"
                    variant="outline"
                    size="sm"
                    title="Legacy traceback block (base64 encoded)"
                >
                    TraceBack (Legacy)
                </Button>
            </div>
        </div>

        <div ref="scrollContainerRef" class="flex-1 max-h-[calc(100vh-200px)] overflow-y-auto">
            <DataTable :columns="dynamicColumns" :data="tableRows">
                <template #filter>
                    <NetworkFilter 
                        v-model:filter-value="searchQuery" 
                        placeholder="Search: type:traceback"
                    />
                </template>
            </DataTable>
        </div>
    </div>
</template>