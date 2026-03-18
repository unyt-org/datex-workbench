import type { DIF } from '@unyt/datex'

// Type configuration interface
export interface TypeConfig {
  displayName: string
  preview: (value: unknown) => string
  isExpandable: boolean
}

// Type configurations for all supported types
export const TYPE_CONFIGS: Record<string, TypeConfig> = {
  'text': {
    displayName: 'text',
    preview: () => 'text',
    isExpandable: false
  },
  
  'endpoint': {
    displayName: 'endpoint',
    preview: () => 'endpoint',
    isExpandable: false
  },
  
  'boolean': {
    displayName: 'boolean',
    preview: (value: unknown) => value ? 'true' : 'false',
    isExpandable: false
  },
  
  'integer': {
    displayName: 'integer',
    preview: () => 'integer',
    isExpandable: false
  },
  
  'decimal': {
    displayName: 'decimal',
    preview: () => 'decimal',
    isExpandable: false
  },
  
  'null': {
    displayName: 'null',
    preview: () => 'null',
    isExpandable: false
  },
  
  'list': {
    displayName: 'list',
    preview: () => `[...]`,
    isExpandable: true
  },
  
  'map': {
    displayName: 'map',
    preview: () => '{...}',
    isExpandable: true
  },
  
  'object': {
    displayName: 'object',
    preview: () => '{...}',
    isExpandable: true
  },
}

// Get type name from DIF value
export function getTypeName(difValueContainer: DIF.Definitions.DIFValueContainer): string {
  // Check if DIF container has a type property (e.g., '0c0000' for map)
  if (typeof difValueContainer === 'object' && difValueContainer !== null && 'type' in difValueContainer && difValueContainer.type) {
    const difType = difValueContainer.type as string
    
    // Map DIF type codes to our type names
    if (difType === '0c0000') return 'map'
    // Add more type mappings here as needed
  }
  
  // Extract value from container
  const value = typeof difValueContainer === 'object' && difValueContainer !== null && 'value' in difValueContainer 
    ? (difValueContainer as Record<string, unknown>).value 
    : difValueContainer
  
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return 'text'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'decimal'
  if (Array.isArray(value)) return 'list'
  if (value instanceof Map) return 'map'
  if (typeof value === 'object') {
    if ('name' in value || 'endpoint' in value || 'location' in value) {
      return 'endpoint'
    }
    // Plain JavaScript object
    return 'object'
  }
  
  return 'null' // fallback to null for unknown types
}

/**
 * Check if a DIF container represents a pointer reference
 */
export function isPointerReference(difValueContainer: DIF.Definitions.DIFValueContainer): boolean {
  // Direct string format: "$0000000000000001"
  if (typeof difValueContainer === 'string' && difValueContainer.startsWith('$')) {
    return true
  }
  
  // DIF container format with value property
  if (typeof difValueContainer === 'object' && difValueContainer !== null && 'value' in difValueContainer) {
    const value = (difValueContainer as Record<string, unknown>).value
    if (typeof value === 'string' && value.startsWith('$')) {
      return true
    }
  }
  
  return false
}

/**
 * Extract pointer ID from various DIF container formats
 */
export function extractPointerId(difValueContainer: DIF.Definitions.DIFValueContainer): string | null {
  // Direct string format
  if (typeof difValueContainer === 'string' && difValueContainer.startsWith('$')) {
    return difValueContainer
  }
  
  // DIF container format with value property
  if (typeof difValueContainer === 'object' && difValueContainer !== null && 'value' in difValueContainer) {
    const value = (difValueContainer as Record<string, unknown>).value
    if (typeof value === 'string' && value.startsWith('$')) {
      return value
    }
  }
  
  return null
}

/**
 * Get pointer ID from a Ref object (DATEX pointer instance)
 * Returns the pointer ID string (with $ prefix) or null if not a Ref
 */
export function getPointerIdFromValue(value: unknown): string | null {
  // Check if it's a Ref object
  if (value && typeof value === 'object' && value.constructor.name === 'Ref') {
    // Extract pointerAddress from prototype (it's a hex string without $)
    const proto = Object.getPrototypeOf(value)
    if (proto && 'pointerAddress' in proto) {
      const address = proto.pointerAddress
      if (typeof address === 'string') {
        return `$${address}`
      }
    }
  }
  
  return null
}
