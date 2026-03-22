import type { ColDef } from 'ag-grid-community';
import type { NetworkBlockTableRow } from '@/types/NetworkInspector/TableRow';
import type { ParsedSearchQuery } from '@/utils/searchParser';
import { getSearchTermsForField } from '@/utils/searchParser';
import DirectionCell from '@/components/NetworkInspector/cellRenderers/DirectionCell.vue';
import InterfaceCell from '@/components/NetworkInspector/cellRenderers/InterfaceCell.vue';
import TypeCell from '@/components/NetworkInspector/cellRenderers/TypeCell.vue';
import EndpointCell from '@/components/NetworkInspector/cellRenderers/EndpointCell.vue';

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

export function createColumns(parsedQuery?: ParsedSearchQuery): ColDef<NetworkBlockTableRow>[] {
    return [
        {
            field: 'direction',
            headerName: 'Dir',
            width: 70,
            minWidth: 60,
            cellRenderer: DirectionCell,
            sortable: false,
            suppressMovable: true,
            lockPosition: 'left',
        },
        {
            field: 'interface',
            headerName: 'Interface',
            flex: 1,
            minWidth: 120,
            cellRenderer: InterfaceCell,
            cellRendererParams: {
                searchTerms: parsedQuery ? getSearchTermsForField(parsedQuery, 'interface') : [],
            },
        },
        {
            field: 'blockType',
            headerName: 'Type',
            flex: 1.2,
            minWidth: 150,
            cellRenderer: TypeCell,
            cellRendererParams: {
                searchTerms: parsedQuery ? getSearchTermsForField(parsedQuery, 'type') : [],
            },
        },
        {
            field: 'sender',
            headerName: 'Sender',
            flex: 1.5,
            minWidth: 180,
            cellRenderer: EndpointCell,
            cellRendererParams: {
                searchTerms: parsedQuery ? getSearchTermsForField(parsedQuery, 'sender') : [],
            },
        },
        {
            field: 'receiver',
            headerName: 'Receiver',
            flex: 1.5,
            minWidth: 180,
            cellRenderer: EndpointCell,
            cellRendererParams: {
                searchTerms: parsedQuery ? getSearchTermsForField(parsedQuery, 'receiver') : [],
            },
        },
        {
            field: 'timestamp',
            headerName: 'Time',
            width: 120,
            minWidth: 100,
        },
        {
            field: 'size',
            headerName: 'Size',
            width: 90,
            minWidth: 70,
            valueFormatter: (params) => {
                const size = params.value as number;
                if (size === undefined || size === null) return '';
                return formatBytes(size);
            },
        },
    ];
}

// Default columns without search highlighting
export const columns = createColumns();
