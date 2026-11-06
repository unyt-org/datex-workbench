import { Tagged, type SharedRef, SharedContainerMutability, SharedReferenceMutability } from './runtime-loader.ts';

/** TODO: remove and use types from datex-web, just temporary until types are updated */
export type Span = { start: number; end: number };
export type SpannedInstruction<T> = { instruction: T; span: Span };
export type Instruction = string | [string, string];
export type TreeInstruction = SpannedInstruction<Instruction | [string, string, InstructionTree]>;
export type FlatInstruction = SpannedInstruction<Instruction | [string, string, FlatInstruction[]]>;

export type InstructionTree = { instruction: TreeInstruction; children?: InstructionTree[] };

/** Result tuple: [data, errorOrNull] */
export type TreeResult = [InstructionTree, string | null];
export type FlatResult = [FlatInstruction[], string | null];


export type LogLevel = Tagged<"Trace"> | Tagged<"Debug"> | Tagged<"Info"> | Tagged<"Warn"> | Tagged<"Error">;
export type LogMessage = {
    level: LogLevel;
    module: string;
    tag: string | null;
    message: string;
};
export declare class Inspector {
    /**
     * Returns the name of the inspector.
     */ public name(): Promise<string>;
    /**
     * Returns a stream of all global log messages of the endpoint.
     */ public logs(): Promise<SharedRef<ReadableStream<LogMessage>, SharedContainerMutability.Mutable, SharedReferenceMutability.Mutable>>;
    /**
     * Attempts to reboot the endpoint associated with the inspector.
     * Currently, this function is not implemented and will panic if called.
     */ public try_reboot_endpoint(): Promise<void>;
}
/**************************************************************************************** */
