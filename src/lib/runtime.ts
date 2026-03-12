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
  return new Map()
}