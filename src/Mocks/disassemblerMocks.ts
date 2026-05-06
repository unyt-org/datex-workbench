import type { TreeResult, FlatResult } from '../types/disassembler';

export const MOCK_TREE: TreeResult = [
    {
        instruction: ['SHORT_STATEMENTS', '[count: 3, terminated: false]'],
        children: [
            {
                instruction: 'PUSH_TO_STACK',
                children: [{ instruction: ['INT', '5'] }],
            },
            {
                instruction: 'PUSH_TO_STACK',
                children: [{ instruction: ['INT', '42'] }],
            },
            {
                instruction: [
                    'REMOTE_EXECUTION',
                    '[length: 73, injected_variables: []]',
                    {
                        instruction: ['SHORT_STATEMENTS', '[count: 4, terminated: true]'],
                        children: [
                            { instruction: ['INT', '1'] },
                            { instruction: ['INT', '2'] },
                            { instruction: ['INT', '3'] },
                            {
                                instruction: [
                                    'REMOTE_EXECUTION',
                                    '[length: 18, injected_variables: []]',
                                    {
                                        instruction: [
                                            'SHORT_STATEMENTS',
                                            '[count: 1, terminated: true]',
                                        ],
                                        children: [
                                            {
                                                instruction: 'ADD',
                                                children: [
                                                    { instruction: ['INT', '1'] },
                                                    { instruction: ['INT', '2'] },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                                children: [{ instruction: ['ENDPOINT', '@test'] }],
                            },
                        ],
                    },
                ],
                children: [{ instruction: ['ENDPOINT', '@example'] }],
            },
        ],
    },
    null,
];

export const MOCK_FLAT: FlatResult = [
    [
        ['SHORT_STATEMENTS', '[count: 3, terminated: false]'],
        'PUSH_TO_STACK',
        ['INT', '5'],
        'PUSH_TO_STACK',
        ['INT', '42'],
        [
            'REMOTE_EXECUTION',
            '[length: 73, injected_variables: []]',
            [
                ['SHORT_STATEMENTS', '[count: 4, terminated: true]'],
                ['INT', '1'],
                ['INT', '2'],
                ['INT', '3'],
                [
                    'REMOTE_EXECUTION',
                    '[length: 18, injected_variables: []]',
                    [
                        ['SHORT_STATEMENTS', '[count: 1, terminated: true]'],
                        'ADD',
                        ['INT', '1'],
                        ['INT', '2'],
                    ],
                ],
                ['ENDPOINT', '@test'],
            ],
        ],
        ['ENDPOINT', '@example'],
    ],
    null,
];
