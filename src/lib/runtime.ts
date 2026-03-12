import { Runtime, DIF } from '@unyt/datex'
import type { RuntimeConfig } from '@unyt/datex'

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

export const Datex: Runtime = await Runtime.create(defaultConfig)

export function getPointers(): Map<string, DIF.Definitions.DIFValueContainer> {
  const mock: [string, DIF.Definitions.DIFValueContainer][] = [
    ['$std',         { type: 'object', name: 'std' }  as unknown as DIF.Definitions.DIFValueContainer],
    ['$file_server', { type: 'object', name: 'file_server' } as unknown as DIF.Definitions.DIFValueContainer],
    ['$webrtc',      { type: 'object', name: 'webrtc' } as unknown as DIF.Definitions.DIFValueContainer],
    ['$Math',        { type: 'object', name: 'Math' } as unknown as DIF.Definitions.DIFValueContainer],
  ]
  return new Map(mock)
}