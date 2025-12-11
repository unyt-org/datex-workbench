import { describe, expect, it, expectTypeOf, test } from 'vitest';
import {
    parseNodeTree,
    maxXPosition,
    maxYPosition,
} from '../../../src/composable/NodeTree/parseNodeTree';
// import type { Node } from '@/types/node-tree';
import type { Edge, Node, NodeTree, Position } from '../../../src/types/NodeTree/node-tree';

describe('parseNodeTree', () => {
    // empty inputs
    test.each([
        { input: {}, description: 'empty NodeTreeInput' },
        { input: { nodes: [] }, description: 'empty nodes' },
        { input: { edges: [] }, description: 'empty edges' },
        { input: { nodes: [], edges: [] }, description: 'empty nodes and edges' },
    ])('should return a NodeTree with empty node and edge arrays for $description', ({ input }) => {
        const result = parseNodeTree(input);
        expectTypeOf(result).toEqualTypeOf<NodeTree>();
        expect(result.nodes).toBeDefined();
        expect(result.edges).toBeDefined();
        expect(Array.isArray(result.nodes)).toBe(true);
        expect(Array.isArray(result.edges)).toBe(true);
        expect(result.nodes).toEqual([]);
        expect(result.edges).toEqual([]);
    });

    // inputs with minimal nodes
    test.each([
        { input: { nodes: [{ name: 'hi' }] }, description: 'node with name' },
        { input: { nodes: [{ id: 'abc' }] }, description: 'node with id' },
        { input: { nodes: [{ fields: [{ in: false }] }] }, description: 'node with fields' },
        { input: { nodes: [{ position: { x: 0, y: 0 } }] }, description: 'node with position' },
    ])('should return a NodeTree for $description', ({ input }) => {
        const result = parseNodeTree(input);
        expectTypeOf(result).toEqualTypeOf<NodeTree>();
        expect(result.nodes).toBeDefined();
        expect(result.nodes.length).toBeGreaterThan(0);
        expect(result.nodes[0].id).toBeDefined();
        expectTypeOf(result.nodes[0].id).toEqualTypeOf<string>();
        expect(result.nodes[0].fields).toBeDefined();
        expect(result.nodes[0].position).toBeDefined();
    });

    // nodes
    // node ids
    test.each([
        { input: { nodes: [{}, {}] }, description: 'ids are not defined' },
        { input: { nodes: [{ id: '' }, { id: '' }] }, description: 'id strings are empty' },
        { input: { nodes: [{ id: 'abc' }, { id: '' }] }, description: 'some ids are missing' },
    ])('should return NodeTree with unique ids when $description', ({ input }) => {
        const result = parseNodeTree(input);
        const nodeIds: string[] = result.nodes.map((node: Node) => node.id);
        expect(new Set(nodeIds).size).toBe(nodeIds.length);
    });

    // node ids duplicate
    it('should throw an error when there are duplicate ids between two nodes', () => {
        expect(() => parseNodeTree({ nodes: [{ id: 'abc' }, { id: 'abc' }] })).toThrow();
    });

    // node positions
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
    ])('should return NodeTree with usable positions when the $description', ({ input }) => {
        const result = parseNodeTree(input);
        const nodePositions: Position[] = result.nodes.map((node: Node) => node.position);
        nodePositions.forEach((p) => {
            expect(p.x).toBeGreaterThanOrEqual(0);
            expect(p.y).toBeGreaterThanOrEqual(0);
            expect(p.x).toBeLessThanOrEqual(maxXPosition);
            expect(p.y).toBeLessThanOrEqual(maxYPosition);
        });
    });

    // node fields
    test.each([
        { input: { nodes: [{}] }, description: 'no fields array started' },
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
        { input: { nodes: [{ fields: [{ in: true }] }] }, description: 'field id is missing' },
    ])('should return NodeTree with valid fields when $description', ({ input }) => {
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

    // field ids duplicate
    it('should throw an error when there are duplicate ids between two fields', () => {
        expect(() =>
            parseNodeTree({ nodes: [{ field: [{ id: 'abc' }] }, { field: [{ id: 'abc' }] }] }),
        ).toThrow();
    });

    // edges
    // edge ids
    test.each([
        {
            input: {
                nodes: [{ id: 'def' }, { id: 'ghi' }, { id: 'jkl' }, { id: 'mno' }],
                edges: [
                    { sourceId: 'jkl', targetId: 'mno' },
                    { id: '', sourceId: 'def', targetId: 'ghi' },
                ],
            },
            description: 'no edge ids',
        },
        {
            input: {
                nodes: [{ id: 'def' }, { id: 'ghi' }, { id: 'jkl' }, { id: 'mno' }],
                edges: [
                    { id: 'abc', sourceId: 'def', targetId: 'ghi' },
                    { id: 'uvw', sourceId: 'jkl', targetId: 'mno' },
                ],
            },
            description: 'unique edge ids',
        },
    ])('should return a NodeTree for valid edges with $description', ({ input }) => {
        const result = parseNodeTree(input);
        const edgeIds = result.edges.map((edge: Edge) => edge.id);
        expect(new Set(edgeIds).size).toBe(edgeIds.length);
    });

    // edge ids duplicate
    it('should throw an error when there are duplicate ids between two nodes', () => {
        expect(() =>
            parseNodeTree({
                nodes: [{ id: 'def' }, { id: 'ghi' }, { id: 'jkl' }, { id: 'mno' }],
                edges: [
                    { id: 'abc', sourceId: 'def', targetId: 'ghi' },
                    { id: 'abc', sourceId: 'jkl', targetId: 'mno' },
                ],
            }),
        ).toThrow();
    });

    // edge sourceId and targetId missing
    test.each([
        {
            input: { nodes: [{ id: 'def' }], edges: [{ id: 'abc', sourceId: 'def' }] },
            description: 'edge is missing targetId',
        },
        {
            input: { nodes: [{ id: 'def' }], edges: [{ id: 'abc', targetId: 'def' }] },
            description: 'edge is missing sourceId',
        },
        { input: { edges: [{ id: 'abc' }] }, description: 'edge is missing sourceId and targetId' },
    ])('should throw an error when $description', ({ input }) => {
        expect(() => parseNodeTree(input)).toThrow();
    });

    // edge sourceId and targetId pointing to node or field (with correct in/out boolean value)
    test.each([
        {
            input: {
                nodes: [{ id: 'def' }, { id: 'ghi' }],
                edges: [{ id: 'abc', sourceId: 'def', targetId: 'ghi' }],
            },
            description: 'sourceId and targetId point to node ids',
        },
        {
            input: {
                nodes: [
                    { fields: [{ id: 'def', out: true }] },
                    { fields: [{ id: 'ghi', in: true }] },
                ],
                edges: [{ id: 'abc', sourceId: 'def', targetId: 'ghi' }],
            },
            description: 'sourceId and targetId point to field ids with correct in/out values',
        },
        {
            input: {
                nodes: [{ id: 'def' }, { fields: [{ id: 'ghi', in: true }] }],
                edges: [{ id: 'abc', sourceId: 'def', targetId: 'ghi' }],
            },
            description: 'sourceId points to node id and targetId points to field id',
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
            expect(nodeIds.concat(fieldOutIds)).toContain(edge.sourceId);
            expect(nodeIds.concat(fieldInIds)).toContain(edge.targetId);
        });
    });

    test.each([
        // this first one might be changed depending on if we want the parseFunction to infer that a field is being sourced from or targeted
        {
            input: {
                nodes: [{ fields: [{ id: 'def' }] }, { fields: [{ id: 'ghi' }] }],
                edges: [{ id: 'abc', sourceId: 'def', targetId: 'ghi' }],
            },
            description: 'sourceId and targetId point to field without in/out values',
        },
        {
            input: {
                nodes: [
                    { fields: [{ id: 'def', out: false }] },
                    { fields: [{ id: 'ghi', in: true }] },
                ],
                edges: [{ id: 'abc', sourceId: 'def', targetId: 'ghi' }],
            },
            description: 'sourceId and targetId point to field with false out value',
        },
        {
            input: {
                nodes: [
                    { fields: [{ id: 'def', out: true }] },
                    { fields: [{ id: 'ghi', in: false }] },
                ],
                edges: [{ id: 'abc', sourceId: 'def', targetId: 'ghi' }],
            },
            description: 'sourceId and targetId point to field with false in value',
        },
    ])('should throw an error when $description', ({ input }) => {
        expect(parseNodeTree(input)).toThrow();
    });

    test.each([
        {
            input: {
                nodes: [{}, { id: 'def' }, { fields: [{ id: 'ghi', in: true }] }, { fields: [{}] }],
                edges: [
                    { id: 'abc', sourceId: 'def', targetId: 'ghi' },
                    { sourceId: 'def', targetId: 'ghi' },
                ],
            },
            description: 'no ids are set in some nodes/fields/edges',
        },
        {
            input: {
                nodes: [{ id: 'def' }, { fields: [{ id: 'ghi', in: true }] }],
                edges: [{ id: 'abc', sourceId: 'def', targetId: 'ghi' }],
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

    // node and field and edge ids duplicate
    test.each([
        {
            input: {
                nodes: [{ id: 'abc' }, { fields: [{ id: 'abc', in: true }] }],
                edges: [{ id: 'def', sourceId: 'abc', targetId: 'abc' }],
            },
            description: 'node and field ids are the same',
        },
        {
            input: {
                nodes: [{ id: 'abc' }, { fields: [{ id: 'def', in: true }] }],
                edges: [{ id: 'abc', sourceId: 'abc', targetId: 'def' }],
            },
            description: 'node and edge ids are the same',
        },
        {
            input: {
                nodes: [{ id: 'def' }, { fields: [{ id: 'abc', in: true }] }],
                edges: [{ id: 'abc', sourceId: 'def', targetId: 'abc' }],
            },
            description: 'field and edge ids are the same',
        },
        {
            input: {
                nodes: [{ id: 'abc' }, { fields: [{ id: 'abc', in: true }] }],
                edges: [{ id: 'abc', sourceId: 'abc', targetId: 'abc' }],
            },
            description: 'node and field and edge ids are the same',
        },
    ])('should throw an error when $description', ({ input }) => {
        expect(() => parseNodeTree(input)).toThrow();
    });
});
