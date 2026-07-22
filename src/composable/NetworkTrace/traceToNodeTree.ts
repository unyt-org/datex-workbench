import type { NodeTree, Node, Edge } from '@/types/NodeTree/node-tree.ts';
import type { Builtins } from '@unyt/datex';

interface TraceHop {
    endpoint: Builtins.Endpoint;
    distance: number;
    socket: {
        interface_type: string;
        interface_name: string | null;
        channel: string;
        socket_uuid: string;
    };
    direction: Builtins.Tagged<'Incoming'> | Builtins.Tagged<'Outgoing'>;
    fork_nr: string;
    bounce_back: boolean;
}

interface TraceResult {
    sender: Builtins.Endpoint;
    receiver: Builtins.Endpoint;
    hops: TraceHop[];
    round_trip_time: unknown | number;
}

function generateId(): string {
    return Math.random().toString(36).slice(2, 9);
}

export function traceToNodeTree(trace: TraceResult, existing?: NodeTree): NodeTree {
    const nodes: Node[] = existing ? [...existing.nodes] : [];
    const edges: Edge[] = existing ? [...existing.edges] : [];

    // Track which endpoints and fields we've already seen
    const endpointNodeMap = new Map<string, string>(); // endpoint -> nodeId
    const socketFieldMap = new Map<string, string>(); // socket_uuid -> fieldId

    // Pre-populate from existing nodes
    for (const node of nodes) {
        endpointNodeMap.set(node.name ?? node.id, node.id);
        for (const field of node.fields) {
            socketFieldMap.set(field.id, field.id);
        }
    }

    // Process each hop
    for (const hop of trace.hops) {
        // Get or create node for this endpoint
        if (!endpointNodeMap.has(hop.endpoint.toString())) {
            const nodeId = generateId();
            endpointNodeMap.set(hop.endpoint.toString(), nodeId);

            const newNode: Node = {
                id: nodeId,
                name: hop.endpoint.toString(),
                position: {
                    x: 100 + nodes.length * 300,
                    y: 100 + nodes.length * 100,
                },
                fields: [],
            };
            nodes.push(newNode);
        }

        // Get or create field for this socket
        const nodeId = endpointNodeMap.get(hop.endpoint.toString())!;
        const node = nodes.find((n) => n.id === nodeId)!;

        const socketKey = hop.socket.socket_uuid;
        if (!socketFieldMap.has(socketKey)) {
            socketFieldMap.set(socketKey, socketKey);

            node.fields.push({
                id: socketKey,
                name: hop.socket.interface_name,
                in: hop.direction.tag === 'Incoming',
                out: hop.direction.tag === 'Outgoing',
            });
        }
    }

    // Create edges between outgoing and incoming hops with same socket
    const outgoing = trace.hops.filter((h) => h.direction.tag === 'Outgoing');
    const incoming = trace.hops.filter((h) => h.direction.tag === 'Incoming');

    for (const out of outgoing) {
        // Find matching incoming hop (different endpoint, same channel)
        const match = incoming.find(
            (i) => i.endpoint !== out.endpoint && i.socket.channel === out.socket.channel,
        );
        if (!match) continue;

        const srcFieldId = socketFieldMap.get(out.socket.socket_uuid);
        const tgtFieldId = socketFieldMap.get(match.socket.socket_uuid);
        const srcNodeId = endpointNodeMap.get(out.endpoint.toString());
        const tgtNodeId = endpointNodeMap.get(match.endpoint.toString());

        if (!srcFieldId || !tgtFieldId || !srcNodeId || !tgtNodeId) continue;

        // Check if edge already exists
        const edgeExists = edges.some(
            (e) =>
                e.source.kind === 'field' &&
                e.target.kind === 'field' &&
                e.source.fieldId === srcFieldId &&
                e.target.fieldId === tgtFieldId,
        );

        if (!edgeExists) {
            edges.push({
                id: generateId(),
                source: { kind: 'field', nodeId: srcNodeId, fieldId: srcFieldId },
                target: { kind: 'field', nodeId: tgtNodeId, fieldId: tgtFieldId },
                edgetype: out.socket.interface_type,
                direction: 'bidirectional',
                style: 'bezier',
            });
        }
    }

    return { nodes, edges };
}
