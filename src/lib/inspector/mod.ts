import { Endpoint } from '../runtime-loader.ts';
import type { Inspector } from '../_temp_types.ts';
import { reactive, ref } from 'vue';
import { Datex } from '../runtime.ts';

/**
 * A map of connected inspector instances keyed by their corresponding endpoints.
 */
export const connectedInspectorInstances = reactive(new Map<Endpoint, Inspector>());
/**
 * A set of endpoints that are available for creating new inspector instances.
 */
export const availableInspectorEndpoints = reactive(new Set<Endpoint>());

export const activeEndpoint = ref<Endpoint>(Endpoint.get('@@local'));

await restoreInspectorEndpoints();

function storeInspectorEndpoints() {
    // store both connected and available endpoints, skip @@local
    const allEndpoint = Array.from([...connectedInspectorInstances.keys(), ...availableInspectorEndpoints].map(e => e.toString())).filter(e => e !== '@@local');
    localStorage.setItem('inspectorEndpoints', JSON.stringify(allEndpoint));
}
async function restoreInspectorEndpoints() {
    const availableEndpoints = JSON.parse(localStorage.getItem('inspectorEndpoints') || '[]');
    availableEndpoints.forEach((endpoint: string) => availableInspectorEndpoints.add(Endpoint.get(endpoint)));

    const connectedEndpoints = [Endpoint.get('@@local')]

    await Promise.all(
      connectedEndpoints.map((endpoint) => connectInspector(endpoint))
    )
}

export async function connectInspector(endpoint: Endpoint|string): Promise<boolean> {
  const endpointObj = typeof endpoint === 'string' ? Endpoint.get(endpoint) : endpoint;
  try {
    const inspector = await Datex.createInspector(endpointObj);
    connectedInspectorInstances.set(endpointObj, inspector);
    activeEndpoint.value = endpointObj;
    availableInspectorEndpoints.delete(endpointObj);
    storeInspectorEndpoints();
    return true;
  }
  catch (error) {
    console.error("Failed to create inspector for endpoint", endpointObj.toString(), error);
    return false;
  }
}

/**
 * Tries to set the active endpoint.
 * If the endpoint is has no connected inspector, it will attempt to connect it first. Returns true if successful, false otherwise.
 * @param endpoint
 * @returns
 */
export async function setActiveEndpoint(endpoint: Endpoint): Promise<boolean> {
  // ensure the endpoint inspector is connected and in the connectedInspectorInstances map
  if (!connectedInspectorInstances.has(endpoint)) {
    const success = await connectInspector(endpoint);
    if (!success) {
      return false;
    }
    else {
      activeEndpoint.value = endpoint;
    }
  }
  else {
    activeEndpoint.value = endpoint;
  }
  return true;
}

globalThis.setActiveEndpoint = setActiveEndpoint;
