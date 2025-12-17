import type { NodeTree } from '@/types/NodeTree/node-tree';
import type {
    NodeTreeInput,
    NodeInput,
    NodeFieldInput,
    EdgeInput,
    FieldConnectorInput,
    ConnectorInput,
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

    tree.nodes.map((node) => {
        if (node.name === undefined || node.name === '') {
            node.name = undefined;
        }

        checkId(node, nodeIds);

        node.position = node.position ?? {
            x: Math.floor(Math.random() * maxXPosition),
            y: Math.floor(Math.random() * maxYPosition),
        };
        if (node.position.x === undefined || typeof node.position.x !== 'number')
            node.position.x = Math.floor(Math.random() * maxXPosition);
        if (node.position.y === undefined || typeof node.position.y !== 'number')
            node.position.y = Math.floor(Math.random() * maxYPosition);
        if (node.position.x < 0) node.position.x = 0;
        if (node.position.y < 0) node.position.y = 0;
        if (node.position.x > maxXPosition) node.position.x = maxXPosition;
        if (node.position.y > maxYPosition) node.position.y = maxYPosition;

        node.fields = node.fields ?? [];

        node.fields.map((field) => {
            field.name = field.name ?? 'name not defined';

            checkId(field, fieldIds);

            if (typeof field.in !== 'boolean') {
                field.in = true;
            }
            if (typeof field.out !== 'boolean') {
                field.out = true;
            }
        });
    });

    tree.edges.map((edge) => {
        checkId(edge, edgeIds);

        if (!checkConnector(edge.source))
            throw new Error(
                `no correct kind, fieldId or nodeId provided for source of edge ${edge.id}`,
            );

        if (!checkConnector(edge.target))
            throw new Error(
                `no correct kind, fieldId or nodeId provided for target of edge ${edge.id}`,
            );
    });

    function checkConnector(con: ConnectorInput): boolean {
        if ((con.kind === 'field' && typeof con.fieldId !== 'undefined') || 'fieldId' in con) {
            // this needs to be cast or otherwise typescript doesn't always recognize that fieldId exists
            const sourceField = con as FieldConnectorInput;
            if (!fieldIds.includes(sourceField.fieldId)) {
                throw new Error(
                    'edge source kind is set to "field" but the provided fieldId does not exist as a field',
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
            return true;
        }
        if ((con.kind === 'node' && typeof con.nodeId !== 'undefined') || 'nodeId' in con) {
            if (!nodeIds.includes(con.nodeId))
                throw new Error(
                    `the provided node with nodeId ${con.nodeId} doesn't exist in the tree`,
                );
            return true;
        }
        return false;
    }

    const treeOut = tree as NodeTree;

    return treeOut;
}
