import type { ParsedSection } from '@unyt/speck';

export type BlockDirection = 'in' | 'out';

export interface RawBlockEntry {
    direction: BlockDirection;
    parsedBlock: ParsedSection[];
    originalBinary: Uint8Array;
    socketUuid: string;
    interfaceName: string;
    capturedAt: number;
}
