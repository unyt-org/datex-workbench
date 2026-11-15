import { Endpoint } from '@/lib/runtime-loader';
import type { Inspector } from '../_temp_types.ts';
import { reactive, ref, computed, shallowReactive } from 'vue';
import { Datex } from '../runtime.ts';

/**
 * A map of connected inspector instances keyed by their corresponding endpoints.
 */
export const connectedInspectorInstances = shallowReactive(new Map<Endpoint, Inspector>());
/**
 * A set of endpoints that are available for creating new inspector instances.
 */
export const availableInspectorEndpoints = reactive(new Set<Endpoint>());

export const activeEndpoint = ref<Endpoint | null>(null);
export const activeInspector = computed(
    () => connectedInspectorInstances.get(activeEndpoint.value) ?? null,
);
// @ts-ignore used for debugging
globalThis.activeInspector = activeInspector;

restoreInspectorEndpoints();

function storeInspectorEndpoints() {
    // store both connected and available endpoints, skip @@local
    const allEndpoint = Array.from(
        [...connectedInspectorInstances.keys(), ...availableInspectorEndpoints].map((e) =>
            e.toString(),
        ),
    ).filter((e) => e !== '@@local');
    localStorage.setItem('inspectorEndpoints', JSON.stringify(allEndpoint));
}
async function restoreInspectorEndpoints() {
    // restore list of available inspector endpoints from localStorage
    const availableEndpoints = JSON.parse(localStorage.getItem('inspectorEndpoints') || '[]');
    availableEndpoints.forEach((endpoint: string) =>
        availableInspectorEndpoints.add(Endpoint.get(endpoint)),
    );

    const connectedEndpoints = new Set([Endpoint.get('@@local')]);

    // restore active endpoint if not already set
    const storedActiveEndpointObj = Endpoint.get(
        localStorage.getItem('activeEndpoint') ?? '@@local',
    );
    if (activeEndpoint.value !== storedActiveEndpointObj) {
        setActiveEndpoint(storedActiveEndpointObj, false);
    }
    connectedEndpoints.add(storedActiveEndpointObj);

    await Promise.all(
        Array.from(connectedEndpoints).map((endpoint) => connectInspector(endpoint, false)),
    );
}

export async function connectInspector(
    endpoint: Endpoint | string,
    setActive = true,
): Promise<boolean> {
    const endpointObj = typeof endpoint === 'string' ? Endpoint.get(endpoint) : endpoint;
    try {
        const inspector = await Datex.createInspector(endpointObj, endpoint.toString());
        connectedInspectorInstances.set(endpointObj, inspector);
        if (setActive) {
            setActiveEndpoint(endpointObj);
        }
        availableInspectorEndpoints.delete(endpointObj);
        storeInspectorEndpoints();
        return true;
    } catch (error) {
        console.error('Failed to create inspector for endpoint', endpointObj.toString(), error);
        return false;
    }
}

/**
 * Tries to set the active endpoint.
 * If the endpoint is has no connected inspector, it will attempt to connect it first. Returns true if successful, false otherwise.
 * @param endpoint
 * @returns
 */
export async function setActiveEndpoint(
    endpoint: Endpoint,
    connectInspectorIfNeeded = true,
): Promise<boolean> {
    activeEndpoint.value = endpoint;
    localStorage.setItem('activeEndpoint', activeEndpoint.value.toString());

    // ensure the endpoint inspector is connected and in the connectedInspectorInstances map
    if (!connectedInspectorInstances.has(endpoint) && connectInspectorIfNeeded) {
        await connectInspector(endpoint);
    }
    return true;
}

export function removeEndpoint(endpoint: Endpoint | string) {
    const endpointObj = typeof endpoint === 'string' ? Endpoint.get(endpoint) : endpoint;
    connectedInspectorInstances.delete(endpointObj);
    availableInspectorEndpoints.delete(endpointObj);
    storeInspectorEndpoints();
}
