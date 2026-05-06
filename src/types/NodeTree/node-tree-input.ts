import type { EdgeDirection, EdgeStyle, ConnectorDefinition } from './node-tree';

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
    connectors?: ConnectorDefinition[];
}

export interface Position {
    x?: number;
    y?: number;
}

export interface EdgeInput<EdgeMetaData = unknown> {
    id?: string;
    source: ConnectorInput;
    target: ConnectorInput;
    edgetype?: EdgeType;
    direction?: EdgeDirection;
    style?: EdgeStyle;
    data?: EdgeMetaData;
}

export type ConnectorInput = NodeConnectorInput | FieldConnectorInput;

export interface NodeConnectorInput {
    kind?: 'node';
    nodeId: string;
}

export interface FieldConnectorInput {
    kind?: 'field';
    nodeId?: string;
    fieldId: string;
}

export type EdgeType = string;
