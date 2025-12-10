import type { Edge, Node, NodeField, NodeTree } from '@/types/node-tree';

// export function parseNodeTree(treeIn: NodeTree) {
export function parseNodeTree(treeIn: NodeTree | unknown): NodeTree {
    if (!isNodeTree(treeIn)) {
        throw new Error('Invalid NodeTree JSON');
    }

    const tree = treeIn as NodeTree;
    const maxXPosition = 700;
    const maxYPosition = 600;

    const treeOut: NodeTree = structuredClone(tree);

    const allIds: string[] = [];
    const nodeAndFieldIds: string[] = [];

    function generateUniqueId(): string {
        let rand = (Math.random() + 1).toString(36).split('.')[1];
        if (rand === undefined || allIds.includes(rand)) rand = generateUniqueId();
        return rand;
    }

    function correctId(item: Node | NodeField) {
        if (item.id === undefined || item.id === '') {
            const id = generateUniqueId();
            allIds.push(id);
            nodeAndFieldIds.push(id);
            item.id = id;
            return;
        }
        if (allIds.includes(item.id)) {
            throw new Error(
                `The provided NodeTree has the value with id "${item.id}" at node/field "${item.name}" at least twice`,
            );
        }
        allIds.push(item.id);
        nodeAndFieldIds.push(item.id);
    }

    function correctEdgeId(edge: Edge) {
        if (edge.id === undefined) {
            const id = generateUniqueId();
            allIds.push(id);
            nodeAndFieldIds.push(id);
            edge.id = id;
            return;
        }
        if (allIds.includes(edge.id)) {
            throw new Error(
                `The provided NodeTree has the value with id "${edge.id}" at least twice.`,
            );
        }
        allIds.push(edge.id);
    }

    treeOut.nodes.map((node) => {
        node.name = node.name ?? 'name not defined';

        correctId(node);

        node.position = node.position ?? {
            x: Math.floor(Math.random() * maxXPosition),
            y: Math.floor(Math.random() * maxYPosition),
        };
        node.position.x = node.position.x ?? Math.floor(Math.random() * maxXPosition);
        node.position.y = node.position.y ?? Math.floor(Math.random() * maxYPosition);
        if (node.position.x < 0) node.position.x = 0;
        if (node.position.y < 0) node.position.y = 0;
        if (node.position.x > maxXPosition) node.position.x = maxXPosition;
        if (node.position.y > maxYPosition) node.position.y = maxYPosition;

        node.fields?.map((field) => {
            field.name = field.name ?? 'name not defined';

            correctId(field);

            if (typeof field.in !== 'boolean') {
                field.in = false;
            }
            if (typeof field.out !== 'boolean') {
                field.out = false;
            }
        });
    });

    treeOut.edges.map((edge) => {
        correctEdgeId(edge);

        // do we discard the edge if the id can't be found or do we leave it in?
        if (!nodeAndFieldIds.includes(edge.sourceId)) {
            throw new Error(
                `source ${edge.sourceId} of edge with id ${edge.id} does not exist in any node or field.`,
            );
        }
        if (!nodeAndFieldIds.includes(edge.targetId)) {
            throw new Error(
                `target ${edge.targetId} of  edge with id ${edge.id} does not exist in any node or field.`,
            );
        }

        // check if the field that source or target points to has its in/out value set to true
        if (
            !treeOut.nodes.some((node) =>
                node.fields?.some((field) => field.id === edge.sourceId && field.out === true),
            )
        )
            throw new Error(
                `The edge with id "${edge.id}" has its sourceId set to "${edge.sourceId}". This field can't be sourced from because its field.out value is set to false.`,
            );
        if (
            !treeOut.nodes.some((node) =>
                node.fields?.some((field) => field.id === edge.targetId && field.in === true),
            )
        )
            throw new Error(
                `The edge with id "${edge.id}" has its targetId set to "${edge.targetId}". This field can't be targeted because its field.in value is set to false.`,
            );
    });

    return treeOut;
}

function isNodeTree(data: unknown): data is NodeTree {
    if (typeof data !== 'object' || data === null) return false;
    const tree = data as NodeTree;
    return Array.isArray(tree.nodes) && Array.isArray(tree.edges);
}

export function add(numbers: string): number {
    const integers = numbers.split(',').map((x) => parseInt(x));
    const negatives = integers.filter((x) => x < 0);

    if (negatives.length > 0)
        throw new RangeError('Negatives are not allowed: ' + negatives.join(', '));

    return integers.filter((x) => x <= 1000).reduce((a, b) => a + b, 0);
}
