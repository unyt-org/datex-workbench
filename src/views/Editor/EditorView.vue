<script setup lang="ts">
import { lazy, Workspace } from 'modern-monaco';
import { ref, onMounted } from 'vue';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import EditorSidebar from '@/components/Editor/EditorSidebar.vue';
import EditorTabs from '@/components/Editor/EditorTabs.vue';
import type { FileTreeNode } from '@/types/FileTree';
import { getFileDragPath } from '@/composable/useFileDragDrop';
import * as tabs from '@/composable/useEditorTabs';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// ── Workspace setup ────────────────────────────────────────────────
const workspace = new Workspace({
    initialFiles: {
        'index.html': `<html><body>...</body></html>`,
        'main.js': `console.log("Hello, world!")`,
    },
    entryFile: 'main.js',
});

// ── Expanded state persistence ─────────────────────────────────────
const EXPANDED_KEY = 'editor-expanded-folders';

function getExpandedPaths(): Set<string> {
    try {
        const raw = localStorage.getItem(EXPANDED_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function saveExpandedPaths() {
    const paths: string[] = [];
    function collect(nodes: FileTreeNode[]) {
        for (const n of nodes) {
            if (n.type === 'folder' && n.isExpanded) paths.push(n.path);
            if (n.children) collect(n.children);
        }
    }
    collect(tree.value);
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(paths));
}

// ── Reactive state ─────────────────────────────────────────────────
const tree = ref<FileTreeNode[]>([]);
const isEditorDragOver = ref(false);

const EDITOR_OPEN_FILES_KEY = 'editor-open-files';
const EDITOR_CURRENT_FILE_KEY = 'editor-current-file';

function saveTabs() {
    localStorage.setItem(EDITOR_OPEN_FILES_KEY, JSON.stringify(tabs.openFilesList.value));
    localStorage.setItem(EDITOR_CURRENT_FILE_KEY, tabs.activeFile.value);
}

// ── Tree utilities ─────────────────────────────────────────────────
function findNode(nodes: FileTreeNode[], path: string): FileTreeNode | undefined {
    for (const node of nodes) {
        if (node.path === path) return node;
        if (node.children) {
            const found = findNode(node.children, path);
            if (found) return found;
        }
    }
    return undefined;
}

function findFirstFile(nodes: FileTreeNode[]): string | null {
    for (const node of nodes) {
        if (node.type === 'file') return node.path;
        if (node.children) {
            const found = findFirstFile(node.children);
            if (found) return found;
        }
    }
    return null;
}

/** Expand all parent folders for a given path and persist */
function expandParents(filePath: string) {
    const parts = filePath.split('/').filter(Boolean);
    let currentPath = '';
    for (let i = 0; i < parts.length - 1; i++) {
        currentPath += '/' + parts[i];
        const node = findNode(tree.value, currentPath);
        if (node && node.type === 'folder') node.isExpanded = true;
    }
    saveExpandedPaths();
}

// ── Tree loading ───────────────────────────────────────────────────
async function loadTree(dirPath: string, expandedPaths: Set<string>): Promise<FileTreeNode[]> {
    try {
        const entries = await workspace.fs.readDirectory(dirPath);
        const nodes: FileTreeNode[] = [];

        for (const [rawName, type] of entries) {
            const name = decodeURIComponent(rawName);
            const path = dirPath === '/' ? `/${name}` : `${dirPath}/${name}`;

            if (type === 2) {
                const children = await loadTree(path, expandedPaths);
                const existing = findNode(tree.value, path);
                nodes.push({
                    name,
                    path,
                    type: 'folder',
                    children,
                    isExpanded: existing?.isExpanded ?? expandedPaths.has(path),
                });
            } else if (type === 1) {
                nodes.push({ name, path, type: 'file' });
            }
        }

        // Sort: folders first, then files, alphabetically
        nodes.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        return nodes;
    } catch (error) {
        console.error(`Failed to load tree for ${dirPath}:`, error);
        return [];
    }
}

async function reloadTree() {
    const expandedPaths = getExpandedPaths();
    tree.value = await loadTree('/', expandedPaths);
}

// ── Event handlers ─────────────────────────────────────────────────

async function handleFileClick(filePath: string) {
    tabs.openFile(filePath, true); // true = open as preview
    await workspace.openTextDocument(filePath);
    saveTabs();
}

async function handleFileDblClick(filePath: string) {
    // Opening again as 'not preview' pins it
    tabs.openFile(filePath, false);
    await workspace.openTextDocument(filePath);
    saveTabs();
}

async function handleTabClick(filePath: string) {
    tabs.setActiveFile(filePath);
    await workspace.openTextDocument(filePath);
    saveTabs();
}

async function handleTabDblClick() {
    tabs.pinCurrentTab();
    saveTabs();
}

async function handleTabClose(filePath: string) {
    const previousActive = tabs.activeFile.value;
    const newActive = tabs.closeFile(filePath);
    saveTabs();

    if (previousActive !== newActive) {
        if (newActive) {
            await workspace.openTextDocument(newActive);
        } else {
            // Clear the editor or handle no open files appropriately
            // (modern-monaco defaults to empty if the path is invalid or we could just open nothing)
            // For now, if no tabs are open, it stays on the last view, which is standard.
        }
    }
}

function handleEditorDragOver(e: DragEvent) {
    if (getFileDragPath(e)) {
        e.preventDefault();
        isEditorDragOver.value = true;
    }
}

function handleEditorDragLeave() {
    isEditorDragOver.value = false;
}

async function handleEditorDrop(e: DragEvent) {
    e.preventDefault();
    isEditorDragOver.value = false;

    const path = getFileDragPath(e);
    if (path && !path.endsWith('/')) {
        // Only open files
        const node = findNode(tree.value, path);
        if (node && node.type === 'file') {
            tabs.openFile(path, false); // false = open as pinned
            await workspace.openTextDocument(path);
            saveTabs();
        }
    }
}

function handleToggleFolder(folderPath: string) {
    const node = findNode(tree.value, folderPath);
    if (node && node.type === 'folder') {
        node.isExpanded = !node.isExpanded;
        saveExpandedPaths();
    }
}

/** Ensure a folder is expanded (no toggle — used by context menu creation) */
function handleEnsureExpand(folderPath: string) {
    const node = findNode(tree.value, folderPath);
    if (node && node.type === 'folder' && !node.isExpanded) {
        node.isExpanded = true;
        saveExpandedPaths();
    }
}

async function handleCreateFile(filename: string) {
    try {
        const path = `/${filename}`;
        await workspace.fs.writeFile(path, '');
        await reloadTree();

        tabs.openFile(path);
        await workspace.openTextDocument(path);
        saveTabs();
    } catch (error) {
        console.error('Failed to create file:', error);
    }
}

async function handleCreateFolder(foldername: string) {
    try {
        const path = `/${foldername}`;
        await workspace.fs.createDirectory(path);
        await reloadTree();
        const node = findNode(tree.value, path);
        if (node) node.isExpanded = true;
        saveExpandedPaths();
    } catch (error) {
        console.error('Failed to create folder:', error);
    }
}

async function handleCreateFileInFolder(folderPath: string, filename: string) {
    try {
        const filePath = `${folderPath}/${filename}`;
        await workspace.fs.writeFile(filePath, '');
        await reloadTree();
        // Keep parent expanded
        const parent = findNode(tree.value, folderPath);
        if (parent) parent.isExpanded = true;
        saveExpandedPaths();

        // Open the new file
        tabs.openFile(filePath);
        await workspace.openTextDocument(filePath);
        saveTabs();
    } catch (error) {
        console.error('Failed to create file in folder:', error);
    }
}

async function handleCreateFolderInFolder(folderPath: string, foldername: string) {
    try {
        const newPath = `${folderPath}/${foldername}`;
        await workspace.fs.createDirectory(newPath);
        await reloadTree();
        // Keep parent expanded + expand new folder
        const parent = findNode(tree.value, folderPath);
        if (parent) parent.isExpanded = true;
        const newFolder = findNode(tree.value, newPath);
        if (newFolder) newFolder.isExpanded = true;
        saveExpandedPaths();
    } catch (error) {
        console.error('Failed to create folder in folder:', error);
    }
}

async function handleRenameItem(oldPath: string, newName: string) {
    try {
        const parts = oldPath.split('/');
        parts[parts.length - 1] = newName;
        const newPath = parts.join('/');

        await workspace.fs.rename(oldPath, newPath);
        await reloadTree();

        tabs.renameOpenFile(oldPath, newPath);
        saveTabs();

        if (tabs.activeFile.value === newPath) {
            await workspace.openTextDocument(newPath);
        }
    } catch (error) {
        console.error('Failed to rename:', error);
    }
}

async function handleDeleteItem(path: string) {
    try {
        await workspace.fs.delete(path, { recursive: true });
        await reloadTree();
        saveExpandedPaths();

        // If it's a folder, we might need to close multiple tabs
        // For now, let's close exactly the path or any paths under it
        const openFilesCopy = [...tabs.openFilesList.value];
        let changedActive = false;
        for (const openPath of openFilesCopy) {
            if (openPath === path || openPath.startsWith(path + '/')) {
                const oldActive = tabs.activeFile.value;
                const newActive = tabs.closeFile(openPath);
                if (oldActive !== newActive) {
                    changedActive = true;
                }
            }
        }

        saveTabs();
        if (changedActive && tabs.activeFile.value) {
            await workspace.openTextDocument(tabs.activeFile.value);
        }
    } catch (error) {
        console.error('Failed to delete:', error);
    }
}

async function handlePasteItems(targetPath: string, sourcePaths: string[], mode: 'cut' | 'copy') {
    try {
        const targetNode = findNode(tree.value, targetPath);
        const targetDir =
            targetNode?.type === 'folder'
                ? targetPath
                : targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';

        for (const srcPath of sourcePaths) {
            const destPath = await resolveDestPath(srcPath, targetDir, mode);
            if (!destPath) continue;

            if (mode === 'cut') {
                await workspace.fs.rename(srcPath, destPath);

                tabs.renameOpenFile(srcPath, destPath);
                if (tabs.activeFile.value === destPath) {
                    await workspace.openTextDocument(destPath);
                }
            } else {
                try {
                    const content = await workspace.fs.readFile(srcPath);
                    await workspace.fs.writeFile(destPath, content);
                } catch {
                    await workspace.fs.createDirectory(destPath);
                }
            }
        }

        saveTabs();
        await reloadTree();
        const target = findNode(tree.value, targetDir);
        if (target?.type === 'folder') target.isExpanded = true;
        saveExpandedPaths();
    } catch (error) {
        console.error('Failed to paste items:', error);
    }
}

async function handleMoveItem(srcPath: string, targetDir: string) {
    await handlePasteItems(targetDir, [srcPath], 'cut');
}

/**
 * Resolve a unique destination path for a paste.
 * Cut to same location → skip (returns null).
 * Name conflict → appends " copy", " copy 2", etc. with extension preserved.
 */
async function resolveDestPath(
    srcPath: string,
    targetDir: string,
    mode: 'cut' | 'copy',
): Promise<string | null> {
    const fileName = srcPath.split('/').pop() ?? '';
    const base = (targetDir === '/' ? '' : targetDir) + '/' + fileName;

    if (mode === 'cut' && srcPath === base) return null;
    if (!(await pathExists(base))) return base;

    const dotIdx = fileName.lastIndexOf('.');
    const stem = dotIdx > 0 ? fileName.slice(0, dotIdx) : fileName;
    const ext = dotIdx > 0 ? fileName.slice(dotIdx) : '';

    for (let n = 0; ; n++) {
        const suffix = n === 0 ? ' copy' : ` copy ${n + 1}`;
        const candidate = (targetDir === '/' ? '' : targetDir) + '/' + stem + suffix + ext;
        if (!(await pathExists(candidate))) return candidate;
    }
}

async function pathExists(path: string): Promise<boolean> {
    try {
        await workspace.fs.stat(path);
        return true;
    } catch {
        return false;
    }
}

// ── Initialize ─────────────────────────────────────────────────────
lazy({ workspace });

onMounted(async () => {
    await reloadTree();

    // Load tabs config
    let savedFiles: string[] = [];
    try {
        const raw = localStorage.getItem(EDITOR_OPEN_FILES_KEY);
        if (raw) savedFiles = JSON.parse(raw);
    } catch {}

    const savedActive = localStorage.getItem(EDITOR_CURRENT_FILE_KEY) || '';

    // Filter out any tabs that no longer exist
    savedFiles = savedFiles.filter((p) => findNode(tree.value, p));
    let finalActive = savedActive && findNode(tree.value, savedActive) ? savedActive : '';

    if (savedFiles.length === 0) {
        const firstFile = findFirstFile(tree.value);
        const fileToOpen = workspace.entryFile ? `/${workspace.entryFile}` : firstFile;
        if (fileToOpen && findNode(tree.value, fileToOpen)) {
            savedFiles.push(fileToOpen);
            finalActive = fileToOpen;
        }
    } else if (!finalActive) {
        finalActive = savedFiles[0]!;
    }

    tabs.initTabs(savedFiles, finalActive);
    if (finalActive) {
        await workspace.openTextDocument(finalActive);
        expandParents(finalActive);
    }
    saveTabs();
});
</script>

<template>
    <ResizablePanelGroup direction="horizontal" class="h-full">
        <ResizablePanel :default-size="20" :min-size="15" :max-size="40">
            <EditorSidebar
                :tree="tree"
                :current-file="tabs.activeFile.value"
                @file-click="handleFileClick"
                @file-dblclick="handleFileDblClick"
                @toggle-folder="handleToggleFolder"
                @ensure-expand="handleEnsureExpand"
                @create-file="handleCreateFile"
                @create-folder="handleCreateFolder"
                @create-file-in-folder="handleCreateFileInFolder"
                @create-folder-in-folder="handleCreateFolderInFolder"
                @rename-item="handleRenameItem"
                @delete-item="handleDeleteItem"
                @paste-items="handlePasteItems"
                @move-item="handleMoveItem"
            />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel :default-size="80">
            <div
                class="editor-area-wrapper relative flex h-full flex-col bg-[#1e1e1e]"
                @dragover="handleEditorDragOver"
                @dragleave="handleEditorDragLeave"
                @drop="handleEditorDrop"
            >
                <!-- Overlay when dragging a file over the editor -->
                <div
                    v-if="isEditorDragOver"
                    class="pointer-events-none absolute inset-0 z-50 flex items-center justify-center border-2 border-dashed border-blue-500/50 bg-blue-500/10"
                >
                    <div
                        class="bg-sidebar text-sidebar-foreground rounded px-4 py-2 text-sm shadow-lg"
                    >
                        {{ t('editor.dropToOpen') }}
                    </div>
                </div>

                <EditorTabs
                    v-if="tabs.openFilesList.value.length > 0"
                    :open-files="tabs.openFilesList.value"
                    :active-file="tabs.activeFile.value"
                    :preview-tab="tabs.previewFile.value"
                    @tab-click="handleTabClick"
                    @tab-dblclick="handleTabDblClick"
                    @tab-close="handleTabClose"
                />

                <div
                    class="editor-container min-h-0 flex-1"
                    :style="{ visibility: tabs.activeFile.value ? 'visible' : 'hidden' }"
                >
                    <monaco-editor></monaco-editor>
                </div>

                <div
                    v-show="!tabs.activeFile.value"
                    class="pointer-events-none absolute inset-0 top-[37px] flex items-center justify-center bg-[#1e1e1e] opacity-50 select-none"
                >
                    {{ t('editor.noFileOpen') }}
                </div>
            </div>
        </ResizablePanel>
    </ResizablePanelGroup>
</template>

<style scoped>
.editor-container {
    width: 100%;
    height: 100%;
}
</style>
