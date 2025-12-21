import type { ColumnDef } from '@tanstack/vue-table';
import type { NetworkBlockTableRow } from '@/types/NetworkInspector/TableRow';
import { h } from 'vue';
import { ArrowLeft, ArrowRight, LockOpen, FileX } from 'lucide-vue-next';
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

export const columns: ColumnDef<NetworkBlockTableRow>[] = [
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
                    : h(ArrowRight, { class: 'h-4 w-4 text-orange-500' }),
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'interface',
        header: 'Interface',
        cell: ({ row }) => {
            const value = row.getValue('interface') as string;
            return h('div', { class: 'text-muted-foreground' }, value);
        },
    },
    {
        accessorKey: 'blockType',
        header: 'Type',
        cell: ({ row }) => {
            const blockType = row.getValue('blockType') as string;
            const isEncrypted = row.original.isEncrypted;
            const isSigned = row.original.isSigned;

            return h(
                TooltipProvider,
                {},
                {
                    default: () =>
                        h('div', { class: 'flex items-center gap-2' }, [
                            h('span', { class: 'font-medium uppercase' }, blockType),
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
        header: 'Sender',
        cell: ({ row }) => {
            const sender = row.getValue('sender') as string;
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
                                                    sender,
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
        header: 'Receiver',
        cell: ({ row }) => {
            const receiver = row.getValue('receiver') as string;
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
                                                    receiver,
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
        header: 'Time',
    },
    {
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => {
            const size = row.getValue('size') as number;
            return h('div', { class: 'whitespace-nowrap' }, formatBytes(size));
        },
    },
];
