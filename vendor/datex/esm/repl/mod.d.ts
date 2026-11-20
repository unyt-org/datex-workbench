/**
 * @module repl/mod.ts
 * @description
 * This module provides a REPL (Read-Eval-Print Loop) helper class for the DATEX runtime.
 * It allows users to execute scripts and evaluate expressions in an interactive manner.
 */
import type { Runtime } from "../runtime/runtime.js";
import type { Endpoint } from "../lib/special-core-types/endpoint.js";
export declare class Repl {
    #private;
    private runtime;
    constructor(runtime: Runtime, endpoint?: Endpoint | null, verbose?: boolean);
    execute(script: string): Promise<string | undefined>;
}
