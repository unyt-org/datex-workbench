<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DataTable from '@/components/NetworkInspector/DataTable.vue';
import NetworkFilter, {
    type SearchSuggestions,
} from '@/components/NetworkInspector/NetworkFilter.vue';
import { createColumns } from '@/components/NetworkInspector/columns';
import { Button } from '@/components/ui/button';
import { useNetworkInspector } from '@/composable/useNetworkInspector';
import DatexBlockProtocolView from '@/views/BlockViewer/DatexBlockProtocolView.vue';
import type { NetworkBlockTableRow } from '@/types/NetworkInspector/TableRow';
import { filterRowsBySearch, parseSearchQuery } from '@/utils/searchParser';
import { Trash, X, Lock, Unlock, BanIcon } from 'lucide-vue-next';
import { computed, nextTick, ref, watch } from 'vue';
import type { RawBlockEntry } from '@/types/NetworkInspector/BlockEntry';
import Checkbox from '@/components/ui/checkbox/Checkbox.vue';
import Label from '@/components/ui/label/Label.vue';
import { activeEndpoint } from '@/lib/inspector/mod';
import EndpointSearch from '@/components/Endpoints/EndpointSearch.vue';
import StandaloneWindowHeader from '@/components/Endpoints/StandaloneWindowHeader.vue';
import { useWindowControlsOverlay } from '@/utils/windowControlsOverlay';
import BlockIcons from '@/components/NetworkInspector/BlockIcons.vue';

const { t } = useI18n();

const showDebug = ref(false);

const {
    blocks,
} = useNetworkInspector(showDebug);

// Search query state
const searchQuery = ref('');

const selectedBlockEntry = ref<RawBlockEntry | null>(null);

// Selected block for right panel
const selectedBlock = computed(() => selectedBlockEntry.value?.originalBinary ?? null);

function onRowClick(row: Record<string, unknown>) {
    const capturedAt = row.capturedAt as number;
    const block = blocks.value.find((b) => b.capturedAt === capturedAt);
    if (block) {
        selectedBlockEntry.value = block;
    }
}

function onRowUnselect() {
    selectedBlockEntry.value = null;
}

function closeBlockViewer() {
    selectedBlockEntry.value = null;
}

// Confirm and execute deletion
function clearBlocks() {
    if (searchQuery.value.trim()) {
        // Delete only filtered blocks when searching
        const timestampsToDelete = new Set(filteredTableRows.value.map((row) => row.capturedAt));
        blocks.value = blocks.value.filter((block) => !timestampsToDelete.has(block.capturedAt));
    } else {
        // Delete ALL blocks when search is empty
        blocks.value = [];
    }
}



// Computed property to transform DISPLAYED blocks into table rows (using pre-parsed metadata)
const allTableRows = computed<NetworkBlockTableRow[]>(() => {
    return blocks.value.map((block) => {
        return {
            direction: block.direction,
            blockType: block.blockType,
            sender: block.sender,
            receiver: block.receivers.join(', '),
            timestamp:
                block.timestamp === 0
                    ? new Date(block.capturedAt).toLocaleTimeString()
                    : new Date(block.timestamp).toLocaleTimeString(),
            size: block.size,
            isEncrypted: block.encryptionType !== 'None' && block.encryptionType !== 'Unknown',
            isSigned: block.signatureType !== 'None' && block.signatureType !== 'Unknown',
            isDebug: block.isDebug,
            interface: block.interfaceName,
            capturedAt: block.capturedAt,
            blockId: block.blockId,
        };
    });
});

// Filtered table rows based on search query
const filteredTableRows = computed<NetworkBlockTableRow[]>(() => {
    if (!searchQuery.value.trim()) return allTableRows.value;

    const parsedQuery = parseSearchQuery(searchQuery.value);
    return filterRowsBySearch(allTableRows.value, parsedQuery);
});

// Final table rows to display (filtered results)
const tableRows = computed<NetworkBlockTableRow[]>(() => {
    return filteredTableRows.value;
});

// Compute unique suggestions from table data
const searchSuggestions = computed<SearchSuggestions>(() => {
    const types = new Set<string>();
    const senders = new Set<string>();
    const receivers = new Set<string>();
    const interfaces = new Set<string>();

    allTableRows.value.forEach((row) => {
        if (row.blockType) types.add(row.blockType);
        if (row.sender) senders.add(row.sender);
        if (row.receiver) receivers.add(row.receiver);
        if (row.interface) interfaces.add(row.interface);
    });

    return {
        types: Array.from(types).sort(),
        senders: Array.from(senders).sort(),
        receivers: Array.from(receivers).sort(),
        interfaces: Array.from(interfaces).sort(),
    };
});

