<script setup lang="ts" generic="TData, TValue">
import { useI18n } from 'vue-i18n';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
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
    hasSelected?: boolean;
    /** Stable id per row. Without it, TanStack uses the row index, which shifts on sort/filter. */
    getRowId?: (row: TData, index: number) => string;
}

const props = withDefaults(defineProps<DataTableProps>(), {
    hasMoreData: false,
});

const emit = defineEmits<{
    'load-more': [];
    'row-click': [row: Record<string, unknown>];
    'row-unselect': [];
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
    getRowId: props.getRowId,
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

const virtualizer = useVirtualizer(
    computed(() => ({
        count: rows.value.length,
        getScrollElement: () => parentRef.value,
        estimateSize: () => 50,
        overscan: 10,
    })),
);

const ROW_HEIGHT = 50;
watch(
    () => [rows.value, props.data] as const,
    ([newRows, newData], [oldRows, oldData]) => {
        const el = parentRef.value;
        if (!el || newData === oldData) return;

        const scrollTop = el.scrollTop;
        const distanceFromBottom = el.scrollHeight - scrollTop - el.clientHeight;
        const followBottom = !oldRows.length || distanceFromBottom < 2;

        const anchorIndex = Math.floor(scrollTop / ROW_HEIGHT);
        const anchorId = oldRows[anchorIndex]?.id;
        const offsetInRow = scrollTop - anchorIndex * ROW_HEIGHT;

        nextTick(() => {
            if (followBottom) {
                el.scrollTop = el.scrollHeight;
                return;
            }
            const newIndex = newRows.findIndex((r) => r.id === anchorId);
            if (newIndex !== -1) {
                el.scrollTop = newIndex * ROW_HEIGHT + offsetInRow;
            }
        });
    },
);

const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

function columnStyle(size: number) {
    return {
        flex: `1 0 ${size}px`,
        minWidth: `${size}px`,
    };
}

const loadMoreRequested = ref(false);

watch(
    () => props.data.length,
    () => {
        loadMoreRequested.value = false;
    },
);

function maybeLoadMore() {
    const el = parentRef.value;
    if (!el || !props.hasMoreData || loadMoreRequested.value) return;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (bottom < 300) {
        loadMoreRequested.value = true;
        emit('load-more');
    }
}

function onScroll() {
    maybeLoadMore();
}

watch([totalSize, () => props.hasMoreData], maybeLoadMore, { flush: 'post' });

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
    if (!parentRef.value) return;
    resizeObserver = new ResizeObserver(maybeLoadMore);
    resizeObserver.observe(parentRef.value);
});

onBeforeUnmount(() => resizeObserver?.disconnect());

// Watch filter changes
watch(
    () => props.filterValue,
    (val) => {
        table.setGlobalFilter(val ?? '');
    },
);

const selectedRowId = ref<string | null>(null);

function selectRow(index: number) {
    const row = rows.value[index];
    if (!row) return;

    if (selectedRowId.value === row.id) {
        selectedRowId.value = null;
        emit('row-unselect');
        return;
    }
    selectedRowId.value = row.id;
    emit('row-click', row.original as Record<string, unknown>);
}

watch(
    () => props.hasSelected,
    (newVal) => {
        if (!newVal) {
            selectedRowId.value = null;
        }
    },
);
defineExpose({ scrollElement: parentRef });

</script>

<template>
    <div class="flex h-full w-full flex-col">
        <!-- Header: filter + column visibility -->
        <div class="flex shrink-0 items-center justify-between gap-4 py-2">
            <div class="max-w-sm flex-1">
                <slot name="filter" />
            </div>
            <div class="flex items-center gap-2">
                <div class="flex items-center gap-4">
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
                            @select.prevent
                        >
                            {{ column.id }}
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        <!-- Table -->
        <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border">
            <!-- Table header -->
            <div class="shrink-0 bg-background border-b border-border">
                <div
                    v-for="headerGroup in table.getHeaderGroups()"
                    :key="headerGroup.id"
                    class="flex"
                >
                    <div
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        class="flex items-center gap-1 px-3 py-2 text-sm font-medium border-r border-border last:border-r-0 select-none"
                        :class="{ 'cursor-pointer': header.column.getCanSort() }"
                        :style="columnStyle(header.getSize())"
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
                class="min-h-0 flex-1 overflow-auto"
                @scroll="onScroll"
            >
                <div :style="{ height: totalSize + 'px', position: 'relative' }">
                    <div
                        v-for="virtualRow in virtualRows"
                        :key="rows[virtualRow.index]?.id ?? virtualRow.index"
                        class="flex absolute left-0 top-0 w-full border-b border-border hover:bg-card cursor-pointer"
                        :class="{ 'bg-card': selectedRowId === rows[virtualRow.index]?.id, 'text-muted-foreground': rows[virtualRow.index]?.original.isDebug }"
                        :style="{
                            transform: `translateY(${virtualRow.start}px)`,
                            height: virtualRow.size + 'px',
                        }"
                        @click="selectRow(virtualRow.index)"
                    >
                        <div
                            v-for="cell in rows[virtualRow.index]?.getVisibleCells()"
                            :key="cell.id"
                            class="flex items-center px-3 overflow-hidden text-sm border-r border-border last:border-r-0"
                            :style="columnStyle(cell.column.getSize())"
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
