import { describe, expect, it, expectTypeOf, test } from 'vitest';
import {
    parseNodeTree,
    maxXPosition,
    maxYPosition,
} from '../../../src/composable/NodeTree/parseNodeTree';
import type { Node, NodeTree, Position } from '../../../src/types/NodeTree/node-tree';

describe('parseNodeTree', () => {
    describe('nodes', () => {
        describe('missing attributes', () => {
            test.each([
                { input: { nodes: [{ name: 'hi' }] }, description: 'only name' },
                { input: { nodes: [{ id: 'abc' }] }, description: 'only id' },
                { input: { nodes: [{ fields: [{ in: false }] }] }, description: 'only fields' },
                { input: { nodes: [{ position: { x: 0, y: 0 } }] }, description: 'only position' },
            ])('should define other missing attributes when node has $description', ({ input }) => {
                const result = parseNodeTree(input);
                expectTypeOf(result).toEqualTypeOf<NodeTree>();
                expect(result.nodes).toBeDefined();
                result.nodes.forEach((node: Node) => {
                    expect(node.id).toBeDefined();
                    expectTypeOf(node.id).toEqualTypeOf<string>();
                    expect(node.fields).toBeDefined();
                    expect(node.position).toBeDefined();
                });
            });
        });

        describe('ids', () => {
            test.each([
                { input: { nodes: [{}, {}] }, description: 'ids are not defined' },
                { input: { nodes: [{ id: '' }, { id: '' }] }, description: 'id strings are empty' },
                {
                    input: { nodes: [{ id: 'abc' }, { id: '' }] },
                    description: 'some ids are missing',
                },
            ])('should create unique node ids when $description', ({ input }) => {
                const result = parseNodeTree(input);
                const nodeIds: string[] = result.nodes.map((node: Node) => node.id);
                expect(new Set(nodeIds).size).toBe(nodeIds.length);
            });

            it('should throw an error when there are duplicate ids between two nodes', () => {
                expect(() => parseNodeTree({ nodes: [{ id: 'abc' }, { id: 'abc' }] })).toThrow();
            });
        });

        describe('positions', () => {
            test.each([
                {
                    input: { nodes: [{ position: { x: 0, y: 0 } }] },
                    description: 'coordinates are in bounds',
                },
                {
                    input: { nodes: [{ position: { x: maxXPosition + 1, y: maxYPosition + 1 } }] },
                    description: 'coordinates are too big',
                },
                {
                    input: { nodes: [{ position: { x: -1, y: -1 } }] },
                    description: 'coordinates are negative',
                },
                {
                    input: { nodes: [{ position: { x: 0 } }, { position: { y: 0 } }] },
                    description: 'coordinates are missing',
                },
                {
                    input: { nodes: [{ position: { x: 'hi', y: -1 } }] },
                    description: 'coordinates are not correct type',
                },
            ])('should create usable positions when the $description', ({ input }) => {
                const result = parseNodeTree(input);
                const nodePositions: Position[] = result.nodes.map((node: Node) => node.position);
                nodePositions.forEach((p) => {
                    expect(p.x).toBeGreaterThanOrEqual(0);
                    expect(p.y).toBeGreaterThanOrEqual(0);
                    expect(p.x).toBeLessThanOrEqual(maxXPosition);
                    expect(p.y).toBeLessThanOrEqual(maxYPosition);
                });
            });
        });
    });

    describe('fields', () => {
        describe('missing attributes', () => {
            test.each([
                { input: { nodes: [{}] }, description: 'no fields array initialized' },
                { input: { nodes: [{ fields: [] }] }, description: 'fields are empty' },
                {
                    input: { nodes: [{ fields: [{ id: 'abc', in: true }] }] },
                    description: 'fields have id and in',
                },
                {
                    input: { nodes: [{ fields: [{ id: 'abc', in: true, out: false }] }] },
                    description: 'fields have id, in, and out',
                },
                { input: { nodes: [{ fields: [{ id: '' }] }] }, description: 'field id is empty' },
                {
                    input: { nodes: [{ fields: [{ in: true }] }] },
                    description: 'field id is missing',
                },
            ])('should create valid fields when $description', ({ input }) => {
                const result = parseNodeTree(input);
                result.nodes.forEach((node: Node) => {
                    expect(node.fields).toBeDefined();
                    node.fields.forEach((field) => {
                        expect(field.id).toBeDefined();
                        expectTypeOf(field.id).toEqualTypeOf<string>();
                        expect(field.in).toBeDefined();
                        expectTypeOf(field.in).toEqualTypeOf<boolean>();
                    });
                });
            });
        });

        describe('ids', () => {
            test.each([
                {
                    input: { nodes: [{ fields: [{}] }, { fields: [{}] }] },
                    description: 'ids are not defined',
                },
                {
                    input: { nodes: [{ fields: [{ id: '' }] }, { fields: [{ id: '' }] }] },
                    description: 'id strings are empty',
                },
                {
                    input: { nodes: [{ fields: [{ id: 'abc' }] }, { fields: [{ id: '' }] }] },
                    description: 'some ids are missing',
                },
            ])('should create unique field ids when $description', ({ input }) => {
                const result = parseNodeTree(input);
                const fieldIds: string[] = result.nodes.map((node: Node) => node.fields).flat();
                expect(new Set(fieldIds).size).toBe(fieldIds.length);
            });

            // field ids duplicate
            it('should throw an error when there are duplicate ids between two fields', () => {
                expect(() =>
                    parseNodeTree({
                        nodes: [{ fields: [{ id: 'abc' }] }, { fields: [{ id: 'abc' }] }],
                    }),
                ).toThrow();
            });
        });
    });

    describe('edges', () => {
        describe('ids', () => {
            test.each([
                {
                    input: {
                        nodes: [{ id: 'def' }, { id: 'ghi' }, { id: 'jkl' }, { id: 'mno' }],
                        edges: [
                            {
                                source: { kind: 'node', nodeId: 'def' },
                                target: { kind: 'node', nodeId: 'ghi' },
                            },
                            {
                                id: '',
                                source: { kind: 'node', nodeId: 'def' },
                                target: { kind: 'node', nodeId: 'ghi' },
                            },
                        ],
                    },
                    description: 'no edge ids',
                },
                {
                    input: {
                        nodes: [{ id: 'def' }, { id: 'ghi' }, { id: 'jkl' }, { id: 'mno' }],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'node', nodeId: 'def' },
                                target: { kind: 'node', nodeId: 'ghi' },
                            },
                            {
                                id: 'pqr',
                                source: { kind: 'node', nodeId: 'def' },
                                target: { kind: 'node', nodeId: 'ghi' },
                            },
                        ],
                    },
                    description: 'unique edge ids',
                },
            ])('should return a NodeTree for valid edges with $description', ({ input }) => {
                const result = parseNodeTree(input);
                const edgeIds = result.edges.map((edge: Edge) => edge.id);
                expect(new Set(edgeIds).size).toBe(edgeIds.length);
            });

            it('should throw an error when there are duplicate ids between two edges', () => {
                expect(() =>
                    parseNodeTree({
                        nodes: [{ id: 'def' }, { id: 'ghi' }, { id: 'jkl' }, { id: 'mno' }],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'node', nodeId: 'def' },
                                target: { kind: 'node', nodeId: 'ghi' },
                            },
                            {
                                id: 'abc',
                                source: { kind: 'node', nodeId: 'def' },
                                target: { kind: 'node', nodeId: 'ghi' },
                            },
                        ],
                    }),
                ).toThrow();
            });
        });

        describe('source/target', () => {
            test.each([
                {
                    input: {
                        nodes: [{ id: 'abc' }, { id: 'def' }],
                        edges: [{ id: 'ghi', source: { kind: 'node', nodeId: 'abc' } }],
                    },
                    description: 'edge is missing target',
                },
                {
                    input: {
                        nodes: [{ id: 'abc' }, { id: 'def' }],
                        edges: [{ id: 'ghi', target: { kind: 'node', nodeId: 'def' } }],
                    },
                    description: 'edge is missing source',
                },
                {
                    input: {
                        nodes: [{ id: 'abc' }, { id: 'def' }],
                        edges: [{ id: 'ghi' }],
                    },
                    description: 'edge is missing source and target',
                },
            ])('should throw an error when $description', ({ input }) => {
                expect(() => parseNodeTree(input)).toThrow();
            });

            test.each([
                {
                    input: {
                        nodes: [{ id: 'def' }, { id: 'ghi' }],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'node', nodeId: 'def' },
                                target: { kind: 'node', nodeId: 'ghi' },
                            },
                        ],
                    },
                    description: 'source and target point to nodes',
                },
                {
                    input: {
                        nodes: [
                            { fields: [{ id: 'def', out: true }] },
                            { fields: [{ id: 'ghi', in: true }] },
                        ],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'field', fieldId: 'def' },
                                target: { kind: 'field', fieldId: 'ghi' },
                            },
                        ],
                    },
                    description: 'source and target point to fields with correct in/out values',
                },
                {
                    input: {
                        nodes: [{ id: 'def' }, { fields: [{ id: 'ghi', in: true }] }],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'node', nodeId: 'def' },
                                target: { kind: 'field', fieldId: 'ghi' },
                            },
                        ],
                    },
                    description: 'source points to node and target points to field',
                },
            ])('should return NodeTree when $description', ({ input }) => {
                const result = parseNodeTree(input);
                const nodeIds: string[] = result.nodes.map((node: Node) => node.id);
                const fieldInIds: string[] = result.nodes.flatMap((node: Node) =>
                    node.fields.filter((field) => field.in).map((field) => field.id),
                );
                const fieldOutIds: string[] = result.nodes.flatMap((node: Node) =>
                    node.fields.filter((field) => field.out).map((field) => field.id),
                );
                result.edges.forEach((edge: Edge) => {
                    if (edge.source.kind === 'node') {
                        expect(nodeIds).toContain(edge.source.nodeId);
                    } else if ((edge.source.kind = 'field')) {
                        expect(fieldOutIds).toContain(edge.source.fieldId);
                    }

                    if (edge.target.kind === 'node') {
                        expect(nodeIds).toContain(edge.target.nodeId);
                    } else if ((edge.target.kind = 'field')) {
                        expect(fieldInIds).toContain(edge.target.fieldId);
                    }
                });
            });

            test.each([
                {
                    input: {
                        nodes: [
                            { fields: [{ id: 'def', out: false }] },
                            { fields: [{ id: 'ghi', in: true }] },
                        ],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'field', fieldId: 'def' },
                                target: { kind: 'field', fieldId: 'ghi' },
                            },
                        ],
                    },
                    description: 'source points to field with false out value',
                },
                {
                    input: {
                        nodes: [
                            { fields: [{ id: 'def', out: true }] },
                            { fields: [{ id: 'ghi', in: false }] },
                        ],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'field', fieldId: 'def' },
                                target: { kind: 'field', fieldId: 'ghi' },
                            },
                        ],
                    },
                    description: 'target points to field with false in value',
                },
            ])('should throw an error when $description', ({ input }) => {
                expect(() => parseNodeTree(input)).toThrow();
            });

            test.each([
                {
                    input: {
                        nodes: [
                            { id: 'abc', fields: [{ id: 'ghi', out: true }] },
                            { id: 'def', fields: [{ id: 'jkl', in: true }] },
                        ],
                        edges: [
                            {
                                id: 'mno',
                                source: { fieldId: 'ghi' },
                                target: { fieldId: 'jkl' },
                            },
                        ],
                    },
                    description: 'source and target only have fieldId defined',
                },
            ])('should return NodeTree when $description', ({ input }) => {
                const result = parseNodeTree(input);
                expect(result.edges[0].source.kind).toBe('field');
                expect(result.edges[0].target.kind).toBe('field');
                expect(result.edges[0].source.nodeId).toBe('abc');
                expect(result.edges[0].target.nodeId).toBe('def');
            });
        });
    });

    describe('general', () => {
        describe('missing attributes', () => {
            // empty inputs
            test.each([
                { input: {}, description: 'empty NodeTreeInput' },
                { input: { nodes: [] }, description: 'empty nodes' },
                { input: { edges: [] }, description: 'empty edges' },
                { input: { nodes: [], edges: [] }, description: 'empty nodes and edges' },
            ])(
                'should return a NodeTree with empty node and edge arrays for $description',
                ({ input }) => {
                    const result = parseNodeTree(input);
                    expectTypeOf(result).toEqualTypeOf<NodeTree>();
                    expect(result.nodes).toBeDefined();
                    expect(result.edges).toBeDefined();
                    expect(Array.isArray(result.nodes)).toBe(true);
                    expect(Array.isArray(result.edges)).toBe(true);
                    expect(result.nodes).toEqual([]);
                    expect(result.edges).toEqual([]);
                },
            );
        });

        describe('ids', () => {
            test.each([
                {
                    input: {
                        nodes: [
                            {},
                            { id: 'def' },
                            { fields: [{ id: 'ghi', in: true }] },
                            { fields: [{}] },
                        ],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'node', nodeId: 'def' },
                                target: { kind: 'field', fieldId: 'ghi' },
                            },
                        ],
                    },
                    description: 'no ids are set in some nodes/fields/edges',
                },
                {
                    input: {
                        nodes: [{ id: 'def' }, { fields: [{ id: 'ghi', in: true }] }],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'node', nodeId: 'def' },
                                target: { kind: 'field', fieldId: 'ghi' },
                            },
                        ],
                    },
                    description: 'unique ids are set in all nodes/fields/edges',
                },
            ])('all ids across the whole tree should be unique when $description', ({ input }) => {
                const result = parseNodeTree(input);
                const nodeIds = result.nodes.map((node: Node) => node.id);
                const fieldIds: string[] = result.nodes.flatMap((node: Node) =>
                    node.fields.map((field) => field.id),
                );
                const edgeIds = result.edges.map((edge: Edge) => edge.id);
                const allIds = nodeIds.concat(fieldIds).concat(edgeIds);
                expect(new Set(allIds).size).toBe(allIds.length);
            });

            test.each([
                {
                    input: {
                        nodes: [{ id: 'abc' }, { fields: [{ id: 'abc', in: true }] }],
                        edges: [
                            {
                                id: 'def',
                                source: { kind: 'node', nodeId: 'abc' },
                                target: { kind: 'node', nodeId: 'abc' },
                            },
                        ],
                    },
                    description: 'node and field ids are the same',
                },
                {
                    input: {
                        nodes: [{ id: 'abc' }, { fields: [{ id: 'def', in: true }] }],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'node', nodeId: 'abc' },
                                target: { kind: 'node', nodeId: 'abc' },
                            },
                        ],
                    },
                    description: 'node and edge ids are the same',
                },
                {
                    input: {
                        nodes: [{ id: 'abc' }, { fields: [{ id: 'def', in: true }] }],
                        edges: [
                            {
                                id: 'def',
                                source: { kind: 'node', nodeId: 'abc' },
                                target: { kind: 'node', nodeId: 'abc' },
                            },
                        ],
                    },
                    description: 'field and edge ids are the same',
                },
                {
                    input: {
                        nodes: [{ id: 'abc' }, { fields: [{ id: 'abc', in: true }] }],
                        edges: [
                            {
                                id: 'abc',
                                source: { kind: 'node', nodeId: 'abc' },
                                target: { kind: 'node', nodeId: 'abc' },
                            },
                        ],
                    },
                    description: 'node and field and edge ids are the same',
                },
            ])('should throw an error when $description', ({ input }) => {
                expect(() => parseNodeTree(input)).toThrow();
            });
        });
    });
});
