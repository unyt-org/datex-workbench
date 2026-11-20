import { create_runtime, decompile_dxb_body, disassemble_dxb_flat, disassemble_dxb_to_string, disassemble_dxb_tree, } from "../datex.js";
import { ComHub } from "../network/com-hub.js";
import { DIFHandler } from "../dif/dif-handler.js";
import { OwnedSharedContainer, SharedContainerMutability, } from "../shared-container/mod.js";
import { Endpoint } from "../lib/mod.js";
import { getDeviceTypeAndVersions } from "../utils/device-info.js";
// TODO: move to global.ts
/** auto-generated version - do not edit: */
const VERSION = "0.0.17";
/**
 * The main Runtime class for executing Datex scripts and managing communication interfaces.
 */
export class Runtime {
    js_version = VERSION;
    #runtime;
    #comHub;
    #difHandler;
    constructor(jsRuntime) {
        this.#runtime = jsRuntime;
        this.#comHub = new ComHub(this.#runtime.com_hub, this);
        this.#difHandler = new DIFHandler(this.#runtime);
    }
    /**
     * Creates a new Runtime instance.
     * @param config Runtime configuration
     * @param debugConfig Debug flags for the runtime
     * @returns A promise that resolves to the created Runtime instance
     */
    static async create(config, debugConfig) {
        const { deviceType, versions } = await getDeviceTypeAndVersions();
        versions.datex_web = VERSION;
        // workaround: temp dif handler without runtime to convert config to DIF
        const configDIF = DIFHandler.convertJSValueToDIFValueContainer(config);
        const jsRuntime = await create_runtime(configDIF, debugConfig, deviceType, Object.entries(versions));
        return new Runtime(jsRuntime);
    }
    /**
     * Gets the endpoint of the runtime.
     */
    get endpoint() {
        return Endpoint.get(this.#runtime.endpoint);
    }
    /**
     * Gets the version of the runtime.
     */
    get version() {
        return this.#runtime.version;
    }
    /**
     * Gets the DIF handler associated with the runtime.
     */
    get dif() {
        return this.#difHandler;
    }
    /**
     * Gets the communication hub associated with the runtime.
     */
    get comHub() {
        return this.#comHub;
    }
    /**
     * @internal only used for debugging
     */
    get _runtime() {
        return this.#runtime;
    }
    /**
     * Executes a Datex script and returns the result as a string.
     * @param datexScript The Datex script to execute.
     * @param values The values to inject into the script.
     * @param decompileOptions Options for decompiling the result.
     *
     * @returns A promise that resolves to the result of the script execution.
     */
    executeWithStringResult(datexScript, values = [], decompileOptions = null, markAsDebug = false) {
        return this.#runtime.execute_with_string_result(datexScript, this.#difHandler.convertToDIFValues(values), decompileOptions, markAsDebug);
    }
    /**
     * Executes a Datex script synchronously and returns the result as a string.
     * @param datexScript The Datex script to execute.
     * @param values The values to inject into the script.
     * @param decompileOptions Options for decompiling the result.
     * @returns The result of the script execution.
     */
    executeSyncWithStringResult(datexScript, values = [], decompileOptions = null) {
        return this.#runtime.execute_sync_with_string_result(datexScript, this.#difHandler.convertToDIFValues(values), decompileOptions);
    }
    execute(datexScriptOrTemplateStrings, ...values) {
        const { datexScript, valuesArray, markAsDebug } = this.#normalizeArguments(datexScriptOrTemplateStrings, ...values);
        return this.#executeWithNormalizedArguments(datexScript, valuesArray, markAsDebug);
    }
    /**
     * Execute a DATEX script with injected values and return the result as a Promise of type T.
     * The result is converted to a JS value. If the script returns no value, it will return `undefined`.
     * @param datexScript The DATEX script to execute.
     * @param values The values to inject into the script, passed as an array.
     * @param markAsDebug Optional boolean to mark the execution as debug (default: false).
     * @returns A Promise that resolves to the result of the script execution, converted to type T.
     */
    async #executeWithNormalizedArguments(datexScript, values = [], markAsDebug = false) {
        const difValueContainer = await this.#difHandler.executeDIF(datexScript, values, markAsDebug);
        if (difValueContainer === undefined) {
            return undefined;
        }
        return this.#difHandler.resolveDIFValueContainer(difValueContainer);
    }
    /**
     * Execute a DATEX script remotely with injected values and return the result as a Promise of type T.
     * The result is converted to a JS value. If the script returns no value, it will return `undefined`.
     * @param target The endpoint to execute the script on.
     * @param datexScript The DATEX script to execute.
     * @param values The values to inject into the script, passed as an array.
     * @param markAsDebug Optional boolean to mark the execution as debug (default: false).
     * @returns A Promise that resolves to the result of the script execution, converted to type T.
     */
    async executeRemote(target, datexScript, values = [], markAsDebug = false) {
        const difValueContainer = await this.#difHandler.executeDIFRemote(target, datexScript, values, markAsDebug);
        if (difValueContainer === undefined) {
            return undefined;
        }
        return this.#difHandler.resolveDIFValueContainer(difValueContainer);
    }
    executeSync(datexScriptOrTemplateStrings, ...values) {
        // determine datexScript and valuesArray based on the type of datexScriptOrTemplateStrings
        const { datexScript, valuesArray } = this.#normalizeArguments(datexScriptOrTemplateStrings, ...values);
        return this.#executeSyncWithNormalizedArguments(datexScript, valuesArray);
    }
    #executeSyncWithNormalizedArguments(datexScript, values = []) {
        const difValue = this.#difHandler.executeSyncDIF(datexScript, values);
        if (difValue === undefined) {
            return undefined;
        }
        const result = this.#difHandler.resolveDIFValueContainer(difValue);
        if (result instanceof Promise) {
            throw new Error("executeSync cannot return a Promise. Use execute() instead.");
        }
        return result;
    }
    /**
     * Creates a new Inspector instance on the specified endpoint.
     * @param endpoint
     * @param name
     */
    async createInspector(endpoint = Endpoint.get("@@local"), name = "Default Inspector") {
        if (typeof endpoint === "string") {
            endpoint = Endpoint.get(endpoint);
        }
        const inspector_dif = await this.dif._handle.create_inspector(endpoint.toString(), name);
        const inspector_ref = this.dif.resolveDIFValueContainer(inspector_dif);
        return inspector_ref.value;
    }
    compile(datexScriptOrTemplateStrings, ...values) {
        const { datexScript, valuesArray } = this.#normalizeArguments(datexScriptOrTemplateStrings, ...values);
        return this.#runtime.compile(datexScript, valuesArray);
    }
    /**
     * Converts a JavaScript value to a string representation.
     * @param value The value to convert.
     * @param decompileOptions Options for decompiling the result.
     * @returns The string representation of the value.
     */
    valueToString(value, decompileOptions = null) {
        return this.#runtime.value_to_string(this.#difHandler.convertJSValueToDIFValueContainer(value), this.#difHandler.convertJSValueToDIFValueContainer(decompileOptions));
    }
    /**
     * Handles the function arguments to a normal function call or a template function call,
     * always returning a normalized datexScript and valuesArray.
     */
    #normalizeArguments(datexScriptOrTemplateStrings, ...values) {
        let datexScript;
        let valuesArray;
        let markAsDebug = false;
        if (typeof datexScriptOrTemplateStrings === "string") {
            datexScript = datexScriptOrTemplateStrings;
            valuesArray = values[0] ?? [];
            markAsDebug = values[1] ?? false;
        }
        else if (Array.isArray(datexScriptOrTemplateStrings)) {
            // if it's a TemplateStringsArray, join the strings and interpolate the values
            datexScript = datexScriptOrTemplateStrings.join("?");
            valuesArray = values;
        }
        else {
            throw new Error("Invalid argument type for executeSync");
        }
        return { datexScript, valuesArray, markAsDebug };
    }
    /**
     * Creates a new reference containing the given JS value.
     *
     * @param value The JS value to store in the pointer.
     * @param allowedType Optional DIF type container to restrict the type of the pointer.
     * @param mutability Optional mutability of the reference (default is Mutable).
     * @returns A owned shared container wrapper containing the value. Independent of the structure in JS.
     */
    createSharedValueFromJSValue(value, allowedType = null, mutability = SharedContainerMutability.Mutable) {
        return this.#difHandler.createSharedValueFromJSValue(value, allowedType, mutability);
    }
    startLSP(callback) {
        const decoder = new TextDecoder("utf-8");
        const encoder = new TextEncoder();
        const sendToRust = this.#runtime.start_lsp((bytes) => {
            callback(decoder.decode(bytes));
        });
        return (data) => {
            sendToRust(encoder.encode(data));
        };
    }
    /**
     * Returns a disassembled DXB as a list of instructions
     * @param dxb DATEX binary body
     * @returns a tuple of the instruction tree and an optional error message if the disassembly (partially) failed
     */
    disassembleDXBFlat(dxb) {
        return disassemble_dxb_flat(dxb);
    }
    /**
     * Returns a disassembled DXB as a tree structure, where each instruction can have nested child instructions
     * @param dxb DATEX binary body
     * @returns a tuple of the instruction tree and an optional error message if the disassembly (partially) failed
     */
    disassembleDXBTree(dxb) {
        return disassemble_dxb_tree(dxb);
    }
    /**
     * Returns a disassembled DXB as a human-readable string, similar to assembly code.
     * @param dxb
     * @param options
     */
    disassembleDXBToString(dxb, options) {
        return disassemble_dxb_to_string(dxb, options);
    }
    /**
     * Decompiles a DXB body to a DATEX script string.
     * @param dxbBody
     */
    decompileDXBBody(dxbBody) {
        return decompile_dxb_body(dxbBody);
    }
    /**
     * Creates a new shared value Ref
     * @param value
     */
    ref(value) {
        const shared = this.createSharedValueFromJSValue(value, undefined, SharedContainerMutability.Mutable);
        if (shared instanceof OwnedSharedContainer) {
            return shared.deriveImmutableReference();
        }
        else {
            return shared; // FIXME make sure this is a ReferencedSharedContainer
        }
    }
    /**
     * Creates a new shared value Ref
     * @param value
     */
    shared(value) {
        return this.createSharedValueFromJSValue(value, undefined, SharedContainerMutability.Mutable); // FIXME make sure this is an OwnedSharedContainer
    }
}