// Dynamic columns with search highlighting
const dynamicColumns = computed(() => {
    if (!searchQuery.value.trim()) return createColumns(t);

    const parsedQuery = parseSearchQuery(searchQuery.value);
    return createColumns(t, parsedQuery);
});

const isBlockDebug = computed(() => {
    const entry = selectedBlockEntry.value;
    if (!entry) return false;
    return entry.isDebug ?? false;
});

const isBlockEncrypted = computed(() => {
    const entry = selectedBlockEntry.value;
    if (!entry) return false;
    return entry.encryptionType !== 'None' && entry.encryptionType !== 'Unknown';
});

const isBlockSigned = computed(() => {
    const entry = selectedBlockEntry.value;
    if (!entry) return false;
    return entry.signatureType !== 'None' && entry.signatureType !== 'Unknown';
});

const isLocalEndpoint = computed(() => activeEndpoint.value.toString() === "@@local");
const controlsOverlayEnabled = useWindowControlsOverlay();

</script>

<template>
    <StandaloneWindowHeader :title="t('network.title')"/>
    <div class="bg-background text-foreground flex h-full flex-col gap-3 p-4 pt-0 overflow-hidden">
        <div class="flex justify-between items-center gap-4" v-if="!controlsOverlayEnabled">
          <h1 class="shrink-0 text-xl font-medium">{{ t('network.title') }}</h1>
          <EndpointSearch />
        </div>

        <div class="flex min-h-0 flex-1 gap-3">
            <!-- Left panel: block list -->
            <div class="flex min-h-0 flex-col" :class="selectedBlock ? 'w-1/2' : 'w-full'">
                <DataTable
                    :get-row-id="(row) => String(row.capturedAt)"
                    class="min-h-0 flex-1 no-drag"
                    :columns="dynamicColumns"
                    :data="tableRows"
                    :has-more-data="!searchQuery.trim()"
                    :has-selected="selectedBlockEntry != null"
                    @row-click="onRowClick"
                    @row-unselect="onRowUnselect"
                >
                    <template #filter>
                        <div class="flex items-center gap-4">
                            <NetworkFilter
                                v-model:filter-value="searchQuery"
                                :suggestions="searchSuggestions"
                                :placeholder="t('network.searchPlaceholder')"
                            />
                        </div>
                    </template>
                    <template #actions>
                        <Label v-if="isLocalEndpoint" class="flex items-center gap-2 whitespace-nowrap">
                            <Checkbox v-model="showDebug" label="Record Debug Blocks" />
                            Record Debug Blocks
                        </Label>
                        <Button
                            variant="outline"
                            size="icon"
                            :title="t('network.clearAll')"
                            class="text-foreground border-border transition-colors hover:text-rose-600"
                            :disabled="blocks.length === 0"
                            @click="clearBlocks()"
                        >
                            <BanIcon class="h-4 w-4" />
                        </Button>
                    </template>
                </DataTable>
            </div>

            <!-- Right panel: block viewer -->
            <div v-if="selectedBlock" class="flex min-h-0 w-1/2 flex-col">
                <div class="flex shrink-0 items-center justify-between px-4 py-4">
                    <div class="flex items-center gap-2 text-sm font-mono">
                        <span class="text-muted-foreground uppercase">{{ selectedBlockEntry?.blockType }}</span>
                        <BlockIcons
                            :isEncrypted="isBlockEncrypted"
                            :isSigned="isBlockSigned"
                            :isDebug="isBlockDebug"
                        />
                        <span class="text-foreground pl-3">{{ selectedBlockEntry?.sender }}</span>
                        <span class="text-muted-foreground">→</span>
                        <span class="text-foreground">{{ selectedBlockEntry?.receivers.join(', ') }}</span>
                    </div>
                    <button
                        class="text-muted-foreground hover:text-foreground transition"
                        @click="closeBlockViewer"
                    >
                        <X class="size-4" />
                    </button>
                </div>
                <div class="min-h-0 flex-1 overflow-y-auto no-drag">
                    <DatexBlockProtocolView
                        :blockData="selectedBlock"
                        :key="selectedBlock.byteLength + '-' + Date.now()"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
