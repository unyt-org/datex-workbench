export interface NodeTreeInput<NodeMetaData = unknown, EdgeMetaData = unknown> {
    nodes?: Array<NodeInput<NodeMetaData>>;
    edges?: Array<EdgeInput<EdgeMetaData>>;
}

export interface NodeInput<NodeMetaData = unknown> {
    id?: string;
    name?: string;
    position?: Position;
    fields?: Array<NodeFieldInput<NodeMetaData>>;
}

export interface NodeFieldInput<NodeMetaData = unknown> {
    id?: string;
    name?: string;
    in?: boolean;
    out?: boolean;
    data?: NodeMetaData;
}

export interface Position {
    x?: number;
    y?: number;
}

export interface EdgeInput<EdgeMetaData = unknown> {
    id?: string;
    sourceId: string;
    targetId: string;
    edgetype?: EdgeType;
    data?: EdgeMetaData;
}

export type EdgeType = string;
