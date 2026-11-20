/**
 * Endpoint class representing a unique communication endpoint in the Datex runtime.
 */
export declare class Endpoint {
    #private;
    /** map with weak values that keeps track of all currently instantiated endpoints */
    static endpoints: Map<string, WeakRef<Endpoint>>;
    private constructor();
    /**
     * Registers a new endpoint in the static map.
     * @param endpoint The endpoint to register.
     */
    static registerEndpoint(endpoint: Endpoint): void;
    /**
     * Gets an existing endpoint from the static map or creates a new one.
     * @param endpoint The string representation of the endpoint.
     * @returns The existing or newly created Endpoint instance.
     */
    static get(endpoint: string): Endpoint;
    /**
     * Gets the string representation of the endpoint.
     * @returns The string representation of the endpoint.
     */
    toString(): string;
    get [Symbol.toStringTag](): string;
    [Symbol.toPrimitive](_hint: string): string;
}
