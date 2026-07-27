import { h } from 'vue';
import type { ColumnDef } from '@tanstack/vue-table';
import type { NetworkBlockTableRow } from '@/types/NetworkInspector/TableRow';
import type { ParsedSearchQuery } from '@/utils/searchParser';
import { getSearchTermsForField } from '@/utils/searchParser';
import DirectionCell from '@/components/NetworkInspector/cellRenderers/DirectionCell.vue';
import TypeCell from '@/components/NetworkInspector/cellRenderers/TypeCell.vue';
import EndpointCell from '@/components/NetworkInspector/cellRenderers/EndpointCell.vue';
import type { Builtins } from '@unyt/datex';
import MetadataCell from './cellRenderers/MetadataCell.vue';
import BlockIdCell from './cellRenderers/BlockIdCell.vue';
import type { BlockId } from '@/composable/useNetworkInspector.ts';

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
                    value: row.getValue<Builtins.Endpoint>('sender'),
                    searchTerms: parsedQuery ? getSearchTermsForField(parsedQuery, 'sender') : [],
                }),
        },
        {
            accessorKey: 'receiver',
            header: t('network.columnReceiver'),
            cell: ({ row }) =>
                h(EndpointCell, {
                    value: row.getValue<Builtins.Endpoint>('receiver'),
                    searchTerms: parsedQuery ? getSearchTermsForField(parsedQuery, 'receiver') : [],
                }),
        },
        {
            accessorKey: 'blockId',
            header: t('network.blockId'),
            cell: ({ row }) =>
                h(BlockIdCell, {
                    value: row.getValue<BlockId>('blockId'),
                    searchTerms: parsedQuery ? getSearchTermsForField(parsedQuery, 'blockId') : [],
                }),
        },
        // TODO: re-enable interface column
        // {
        //     accessorKey: 'interface',
        //     header: t('network.columnInterface'),
        //     cell: ({ row }) =>
        //         h(InterfaceCell, {
        //             value: row.getValue<string>('interface'),
        //             searchTerms: parsedQuery
        //                 ? getSearchTermsForField(parsedQuery, 'interface')
        //                 : [],
        //         }),
        // },
        {
            accessorKey: 'timestamp',
            header: t('network.columnTime'),
            size: 120,
            cell: ({ row }) =>
                h(MetadataCell, {
                    value: row.getValue<string>('timestamp'),
                }),
        },
        {
            accessorKey: 'size',
            header: t('network.columnSize'),
            size: 90,
            cell: ({ row }) => {
                const size = row.getValue('size') as number;
                if (size === undefined || size === null) return '';
                const formattedSize = formatBytes(size);
                return h(MetadataCell, {
                    value: formattedSize,
                });
            },
        },
    ];
}
