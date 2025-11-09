import {
    cloneNodeWithNewId,
    findNodeById,
    removeSourceFromParent,
    replacePanel,
    useLayoutTree,
} from '@/composable/useLayoutTree.ts';
import {
    CollapseSide,
    type LayoutNode,
    NodeType,
    SplitDirection,
    type SplitNode,
} from '@/types/layout.ts';
import { getNewPanelId } from '@/utils/idPanelGenerator.ts';
import { reactive } from 'vue';

/**
 * Provides reactive state and handlers for drag and drop operations on layout nodes
 * @param node The node that will act as the drop target
 * @returns An object containing drag state, drop preview, event handlers, and DropMode enum
 */
export function useDragDrop(node: LayoutNode) {
    /**
     * Defines the possible drop areas relative to a node
     */
    enum DropArea {
        Top = 'top',
        Bottom = 'bottom',
        Left = 'left',
        Right = 'right',
        Center = 'center',
    }

    /**
     * Defines drop modes: either insert the dragged panel or replace the target
     */
    enum DropMode {
        Insert = 'insert',
        Replace = 'replace',
    }

    /** Reactive state for the drop preview overlay */
    const dropPreview = reactive<{
        active: boolean;
        area: DropArea | null;
        mode: DropMode;
        x: number;
        y: number;
    }>({
        active: false,
        area: null,
        mode: DropMode.Insert,
        x: 0,
        y: 0,
    });

    /** Reactive state for gutter dragging (used externally if needed) */
    const dragState = reactive<{
        active: boolean;
        nearCollapse: CollapseSide;
    }>({
        active: false,
        nearCollapse: CollapseSide.None,
    });

    /**
     * Determines which drop area the mouse is currently in relative to the node
     * @param x Normalized X position (0..1)
     * @param y Normalized Y position (0..1)
     * @returns DropArea enum
     */
    function chooseAreaForDrop(x: number, y: number): DropArea {
        const edge = 0.25;
        const distTop = y;
        const distBottom = 1 - y;
        const distLeft = x;
        const distRight = 1 - x;
        const minDist = Math.min(distTop, distBottom, distLeft, distRight);

        if (minDist > edge) return DropArea.Center;
        if (minDist === distTop) return DropArea.Top;
        if (minDist === distBottom) return DropArea.Bottom;
        if (minDist === distLeft) return DropArea.Left;
        return DropArea.Right;
    }

    /** Counter to track nested dragenter/dragleave events */
    let dragCounter = 0;

    /**
     * Handles dragenter event
     * @param e DragEvent
     */
    function onDragEnter(e: DragEvent) {
        e.preventDefault();
        dragCounter++;
        dropPreview.active = true;
    }

    /**
     * Handles dragleave event
     * @param e DragEvent
     */
    function onDragLeave(e: DragEvent) {
        e.preventDefault();
        dragCounter--;
        if (dragCounter <= 0) {
            dropPreview.active = false;
            dragCounter = 0;
        }
    }

    /**
     * Handles dragover event and updates drop preview
     * @param e DragEvent
     */
    function onDragOver(e: DragEvent) {
        e.preventDefault();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        dropPreview.x = e.clientX;
        dropPreview.y = e.clientY;
        dropPreview.area = chooseAreaForDrop(x, y);
        dropPreview.mode =
            dropPreview.area === DropArea.Center ? DropMode.Replace : DropMode.Insert;
    }

    /**
     * Handles drop event
     * @param e DragEvent
     */
    function onDrop(e: DragEvent) {
        e.preventDefault();
        dragCounter = 0;
        dropPreview.active = false;

        const targetNode = node;
        if (targetNode.type !== NodeType.Panel) return; // drop only on panels

        const sourceId: string = e.dataTransfer?.getData('text/plain') as string;
        if (!sourceId) return;

        const { layoutTree } = useLayoutTree();
        const sourceNode = findNodeById(layoutTree, sourceId);
        if (!sourceNode || sourceNode.type !== NodeType.Panel) return; // only panels can be dragged

        const area = dropPreview.area;
        const mode = dropPreview.mode;

        // ignore dropping on itself by replace mode
        if (sourceId === targetNode.id && mode === DropMode.Replace) return;

        if (mode === DropMode.Replace) {
            replacePanel(targetNode, sourceNode);
            removeSourceFromParent(sourceId);
            return;
        }

        // Insert: create a new split node
        const splitDirection =
            area === DropArea.Left || area === DropArea.Right
                ? SplitDirection.Vertical
                : SplitDirection.Horizontal;

        const isBefore =
            (splitDirection === SplitDirection.Vertical && area === DropArea.Left) ||
            (splitDirection === SplitDirection.Horizontal && area === DropArea.Top);

        const newSplit: SplitNode = {
            type: NodeType.Split,
            id: getNewPanelId(),
            direction: splitDirection,
            splitRatio: 0.5,
            children: isBefore
                ? [cloneNodeWithNewId(sourceNode), cloneNodeWithNewId(node)]
                : [cloneNodeWithNewId(node), cloneNodeWithNewId(sourceNode)],
        };

        // Replace target node with new split
        Object.assign(node, newSplit);
    }

    return { dragState, dropPreview, onDragEnter, onDragOver, onDragLeave, onDrop, DropMode };
}
