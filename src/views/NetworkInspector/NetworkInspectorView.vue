<script setup lang="ts">
import DataTable from '@/components/NetworkInspector/DataTable.vue';
import NetworkFilter, {
    type SearchSuggestions,
} from '@/components/NetworkInspector/NetworkFilter.vue';
import { createColumns } from '@/components/NetworkInspector/columns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { BLOCK_TYPES } from '@/composable/useBlockSimulator';
import { useNetworkInspector } from '@/composable/useNetworkInspector';
import DatexBlockProtocolView from '@/views/BlockViewer/DatexBlockProtocolView.vue';
import type { NetworkBlockTableRow } from '@/types/NetworkInspector/TableRow';
import { filterRowsBySearch, parseSearchQuery } from '@/utils/searchParser';
import { Trash, X, Lock, Unlock } from 'lucide-vue-next';
import { computed, nextTick, ref, watch } from 'vue';
import type { RawBlockEntry } from '@/types/NetworkInspector/BlockEntry'

const {
    sendTestBlock,
    blocks,
    displayedBlocks,
    hasMoreBlocks,
    loadMoreBlocks,
    resetLoadedCount,
    saveBlocksToStorage,
} = useNetworkInspector();

// Search query state
const searchQuery = ref('');

const selectedBlockEntry = ref<RawBlockEntry | null>(null)

// Selected block for right panel
const selectedBlock = computed(() => selectedBlockEntry.value?.originalBinary ?? null)

function onRowClick(row: Record<string, unknown>) {
  const capturedAt = row.capturedAt as number
  const block = blocks.value.find(b => b.capturedAt === capturedAt)
  if (block) {
    selectedBlockEntry.value = block
  }
}

function closeBlockViewer() {
    selectedBlockEntry.value = null;
}

// Alert dialog state
const showDeleteDialog = ref(false);
const deleteMessage = computed(() => {
    // When search is empty, delete all blocks; otherwise delete filtered blocks
    const count = searchQuery.value.trim() ? filteredTableRows.value.length : blocks.value.length;
    return count > 0 ? `This will permanently delete ${count} block${count > 1 ? 's' : ''}.` : '';
});

// Confirm and execute deletion
function confirmClearBlocks() {
    if (searchQuery.value.trim()) {
        // Delete only filtered blocks when searching
        const timestampsToDelete = new Set(filteredTableRows.value.map((row) => row.capturedAt));
        blocks.value = blocks.value.filter((block) => !timestampsToDelete.has(block.capturedAt));
    } else {
        // Delete ALL blocks when search is empty
        blocks.value = [];
        resetLoadedCount();
    }

    // Persist changes to localStorage
    saveBlocksToStorage(blocks.value);

    showDeleteDialog.value = false;
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

// Computed property to transform DISPLAYED blocks into table rows (using pre-parsed metadata)
const allTableRows = computed<NetworkBlockTableRow[]>(() => {
    return displayedBlocks.value.map((block) => {
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
            interface: block.interfaceName,
            capturedAt: block.capturedAt,
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
    if (!searchQuery.value.trim()) return createColumns();

    const parsedQuery = parseSearchQuery(searchQuery.value);
    return createColumns(parsedQuery);
});

const isBlockSecure = computed(() => {
  const entry = selectedBlockEntry.value
  if (!entry) return false
  return (entry.encryptionType !== 'None' && entry.encryptionType !== 'Unknown')
    || (entry.signatureType !== 'None' && entry.signatureType !== 'Unknown')
})

</script>

<template>
  <div class="top-offset bg-background text-foreground flex h-full">
      <!-- Left panel: block list -->
      <div class="flex flex-col p-4 pt-0" :class="selectedBlock ? 'w-1/2 border-r border-border' : 'w-full'">
          <div class="mb-4">
              <h1 class="mb-3 text-2xl font-bold">Network Inspector</h1>

              <!-- Block simulation buttons -->
              <div class="flex flex-wrap gap-2">
                  <Button
                      v-for="blockType in BLOCK_TYPES"
                      :key="blockType.id"
                      @click="sendTestBlock()"
                      variant="outline"
                      size="sm"
                      class="text-foreground border-border"
                      :title="blockType.description"
                  >
                      {{ blockType.label }}
                  </Button>

                  <!-- Legacy TraceBack button -->
                  <Button
                      @click="sendTestBlock"
                      variant="outline"
                      size="sm"
                      class="text-foreground border-border"
                      title="Legacy traceback block (base64 encoded)"
                  >
                      TraceBack (Legacy)
                  </Button>
              </div>
          </div>

          <div ref="scrollContainerRef" class="flex-1 overflow-y-auto">
              <DataTable
                  :columns="dynamicColumns"
                  :data="tableRows"
                  :has-more-data="hasMoreBlocks && !searchQuery.trim()"
                  @load-more="loadMoreBlocks"
                  @row-click="onRowClick"
              >
                  <template #filter>
                      <div class="flex items-center gap-2">
                          <NetworkFilter
                              v-model:filter-value="searchQuery"
                              :suggestions="searchSuggestions"
                              placeholder="Search: type:traceback sender:@sender"
                          />
                          <AlertDialog v-model:open="showDeleteDialog">
                              <AlertDialogTrigger as-child>
                                  <Button
                                      variant="outline"
                                      size="icon"
                                      title="Clear all displayed blocks"
                                      class="text-foreground border-border transition-colors hover:text-red-600"
                                      :disabled="blocks.length === 0"
                                  >
                                      <Trash class="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Blocks?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          {{ deleteMessage }}
                                          This action cannot be undone.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                          @click="confirmClearBlocks"
                                          class="bg-red-600 hover:bg-red-700"
                                      >
                                          Delete
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                  </template>
              </DataTable>
          </div>
      </div>

      <!-- Right panel: block viewer -->
      <div v-if="selectedBlock" class="w-1/2 flex flex-col h-full overflow-y-auto">
          <div class="flex items-center justify-between px-4 py-2 border-b border-border">
            <div class="flex items-center gap-2 text-sm font-mono">
  <span class="text-muted-foreground uppercase">{{ selectedBlockEntry?.blockType }}</span>
      <Lock v-if="isBlockSecure" class="size-3.5 text-muted-foreground" />
    <Unlock v-else class="size-3.5 text-muted-foreground" />
  <span class="text-foreground pl-3">{{ selectedBlockEntry?.sender }}</span>
  <span class="text-muted-foreground">→</span>
  <span class="text-foreground">{{ selectedBlockEntry?.receivers.join(', ') }}</span>
</div>              <button
                  class="text-muted-foreground hover:text-foreground transition"
                  @click="closeBlockViewer"
              >
                  <X class="size-4" />
              </button>
          </div>
          <div class="flex-1 overflow-y-auto">
              <DatexBlockProtocolView
                  :blockData="selectedBlock"
                  :key="selectedBlock.byteLength + '-' + Date.now()"
              />
          </div>
      </div>
  </div>
</template>
