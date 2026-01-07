import type { ColumnDef } from '@tanstack/vue-table';
import type { NetworkBlockTableRow } from '@/types/NetworkInspector/TableRow';
import type { ParsedSearchQuery } from '@/utils/searchParser';
import { h } from 'vue';
import { ArrowLeft, ArrowRight, LockOpen, FileX } from 'lucide-vue-next';
import HighlightedText from '@/components/NetworkInspector/HighlightedText.vue';
import SortableHeader from '@/components/NetworkInspector/SortableHeader.vue';
import TooltipWrapper from '@/components/NetworkInspector/TooltipWrapper.vue';
import { getSearchTermsForField } from '@/utils/searchParser';

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

export function createColumns(parsedQuery?: ParsedSearchQuery): ColumnDef<NetworkBlockTableRow>[] {
    return [
    {
        accessorKey: 'direction',
        header: 'Dir',
        cell: ({ row }) => {
            const direction = row.getValue('direction') as string;
            return h(
                'div',
                { class: 'flex items-center' },
                direction === 'in'
                    ? h(ArrowLeft, { class: 'h-4 w-4 text-green-500' })
                    : h(ArrowRight, { class: 'h-4 w-4 text-blue-500' }),
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'interface',
        header: ({ column }) => {
            return h(SortableHeader, { column, label: 'Interface' });
        },
        cell: ({ row }) => {
            const value = row.getValue('interface') as string;
            const searchTerms = parsedQuery ? getSearchTermsForField(parsedQuery, 'interface') : [];
            
            return h(HighlightedText, {
                text: value,
                searchTerms,
                class: 'text-muted-foreground'
            });
        },
    },
    {
        accessorKey: 'blockType',
        header: ({ column }) => {
            return h(SortableHeader, { column, label: 'Type' });
        },
        cell: ({ row }) => {
            const blockType = row.getValue('blockType') as string;
            const isEncrypted = row.original.isEncrypted;
            const isSigned = row.original.isSigned;
            const searchTerms = parsedQuery ? getSearchTermsForField(parsedQuery, 'type') : [];

            return h('div', { class: 'flex items-center gap-2' }, [
                h(HighlightedText, {
                    text: blockType,
                    searchTerms,
                    class: 'font-medium uppercase'
                }),
                !isEncrypted
                    ? h(TooltipWrapper, { tooltip: 'Not encrypted' }, {
                        default: () => h('div', { class: 'inline-block cursor-default' }, [
                            h(LockOpen, { class: 'h-4 w-4 text-muted-foreground line-through' })
                        ])
                    })
                    : null,
                !isSigned
                    ? h(TooltipWrapper, { tooltip: 'Not signed' }, {
                        default: () => h('div', { class: 'inline-block cursor-default' }, [
                            h(FileX, { class: 'h-4 w-4 text-muted-foreground' })
                        ])
                    })
                    : null,
            ]);
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'sender',
        header: ({ column }) => {
            return h(SortableHeader, { column, label: 'Sender' });
        },
        cell: ({ row }) => {
            const sender = row.getValue('sender') as string;
            const searchTerms = parsedQuery ? getSearchTermsForField(parsedQuery, 'sender') : [];
            
            return h(TooltipWrapper, { tooltip: sender }, {
                default: () => h('div', { class: 'max-w-64 cursor-default truncate text-blue-400' }, [
                    h(HighlightedText, { text: sender, searchTerms })
                ])
            });
        },
    },
    {
        accessorKey: 'receiver',
        header: ({ column }) => {
            return h(SortableHeader, { column, label: 'Receiver' });
        },
        cell: ({ row }) => {
            const receiver = row.getValue('receiver') as string;
            const searchTerms = parsedQuery ? getSearchTermsForField(parsedQuery, 'receiver') : [];
            
            return h(TooltipWrapper, { tooltip: receiver }, {
                default: () => h('div', { class: 'max-w-64 cursor-default text-ellipsis overflow-hidden whitespace-nowrap text-blue-400' }, [
                    h(HighlightedText, { text: receiver, searchTerms })
                ])
            });
        },
    },
    {
        accessorKey: 'timestamp',
        header: ({ column }) => {
            return h(SortableHeader, { column, label: 'Time' });
        },
    },
    {
        accessorKey: 'size',
        header: ({ column }) => {
            return h(SortableHeader, { column, label: 'Size' });
        },
        cell: ({ row }) => {
            const size = row.getValue('size') as number;
            return h('div', { class: 'whitespace-nowrap' }, formatBytes(size));
        },
    },
];
}

// Default columns without search highlighting
export const columns = createColumns();
