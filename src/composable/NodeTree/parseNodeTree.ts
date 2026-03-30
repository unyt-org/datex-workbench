import type { NodeTree } from '@/types/NodeTree/node-tree';
import type {
    NodeTreeInput,
    NodeInput,
    NodeFieldInput,
    EdgeInput,
    FieldConnectorInput,
    ConnectorInput,
    Position,
} from '@/types/NodeTree/node-tree-input';

export const maxXPosition = 700;
export const maxYPosition = 600;

export function parseNodeTree(treeIn: NodeTreeInput): NodeTree {
    if (typeof treeIn !== 'object' || treeIn === null || treeIn === undefined) {
        throw new Error('Invalid NodeTree JSON');
    }
    const tree = structuredClone(treeIn);

    if (tree.nodes === undefined) {
        tree.nodes = [];
    }
    if (tree.edges === undefined) {
        tree.edges = [];
    }

    const nodeIds: string[] = [];
    const fieldIds: string[] = [];
    const edgeIds: string[] = [];

    function generateUniqueId(): string {
        let rand = (Math.random() + 1).toString(36).split('.')[1];
        if (
            rand === undefined ||
            nodeIds.includes(rand) ||
            fieldIds.includes(rand) ||
            edgeIds.includes(rand)
        )
            rand = generateUniqueId();
        return rand;
    }

    tree.nodes.map((node) => {
        if (node.name === undefined || node.name === '') {
            node.name = undefined;
        }
        checkId(node, nodeIds);
        node.position = checkPosition(node.position);
        node.fields = checkFields(node.fields);
    });

    tree.edges.map((edge) => {
        checkId(edge, edgeIds);

  // Set default direction if not provided
  if (!edge.direction) {
    edge.direction = 'bidirectional'
}

// Validate direction
if (edge.direction !== 'unidirectional' && edge.direction !== 'bidirectional') {
    edge.direction = 'bidirectional'
}

// Set default style if not provided
if (!edge.style) {
    edge.style = 'bezier'
}

// Validate style
if (!['bezier', 'straight', 'step'].includes(edge.style)) {
    edge.style = 'bezier'
}



   if (!checkConnector(edge.source, true))
     throw new Error(
        `no correct combination of kind, fieldId or nodeId provided for source of edge ${edge.id}`,
    );

   if (!checkConnector(edge.target, false))
        throw new Error(
       `no correct combination of kind, fieldId or nodeId provided for target of edge ${edge.id}`,
    );
    });

    function checkId(item: NodeInput | NodeFieldInput | EdgeInput, ids: string[]) {
        if (item.id === undefined || item.id === '') {
            const id = generateUniqueId();
            ids.push(id);
            item.id = id;
            return;
        }
        if (nodeIds.includes(item.id) || fieldIds.includes(item.id) || edgeIds.includes(item.id)) {
            throw new Error(
                `The provided NodeTree has the value with id "${item.id}" at least twice.`,
            );
        }
        ids.push(item.id);
    }

    function checkPosition(pos: Position | undefined): Position {
        pos = pos ?? {
            x: Math.floor(Math.random() * maxXPosition),
            y: Math.floor(Math.random() * maxYPosition),
        };
        if (pos.x === undefined || typeof pos.x !== 'number')
            pos.x = Math.floor(Math.random() * maxXPosition);
        if (pos.y === undefined || typeof pos.y !== 'number')
            pos.y = Math.floor(Math.random() * maxYPosition);
        if (pos.x < 0) pos.x = 0
        if (pos.y < 0) pos.y = 0

        return pos;
    }

    function checkFields(fie: NodeFieldInput[] | undefined): NodeFieldInput[] {
        fie = fie ?? [];

        fie.map((field) => {
            if (field.name === undefined || field.name === '') {
                field.name = undefined;
            }

            checkId(field, fieldIds);

            if (typeof field.in !== 'boolean') {
                field.in = true;
            }
            if (typeof field.out !== 'boolean') {
                field.out = true;
            }
        });
        return fie;
    }

    function checkConnector(con: ConnectorInput, isSource: boolean): boolean {
        if (typeof con === 'undefined') return false;

        if (
            ('kind' in con && con.kind === 'field' && typeof con.fieldId !== 'undefined') ||
            'fieldId' in con
        ) {
            // this needs to be cast or otherwise typescript doesn't always recognize that fieldId exists
            const sourceField = con as FieldConnectorInput;
            if (!fieldIds.includes(sourceField.fieldId)) {
                throw new Error(
                    `edge.source.kind is set to "field" but the provided fieldId does not exist as a field`,
                );
            }

            if (typeof sourceField.nodeId !== 'undefined') {
                const n = tree.nodes?.find((node) => node.id === sourceField.nodeId);
                if (!n) throw new Error("the provided nodeId doesn't exist with provided fieldId");
                if (!n.fields?.some((field) => field.id === sourceField.fieldId))
                    throw new Error('the provided nodeId doesnt match with provided fieldId');
            } else {
                const n = tree.nodes?.find((node) => {
                    return node.fields?.some((field) => field.id === sourceField.fieldId);
                });
                con.nodeId = n?.id;
            }

            // Also need to check if the in or out value for that field is correctly set
            if (
                !tree.nodes?.some((node) => {
                    return node.fields?.some(
                        (field) => field.id === con.fieldId && (isSource ? field.out : field.in),
                    );
                })
            ) {
                throw new Error(`in and out values aren't correctly set for the fields`);
            }

            con.kind = 'field';
            return true;
        }
        if (
            ('kind' in con && con.kind === 'node' && typeof con.nodeId !== 'undefined') ||
            'nodeId' in con
        ) {
            if ('fieldId' in con) return false;
            if (!nodeIds.includes(con.nodeId))
                throw new Error(
                    `the provided node with nodeId ${con.nodeId} doesn't exist in the tree`,
                );
            con.kind = 'node';
            return true;
        }
        return false;
    }

    const treeOut = tree as NodeTree;

    return treeOut;
}
