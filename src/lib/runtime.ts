import { Runtime, DIF } from '@unyt/datex';
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
const defaultConfig: RuntimeConfig = {
  interfaces: [
    {
      type: 'websocket-client',
      config: {
        url: 'wss://example.unyt.land',
      },
    },
  ],

}

/**
 * The default instance of the Datex runtime.
 */
export const Datex: Runtime = await Runtime.create(defaultConfig,  {log_level: 'info',});

/**
 * Returns a map of pointers that are currently loaded in the runtime.
 * The keys are pointer identifiers and the values are DIFContainer objects
 * representing the values stored at the pointer.
 */
export function getPointers(): Map<string, DIF.Definitions.DIFValueContainer> {
  const mock: [string, DIF.Definitions.DIFValueContainer][] = [
    ['$std',         { type: 'object', name: 'std' }         as unknown as DIF.Definitions.DIFValueContainer],
    ['$file_server', { type: 'object', name: 'file_server' } as unknown as DIF.Definitions.DIFValueContainer],
    ['$webrtc',      { type: 'object', name: 'webrtc' }      as unknown as DIF.Definitions.DIFValueContainer],
    ['$Math',        { type: 'object', name: 'Math' }        as unknown as DIF.Definitions.DIFValueContainer],
  ]
  return new Map(mock)
}
export function getComHubMetadata(): ComHubMetadata {
  return Datex.comHub.getMetadata() as ComHubMetadata
}