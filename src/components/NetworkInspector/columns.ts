import type { ColumnDef } from '@tanstack/vue-table';
import type { NetworkBlockTableRow } from '@/types/NetworkInspector/TableRow';
import type { ParsedSearchQuery } from '@/utils/searchParser';
import { h } from 'vue';
import { ArrowLeft, ArrowRight, LockOpen, FileX, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next';
import HighlightedText from '@/components/NetworkInspector/HighlightedText.vue';
import { getSearchTermsForField } from '@/utils/searchParser';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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
            return h(
                Button,
                {
                    variant: 'ghost',
                    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
                    class: 'h-8 px-2'
                },
                () => [
                    'Interface',
                    h(
                        column.getIsSorted() === 'asc' ? ArrowUp :
                        column.getIsSorted() === 'desc' ? ArrowDown :
                        ArrowUpDown,
                        { class: 'ml-2 h-4 w-4' }
                    )
                ]
            );
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
            return h(
                Button,
                {
                    variant: 'ghost',
                    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
                    class: 'h-8 px-2'
                },
                () => [
                    'Type',
                    h(
                        column.getIsSorted() === 'asc' ? ArrowUp :
                        column.getIsSorted() === 'desc' ? ArrowDown :
                        ArrowUpDown,
                        { class: 'ml-2 h-4 w-4' }
                    )
                ]
            );
        },
        cell: ({ row }) => {
            const blockType = row.getValue('blockType') as string;
            const isEncrypted = row.original.isEncrypted;
            const isSigned = row.original.isSigned;
            const searchTerms = parsedQuery ? getSearchTermsForField(parsedQuery, 'type') : [];

            return h(
                TooltipProvider,
                {},
                {
                    default: () =>
                        h('div', { class: 'flex items-center gap-2' }, [
                            h(HighlightedText, {
                                text: blockType,
                                searchTerms,
                                class: 'font-medium uppercase'
                            }),
                            !isEncrypted
                                ? h(
                                      Tooltip,
                                      {},
                                      {
                                          default: () => [
                                              h(
                                                  TooltipTrigger,
                                                  { asChild: true },
                                                  {
                                                      default: () =>
                                                          h(
                                                              'div',
                                                              { class: 'inline-block cursor-default' },
                                                              [
                                                                  h(LockOpen, {
                                                                      class: 'h-4 w-4 text-muted-foreground line-through',
                                                                  }),
                                                              ],
                                                          ),
                                                  },
                                              ),
                                              h(TooltipContent, {}, () => 'Not encrypted'),
                                          ],
                                      },
                                  )
                                : null,
                            !isSigned
                                ? h(
                                      Tooltip,
                                      {},
                                      {
                                          default: () => [
                                              h(
                                                  TooltipTrigger,
                                                  { asChild: true },
                                                  {
                                                      default: () =>
                                                          h(
                                                              'div',
                                                              { class: 'inline-block cursor-default' },
                                                              [
                                                                  h(FileX, {
                                                                      class: 'h-4 w-4 text-muted-foreground',
                                                                  }),
                                                              ],
                                                          ),
                                                  },
                                              ),
                                              h(TooltipContent, {}, () => 'Not signed'),
                                          ],
                                      },
                                  )
                                : null,
                        ]),
                },
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'sender',
        header: ({ column }) => {
            return h(
                Button,
                {
                    variant: 'ghost',
                    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
                    class: 'h-8 px-2'
                },
                () => [
                    'Sender',
                    h(
                        column.getIsSorted() === 'asc' ? ArrowUp :
                        column.getIsSorted() === 'desc' ? ArrowDown :
                        ArrowUpDown,
                        { class: 'ml-2 h-4 w-4' }
                    )
                ]
            );
        },
        cell: ({ row }) => {
            const sender = row.getValue('sender') as string;
            const searchTerms = parsedQuery ? getSearchTermsForField(parsedQuery, 'sender') : [];
            
            return h(
                TooltipProvider,
                {},
                {
                    default: () =>
                        h(
                            Tooltip,
                            {},
                            {
                                default: () => [
                                    h(
                                        TooltipTrigger,
                                        { asChild: true },
                                        {
                                            default: () =>
                                                h(
                                                    'div',
                                                    { class: 'max-w-64 cursor-default truncate text-blue-400' },
                                                    [
                                                        h(HighlightedText, {
                                                            text: sender,
                                                            searchTerms
                                                        })
                                                    ]
                                                ),
                                        },
                                    ),
                                    h(TooltipContent, {}, () =>
                                        h('p', { class: 'max-w-sm break-words' }, sender),
                                    ),
                                ],
                            },
                        ),
                },
            );
        },
    },
    {
        accessorKey: 'receiver',
        header: ({ column }) => {
            return h(
                Button,
                {
                    variant: 'ghost',
                    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
                    class: 'h-8 px-2'
                },
                () => [
                    'Receiver',
                    h(
                        column.getIsSorted() === 'asc' ? ArrowUp :
                        column.getIsSorted() === 'desc' ? ArrowDown :
                        ArrowUpDown,
                        { class: 'ml-2 h-4 w-4' }
                    )
                ]
            );
        },
        cell: ({ row }) => {
            const receiver = row.getValue('receiver') as string;
            const searchTerms = parsedQuery ? getSearchTermsForField(parsedQuery, 'receiver') : [];
            
            return h(
                TooltipProvider,
                {},
                {
                    default: () =>
                        h(
                            Tooltip,
                            {},
                            {
                                default: () => [
                                    h(
                                        TooltipTrigger,
                                        { asChild: true },
                                        {
                                            default: () =>
                                                h(
                                                    'div',
                                                    { class: 'max-w-64 cursor-default truncate text-blue-400' },
                                                    [
                                                        h(HighlightedText, {
                                                            text: receiver,
                                                            searchTerms
                                                        })
                                                    ]
                                                ),
                                        },
                                    ),
                                    h(TooltipContent, {}, () =>
                                        h('p', { class: 'max-w-sm break-words' }, receiver),
                                    ),
                                ],
                            },
                        ),
                },
            );
        },
    },
    {
        accessorKey: 'timestamp',
        header: ({ column }) => {
            return h(
                Button,
                {
                    variant: 'ghost',
                    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
                    class: 'h-8 px-2'
                },
                () => [
                    'Time',
                    h(
                        column.getIsSorted() === 'asc' ? ArrowUp :
                        column.getIsSorted() === 'desc' ? ArrowDown :
                        ArrowUpDown,
                        { class: 'ml-2 h-4 w-4' }
                    )
                ]
            );
        },
    },
    {
        accessorKey: 'size',
        header: ({ column }) => {
            return h(
                Button,
                {
                    variant: 'ghost',
                    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
                    class: 'h-8 px-2'
                },
                () => [
                    'Size',
                    h(
                        column.getIsSorted() === 'asc' ? ArrowUp :
                        column.getIsSorted() === 'desc' ? ArrowDown :
                        ArrowUpDown,
                        { class: 'ml-2 h-4 w-4' }
                    )
                ]
            );
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
