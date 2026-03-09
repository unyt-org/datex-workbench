import { Runtime } from '@unyt/datex';
import type { RuntimeConfig } from '@unyt/datex'

export type ComHubMetadata = {
  endpoint: string
  interfaces: {
    uuid: string
    properties: Record<string, unknown>
    sockets: {
      uuid: string
      direction: string
      endpoint: string | undefined
      properties: Record<string, unknown> | undefined
    }[]
    is_waiting_for_socket_connections: boolean
  }[]
}

/**
 * The default configuration for the Datex runtime.
 */
const defaultConfig: RuntimeConfig = {}

/**
 * The default instance of the Datex runtime.
 */
export const Datex: Runtime = await Runtime.create(defaultConfig);

/**
 * Returns a map of pointers that are currently loaded in the runtime.
 * The keys are pointer identifiers and the values are DIFContainer objects
 * representing the values stored at the pointer.
 */
export function getPointers(): Map<string, unknown> {
  // TODO: Replace with real runtime pointers once DATEX release is available
  return new Map()
}

//TODO: Uncomment once Datex is initialized
export function getComHubMetadata(): ComHubMetadata | null {
  // const comHub = new Network.ComHub(Datex.jsComHub, Datex.runtime)
  // return comHub.getMetadata()
  return null
}