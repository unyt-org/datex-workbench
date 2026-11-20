import { type JSRuntime } from "../datex.js";
import { ComHub } from "../network/com-hub.js";
import { DIFHandler } from "../dif/dif-handler.js";
import { OwnedSharedContainer, type ReferencedSharedContainer, SharedContainerMutability } from "../shared-container/mod.js";
import type { FlatResult, TreeResult } from "./types.js";
import type { DIFTypeDefinition } from "../dif/types/mod.js";
import { Endpoint } from "../lib/mod.js";
import type { DisassemblerOptions } from "../datex-web/types/disassembler/options.js";
import type { DecompileOptions } from "../datex-web/types/decompiler/options.js";
import type { Inspector } from "../datex-web/types/inspector/mod.js";
import type { RuntimeConfig } from "../datex-web/types/runtime/config.js";
/** debug flags for the runtime */
interface DebugConfig {
    log_level?: "error" | "warn" | "info" | "debug" | "trace" | null;
}
export type PartialRuntimeConfig = Partial<RuntimeConfig>;
/**
 * The main Runtime class for executing Datex scripts and managing communication interfaces.
 */
export declare class Runtime {
    #private;
    readonly js_version: string;
    private constructor();
    /**
     * Creates a new Runtime instance.
     * @param config Runtime configuration
     * @param debugConfig Debug flags for the runtime
     * @returns A promise that resolves to the created Runtime instance
     */
    static create(config: PartialRuntimeConfig, debugConfig?: DebugConfig): Promise<Runtime>;
    /**
     * Gets the endpoint of the runtime.
     */
    get endpoint(): Endpoint;
    /**
     * Gets the version of the runtime.
     */
    get version(): string;
    /**
     * Gets the DIF handler associated with the runtime.
     */
    get dif(): DIFHandler;
    /**
     * Gets the communication hub associated with the runtime.
     */
    get comHub(): ComHub;
    /**
     * @internal only used for debugging
     */
    get _runtime(): JSRuntime;
    /**
     * Executes a Datex script and returns the result as a string.
     * @param datexScript The Datex script to execute.
     * @param values The values to inject into the script.
     * @param decompileOptions Options for decompiling the result.
     *
     * @returns A promise that resolves to the result of the script execution.
     */
    executeWithStringResult(datexScript: string, values?: unknown[] | null, decompileOptions?: DecompileOptions | null, markAsDebug?: boolean): Promise<string>;
    /**
     * Executes a Datex script synchronously and returns the result as a string.
     * @param datexScript The Datex script to execute.
     * @param values The values to inject into the script.
     * @param decompileOptions Options for decompiling the result.
     * @returns The result of the script execution.
     */
    executeSyncWithStringResult(datexScript: string, values?: unknown[] | null, decompileOptions?: DecompileOptions | null): string;
    /**
     * Asynchronously executes a Datex script and returns the result as a Promise.
     * Injected values can be passed as an array in `values`.
     * If the script returns no value, it will return `undefined`.
     * Example usage:
     * ```ts
     * const result = await runtime.execute<number>("1 + ?", [41]);
     * console.log(result); // 42
     * ```
     */
    execute<T = unknown>(datexScript: string, values?: unknown[], markAsDebug?: boolean): Promise<T>;
    /**
     * Asynchronously executes a Datex script and returns the result as a Promise.
     * Injected values can be passed to the template string.
     * Example usage:
     * ```ts
     * const result = await runtime.execute<number>`1 + ${41}`;
     * console.log(result); // 42
     * ```
     */
    execute<T = unknown>(templateStrings: TemplateStringsArray, ...values: unknown[]): Promise<T>;
    /**
     * Execute a DATEX script remotely with injected values and return the result as a Promise of type T.
     * The result is converted to a JS value. If the script returns no value, it will return `undefined`.
     * @param target The endpoint to execute the script on.
     * @param datexScript The DATEX script to execute.
     * @param values The values to inject into the script, passed as an array.
     * @param markAsDebug Optional boolean to mark the execution as debug (default: false).
     * @returns A Promise that resolves to the result of the script execution, converted to type T.
     */
    executeRemote<T = unknown>(target: Endpoint, datexScript: string, values?: unknown[] | null, markAsDebug?: boolean): Promise<T>;
    /**
     * Executes a Datex script synchronously and returns the result as a generic type T.
     * Injected values can be passed as an array in `values`.
     * If the script returns no value, it will return `undefined`.
     * Example usage:
     * ```ts
     * const result = runtime.executeSync<number>("1 + ?", [41]);
     * console.log(result); // 42
     * ```
     */
    executeSync<T = unknown>(datexScript: string, values?: unknown[]): T;
    /**
     * Executes a Datex script synchronously and returns the result as a generic type T.
     * Injected values can be passed to the template string.
     * Example usage:
     * ```ts
     * const result = runtime.executeSync<number>`1 + ${41}`;
     * console.log(result); // 42
     * ```
     */
    executeSync<T = unknown>(templateStrings: TemplateStringsArray, ...values: unknown[]): T;
    /**
     * Creates a new Inspector instance on the specified endpoint.
     * @param endpoint
     * @param name
     */
    createInspector(endpoint?: Endpoint | string, name?: string): Promise<Inspector>;
    /**
     * Compiles a DATEX source code and optional injected values to a DXB body
     */
    compile(datexScript: string, values?: unknown[]): Promise<Uint8Array>;
    /**
     * Compiles a DATEX source code and optional injected values to a DXB body.
     * Injected values can be passed to the template string.
     * Example usage:
     * ```ts
     * const dxb = await runtime.compile<number>`1 + ${41}`;
     * ```
     */
    compile(templateStrings: TemplateStringsArray, ...values: unknown[]): Promise<Uint8Array>;
    /**
     * Converts a JavaScript value to a string representation.
     * @param value The value to convert.
     * @param decompileOptions Options for decompiling the result.
     * @returns The string representation of the value.
     */
    valueToString(value: unknown, decompileOptions?: DecompileOptions | null): string;
    /**
     * Creates a new reference containing the given JS value.
     *
     * @param value The JS value to store in the pointer.
     * @param allowedType Optional DIF type container to restrict the type of the pointer.
     * @param mutability Optional mutability of the reference (default is Mutable).
     * @returns A owned shared container wrapper containing the value. Independent of the structure in JS.
     */
    createSharedValueFromJSValue<V, M extends SharedContainerMutability = SharedContainerMutability.Mutable>(value: V, allowedType?: DIFTypeDefinition | null, mutability?: M): OwnedSharedContainer<V, M>;
    startLSP(callback: (data: string) => void): (data: string) => void;
    /**
     * Returns a disassembled DXB as a list of instructions
     * @param dxb DATEX binary body
     * @returns a tuple of the instruction tree and an optional error message if the disassembly (partially) failed
     */
    disassembleDXBFlat(dxb: Uint8Array): FlatResult;
    /**
     * Returns a disassembled DXB as a tree structure, where each instruction can have nested child instructions
     * @param dxb DATEX binary body
     * @returns a tuple of the instruction tree and an optional error message if the disassembly (partially) failed
     */
    disassembleDXBTree(dxb: Uint8Array): TreeResult;
    /**
     * Returns a disassembled DXB as a human-readable string, similar to assembly code.
     * @param dxb
     * @param options
     */
    disassembleDXBToString(dxb: Uint8Array, options?: DisassemblerOptions | null): string;
    /**
     * Decompiles a DXB body to a DATEX script string.
     * @param dxbBody
     */
    decompileDXBBody(dxbBody: Uint8Array): string;
    /**
     * Creates a new shared value Ref
     * @param value
     */
    ref<T>(value: T): ReferencedSharedContainer<T>;
    /**
     * Creates a new shared value Ref
     * @param value
     */
    shared<T>(value: T): OwnedSharedContainer<T>;
}
export {};
