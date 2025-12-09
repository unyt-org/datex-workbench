import type { Edge, Node, NodeField, NodeTree } from '@/types/node-tree';

// extra
// the ids of fields of node could be expanded to also make all the ids be of the same "shape":
//    currently any string can be used as an id but
//    if we were to have the id of a field be a combination of the id of the node followed by a unique id of the field,
//    this could make the id contain more and clearer information without more overhead
// example:
//    node id: "haha123"
//    field1 id: "haha123_abcd"
//    field2 id: "haha123_efgh"
//    and potentially even
//    edge: "haha123_abcd->haha123_efgh"
export function parseNodeTree(treeIn: NodeTree<string, string>) {
    const maxXPosition = 800;
    const maxYPosition = 500;

    const treeOut: NodeTree<string, string> = structuredClone(treeIn);

    const allIds: string[] = [];
    const nodeAndFieldIds: string[] = [];

    function generateUniqueId(): string {
        let rand = (Math.random() + 1).toString(36).split('.')[1];
        if (rand === undefined || allIds.includes(rand)) rand = generateUniqueId();
        return rand;
    }

    function correctId(item: Node<string> | NodeField<string>) {
        if (item.id === undefined) {
            const id = generateUniqueId();
            allIds.push(id);
            nodeAndFieldIds.push(id);
            item.id = id;
            return;
        }
        if (allIds.includes(item.id)) {
            console.error(
                `node or field with name ${item.name} and id ${item.id} has the same id as another item`,
            );
            const id = generateUniqueId();
            allIds.push(id);
            nodeAndFieldIds.push(id);
            item.id = id;
            return;
        }
        allIds.push(item.id);
    }

    function correctEdgeId(item: Edge<string>) {
        if (item.id === undefined) {
            const id = generateUniqueId();
            allIds.push(id);
            nodeAndFieldIds.push(id);
            item.id = id;
            return;
        }
        if (allIds.includes(item.id)) {
            console.error(`edge with id ${item.id} has the same id as another item`);
            const id = generateUniqueId();
            allIds.push(id);
            item.id = id;
            return;
        }
        allIds.push(item.id);
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
        });
    });

    treeOut.edges.map((edge) => {
        correctEdgeId(edge);

        if (!nodeAndFieldIds.includes(edge.source)) {
            console.error(
                `source ${edge.source} of edge with id ${edge.id} does not exist in any node or field`,
            );
        }
        if (!nodeAndFieldIds.includes(edge.target)) {
            console.error(
                `target ${edge.target} of  edge with id ${edge.id} does not exist in any node or field`,
            );
        }

        // TODO check if the node or field that source or target points to has its in/out value set to true
    });

    return treeOut;
}
