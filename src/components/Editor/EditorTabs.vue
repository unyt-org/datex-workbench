<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

// ── Props ──────────────────────────────────────────────────────────
interface Props {
    openFiles: string[];
    activeFile: string;
    previewTab?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'tab-click': [path: string];
    'tab-close': [path: string];
}>();

// ── Helpers ────────────────────────────────────────────────────────
function fileName(path: string): string {
    return path.split('/').pop() ?? path;
}

function getExtension(path: string): string {
    const name = fileName(path);
    const dot = name.lastIndexOf('.');
    return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

/** Very simple language color dots — matches common file types */
function extColor(path: string): string {
    const ext = getExtension(path);
    const map: Record<string, string> = {
        ts: '#3178c6',
        tsx: '#3178c6',
        js: '#f7df1e',
        jsx: '#f7df1e',
        vue: '#42b883',
        css: '#56a8f5',
        scss: '#c76494',
        html: '#e44d26',
        json: '#a8c061',
        md: '#ccc',
    };
    return map[ext] ?? '#888';
}

function handleMiddleClick(e: MouseEvent, path: string) {
    if (e.button === 1) {
        e.preventDefault();
        emit('tab-close', path);
    }
}
</script>

<template>
    <div class="editor-tabs">
        <div
            v-for="path in props.openFiles"
            :key="path"
            :class="
                cn(
                    'editor-tab',
                    props.activeFile === path && 'editor-tab--active',
                    props.previewTab === path && 'editor-tab--preview',
                )
            "
            @click="emit('tab-click', path)"
            @dblclick="emit('tab-click', path)"
            @mousedown="handleMiddleClick($event, path)"
        >
            <!-- Language dot -->
            <span class="editor-tab__dot" :style="{ background: extColor(path) }" />

            <!-- Filename -->
            <span class="editor-tab__name">{{ fileName(path) }}</span>

            <!-- Close button -->
            <button class="editor-tab__close" title="Close" @click.stop="emit('tab-close', path)">
                <X class="h-3 w-3" />
            </button>
        </div>
    </div>
</template>

<style scoped>
.editor-tabs {
    display: flex;
    align-items: stretch;
    height: 36px;
    background: var(--color-sidebar);
    border-bottom: 1px solid var(--color-sidebar-border);
    overflow-x: auto;
    scrollbar-width: none;
    flex-shrink: 0;
}

.editor-tabs::-webkit-scrollbar {
    display: none;
}

.editor-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    min-width: 0;
    max-width: 180px;
    flex-shrink: 0;
    cursor: pointer;
    border-right: 1px solid var(--color-sidebar-border);
    color: var(--color-muted-foreground);
    font-size: 13px;
    white-space: nowrap;
    position: relative;
    transition:
        background 0.1s,
        color 0.1s;
    user-select: none;
}

.editor-tab:hover {
    background: var(--color-sidebar-accent);
    color: var(--color-sidebar-accent-foreground);
}

.editor-tab--active {
    background: rgba(255, 255, 255, 0.06);
    color: var(--color-sidebar-foreground);
    border-top: 1px solid var(--color-primary, #3b82f6);
}

.editor-tab--active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: transparent;
}

.editor-tab--preview {
    font-style: italic;
}

.editor-tab__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    opacity: 0.85;
}

.editor-tab__name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

.editor-tab__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 3px;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0;
    flex-shrink: 0;
    transition:
        opacity 0.15s,
        background 0.15s;
}

.editor-tab:hover .editor-tab__close,
.editor-tab--active .editor-tab__close {
    opacity: 0.6;
}

.editor-tab__close:hover {
    opacity: 1 !important;
    background: rgba(255, 255, 255, 0.1);
}
</style>
