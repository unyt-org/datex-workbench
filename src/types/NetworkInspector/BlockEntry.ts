import type { ParsedSection } from '@unyt/speck';

export type BlockDirection = 'in' | 'out';

export interface RawBlockEntry {
    direction: BlockDirection;
    parsedBlock: ParsedSection[];
    socketUuid: string;
    capturedAt: number;
}
