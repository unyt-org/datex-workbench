import type { DIF, Runtime } from '@unyt/datex';
import { getPointerIdFromValue } from './pointer-types';

/**
 * Pair of pointer and its value for sequential ID mapping
 */
export interface PointerValuePair {
  pointer: unknown
  value: unknown
}

/**
 * Replace Ref objects with their pointer ID strings recursively
 * 
 * @param value - The value to process
 * @param refToIdMap - Map of Ref objects to their pointer IDs
 * @returns Processed value with Refs replaced by pointer ID strings
 */
export function replaceRefsWithIds(value: unknown, refToIdMap: Map<object, string>): unknown {
  // Check if it's a Ref object
  if (value && typeof value === 'object' && value.constructor.name === 'Ref') {
    return refToIdMap.get(value) || value;
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => replaceRefsWithIds(item, refToIdMap));
  }
  
  // Handle plain objects
  if (value && typeof value === 'object' && value.constructor.name === 'Object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = replaceRefsWithIds(val, refToIdMap);
    }
    return result;
  }
  
  // Return primitives as-is
  return value;
}

/**
 * Recursively convert values, replacing Ref objects with their sequential IDs
 */
function convertValueWithSequentialIds(
  value: unknown,
  refToIdMap: WeakMap<object, string>
): unknown {
  // Handle Ref objects - replace with sequential ID
  if (value && typeof value === 'object' && value.constructor.name === 'Ref') {
    // First try to get from WeakMap
    const sequentialId = refToIdMap.get(value)
    if (sequentialId) {
      return sequentialId
    }
    // Fallback: extract pointerAddress directly
    const pointerId = getPointerIdFromValue(value)
    return pointerId || value
  }

  // Handle arrays recursively
  if (Array.isArray(value)) {
    return value.map(item => convertValueWithSequentialIds(item, refToIdMap))
  }

  // Handle plain objects recursively
  if (value && typeof value === 'object' && value.constructor.name === 'Object') {
    const converted: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      converted[key] = convertValueWithSequentialIds(val, refToIdMap)
    }
    return converted
  }

  // Primitives and other types - return as-is
  return value
}

/**
 * Build a pointer map with sequential IDs from pointer-value pairs
 * 
 * @param pointerValuePairs Array of {pointer, value} pairs
 * @param additionalValues Optional additional values to include in the map
 * @param Datex The DATEX runtime instance for DIF conversion
 * @returns Map of sequential pointer IDs to DIF containers
 */
export function buildPointerMap(
  pointerValuePairs: PointerValuePair[],
  additionalValues: unknown[],
  Datex: Runtime
): Map<string, DIF.Definitions.DIFValueContainer> {
  // Build values array: [value0, pointer0, value1, pointer1, ..., ...additionalValues]
  const values: unknown[] = []
  for (const pair of pointerValuePairs) {
    values.push(pair.value)
    values.push(pair.pointer)
  }
  values.push(...additionalValues)

  // Build WeakMap: pointer -> sequential ID
  const refToIdMap = new WeakMap<object, string>()
  for (let i = 0; i < pointerValuePairs.length; i++) {
    const pair = pointerValuePairs[i]
    if (!pair) continue
    
    const pointer = pair.pointer
    if (pointer && typeof pointer === 'object') {
      // Sequential IDs for pointers: $0000000000000001, $0000000000000003, $0000000000000005, etc.
      const index = i * 2 + 1 // Pointers are at odd indices (1, 3, 5, ...)
      const sequentialId = `$${String(index).padStart(16, '0')}`
      refToIdMap.set(pointer, sequentialId)
    }
  }

  // Convert all values, replacing Refs with sequential IDs
  const convertedValues = values.map(value => 
    convertValueWithSequentialIds(value, refToIdMap)
  )

  // Build final pointer map with DIF conversion
  const pointers = new Map<string, DIF.Definitions.DIFValueContainer>()
  
  for (let i = 0; i < convertedValues.length; i++) {
    const value = convertedValues[i]
    const sequentialId = `$${String(i).padStart(16, '0')}`
    const difValue = Datex.dif.convertJSValueToDIFValueContainer(value) as DIF.Definitions.DIFValueContainer
    pointers.set(sequentialId, difValue)
  }

  return pointers
}
