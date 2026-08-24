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
/**************************************************************************************** */
