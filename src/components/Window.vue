<script setup lang="ts">
import { useDragDrop } from '@/composable/useDragDrop.ts';
import { collapseSplit } from '@/composable/useLayoutTree.ts';
import {
    CollapseSide,
    type LayoutNode,
    NodeType,
    SplitDirection,
    type SplitNode,
} from '@/types/layout.ts';
import { reactive } from 'vue';
import Window from './Window.vue';

const props = defineProps<{ node: LayoutNode }>();

/** Tracks the currently active node for gutter dragging */
const gutterDragState = reactive<{ activeNodeId: string | null }>({ activeNodeId: null });

/**
 * Destructure reusable drag & drop logic for this node
 */
const { dragState, dropPreview, onDragEnter, onDragLeave, onDragOver, onDrop, DropMode } =
    useDragDrop(props.node);

/**
 * Starts dragging the gutter of a split node
 */
function startGutterDrag(): void {
    dragState.active = true;
    gutterDragState.activeNodeId = props.node.id;
    dragState.nearCollapse = CollapseSide.None;
}

/**
 * Stops dragging the gutter and collapses a side if near a boundary
 */
function stopGutterDrag(): void {
    if (gutterDragState.activeNodeId !== props.node.id) return;
    if (props.node.type !== NodeType.Split) return; // only split nodes can be dragged

    gutterDragState.activeNodeId = null;
    dragState.active = false;

    if (dragState.nearCollapse) {
        collapseNearSide(props.node, dragState.nearCollapse);
    }

    dragState.nearCollapse = CollapseSide.None;
}

/**
 * Updates a split ratio of the node during gutter drag
 * and determines which side is near collapse
 * @param e MouseEvent triggered on gutter movement
 */
function onGutterDrag(e: MouseEvent): void {
    if (gutterDragState.activeNodeId !== props.node.id) return;

    const node = props.node as SplitNode;
    const ratio = calculateSplitRatio(e, node);
    node.splitRatio = ratio;
    dragState.nearCollapse = determineNearCollapse(ratio, node);
}

/**
 * Calculates the relative split ratio based on mouse position
 * @param e MouseEvent from gutter drag
 * @param node SplitNode being dragged
 * @returns number split ratio between 0.05 and 0.95
 */
function calculateSplitRatio(e: MouseEvent, node: SplitNode): number {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio =
        node.direction === SplitDirection.Vertical
            ? (e.clientX - rect.left) / rect.width
            : (e.clientY - rect.top) / rect.height;

    // Clamp ratio to prevent collapse beyond the threshold
    return Math.min(0.95, Math.max(0.05, ratio));
}

/**
 * Determines which side of the split is near collapse
 * @param ratio Current split ratio (0..1)
 * @param node SplitNode being dragged
 * @returns CollapseSide if near a boundary, otherwise CollapseSide.None
 */
function determineNearCollapse(ratio: number, node: SplitNode): CollapseSide {
    if (ratio <= 0.15)
        return node.direction === SplitDirection.Vertical ? CollapseSide.Left : CollapseSide.Top;
    if (ratio >= 0.85)
        return node.direction === SplitDirection.Vertical
            ? CollapseSide.Right
            : CollapseSide.Bottom;
    return CollapseSide.None;
}

/**
 * Collapses one side of a split node, keeping only the opposite side
 * @param node SplitNode to collapse
 * @param side Side to collapse (left/top or right/bottom)
 */
function collapseNearSide(node: SplitNode, side: CollapseSide): void {
    const keepIndex = side === CollapseSide.Left || side === CollapseSide.Top ? 1 : 0;
    const nodeToKeep = node.children[keepIndex];
    if (!nodeToKeep) return;
    collapseSplit(nodeToKeep);
}
</script>

