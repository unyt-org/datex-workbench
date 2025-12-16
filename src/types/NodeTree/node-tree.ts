export interface NodeTree<NodeMetaData = unknown, EdgeMetaData = unknown> {
    nodes: Array<Node<NodeMetaData>>;
    edges: Array<Edge<EdgeMetaData>>;
}

export interface Node<NodeMetaData = unknown> {
    id: string;
    name?: string;
    position: Position;
    fields: Array<NodeField<NodeMetaData>>;
}

export interface NodeField<NodeMetaData = unknown> {
    id: string;
    name?: string;
    in: boolean;
    out: boolean;
    data?: NodeMetaData;
}

export interface Position {
    x: number;
    y: number;
}

export interface Edge<EdgeMetaData = unknown> {
    id: string;
    sourceId: string;
    targetId: string;
    source: Connector;
    target: Connector;
    edgetype: EdgeType;
    data?: EdgeMetaData;
}

export type Connector = NodeConnector | FieldConnector;

export interface NodeConnector {
    kind: 'node';
    nodeId: string;
}

export interface FieldConnector {
    kind: 'field';
    nodeId: string;
    fieldId: string;
}

export type EdgeType = string;
