/**
 * Endpoint class representing a unique communication endpoint in the Datex runtime.
 */
export class Endpoint {
    /** the string representation of the endpoint */
    #endpoint;
    /** map with weak values that keeps track of all currently instantiated endpoints */
    static endpoints = new Map();
    constructor(endpoint) {
        this.#endpoint = endpoint;
        Endpoint.registerEndpoint(this);
    }
    /**
     * Registers a new endpoint in the static map.
     * @param endpoint The endpoint to register.
     */
    static registerEndpoint(endpoint) {
        // set as a weak reference in the static map
        const weakRef = new WeakRef(endpoint);
        Endpoint.endpoints.set(endpoint.toString(), weakRef);
        new FinalizationRegistry((key) => {
            Endpoint.endpoints.delete(key);
        }).register(endpoint, endpoint.toString());
    }
    /**
     * Gets an existing endpoint from the static map or creates a new one.
     * @param endpoint The string representation of the endpoint.
     * @returns The existing or newly created Endpoint instance.
     */
    static get(endpoint) {
        if (Endpoint.endpoints.has(endpoint)) {
            const weakRef = Endpoint.endpoints.get(endpoint);
            if (weakRef) {
                const existingEndpoint = weakRef.deref();
                if (existingEndpoint) {
                    return existingEndpoint;
                }
            }
        }
        return new Endpoint(endpoint);
    }
    /**
     * Gets the string representation of the endpoint.
     * @returns The string representation of the endpoint.
     */
    toString() {
        return this.#endpoint;
    }
    get [Symbol.toStringTag]() {
        return this.#endpoint;
    }
    [Symbol.toPrimitive](_hint) {
        return this.#endpoint;
    }
}
