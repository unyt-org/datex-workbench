import { describe, expect, it } from 'vitest';
import { parseNodeTree } from '../../../src/composable/NodeTree/parseNodeTree';
import exampleJson from './fixtures/validExampleShort.json';

describe('parseNodeTree', () => {
  it('should parse a valid NodeTree JSON', () => {
    const result = parseNodeTree(exampleJson);

    expect(result).toEqual(expect.objectContaining({
      nodes: expect.any(Array),
      edges: expect.any(Array),
    }));

    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges.length).toBeGreaterThan(0);
  });

  it('should throw an error for invalid input', () => {
    expect(() => parseNodeTree({})).toThrow('Invalid NodeTree JSON');
  });
});
