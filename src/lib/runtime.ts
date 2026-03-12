import { Runtime } from '@unyt/datex'
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

export function getPointers(): Map<string, unknown> {
  const mock: [string, unknown][] = [
    ['$std',         { type: 'object', name: 'std' }],
    ['$file_server', { type: 'object', name: 'file_server' }],
    ['$webrtc',      { type: 'object', name: 'webrtc' }],
    ['$Math',        { type: 'object', name: 'Math' }],
  ]
  return new Map(mock)
}