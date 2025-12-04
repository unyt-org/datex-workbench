export interface NodeTree<NodeMetaData, EdgeMetaData> {
    nodes: Array<Node<NodeMetaData>>;
    edges: Array<Edge<EdgeMetaData>>;
}

export interface Node<NodeMetaData> {
    id: string;
    label: string; // or name
    position: Position; // this is probably not useful in the def but is needed for dom element positioning
    fields?: Array<NodeField<NodeMetaData>>;
}

export interface NodeField<NodeMetaData> {
    id: string;
    label: string;
    in: boolean;
    out: boolean;
    data: NodeMetaData;
}

export interface Position {
    x: number;
    y: number;
}

export interface Edge<EdgeMetaData> {
    id: string;
    source: string;
    target: string;
    edgetype: EdgeType;
    data?: EdgeMetaData
}

export type EdgeType = string;
