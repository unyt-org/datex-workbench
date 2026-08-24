import type { InstructionTree, FlatInstruction, TreeInstruction } from '@/lib/_temp_types.ts';
// ─── Helpers ────────────────────────────────────────────────

export interface InstructionParts {
    name: string;
    meta: string | null;
    span: { start: number; end: number };
    inner: InstructionTree | FlatInstruction[] | null;
}

/**
 * Extracts the opcode name, optional metadata string, and optional
 * inner instruction payload from any instruction variant.
 */
export function getInstructionParts(
    instruction: TreeInstruction | FlatInstruction,
): InstructionParts {
    const { span, instruction: instr } = instruction;
    if (typeof instr === 'string') {
        return { name: instr, meta: null, inner: null, span };
    }

    if (Array.isArray(instr)) {
        const name = instr[0];
        const meta = typeof instr[1] === 'string' ? instr[1] : null;
        const inner = instr.length === 3 ? instr[2] : null;
        return { name, meta, inner: inner ?? null, span };
    }

    return { name: String(instr), meta: null, inner: null, span };
}
