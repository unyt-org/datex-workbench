<script setup lang="ts" generic="TData, TValue">
import type { ColDef, GridApi, GridReadyEvent, Column } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-vue-next';
import { ref, onMounted, watch } from 'vue';

ModuleRegistry.registerModules([AllCommunityModule]);

interface DataTableProps {
    columns: ColDef<TData>[];
    data: TData[];
    filterValue?: string;
    filterPlaceholder?: string;
}

const props = withDefaults(defineProps<DataTableProps>(), {
    filterPlaceholder: 'Filter...'
});

const gridApi = ref<GridApi<TData>>();
const visibleColumns = ref<Record<string, boolean>>({});

const defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: false,
    suppressMovable: false,
};

const onGridReady = (params: GridReadyEvent<TData>) => {
    gridApi.value = params.api;
    
    // Initialize column visibility state
    const columnState: Record<string, boolean> = {};
    params.api.getAllDisplayedColumns().forEach((col: Column) => {
        const colDef = col.getColDef();
        if (colDef.field) {
            columnState[colDef.field] = true;
        }
    });
    visibleColumns.value = columnState;
};

const toggleColumnVisibility = (field: string, visible: boolean) => {
    if (gridApi.value) {
        gridApi.value.setColumnsVisible([field], visible);
        visibleColumns.value[field] = visible;
    }
};

// Watch for filter changes
watch(() => props.filterValue, (newValue) => {
    if (gridApi.value && newValue !== undefined) {
        gridApi.value.setGridOption('quickFilterText', newValue);
    }
});
</script>

<template>
    <div class="w-full h-full flex flex-col overflow-hidden">
        <!-- Fixed header section: Search and Column filters -->
        <div class="flex items-center justify-between gap-4 py-4 px-1 shrink-0">
            <div class="flex-1 max-w-sm">
                <slot name="filter">
                    <!-- Default filter slot if not provided -->
                </slot>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline" class="ml-auto">
                        Columns <ChevronDown class="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                        v-for="(visible, field) in visibleColumns"
                        :key="field"
                        class="capitalize"
                        :model-value="visible"
                        @update:model-value="(value: boolean) => toggleColumnVisibility(field, value)"
                    >
                        {{ field }}
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
        <!-- AG Grid container -->
        <div class="ag-theme-custom flex-1 rounded-md border overflow-hidden">
            <AgGridVue
                style="width: 100%; height: 100%;"
                :columnDefs="columns"
                :rowData="data"
                :defaultColDef="defaultColDef"
                @grid-ready="onGridReady"
                :rowHeight="48"
                :headerHeight="48"
                :suppressCellFocus="true"
                :suppressRowClickSelection="true"
                :enableCellTextSelection="true"
                :reactiveCustomComponents="true"
            />
        </div>
    </div>
</template>

<style>
/* AG Grid custom theme matching current dark theme */
.ag-theme-custom {
    --ag-background-color: hsl(var(--background));
    --ag-foreground-color: hsl(var(--foreground));
    --ag-header-background-color: hsl(217 33% 17% / 1);
    --ag-header-foreground-color: hsl(var(--foreground));
    --ag-odd-row-background-color: hsl(var(--background));
    --ag-row-hover-color: hsl(215 30% 20% / 0.6);
    --ag-border-color: hsl(var(--border));
    --ag-header-column-resize-handle-color: hsl(var(--border));
    --ag-font-size: 0.875rem;
    --ag-font-family: inherit;
}

.ag-theme-custom .ag-root-wrapper {
    border: none;
}

.ag-theme-custom .ag-header {
    border-bottom: 1px solid hsl(var(--border));
}

.ag-theme-custom .ag-header-cell {
    border-right: 1px solid hsl(215 20% 25% / 0.5);
}

.ag-theme-custom .ag-header-cell:last-child {
    border-right: none;
}

.ag-theme-custom .ag-cell {
    border-right: 1px solid hsl(215 20% 25% / 0.3);
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ag-theme-custom .ag-cell:last-child {
    border-right: none;
}

.ag-theme-custom .ag-cell-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
}

.ag-theme-custom .ag-header-cell-text {
    font-weight: 500;
}

.ag-theme-custom .ag-row {
    border-bottom: 1px solid hsl(var(--border));
}

/* Column drag indicators */
.ag-theme-custom .ag-header-cell-moving {
    background-color: hsl(var(--accent));
}

/* Resize handle styling */
.ag-theme-custom .ag-header-cell-resize::after {
    width: 2px;
}
</style>
