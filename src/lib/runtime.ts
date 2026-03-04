import { Runtime, DIF } from '@unyt/datex';
export type { DIF } from '@unyt/datex'

/**
 * The default configuration for the Datex runtime.
 */
const defaultConfig = {
    // interfaces: [{
    //     type: "websocket-client",
    //     config: { address: "wss://example.unyt.land" },
    // }],
    debug: false, // set to true to show info/debug messages
};

/**
 * The default instance of the Datex runtime.
 */
export const Datex: Runtime = await Runtime.create(defaultConfig, {
    allow_unsigned_blocks: true,
});

/**
 * Returns a map of pointers that are currently loaded in the runtime.
 * The keys are pointer identifiers and the values are DIFContainer objects
 * representing the values stored at the pointer.
 */
export function getPointers(): Map<string, DIF.Definitions.DIFContainer> {
    const mock: [string, DIF.Definitions.DIFContainer][] = [
      ['$std',         { type: 'object', name: 'std' }         as unknown as DIF.Definitions.DIFContainer],
      ['$file_server', { type: 'object', name: 'file_server' } as unknown as DIF.Definitions.DIFContainer],
      ['$webrtc',      { type: 'object', name: 'webrtc' }      as unknown as DIF.Definitions.DIFContainer],
      ['$Math',        { type: 'object', name: 'Math' }        as unknown as DIF.Definitions.DIFContainer],
    ]
    return new Map(mock)
  }
