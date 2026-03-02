<script setup lang="ts">
import { lazy, Workspace } from 'modern-monaco';
import { ref, onMounted } from 'vue';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import EditorSidebar from '@/components/Editor/EditorSidebar.vue';
import type { FileTreeNode } from '@/types/FileTree';

// ── Workspace setup ────────────────────────────────────────────────
const workspace = new Workspace({
  initialFiles: {
    "index.html": `<html><body>...</body></html>`,
    "main.js": `console.log("Hello, world!")`,
  },
  entryFile: "main.js",
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
const currentFile = ref<string>('');

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
  currentFile.value = filePath;
  await workspace.openTextDocument(filePath);
  localStorage.setItem('editor-current-file', filePath);
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
    currentFile.value = path;
    await workspace.openTextDocument(path);
    localStorage.setItem('editor-current-file', path);
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
    currentFile.value = filePath;
    await workspace.openTextDocument(filePath);
    localStorage.setItem('editor-current-file', filePath);
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

    if (currentFile.value === oldPath) {
      currentFile.value = newPath;
      await workspace.openTextDocument(newPath);
      localStorage.setItem('editor-current-file', newPath);
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

    if (currentFile.value === path || currentFile.value.startsWith(path + '/')) {
      currentFile.value = '';
      localStorage.removeItem('editor-current-file');
    }
  } catch (error) {
    console.error('Failed to delete:', error);
  }
}

// ── Initialize ─────────────────────────────────────────────────────
lazy({ workspace });

onMounted(async () => {
  await reloadTree();

  const savedFile = localStorage.getItem('editor-current-file');
  if (savedFile && findNode(tree.value, savedFile)) {
    currentFile.value = savedFile;
    await workspace.openTextDocument(savedFile);
    expandParents(savedFile);
  } else {
    const firstFile = findFirstFile(tree.value);
    const fileToOpen = workspace.entryFile ? `/${workspace.entryFile}` : firstFile;
    if (fileToOpen) {
      currentFile.value = fileToOpen;
      await workspace.openTextDocument(fileToOpen);
      localStorage.setItem('editor-current-file', fileToOpen);
    }
  }
});
</script>

<template>
  <ResizablePanelGroup direction="horizontal" class="h-screen">
    <ResizablePanel :default-size="20" :min-size="15" :max-size="40">
      <EditorSidebar
        :tree="tree"
        :current-file="currentFile"
        @file-click="handleFileClick"
        @toggle-folder="handleToggleFolder"
        @ensure-expand="handleEnsureExpand"
        @create-file="handleCreateFile"
        @create-folder="handleCreateFolder"
        @create-file-in-folder="handleCreateFileInFolder"
        @create-folder-in-folder="handleCreateFolderInFolder"
        @rename-item="handleRenameItem"
        @delete-item="handleDeleteItem"
      />
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel :default-size="80">
      <div class="editor-container">
        <monaco-editor></monaco-editor>
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
