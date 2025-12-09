import type { NodeTree } from '@/types/node-tree';

// handle exceptions
// nodes:
// DONE when no name is provided
// DONE when no id is provided
// DONE when two or more nodes or fields have the same id
// DONE when no position is provided
// DONE when the position x and y values are invalid (e.g. negative or too big)
// edges:
// when no id is provided
// when two or more edges have the same id or same as a node or field
// when source or target id doesn't exist in node
// when source has out value false or target has in value false
export function parseNodeTree(treeIn: NodeTree<string, string>) {
    const maxXPosition = 800;
    const maxYPosition = 500;

    const treeOut: NodeTree<string, string> = structuredClone(treeIn);

    const Ids: string[] = [];
    function generateUniqueId(): string {
        let rand = (Math.random() + 1).toString(36).split('.')[1];
        if (rand === undefined || Ids.includes(rand)) rand = generateUniqueId();
        return rand;
    }

    console.log(generateUniqueId());

    // we start by going over each node and taking a look at the id of the node
    // if it has a id, add it to the array of all the ids
    // if it has an id that is already in the list, notify with an error and give it a unique id that isn't in the list yet
    // this could be expanded to also make all the ids be of the same "shape":
    //    currently any string can be used as an id but
    //    if we were to have the id of a field be a combination of the id of the node followed by a unique id of the field,
    //    this could make the id contain more and clearer information without more overhead
    // example:
    //    node id: "haha123"
    //    field1 id: "haha123_abcd"
    //    field2 id: "haha123_efgh"

    treeOut.nodes.map((node) => {
        // name correction
        node.name = node.name ?? 'name not defined';

        // position correction
        node.position = node.position ?? {
            x: Math.floor(Math.random() * maxXPosition),
            y: Math.floor(Math.random() * maxYPosition),
        };
        node.position.x = node.position.x ?? Math.floor(Math.random() * maxXPosition);
        node.position.y = node.position.y ?? Math.floor(Math.random() * maxYPosition);
        if (node.position.x > maxXPosition) node.position.x = maxXPosition;
        if (node.position.y > maxYPosition) node.position.y = maxYPosition;

        // id correction
        if (node.id === undefined) {
            const id = generateUniqueId();
            Ids.push(id);
            node.id = id;
            return;
        }
        if (Ids.includes(node.id)) {
            console.error(
                `The node "${node.name}" with id "${node.id}" has the same id as another node`,
            );
            const id = generateUniqueId();
            Ids.push(id);
            node.id = id;
            return;
        }
        Ids.push(node.id);
        return;
    });

    return treeOut;
}
