import { type LayoutNode, NodeType, type PanelNode, type SplitNode } from '@/types/layout'
import { getNewPanelId } from '@/utils/idPanelGenerator.ts'
import { reactive, toRaw } from 'vue'

/** Default type for panel data */
type DefaultData = Record<string, any>

/** Reactive root of the layout tree */
const layoutTree = reactive<LayoutNode<DefaultData>>({
  type: NodeType.Panel,
  id: getNewPanelId(),
  label: 'Root',
  data: {},
})

/**
 * Provides the reactive layout tree
 * @template T Type of panel data (default is `Record<string, any>`)
 * @returns An object containing the reactive `layoutTree`
 */
export function useLayoutTree<T extends Record<string, any> = DefaultData>() {
  return { layoutTree: layoutTree as LayoutNode<T> }
}

/**
 * Deep clones a layout node and generates new IDs for all nodes in the subtree
 * @template T Type of panel data
 * @param node The node to clone
 * @returns A reactive clone of the node with new IDs
 */
export function cloneNodeWithNewId<T extends Record<string, any>>(
  node: LayoutNode<T>,
): LayoutNode<T> {
  const rawNode = toRaw(node)

  let clone: LayoutNode<T>
  if (rawNode.type === NodeType.Split) {
    clone = {
      ...rawNode,
      id: getNewPanelId(),
      children: [cloneNodeWithNewId(rawNode.children[0]), cloneNodeWithNewId(rawNode.children[1])],
    }
  } else {
    clone = {
      ...rawNode,
      id: getNewPanelId(),
      data: reactive(deepCloneData(rawNode.data)) as T,
    }
  }

  return reactive(clone) as LayoutNode<T>
}

/**
 * Deep clones a data object, preserving nested objects, arrays, and Date instances
 * @template T Type of the data object
 * @param data The data to clone
 * @returns A deep clone of the data
 */
function deepCloneData<T extends Record<string, any>>(data: T): T {
  if (data === null || typeof data !== 'object') return data
  if (data instanceof Date) return new Date(data.getTime()) as any
  if (Array.isArray(data)) return data.map(deepCloneData) as any

  const result: any = {}
  for (const key in data) {
    result[key] = deepCloneData(data[key])
  }
  return result
}

/**
 * Collapses a split node, keeping only the specified child and replacing the split with it
 * @template T Type of panel data
 * @param nodeToKeep The child node to keep
 */
export function collapseSplit<T extends Record<string, any>>(nodeToKeep: LayoutNode<T>): void {
  const parent = findParentById(nodeToKeep.id)
  if (!parent || parent.type !== NodeType.Split) return

  const index = parent.children.findIndex((c) => c.id === nodeToKeep.id)
  if (index === -1) return

  let newNode: LayoutNode<T>
  if (nodeToKeep.type === NodeType.Panel) {
    newNode = reactive({
      type: NodeType.Panel,
      id: getNewPanelId(),
      label: nodeToKeep.label,
      data: reactive(deepCloneData(nodeToKeep.data)),
    }) as LayoutNode<T>
  } else {
    const children: [LayoutNode<T>, LayoutNode<T>] = [
      cloneNodeWithNewId(nodeToKeep.children[0]),
      cloneNodeWithNewId(nodeToKeep.children[1]),
    ]
    newNode = reactive({
      type: NodeType.Split,
      id: getNewPanelId(),
      direction: nodeToKeep.direction,
      splitRatio: nodeToKeep.splitRatio,
      children,
    }) as LayoutNode<T>
  }

  Object.assign(parent, newNode)
}

/**
 * Replaces the target panel's content with the source panel's content
 * @param target The panel to replace
 * @param source The panel to copy from
 */
export function replacePanel(target: PanelNode, source: PanelNode) {
  target.label = source.label
  target.data = deepCloneData(toRaw(source.data))
  target.id = getNewPanelId()
}

/**
 * Removes a node from its parent split and keeps the other child
 * @param sourceId The ID of the node to remove
 */
export function removeSourceFromParent(sourceId: string) {
  const parent = findParentById(sourceId)
  if (!parent || parent.type !== NodeType.Split) return

  const [left, right] = parent.children
  const nodeToKeep = left.id === sourceId ? right : left

  Object.assign(parent, cloneNodeWithNewId(toRaw(nodeToKeep)))
}

/**
 * Finds a node by ID in the layout tree
 * @template T Type of panel data
 * @param node The current node or root
 * @param id The ID of the node to find
 * @returns The node if found, otherwise null
 */
export function findNodeById<T extends Record<string, any>>(
  node: LayoutNode<T> | null,
  id: string,
): LayoutNode<T> | null {
  if (!node) return null
  if (node.id === id) return node
  if (node.type === NodeType.Split) {
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  return null
}

/**
 * Finds the parent split of a node by its ID
 * @template T Type of panel data
 * @param node The current node or root
 * @param id The ID of the child node
 * @returns The parent split node if found, otherwise null
 */
export function findNodeParent<T extends Record<string, any>>(
  node: LayoutNode<T>,
  id: string,
): SplitNode<T> | null {
  if (node.type === NodeType.Split) {
    for (const child of node.children) {
      if (child.id === id) return node
      const found = findNodeParent(child, id)
      if (found) return found
    }
  }
  return null
}

/**
 * Finds a parent split node by the ID of one of its children
 * @template T Type of panel data
 * @param id The ID of the child node
 * @returns The parent split node if found, otherwise null
 */
export function findParentById<T extends Record<string, any>>(id: string): SplitNode<T> | null {
  const { layoutTree } = useLayoutTree<T>()
  return findNodeParent(layoutTree, id)
}
