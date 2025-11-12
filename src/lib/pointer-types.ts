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
}

// Get type name from DIF value
export function getTypeName(difContainer: DIF.Definitions.DIFContainer): string {
  // Check if DIF container has a type property (e.g., '0c0000' for map)
  if (typeof difContainer === 'object' && difContainer !== null && 'type' in difContainer && difContainer.type) {
    const difType = difContainer.type as string
    
    // Map DIF type codes to our type names
    if (difType === '0c0000') return 'map'
    // Add more type mappings here as needed
  }
  
  // Extract value from container
  const value = typeof difContainer === 'object' && difContainer !== null && 'value' in difContainer 
    ? (difContainer as Record<string, unknown>).value 
    : difContainer
  
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
  }
  
  return 'null' // fallback to null for unknown types
}
