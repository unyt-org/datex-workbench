<script setup lang="ts">
import { useNetworkInspector } from '@/composable/useNetworkInspector';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, LockOpen, FileX } from 'lucide-vue-next';
import { computed, ref, watch, nextTick } from 'vue';
import type { RawBlockEntry } from '@/types/NetworkInspector/BlockEntry';
import type { ParsedSection, FieldDefinition } from '@unyt/speck';

const { sendTestBlock, blocks } = useNetworkInspector();

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

    const blockType = flagsAndTimestamp.subFields.find((field: any) => field.name === 'Block Type');
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

    const encryptionType = flags.subFields.find((field: any) => field.name === 'Encryption Type');
    return (encryptionType && 'parsedValue' in encryptionType) ? encryptionType.parsedValue?.toString() || 'Unknown' : 'Unknown';
}

function getSignatureType(parsedBlock: ParsedSection[]): string {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 'Unknown';

    const flags = routingHeader.fields.find((field) => field.name === 'Flags');
    if (!flags || !('subFields' in flags)) return 'Unknown';

    const signatureType = flags.subFields.find((field: any) => field.name === 'Signature Type');
    return (signatureType && 'parsedValue' in signatureType) ? signatureType.parsedValue?.toString() || 'Unknown' : 'Unknown';
}

// Format bytes with compact notation
const byteFormatter = new Intl.NumberFormat('en', {
    notation: 'compact',
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow',
});

function formatBytes(bytes: number): string {
    return byteFormatter.format(bytes);
}

// Computed property to transform raw blocks into table rows
const tableRows = computed(() => {
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
            endpoint: block.direction === 'in' ? sender : receivers.join(', '),
            timestamp: timestamp === 0 ? new Date(block.capturedAt).toLocaleTimeString() : new Date(timestamp).toLocaleTimeString(),
            size,
            isEncrypted: encryptionType !== 'None' && encryptionType !== 'Unknown',
            isSigned: signatureType !== 'None' && signatureType !== 'Unknown',
            interface: block.interfaceName,
            capturedAt: block.capturedAt,
        };
    });
});
</script>

<template>
    <div class="flex h-full flex-col p-4">
        <div class="mb-4 flex items-center justify-between">
            <h1 class="text-2xl font-bold">Network Inspector</h1>
            <Button @click="sendTestBlock">Simulate Block</Button>
        </div>

        <div ref="scrollContainerRef" class="flex-1 max-h-[calc(100vh-200px)] overflow-y-auto rounded-lg border">
            <TooltipProvider>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead class="w-16">Dir</TableHead>
                            <TableHead class="w-20">If</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead class="w-64">Endpoint</TableHead>
                            <TableHead class="w-32">Time</TableHead>
                            <TableHead class="w-36">Size</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-if="tableRows.length === 0">
                            <TableCell colspan="6" class="text-center text-muted-foreground">
                                No blocks captured yet. Click "Simulate Block" to test.
                            </TableCell>
                        </TableRow>
                        <TableRow v-for="row in tableRows" :key="row.capturedAt">
                            <TableCell>
                                <ArrowLeft v-if="row.direction === 'in'" class="inline-block h-4 w-4 text-green-500" />
                                <ArrowRight v-else class="inline-block h-4 w-4 text-orange-500" />
                            </TableCell>
                            <TableCell class="text-muted-foreground">
                                {{ row.interface }}
                            </TableCell>
                            <TableCell>
                                <div class="flex items-center gap-2">
                                    <span class="font-medium uppercase">{{ row.blockType }}</span>
                                    <Tooltip v-if="!row.isEncrypted">
                                        <TooltipTrigger as-child>
                                            <div class="inline-block cursor-default">
                                                <LockOpen class="h-4 w-4 text-muted-foreground line-through" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Not encrypted</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip v-if="!row.isSigned">
                                        <TooltipTrigger as-child>
                                            <div class="inline-block cursor-default">
                                                <FileX class="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Not signed</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TableCell>
                            <TableCell class="text-blue-400">
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <div class="max-w-64 cursor-default truncate">
                                            {{ row.endpoint }}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p class="max-w-sm break-words">{{ row.endpoint }}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell>
                                {{ row.timestamp }}
                            </TableCell>
                            <TableCell class="whitespace-nowrap">
                                {{ formatBytes(row.size) }}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TooltipProvider>
        </div>
    </div>
</template>
