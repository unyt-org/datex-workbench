/**
 * Node types in the layout tree
 */
export enum NodeType {
  /** A leaf panel node containing data */
  Panel = 'panel',
  /** A split node containing two child nodes */
  Split = 'split',
}

/**
 * Directions for split nodes
 */
export enum SplitDirection {
  /** Vertical split (children side by side) */
  Vertical = 'vertical',
  /** Horizontal split (children stacked) */
  Horizontal = 'horizontal',
}

/**
 * A panel node in the layout tree
 * @template T Type of panel data (default is `Record<string, any>`)
 */
export interface PanelNode<T extends Record<string, any> = Record<string, any>> {
  /** Node type: always `Panel` */
  type: NodeType.Panel
  /** Unique identifier */
  id: string
  /** Display label for the panel */
  label: string
  /** Panel-specific data */
  data: T
}

/**
 * A split node in the layout tree
 * @template T Type of panel data (default is `Record<string, any>`)
 */
export interface SplitNode<T extends Record<string, any> = Record<string, any>> {
  /** Node type: always `Split` */
  type: NodeType.Split
  /** Unique identifier */
  id: string
  /** Direction of the split */
  direction: SplitDirection
  /** Ratio between first and second child (0..1) */
  splitRatio: number
  /** Exactly two children (left/top and right/bottom depending on direction) */
  children: [LayoutNode<T>, LayoutNode<T>]
}

/**
 * A node in the layout tree (either a panel or a split)
 * @template T Type of panel data
 */
export type LayoutNode<T extends Record<string, any> = Record<string, any>> =
  | PanelNode<T>
  | SplitNode<T>

/**
 * Collapse sides for split nodes
 */
export enum CollapseSide {
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom',
  None = '',
}
