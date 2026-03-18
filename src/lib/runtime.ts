import type { RuntimeConfig } from '@unyt/datex'
import { DIF, Runtime } from '@unyt/datex'

export type ComHubMetadata = {
  endpoint: string
  interfaces: {
    uuid: string
    properties: Record<string, unknown>
    sockets: {
      uuid: string
      direction: string
      endpoint: string
      properties: Record<string, unknown>
    }[]
    is_waiting_for_socket_connections: boolean
  }[]
}

const defaultConfig: RuntimeConfig = {
  interfaces: [
    {
      type: 'websocket-client',
      config: {
        url: 'wss://example.unyt.land',
      },
    },
    {
      type: 'websocket-client',
      config: {
        url: 'wss://example.unyt.land',
      },
    },
  ],
}

export const Datex: Runtime = await Runtime.create(defaultConfig)

export function getPointers(): Map<string, DIF.Definitions.DIFValueContainer> {
  const values = [
    42,
    'Hello, World!',
    true,
    { a: 1, b: 2 },
    [1, 2, 3, 4, 5],
    {
      nested: {
        key: 'value',
        arr: [10, 20, 30],
      },
    },
  ]
  const pointers = new Map(
    values.map((value, index) => {
      const difValue = Datex.dif.convertJSValueToDIFValueContainer(
        value,
      ) as DIF.Definitions.DIFValueContainer
      return [`$${index.toString().padStart(16, '0')}`, difValue]
    }),
  )
  return pointers
}

export function getComHubMetadata(): ComHubMetadata {
  return Datex.comHub.getMetadata()
}


export async function removeInterface(interfaceUuid: string) {
  return await Datex.comHub.removeInterface(interfaceUuid as `com_interface::${string}`)
}
export async function removeSocket(socketUuid: string) {
  return await Datex.comHub.removeSocket(socketUuid as `socket::${string}`)
}