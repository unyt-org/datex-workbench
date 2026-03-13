import type { BlockDirection } from './BlockEntry';

export interface NetworkBlockTableRow {
    direction: BlockDirection;
    blockType: string;
    sender: string;
    receiver: string;
    timestamp: string;
    size: number;
    isEncrypted: boolean;
    isSigned: boolean;
    interface: string;
    capturedAt: number;
}
