<script setup lang="ts" generic="TData, TValue">
import { useI18n } from 'vue-i18n';
import { ref, computed, watch } from 'vue';
import {
    useVueTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    FlexRender,
    type ColumnDef,
    type SortingState,
    type VisibilityState,
} from '@tanstack/vue-table';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-vue-next';

const { t } = useI18n();

interface DataTableProps {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    filterValue?: string;
    hasMoreData?: boolean;
}

const props = withDefaults(defineProps<DataTableProps>(), {
    hasMoreData: false,
});

const emit = defineEmits<{
    'load-more': [];
    'row-click': [row: Record<string, unknown>];
}>();

const sorting = ref<SortingState>([]);
const columnVisibility = ref<VisibilityState>({});

const table = useVueTable({
    get data() {
        return props.data;
    },
    get columns() {
        return props.columns;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
        sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater;
    },
    onColumnVisibilityChange: (updater) => {
        columnVisibility.value =
            typeof updater === 'function' ? updater(columnVisibility.value) : updater;
    },
    state: {
        get sorting() {
            return sorting.value;
        },
        get columnVisibility() {
            return columnVisibility.value;
        },
        get globalFilter() {
            return props.filterValue;
        },
    },
});

const rows = computed(() => table.getRowModel().rows);

// Virtual scrolling
const parentRef = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer({
    get count() {
        return rows.value.length;
    },
    getScrollElement: () => parentRef.value,
    estimateSize: () => 48,
    overscan: 10,
});

const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

// Load more when scrolling near bottom
function onScroll(e: Event) {
    if (!props.hasMoreData) return;
    const target = e.target as HTMLElement;
    const bottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (bottom < 300) {
        emit('load-more');
    }
}

// Watch filter changes
watch(
    () => props.filterValue,
    (val) => {
        table.setGlobalFilter(val ?? '');
    },
);
</script>

<template>
    <div class="flex h-full w-full flex-col overflow-hidden">
        <!-- Header: filter + column visibility -->
        <div class="flex shrink-0 items-center justify-between gap-4 px-1 py-4">
            <div class="max-w-sm flex-1">
                <slot name="filter" />
            </div>
            <div class="flex items-center gap-2">
              <div>
                <slot name="actions" />
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                      <Button variant="outline" class="text-foreground border-border ml-auto">
                          {{ t('network.columns') }} <ChevronDown class="ml-2 h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuCheckboxItem
                          v-for="column in table.getAllColumns().filter((c) => c.getCanHide())"
                          :key="column.id"
                          class="capitalize"
                          :model-value="column.getIsVisible()"
                          @update:model-value="column.toggleVisibility"
                      >
                          {{ column.id }}
                      </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>

        <!-- Table -->
        <div class="flex-1 overflow-hidden rounded-md border border-border">
            <!-- Table header -->
            <div class="bg-background border-b border-border">
                <div
                    v-for="headerGroup in table.getHeaderGroups()"
                    :key="headerGroup.id"
                    class="flex"
                >
                    <div
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        class="flex items-center gap-1 px-3 py-3 text-sm font-medium border-r border-border last:border-r-0 cursor-pointer select-none"
                        :style="{
                            width: header.getSize() + 'px',
                            flex: header.getSize() ? 'none' : '1',
                        }"
                        @click="header.column.getCanSort() ? header.column.toggleSorting() : null"
                    >
                        <FlexRender
                            v-if="!header.isPlaceholder"
                            :render="header.column.columnDef.header"
                            :props="header.getContext()"
                        />
                        <ArrowUp v-if="header.column.getIsSorted() === 'asc'" class="h-3 w-3" />
                        <ArrowDown v-if="header.column.getIsSorted() === 'desc'" class="h-3 w-3" />
                    </div>
                </div>
            </div>

            <!-- Virtual rows -->
            <div
                ref="parentRef"
                class="overflow-auto"
                style="height: calc(100% - 48px)"
                @scroll="onScroll"
            >
                <div :style="{ height: totalSize + 'px', position: 'relative' }">
                    <div
                        v-for="virtualRow in virtualRows"
                        :key="virtualRow.index"
                        class="flex absolute w-full border-b border-border hover:bg-accent cursor-pointer"
                        @click="
                            emit(
                                'row-click',
                                rows[virtualRow.index]?.original as Record<string, unknown>,
                            )
                        "
                        :style="{
                            transform: `translateY(${virtualRow.start}px)`,
                            height: virtualRow.size + 'px',
                        }"
                    >
                        <div
                            v-for="cell in rows[virtualRow.index]?.getVisibleCells()"
                            :key="cell.id"
                            class="flex items-center px-3 overflow-hidden text-sm border-r border-border last:border-r-0"
                            :style="{
                                width: cell.column.getSize() + 'px',
                                flex: cell.column.getSize() ? 'none' : '1',
                            }"
                        >
                            <FlexRender
                                :render="cell.column.columnDef.cell"
                                :props="cell.getContext()"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
