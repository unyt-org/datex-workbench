import type { Edge, Node, NodeField, NodeTree } from '@/types/node-tree';

// handle exceptions
// nodes:
// DONE when no name is provided
// DONE when no id is provided
// DONE when two or more nodes or fields have the same id
// DONE when no position is provided
// DONE when the position x and y values are invalid (e.g. negative or too big)
// fields:
// DONE no name provided
// DONE no id provided
// DONE duplicate id
// DONE check if id is unique
// edges:
// DONE when no id is provided
// DONE when two or more edges have the same id or same as a node or field
// when source or target id doesn't exist in node
// when source has out value false or target has in value false
//
// extra
// the ids of fields of node could be expanded to also make all the ids be of the same "shape":
//    currently any string can be used as an id but
//    if we were to have the id of a field be a combination of the id of the node followed by a unique id of the field,
//    this could make the id contain more and clearer information without more overhead
// example:
//    node id: "haha123"
//    field1 id: "haha123_abcd"
//    field2 id: "haha123_efgh"
export function parseNodeTree(treeIn: NodeTree<string, string>) {
    const maxXPosition = 800;
    const maxYPosition = 500;

    const treeOut: NodeTree<string, string> = structuredClone(treeIn);

    const allIds: string[] = [];
    function generateUniqueId(): string {
        let rand = (Math.random() + 1).toString(36).split('.')[1];
        if (rand === undefined || allIds.includes(rand)) rand = generateUniqueId();
        return rand;
    }

    function correctId(item: Node<string> | NodeField<string> | Edge<string>) {
        if (item.id === undefined) {
            const id = generateUniqueId();
            allIds.push(id);
            item.id = id;
            return;
        }
        if (allIds.includes(item.id)) {
            console.error(
                `The item (Node, Field or Edge) with id ${item.id} has the same id as another item`,
            );
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
        correctId(edge);
    });

    return treeOut;
}
