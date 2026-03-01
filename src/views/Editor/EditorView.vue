<script setup lang="ts">
import { lazy, Workspace } from 'modern-monaco';
import { ref, onMounted } from 'vue';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import EditorSidebar from '@/components/Editor/EditorSidebar.vue';

// Create a workspace with an initial demo file
const workspace = new Workspace({
  initialFiles: {
    "index.html": `<html><body>...</body></html>`,
    "main.js": `console.log("Hello, world!")`,
  },
  entryFile: "main.js", // This sets the initial file to open on first load
});

// Reactive list of files and folders
const files = ref<string[]>([]);
const folders = ref<string[]>([]);
const currentFile = ref<string>('');

// Function to load all files and folders from the workspace
async function loadFiles() {
  try {
    const entries = await workspace.fs.readDirectory('/');
    // type 1 = file, type 2 = directory
    files.value = entries
      .filter(([, type]) => type === 1)
      .map(([name]) => decodeURIComponent(name));
    folders.value = entries
      .filter(([, type]) => type === 2)
      .map(([name]) => decodeURIComponent(name));
  } catch (error) {
    console.error('Failed to load files:', error);
  }
}

// Handle file click from sidebar
async function handleFileClick(filename: string) {
  currentFile.value = filename;
  await workspace.openTextDocument(filename);
  // Save to localStorage so we remember it on refresh
  localStorage.setItem('editor-current-file', filename);
}

// Handle creating a new file
async function handleCreateFile(filename: string) {
  try {
    // Create the file in the workspace with empty content
    await workspace.fs.writeFile(filename, '');

    // Reload the file list
    await loadFiles();

    // Open the new file
    currentFile.value = filename;
    await workspace.openTextDocument(filename);
    // Save to localStorage
    localStorage.setItem('editor-current-file', filename);

    console.log('Created file:', filename);
  } catch (error) {
    console.error('Failed to create file:', error);
  }
}

// Handle creating a new folder
async function handleCreateFolder(foldername: string) {
  try {
    // Create the folder in the workspace
    await workspace.fs.createDirectory(foldername);

    // Reload the file list
    await loadFiles();

    console.log('Created folder:', foldername);
  } catch (error) {
    console.error('Failed to create folder:', error);
  }
}

// Initialize the editor lazily
lazy({ workspace });

// Load files after workspace is ready
onMounted(async () => {
  await loadFiles();
  console.log('Files in workspace:', files.value);

  // Try to restore the last opened file from localStorage
  const savedFile = localStorage.getItem('editor-current-file');

  // Check if the saved file still exists in the workspace
  if (savedFile && files.value.includes(savedFile)) {
    currentFile.value = savedFile;
    await workspace.openTextDocument(savedFile);
  } else {
    // Fall back to entryFile or first file
    const fileToOpen = workspace.entryFile || files.value[0] || '';
    if (fileToOpen) {
      currentFile.value = fileToOpen;
      await workspace.openTextDocument(fileToOpen);
      localStorage.setItem('editor-current-file', fileToOpen);
    }
  }

  console.log('Opened file:', currentFile.value);
});
</script>

<template>
  <ResizablePanelGroup direction="horizontal" class="h-screen">
    <ResizablePanel :default-size="20" :min-size="15" :max-size="40">
      <EditorSidebar
        :files="files"
        :folders="folders"
        :current-file="currentFile"
        @file-click="handleFileClick"
        @create-file="handleCreateFile"
        @create-folder="handleCreateFolder"
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
