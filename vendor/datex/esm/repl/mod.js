/**
 * @module repl/mod.ts
 * @description
 * This module provides a REPL (Read-Eval-Print Loop) helper class for the DATEX runtime.
 * It allows users to execute scripts and evaluate expressions in an interactive manner.
 */
import { Repl as ReplInternal } from "../datex.js";
import { tagged } from "../lib/special-core-types/tagged.js";
export class Repl {
    runtime;
    #repl;
    constructor(runtime, endpoint = null, verbose = false) {
        this.runtime = runtime;
        this.#repl = new ReplInternal(runtime._runtime, endpoint?.toString(), verbose);
    }
    async execute(script) {
        const result = await this.#repl.execute(script);
        if (result === undefined) {
            return undefined;
        }
        const jsValue = this.runtime.dif.resolveDIFValueContainer(result);
        return this.runtime.valueToString(jsValue, {
            formatting_options: {
                mode: tagged("Pretty", {
                    indent: 4,
                    indent_type: tagged("Spaces"),
                }),
                json_compat: false,
                colorized: false,
            },
            resolve_slots: false,
        });
    }
}
