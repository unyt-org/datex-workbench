import { describe, expect, it } from 'vitest';
import {
    parseNodeTree,
    maxXPosition,
    maxYPosition,
} from '../../../src/composable/NodeTree/parseNodeTree';
// import type { Node } from '@/types/node-tree';
import type { Node } from '../../../src/types/NodeTree/node-tree';
import nodeWithoutNameAttribute from './fixtures/nodeWithoutNameAttribute.json';
import nodeWithEmptyNameValue from './fixtures/nodeWithEmptyNameValue.json';
import nodeWithDuplicateIds from './fixtures/nodeWithDuplicateIds.json';
import nodesWithoutIds from './fixtures/nodesWithoutIds.json';
import nodesWithInvalidPositions from './fixtures/nodesWithInvalidPositions.json';
/*
import nodesWithInvalidFields from './fixtures/nodesWithInvalidFields.json';
import edgesWithInvalidIds from './fixtures/edgesWithInvalidIds.json';
import edgesWithInvalidSourceTarget from './fixtures/edgesWithInvalidSourceTarget.json';
*/

// in meinen tests die minimal examples, bestehend aus nur einer node oder so einfach inline schreiben

describe('parseNodeTree', () => {
    // node array and edge array
    it('should create a node array and edge array on empty input', () => {
        const result = parseNodeTree({});

        expect(result).toHaveProperty('nodes');
        expect(result).toHaveProperty('edges');
        expect(result).toEqual(
            expect.objectContaining({
                nodes: expect.any(Array),
                edges: expect.any(Array),
            }),
        );
    });

    // node names
    it('should not throw an error if no name is provided', () => {
        expect(() => parseNodeTree(nodeWithoutNameAttribute)).toThrow();
    });

    it('should throw an error for nodes with empty string for name', () => {
        expect(() => parseNodeTree(nodeWithEmptyNameValue)).toThrow();
    });

    // node ids
    it('should generate a unique id when no id is provided', () => {
        const result = parseNodeTree(nodesWithoutIds);

        const nodeIds = result.nodes.map((node: Node) => node.id);
        expect(nodeIds).toEqual(expect.arrayContaining([expect.any(String)]));
        expect(new Set(nodeIds).size).toBe(nodeIds.length);
    });

    it('should throw an error when there are duplicate ids between two nodes', () => {
        expect(() => parseNodeTree(nodeWithDuplicateIds)).toThrow();
    });

    // node positions
    it('should set default positions for nodes with invalid or missing positions', () => {
        const result = parseNodeTree(nodesWithInvalidPositions);
        result.nodes.forEach((node: Node) => {
            expect(node.position.x).toBeGreaterThanOrEqual(0);
            expect(node.position.x).toBeLessThanOrEqual(maxXPosition);
            expect(node.position.y).toBeGreaterThanOrEqual(0);
            expect(node.position.y).toBeLessThanOrEqual(maxYPosition);
        });
    });

    /*
    // Node fields
    it('should ensure each field has a name', () => {
        const result = parseNodeTree(nodesWithInvalidFields);
        result.nodes.forEach((node: Node) => {
            node.fields?.forEach((field) => {
                expect(field.name).toBeDefined();
                expect(typeof field.name).toBe('string');
            });
        });
    });

    it('should ensure each field has a unique ID', () => {
        const result = parseNodeTree(nodesWithInvalidFields);
        const fieldIds = result.nodes.flatMap((node) => node.fields?.map((field) => field.id) || []);
        expect(new Set(fieldIds).size).toBe(fieldIds.length);
    });

    it('should set default values for missing `in` and `out` in fields', () => {
        const result = parseNodeTree(nodesWithInvalidFields);
        result.nodes.forEach((node) => {
            node.fields?.forEach((field) => {
                expect(field.in).toBeDefined();
                expect(field.out).toBeDefined();
                expect(typeof field.in).toBe('boolean');
                expect(typeof field.out).toBe('boolean');
            });
        });
    });

    // Edges
    it('should ensure edges have unique IDs', () => {
        const result = parseNodeTree(edgesWithInvalidIds);
        const edgeIds = result.edges.map((edge) => edge.id);
        expect(new Set(edgeIds).size).toBe(edgeIds.length);
    });

    it('should ensure edges have valid sourceId and targetId', () => {
        expect(() => parseNodeTree(edgesWithInvalidSourceTarget)).toThrow();
    });
    */
});
