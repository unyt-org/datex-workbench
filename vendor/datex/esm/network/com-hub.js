/**
 * Communication hub for managing communication interfaces.
 */
export class ComHub {
    /** The JS communication hub. */
    #jsComHub;
    #runtime;
    constructor(jsComHub, runtime) {
        this.#jsComHub = jsComHub;
        this.#runtime = runtime;
    }
    registerInterfaceFactory(factoryDefinition) {
        this.#jsComHub.register_interface_factory(factoryDefinition.interfaceType, async (setupData) => {
            const setupDataJS = await this.#runtime.dif.resolveDIFValueContainer(setupData);
            const data = await factoryDefinition.factory(setupDataJS);
            return {
                ...data,
                properties: this.#runtime.dif.convertJSValueToDIFValueContainer(data.properties),
            };
        });
    }
    /**
     * Creates a new communication interface.
     * @param type The type of the interface to create.
     * @param setupData The setup data for the interface.
     * @param priority The priority of the interface (optional).
     * @returns A promise that resolves to the UUID of the created interface.
     */
    async createInterface(type, setupData, priority) {
        return await this.#jsComHub.create_interface(type, this.#runtime.dif.convertJSValueToDIFValueContainer(setupData), priority);
    }
    removeInterface(interface_uuid) {
        return this.#jsComHub.remove_interface(interface_uuid);
    }
    removeSocket(socket_uuid) {
        return this.#jsComHub.remove_socket(socket_uuid);
    }
    /**
     * Prints the metadata of the ComHub. Only available in debug builds.
     * Only exists in debug builds
     */
    printMetadata() {
        const metadata = this.#jsComHub.get_metadata_string();
        console.info(metadata);
    }
    getMetadata() {
        // as any required because get_metadata only exists in debug builds
        return this.#runtime.dif.resolveDIFValueContainer(this.#jsComHub.get_metadata());
    }
    /**
     * Prints the trace for a specific endpoint. Only available in debug builds.
     * @param endpoint The endpoint for which to print the trace.
     */
    async printTrace(endpoint) {
        // as any required because get_trace_string only exists in debug builds
        const trace = await this.#jsComHub.get_trace_string(endpoint);
        if (trace === undefined) {
            console.warn(`No trace available for endpoint: ${endpoint}`);
            return;
        }
        console.info(trace);
    }
    getTrace(endpoint) {
        // as any required because get_trace_string only exists in debug builds
        return this.#jsComHub.get_trace(endpoint);
    }
    /**
     * Registers a callback to intercept incoming and outgoing blocks.
     * @param callback The callback to be invoked for each block.
     * @param include_debug_blocks Whether to include debug blocks in the interception. Defaults to false.
     * @returns A UUID for the registered interceptor, which can be used to unregister it later.
     */
    registerBlockInterceptor(callback, include_debug_blocks = false) {
        return this.#jsComHub.register_block_interceptor(callback, include_debug_blocks);
    }
    /**
     * Unregisters a previously registered block interceptor.
     * @param uuid
     */
    unregisterBlockInterceptor(uuid) {
        this.#jsComHub.unregister_block_interceptor(uuid);
    }
}
