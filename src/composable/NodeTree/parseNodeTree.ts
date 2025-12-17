import type { NodeTree } from '@/types/NodeTree/node-tree';
import type {
    NodeTreeInput,
    NodeInput,
    NodeFieldInput,
    EdgeInput,
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

        if (edge.source.kind === 'field') {
            // check if the field id matches with any field
            // if so on, go to see if there is a nodeId already provided
            // if not, infer the nodeId from the found field
            // if yes, check if the nodId also matches with the one from the found field
        } else if (edge.source.kind === 'node') {
            // check if the provided nodeId matches with any of the nodes
        }

        if (edge.source.kind === undefined) {
            if ('fieldId' in edge.source) {
                // do all the checks similar to the way we did when kind was set to 'field'
            } else if ('nodeId' in edge.source) {
                // check the same way we checked when kind was set to 'node'
            } else {
                throw new Error(
                    `no kind or fieldId or nodeId provided for source of edge ${edge.id}`,
                );
            }
        }

        /*
        if (!nodeIds.includes(edge.sourceId) && !fieldIds.includes(edge.sourceId)) {
            throw new Error(
                `source ${edge.sourceId} of edge with id ${edge.id} does not exist in any node or field.`,
            );
        }
        if (!nodeIds.includes(edge.targetId) && !fieldIds.includes(edge.targetId)) {
            throw new Error(
                `target ${edge.targetId} of  edge with id ${edge.id} does not exist in any node or field.`,
            );
        }

        if (tree === undefined || tree.nodes === undefined) {
            return;
        }
        const fieldsArray = tree.nodes.map((node) => node.fields).flat();

        if (fieldsArray.some((field) => field.id === edge.sourceId && field.out === false))
            throw new Error(
                `The edge with id "${edge.id}" has its sourceId set to "${edge.sourceId}". This field can't be sourced from because its field.out value is set to false.`,
            );

        if (fieldsArray.some((field) => field.id === edge.targetId && field.in === false))
            throw new Error(
                `The edge with id "${edge.id}" has its targetId set to "${edge.targetId}". This field can't be targeted because its field.in value is set to false.`,
            );
            */
    });

    const treeOut = tree as NodeTree;

    return treeOut;
}
