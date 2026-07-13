import { h } from 'vue';
import type { ColumnDef } from '@tanstack/vue-table';
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

type TranslateFn = (key: string) => string;

export function createColumns(
    t: TranslateFn,
    parsedQuery?: ParsedSearchQuery,
): ColumnDef<NetworkBlockTableRow>[] {
    return [
        {
            accessorKey: 'direction',
            header: t('network.columnDir'),
            size: 70,
            cell: ({ row }) => h(DirectionCell, { value: row.getValue<string>('direction') }),
        },
        {
            accessorKey: 'interface',
            header: t('network.columnInterface'),
            cell: ({ row }) =>
                h(InterfaceCell, {
                    value: row.getValue<string>('interface'),
                    searchTerms: parsedQuery
                        ? getSearchTermsForField(parsedQuery, 'interface')
                        : [],
                }),
        },
        {
            accessorKey: 'blockType',
            header: t('common.type'),
            cell: ({ row }) =>
                h(TypeCell, {
                    value: row.getValue<string>('blockType'),
                    isEncrypted: row.original.isEncrypted,
                    isSigned: row.original.isSigned,
                    searchTerms: parsedQuery ? getSearchTermsForField(parsedQuery, 'type') : [],
                }),
        },
        {
            accessorKey: 'sender',
            header: t('network.columnSender'),
            cell: ({ row }) =>
                h(EndpointCell, {
                    value: row.getValue<string>('sender'),
                    searchTerms: parsedQuery ? getSearchTermsForField(parsedQuery, 'sender') : [],
                }),
        },
        {
            accessorKey: 'receiver',
            header: t('network.columnReceiver'),
            cell: ({ row }) =>
                h(EndpointCell, {
                    value: row.getValue<string>('receiver'),
                    searchTerms: parsedQuery ? getSearchTermsForField(parsedQuery, 'receiver') : [],
                }),
        },
        {
            accessorKey: 'timestamp',
            header: t('network.columnTime'),
            size: 120,
        },
        {
            accessorKey: 'size',
            header: t('network.columnSize'),
            size: 90,
            cell: ({ row }) => {
                const size = row.getValue('size') as number;
                if (size === undefined || size === null) return '';
                return formatBytes(size);
            },
        },
    ];
}
