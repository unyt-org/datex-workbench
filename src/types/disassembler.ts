/**
 * Type definitions for disassembled DXB instructions.
 * These mirror the runtime types from `@unyt/datex` and will be
 * replaced by the actual exports once the next datex-core release ships.
 */

/** A single instruction: either a bare opcode or [opcode, operand] */
export type Instruction = string | [string, string]

/** Tree instruction: may carry an inner InstructionTree as 3rd element (e.g. REMOTE_EXECUTION) */
export type TreeInstruction = Instruction | [string, string, InstructionTree]

/** Flat instruction: may carry an inner Instruction[] as 3rd element */
export type FlatInstruction = Instruction | [string, string, FlatInstruction[]]

/** Recursive tree node returned by `disassembleDXBTree` */
export interface InstructionTree {
  instruction: TreeInstruction
  children?: InstructionTree[]
}

/** Result tuple: [data, errorOrNull] */
export type TreeResult = [InstructionTree, string | null]
export type FlatResult = [FlatInstruction[], string | null]

// ─── Helpers ────────────────────────────────────────────────

export interface InstructionParts {
  name: string
  meta: string | null
  inner: InstructionTree | FlatInstruction[] | null
}

/**
 * Extracts the opcode name, optional metadata string, and optional
 * inner instruction payload from any instruction variant.
 */
export function getInstructionParts(
  instruction: TreeInstruction | FlatInstruction
): InstructionParts {
  if (typeof instruction === 'string') {
    return { name: instruction, meta: null, inner: null }
  }

  if (Array.isArray(instruction)) {
    const name = instruction[0]
    const meta = typeof instruction[1] === 'string' ? instruction[1] : null
    const inner = instruction.length === 3 ? instruction[2] : null
    return { name, meta, inner: inner ?? null }
  }

  return { name: String(instruction), meta: null, inner: null }
}
