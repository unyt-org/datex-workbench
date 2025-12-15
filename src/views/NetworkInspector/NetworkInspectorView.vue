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
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';
import { computed } from 'vue';
import type { RawBlockEntry } from '@/types/NetworkInspector/BlockEntry';
import type { ParsedSection, FieldDefinition } from '@unyt/speck';

const { sendTestBlock, blocks } = useNetworkInspector();

// Helper functions to extract data from parsed block structure
function getBlockType(parsedBlock: ParsedSection[]): string {
    const blockHeader = parsedBlock.find((section) => section.name === 'Block Header');
    if (!blockHeader) return 'Unknown';

    const flagsAndTimestamp = blockHeader.fields.find(
        (field) => field.name === 'Flags and Timestamp',
    );
    if (!flagsAndTimestamp?.subFields) return 'Unknown';

    const blockType = flagsAndTimestamp.subFields.find((field) => field.name === 'Block Type');
    return blockType?.parsedValue?.toString() || 'Unknown';
}

function getSender(parsedBlock: ParsedSection[]): string {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 'Unknown';

    const sender = routingHeader.fields.find((field) => field.name === 'Sender');
    return sender?.parsedValue?.toString() || 'Unknown';
}

function getReceivers(parsedBlock: ParsedSection[]): string[] {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return [];

    const receivers = routingHeader.fields.filter((field) => field.name === 'Receivers');
    return receivers.map((field) => field.parsedValue?.toString() || '');
}

function getTimestamp(parsedBlock: ParsedSection[]): number {
    const blockHeader = parsedBlock.find((section) => section.name === 'Block Header');
    if (!blockHeader) return 0;

    const flagsAndTimestamp = blockHeader.fields.find(
        (field) => field.name === 'Flags and Timestamp',
    );
    if (!flagsAndTimestamp?.subFields) return 0;

    const timestamp = flagsAndTimestamp.subFields.find(
        (field) => field.name === 'Creation Timestamp',
    );
    return Number(timestamp?.parsedValue) || 0;
}

function getBlockSize(parsedBlock: ParsedSection[]): number {
    const routingHeader = parsedBlock.find((section) => section.name === 'Routing Header');
    if (!routingHeader) return 0;

    const blockSize = routingHeader.fields.find((field) => field.name === 'Block Size');
    return Number(blockSize?.parsedValue) || 0;
}

// Computed property to transform raw blocks into table rows
const tableRows = computed(() => {
    return blocks.value.map((block) => {
        const blockType = getBlockType(block.parsedBlock);
        const sender = getSender(block.parsedBlock);
        const receivers = getReceivers(block.parsedBlock);
        const timestamp = getTimestamp(block.parsedBlock);
        const size = getBlockSize(block.parsedBlock);

        return {
            direction: block.direction,
            blockType,
            endpoint: block.direction === 'in' ? sender : receivers.join(', '),
            timestamp: timestamp === 0 ? new Date(block.capturedAt).toLocaleTimeString() : new Date(timestamp).toLocaleTimeString(),
            size,
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

        <div class="flex-1 overflow-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-16">Dir</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead class="w-24 text-right">Size</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-if="tableRows.length === 0">
                        <TableCell colspan="5" class="text-center text-muted-foreground">
                            No blocks captured yet. Click "Simulate Block" to test.
                        </TableCell>
                    </TableRow>
                    <TableRow v-for="(row, index) in tableRows" :key="index">
                        <TableCell>
                            <ArrowLeft v-if="row.direction === 'in'" class="h-4 w-4" />
                            <ArrowRight v-else class="h-4 w-4" />
                        </TableCell>
                        <TableCell class="font-medium">{{ row.blockType }}</TableCell>
                        <TableCell>{{ row.endpoint }}</TableCell>
                        <TableCell>{{ row.timestamp }}</TableCell>
                        <TableCell class="text-right">{{ row.size }} bytes</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
</template>