<template>
    <!-- PANEL -->
    <div
        v-if="node.type === NodeType.Panel"
        class="relative h-full w-full overflow-hidden bg-neutral-50 transition-opacity dark:bg-neutral-950"
        @dragenter="onDragEnter"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
    >
        <div
            class="absolute top-0 right-0 left-0 flex h-6 cursor-grab items-center justify-between border-b border-neutral-300/50 bg-neutral-200/70 px-2 text-xs text-neutral-700 backdrop-blur-sm select-none active:cursor-grabbing dark:bg-neutral-800/70 dark:text-neutral-300"
            draggable="true"
            @dragstart="
                (e) => {
                    e.dataTransfer?.setData('text/plain', node.id);
                }
            "
        >
            <div class="flex items-center gap-1">
                <svg
                    class="h-3 w-3 opacity-70"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="5" cy="10" r="2" />
                    <circle cx="10" cy="10" r="2" />
                    <circle cx="15" cy="10" r="2" />
                </svg>
                <span>{{ node.id }}</span>
            </div>
        </div>

        <!-- Drop preview overlay -->
        <div
            v-if="dropPreview.active"
            class="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm transition-all dark:bg-black/20"
        >
            <!-- Area highlight -->
            <div
                class="border-primary/40 bg-primary/20 absolute inset-0 rounded-lg border-2 transition-all duration-150"
                :class="{
                    'clip-top': dropPreview.area === 'top',
                    'clip-bottom': dropPreview.area === 'bottom',
                    'clip-left': dropPreview.area === 'left',
                    'clip-right': dropPreview.area === 'right',
                    'clip-center': dropPreview.area === 'center',
                }"
            ></div>

            <div
                class="bg-primary text-primary-foreground rounded-md px-3 py-1 text-xs shadow-lg backdrop-blur-md"
            >
                {{ dropPreview.mode === DropMode.Insert ? 'Insert' : 'Replace' }}
            </div>
        </div>
    </div>

    <!-- SPLIT -->
    <div
        v-else
        class="flex h-full w-full transition-all select-none"
        :class="node.direction === SplitDirection.Vertical ? 'flex-row' : 'flex-col'"
        @mousemove="onGutterDrag"
        @mouseup="stopGutterDrag"
    >
        <!-- first child -->
        <div
            class="flex-none transition-opacity duration-150"
            :class="{
                'opacity-30': dragState.nearCollapse === 'left' || dragState.nearCollapse === 'top',
            }"
            :style="{ flexBasis: `${node.splitRatio * 100}%` }"
        >
            <Window :node="node.children[0]" />
        </div>

        <!-- gutter -->
        <div
            :class="[
                node.direction === SplitDirection.Vertical
                    ? 'm-1 w-1 cursor-col-resize rounded bg-neutral-100 hover:bg-neutral-300 dark:bg-neutral-950 dark:hover:bg-neutral-700'
                    : 'm-1 h-1 cursor-row-resize rounded bg-neutral-100 hover:bg-neutral-300 dark:bg-neutral-950 dark:hover:bg-neutral-700',
            ]"
            @mousedown="startGutterDrag"
        ></div>

        <!-- second child -->
        <div
            class="flex-auto transition-opacity duration-150"
            :class="{
                'opacity-30':
                    dragState.nearCollapse === 'right' || dragState.nearCollapse === 'bottom',
            }"
        >
            <Window :node="node.children[1]" />
        </div>
    </div>
</template>

<style scoped>
.clip-top {
    clip-path: inset(0 0 50% 0);
    transition: clip-path 0.3s ease-in-out;
}

.clip-bottom {
    clip-path: inset(50% 0 0 0);
    transition: clip-path 0.3s ease-in-out;
}

.clip-left {
    clip-path: inset(0 50% 0 0);
    transition: clip-path 0.3s ease-in-out;
}

.clip-right {
    clip-path: inset(0 0 0 50%);
    transition: clip-path 0.3s ease-in-out;
}

.clip-center {
    clip-path: inset(10% 10% 10% 10%);
    transition: clip-path 0.3s ease-in-out;
}
</style>
