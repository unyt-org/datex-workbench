/**
 * Shared Types for Pointer/Tree Components
 * 
 * This file contains type definitions used across multiple components
 * to avoid duplication and maintain consistency.
 */

/**
 * Represents a node in the pointer tree structure
 * Can have nested children forming a recursive tree
 */
export interface PointerNode {
  /** Unique identifier for the node */
  id: string
  
  /** Display name shown in the tree */
  label: string
  
  /** File path or location */
  path: string
  
  /** Optional type classification */
  type?: string
  
  /** Optional color preview (hex color code) */
  valuePreview?: string
  
  /** Optional nested children nodes */
  children?: PointerNode[]
}
